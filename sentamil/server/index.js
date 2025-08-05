const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/excelanalytics';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', err => {
  console.error('MongoDB connection error:', err.message);
  console.error('Make sure MongoDB is running and accessible at', MONGODB_URI);
});
db.once('open', () => {
  console.log('Connected to MongoDB at', MONGODB_URI);
});

// Define a simple schema for Excel data
const ExcelRowSchema = new mongoose.Schema({
  data: { type: Object, required: true },
});
const ExcelRow = mongoose.model('ExcelRow', ExcelRowSchema);

// User schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
});
const User = mongoose.model('User', UserSchema);

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Excel upload and analysis history schema
const UploadSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: String,
  uploadedAt: { type: Date, default: Date.now },
  data: [Object],
  analysis: Object,
});
const Upload = mongoose.model('Upload', UploadSchema);

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Username already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hash });
    await user.save();
    res.json({ message: 'User registered' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id, role: user.role }, 'SECRET_KEY', { expiresIn: '1d' });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Auth middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'SECRET_KEY');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Admin middleware
function admin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}

// Upload Excel file and store data in MongoDB (per user)
app.post('/api/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    // Example: summary for numeric columns
    const summary = {};
    if (jsonData.length > 0) {
      const keys = Object.keys(jsonData[0]);
      keys.forEach(key => {
        if (typeof jsonData[0][key] === 'number') {
          const values = jsonData.map(row => row[key]).filter(v => typeof v === 'number');
          summary[key] = {
            count: values.length,
            sum: values.reduce((a, b) => a + b, 0),
            avg: values.reduce((a, b) => a + b, 0) / (values.length || 1),
          };
        }
      });
    }
    const upload = new Upload({
      user: req.user.userId,
      filename: req.file.originalname,
      data: jsonData,
      analysis: summary,
    });
    await upload.save();
    res.json({ message: 'File uploaded and data stored', rowCount: jsonData.length, analysis: summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// Get user's upload/analysis history
app.get('/api/history', auth, async (req, res) => {
  try {
    const uploads = await Upload.find({ user: req.user.userId }).sort({ uploadedAt: -1 });
    res.json({ uploads });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// Get analytics (summary)
app.get('/api/analytics', async (req, res) => {
  try {
    const rows = await ExcelRow.find({});
    if (!rows.length) return res.json({ summary: null });
    const data = rows.map(r => r.data);
    // Example: summary for numeric columns
    const summary = {};
    const keys = Object.keys(data[0]);
    keys.forEach(key => {
      if (typeof data[0][key] === 'number') {
        const values = data.map(row => row[key]).filter(v => typeof v === 'number');
        summary[key] = {
          count: values.length,
          sum: values.reduce((a, b) => a + b, 0),
          avg: values.reduce((a, b) => a + b, 0) / (values.length || 1),
        };
      }
    });
    res.json({ summary, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Admin: list all users
app.get('/api/admin/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Admin: update user role
app.put('/api/admin/users/:id/role', auth, admin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    await User.findByIdAndUpdate(req.params.id, { role });
    res.json({ message: 'Role updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Admin: delete user
app.delete('/api/admin/users/:id', auth, admin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// AI Insights endpoint (dummy, ready for OpenAI integration)
app.post('/api/ai/insights', auth, async (req, res) => {
  try {
    const { data } = req.body;
    // Here you would call OpenAI or another AI API
    // For now, return a dummy response
    res.json({ insights: 'Smart insights will appear here (AI integration pending).' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get AI insights' });
  }
});

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
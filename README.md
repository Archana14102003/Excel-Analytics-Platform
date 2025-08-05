# TamilDo - Data Analytics Platform

A comprehensive MERN stack application for data analytics, visualization, and insights generation.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tamildo
   ```

2. **Install dependencies for both frontend and backend**
   ```bash
   # Install backend dependencies
   cd server
   npm install
   
   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # In the server directory
   cd server
   cp config.env .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   - **Local MongoDB**: Start your local MongoDB service
   - **MongoDB Atlas**: Use your connection string in `.env`

5. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

6. **Start the frontend application**
   ```bash
   cd client
   npm start
   ```
   The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
tamildo/
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── redux/         # Redux store and slices
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── README.md
├── server/                 # Node.js Backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   ├── uploads/           # File upload directory
│   ├── server.js          # Main server file
│   ├── package.json
│   └── README.md
└── README.md              # This file
```

## 🔧 Configuration

### Backend Environment Variables (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/tamildo

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# Client Configuration
CLIENT_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Security
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Configuration
The frontend automatically connects to the backend via proxy configuration in `package.json`.

## 🎯 Features

### Authentication
- User registration and login
- JWT-based authentication
- Role-based access control (User/Admin)
- Password hashing with bcrypt

### File Upload & Processing
- Support for Excel (.xlsx, .xls), CSV, and JSON files
- Automatic data type detection
- Data quality analysis
- File size validation (10MB limit)

### Data Analytics
- Automated insights generation
- Chart generation (Bar, Line, Pie, Scatter, etc.)
- Data quality recommendations
- Export reports (PDF, Excel, JSON, CSV)

### User Management
- User profiles and preferences
- Upload history and analytics
- Admin dashboard for user management

## 🛠️ Development

### Backend Development
```bash
cd server
npm run dev          # Start with nodemon (auto-restart)
npm start           # Start production server
npm test            # Run tests
```

### Frontend Development
```bash
cd client
npm start           # Start development server
npm run build       # Build for production
npm test            # Run tests
```

### Database
```bash
# Connect to MongoDB shell
mongosh

# Use the database
use tamildo

# View collections
show collections
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### File Upload
- `POST /api/upload` - Upload file
- `GET /api/upload/history` - Get upload history
- `GET /api/upload/:id` - Get single upload
- `DELETE /api/upload/:id` - Delete upload
- `GET /api/upload/:id/download` - Download file

### Data Analysis
- `POST /api/analysis/:uploadId/analyze` - Start analysis
- `POST /api/analysis/:uploadId/chart` - Generate chart
- `GET /api/analysis/history` - Get analysis history
- `GET /api/analysis/:id` - Get single analysis
- `POST /api/analysis/:id/export` - Export report

### User Management (Admin)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats` - Get user statistics

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Input validation with express-validator
- Rate limiting
- CORS configuration
- Security headers with Helmet
- File upload validation

## 📈 Performance

- Compression middleware
- Database indexing
- Efficient file processing
- Pagination for large datasets
- Optimized React components

## 🚀 Deployment

### Backend Deployment
1. Set environment variables for production
2. Use PM2 or similar process manager
3. Set up MongoDB Atlas or production MongoDB
4. Configure reverse proxy (Nginx)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to static hosting (Netlify, Vercel, etc.)
3. Update API endpoints for production

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://your-frontend-domain.com
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **Port Already in Use**
   - Change PORT in `.env`
   - Kill existing processes on the port

3. **File Upload Errors**
   - Check file size limits
   - Verify file types
   - Ensure upload directory exists

4. **CORS Errors**
   - Check CLIENT_URL in backend `.env`
   - Verify proxy configuration in frontend

5. **Build Errors**
   - Clear node_modules and reinstall
   - Check for missing dependencies
   - Verify Node.js version

### Debug Mode
```bash
# Backend debug
cd server
DEBUG=* npm run dev

# Frontend debug
cd client
REACT_APP_DEBUG=true npm start
```

## 📝 Scripts

### Backend Scripts
```bash
npm run dev      # Development with nodemon
npm start        # Production start
npm test         # Run tests
```

### Frontend Scripts
```bash
npm start        # Development server
npm run build    # Production build
npm test         # Run tests
npm run eject    # Eject from Create React App
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Happy Coding! 🎉** 
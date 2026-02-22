# Project Structure

Complete file structure of the Secure Notes Application.

```
secure-notes-app/
│
├── README.md                          # Main documentation
├── SECURITY.md                        # Security architecture details
├── DEPLOYMENT.md                      # Deployment guide
├── API_TESTING.md                     # API testing guide
├── setup.sh                           # Automated setup script
├── package.json                       # Root package.json (for convenience scripts)
├── .gitignore                         # Git ignore rules
│
├── server/                            # Backend application
│   ├── config/                        # Configuration files
│   │   ├── config.js                  # Environment configuration
│   │   └── database.js                # MongoDB connection
│   │
│   ├── controllers/                   # Route controllers (business logic)
│   │   ├── authController.js          # Authentication logic
│   │   └── noteController.js          # Notes CRUD + file operations
│   │
│   ├── middleware/                    # Express middleware
│   │   ├── auth.js                    # JWT authentication middleware
│   │   └── errorHandler.js            # Global error handling
│   │
│   ├── models/                        # Mongoose models (database schemas)
│   │   ├── User.js                    # User schema with password hashing
│   │   └── Note.js                    # Note schema with file metadata
│   │
│   ├── routes/                        # API route definitions
│   │   ├── authRoutes.js              # Auth endpoints
│   │   └── noteRoutes.js              # Note endpoints
│   │
│   ├── utils/                         # Utility functions
│   │   ├── encryption.js              # AES-256 encryption/decryption
│   │   └── fileUpload.js              # Multer configuration
│   │
│   ├── uploads/                       # Encrypted file storage (not in git)
│   │   └── *.encrypted                # Encrypted files
│   │
│   ├── .env                           # Environment variables (not in git)
│   ├── .env.example                   # Environment template
│   ├── .gitignore                     # Git ignore rules
│   ├── package.json                   # Dependencies and scripts
│   └── server.js                      # Application entry point
│
└── client/                            # Frontend application
    ├── public/                        # Static assets
    │   └── vite.svg                   # Vite logo
    │
    ├── src/                           # Source code
    │   ├── components/                # React components
    │   │   ├── Navbar.jsx             # Navigation bar
    │   │   ├── Navbar.css             # Navbar styles
    │   │   ├── NoteCard.jsx           # Note display card
    │   │   ├── NoteCard.css           # Card styles
    │   │   ├── NoteModal.jsx          # Create/Edit note modal
    │   │   ├── NoteModal.css          # Modal styles
    │   │   └── PrivateRoute.jsx       # Protected route wrapper
    │   │
    │   ├── context/                   # React context
    │   │   └── AuthContext.jsx        # Authentication state management
    │   │
    │   ├── pages/                     # Page components
    │   │   ├── Login.jsx              # Login page
    │   │   ├── Register.jsx           # Registration page
    │   │   ├── Auth.css               # Auth pages styles
    │   │   ├── Dashboard.jsx          # Main dashboard
    │   │   └── Dashboard.css          # Dashboard styles
    │   │
    │   ├── utils/                     # Utilities
    │   │   └── api.js                 # Axios configuration with interceptors
    │   │
    │   ├── App.jsx                    # Main app component with routing
    │   ├── main.jsx                   # React entry point
    │   └── index.css                  # Global styles
    │
    ├── index.html                     # HTML template
    ├── vite.config.js                 # Vite configuration
    ├── package.json                   # Dependencies and scripts
    └── .gitignore                     # Git ignore rules
```

## File Descriptions

### Root Level

| File | Purpose |
|------|---------|
| `README.md` | Main documentation with quick start guide |
| `SECURITY.md` | Security architecture and best practices |
| `DEPLOYMENT.md` | Production deployment instructions |
| `API_TESTING.md` | API endpoint testing guide |
| `setup.sh` | Automated setup script for quick start |
| `package.json` | Convenience scripts for development |

### Backend (`server/`)

#### Configuration (`config/`)
- **config.js**: Loads and validates environment variables
- **database.js**: MongoDB connection with error handling

#### Controllers (`controllers/`)
- **authController.js**: 
  - User registration
  - User login
  - Get current user info
- **noteController.js**:
  - Create note with optional file encryption
  - Get all user notes
  - Get single note
  - Update note (with new file support)
  - Delete note (and encrypted file)
  - Download decrypted file
  - Delete file from note

#### Middleware (`middleware/`)
- **auth.js**: 
  - JWT token verification
  - User authentication
  - Token generation
- **errorHandler.js**:
  - Global error handling
  - Mongoose error formatting
  - 404 handler

#### Models (`models/`)
- **User.js**:
  - User schema with validation
  - Password hashing (bcrypt)
  - Password comparison method
- **Note.js**:
  - Note schema with file metadata
  - User reference
  - Timestamps
  - Database indexes

#### Routes (`routes/`)
- **authRoutes.js**: Authentication endpoints
- **noteRoutes.js**: Note CRUD and file operations

#### Utils (`utils/`)
- **encryption.js**:
  - AES-256-CBC encryption
  - File decryption
  - IV generation
  - Key validation
- **fileUpload.js**:
  - Multer configuration
  - File type validation
  - File size limits
  - Error handling

#### Other
- **server.js**: Express app setup, middleware, routes
- **package.json**: Backend dependencies
- **.env**: Environment variables (secrets)

### Frontend (`client/`)

#### Components (`src/components/`)
- **Navbar.jsx**: Navigation with user info and logout
- **NoteCard.jsx**: Individual note display with actions
- **NoteModal.jsx**: Create/edit note form with file upload
- **PrivateRoute.jsx**: Protected route wrapper

#### Context (`src/context/`)
- **AuthContext.jsx**: Global authentication state

#### Pages (`src/pages/`)
- **Login.jsx**: Login form
- **Register.jsx**: Registration form
- **Dashboard.jsx**: Main notes view with grid layout

#### Utils (`src/utils/`)
- **api.js**: Axios instance with interceptors

#### Other
- **App.jsx**: Main component with routing
- **main.jsx**: React DOM rendering
- **index.css**: Global CSS variables and utilities

## Key Design Patterns

### Backend
- **MVC Architecture**: Models, Controllers, Routes separation
- **Middleware Pattern**: Auth, error handling, file upload
- **Repository Pattern**: Mongoose models as data access layer
- **Error-First Callbacks**: Consistent error handling

### Frontend
- **Component-Based**: Reusable React components
- **Context API**: Global state management
- **Protected Routes**: Authentication-based routing
- **Axios Interceptors**: Automatic token injection

## Data Flow

### Authentication Flow
```
User Input → Login/Register
    ↓
AuthController
    ↓
User Model (bcrypt)
    ↓
JWT Generation
    ↓
Token to Client
    ↓
LocalStorage
    ↓
API Requests (with token)
```

### File Upload Flow
```
User Selects File → NoteModal
    ↓
FormData with File
    ↓
Multer Middleware
    ↓
Temporary File Storage
    ↓
Encryption (AES-256)
    ↓
Encrypted File + IV
    ↓
MongoDB (metadata)
    ↓
Delete Original File
```

### File Download Flow
```
User Clicks Download
    ↓
API Request (with auth)
    ↓
Verify Ownership
    ↓
Read Encrypted File
    ↓
Decrypt with IV
    ↓
Send Buffer to Client
    ↓
Browser Download
```

## Technology Stack

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password**: bcrypt
- **File Upload**: Multer
- **Encryption**: Node.js crypto module
- **Validation**: express-validator

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: CSS3 (no framework)

### DevOps
- **Process Manager**: PM2 (production)
- **Reverse Proxy**: Nginx
- **SSL**: Let's Encrypt
- **Version Control**: Git

## Environment Variables

### Required Backend Variables
```env
PORT=5000                              # Server port
NODE_ENV=development                   # Environment mode
MONGODB_URI=mongodb://...              # Database connection
JWT_SECRET=<64-char-hex>               # JWT signing key
JWT_EXPIRE=7d                          # Token expiration
ENCRYPTION_KEY=<64-char-hex>           # File encryption key (32 bytes)
MAX_FILE_SIZE=10485760                 # Max upload size (bytes)
UPLOAD_DIR=uploads                     # File storage directory
```

## Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ AES-256-CBC file encryption
- ✅ Unique IV per file
- ✅ Authorization middleware
- ✅ Input validation
- ✅ File type restrictions
- ✅ File size limits
- ✅ Error sanitization
- ✅ CORS configuration
- ✅ Original file deletion
- ✅ User data isolation

## Development Tools

### Recommended VS Code Extensions
- ESLint
- Prettier
- ES7+ React/Redux/React-Native snippets
- MongoDB for VS Code
- REST Client

### Useful Commands
```bash
# Backend
npm run dev              # Start with nodemon
npm start                # Start production

# Frontend
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Root
npm run install-all      # Install all dependencies
npm run setup            # Run setup script
```

## Contributing Guidelines

1. Follow existing code structure
2. Use meaningful variable names
3. Add comments for complex logic
4. Test all endpoints before committing
5. Update documentation for new features
6. Follow security best practices
7. Use consistent code formatting

---

**Last Updated**: 2024
**Version**: 1.0.0

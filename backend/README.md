# GCET Hack Backend

This is the backend API for the GCET Hack project - a civic engagement platform for citizens to report issues to government authorities.

## Database Schema

The application uses the following main entities:

- **Users**: Citizens and admin users
- **Authorities**: Government departments/authorities  
- **Issues**: Problems/complaints reported by citizens
- **Votes**: Citizens can vote on issues to show support
- **Media**: Images/files attached to issues
- **Notifications**: System notifications for users
- **Awards**: Recognition system for active citizens

## 📁 Project Structure

```
backend/
├── app/                          # Main application package
│   ├── __init__.py              # Package initialization
│   ├── main.py                  # FastAPI app configuration & CORS
│   ├── database.py              # Database connection & session
│   ├── models.py                # SQLAlchemy database models
│   ├── auth.py                  # JWT authentication utilities
│   ├── config.py                # Application configuration
│   ├── util.py                  # Utility functions
│   ├── routers/                 # API route handlers
│   │   ├── auth.py              # Authentication endpoints
│   │   └── chatbot.py           # Chatbot endpoints
│   ├── schemas/                 # Pydantic models for validation
│   │   └── auth_schemas.py      # Authentication request/response models
│   └── services/                # Business logic services
├── migrations/                   # Alembic database migrations
│   ├── env.py                   # Alembic environment configuration
│   ├── script.py.mako           # Migration template
│   └── versions/                # Individual migration files
│       └── 7db30c7f2a85_*.py   # Current migration with UUID tables
├── tests/                       # Test suite
│   ├── test_auth_endpoints.py   # Authentication endpoint tests
│   ├── performance_test.py      # Load testing
│   ├── manual_test.py           # Manual testing scripts
│   └── conftest.py              # Test configuration
├── .env                         # Environment variables (create this)
├── .gitignore                   # Git ignore rules
├── alembic.ini                  # Alembic configuration
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

## 🚀 Quick Setup Guide

**For new developers setting up the project:**

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Create .env file (see configuration below)
# 3. Create PostgreSQL database named 'gcet-hack'

# 4. Apply existing migrations to set up database schema
alembic upgrade head

# 5. Start the server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**✅ That's it! Your API will be running at `http://localhost:8000`**

---

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the backend root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:root@localhost:5432/gcet-hack

# JWT Security
SECRET_KEY=your_super_secret_jwt_key_here_change_in_production
ALGORITHM=HS256

# Google OAuth (Optional - for Google Sign-in)
GOOGLE_CLIENT_ID=your_google_client_id_here

# Application Settings
DEBUG=True
ACCESS_TOKEN_EXPIRE_MINUTES=500
REFRESH_TOKEN_EXPIRE_DAYS=7
```

**Environment Variables Explained:**
- `DATABASE_URL`: PostgreSQL connection string (format: `postgresql://username:password@host:port/database`)
- `SECRET_KEY`: Used for JWT token signing (generate a secure random string for production)
- `GOOGLE_CLIENT_ID`: Required for Google OAuth authentication (get from Google Cloud Console)
- `DEBUG`: Set to `False` in production
- Token expiration settings are configurable via environment

### 3. Setup PostgreSQL Database

1. Install PostgreSQL and pgAdmin
2. Create a database named `gcet-hack`
3. Update the DATABASE_URL in `.env` with your PostgreSQL credentials
4. Default credentials used in development:
   - Username: `postgres`
   - Password: `root`
   - Database: `gcet-hack`
   - Port: `5432`

### 4. Apply Database Migrations

Our project uses **Alembic** for database schema management. All migration files are stored in the `migrations/` folder.

#### **🚀 For New Setup (First Time):**

After creating your database and configuring the `.env` file, run:

```bash
# Apply all existing migrations to set up the database schema
alembic upgrade head
```

This command will:
- ✅ Create all 7 tables (Users, Authorities, Issues, Votes, Media, Notifications, Awards)
- ✅ Set up UUID primary keys for all tables
- ✅ Create proper foreign key relationships
- ✅ Add necessary indexes for performance

**That's it!** Your database will be fully configured and ready to use.

#### **🔄 For Development (Making Schema Changes):**

If you modify the database models in `app/models.py`, generate and apply new migrations:

```bash
# Generate a new migration after model changes
alembic revision --autogenerate -m "Description of changes"

# Apply the new migration
alembic upgrade head
```

#### **📋 Useful Migration Commands:**

```bash
# View migration history
alembic history

# Check current migration version
alembic current

# Downgrade to previous migration (if needed)
alembic downgrade -1

# Upgrade to specific migration
alembic upgrade <revision_id>
```

#### **🔧 Troubleshooting Migrations:**

**If `alembic upgrade head` fails:**

```bash
# Check if database connection is working
python -c "from app.database import engine; print('Database connected!' if engine else 'Connection failed')"

# Verify migration files exist
ls migrations/versions/

# Check current database state
alembic current

# If database is completely empty, run:
alembic upgrade head
```

**Common Issues:**
- ❌ **"Can't locate revision"** → Database and migration files are out of sync
- ❌ **"Connection refused"** → Check PostgreSQL is running and `.env` credentials
- ❌ **"Database doesn't exist"** → Create the `gcet-hack` database in PostgreSQL first

#### **Migration Folder Structure:**
```
migrations/
├── env.py                    # Alembic environment configuration
├── script.py.mako           # Migration template
├── alembic.ini              # Alembic configuration (in project root)
└── versions/                # All migration files
    └── 7db30c7f2a85_create_all_tables_with_uuid.py
```

#### **Current Migration:**
- **UUID Primary Keys**: All tables use UUID instead of auto-incrementing integers
- **Complete Schema**: Users, Authorities, Issues, Votes, Media, Notifications, Awards
- **Relationships**: Proper foreign key constraints and relationships
- **Indexes**: Email uniqueness and performance indexes

#### **Migration Notes:**
- ✅ Database uses **UUID primary keys** for better security and distributed systems
- ✅ All relationships properly configured with foreign keys
- ✅ Created_at/updated_at timestamps with automatic updates
- ✅ Proper indexing on frequently queried fields (email, user_id, etc.)

**Important**: Always run `alembic upgrade head` after pulling latest code to ensure your database schema is up to date.

### 5. Run the Application

```bash
# Using uvicorn directly
uvicorn app.main:app --reload

# Or using the main.py file
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:

- **Interactive API docs**: `http://localhost:8000/docs`
- **Alternative docs**: `http://localhost:8000/redoc`

### 🔐 Authentication API

All authentication endpoints are prefixed with `/api/auth`. The API uses JWT tokens for authentication.

#### **Base URL**
```
http://localhost:8000/api
```

#### **1. User Registration**
```http
POST /api/auth/signup
```

**Description:** Create a new user account with citizen role (role=0). Returns JWT tokens for immediate login.

**Request Body:**
```json
{
  "name": "string",
  "email": "user@example.com", 
  "password": "string",
  "phone": "string",
  "district": "string"
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "district": "Downtown",
    "role": 0,
    "is_google": false,
    "created_at": "2025-08-27T12:30:45.123456"
  }
}
```

#### **2. User Login**
```http
POST /api/auth/login
```

**Description:** Authenticate existing user with email/password. Returns access and refresh tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "string",
  "role": 0
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "district": "Downtown",
    "role": 0,
    "is_google": false,
    "created_at": "2025-08-27T12:30:45.123456"
  }
}
```

#### **3. Google OAuth Authentication**
```http
POST /api/auth/google
```

**Description:** Authenticate or create user via Google ID token. Requires `GOOGLE_CLIENT_ID` in environment variables.

**Request Body:**
```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjdkYzAyN..."
}
```

**Response (200 OK):** Same as login response with Google user data.

#### **4. Get Current User**
```http
GET /api/auth/me
```

**Description:** Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "district": "Downtown",
  "role": 0,
  "is_google": false,
  "created_at": "2025-08-27T12:30:45.123456"
}
```

#### **5. Refresh Access Token**
```http
POST /api/auth/refresh-token
```

**Description:** Generate new access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### **6. User Logout**
```http
POST /api/auth/logout
```

**Description:** Logout user (stateless - client should delete tokens).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```

#### **🔑 Token Information**

- **Access Token Lifespan**: 500 minutes (8+ hours)
- **Refresh Token Lifespan**: 7 days
- **Token Usage**: Include in `Authorization` header as `Bearer <token>`

#### **👥 User Roles**
- `0`: Citizen (default)
- `1`: Authority  
- `2`: Admin

#### **🛡️ Security Features**
- ✅ JWT Authentication with HS256 algorithm
- ✅ Password hashing with bcrypt
- ✅ Google OAuth integration
- ✅ Role-based access control
- ✅ Token refresh mechanism
- ✅ Input validation with Pydantic
- ✅ UUID primary keys

#### **📱 Frontend Integration Example**

```javascript
// Register and login
const signupResponse = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securepass123',
    phone: '1234567890',
    district: 'Downtown'
  })
});

const { access_token, refresh_token } = await signupResponse.json();

// Store tokens securely
localStorage.setItem('access_token', access_token);
localStorage.setItem('refresh_token', refresh_token);

// Use token for authenticated requests
const userResponse = await fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
```

### 🤖 Other Available Endpoints

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app configuration
│   ├── config.py            # Application settings
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy models
│   ├── auth.py              # Authentication utilities
│   ├── util.py              # Utility functions (AI chatbot)
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── chatbot.py       # AI chatbot endpoints
│   │   └── auth.py          # Authentication endpoints
│   ├── schemas/
│   │   └── __init__.py      # Pydantic schemas
│   └── services/
│       └── __init__.py      # Business logic services
├── migrations/              # Alembic migration files
├── .env                     # Environment variables
├── alembic.ini             # Alembic configuration
├── main.py                 # Application entry point
└── requirements.txt        # Python dependencies
```

## Available Endpoints

### Chatbot
- `POST /api/chatbot/` - Chat with AI assistant

### Health Check
- `GET /` - API status
- `GET /health` - Health check

## Development

To add new features:

1. Create new models in `app/models.py`
2. Create corresponding schemas in `app/schemas/`
3. Add business logic in `app/services/`
4. Create API routes in `app/routers/`
5. Include new routers in `app/main.py`
6. Generate and run migrations

## Technologies Used

- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **Alembic**: Database migration tool
- **PostgreSQL**: Database
- **Pydantic**: Data validation
- **G4F**: AI chatbot integration

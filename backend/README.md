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
│   ├── models.py                # SQLAlchemy database models (7 tables with UUID)
│   ├── auth.py                  # JWT authentication utilities
│   ├── config.py                # Application configuration
│   ├── util.py                  # Utility functions
│   ├── routers/                 # API route handlers
│   │   ├── __init__.py          # Router package initialization
│   │   ├── auth.py              # Authentication endpoints (6 endpoints)
│   │   ├── users.py             # User management endpoints (7 endpoints)
│   │   ├── issues.py            # Issues management endpoints (5 endpoints)
│   │   ├── authorities.py       # Authorities management endpoints (2 endpoints)
│   │   └── chatbot.py           # Chatbot endpoints
│   ├── schemas/                 # Pydantic models for validation
│   │   ├── __init__.py          # Schema package initialization
│   │   ├── auth_schemas.py      # Authentication request/response models
│   │   ├── user_schemas.py      # User management request/response models
│   │   ├── issue_schemas.py     # Issues management request/response models
│   │   └── authority_schemas.py # Authorities management request/response models
│   └── services/                # Business logic services
├── migrations/                   # Alembic database migrations
│   ├── env.py                   # Alembic environment configuration
│   ├── script.py.mako           # Migration template
│   └── versions/                # Individual migration files
│       └── 7db30c7f2a85_*.py   # Current migration with UUID tables
├── tests/                       # Comprehensive test suite
│   ├── test_auth_endpoints.py   # Authentication endpoint tests (8 tests)
│   ├── test_user_endpoints.py   # User management endpoint tests (4 tests)
│   ├── test_issue_endpoints.py  # Issues & media management endpoint tests (12 tests)
│   ├── test_authority_endpoints.py # Authorities management endpoint tests (3 tests)
│   ├── run_all_tests.py         # Test runner script
│   ├── performance_test.py      # Load testing
│   ├── manual_test.py           # Manual testing scripts
│   ├── quick_test.py            # Quick validation tests
│   ├── conftest.py              # Test configuration
│   └── README.md                # Test documentation
├── uploads/                     # Media file storage (organized by date)
│   └── YYYY/MM/issues/          # Issue attachments by year/month
├── venv/                        # Virtual environment (created by user)
├── .env                         # Environment variables (create this)
├── .gitignore                   # Git ignore rules
├── alembic.ini                  # Alembic configuration
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

## 🚀 Quick Setup Guide

**For new developers setting up the project:**

```bash
# 1. Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1    # Windows PowerShell
# source venv/bin/activate     # Linux/Mac

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create .env file (see configuration below)
# 4. Create PostgreSQL database named 'gcet-hack'

# 5. Apply existing migrations to set up database schema
alembic upgrade head

# 6. Start the server
uvicorn app.main:app --reload
```

**✅ That's it! Your API will be running at `http://localhost:8000`**

## 🧪 Running Tests

**Prerequisites:** Server must be running on `http://localhost:8000`

```bash
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run all tests (recommended)
python tests/run_all_tests.py

# Or run individual test suites
python tests/test_auth_endpoints.py    # 8/8 authentication tests
python tests/test_user_endpoints.py   # 4/4 user management tests
python tests/test_issue_endpoints.py  # 5/5 issues management tests
python tests/test_authority_endpoints.py # 3/3 authorities management tests
```

**Current Test Status: ✅ 27/27 tests passing (100%)**

---

## Setup Instructions

### 1. Install Dependencies

**Using Virtual Environment (Recommended):**

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1    # Windows PowerShell
# source venv/bin/activate     # Linux/Mac

# Install dependencies
pip install -r requirements.txt
```

**Or install globally:**
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
# Make sure virtual environment is activated
.\venv\Scripts\Activate.ps1

# Using uvicorn (recommended)
uvicorn app.main:app --reload

# Or using the main.py file
python main.py
```

The API will be available at `http://localhost:8000`

## 📖 API Documentation

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

**Description:** Create a new user account with citizen role (role=0). User must login separately to get tokens.

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
  "message": "User created successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "district": "Downtown",
    "role": 0,
    "is_google": false,
    "google_id": null,
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
// 1. Register user (no tokens returned)
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

const { message, user } = await signupResponse.json();
console.log(message); // "User created successfully"

// 2. Login to get tokens
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'securepass123',
    role: 0
  })
});

const { access_token, refresh_token } = await loginResponse.json();

// 3. Store tokens securely
localStorage.setItem('access_token', access_token);
localStorage.setItem('refresh_token', refresh_token);

// 4. Use token for authenticated requests
const userResponse = await fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
```

### 👤 User Management API

#### **1. Get Current User Profile**
```http
GET /api/user/me
```

**Description:** Get logged-in user's profile information.

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

#### **2. Update Current User Profile**
```http
PATCH /api/user/me
```

**Description:** Update logged-in user's profile (cannot update role).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "9876543210",
  "district": "New District"
}
```

**Response (200 OK):** Updated user object

#### **3. Delete Current User Account**
```http
DELETE /api/user/me
```

**Description:** Delete logged-in user's account permanently.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204 No Content)**

#### **4. Get User by ID**
```http
GET /api/user/{user_id}
```

**Description:** Get any user's profile by their UUID.

**Response (200 OK):** User object

#### **5. Update User by ID (Admin Only)**
```http
PATCH /api/user/{user_id}
```

**Description:** Update any user's profile including role (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "9876543210",
  "district": "New District",
  "role": 1
}
```

**Response (200 OK):** Updated user object

#### **6. Delete User by ID (Admin Only)**
```http
DELETE /api/user/{user_id}
```

**Description:** Delete any user account (admin only, cannot delete own account).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204 No Content)**

#### **7. Get All Users (Admin Only)**
```http
GET /api/user/all
```

**Description:** Get paginated list of all users with filtering options (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `role` (0-2): Filter by user role
- `district`: Filter by district
- `search`: Search by name or email
- `created_after`: Filter by creation date
- `created_before`: Filter by creation date
- `limit` (1-100): Results per page (default: 10)
- `page`: Page number (default: 1)
- `sort_by`: Sort field (default: created_at)
- `sort_order`: asc/desc (default: desc)

**Response (200 OK):**
```json
{
  "users": [{"user_object": "..."}],
  "total": 150,
  "page": 1,
  "limit": 10,
  "total_pages": 15
}
```

### 📋 Issues Management API

All issues endpoints are prefixed with `/api/issues`. Citizens can report problems, while authorities and admins can manage them.

#### **1. Create Issue**
```http
POST /api/issues/
```

**Description:** Create a new issue/complaint. Any authenticated user can create issues.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "authority_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Pothole on Main Street",
  "description": "Large pothole causing damage to vehicles",
  "location": "Main Street near City Hall",
  "category": "Road Infrastructure",
  "priority": 2
}
```

**Response (201 Created):**
```json
{
  "message": "Issue created successfully",
  "issue": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-uuid",
    "authority_id": "authority-uuid",
    "title": "Pothole on Main Street",
    "description": "Large pothole causing damage to vehicles",
    "status": 0,
    "location": "Main Street near City Hall",
    "created_at": "2025-08-27T12:30:45.123456",
    "updated_at": "2025-08-27T12:30:45.123456",
    "priority": 2,
    "category": "Road Infrastructure",
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "district": "Downtown"
    },
    "authority": {
      "id": "authority-uuid",
      "name": "Public Works Department",
      "district": "Downtown",
      "contact_email": "works@city.gov",
      "contact_phone": "555-0123",
      "category": "Infrastructure"
    },
    "votes": [],
    "vote_count": 0
  }
}
```

#### **2. Get All Issues**
```http
GET /api/issues/
```

**Description:** Get paginated list of all issues with comprehensive filtering options.

**Query Parameters:**
- `district`: Filter by authority district
- `category`: Filter by issue category
- `status` (0-3): Filter by status (0=Open, 1=In Progress, 2=Resolved, 3=Closed)
- `search`: Search in title and description
- `created_after`: Issues created after date (ISO format)
- `created_before`: Issues created before date (ISO format)
- `limit` (1-100): Results per page (default: 10)
- `page`: Page number (default: 1)
- `sort_by`: Sort field (default: created_at)
- `sort_order`: asc/desc (default: desc)

**Example Request:**
```http
GET /api/issues/?district=Downtown&status=0&limit=20&page=1
```

**Response (200 OK):**
```json
{
  "issues": [
    {
      "id": "issue-uuid",
      "title": "Pothole on Main Street",
      "description": "Large pothole causing damage",
      "status": 0,
      "location": "Main Street",
      "priority": 2,
      "category": "Road Infrastructure",
      "created_at": "2025-08-27T12:30:45.123456",
      "user": {"name": "John Doe", "district": "Downtown"},
      "authority": {"name": "Public Works", "district": "Downtown"},
      "vote_count": 5
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "total_pages": 3
}
```

#### **3. Get Issue by ID**
```http
GET /api/issues/{issue_id}
```

**Description:** Get detailed information about a specific issue by UUID.

**Response (200 OK):** Complete issue object with user, authority, and votes

#### **4. Update Issue**
```http
PATCH /api/issues/{issue_id}
```

**Description:** Update issue details. Permissions: Admin (any issue), Authority (issues in their department), Issue creator (own issues).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body (all fields optional):**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": 1,
  "location": "Updated location",
  "category": "Updated category",
  "priority": 3
}
```

**Response (200 OK):** Updated issue object

#### **5. Delete Issue**
```http
DELETE /api/issues/{issue_id}
```

**Description:** Delete an issue. Permissions: Admin or issue creator only.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204 No Content)**

#### **6. Add Media to Issue**
```http
POST /api/issues/media/{issue_id}
```

**Description:** Upload one or more files to an existing issue. Supports images (jpg, jpeg, png, gif), videos (mp4, mov), and documents (pdf). Maximum file size: 10MB per file.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Permissions:** Issue creator, assigned authority, or admin.

**Request Body (Form Data):**
```
files: File[] (one or more files)
```

**Supported File Types:**
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`
- Videos: `.mp4`, `.mov`
- Documents: `.pdf`

**Response (201 Created):**
```json
{
  "message": "Added 2 media files to issue",
  "uploaded_files": ["pothole_photo.jpg", "damage_report.pdf"]
}
```

#### **7. Get Issue Media**
```http
GET /api/issues/media/{issue_id}
```

**Description:** Get list of all media files attached to a specific issue.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "issue_id": "issue-uuid",
    "path": "uploads/2025/08/issues/filename.jpg",
    "filename": "pothole_photo.jpg",
    "file_size": 2048576,
    "file_type": "image/jpeg",
    "created_at": "2025-08-27T12:30:45.123456"
  },
  {
    "id": "another-uuid",
    "issue_id": "issue-uuid", 
    "path": "uploads/2025/08/issues/filename.pdf",
    "filename": "damage_report.pdf",
    "file_size": 1024000,
    "file_type": "application/pdf",
    "created_at": "2025-08-27T12:35:22.789012"
  }
]
```

#### **8. Delete Media File**
```http
DELETE /api/issues/media/{media_id}
```

**Description:** Delete a specific media file from an issue. File is removed from both database and disk storage.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** Issue creator, assigned authority, or admin.

**Response (204 No Content)**

#### **9. Download/Serve Media File**
```http
GET /api/issues/serve/{media_id}
```

**Description:** Download or view a media file. Returns the actual file content with appropriate headers.

**Response (200 OK):**
- Content-Type: `application/octet-stream`
- Content-Disposition: `attachment; filename="original_filename.ext"`
- File content as binary data

**Usage Example:**
```html
<!-- Direct link to view/download file -->
<a href="/api/issues/serve/550e8400-e29b-41d4-a716-446655440000" 
   download="pothole_photo.jpg">Download Image</a>

<!-- Image display -->
<img src="/api/issues/serve/550e8400-e29b-41d4-a716-446655440000" 
     alt="Issue Photo" />
```

#### **🌐 Frontend Integration Example - Media Upload**

```javascript
// Upload multiple files to an issue
async function uploadMediaToIssue(issueId, files, accessToken) {
  const formData = new FormData();
  
  // Add multiple files to form data
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }
  
  const response = await fetch(`/api/issues/media/${issueId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: formData
  });
  
  const result = await response.json();
  console.log(result.message); // "Added 2 media files to issue"
  return result.uploaded_files; // ["photo.jpg", "document.pdf"]
}

// Get all media for an issue
async function getIssueMedia(issueId, accessToken) {
  const response = await fetch(`/api/issues/media/${issueId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  const mediaFiles = await response.json();
  return mediaFiles; // Array of media objects with download URLs
}

// Create downloadable links for media files
function createMediaLinks(mediaFiles) {
  return mediaFiles.map(media => ({
    id: media.id,
    filename: media.filename,
    downloadUrl: `/api/issues/serve/${media.id}`,
    size: media.file_size,
    type: media.file_type
  }));
}

// HTML file input for multiple files
// <input type="file" id="mediaFiles" multiple 
//        accept=".jpg,.jpeg,.png,.gif,.mp4,.mov,.pdf">
```

#### **📁 Media Storage Details**
- **Storage Path**: `uploads/YYYY/MM/issues/`
- **File Naming**: UUID-based filenames to prevent conflicts
- **Metadata**: Original filename, size, and type stored in database
- **Security**: Access controlled by issue permissions
- **Organization**: Files organized by upload date for better management

#### **📊 Issue Status Codes**
- `0`: Open (newly created)
- `1`: In Progress (being worked on)
- `2`: Resolved (work completed)
- `3`: Closed (final state)

#### **🎯 Priority Levels**
- `1`: Low priority
- `2`: Medium priority  
- `3`: High priority
- `4`: Critical/Urgent

### 🏛️ Authorities Management API

All authorities endpoints are prefixed with `/api/authorities`. Manage government departments and agencies.

#### **1. Get Authority by ID**
```http
GET /api/authorities/{authority_id}
```

**Description:** Get detailed information about a specific authority by UUID.

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-uuid",
  "name": "Public Works Department",
  "district": "Downtown",
  "contact_email": "works@city.gov",
  "contact_phone": "555-0123",
  "address": "123 City Hall Plaza",
  "category": "Infrastructure",
  "description": "Responsible for road maintenance and public infrastructure",
  "created_at": "2025-08-27T12:30:45.123456",
  "updated_at": "2025-08-27T12:30:45.123456",
  "user": {
    "id": "user-uuid",
    "name": "Department Head",
    "email": "head@works.gov",
    "phone": "555-0124",
    "district": "Downtown",
    "role": 1
  }
}
```

#### **2. Update Authority**
```http
PATCH /api/authorities/{authority_id}
```

**Description:** Update authority information. Permissions: Admin or the authority user themselves.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body (all fields optional):**
```json
{
  "name": "Updated Department Name",
  "contact_email": "new@email.gov",
  "contact_phone": "555-9999",
  "address": "New Address",
  "category": "Updated Category",
  "description": "Updated description of services"
}
```

**Response (200 OK):** Updated authority object

#### **🏛️ Authority Categories**
Common authority categories include:
- Infrastructure
- Public Safety
- Health Services
- Environmental
- Transportation
- Utilities
- Education
- Parks & Recreation

### 🤖 Other Available Endpoints

#### **Chatbot API**
```http
POST /api/chatbot/
```

**Description:** Chat with AI assistant for civic engagement guidance.

**Request Body:**
```json
{
  "message": "How do I report a pothole in my area?"
}
```

#### **Health Check**
```http
GET /
GET /health
```

**Description:** API status and health check endpoints.

## 🧪 Testing

### **Test Suite Overview**
The project includes a comprehensive test suite covering all API endpoints:

- **📁 Location**: `backend/tests/`
- **🧪 Test Files**: 4 main test scripts
- **📊 Coverage**: 27/27 tests passing (100%)
- **🚀 Easy Running**: One-command test execution

### **Test Scripts**

#### **1. Authentication Tests (`test_auth_endpoints.py`)**
- ✅ **8 Tests**: Complete auth flow validation
- 🔐 **Endpoints**: signup, login, me, refresh-token, logout, google, error cases
- 🎯 **Focus**: JWT tokens, user registration, authentication flow

#### **2. User Management Tests (`test_user_endpoints.py`)**
- ✅ **4 Tests**: User CRUD operations
- 👤 **Endpoints**: profile management, user lookup, admin controls
- 🎯 **Focus**: Role-based access, profile updates, admin permissions

#### **3. Issues Management Tests (`test_issue_endpoints.py`)**
- ✅ **12 Tests**: Complete issues and media CRUD operations
- 📋 **Endpoints**: create, read, update, delete, list with filtering, media upload/download/delete
- 🎯 **Focus**: Issue reporting, status management, media attachments, role-based permissions

#### **4. Authorities Management Tests (`test_authority_endpoints.py`)**
- ✅ **3 Tests**: Authority management operations
- 🏛️ **Endpoints**: get by ID, update authority info, access control
- 🎯 **Focus**: Authority data management, permission validation

#### **5. Test Runner (`run_all_tests.py`)**
- 🎬 **Runs**: All test suites in sequence
- 📊 **Reports**: Comprehensive test results
- ⚡ **One Command**: Complete test execution

### **Running Tests**

**Prerequisites:**
1. Server running on `http://localhost:8000`
2. Virtual environment activated
3. Database migrations applied

```bash
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run all tests (recommended)
python tests/run_all_tests.py

# Run specific test suites
python tests/test_auth_endpoints.py
python tests/test_user_endpoints.py
python tests/test_issue_endpoints.py
python tests/test_authority_endpoints.py
```

### **Test Features**
- ✅ **Smart Test Data**: Unique timestamps prevent conflicts
- ✅ **Proper Auth Flow**: Realistic signup → login → test sequence
- ✅ **Error Testing**: Invalid credentials, unauthorized access
- ✅ **Admin Testing**: Role-based access control validation
- ✅ **Clean Reports**: Clear pass/fail status with details

## 🏗️ Development Guide

## 🏗️ Development Guide

### **Adding New Features**

1. **Database Models**: Add new tables in `app/models.py`
2. **Schemas**: Create Pydantic models in `app/schemas/`
3. **Business Logic**: Add services in `app/services/`
4. **API Routes**: Create endpoints in `app/routers/`
5. **Include Router**: Add to `app/main.py`
6. **Database Migration**: Generate and apply with Alembic
7. **Testing**: Add tests in `tests/` directory

### **File Organization**

- **`app/models.py`**: SQLAlchemy database models (7 tables with UUID primary keys)
- **`app/routers/auth.py`**: 6 authentication endpoints with JWT
- **`app/routers/users.py`**: 7 user management endpoints with role-based access
- **`app/routers/issues.py`**: 9 issues and media management endpoints with CRUD operations and file upload
- **`app/routers/authorities.py`**: 2 authorities management endpoints with access control
- **`app/schemas/auth_schemas.py`**: Authentication request/response models
- **`app/schemas/user_schemas.py`**: User management request/response models
- **`app/schemas/issue_schemas.py`**: Issues management request/response models
- **`app/schemas/authority_schemas.py`**: Authorities management request/response models
- **`tests/`**: Comprehensive test suite with 100% pass rate

### **Best Practices**
- ✅ Use virtual environment for development
- ✅ Run tests before committing changes
- ✅ Generate migrations for model changes
- ✅ Follow existing code patterns and naming conventions
- ✅ Update documentation when adding new endpoints

## 🛠️ Technologies Used

- **FastAPI**: Modern Python web framework with automatic OpenAPI docs
- **SQLAlchemy**: SQL toolkit and ORM with UUID support
- **Alembic**: Database migration tool with version control
- **PostgreSQL**: Production-ready relational database
- **Pydantic**: Data validation and serialization
- **JWT**: Secure token-based authentication
- **bcrypt**: Password hashing for security
- **httpx**: Modern HTTP client for testing
- **G4F**: AI chatbot integration

## 📈 Production Deployment

For production deployment:

1. **Environment Variables**: Update `.env` with production values
2. **Database**: Use managed PostgreSQL service
3. **Security**: Generate secure `SECRET_KEY`
4. **SSL**: Enable HTTPS with proper certificates
5. **Monitoring**: Add logging and health checks
6. **Docker**: Consider containerization for easier deployment

## 🔧 Troubleshooting

### **Common Issues**

**Database Connection Error:**
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env
# Ensure database 'gcet-hack' exists
```

**Migration Issues:**
```bash
# Check current migration status
alembic current

# Apply all migrations
alembic upgrade head
```

**Test Failures:**
```bash
# Ensure server is running on localhost:8000
# Check virtual environment is activated
# Verify database is properly set up
```

**Module Import Errors:**
```bash
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r requirements.txt
```

## 🎯 Project Status

✅ **Authentication System**: Complete with 6 endpoints, JWT tokens, Google OAuth  
✅ **User Management**: Full CRUD with role-based access control  
✅ **Issues Management**: Complete CRUD system with 9 endpoints, filtering, pagination, and media upload  
✅ **Authorities Management**: Authority info management with 2 endpoints and access control  
✅ **Database**: PostgreSQL with UUID primary keys and proper relationships  
✅ **Testing**: 27/27 tests passing with comprehensive coverage  
✅ **Documentation**: Complete API reference with examples  
✅ **Migrations**: Production-ready database schema management  

**Ready for frontend integration and deployment! 🚀**

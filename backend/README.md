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

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file with:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/gcet-hack
SECRET_KEY=your_secret_key_here
DEBUG=True
```

### 3. Setup PostgreSQL Database

1. Install PostgreSQL and pgAdmin
2. Create a database named `gcet-hack`
3. Update the DATABASE_URL in `.env` with your PostgreSQL credentials

### 4. Run Database Migrations

```bash
# Create initial migration
alembic revision --autogenerate -m "Create initial tables"

# Apply migrations
alembic upgrade head
```

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

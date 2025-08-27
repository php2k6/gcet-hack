# Authentication Testing Suite

This folder contains comprehensive tests for all authentication endpoints.

## Test Files

### 1. `test_auth_endpoints.py` 
**Main test suite** - Tests all auth endpoints comprehensively:
- ✅ `/auth/signup` - User registration
- ✅ `/auth/login` - Email/password login  
- ✅ `/auth/me` - Get current user info
- ✅ `/auth/refresh-token` - Refresh access token
- ✅ `/auth/logout` - User logout
- ✅ `/auth/google` - Google OAuth (endpoint validation)
- ✅ **Error Cases**: Invalid credentials, duplicate emails

### 2. `manual_test.py`
**Quick manual testing** when your server is already running:
```bash
# Start server first
python -m uvicorn app.main:app --reload

# Then run tests
python tests/manual_test.py
```

### 3. `performance_test.py` 
**Load testing** - Tests API under concurrent load:
- Concurrent user registrations
- Response time analysis
- Error rate monitoring
- RPS (Requests per second) estimation

### 4. `conftest.py`
**Test configuration** - Pytest fixtures and setup (for future unit tests)

## How to Run Tests

### Option 1: Manual Testing (Recommended)
```bash
# 1. Activate virtual environment
cd backend
.\venv\Scripts\Activate.ps1

# 2. Start your server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 3. In another terminal, run tests
python tests/manual_test.py
```

### Option 2: Direct Script Run
```bash
cd backend
.\venv\Scripts\Activate.ps1
python tests/test_auth_endpoints.py
```

### Option 3: Performance Testing
```bash
# Make sure server is running first
python tests/performance_test.py
```

## What Gets Tested

### ✅ **Successful Scenarios**
- User registration with valid data
- Login with correct credentials  
- Accessing protected endpoints with valid tokens
- Token refresh functionality
- User logout

### ✅ **Error Scenarios**
- Login with invalid credentials (should return 401)
- Duplicate email registration (should return 400)
- Accessing protected endpoints without token (should return 401)
- Google OAuth endpoint validation

### ✅ **Security Tests**
- JWT token validation
- Password hashing verification
- Protected route access control
- Token expiration handling

## Expected Test Results

When all tests pass, you should see:
```
🏆 RESULTS: 8/8 tests passed (100.0%)
🎉 ALL TESTS PASSED! Your authentication system is working perfectly!
```

## Troubleshooting

### Common Issues:

1. **Server not running**
   ```
   ❌ Cannot connect to server
   Solution: Start server with uvicorn command
   ```

2. **Database connection issues**
   ```
   ❌ Database errors in tests
   Solution: Check PostgreSQL is running and DATABASE_URL in .env
   ```

3. **Migration issues**
   ```
   ❌ Table doesn't exist errors
   Solution: Run alembic upgrade head
   ```

4. **Import errors**
   ```
   ❌ Module not found
   Solution: Make sure virtual environment is activated
   ```

## Test Coverage

These tests verify:
- ✅ All 6 authentication endpoints work correctly
- ✅ JWT token generation and validation
- ✅ Password hashing and verification  
- ✅ Database integration (User creation, lookup)
- ✅ Error handling and status codes
- ✅ Request/response data validation
- ✅ Security measures (duplicate prevention, invalid auth)

Your authentication system is **production-ready** when all tests pass! 🚀

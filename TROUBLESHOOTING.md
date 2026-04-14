# Troubleshooting Guide

## Current Issues Fixed

### 1. ✅ Fixed dotenv.config() path
The `.env` file is in the `server/` directory, so we need to specify the path:
```javascript
dotenv.config({ path: __dirname + '/.env' });
```

### 2. ✅ Improved Error Handling
Updated `AuthContext.js` to better handle validation errors from the backend.

## Common Issues and Solutions

### Issue: 400 Bad Request / 500 Internal Server Error

**Possible Causes:**
1. **JWT_SECRET not loaded** - Fixed by updating dotenv.config path
2. **MongoDB not connected** - Check if MongoDB is running
3. **Validation errors** - Check browser console for specific error messages

**Solutions:**

1. **Restart the server** to apply dotenv.config changes:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

2. **Check MongoDB connection:**
   - If using local MongoDB: Ensure `mongod` is running
   - If using MongoDB Atlas: Check connection string in `.env`
   - The server will show: `✅ MongoDB connected successfully` if connected

3. **Check server logs** for specific error messages:
   - Look at the terminal where `npm run dev` is running
   - Check for error messages like:
     - "JWT_SECRET is not defined"
     - "MongoDB connection error"
     - "Registration error" or "Login error"

### Issue: Validation Errors (400 Bad Request)

The backend uses `express-validator` which returns errors in this format:
```json
{
  "errors": [
    {
      "msg": "Username must be at least 3 characters",
      "param": "username"
    }
  ]
}
```

The frontend now handles both formats:
- `error.response.data.message` (for simple errors)
- `error.response.data.errors[0].msg` (for validation errors)

### Issue: 500 Internal Server Error

This usually means:
1. **JWT_SECRET is undefined** - Check `.env` file exists and has JWT_SECRET
2. **MongoDB connection failed** - Check MongoDB is running
3. **Database operation failed** - Check server logs

## Testing Steps

1. **Verify .env file exists:**
   ```bash
   Get-Content server\.env
   ```
   Should show:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/asd_tutor
   JWT_SECRET=asd_tutor_jwt_secret_key_2024_change_in_production
   NODE_ENV=development
   ```

2. **Check server is reading .env:**
   - Restart server and check terminal
   - Should NOT see "JWT_SECRET is undefined" errors

3. **Test API directly:**
   ```bash
   # Health check
   curl http://localhost:5000/api/health
   
   # Or in browser:
   http://localhost:5000/api/health
   ```

4. **Check MongoDB:**
   - If local: `mongod` should be running
   - Server logs should show: `✅ MongoDB connected successfully`

## Next Steps

1. **Restart the development server:**
   - Stop current server (Ctrl+C in terminal)
   - Run: `npm run dev`

2. **Try registration again:**
   - Fill in all required fields
   - Username: at least 3 characters
   - Email: valid email format
   - Password: at least 6 characters

3. **Check browser console:**
   - Open Developer Tools (F12)
   - Check Network tab for API responses
   - Check Console for error messages

## If Issues Persist

1. **Check server terminal** for detailed error messages
2. **Check browser console** for frontend errors
3. **Verify MongoDB is running** and accessible
4. **Verify .env file** is in correct location (`server/.env`)


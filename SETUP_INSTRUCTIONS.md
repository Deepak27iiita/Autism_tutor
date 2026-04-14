# Setup Instructions

## ✅ Environment File Created

The `.env` file has been created in the `server/` directory with the following configuration:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/asd_tutor
JWT_SECRET=asd_tutor_jwt_secret_key_2024_change_in_production
NODE_ENV=development
```

## 📦 Dependencies Installed

- ✅ Root dependencies installed
- ✅ Client dependencies installed

## 🚀 Project Status

The project is now running! You should see:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

## ⚠️ Important: MongoDB Setup

**The backend requires MongoDB to be running!**

### Option 1: Local MongoDB
1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   ```bash
   # Windows (if installed as service, it starts automatically)
   # Or run manually:
   mongod
   ```

### Option 2: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get connection string
5. Update `server/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/asd_tutor
   ```

### Option 3: Use Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 🎯 Next Steps

1. **Ensure MongoDB is running** (see above)

2. **Seed the database** (optional - adds sample words):
   ```bash
   cd server
   node seed.js
   ```

3. **Access the application**:
   - Open browser: http://localhost:3000
   - Register a new account
   - Start learning!

## 🔧 If Backend Shows MongoDB Connection Error

The backend will still start, but you'll see:
```
❌ MongoDB connection error: ...
```

**Solution**: Start MongoDB (see options above) and the connection will be established automatically.

## 📝 Default Configuration

- **Backend Port**: 5000
- **Frontend Port**: 3000
- **Database**: asd_tutor
- **JWT Secret**: Change in production!

## 🛑 To Stop the Servers

Press `Ctrl+C` in the terminal where `npm run dev` is running.

## ✅ Verification

Check if everything is working:
1. Backend health: http://localhost:5000/api/health
2. Frontend: http://localhost:3000

Both should be accessible!


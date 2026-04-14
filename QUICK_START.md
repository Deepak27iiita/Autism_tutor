# Quick Start Guide
## Web-Based Animated Tutor for Children with ASD

## 🚀 5-Minute Setup

### Step 1: Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Go back to root
cd ..
```

### Step 2: Configure Environment
```bash
# Create .env file in server directory
cd server
cp .env.example .env

# Edit .env file with your settings:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/asd_tutor
# JWT_SECRET=your_secret_key_here
# NODE_ENV=development
```

### Step 3: Start MongoDB
```bash
# If using local MongoDB:
mongod

# Or use MongoDB Atlas (cloud) - update MONGODB_URI in .env
```

### Step 4: Seed Database (Optional)
```bash
cd server
node seed.js
```

This will add sample words (cat, dog, apple, etc.) to your database.

### Step 5: Run the Application
```bash
# From root directory:
npm run dev
```

This starts:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

### Step 6: Create Account
1. Open http://localhost:3000
2. Click "Register"
3. Create an account (choose role: child, teacher, or admin)
4. Login

### Step 7: Start Learning!
1. As a **Child**: Click "Start Learning" on dashboard
2. As a **Teacher/Admin**: 
   - Go to "Words" to manage vocabulary
   - View "Analytics" for progress tracking

---

## 🎯 First Steps After Setup

### For Testing Learning Flow:
1. Register as a **Child** user
2. Go to Dashboard → "Start Learning"
3. Complete the 8-stage learning flow
4. View your progress in Analytics

### For Managing Words:
1. Register as a **Teacher** or **Admin**
2. Go to "Words" page
3. Click "+ Add New Word"
4. Fill in:
   - Word: e.g., "elephant"
   - Category: e.g., "animals"
   - Image URL: (use Unsplash or any image URL)
   - Difficulty: easy/medium/hard
   - PECS Phase: 1

### For Viewing Analytics:
1. Complete at least one learning session
2. Go to "Analytics" page
3. View:
   - Total sessions
   - Words learned
   - Average accuracy
   - Improvement percentages

---

## 🔧 Common Issues & Solutions

### Issue: MongoDB Connection Error
**Solution**: 
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in `.env` file
- For MongoDB Atlas, use connection string format:
  `mongodb+srv://username:password@cluster.mongodb.net/asd_tutor`

### Issue: Port Already in Use
**Solution**:
- Change PORT in `.env` file
- Or kill process using port: `lsof -ti:5000 | xargs kill`

### Issue: Frontend Not Loading
**Solution**:
- Check if backend is running (http://localhost:5000/api/health)
- Verify REACT_APP_API_URL in client (defaults to http://localhost:5000/api)
- Clear browser cache

### Issue: Animations Not Working
**Solution**:
- Check browser console for errors
- Ensure GSAP is installed: `cd client && npm install gsap`
- Try different browser (Chrome recommended)

---

## 📝 Sample Data

After running `node seed.js`, you'll have:
- **15 sample words** across categories:
  - Animals: cat, dog, bird, fish, horse
  - Food: apple, banana, bread, milk, cookie
  - Objects: ball, book, car, toy, cup

All words are set to:
- Difficulty: easy/medium
- PECS Phase: 1
- Image URLs: Unsplash (may need internet connection)

---

## 🎨 Customization

### Change Animation Speed
Edit `client/src/utils/animationController.js`:
```javascript
low: { duration: 1.5 },    // Slower
medium: { duration: 1.0 },  // Normal
high: { duration: 0.6 },     // Faster
```

### Change Colors
Edit `client/src/index.css`:
```css
:root {
  --primary-color: #4a90e2;    /* Change to your color */
  --secondary-color: #50c878;  /* Change to your color */
}
```

### Add More Words
1. Login as teacher/admin
2. Go to Words page
3. Click "+ Add New Word"
4. Fill in details

---

## 🧪 Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads correctly
- [ ] Learning session starts
- [ ] All 8 stages progress correctly
- [ ] Animations are smooth (no lag)
- [ ] Results are saved
- [ ] Analytics display correctly
- [ ] Word management works (teacher/admin)
- [ ] Responsive on mobile/tablet

---

## 📚 Next Steps

1. **Read Documentation**:
   - `docs/SRS.md` - Requirements
   - `docs/SystemDesign.md` - Architecture
   - `docs/AnimationDesignRationale.md` - Animation justification

2. **Explore Code**:
   - `client/src/pages/LearningSession.js` - Main learning flow
   - `client/src/utils/animationController.js` - Animation logic
   - `server/routes/sessions.js` - Session API

3. **Customize**:
   - Add your own words
   - Adjust animation settings
   - Modify UI colors/styles
   - Add new features

---

## 🆘 Need Help?

1. Check `PROJECT_SUMMARY.md` for overview
2. Read `docs/` folder for detailed documentation
3. Review code comments
4. Check browser console for errors
5. Check server logs for backend issues

---

## ✅ Success Indicators

You'll know everything is working when:
- ✅ Backend responds at http://localhost:5000/api/health
- ✅ Frontend loads at http://localhost:3000
- ✅ You can register and login
- ✅ Learning session starts and progresses
- ✅ Animations are smooth
- ✅ Results are saved and visible in Analytics

---

**Happy Learning! 🎓**


# Image Upload Guide

## Problem: Images Not Showing in Reading Stage

If images are not showing in the reading stage, here are the most common causes and solutions:

## ✅ Solution 1: Check Image URL Format

The image URL must be:
- **Publicly accessible** (not a local file path)
- **Direct link** to the image file (ending in .jpg, .png, .gif, etc.)
- **Valid URL** starting with `http://` or `https://`

### ❌ Wrong Examples:
```
C:\Users\VICTUS\Pictures\cat.jpg          (Local file path - won't work)
file:///C:/Users/VICTUS/Pictures/cat.jpg  (File protocol - won't work)
```

### ✅ Correct Examples:
```
https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400
https://example.com/images/cat.jpg
https://i.imgur.com/abc123.jpg
```

## ✅ Solution 2: Upload Images to Image Hosting Service

Since the application uses URLs (not file uploads), you need to host your images online:

### Option A: Imgur (Recommended - Free)
1. Go to https://imgur.com/upload
2. Upload your image
3. Right-click the uploaded image → "Copy image address"
4. Paste the URL in the "Image URL" field

### Option B: ImgBB (Free)
1. Go to https://imgbb.com
2. Click "Start uploading"
3. Upload your image
4. Copy the "Direct link" URL
5. Paste in the "Image URL" field

### Option C: Cloudinary (Free tier available)
1. Sign up at https://cloudinary.com
2. Upload images
3. Copy the image URL
4. Use in the application

## ✅ Solution 3: Use Online Image URLs

Instead of uploading, use existing online images:

### Unsplash (Free stock photos):
- Search: https://unsplash.com
- Right-click image → "Copy image address"
- Use the URL

### Example Unsplash URLs:
```
https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400
https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400
```

## ✅ Solution 4: Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for error messages like:
   - "Image failed to load"
   - "CORS error"
   - "404 Not Found"

## ✅ Solution 5: Verify Image URL in Database

1. Go to Word Management page
2. Edit the word
3. Check if the Image URL field has a valid URL
4. Use the preview feature to test if the image loads

## 🔧 Debugging Steps

1. **Check if imageUrl exists:**
   - Open browser console (F12)
   - Look for: `LearningStage - Current word:` log
   - Verify `imageUrl` is not empty

2. **Test image URL directly:**
   - Copy the image URL
   - Paste in a new browser tab
   - If it doesn't load, the URL is invalid

3. **Check CORS issues:**
   - Some image hosts block cross-origin requests
   - Try a different image hosting service

4. **Verify word data:**
   - Check browser console for word object
   - Ensure `word.imageUrl` is a string (not null/undefined)

## 📝 Quick Fix Checklist

- [ ] Image URL starts with `http://` or `https://`
- [ ] Image URL is publicly accessible (test in new tab)
- [ ] Image URL ends with image extension (.jpg, .png, etc.)
- [ ] No spaces or special characters in URL
- [ ] Image is not too large (recommended: under 2MB)
- [ ] Word has been saved with the image URL

## 🎯 Recommended Workflow

1. **Upload image to Imgur:**
   - Go to imgur.com/upload
   - Upload your image
   - Copy the direct link

2. **Add word with image:**
   - Go to Word Management
   - Click "Add New Word"
   - Paste the image URL
   - Check the preview to verify it loads
   - Save the word

3. **Test in learning session:**
   - Start a learning session
   - Check if image appears in reading stage
   - Check browser console for any errors

## 💡 Pro Tips

- Use the **Image Preview** feature in Word Management to test URLs before saving
- Keep image URLs short and simple
- Use image hosting services that allow direct linking
- For best results, use images that are 300x300px to 800x800px

## 🆘 Still Having Issues?

1. Check browser console for specific error messages
2. Verify the image URL works in a new browser tab
3. Try a different image hosting service
4. Make sure the word was saved successfully
5. Refresh the page and try again

---

**Remember:** The application requires **publicly accessible image URLs**, not local file paths. Always upload your images to an image hosting service first!


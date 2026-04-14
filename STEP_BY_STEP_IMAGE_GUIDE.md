# Step-by-Step Guide: Adding Images to Words

## 🎯 Why Images Aren't Showing

**The Problem:** The application needs **publicly accessible image URLs**, not local file paths. If you uploaded images from your computer, they're stored locally and can't be accessed by the web browser.

**The Solution:** Upload your images to an online image hosting service first, then use the URL.

---

## 📋 Complete Procedure (Step-by-Step)

### Step 1: Prepare Your Images
- Make sure your images are ready on your computer
- Recommended size: 300x300px to 800x800px
- Formats: JPG, PNG, or GIF

### Step 2: Upload Images to Imgur (Free & Easy)

1. **Go to Imgur:**
   - Open your browser
   - Visit: **https://imgur.com/upload**
   - (You don't need to create an account)

2. **Upload Your Image:**
   - Click "New post" or drag and drop your image
   - Wait for upload to complete

3. **Get the Direct Link:**
   - Right-click on the uploaded image
   - Select **"Copy image address"** or **"Copy image link"**
   - OR click the image, then right-click → "Copy image address"
   - The URL will look like: `https://i.imgur.com/abc123.jpg`

### Step 3: Add Word with Image URL

1. **Go to Word Management:**
   - In your application, click **"Words"** in the navigation bar
   - (You need to be logged in as Teacher or Admin)

2. **Add New Word:**
   - Click **"+ Add New Word"** button
   - Fill in the form:
     - **Word:** e.g., "Cat"
     - **Category:** Select appropriate category (e.g., "animals")
     - **Image URL:** Paste the Imgur URL you copied
     - **Difficulty:** Select easy/medium/hard
     - **PECS Phase:** Select 1

3. **Check Image Preview:**
   - After pasting the Image URL, you should see a preview below the input field
   - If you see the image preview ✅, the URL is correct
   - If you see an error ❌, the URL is wrong - try again

4. **Save the Word:**
   - Click **"Create Word"** button
   - The word should appear in the words list with the image

### Step 4: Verify Images Work

1. **Check Word List:**
   - In Word Management, you should see your words with images displayed
   - If images show here ✅, they'll work in learning sessions

2. **Test in Learning Session:**
   - Go to Dashboard
   - Click **"Start Learning"**
   - Navigate to the **"Reading"** stage
   - The image should appear above the word text

---

## 🔍 Troubleshooting

### Problem: Image Preview Doesn't Show
**Solution:**
- Check if the URL starts with `https://` or `http://`
- Make sure it's a direct image link (ends with .jpg, .png, etc.)
- Try opening the URL in a new browser tab - if it doesn't show an image, the URL is wrong

### Problem: Image Shows in Word Management but Not in Learning Session
**Solution:**
- Check browser console (F12) for errors
- Look for CORS errors - some image hosts block cross-origin requests
- Try a different image hosting service (Imgur usually works best)

### Problem: "Image failed to load" Error
**Solution:**
- The image URL might be expired or invalid
- Re-upload the image to Imgur and get a fresh URL
- Make sure you copied the "Direct link" not the page URL

---

## ✅ Quick Checklist

Before starting a learning session, verify:
- [ ] Images are uploaded to Imgur (or similar service)
- [ ] You have the direct image URLs (not page URLs)
- [ ] Image URLs are pasted in Word Management
- [ ] Image preview shows correctly in Word Management
- [ ] Words are saved successfully
- [ ] At least 2-3 words have images

---

## 🎬 Example Walkthrough

**Example: Adding "Cat" word with image**

1. **Upload to Imgur:**
   ```
   - Go to imgur.com/upload
   - Upload cat.jpg
   - Right-click image → Copy image address
   - Got: https://i.imgur.com/xyz123.jpg
   ```

2. **Add to Application:**
   ```
   - Go to Words page
   - Click "+ Add New Word"
   - Word: "Cat"
   - Category: "animals"
   - Image URL: https://i.imgur.com/xyz123.jpg
   - Check preview shows cat image ✅
   - Click "Create Word"
   ```

3. **Verify:**
   ```
   - Word appears in list with cat image ✅
   - Start learning session
   - Go to Reading stage
   - Cat image appears ✅
   ```

---

## 🆘 Still Having Issues?

1. **Check Browser Console:**
   - Press F12
   - Go to Console tab
   - Look for error messages
   - Share the error message for help

2. **Test Image URL:**
   - Copy the image URL
   - Paste in a new browser tab
   - If image doesn't load, URL is wrong

3. **Try Different Image Host:**
   - If Imgur doesn't work, try:
     - ImgBB: https://imgbb.com
     - PostImage: https://postimages.org
     - Cloudinary: https://cloudinary.com

---

## 💡 Important Notes

- **Local files won't work:** `C:\Users\...\image.jpg` ❌
- **Page URLs won't work:** `https://imgur.com/a/abc123` ❌
- **Direct image links work:** `https://i.imgur.com/xyz.jpg` ✅
- **Always test the URL** in a new browser tab first
- **Use the preview feature** in Word Management to verify

---

**Remember:** The key is using **publicly accessible image URLs**, not local file paths!


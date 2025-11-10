# 📷 Camera Error: "Could not start video source"

## ❌ Error Message

```
NotReadableError: Could not start video source
```

## 🔍 What This Means

The camera is **already in use** by another application or browser tab. Only one application can access your camera at a time.

---

## ✅ Quick Fix (30 seconds)

### **Step 1: Close Camera-Using Apps**

Check if any of these are running:

- [ ] Zoom, Teams, Skype, Google Meet
- [ ] Discord, Slack (with video)
- [ ] OBS Studio, Streamlabs
- [ ] Other browser tabs with camera access
- [ ] WhatsApp Web, Messenger Web
- [ ] Camera app on your computer

### **Step 2: Refresh Browser**

1. Close ALL tabs using camera
2. Wait 3 seconds
3. Return to: `http://localhost:5174/deploy/ar-placement`
4. Click "Try Again" button

### **Step 3: Force Release Camera**

**Chrome/Edge:**

1. Click camera icon in address bar (🎥)
2. Click "Manage"
3. Reset permissions
4. Reload page

**Firefox:**

1. Click shield icon in address bar
2. Click "Camera" dropdown
3. Select "Allow"
4. Reload page

**Safari:**

1. Safari menu → Settings → Websites
2. Camera → Select "Allow" for localhost
3. Reload page

---

## 🔧 Enhanced Error Handling (Now Implemented)

The AR Camera component now includes:

### **1. Automatic Fallback**

```typescript
// Tries 3 different camera configurations:
1st: High-quality rear camera (1920x1080)
2nd: Standard camera (1280x720)
3rd: Basic camera (any resolution)
```

### **2. Clear Error Messages**

- ✅ "Camera already in use" → Shows fix instructions
- ✅ "Permission denied" → Asks to grant permissions
- ✅ "No camera found" → Device doesn't have camera
- ✅ Specific error for each camera issue

### **3. Retry Button**

- Click "Try Again" after closing other apps
- Automatically re-initializes camera
- No need to reload page

---

## 🐛 Common Scenarios

### **Scenario 1: Other Tab Using Camera**

**Problem:** Another browser tab (e.g., Google Meet) is using camera

**Solution:**

1. Find tab with camera icon (🎥) in browser
2. Close that tab
3. Click "Try Again" in AR Camera

---

### **Scenario 2: Video App Running**

**Problem:** Zoom/Teams/Discord running in background

**Solution:**

1. Quit video app completely (not just minimize)
2. Wait 3 seconds
3. Click "Try Again"

---

### **Scenario 3: Browser Permission Issue**

**Problem:** Browser blocked camera access

**Solution:**

1. Click camera icon in address bar
2. Select "Always allow" for localhost
3. Reload page
4. Grant permission when asked

---

### **Scenario 4: System Camera Settings**

**Problem:** OS-level camera blocked

**Solution (macOS):**

1. System Settings → Privacy & Security
2. Camera → Enable for your browser
3. Restart browser

**Solution (Windows):**

1. Settings → Privacy → Camera
2. Allow apps to access camera
3. Enable for your browser
4. Restart browser

---

## 🧪 Test If Camera Works

### **Quick Test:**

```bash
# 1. Open browser console (F12)
# 2. Run this command:
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log("✅ Camera works!", stream);
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => console.error("❌ Camera error:", err));
```

**If you see "✅ Camera works!"** → Camera is available, reload AR Camera page

**If you see "❌ Camera error"** → Follow the error message

---

## 📱 Mobile-Specific Issues

### **iOS Safari:**

**Issue:** Camera doesn't open

**Fix:**

1. Settings → Safari → Camera
2. Select "Ask" or "Allow"
3. Close Safari completely
4. Reopen and try again

---

### **Android Chrome:**

**Issue:** Camera permission denied

**Fix:**

1. Chrome → Settings (3 dots)
2. Site settings → Camera
3. Find localhost → Allow
4. Refresh page

---

## 🔄 Nuclear Option (Reset Everything)

If nothing works:

1. **Close ALL browser tabs**
2. **Quit browser completely**
3. **Wait 10 seconds**
4. **Restart browser**
5. **Go to:** `http://localhost:5174/deploy/ar-placement`
6. **Allow camera permission**
7. **Should work now!**

---

## 💡 Pro Tips

### **Prevent This Error:**

- Close video apps before using AR Camera
- Use dedicated browser window for AR Camera
- Bookmark the deployment page for quick access
- Grant permissions permanently (not just once)

### **Check What's Using Camera:**

**macOS:**

- Green dot in menu bar = camera in use
- Click Control Center → see which app

**Windows:**

- Task Manager → Check for video apps
- Webcam LED light on = camera in use

---

## ✅ Success Indicators

After fixing, you should see:

1. **Camera Permission Dialog** → Click "Allow"
2. **Video Feed Appears** (not black screen)
3. **Blue Crosshair Overlay** in center
4. **"Place Agent Here" Button** at bottom
5. **GPS Coordinates** in top-left

---

## 🆘 Still Not Working?

### **Last Resort Checks:**

1. **Try Different Browser**

   - Chrome → Firefox
   - Firefox → Edge
   - Safari → Chrome

2. **Check Camera Hardware**

   - Does camera work in other apps?
   - Is camera physically covered?
   - Is camera driver installed?

3. **Check Browser Console**

   ```
   F12 → Console tab
   Look for red error messages
   Share screenshot if asking for help
   ```

4. **Restart Computer**
   - Sometimes camera driver gets stuck
   - Full restart releases camera lock

---

## 📊 Error Code Reference

| Error                | Meaning             | Fix                         |
| -------------------- | ------------------- | --------------------------- |
| NotReadableError     | Camera in use       | Close other apps            |
| NotAllowedError      | Permission denied   | Grant permissions           |
| NotFoundError        | No camera           | Use device with camera      |
| OverconstrainedError | Settings too strict | Already handled by fallback |
| AbortError           | Unknown issue       | Restart browser             |

---

## 🎯 Next Steps After Fix

Once camera works:

1. ✅ Point at ground
2. ✅ Tap "Place Agent Here"
3. ✅ Green pin appears
4. ✅ Tap "Confirm Placement"
5. ✅ Returns to form with coordinates

---

## 📞 Need Help?

If camera still doesn't work after all this:

1. Check browser console (F12)
2. Take screenshot of error
3. Note which browser/OS you're using
4. Share error details

---

**Quick Summary:**

```
Problem: Camera already in use
Fix: Close other apps → Click "Try Again"
Result: Camera opens successfully
```

**Most Common Fix:** Close Zoom/Teams/Meet → Retry

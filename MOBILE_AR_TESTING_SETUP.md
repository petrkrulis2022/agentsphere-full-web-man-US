# 📱 **Mobile AR Testing Setup (Optional)**

## **Only needed if testing AR features on mobile devices**

### **1. Start ngrok for AR Viewer (if needed)**

```bash
# In AR Viewer directory
ngrok http 5173
```

### **2. Update AR Viewer Environment for Mobile**

```env
# Use ngrok URLs for mobile testing
VITE_AGENTSPHERE_API_URL=https://8323ecb51478.ngrok-free.app
VITE_AR_VIEWER_URL=https://YOUR-AR-NGROK-URL.ngrok.io
```

### **3. HTTPS Requirement**

- AR features (camera access) require HTTPS
- ngrok provides HTTPS automatically
- Use ngrok URLs when testing on mobile devices

### **4. CORS Configuration**

Make sure AgentSphere backend allows AR Viewer origin:

```javascript
// In AgentSphere CORS settings
const allowedOrigins = [
  "http://localhost:5173",
  "https://YOUR-AR-NGROK-URL.ngrok.io",
];
```

---

## **For Local Development Only:**

Use `http://localhost:5174` - **no ngrok needed** ✅

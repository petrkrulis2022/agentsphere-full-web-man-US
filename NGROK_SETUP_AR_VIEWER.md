# Ngrok Setup Guide for AR Viewer

**Date:** November 12, 2025  
**Purpose:** Enable remote access to AR Viewer from any device/location for testing

---

## 📋 Prerequisites

- AR Viewer repository cloned and dependencies installed
- Ngrok installed on your system
- AR Viewer dev server running

---

## 🚀 Setup Steps

### 1. Start AR Viewer Dev Server with Host Exposure

```bash
npm run dev -- --host
```

**Expected Output:**

```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:XXXX/
➜  Network: http://YOUR_IP:XXXX/
```

Note the **port number** (e.g., 5173, 5174, 3000, etc.)

---

### 2. Start Ngrok Tunnel

In a **separate terminal**, run:

```bash
ngrok http <PORT>
```

Replace `<PORT>` with the port from step 1.

**Example:**

```bash
ngrok http 5173
```

**Expected Output:**

```
Session Status                online
Forwarding                    https://xxxxx.ngrok-free.app -> http://localhost:5173
Web Interface                 http://127.0.0.1:4040
```

**Copy the ngrok URL** (e.g., `https://xxxxx.ngrok-free.app`)

---

### 3. Update vite.config.ts

Open `vite.config.ts` in the AR Viewer repository and add the ngrok URL:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Your AR Viewer port
    strictPort: true,
    allowedHosts: [
      "xxxxx.ngrok-free.app", // ⬅️ Add your ngrok URL here (without https://)
    ],
    cors: {
      origin: [
        "http://localhost:5173",
        "https://xxxxx.ngrok-free.app", // ⬅️ Add your ngrok URL here (with https://)
      ],
      credentials: true,
    },
  },
});
```

**Important:**

- In `allowedHosts`: Use URL **without** `https://`
- In `cors.origin`: Use URL **with** `https://`

---

### 4. Wait for Vite to Auto-Restart

After saving `vite.config.ts`, Vite will automatically restart:

```
[vite] vite.config.ts changed, restarting server...
[vite] server restarted.
```

---

### 5. Access AR Viewer from Any Device

Open the ngrok URL on any device:

```
https://xxxxx.ngrok-free.app
```

**First Visit:** Click "Visit Site" button on the ngrok warning page.

---

## 🔧 Running Services Checklist

Make sure both services are running:

- ✅ **Terminal 1:** Vite dev server (`npm run dev -- --host`)
- ✅ **Terminal 2:** Ngrok tunnel (`ngrok http <PORT>`)

---

## 🌍 Access From Anywhere

The ngrok URL works from:

- ✅ Different laptop on same network
- ✅ Different laptop on different network
- ✅ Mobile device (phone/tablet)
- ✅ Different city/country
- ✅ Any device with internet access

---

## ⚠️ Important Notes

### Free Ngrok Limitations

1. **URL Changes on Restart:** Every time you restart ngrok, you get a new URL
   - You must update `vite.config.ts` with the new URL each time
2. **Session Duration:** Free sessions may have time limits
   - If disconnected, restart ngrok and update config

### Security

- Don't share ngrok URLs publicly
- Only use for development/testing
- Ngrok URLs expire when you stop the tunnel

---

## 🐛 Troubleshooting

### Error: "Blocked request. This host is not allowed."

**Fix:** Add the ngrok URL to `allowedHosts` in `vite.config.ts`

### Error: "ERR_NGROK_8012 - Connection refused"

**Fix:** Make sure Vite dev server is running on the correct port

### Error: "ERR_NGROK_3200 - Endpoint is offline"

**Fix:** Ngrok tunnel is not running. Start it with `ngrok http <PORT>`

### Ngrok URL Changed

1. Check ngrok terminal for new URL
2. Update `vite.config.ts` with new URL
3. Wait for Vite to auto-restart
4. Access new URL

---

## 📝 Example Configuration

### Complete vite.config.ts Example

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    allowedHosts: [
      "abc123def456.ngrok-free.app",
      "xyz789uvw012.ngrok-free.app",
      // Add historical ngrok URLs to avoid updating every time
    ],
    proxy: {
      "/api": {
        target: "http://localhost:5173",
        changeOrigin: true,
      },
    },
    cors: {
      origin: [
        "http://localhost:5173",
        "https://abc123def456.ngrok-free.app",
        "https://xyz789uvw012.ngrok-free.app",
      ],
      credentials: true,
    },
  },
});
```

---

## 🎯 Quick Commands Reference

```bash
# Terminal 1: Start dev server
npm run dev -- --host

# Terminal 2: Start ngrok
ngrok http 5173

# Check ngrok status
curl http://127.0.0.1:4040/api/tunnels

# Kill ngrok if needed
pkill -f ngrok

# Kill vite if needed
pkill -f vite
```

---

## 📱 Testing Workflow

1. **Start both services** (Vite + ngrok)
2. **Copy ngrok URL** from terminal
3. **Update vite.config.ts** with new URL
4. **Open URL on mobile device**
5. **Click "Visit Site"** on ngrok warning
6. **Test AR features** on real device

---

## 🔗 Resources

- **Ngrok Documentation:** https://ngrok.com/docs
- **Vite Server Options:** https://vitejs.dev/config/server-options.html
- **Ngrok Web Interface:** http://127.0.0.1:4040 (when ngrok is running)

---

**End of Guide**

Keep both terminals running while testing. Update ngrok URL in config whenever you restart ngrok.

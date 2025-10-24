# 🚀 Ngrok Webhook Setup Guide

## Step 1: Get Your Ngrok URL

Run this command in a separate terminal:

```bash
ngrok http 5174
```

You'll see output like:

```
Forwarding    https://abc123-def456.ngrok.io -> http://localhost:5174
```

## Step 2: Copy Your Ngrok URL

From the ngrok output, copy the HTTPS URL (something like: https://abc123-def456.ngrok.io)

## Step 3: Update the Webhook Script

Edit the `create-webhook.js` file and replace:

```javascript
const WEBHOOK_URL = "https://your-ngrok-url.ngrok.io/api/revolut/webhook";
```

With your actual ngrok URL:

```javascript
const WEBHOOK_URL =
  "https://YOUR-ACTUAL-NGROK-URL.ngrok.io/api/revolut/webhook";
```

## Step 4: Create the Webhook

Run the script:

```bash
node create-webhook.js
```

## Step 5: Update Your .env

Copy the `signing_secret` from the script output and update your .env file:

```
REVOLUT_WEBHOOK_SECRET=wh_sec_ACTUAL_SECRET_FROM_RESPONSE
```

## Important Notes:

- **ngrok URL changes**: Each time you restart ngrok, you get a new URL
- **AR Viewer**: You don't need ngrok for AR viewer unless you want to test it on mobile
- **Production**: For production, use your deployed Netlify URL instead of ngrok

## Next Steps:

1. Start ngrok: `ngrok http 5174`
2. Copy the ngrok URL
3. Update `create-webhook.js` with your URL
4. Run `node create-webhook.js`
5. Update `.env` with the returned signing secret

// create-webhook.js - Script to create Revolut webhook
import https from "https";

const API_KEY =
  "sk_ZXzrNQBu3jAgK310spMgznoZxqclcsIP7BdZmUXo-UYMAfAfbX_ANT0mZokp12st";
const WEBHOOK_URL = "https://8323ecb51478.ngrok-free.app/api/revolut/webhook"; // Actual ngrok URL

const data = JSON.stringify({
  url: WEBHOOK_URL,
  events: [
    "ORDER_COMPLETED",
    "ORDER_PAYMENT_DECLINED",
    "ORDER_PAYMENT_FAILED",
    "ORDER_CANCELLED",
  ],
});

const options = {
  hostname: "sandbox-merchant.revolut.com",
  port: 443,
  path: "/api/1.0/webhooks",
  method: "POST",
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);

  let responseBody = "";
  res.on("data", (chunk) => {
    responseBody += chunk;
  });

  res.on("end", () => {
    console.log("Response Body:");
    console.log(JSON.stringify(JSON.parse(responseBody), null, 2));

    if (res.statusCode === 201) {
      const response = JSON.parse(responseBody);
      console.log("\n🎉 SUCCESS! Webhook created!");
      console.log(`📝 Copy this signing secret to your .env file:`);
      console.log(`REVOLUT_WEBHOOK_SECRET=${response.signing_secret}`);
    }
  });
});

req.on("error", (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();

console.log("Creating webhook...");

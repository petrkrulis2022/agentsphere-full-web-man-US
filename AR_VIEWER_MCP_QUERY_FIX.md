# AR Viewer - MCP Flight Query Fix

**Issue**: Backend returns 500 error because AR Viewer is not sending the required `date` parameter.

**Backend Error**:

```
"Flightradar24 MCP query failed: Missing required parameters: origin, destination, date"
```

---

## 🔧 **Required Fix in AR Viewer**

### **Current AR Viewer Code (BROKEN)**

```typescript
// AgentInteractionModal.jsx - CURRENT (MISSING DATE)
const parsedQuery = {
  origin: "BUD",
  destination: "BCN",
  // ❌ Missing date parameter!
};

const response = await fetch("http://localhost:4001/api/agents/travel/query", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(parsedQuery),
});
```

---

## ✅ **CORRECTED AR Viewer Code**

### **Fix 1: Add Date Parameter**

```typescript
// AgentInteractionModal.jsx - CORRECTED
const parsedQuery = {
  origin: "BUD",
  destination: "BCN",
  date: "2025-01-15", // ✅ ADD THIS - Format: YYYY-MM-DD
};

const response = await fetch("http://localhost:4001/api/agents/travel/query", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(parsedQuery),
});
```

---

### **Fix 2: Enhanced Query Parser with Date Extraction**

```typescript
// AgentInteractionModal.jsx - ENHANCED PARSER

/**
 * Parse flight query from user message
 * Supports formats:
 * - "flights from BUD to BCN"
 * - "flights from BUD to BCN on 2025-01-15"
 * - "flights from BUD to BCN on January 15"
 * - "find flights BUD BCN 2025-01-15"
 */
const parseFlightQuery = (message) => {
  const msg = message.toLowerCase();

  // Extract origin and destination (existing logic)
  const fromMatch = msg.match(/from\s+([A-Z]{3})/i);
  const toMatch = msg.match(/to\s+([A-Z]{3})/i);

  if (!fromMatch || !toMatch) {
    return null;
  }

  const origin = fromMatch[1].toUpperCase();
  const destination = toMatch[1].toUpperCase();

  // ✅ NEW: Extract date from query
  let date = extractDateFromMessage(msg);

  // ✅ NEW: If no date provided, default to tomorrow
  if (!date) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    date = tomorrow.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  }

  return { origin, destination, date };
};

/**
 * Extract date from natural language
 */
const extractDateFromMessage = (message) => {
  // Match YYYY-MM-DD format
  const dateMatch = message.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    return dateMatch[1];
  }

  // Match "on January 15", "on Jan 15", etc.
  const monthNames = {
    january: "01",
    jan: "01",
    february: "02",
    feb: "02",
    march: "03",
    mar: "03",
    april: "04",
    apr: "04",
    may: "05",
    june: "06",
    jun: "06",
    july: "07",
    jul: "07",
    august: "08",
    aug: "08",
    september: "09",
    sep: "09",
    october: "10",
    oct: "10",
    november: "11",
    nov: "11",
    december: "12",
    dec: "12",
  };

  for (const [name, num] of Object.entries(monthNames)) {
    const regex = new RegExp(`on\\s+${name}\\s+(\\d{1,2})`, "i");
    const match = message.match(regex);
    if (match) {
      const day = match[1].padStart(2, "0");
      const year = new Date().getFullYear();
      return `${year}-${num}-${day}`;
    }
  }

  // Match "tomorrow"
  if (message.includes("tomorrow")) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }

  // Match "next week"
  if (message.includes("next week")) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split("T")[0];
  }

  return null; // No date found
};
```

---

### **Fix 3: User-Friendly Error Messages**

```typescript
// AgentInteractionModal.jsx - BETTER ERROR HANDLING

const sendMessage = async (message) => {
  try {
    console.log("✈️ Travel Agent MCP query:", message);

    // Parse query
    const parsedQuery = parseFlightQuery(message);

    if (!parsedQuery) {
      // ✅ Show helpful message to user
      addMessage({
        sender: "agent",
        text:
          `❌ I couldn't understand your flight query. Please use this format:\n\n` +
          `"flights from [ORIGIN] to [DESTINATION] on [DATE]"\n\n` +
          `Examples:\n` +
          `• "flights from BUD to BCN on 2025-01-15"\n` +
          `• "flights from BUD to BCN on January 15"\n` +
          `• "flights from BUD to BCN tomorrow"\n\n` +
          `If you don't specify a date, I'll search for tomorrow's flights.`,
        timestamp: new Date(),
      });
      return;
    }

    console.log("📍 Parsed flight query:", parsedQuery);

    // Show user what we're searching for
    addMessage({
      sender: "agent",
      text: `🔍 Searching flights from ${parsedQuery.origin} to ${parsedQuery.destination} on ${parsedQuery.date}...`,
      timestamp: new Date(),
    });

    // Query backend
    const response = await fetch(
      "http://localhost:4001/api/agents/travel/query",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedQuery),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Backend API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const result = await response.json();

    // Display results with transaction link
    displayFlightResults(result);
  } catch (error) {
    console.error("❌ Backend MCP query failed:", error);

    addMessage({
      sender: "agent",
      text:
        `❌ Failed to query flights: ${error.message}\n\n` +
        `Please ensure:\n` +
        `1. Travel Agent backend is running (http://localhost:4001)\n` +
        `2. Agent has sufficient USDH balance for x402 payment\n` +
        `3. Query format: "flights from [ORIGIN] to [DEST] on [DATE]"\n\n` +
        `Example: "flights from BUD to BCN on 2025-01-15"`,
      timestamp: new Date(),
    });
  }
};
```

---

### **Fix 4: Display Results with HashScan Link**

```typescript
// AgentInteractionModal.jsx - DISPLAY RESULTS

const displayFlightResults = (result) => {
  if (!result || !result.flights) {
    addMessage({
      sender: "agent",
      text: "❌ No flights found for this route.",
      timestamp: new Date(),
    });
    return;
  }

  const { flights, payment } = result;

  // Format flight results
  let message = `✈️ Found ${flights.length} flights:\n\n`;

  flights.forEach((flight, index) => {
    message += `**Flight ${index + 1}:**\n`;
    message += `• ${flight.airline} ${flight.flightNumber}\n`;
    message += `• Departs: ${flight.departure}\n`;
    message += `• Arrives: ${flight.arrival}\n`;
    message += `• Price: ${flight.price}\n\n`;
  });

  // Add payment info with HashScan link
  if (payment && payment.transactionId) {
    message += `💰 **MCP Cost**: ${payment.amount} USDH (paid by agent)\n`;
    message += `📋 [View x402 payment on HashScan](${payment.hashscanUrl})`;
  }

  addMessage({
    sender: "agent",
    text: message,
    timestamp: new Date(),
  });
};
```

---

## 📋 **Backend API Specification**

### **Endpoint**: `POST http://localhost:4001/api/agents/travel/query`

### **Request Body**:

```json
{
  "origin": "BUD", // Required: 3-letter IATA code
  "destination": "BCN", // Required: 3-letter IATA code
  "date": "2025-01-15" // Required: YYYY-MM-DD format
}
```

### **Success Response** (200 OK):

```json
{
  "flights": [
    {
      "airline": "Wizz Air",
      "flightNumber": "W6 1234",
      "departure": "2025-01-15T10:30:00Z",
      "arrival": "2025-01-15T13:00:00Z",
      "price": "€89"
    }
  ],
  "payment": {
    "amount": 0.00022,
    "currency": "USDH",
    "transactionId": "0.0.123456@1234567890.123456789",
    "hashscanUrl": "https://hashscan.io/testnet/transaction/0.0.123456@1234567890.123456789",
    "protocol": "x402",
    "service": "flightradar24"
  }
}
```

### **Error Response** (400 Bad Request):

```json
{
  "error": "Missing required parameters",
  "details": "Both 'origin', 'destination', and 'date' are required"
}
```

### **Error Response** (500 Internal Server Error):

```json
{
  "error": "Failed to query flights",
  "details": "Flightradar24 MCP query failed: ..."
}
```

---

## 🧪 **Testing Examples**

### **Valid Queries**:

```
✅ "flights from BUD to BCN on 2025-01-15"
✅ "flights from BUD to BCN on January 15"
✅ "flights from BUD to BCN tomorrow"
✅ "find flights BUD BCN 2025-01-15"
```

### **Invalid Queries** (should show helpful error):

```
❌ "flights from Budapest to Barcelona"  (not IATA codes)
❌ "flights BUD BCN"                      (missing 'from' and 'to')
❌ "get me a flight"                      (no route specified)
```

---

## 🔍 **Summary of Changes Needed in AR Viewer**

1. ✅ **Add `date` parameter** to all backend queries
2. ✅ **Enhance parser** to extract date from user message
3. ✅ **Default to tomorrow** if no date specified
4. ✅ **Show better error messages** to guide users
5. ✅ **Display HashScan link** with payment proof
6. ✅ **Fix CSP** to allow `http://localhost:4001` connections

---

## 🚀 **Quick Fix (Minimum Viable)**

If you just want it working ASAP, add this one line:

```typescript
const parsedQuery = {
  origin: "BUD",
  destination: "BCN",
  date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
};
```

This defaults to tomorrow's date if not specified by the user.

# AR Viewer - Live Flight Query Fix

**Issue**: Flightradar24 MCP returns **live/current flights**, not future scheduled flights.

---

## 🎯 **Critical Understanding**

Flightradar24 is a **LIVE flight tracker**, not a flight booking system. It shows:

- ✅ Flights currently in the air
- ✅ Flights scheduled for TODAY
- ❌ NOT future flight schedules (tomorrow, next week, etc.)

---

## ✅ **CORRECTED AR Viewer Query Code**

### **Use TODAY's date, not future dates!**

```typescript
// AgentInteractionModal.jsx - CORRECTED FOR LIVE FLIGHTS

const parseFlightQuery = (message) => {
  const msg = message.toLowerCase();

  // Extract origin and destination
  const fromMatch = msg.match(/from\s+([A-Z]{3})/i);
  const toMatch = msg.match(/to\s+([A-Z]{3})/i);

  if (!fromMatch || !toMatch) {
    return null;
  }

  const origin = fromMatch[1].toUpperCase();
  const destination = toMatch[1].toUpperCase();

  // ✅ IMPORTANT: Always use TODAY for live flights
  const today = new Date();
  const date = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD

  // Optional: extract time preference (defaults to current time)
  const time = today.toTimeString().slice(0, 5); // Format: HH:MM

  return { origin, destination, date, time };
};

const sendMessage = async (message) => {
  try {
    console.log("✈️ Travel Agent MCP query:", message);

    const parsedQuery = parseFlightQuery(message);

    if (!parsedQuery) {
      addMessage({
        sender: "agent",
        text:
          `❌ I couldn't understand your flight query. Please use this format:\n\n` +
          `"flights from [ORIGIN] to [DESTINATION]"\n\n` +
          `Examples:\n` +
          `• "flights from LHR to JFK"\n` +
          `• "flights from AMS to BCN"\n` +
          `• "live flights BUD to VIE"\n\n` +
          `📍 NOTE: I show LIVE flights and today's schedule only.`,
        timestamp: new Date(),
      });
      return;
    }

    console.log("📍 Parsed flight query:", parsedQuery);

    // Show user what we're searching for
    addMessage({
      sender: "agent",
      text: `🔍 Searching LIVE flights from ${parsedQuery.origin} to ${parsedQuery.destination}...`,
      timestamp: new Date(),
    });

    // Query backend with TODAY's date
    const response = await fetch(
      "http://localhost:4001/api/agents/travel/query",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: parsedQuery.origin,
          destination: parsedQuery.destination,
          date: parsedQuery.date, // Always TODAY
          time: parsedQuery.time, // Current time
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Backend API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const result = await response.json();

    // Display results
    displayFlightResults(result);
  } catch (error) {
    console.error("❌ Backend MCP query failed:", error);

    addMessage({
      sender: "agent",
      text:
        `❌ Failed to query flights: ${error.message}\n\n` +
        `Please ensure:\n` +
        `1. Travel Agent backend is running (http://localhost:4001)\n` +
        `2. Query uses valid IATA codes (3 letters)\n` +
        `3. Route has flights operating TODAY\n\n` +
        `Try popular routes:\n` +
        `• "flights from LHR to JFK" (London → New York)\n` +
        `• "flights from AMS to BCN" (Amsterdam → Barcelona)`,
      timestamp: new Date(),
    });
  }
};

const displayFlightResults = (result) => {
  if (!result || !result.flights || result.flights.length === 0) {
    addMessage({
      sender: "agent",
      text:
        `❌ No live flights found for this route.\n\n` +
        `This could mean:\n` +
        `• No flights currently flying on this route\n` +
        `• No flights scheduled for TODAY\n` +
        `• Route doesn't exist\n\n` +
        `Try:\n` +
        `• Different route (LHR → JFK, AMS → BCN)\n` +
        `• Check if your route operates daily`,
      timestamp: new Date(),
    });
    return;
  }

  const { flights, payment } = result;

  let message = `✈️ Found ${flights.length} live/scheduled flights:\n\n`;

  flights.forEach((flight, index) => {
    message += `**Flight ${index + 1}:**\n`;
    message += `• ${flight.airline} ${flight.flightNumber}\n`;
    message += `• Departs: ${flight.departure.time} (${flight.departure.airport})\n`;
    message += `• Arrives: ${flight.arrival.time} (${flight.arrival.airport})\n`;
    if (flight.status) {
      message += `• Status: ${flight.status}\n`;
    }
    message += `\n`;
  });

  // Add payment info
  if (payment && payment.transaction_id !== "pending") {
    message += `💰 **MCP Cost**: ${payment.cost_usdh} USDH (paid by agent)\n`;
    if (payment.hashscan_url) {
      message += `📋 [View x402 payment on HashScan](${payment.hashscan_url})`;
    }
  }

  addMessage({
    sender: "agent",
    text: message,
    timestamp: new Date(),
  });
};
```

---

## 📋 **Updated Backend API Specification**

### **Request Body** (send TODAY's date):

```json
{
  "origin": "LHR",
  "destination": "JFK",
  "date": "2025-11-21", // TODAY (not tomorrow!)
  "time": "14:30" // Current time (optional)
}
```

---

## 🧪 **Testing Examples**

### **Valid Queries** (routes with frequent daily service):

```
✅ "flights from LHR to JFK"  // London → New York (many daily flights)
✅ "flights from AMS to BCN"  // Amsterdam → Barcelona (hourly)
✅ "flights from DXB to LHR"  // Dubai → London (frequent)
✅ "flights from LAX to SFO"  // LA → San Francisco (every 30 min)
```

### **May Return Empty** (infrequent routes):

```
⚠️ "flights from BUD to BCN"  // Budapest → Barcelona (may not fly daily)
⚠️ "flights from PRG to MAD"  // Prague → Madrid (seasonal)
```

---

## 🔍 **Summary of Changes**

1. ✅ **Always use TODAY's date** - Remove date picker/future dates
2. ✅ **Add current time** - Show flights around current time
3. ✅ **Update error messages** - Explain it's for LIVE flights only
4. ✅ **Suggest popular routes** - LHR-JFK, AMS-BCN, etc.
5. ✅ **Handle empty results** - Explain why no flights found

---

## 💡 **User Experience Guidelines**

**DO:**

- Query for today's flights only
- Use major airport codes (LHR, JFK, AMS, BCN)
- Show "live" or "today's" in UI messaging
- Suggest trying different routes if empty

**DON'T:**

- Allow future date selection
- Promise flight booking
- Show price comparison (this is tracking, not booking)
- Query obscure routes

---

## 🚀 **Quick Test**

```bash
# Test with today's date
curl -X POST http://localhost:4001/api/agents/travel/query \
  -H "Content-Type: application/json" \
  -d "{
    \"origin\": \"LHR\",
    \"destination\": \"JFK\",
    \"date\": \"$(date +%Y-%m-%d)\"
  }"
```

---

## 📝 **Alternative: Use Specific Flight Number**

If you know a specific flight number, you can track it:

```typescript
// Track specific flight
const trackFlight = async (flightNumber, date) => {
  const response = await fetch(
    "http://localhost:4001/api/agents/travel/flight-details",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        flightNumber: flightNumber, // e.g., "BA123"
        date: date || new Date().toISOString().split("T")[0],
      }),
    }
  );

  return await response.json();
};

// Example usage
await trackFlight("BA117", "2025-11-21"); // British Airways LHR → JFK
```

This will give real-time status for a specific flight.

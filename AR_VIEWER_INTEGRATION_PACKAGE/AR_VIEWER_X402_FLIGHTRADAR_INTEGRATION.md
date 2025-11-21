# AR Viewer x402 Flightradar24 Integration Prompt

## Overview

Integrate the **Travel Agent x402 MCP flow** into the AR Viewer to display real-time flight data from Flightradar24 before presenting the final travel package to the user. This creates a transparent user experience where the agent autonomously queries flight data, pays for it using x402 micropayments, and presents options within the AR interface.

## User Flow Integration

### Updated Flow (Click-Based AR Interaction)

```
Friday 16:00 - User clicks on Travel Agent AR object in camera view
Friday 16:00:15 - Agent card appears showing fee (100 USDH) and verified identity
Friday 16:00:30 - User pays 100 USDH unlock fee → Chat/Voice/Video interface unlocks
Friday 16:01 - User sends message: "Plan trip to Barcelona for this weekend"
Friday 16:01:15 - Travel Agent queries Flightradar24 MCP (x402 payment: 0.00022 USDH)
Friday 16:02 - Travel Agent queries sub-agents via A2A (Bus/Train/Hotel)
Friday 16:03 - Travel Agent presents options in chat:
                ├─> ✈️ Flight options (€85-120, data only)
                └─> 🚌🚆🏨 Alternative Package (4325 USDH total)
Friday 16:04 - User decides: "Book Alternative Package"
Friday 16:05 - Payment approved (4325 USDH)
Friday 16:06 - Travel Agent auto-splits payment to sub-agents
Friday 16:07 - User receives 3 NFT tickets (Bus, Train, Hotel)
```

### New AR Viewer UI Requirements

The AR interface needs to show FIVE stages:

1. **Agent Card Display** - When user clicks AR object (before payment)
2. **Unlock Payment** - User pays 100 USDH to unlock interaction
3. **Chat Interface** - Unlocked after payment (chat/voice/video)
4. **Loading Stage** - Agent is querying MCP and sub-agents
5. **Results Display** - Flight data + Package comparison in chat

---

## Implementation Guide

### 1. Update AR Viewer Agent Card Display

**File**: `src/components/ARScene.tsx` (or equivalent AR component)

**Changes Needed**:

#### Add x402 MCP Indicator to Agent Card

When user **clicks on Travel Agent AR object**, show that MCP integration is active:

```typescript
// Agent Card Component
interface AgentCardProps {
  agentData: {
    accountId: string;
    agentType: string;
    fee: string;
    did: string;
    mcpEnabled: boolean; // NEW FIELD
    mcpServices: string[]; // NEW FIELD - ["flightradar24", ...]
  };
}

// Display in AR
<AgentCard>
  <AgentHeader>
    <AgentIcon type="travel" />
    <AgentName>Travel Agent</AgentName>
    {agentData.mcpEnabled && (
      <MCPBadge>
        <CloudIcon />
        <Tooltip>Uses Flightradar24 for real-time flight data</Tooltip>
      </MCPBadge>
    )}
  </AgentHeader>

  <AgentIdentity>
    🆔 Verified Agent DID: {agentData.did}
    Fee: {agentData.fee} USDH
  </AgentIdentity>

  {agentData.mcpEnabled && (
    <MCPServiceList>
      <MCPServiceBadge>✈️ Flightradar24 (€0.00022/query)</MCPServiceBadge>
    </MCPServiceList>
  )}
</AgentCard>;
```

**Visual Design**:

- **MCP Badge**: Small cloud icon with lightning bolt (⚡☁️)
- **Color**: Blue/purple gradient to indicate "premium" data service
- **Placement**: Top-right corner of agent card, next to identity verification badge

**Unlock Fee Display**:

- Show prominent "Unlock Interaction" button with 100 USDH fee
- Display: "💬 Pay 100 USDH to unlock Chat, Voice & Video"
- Once paid, replace with "✅ Interaction Unlocked" badge

---

### 2. Create Unlock Payment UI

**Component**: `UnlockPaymentComponent.tsx`

**Triggered**: When user clicks on Travel Agent AR object (before chat is accessible)

```typescript
interface UnlockPaymentProps {
  agentData: {
    accountId: string;
    name: string;
    unlockFee: number; // 100 USDH
    identity: string;
    mcpEnabled: boolean;
  };
  onPaymentComplete: () => void;
}

const UnlockPayment: React.FC<UnlockPaymentProps> = ({
  agentData,
  onPaymentComplete,
}) => {
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "processing" | "complete"
  >("pending");

  const handleUnlock = async () => {
    setPaymentStatus("processing");

    // Execute HTS transfer
    const result = await wallet.transferTokens({
      from: wallet.accountId,
      to: agentData.accountId,
      amount: agentData.unlockFee,
      token: "0.0.7218375", // USDH
      memo: `Unlock interaction with ${agentData.name}`,
    });

    setPaymentStatus("complete");
    onPaymentComplete();
  };

  return (
    <AROverlay position="center">
      <UnlockCard>
        <AgentHeader>
          <AgentIcon />
          <AgentName>{agentData.name}</AgentName>
          <VerifiedBadge>🆔 Verified</VerifiedBadge>
          {agentData.mcpEnabled && <MCPBadge>⚡ MCP Enabled</MCPBadge>}
        </AgentHeader>

        <IdentityDisplay>
          <IdentityLabel>Agent DID:</IdentityLabel>
          <IdentityValue>{agentData.identity}</IdentityValue>
          <HashScanLink
            href={`https://hashscan.io/testnet/account/${agentData.identity
              .split(":")
              .pop()}`}
            target="_blank"
          >
            <ExternalLink className="w-3 h-3" />
            View Identity on HashScan
          </HashScanLink>
          <SubText>Format: did:hedera:testnet:0.0.{accountId}</SubText>
        </IdentityDisplay>

        <UnlockSection>
          <UnlockTitle>🔒 Interaction Locked</UnlockTitle>
          <UnlockDescription>
            Pay {agentData.unlockFee} USDH to unlock:
          </UnlockDescription>
          <FeatureList>
            <Feature>💬 Chat Interface</Feature>
            <Feature>🎤 Voice Interaction</Feature>
            <Feature>📹 Video Call</Feature>
          </FeatureList>
        </UnlockSection>

        <PaymentButton
          onClick={handleUnlock}
          disabled={paymentStatus !== "pending"}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold"
        >
          {paymentStatus === "pending" &&
            `💎 Pay ${agentData.unlockFee} USDH to Unlock`}
          {paymentStatus === "processing" && "⏳ Processing Payment..."}
          {paymentStatus === "complete" && "✅ Unlocked! Opening Chat..."}
        </PaymentButton>
      </UnlockCard>
    </AROverlay>
  );
};
```

**Visual Design**:

- **Position**: Center of AR view, modal overlay
- **Dimensions**: 400px × 500px card
- **Color Scheme**:
  - Header: Gradient blue/purple for verified agent
  - Button: Gradient blue-600 to purple-600
  - Locked icon: Gray (#9E9E9E)
  - Unlocked icon: Green (#4CAF50)

**CRITICAL - DID Format & HashScan Link**:

- **DID Format**: Must display full DID: `did:hedera:testnet:0.0.7300950`
- **HashScan Link**: Must link to ACCOUNT page, NOT token page
  - ✅ Correct: `https://hashscan.io/testnet/account/0.0.7300950`
  - ❌ Wrong: `https://hashscan.io/testnet/token/did:hedera:testnet:0.0.7300950`
- **Extract Account ID**: Use `agentData.identity.split(':').pop()` to get `0.0.7300950` from DID

---

### 3. Create Chat Interface (Post-Unlock)

**Component**: `AgentChatInterface.tsx`

**Triggered**: After unlock payment is confirmed

```typescript
interface AgentChatProps {
  agentData: {
    accountId: string;
    name: string;
    type: string;
  };
}

const AgentChatInterface: React.FC<AgentChatProps> = ({ agentData }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = {
      role: "user",
      content: inputText,
      timestamp: Date.now(),
    };
    setMessages([...messages, userMessage]);
    setInputText("");
    setIsProcessing(true);

    // Send to Travel Agent backend
    const response = await fetch("/api/agents/travel/query", {
      method: "POST",
      body: JSON.stringify({
        agentAccountId: agentData.accountId,
        query: inputText,
        origin: "BUD",
        destination: "BCN",
        date: new Date().toISOString().split("T")[0],
      }),
    });

    const data = await response.json();

    // Add agent response
    const agentMessage = {
      role: "agent",
      content: formatTravelResponse(data),
      timestamp: Date.now(),
      data, // Include flight data and package options
    };
    setMessages([...messages, userMessage, agentMessage]);
    setIsProcessing(false);
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <AgentAvatar />
        <AgentName>{agentData.name}</AgentName>
        <UnlockedBadge>✅ Interaction Unlocked</UnlockedBadge>
      </ChatHeader>

      <MessageList>
        {messages.map((msg, index) => (
          <MessageBubble key={index} role={msg.role}>
            <MessageContent>{msg.content}</MessageContent>
            <MessageTimestamp>{formatTime(msg.timestamp)}</MessageTimestamp>
          </MessageBubble>
        ))}
        {isProcessing && (
          <TypingIndicator>Travel Agent is thinking...</TypingIndicator>
        )}
      </MessageList>

      <ChatInput>
        <InputField
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask me to plan your trip..."
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <SendButton
          onClick={handleSendMessage}
          disabled={!inputText.trim() || isProcessing}
        >
          ✈️ Send
        </SendButton>
      </ChatInput>
    </ChatContainer>
  );
};
```

---

### 4. Create Loading Stage UI

**Component**: `LoadingStageComponent.tsx`

**Triggered**: When user sends message in chat (e.g., "plan trip to Barcelona")

**Note**: This appears INSIDE the chat interface as a loading message bubble

```typescript
interface LoadingStageProps {
  stage: "mcp-query" | "a2a-coordination" | "package-assembly";
  currentOperation: string;
  costSoFar: number; // in USDH
}

const LoadingStage: React.FC<LoadingStageProps> = ({
  stage,
  currentOperation,
  costSoFar,
}) => {
  return (
    <AROverlay position="center">
      <LoadingCard>
        <Spinner />
        <LoadingTitle>Planning Your Trip...</LoadingTitle>

        <ProgressSteps>
          <ProgressStep
            active={stage === "mcp-query"}
            complete={stage !== "mcp-query"}
          >
            <StepIcon>✈️</StepIcon>
            <StepLabel>Querying flight data</StepLabel>
            {stage === "mcp-query" && (
              <StepDetails>
                <span>Flightradar24 MCP</span>
                <span className="cost">0.00022 USDH</span>
              </StepDetails>
            )}
          </ProgressStep>

          <ProgressStep
            active={stage === "a2a-coordination"}
            complete={stage === "package-assembly"}
          >
            <StepIcon>🤝</StepIcon>
            <StepLabel>Coordinating with agents</StepLabel>
            {stage === "a2a-coordination" && (
              <StepDetails>
                <span>Bus, Train, Hotel agents</span>
                <span className="cost">A2A queries</span>
              </StepDetails>
            )}
          </ProgressStep>

          <ProgressStep active={stage === "package-assembly"}>
            <StepIcon>📦</StepIcon>
            <StepLabel>Assembling package</StepLabel>
          </ProgressStep>
        </ProgressSteps>

        <CostIndicator>
          <span>MCP query cost:</span>
          <span className="amount">{costSoFar} USDH</span>
        </CostIndicator>
      </LoadingCard>
    </AROverlay>
  );
};
```

**Visual Design**:

- **Position**: Center of AR view, semi-transparent overlay
- **Animation**: Smooth fade-in, gentle pulsing spinner
- **Color Scheme**:
  - Active step: Blue (#2196F3)
  - Complete step: Green (#4CAF50)
  - Pending step: Gray (#9E9E9E)
- **Dimensions**: 400px × 300px card
- **Typography**:
  - Title: 20px bold
  - Step labels: 14px regular
  - Cost: 12px monospace

**State Management**:

```typescript
// In parent AR component
const [queryState, setQueryState] = useState<{
  stage:
    | "idle"
    | "mcp-query"
    | "a2a-coordination"
    | "package-assembly"
    | "complete";
  flightData: FlightData | null;
  packageData: PackageData | null;
  mcpCost: number;
}>({
  stage: "idle",
  flightData: null,
  packageData: null,
  mcpCost: 0.00022, // USDH
});

// When user submits query
const handleUserQuery = async (userInput: string) => {
  setQueryState({ ...queryState, stage: "mcp-query" });

  // Call backend API (Travel Agent)
  const response = await fetch("/api/agents/travel/query", {
    method: "POST",
    body: JSON.stringify({
      query: userInput,
      origin: "BUD",
      destination: "BCN",
      date: "2025-01-15",
    }),
  });

  const data = await response.json();

  // Update state with flight data
  setQueryState({
    stage: "a2a-coordination",
    flightData: data.flights,
    mcpCost: 0.00022,
  });

  // ... continue with A2A coordination
};
```

---

### 5. Create Flight Data Display Component

**Component**: `FlightDataDisplay.tsx`

**Triggered**: After Flightradar24 MCP query completes - displayed IN CHAT as message bubble

**Note**: This is rendered inside the chat interface, not as a separate overlay

```typescript
interface FlightDataDisplayProps {
  flights: FlightOption[];
  mcpCost: number;
  queryTimestamp: string;
}

interface FlightOption {
  flightNumber: string;
  airline: string;
  departure: {
    time: string;
    airport: string;
    terminal: string;
    gate: string;
  };
  arrival: {
    time: string;
    airport: string;
    terminal: string;
    gate: string;
  };
  duration: string;
  aircraft: string;
  price: {
    economy: number;
    business: number | null;
  };
  status: "On Time" | "Delayed" | "Cancelled";
  availableSeats: number;
}

const FlightDataDisplay: React.FC<FlightDataDisplayProps> = ({
  flights,
  mcpCost,
  queryTimestamp,
}) => {
  return (
    <AROverlay position="top">
      <FlightDataCard>
        <CardHeader>
          <HeaderIcon>✈️</HeaderIcon>
          <HeaderTitle>Real-Time Flight Data</HeaderTitle>
          <DataSourceBadge>
            <SourceIcon>⚡</SourceIcon>
            <SourceText>Flightradar24</SourceText>
          </DataSourceBadge>
        </CardHeader>

        <FlightsList>
          {flights.map((flight, index) => (
            <FlightCard key={flight.flightNumber}>
              <FlightHeader>
                <FlightNumber>{flight.flightNumber}</FlightNumber>
                <Airline>{flight.airline}</Airline>
                <StatusBadge status={flight.status}>
                  {flight.status}
                </StatusBadge>
              </FlightHeader>

              <FlightRoute>
                <RoutePoint>
                  <Airport>{flight.departure.airport}</Airport>
                  <Time>{flight.departure.time}</Time>
                  <Gate>Gate {flight.departure.gate}</Gate>
                </RoutePoint>

                <RouteArrow>
                  <ArrowIcon>→</ArrowIcon>
                  <Duration>{flight.duration}</Duration>
                </RouteArrow>

                <RoutePoint>
                  <Airport>{flight.arrival.airport}</Airport>
                  <Time>{flight.arrival.time}</Time>
                  <Gate>Gate {flight.arrival.gate}</Gate>
                </RoutePoint>
              </FlightRoute>

              <FlightDetails>
                <DetailItem>
                  <DetailIcon>🛫</DetailIcon>
                  <DetailText>{flight.aircraft}</DetailText>
                </DetailItem>
                <DetailItem>
                  <DetailIcon>💺</DetailIcon>
                  <DetailText>{flight.availableSeats} seats</DetailText>
                </DetailItem>
              </FlightDetails>

              <PriceSection>
                <PriceLabel>Economy</PriceLabel>
                <Price>€{flight.price.economy}</Price>
                {flight.price.business && (
                  <>
                    <PriceLabel>Business</PriceLabel>
                    <Price>€{flight.price.business}</Price>
                  </>
                )}
              </PriceSection>

              <InfoBadge>
                ℹ️ Price shown for reference only (booking external)
              </InfoBadge>
            </FlightCard>
          ))}
        </FlightsList>

        <DataFooter>
          <FooterInfo>
            <InfoIcon>💳</InfoIcon>
            <InfoText>Data query cost: {mcpCost} USDH</InfoText>
          </FooterInfo>
          <FooterInfo>
            <InfoIcon>⏱️</InfoIcon>
            <InfoText>Updated: {queryTimestamp}</InfoText>
          </FooterInfo>
        </DataFooter>
      </FlightDataCard>
    </AROverlay>
  );
};
```

**Visual Design**:

**Flight Card**:

- **Dimensions**: 380px width, auto height
- **Spacing**: 16px padding, 12px gap between elements
- **Status Badge Colors**:
  - On Time: Green (#4CAF50)
  - Delayed: Orange (#FF9800)
  - Cancelled: Red (#F44336)
- **Typography**:
  - Flight number: 18px bold, uppercase
  - Airline: 14px regular
  - Times: 16px semibold
  - Gates: 12px regular, gray
  - Price: 20px bold, accent color
- **Layout**: Vertical stack with clear visual hierarchy

**Example Screenshot Layout**:

```
┌─────────────────────────────────────────┐
│ ✈️ Real-Time Flight Data    ⚡Flightradar24│
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ FR8024 - Ryanair        🟢 On Time  │ │
│ ├─────────────────────────────────────┤ │
│ │ BUD                →        BCN     │ │
│ │ 16:05              2h 25m   18:30   │ │
│ │ Gate A5                    Gate B12 │ │
│ ├─────────────────────────────────────┤ │
│ │ 🛫 Boeing 737-800   💺 78 seats     │ │
│ ├─────────────────────────────────────┤ │
│ │ Economy: €45        Business: N/A   │ │
│ ├─────────────────────────────────────┤ │
│ │ ℹ️ Price shown for reference only    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ EZY7823 - easyJet       🟢 On Time  │ │
│ │ ... (similar layout) ...            │ │
│ └─────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│ 💳 Data query cost: 0.00022 USDH        │
│ ⏱️ Updated: 2025-01-14 16:01 UTC        │
└─────────────────────────────────────────┘
```

---

### 6. Create Package Comparison Component

**Component**: `PackageComparisonView.tsx`

**Triggered**: After both flight data AND A2A coordination complete - displayed IN CHAT

**Note**: This is rendered inside the chat interface as an interactive message

```typescript
interface PackageComparisonProps {
  flightOptions: FlightOption[];
  alternativePackage: {
    bus: { fee: number; details: string };
    train: { fee: number; details: string };
    hotel: { fee: number; details: string };
    travelAgentFee: number;
    total: number;
  };
  onSelectFlight: () => void; // User chooses to book flight externally
  onSelectPackage: () => void; // User chooses alternative package
}

const PackageComparisonView: React.FC<PackageComparisonProps> = ({
  flightOptions,
  alternativePackage,
  onSelectFlight,
  onSelectPackage,
}) => {
  return (
    <AROverlay position="center">
      <ComparisonContainer>
        <ComparisonHeader>
          <HeaderTitle>Choose Your Travel Option</HeaderTitle>
          <HeaderSubtitle>
            Travel Agent found both flight options and an alternative package
          </HeaderSubtitle>
        </ComparisonHeader>

        <ComparisonGrid>
          {/* LEFT SIDE: Flight Options */}
          <OptionCard type="flight">
            <CardHeader>
              <HeaderIcon>✈️</HeaderIcon>
              <HeaderTitle>Flight Options</HeaderTitle>
              <DataBadge>Live data from Flightradar24</DataBadge>
            </CardHeader>

            <QuickSummary>
              <SummaryItem>
                <Label>Cheapest</Label>
                <Value>
                  €{Math.min(...flightOptions.map((f) => f.price.economy))}
                </Value>
              </SummaryItem>
              <SummaryItem>
                <Label>Fastest</Label>
                <Value>
                  {flightOptions.reduce(
                    (min, f) => (f.duration < min ? f.duration : min),
                    flightOptions[0].duration
                  )}
                </Value>
              </SummaryItem>
              <SummaryItem>
                <Label>Options</Label>
                <Value>{flightOptions.length} flights</Value>
              </SummaryItem>
            </QuickSummary>

            <PricingNote>
              💡 Prices shown are for reference only. You'll need to book
              through airline websites.
            </PricingNote>

            <ActionButton variant="secondary" onClick={onSelectFlight}>
              View Flight Details →
            </ActionButton>
          </OptionCard>

          {/* RIGHT SIDE: Alternative Package */}
          <OptionCard type="package" highlighted>
            <CardHeader>
              <HeaderIcon>📦</HeaderIcon>
              <HeaderTitle>Alternative Package</HeaderTitle>
              <RecommendedBadge>⭐ Recommended</RecommendedBadge>
            </CardHeader>

            <PackageBreakdown>
              <BreakdownItem>
                <ItemIcon>🚌</ItemIcon>
                <ItemLabel>Bus to train station</ItemLabel>
                <ItemPrice>1,000 USDH</ItemPrice>
              </BreakdownItem>

              <BreakdownItem>
                <ItemIcon>🚆</ItemIcon>
                <ItemLabel>Train to Barcelona</ItemLabel>
                <ItemPrice>1,500 USDH</ItemPrice>
              </BreakdownItem>

              <BreakdownItem>
                <ItemIcon>🏨</ItemIcon>
                <ItemLabel>Hotel (2 nights)</ItemLabel>
                <ItemPrice>1,200 USDH</ItemPrice>
              </BreakdownItem>

              <Divider />

              <BreakdownItem subtotal>
                <ItemLabel>Subtotal</ItemLabel>
                <ItemPrice>3,700 USDH</ItemPrice>
              </BreakdownItem>

              <BreakdownItem fee>
                <ItemIcon>🤝</ItemIcon>
                <ItemLabel>Travel Agent Fee</ItemLabel>
                <ItemPrice>625 USDH</ItemPrice>
              </BreakdownItem>

              <Divider bold />

              <BreakdownItem total>
                <ItemLabel>Total Package</ItemLabel>
                <ItemPrice>4,325 USDH</ItemPrice>
              </BreakdownItem>
            </PackageBreakdown>

            <PackageFeatures>
              <FeatureItem>
                <FeatureIcon>✅</FeatureIcon>
                <FeatureText>One payment, all services included</FeatureText>
              </FeatureItem>
              <FeatureItem>
                <FeatureIcon>✅</FeatureIcon>
                <FeatureText>Automated coordination (A2A protocol)</FeatureText>
              </FeatureItem>
              <FeatureItem>
                <FeatureIcon>✅</FeatureIcon>
                <FeatureText>Instant confirmations + NFT tickets</FeatureText>
              </FeatureItem>
            </PackageFeatures>

            <ActionButton variant="primary" onClick={onSelectPackage}>
              Book Package (4,325 USDH)
            </ActionButton>
          </OptionCard>
        </ComparisonGrid>

        <ComparisonFooter>
          <FooterNote>
            💳 MCP data query already paid (0.00022 USDH) - cost included in
            package
          </FooterNote>
        </ComparisonFooter>
      </ComparisonContainer>
    </AROverlay>
  );
};
```

**Visual Design**:

**Layout**:

- **Grid**: 2 columns (50/50 split)
- **Gap**: 24px between cards
- **Dimensions**: Each card 400px width
- **Highlight**: Alternative package has subtle glow border

**Color Scheme**:

- **Flight Card**: Blue theme (#2196F3)
- **Package Card**: Green theme (#4CAF50) with gold accent for "Recommended"
- **Primary Button**: Green (#4CAF50)
- **Secondary Button**: Blue (#2196F3)

**Example Screenshot Layout**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Choose Your Travel Option                          │
│         Travel Agent found both flight options and an alternative       │
├────────────────────────────────┬────────────────────────────────────────┤
│ ✈️ Flight Options               │ 📦 Alternative Package  ⭐ Recommended  │
│ Live data from Flightradar24   │                                        │
├────────────────────────────────┤                                        │
│ Cheapest: €45                  │ 🚌 Bus to train station    1,000 USDH  │
│ Fastest: 2h 25m                │ 🚆 Train to Barcelona      1,500 USDH  │
│ Options: 5 flights             │ 🏨 Hotel (2 nights)        1,200 USDH  │
│                                │ ─────────────────────────────────────  │
│ 💡 Prices shown are for        │ Subtotal                   3,700 USDH  │
│    reference only. You'll      │ 🤝 Travel Agent Fee          625 USDH  │
│    need to book through        │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│    airline websites.           │ Total Package              4,325 USDH  │
│                                │                                        │
│ [View Flight Details →]        │ ✅ One payment, all services included   │
│                                │ ✅ Automated coordination (A2A)         │
│                                │ ✅ Instant confirmations + NFT tickets  │
│                                │                                        │
│                                │ [Book Package (4,325 USDH)]            │
├────────────────────────────────┴────────────────────────────────────────┤
│ 💳 MCP data query already paid (0.00022 USDH) - cost included in package│
└─────────────────────────────────────────────────────────────────────────┘
```

**Interaction Flow**:

1. **User clicks "View Flight Details"**:

   - Minimizes package card
   - Expands flight data display (from Step 3)
   - Shows all 5 flights with full details
   - Button: "← Back to Comparison"

2. **User clicks "Book Package"**:
   - Transitions to payment approval UI
   - Shows Hedera wallet connection prompt
   - Displays transaction preview:
     - From: User wallet
     - To: Travel Agent (0.0.7301930)
     - Amount: 4,325 USDH
     - Fee: ~0.001 HBAR
   - Approve button triggers Standard HTS transfer

---

### 7. Backend API Integration

**Endpoint**: `/api/agents/travel/query`

**Request**:

```json
{
  "agentAccountId": "0.0.7301930",
  "query": "Weekend trip to Barcelona",
  "origin": "BUD",
  "destination": "BCN",
  "date": "2025-01-15",
  "passengers": 1
}
```

**Response** (after x402 MCP query + A2A coordination):

```json
{
  "queryId": "uuid-12345",
  "timestamp": "2025-01-14T16:03:00Z",
  "mcpCost": 0.00022,
  "flightData": {
    "source": "flightradar24",
    "queryTimestamp": "2025-01-14T16:01:00Z",
    "flights": [
      {
        "flightNumber": "FR8024",
        "airline": "Ryanair",
        "departure": {
          "time": "16:05",
          "airport": "BUD",
          "terminal": "2B",
          "gate": "A5"
        },
        "arrival": {
          "time": "18:30",
          "airport": "BCN",
          "terminal": "2",
          "gate": "B12"
        },
        "duration": "2h 25m",
        "aircraft": "Boeing 737-800",
        "price": {
          "economy": 45,
          "business": null
        },
        "status": "On Time",
        "availableSeats": 78
      }
      // ... 4 more flights
    ]
  },
  "alternativePackage": {
    "bus": {
      "agentAccountId": "0.0.7299550",
      "fee": 1000,
      "details": "Bus to train station (1h 15m)",
      "ticketType": "NFT"
    },
    "train": {
      "agentAccountId": "0.0.7300963",
      "fee": 1500,
      "details": "Train to Barcelona (18:30 departure, Seat 3A)",
      "ticketType": "NFT"
    },
    "hotel": {
      "agentAccountId": "0.0.7300950",
      "fee": 1200,
      "details": "Hotel Room 512 (2 nights, Fri-Sun)",
      "ticketType": "NFT"
    },
    "travelAgentFee": 625,
    "total": 4325,
    "currency": "USDH"
  },
  "recommendedOption": "package",
  "reasoning": "Package saves ~€40 vs cheapest flight, includes ground transport + hotel"
}
```

**Backend Flow** (Travel Agent server):

```javascript
// In tools/travel-agent-template/index.js
async _handleTripPlanning(request) {
  const { origin, destination, date } = request;

  // STEP 1: Query Flightradar24 via x402 (16:01)
  const flightData = await this.flightradarService.queryFlights({
    origin,
    destination,
    date,
    maxResults: 5,
    includeAlternatives: true
  });

  // STEP 2: Query sub-agents via A2A (16:02)
  const busQuote = await this.a2aClient.queryAgent('0.0.7299550', {
    method: 'getQuote',
    params: { route: 'airport_to_station', date }
  });

  const trainQuote = await this.a2aClient.queryAgent('0.0.7300963', {
    method: 'getQuote',
    params: { origin, destination, date, time: '18:30' }
  });

  const hotelQuote = await this.a2aClient.queryAgent('0.0.7300950', {
    method: 'getQuote',
    params: { checkIn: date, nights: 2 }
  });

  // STEP 3: Assemble package (16:03)
  const alternativePackage = {
    bus: { fee: busQuote.price, details: busQuote.description },
    train: { fee: trainQuote.price, details: trainQuote.description },
    hotel: { fee: hotelQuote.price, details: hotelQuote.description },
    travelAgentFee: 625, // Static for demo, or calculated: subtotal * 0.05
    total: busQuote.price + trainQuote.price + hotelQuote.price + 625
  };

  // STEP 4: Return comparison data
  return {
    flightData,
    alternativePackage,
    mcpCost: flightData.payment.cost_usdh,
    recommendedOption: 'package' // Or use ML to decide
  };
}
```

---

### 8. Payment Flow After User Selection

**If user chooses "Book Package"**:

```typescript
// In AR Viewer component
const handlePackagePayment = async () => {
  // 1. Show payment preview
  setPaymentState({ stage: "preview" });

  // 2. Connect Hedera wallet (if not connected)
  if (!wallet.connected) {
    await wallet.connect();
  }

  // 3. Build transaction
  const tx = {
    from: wallet.accountId,
    to: "0.0.7301930", // Travel Agent
    amount: 4325, // Total package cost
    token: "0.0.7218375", // USDH
    memo: "Travel package: BUD->BCN (Bus+Train+Hotel)",
  };

  // 4. Request user approval
  setPaymentState({ stage: "approval", tx });

  // 5. Execute Standard HTS transfer
  const result = await wallet.transferTokens(tx);

  // 6. Show confirmation
  setPaymentState({
    stage: "confirmed",
    transactionId: result.transactionId,
    receipt: result.receipt,
  });

  // 7. Listen for A2A events (Travel Agent auto-splitting payment)
  subscribeToAgentEvents("0.0.7301930", (event) => {
    if (event.type === "PAYMENT_SPLIT_COMPLETE") {
      // Show NFT tickets being minted
      displayTicketNFTs(event.tickets);
    }
  });
};
```

**Payment Preview UI**:

```typescript
<PaymentPreview>
  <PreviewHeader>Confirm Payment</PreviewHeader>

  <TransactionSummary>
    <SummaryRow>
      <Label>From</Label>
      <Value>{wallet.accountId}</Value>
    </SummaryRow>
    <SummaryRow>
      <Label>To</Label>
      <Value>0.0.7301930 (Travel Agent)</Value>
    </SummaryRow>
    <SummaryRow>
      <Label>Amount</Label>
      <Value>4,325 USDH</Value>
    </SummaryRow>
    <SummaryRow>
      <Label>Network Fee</Label>
      <Value>~0.001 HBAR</Value>
    </SummaryRow>
  </TransactionSummary>

  <PackageIncluded>
    <IncludedTitle>What's Included:</IncludedTitle>
    <IncludedList>
      <IncludedItem>🚌 Bus ticket NFT (1,000 USDH)</IncludedItem>
      <IncludedItem>🚆 Train ticket NFT (1,500 USDH)</IncludedItem>
      <IncludedItem>🏨 Hotel room key NFT (1,200 USDH)</IncludedItem>
      <IncludedItem>🤝 Coordination service (625 USDH)</IncludedItem>
    </IncludedList>
  </PackageIncluded>

  <AutoSplitNotice>
    ℹ️ Travel Agent will automatically distribute payments to sub-agents
  </AutoSplitNotice>

  <ActionButtons>
    <Button variant="secondary" onClick={onCancel}>
      Cancel
    </Button>
    <Button variant="primary" onClick={onApprove}>
      Approve Payment
    </Button>
  </ActionButtons>
</PaymentPreview>
```

---

### 9. Post-Payment Confirmation UI

**After successful payment**:

```typescript
<ConfirmationScreen>
  <SuccessIcon>✅</SuccessIcon>
  <SuccessTitle>Package Booked Successfully!</SuccessTitle>

  <TransactionDetails>
    <DetailRow>
      <Label>Transaction ID</Label>
      <Value copyable>{transactionId}</Value>
    </DetailRow>
    <DetailRow>
      <Label>Status</Label>
      <Value>Confirmed on Hedera Testnet</Value>
    </DetailRow>
    <DetailRow>
      <Label>View on HashScan</Label>
      <Link href={`https://hashscan.io/testnet/transaction/${transactionId}`}>
        Open →
      </Link>
    </DetailRow>
  </TransactionDetails>

  <TicketSection>
    <SectionTitle>Your NFT Tickets</SectionTitle>
    <TicketGrid>
      <TicketCard>
        <TicketIcon>🚌</TicketIcon>
        <TicketType>Bus Ticket</TicketType>
        <TicketDetails>Platform A, 17:15</TicketDetails>
        <NFTBadge>NFT #1234</NFTBadge>
      </TicketCard>

      <TicketCard>
        <TicketIcon>🚆</TicketIcon>
        <TicketType>Train Ticket</TicketType>
        <TicketDetails>Seat 3A, 18:30</TicketDetails>
        <NFTBadge>NFT #1235</NFTBadge>
      </TicketCard>

      <TicketCard>
        <TicketIcon>🏨</TicketIcon>
        <TicketType>Hotel Key</TicketType>
        <TicketDetails>Room 512, Code #7829</TicketDetails>
        <NFTBadge>NFT #1236</NFTBadge>
      </TicketCard>
    </TicketGrid>
  </TicketSection>

  <ItineraryPreview>
    <PreviewTitle>Your Itinerary</PreviewTitle>
    <Timeline>
      <TimelineItem>
        <Time>Friday 17:15</Time>
        <Event>🚌 Bus pickup (Platform A)</Event>
      </TimelineItem>
      <TimelineItem>
        <Time>Friday 18:30</Time>
        <Event>🚆 Train departure (Seat 3A)</Event>
      </TimelineItem>
      <TimelineItem>
        <Time>Friday 22:30</Time>
        <Event>🏨 Hotel check-in (Room 512)</Event>
      </TimelineItem>
    </Timeline>
  </ItineraryPreview>

  <ActionButtons>
    <Button variant="primary" onClick={onViewFullItinerary}>
      View Full Itinerary
    </Button>
    <Button variant="secondary" onClick={onClose}>
      Done
    </Button>
  </ActionButtons>
</ConfirmationScreen>
```

---

## Summary of UI Components to Create

### New Components:

1. **AgentCard (Updated)** - Shows agent when AR object is clicked (before unlock)
2. **UnlockPayment** - Payment UI to unlock chat/voice/video (100 USDH)
3. **AgentChatInterface** - Main chat interface (unlocked after payment)
4. **MCPBadge** - Shows MCP integration on agent card
5. **LoadingStage** - Three-stage progress indicator (MCP → A2A → Assembly) in chat
6. **FlightDataDisplay** - Shows Flightradar24 results in chat message
7. **PackageComparisonView** - Side-by-side comparison in chat message
8. **PaymentPreview** - Transaction approval UI for package booking
9. **ConfirmationScreen** - Post-payment success screen with NFT tickets

### Updated Components:

1. **ARScene** - Add click detection on AR objects, unlock payment flow, chat state management
2. **WalletConnection** - Handle Hedera HTS transfers (unlock fee + package payment)
3. **Agent3DModel** - Add click handlers to trigger unlock payment UI

### Backend Integration:

1. **API Endpoint**: `/api/agents/travel/query` (POST)
2. **WebSocket**: Real-time A2A event streaming (payment splits, ticket minting)
3. **Travel Agent Server**: `tools/travel-agent-template/index.js` (already created)

---

## File Changes Required

### 1. `src/components/AgentCard.tsx`

```typescript
// Add new props
interface AgentCardProps {
  // ... existing props
  mcpEnabled?: boolean;
  mcpServices?: string[];
}

// Add MCP badge rendering
{
  mcpEnabled && <MCPBadge services={mcpServices} />;
}
```

### 2. `src/components/ARScene.tsx`

```typescript
// Add state management
const [queryFlow, setQueryFlow] = useState<QueryFlowState>({
  stage: "idle",
  flightData: null,
  packageData: null,
  mcpCost: 0,
});

// Add query handler
const handleTravelQuery = async (params) => {
  // Call backend API
  // Update state through stages
  // Show appropriate UI components
};
```

### 3. Create new files:

- `src/components/travel/MCPBadge.tsx`
- `src/components/travel/LoadingStage.tsx`
- `src/components/travel/FlightDataDisplay.tsx`
- `src/components/travel/PackageComparison.tsx`
- `src/components/travel/PaymentPreview.tsx`
- `src/components/travel/ConfirmationScreen.tsx`

### 4. `src/api/travelAgent.ts`

```typescript
export async function queryTravelAgent(params: {
  agentAccountId: string;
  origin: string;
  destination: string;
  date: string;
}) {
  const response = await fetch("/api/agents/travel/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  return await response.json();
}
```

---

## Testing Checklist

### Unit Tests:

- [ ] MCPBadge renders correctly with different services
- [ ] LoadingStage transitions through all stages
- [ ] FlightDataDisplay handles empty/partial data
- [ ] PackageComparison calculates totals correctly
- [ ] PaymentPreview validates amounts before approval

### Integration Tests:

- [ ] Full query flow (MCP → A2A → Package Assembly)
- [ ] Payment approval triggers HTS transfer
- [ ] A2A events received after payment
- [ ] NFT tickets display after minting

### E2E Tests:

- [ ] User clicks Travel Agent AR object in camera view
- [ ] Agent card appears with unlock payment option
- [ ] User pays 100 USDH unlock fee successfully
- [ ] Chat interface opens after payment
- [ ] User sends trip planning message
- [ ] Loading indicators show during MCP and A2A queries
- [ ] Flight data displays correctly in chat
- [ ] Package comparison is accurate in chat
- [ ] Package payment executes successfully
- [ ] Confirmation screen shows all 3 NFT tickets
- [ ] Travel Agent auto-splits payment to 3 sub-agents

---

## Deployment Steps

1. **Deploy Travel Agent 2** (Testing):

   - Account: New Hedera account
   - Fee: 100 USDH (lower for testing)
   - MCP: Flightradar24 ✅ Enabled
   - Initial Balance: 10 USDH (for MCP queries)

2. **Update AR Viewer**:

   - Add new components
   - Update API integration
   - Test with Travel Agent 2

3. **Deploy Travel Agent 3** (Production):

   - Account: New Hedera account
   - Fee: 625 USDH
   - MCP: Flightradar24 ✅ Enabled
   - Initial Balance: 50 USDH

4. **Update AgentSphere Dashboard**:
   - Add "Enable MCP" checkbox
   - Add Flightradar24 option
   - Update deployment form

---

## Cost Breakdown for Users

### Example Trip (BUD → BCN Weekend)

**Option 1: Flight (External Booking)**

- Flight ticket: €45-120 (via airline website)
- Ground transport: €20-50 (self-arranged)
- Hotel: €100-200 (self-booked)
- **Total**: €165-370
- **User effort**: 3 separate bookings, manual coordination

**Option 2: Alternative Package (AgentSphere)**

- Bus: 1,000 USDH (~€1.00)
- Train: 1,500 USDH (~€1.50)
- Hotel: 1,200 USDH (~€1.20)
- Travel Agent Fee: 625 USDH (~€0.63)
- **Total**: 4,325 USDH (~€4.33)
- **User effort**: 1 payment, automated coordination

**Why users choose package despite seeing flight data**:

- ✅ Extreme convenience (1 transaction vs. 3 bookings)
- ✅ Automated coordination (A2A protocol)
- ✅ Instant confirmations + NFT tickets
- ✅ Transparent pricing (no hidden fees)
- ✅ Demo pricing (production would be higher but still competitive)

---

## Next Steps

1. **Create UI components** (priority order):

   - MCPBadge
   - LoadingStage
   - FlightDataDisplay
   - PackageComparison
   - PaymentPreview
   - ConfirmationScreen

2. **Update backend**:

   - Implement `/api/agents/travel/query` endpoint
   - Connect to Travel Agent server (tools/travel-agent-template)
   - Add WebSocket for A2A events

3. **Test x402 flow**:

   - Deploy Travel Agent 2 locally
   - Test Flightradar24 MCP queries
   - Verify payment flow

4. **Deploy to production**:
   - Travel Agent 3 on Hedera Testnet
   - Update AgentSphere dashboard
   - Enable for public testing

---

**Status**: Ready for implementation ✅  
**Dependencies**: Travel Agent template (already created), USDH token (0.0.7218375), Thirdweb credentials (in .env)  
**Estimated Development Time**: 4-6 hours (UI components + backend integration)

# AR Viewer - Travel Agent Complete Interaction Flow

## Executive Summary

This document describes the complete user interaction flow for the Travel Agent in the AR Viewer, including:

1. **Click-based AR interaction** (not QR scanning)
2. **Unlock payment** (100 USDH fee to access chat/voice/video)
3. **Agent identity verification** with HashScan link (fixed)
4. **Chat interface** with Travel Agent
5. **x402 MCP integration** with Flightradar24 (real-time flight data)
6. **Multi-agent coordination** (Travel Agent + 3 sub-agents: Bus, Train, Hotel)
7. **Package booking** and NFT ticket delivery

**Critical Updates Applied:**

- ✅ HashScan links point to `/account/` not `/token/`
- ✅ DID format displayed correctly: `did:hedera:testnet:0.0.7301930`
- ✅ Click interaction model (not scan-to-unlock)
- ✅ x402 micropayment for MCP queries (0.00022 USDH per flight query)

## User Journey

### Timeline Overview

```
16:00:00 - User opens AR Viewer camera
16:00:05 - User sees Travel Agent as 3D AR object in view
16:00:10 - User clicks/taps on Travel Agent AR object
16:00:15 - Agent card appears with identity, MCP badge, unlock payment option
16:00:30 - User pays 100 USDH unlock fee
16:00:35 - Payment confirmed → Chat interface opens
16:01:00 - User types: "Plan trip to Barcelona for this weekend"
16:01:05 - Travel Agent shows loading (3 stages: MCP query, A2A coordination, assembly)
16:01:10 - Stage 1: Querying Flightradar24 MCP (cost: 0.00022 USDH)
16:02:00 - Stage 2: Coordinating with Bus, Train, Hotel agents (A2A protocol)
16:03:00 - Stage 3: Assembling package options
16:03:15 - Travel Agent presents flight data + alternative package in chat
16:04:00 - User selects: "Book Alternative Package"
16:04:10 - Payment preview appears (4,325 USDH breakdown)
16:05:00 - User approves payment
16:05:15 - Payment confirmed on Hedera
16:06:00 - Travel Agent auto-splits payment to 3 sub-agents
16:07:00 - User receives 3 NFT tickets (Bus #1234, Train #1235, Hotel #1236)
16:07:30 - Confirmation screen shows itinerary and tickets
```

---

## Implementation Details

### Stage 1: AR Object Click Detection

**When**: User opens AR camera view  
**What**: Travel Agent appears as 3D model in AR space

**Implementation**:

```typescript
// In ARScene.tsx or equivalent
interface Agent3DModel {
  accountId: string;
  name: string;
  type: "travel_agent" | "bus_agent" | "train_agent" | "hotel_agent";
  position: { x: number; y: number; z: number };
  model: string; // Path to 3D model
  unlockFee: number;
  identity: string; // DID
  mcpEnabled: boolean;
  mcpServices?: string[];
}

const ARScene: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent3DModel | null>(null);
  const [unlockStatus, setUnlockStatus] = useState<"locked" | "unlocked">(
    "locked"
  );

  const handleAgentClick = (agent: Agent3DModel) => {
    setSelectedAgent(agent);
    // Show agent card with unlock payment option
  };

  return (
    <Canvas>
      {/* Camera and AR setup */}
      {agents.map((agent) => (
        <Agent3DObject
          key={agent.accountId}
          model={agent.model}
          position={agent.position}
          onClick={() => handleAgentClick(agent)}
        />
      ))}

      {/* UI overlays */}
      {selectedAgent && unlockStatus === "locked" && (
        <UnlockPaymentOverlay
          agent={selectedAgent}
          onUnlock={() => setUnlockStatus("unlocked")}
        />
      )}

      {selectedAgent && unlockStatus === "unlocked" && (
        <ChatInterface agent={selectedAgent} />
      )}
    </Canvas>
  );
};
```

**Visual Requirements**:

- 3D model should have highlight effect on hover
- Click should trigger smooth transition to agent card
- Model should remain visible but slightly dimmed when card is open

---

### Stage 2: Agent Card Display (Before Unlock)

**When**: User clicks Travel Agent AR object  
**What**: Modal card shows agent info and unlock payment option

**Component**: `AgentCardUnlocked.tsx`

```typescript
interface AgentCardProps {
  agent: {
    accountId: string;
    name: string;
    type: string;
    unlockFee: number;
    identity: string;
    mcpEnabled: boolean;
    mcpServices?: string[];
  };
  onUnlock: () => void;
  onClose: () => void;
}

const AgentCardUnlocked: React.FC<AgentCardProps> = ({
  agent,
  onUnlock,
  onClose,
}) => {
  return (
    <Modal className="ar-agent-card">
      {/* Header */}
      <CardHeader>
        <AgentIcon type={agent.type} />
        <AgentName>{agent.name}</AgentName>
        <CloseButton onClick={onClose}>✕</CloseButton>
      </CardHeader>
      {/* Identity Verification */}
      <IdentitySection>
        <VerifiedBadge>🆔 Verified Identity</VerifiedBadge>
        <IdentityLabel>Agent DID:</IdentityLabel>
        <IdentityValue>{agent.identity}</IdentityValue>
        <IdentityNote>Format: did:hedera:testnet:0.0.{accountId}</IdentityNote>
        <HashScanLink
          href={`https://hashscan.io/testnet/account/${agent.accountId}`}
          target="_blank"
        >
          <ExternalLink className="w-3 h-3" />
          View Account on HashScan
        </HashScanLink>
      </IdentitySection> {/* MCP Integration Badge */}
      {agent.mcpEnabled && (
        <MCPSection>
          <MCPBadge>⚡ x402 MCP Integration</MCPBadge>
          <MCPDescription>
            This agent uses Flightradar24 for real-time flight data via x402
            micropayments
          </MCPDescription>
          <MCPServices>
            {agent.mcpServices?.map((service) => (
              <ServiceBadge key={service}>✈️ {service}</ServiceBadge>
            ))}
          </MCPServices>
          <MCPCostNote>💳 Per-query cost: 0.00022 USDH</MCPCostNote>
        </MCPSection>
      )}
      {/* Unlock Payment Section */}
      <UnlockSection>
        <LockIcon>🔒</LockIcon>
        <UnlockTitle>Interaction Locked</UnlockTitle>
        <UnlockDescription>
          Pay {agent.unlockFee} USDH to unlock:
        </UnlockDescription>
        <FeatureList>
          <Feature>💬 Chat Interface</Feature>
          <Feature>🎤 Voice Interaction</Feature>
          <Feature>📹 Video Call</Feature>
        </FeatureList>
        <UnlockButton onClick={onUnlock}>
          💎 Pay {agent.unlockFee} USDH to Unlock
        </UnlockButton>
      </UnlockSection>
      {/* Agent Stats */}
      <StatsSection>
        <Stat>
          <StatLabel>Network:</StatLabel>
          <StatValue>Hedera Testnet</StatValue>
        </Stat>
        <Stat>
          <StatLabel>Account:</StatLabel>
          <StatValue>{agent.accountId}</StatValue>
        </Stat>
      </StatsSection>
    </Modal>
  );
};
```

**Styling**:

```css
.ar-agent-card {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  max-height: 80vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  color: white;
  z-index: 1000;
}

.unlock-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(90deg, #4caf50 0%, #45a049 100%);
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: transform 0.2s;
}

.unlock-button:hover {
  transform: scale(1.05);
}
```

---

### Stage 3: Unlock Payment Processing

**When**: User clicks "Pay {fee} USDH to Unlock" button  
**What**: Execute Hedera HTS transfer, show progress, unlock chat on success

**Component**: `UnlockPaymentProcessor.tsx`

```typescript
const UnlockPaymentProcessor: React.FC = ({ agent, onSuccess }) => {
  const [status, setStatus] = useState<
    "pending" | "connecting" | "approving" | "confirming" | "complete"
  >("pending");
  const [txHash, setTxHash] = useState<string>("");

  const processUnlock = async () => {
    try {
      // Step 1: Connect wallet
      setStatus("connecting");
      if (!wallet.connected) {
        await wallet.connect();
      }

      // Step 2: Build transaction
      const tx = {
        from: wallet.accountId,
        to: agent.accountId,
        amount: agent.unlockFee,
        token: "0.0.7218375", // USDH
        memo: `Unlock interaction: ${agent.name}`,
      };

      // Step 3: Request approval
      setStatus("approving");
      const result = await wallet.transferTokens(tx);

      // Step 4: Wait for confirmation
      setStatus("confirming");
      setTxHash(result.transactionId);

      // Step 5: Poll for confirmation
      await waitForConfirmation(result.transactionId);

      // Step 6: Success - unlock chat
      setStatus("complete");
      setTimeout(() => onSuccess(), 1000);
    } catch (error) {
      console.error("Unlock payment failed:", error);
      setStatus("pending");
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <PaymentOverlay>
      {status === "pending" && (
        <PendingState>
          <Title>Unlock Interaction</Title>
          <Description>
            Pay {agent.unlockFee} USDH to {agent.name}
          </Description>
          <TransactionDetails>
            <Detail>
              <Label>From:</Label>
              <Value>{wallet.accountId || "Not connected"}</Value>
            </Detail>
            <Detail>
              <Label>To:</Label>
              <Value>{agent.accountId}</Value>
            </Detail>
            <Detail>
              <Label>Amount:</Label>
              <Value>{agent.unlockFee} USDH</Value>
            </Detail>
            <Detail>
              <Label>Network Fee:</Label>
              <Value>~0.001 HBAR</Value>
            </Detail>
          </TransactionDetails>
          <ActionButton onClick={processUnlock}>Approve Payment</ActionButton>
        </PendingState>
      )}

      {status === "connecting" && (
        <ProcessingState>
          <Spinner />
          <StatusText>Connecting wallet...</StatusText>
        </ProcessingState>
      )}

      {status === "approving" && (
        <ProcessingState>
          <Spinner />
          <StatusText>Waiting for approval...</StatusText>
          <SubText>Please approve the transaction in your wallet</SubText>
        </ProcessingState>
      )}

      {status === "confirming" && (
        <ProcessingState>
          <Spinner />
          <StatusText>Confirming payment...</StatusText>
          <TxHashLink
            href={`https://hashscan.io/testnet/transaction/${txHash}`}
            target="_blank"
          >
            View on HashScan
          </TxHashLink>
        </ProcessingState>
      )}

      {status === "complete" && (
        <SuccessState>
          <SuccessIcon>✅</SuccessIcon>
          <StatusText>Payment Confirmed!</StatusText>
          <SubText>Opening chat interface...</SubText>
        </SuccessState>
      )}
    </PaymentOverlay>
  );
};
```

---

### Stage 4: Chat Interface (Post-Unlock)

**When**: Unlock payment is confirmed  
**What**: Full chat interface with message history, input, and typing indicators

**Component**: `TravelAgentChat.tsx`

```typescript
interface Message {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
  timestamp: number;
  data?: any; // For flight data, package options, etc.
}

const TravelAgentChat: React.FC<{ agent: Agent3DModel }> = ({ agent }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "system",
      content: `✅ Interaction unlocked! You can now chat with ${agent.name}.`,
      timestamp: Date.now(),
    },
    {
      id: "2",
      role: "agent",
      content: `Hello! I'm ${agent.name}, your AI travel coordinator. I can help you plan trips using real-time flight data and coordinate with Bus, Train, and Hotel agents. Where would you like to go?`,
      timestamp: Date.now() + 1000,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<
    "mcp" | "a2a" | "assembly" | null
  >(null);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsProcessing(true);

    // Show loading stages
    setProcessingStage("mcp");

    try {
      // Call Travel Agent backend
      const response = await fetch("/api/agents/travel/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentAccountId: agent.accountId,
          query: inputText,
          origin: "BUD",
          destination: "BCN",
          date: new Date().toISOString().split("T")[0],
        }),
      });

      const data = await response.json();

      // Update to A2A stage
      setProcessingStage("a2a");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update to assembly stage
      setProcessingStage("assembly");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add agent response with data
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: formatTravelResponse(data),
        timestamp: Date.now(),
        data, // Include flight options and package data
      };
      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error("Failed to query agent:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "system",
        content: "❌ Failed to process your request. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setProcessingStage(null);
    }
  };

  return (
    <ChatContainer>
      {/* Chat Header */}
      <ChatHeader>
        <AgentAvatar src={`/avatars/${agent.type}.png`} />
        <HeaderInfo>
          <AgentName>{agent.name}</AgentName>
          <AgentStatus>
            <OnlineIndicator />
            Online • 🆔 Verified
            {agent.mcpEnabled && <MCPBadge>⚡ MCP</MCPBadge>}
          </AgentStatus>
        </HeaderInfo>
        <HeaderActions>
          <IconButton title="Voice Call">🎤</IconButton>
          <IconButton title="Video Call">📹</IconButton>
          <IconButton title="Close">✕</IconButton>
        </HeaderActions>
      </ChatHeader>

      {/* Message List */}
      <MessageList>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} role={msg.role}>
            <MessageContent>
              {msg.content}
              {msg.data && msg.data.flightData && (
                <FlightDataCard data={msg.data.flightData} />
              )}
              {msg.data && msg.data.alternativePackage && (
                <PackageComparisonCard
                  flights={msg.data.flightData.flights}
                  package={msg.data.alternativePackage}
                  onSelectPackage={() => handlePackageBooking(msg.data)}
                />
              )}
            </MessageContent>
            <MessageTime>{formatTime(msg.timestamp)}</MessageTime>
          </MessageBubble>
        ))}

        {/* Loading Indicator */}
        {isProcessing && (
          <LoadingMessage>
            <LoadingStages>
              <Stage
                active={processingStage === "mcp"}
                complete={processingStage !== "mcp"}
              >
                ✈️ Querying flight data
                {processingStage === "mcp" && (
                  <StageNote>(Flightradar24 MCP: 0.00022 USDH)</StageNote>
                )}
              </Stage>
              <Stage
                active={processingStage === "a2a"}
                complete={processingStage === "assembly"}
              >
                🤝 Coordinating with agents
                {processingStage === "a2a" && (
                  <StageNote>(Bus, Train, Hotel agents)</StageNote>
                )}
              </Stage>
              <Stage active={processingStage === "assembly"}>
                📦 Assembling package
              </Stage>
            </LoadingStages>
          </LoadingMessage>
        )}
      </MessageList>

      {/* Chat Input */}
      <ChatInput>
        <InputField
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) =>
            e.key === "Enter" && !e.shiftKey && handleSendMessage()
          }
          placeholder="Ask me to plan your trip..."
          disabled={isProcessing}
        />
        <SendButton
          onClick={handleSendMessage}
          disabled={!inputText.trim() || isProcessing}
        >
          ✈️
        </SendButton>
      </ChatInput>
    </ChatContainer>
  );
};

// Helper function to format agent response
const formatTravelResponse = (data: any): string => {
  const cheapestFlight = Math.min(
    ...data.flightData.flights.map((f: any) => f.price.economy)
  );
  const flightCount = data.flightData.flights.length;

  return `I found ${flightCount} flight options and coordinated with our partner agents for an alternative package:\n\n✈️ **Flight Options**: €${cheapestFlight} - €${Math.max(
    ...data.flightData.flights.map((f: any) => f.price.economy)
  )}\n🚌🚆🏨 **Complete Package**: ${
    data.alternativePackage.total
  } USDH\n\nSee details below and let me know which option you prefer!`;
};
```

**Styling**:

```css
.chat-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  height: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
}

.message-bubble {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  margin: 8px;
  word-wrap: break-word;
}

.message-bubble.user {
  align-self: flex-end;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-bubble.agent {
  align-self: flex-start;
  background: #f0f0f0;
  color: #333;
}

.message-bubble.system {
  align-self: center;
  background: #e3f2fd;
  color: #1976d2;
  font-size: 14px;
  font-style: italic;
}
```

---

### Stage 5: Flight Data Display in Chat

**When**: Travel Agent completes Flightradar24 MCP query  
**What**: Inline card showing flight options inside chat message

**Component**: `FlightDataCard.tsx` (embedded in chat message)

```typescript
interface FlightDataCardProps {
  data: {
    source: string;
    queryTimestamp: string;
    flights: FlightOption[];
  };
}

const FlightDataCard: React.FC<FlightDataCardProps> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <InlineCard className="flight-data-card">
      <CardHeader>
        <HeaderIcon>✈️</HeaderIcon>
        <HeaderTitle>Real-Time Flight Data</HeaderTitle>
        <SourceBadge>⚡ {data.source}</SourceBadge>
      </CardHeader>

      {/* Summary View */}
      <FlightSummary>
        <SummaryItem>
          <Label>Cheapest:</Label>
          <Value>
            €{Math.min(...data.flights.map((f) => f.price.economy))}
          </Value>
        </SummaryItem>
        <SummaryItem>
          <Label>Fastest:</Label>
          <Value>
            {data.flights.reduce(
              (min, f) => (f.duration < min ? f.duration : min),
              data.flights[0].duration
            )}
          </Value>
        </SummaryItem>
        <SummaryItem>
          <Label>Options:</Label>
          <Value>{data.flights.length} flights</Value>
        </SummaryItem>
      </FlightSummary>

      {/* Expandable Flight List */}
      {expanded && (
        <FlightList>
          {data.flights.map((flight) => (
            <FlightItem key={flight.flightNumber}>
              <FlightHeader>
                <FlightNumber>{flight.flightNumber}</FlightNumber>
                <Airline>{flight.airline}</Airline>
                <StatusBadge status={flight.status}>
                  {flight.status}
                </StatusBadge>
              </FlightHeader>
              <FlightRoute>
                <Airport>
                  {flight.departure.airport} {flight.departure.time}
                </Airport>
                <Arrow>→</Arrow>
                <Airport>
                  {flight.arrival.airport} {flight.arrival.time}
                </Airport>
              </FlightRoute>
              <FlightPrice>Economy: €{flight.price.economy}</FlightPrice>
            </FlightItem>
          ))}
        </FlightList>
      )}

      <ExpandButton onClick={() => setExpanded(!expanded)}>
        {expanded ? "▲ Show Less" : "▼ Show All Flights"}
      </ExpandButton>

      <CardFooter>
        <FooterNote>
          💳 Query cost: 0.00022 USDH (paid via x402 micropayment)
        </FooterNote>
        <FooterNote>
          ℹ️ Prices for reference only - external booking required
        </FooterNote>
      </CardFooter>
    </InlineCard>
  );
};
```

---

### Stage 6: Package Comparison in Chat

**When**: Travel Agent completes A2A coordination with sub-agents  
**What**: Interactive comparison card showing package breakdown and booking button

**Component**: `PackageComparisonCard.tsx` (embedded in chat message)

```typescript
interface PackageComparisonCardProps {
  flights: FlightOption[];
  package: {
    bus: { agentAccountId: string; fee: number; details: string };
    train: { agentAccountId: string; fee: number; details: string };
    hotel: { agentAccountId: string; fee: number; details: string };
    travelAgentFee: number;
    total: number;
  };
  onSelectPackage: () => void;
}

const PackageComparisonCard: React.FC<PackageComparisonCardProps> = ({
  flights,
  package: pkg,
  onSelectPackage,
}) => {
  return (
    <InlineCard className="package-comparison">
      <CardHeader>
        <HeaderIcon>📦</HeaderIcon>
        <HeaderTitle>Alternative Package</HeaderTitle>
        <RecommendedBadge>⭐ Recommended</RecommendedBadge>
      </CardHeader>

      {/* Package Breakdown */}
      <PackageBreakdown>
        <BreakdownRow>
          <Icon>🚌</Icon>
          <Description>Bus to train station</Description>
          <Amount>{pkg.bus.fee} USDH</Amount>
        </BreakdownRow>
        <BreakdownRow>
          <Icon>🚆</Icon>
          <Description>Train to Barcelona</Description>
          <Amount>{pkg.train.fee} USDH</Amount>
        </BreakdownRow>
        <BreakdownRow>
          <Icon>🏨</Icon>
          <Description>Hotel (2 nights)</Description>
          <Amount>{pkg.hotel.fee} USDH</Amount>
        </BreakdownRow>

        <Divider />

        <BreakdownRow className="subtotal">
          <Label>Subtotal</Label>
          <Amount>{pkg.bus.fee + pkg.train.fee + pkg.hotel.fee} USDH</Amount>
        </BreakdownRow>
        <BreakdownRow className="fee">
          <Icon>🤝</Icon>
          <Description>Travel Agent Fee</Description>
          <Amount>{pkg.travelAgentFee} USDH</Amount>
        </BreakdownRow>

        <Divider bold />

        <BreakdownRow className="total">
          <Label>Total Package</Label>
          <Amount>{pkg.total} USDH</Amount>
        </BreakdownRow>
      </PackageBreakdown>

      {/* Features */}
      <FeatureList>
        <Feature>✅ One payment, all services included</Feature>
        <Feature>✅ Automated coordination (A2A protocol)</Feature>
        <Feature>✅ Instant confirmations + NFT tickets</Feature>
      </FeatureList>

      {/* Action Button */}
      <BookButton onClick={onSelectPackage}>
        💎 Book Package ({pkg.total} USDH)
      </BookButton>

      <CardFooter>
        <ComparisonNote>
          💡 Package saves ~€
          {Math.round(
            Math.min(...flights.map((f) => f.price.economy)) * 0.9
          )} vs cheapest flight + separate bookings
        </ComparisonNote>
      </CardFooter>
    </InlineCard>
  );
};
```

---

### Stage 7: Package Payment Flow

**When**: User clicks "Book Package" button  
**What**: Payment preview, approval, confirmation, NFT delivery

**Component**: `PackagePaymentFlow.tsx`

```typescript
const PackagePaymentFlow: React.FC = ({
  packageData,
  travelAgentAccountId,
}) => {
  const [stage, setStage] = useState<
    "preview" | "approving" | "confirming" | "splitting" | "complete"
  >("preview");
  const [txHash, setTxHash] = useState("");
  const [nftTickets, setNftTickets] = useState<NFTTicket[]>([]);

  const handleApprove = async () => {
    setStage("approving");

    // Execute payment
    const result = await wallet.transferTokens({
      from: wallet.accountId,
      to: travelAgentAccountId,
      amount: packageData.total,
      token: "0.0.7218375", // USDH
      memo: "Travel package: BUD->BCN",
    });

    setTxHash(result.transactionId);
    setStage("confirming");

    // Wait for confirmation
    await waitForConfirmation(result.transactionId);

    setStage("splitting");

    // Listen for A2A events (payment splitting and NFT minting)
    subscribeToAgentEvents(travelAgentAccountId, (event) => {
      if (event.type === "PAYMENT_SPLIT_COMPLETE") {
        setStage("complete");
        setNftTickets(event.tickets);
      }
    });
  };

  return (
    <Modal>
      {stage === "preview" && (
        <PreviewScreen>
          <Title>Confirm Package Payment</Title>
          <TransactionSummary>
            <Row>
              <Label>From:</Label>
              <Value>{wallet.accountId}</Value>
            </Row>
            <Row>
              <Label>To:</Label>
              <Value>{travelAgentAccountId} (Travel Agent)</Value>
            </Row>
            <Row>
              <Label>Amount:</Label>
              <Value>{packageData.total} USDH</Value>
            </Row>
            <Row>
              <Label>Network Fee:</Label>
              <Value>~0.001 HBAR</Value>
            </Row>
          </TransactionSummary>

          <IncludedServices>
            <Title>What's Included:</Title>
            <Service>🚌 Bus ticket NFT ({packageData.bus.fee} USDH)</Service>
            <Service>
              🚆 Train ticket NFT ({packageData.train.fee} USDH)
            </Service>
            <Service>
              🏨 Hotel room key NFT ({packageData.hotel.fee} USDH)
            </Service>
            <Service>
              🤝 Coordination service ({packageData.travelAgentFee} USDH)
            </Service>
          </IncludedServices>

          <Notice>
            ℹ️ Travel Agent will automatically distribute payments to sub-agents
          </Notice>

          <ApproveButton onClick={handleApprove}>Approve Payment</ApproveButton>
        </PreviewScreen>
      )}

      {stage === "approving" && (
        <ProcessingScreen>
          <Spinner />
          <Title>Waiting for approval...</Title>
          <SubText>Please approve the transaction in your wallet</SubText>
        </ProcessingScreen>
      )}

      {stage === "confirming" && (
        <ProcessingScreen>
          <Spinner />
          <Title>Confirming payment...</Title>
          <TxLink
            href={`https://hashscan.io/testnet/transaction/${txHash}`}
            target="_blank"
          >
            View on HashScan
          </TxLink>
        </ProcessingScreen>
      )}

      {stage === "splitting" && (
        <ProcessingScreen>
          <Spinner />
          <Title>Travel Agent is coordinating...</Title>
          <SubText>Distributing payments to Bus, Train, Hotel agents</SubText>
          <SubText>Minting NFT tickets...</SubText>
        </ProcessingScreen>
      )}

      {stage === "complete" && (
        <ConfirmationScreen>
          <SuccessIcon>✅</SuccessIcon>
          <Title>Package Booked Successfully!</Title>

          <NFTTickets>
            <SectionTitle>Your NFT Tickets</SectionTitle>
            {nftTickets.map((ticket) => (
              <TicketCard key={ticket.id}>
                <TicketIcon>{ticket.icon}</TicketIcon>
                <TicketType>{ticket.type}</TicketType>
                <TicketDetails>{ticket.details}</TicketDetails>
                <NFTBadge>NFT #{ticket.id}</NFTBadge>
              </TicketCard>
            ))}
          </NFTTickets>

          <Itinerary>
            <SectionTitle>Your Itinerary</SectionTitle>
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
          </Itinerary>

          <CloseButton onClick={onClose}>Done</CloseButton>
        </ConfirmationScreen>
      )}
    </Modal>
  );
};
```

---

## Payment Breakdown Summary

### Payment Flow Chart

```
USER WALLET
    │
    ├─> 100 USDH ──────────────> TRAVEL AGENT (Unlock fee)
    │                                 │
    │                                 │ [Chat unlocked]
    │                                 │
    │                                 ▼
    │                            [MCP Query to Flightradar24]
    │                                 │
    │                                 ├─> 0.00022 USDH ──> Flightradar24 (x402)
    │                                 │
    │                                 ▼
    │                            [A2A Coordination]
    │                                 │
    │                                 ├─> Query Bus Agent
    │                                 ├─> Query Train Agent
    │                                 ├─> Query Hotel Agent
    │                                 │
    │                                 ▼
    │                            [Present Package]
    │
    └─> 4,325 USDH ────────────> TRAVEL AGENT (Package payment)
                                     │
                                     ├─> 1,000 USDH ──> BUS AGENT (0.0.7299550)
                                     │        │
                                     │        └─> Mint Bus Ticket NFT #1234
                                     │
                                     ├─> 1,500 USDH ──> TRAIN AGENT (0.0.7300963)
                                     │        │
                                     │        └─> Mint Train Ticket NFT #1235
                                     │
                                     ├─> 1,200 USDH ──> HOTEL AGENT (0.0.7300950)
                                     │        │
                                     │        └─> Mint Hotel Key NFT #1236
                                     │
                                     └─> 625 USDH (kept as fee)

USER receives:
    - Bus Ticket NFT #1234
    - Train Ticket NFT #1235
    - Hotel Room Key NFT #1236
```

---

## Agent Accounts Reference

| Agent Type   | Account ID  | Unlock Fee | Service Fee | MCP Enabled            | x402 Cost    |
| ------------ | ----------- | ---------- | ----------- | ---------------------- | ------------ |
| Travel Agent | 0.0.7301930 | 100 USDH   | 625 USDH    | ✅ Yes (Flightradar24) | 0.00022 USDH |
| Bus Agent    | 0.0.7299550 | 10 USDH    | 1,000 USDH  | ❌ No                  | -            |
| Train Agent  | 0.0.7300963 | 10 USDH    | 1,500 USDH  | ❌ No                  | -            |
| Hotel Agent  | 0.0.7300950 | 10 USDH    | 1,200 USDH  | ❌ No                  | -            |

**USDH Token**: `0.0.7218375`  
**Network**: Hedera Testnet  
**HashScan URLs**:

- Travel Agent: https://hashscan.io/testnet/account/0.0.7301930
- Bus Agent: https://hashscan.io/testnet/account/0.0.7299550
- Train Agent: https://hashscan.io/testnet/account/0.0.7300963
- Hotel Agent: https://hashscan.io/testnet/account/0.0.7300950
- USDH Token: https://hashscan.io/testnet/token/0.0.7218375

---

## Testing Checklist

### Pre-Deployment Tests

- [ ] 3D AR models load correctly
- [ ] Click detection works on AR objects (mouse + touch)
- [ ] Agent card appears with correct data
- [ ] Identity verification badge shows DID
- [ ] HashScan link opens correct token page
- [ ] MCP badge shows for Travel Agent only
- [ ] Unlock payment button displays correct fee

### Unlock Payment Tests

- [ ] Wallet connection triggers correctly
- [ ] Transaction preview shows correct amounts
- [ ] Payment executes successfully
- [ ] Confirmation polling works
- [ ] Chat interface opens after payment
- [ ] System message confirms unlock

### Chat Interface Tests

- [ ] Welcome message appears
- [ ] User can type and send messages
- [ ] Loading stages display correctly
- [ ] MCP query stage shows cost (0.00022 USDH)
- [ ] A2A coordination stage shows sub-agents
- [ ] Assembly stage completes
- [ ] Flight data card renders inline
- [ ] Package comparison card renders inline
- [ ] All data displays correctly

### Package Booking Tests

- [ ] Book button triggers payment flow
- [ ] Payment preview shows breakdown
- [ ] Payment executes to Travel Agent
- [ ] Confirmation polling works
- [ ] A2A event listener receives updates
- [ ] Payment splitting completes
- [ ] 3 NFT tickets mint successfully
- [ ] Confirmation screen shows all tickets
- [ ] Itinerary displays correctly

---

## API Endpoints Required

### 1. Query Travel Agent

**Endpoint**: `POST /api/agents/travel/query`

**Request**:

```json
{
  "agentAccountId": "0.0.7301930",
  "query": "Plan trip to Barcelona for this weekend",
  "origin": "BUD",
  "destination": "BCN",
  "date": "2025-01-15"
}
```

**Response**:

```json
{
  "queryId": "uuid-12345",
  "timestamp": "2025-01-14T16:03:00Z",
  "mcpCost": 0.00022,
  "flightData": { ... },
  "alternativePackage": { ... },
  "recommendedOption": "package"
}
```

### 2. A2A Event Stream

**Endpoint**: `WebSocket wss://api.agentsphere.com/agents/events`

**Subscribe**:

```json
{
  "action": "subscribe",
  "agentAccountId": "0.0.7301930",
  "eventTypes": ["PAYMENT_SPLIT_COMPLETE", "NFT_MINTED"]
}
```

**Event**:

```json
{
  "type": "PAYMENT_SPLIT_COMPLETE",
  "agentAccountId": "0.0.7301930",
  "timestamp": "2025-01-14T16:06:00Z",
  "tickets": [
    {
      "id": "1234",
      "type": "Bus Ticket",
      "icon": "🚌",
      "details": "Platform A, 17:15"
    },
    {
      "id": "1235",
      "type": "Train Ticket",
      "icon": "🚆",
      "details": "Seat 3A, 18:30"
    },
    {
      "id": "1236",
      "type": "Hotel Key",
      "icon": "🏨",
      "details": "Room 512, Code #7829"
    }
  ]
}
```

---

## Next Steps

1. **Implement AR object click detection** in AR Viewer
2. **Create unlock payment UI** and payment processor
3. **Build chat interface** with message history
4. **Integrate flight data and package cards** into chat
5. **Connect to Travel Agent backend** API
6. **Test complete flow** end-to-end
7. **Deploy Travel Agent 2** for testing
8. **Test with real USDH payments** on Hedera Testnet

---

**Status**: Ready for AR Viewer implementation ✅  
**Priority**: High - Core user experience feature  
**Estimated Development Time**: 8-12 hours  
**Dependencies**: Travel Agent backend (already created), USDH token (0.0.7218375), Hedera wallet integration

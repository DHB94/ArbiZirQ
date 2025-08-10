# ArbiZirQ — Flow Diagrams & Architecture

> **Comprehensive visual documentation of ArbiZirQ's cross-chain arbitrage execution flows, system architecture, and integration patterns.**

## 📊 System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[Next.js UI]
        DASH[Dashboard]
        EXEC[Execute Dialog]
        WALLET[Wallet Connection]
    end
    
    subgraph "API Layer"
        SCAN[/api/scan]
        SIM[/api/simulate]
        EXECUTE[/api/execute]
        HEALTH[/api/health]
    end
    
    subgraph "Service Layer"
        DEX[DEX Indexer]
        ARB[Arbitrage Executor]
        RISK[Risk Manager]
        CALC[Fee Calculator]
    end
    
    subgraph "External Integrations"
        GUD[GUD Trading Engine]
        BITTE[Bitte Agents]
        ZIRCUIT[Zircuit L2]
        BRIDGE[Cross-chain Bridges]
    end
    
    subgraph "Blockchain Networks"
        ETH[Ethereum]
        POLY[Polygon]
        ARB[Arbitrum]
        OPT[Optimism]
        ZIR[Zircuit]
    end
    
    UI --> SCAN
    UI --> SIM
    UI --> EXECUTE
    UI --> HEALTH
    
    SCAN --> DEX
    SIM --> ARB
    EXECUTE --> ARB
    
    ARB --> GUD
    ARB --> BITTE
    ARB --> ZIRCUIT
    
    GUD --> BRIDGE
    BRIDGE --> ETH
    BRIDGE --> POLY
    BRIDGE --> ARB
    BRIDGE --> OPT
    BRIDGE --> ZIR
```

## 🔄 Core Arbitrage Flow

### 1. Market Scanning Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant API
    participant DEX
    participant Chains
    
    User->>UI: Enable Scanning
    UI->>API: POST /api/scan
    API->>DEX: Fetch Price Data
    DEX->>Chains: Query Multiple DEXs
    Chains-->>DEX: Price Quotes
    DEX-->>API: Aggregated Prices
    API->>API: Calculate Arbitrage
    API->>API: Apply Risk Filters
    API-->>UI: Opportunities List
    UI-->>User: Display Results
    
    Note over UI,API: Polling every 5 seconds
    Note over API,DEX: Real-time price discovery
    Note over API: Profit > $10 filter
```

### 2. Simulation Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant API
    participant GUD
    participant Risk
    
    User->>UI: Click "Simulate"
    UI->>API: POST /api/simulate
    API->>GUD: Get Routing Quote
    GUD-->>API: Route + Fees
    API->>Risk: Validate Guardrails
    Risk-->>API: Risk Assessment
    API->>API: Calculate Net PnL
    API-->>UI: Simulation Results
    UI-->>User: Show Fee Breakdown
    
    Note over API,GUD: Quote valid for 30s
    Note over Risk: Slippage + Liquidity checks
    Note over API: Include all fees
```

### 3. Execution Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant Wallet
    participant API
    participant GUD
    participant Zircuit
    
    User->>UI: Click "Execute"
    UI->>Wallet: Check Connection
    Wallet-->>UI: User Address
    UI->>API: POST /api/execute
    API->>GUD: Submit Trade Order
    GUD->>GUD: Execute Buy Leg
    GUD->>GUD: Bridge Assets
    GUD->>GUD: Execute Sell Leg
    GUD->>Zircuit: Settle on L2
    Zircuit-->>GUD: Settlement Confirmation
    GUD-->>API: Execution Result
    API-->>UI: Trade Status
    UI-->>User: Success/Failure
    
    Note over GUD: Atomic execution
    Note over Zircuit: Final settlement
    Note over UI: Real-time updates
```

## 🌐 Cross-Chain Trading Architecture

### Multi-Chain Integration Pattern

```mermaid
graph LR
    subgraph "Source Chain (e.g., Ethereum)"
        SDEX[Source DEX]
        STOKEN[Token A]
        SBRIDGE[Bridge Out]
    end
    
    subgraph "GUD Routing Engine"
        ROUTE[Route Calculation]
        EXEC[Execution Coordinator]
        MONITOR[Status Monitor]
    end
    
    subgraph "Destination Chain (e.g., Polygon)"
        DBRIDGE[Bridge In]
        DTOKEN[Token B]
        DDEX[Destination DEX]
    end
    
    subgraph "Settlement Chain (Zircuit)"
        SETTLE[Settlement]
        PROFIT[Profit Calculation]
        FEES[Fee Distribution]
    end
    
    STOKEN --> SDEX
    SDEX --> SBRIDGE
    SBRIDGE --> ROUTE
    ROUTE --> EXEC
    EXEC --> DBRIDGE
    DBRIDGE --> DTOKEN
    DTOKEN --> DDEX
    DDEX --> SETTLE
    SETTLE --> PROFIT
    PROFIT --> FEES
    
    MONITOR --> EXEC
    MONITOR --> SETTLE
```

## 🛡️ Risk Management Flow

### Guardrail System

```mermaid
flowchart TD
    START[New Opportunity] --> FRESH{Quote Fresh?}
    FRESH -->|No| REJECT[Reject - Stale Quote]
    FRESH -->|Yes| PROFIT{Profit > Min?}
    PROFIT -->|No| REJECT2[Reject - Low Profit]
    PROFIT -->|Yes| SLIP{Slippage < Max?}
    SLIP -->|No| REJECT3[Reject - High Slippage]
    SLIP -->|Yes| LIQ{Liquidity OK?}
    LIQ -->|No| REJECT4[Reject - Low Liquidity]
    LIQ -->|Yes| GAS{Gas < Limit?}
    GAS -->|No| REJECT5[Reject - High Gas]
    GAS -->|Yes| APPROVE[Approve for Execution]
    
    style APPROVE fill:#90EE90
    style REJECT fill:#FFB6C1
    style REJECT2 fill:#FFB6C1
    style REJECT3 fill:#FFB6C1
    style REJECT4 fill:#FFB6C1
    style REJECT5 fill:#FFB6C1
```

### Risk Assessment Matrix

```mermaid
graph TB
    subgraph "Market Risk"
        VOLAT[Volatility Check]
        CORR[Correlation Analysis]
        TREND[Trend Assessment]
    end
    
    subgraph "Technical Risk"
        CONT[Contract Risk]
        BRIDGE_R[Bridge Risk]
        GAS_R[Gas Risk]
    end
    
    subgraph "Liquidity Risk"
        DEPTH[Market Depth]
        IMPACT[Price Impact]
        TIME[Time Risk]
    end
    
    subgraph "Risk Score"
        CALC[Calculate Score]
        THRESH[Apply Threshold]
        DECISION[Approve/Reject]
    end
    
    VOLAT --> CALC
    CORR --> CALC
    TREND --> CALC
    CONT --> CALC
    BRIDGE_R --> CALC
    GAS_R --> CALC
    DEPTH --> CALC
    IMPACT --> CALC
    TIME --> CALC
    
    CALC --> THRESH
    THRESH --> DECISION
```

## 💰 Fee Calculation Flow

### Comprehensive Fee Model

```mermaid
flowchart LR
    subgraph "Trade Execution Fees"
        SWAP1[Source DEX Fee]
        SWAP2[Dest DEX Fee]
        BRIDGE[Bridge Fee]
        GAS1[Source Gas]
        GAS2[Dest Gas]
    end
    
    subgraph "Service Fees"
        GUD_FEE[GUD Routing Fee]
        BITTE_FEE[Bitte Agent Fee]
        PLATFORM[Platform Fee]
    end
    
    subgraph "Dynamic Costs"
        SLIPPAGE[Slippage Cost]
        MEV[MEV Protection]
        PRIORITY[Priority Gas]
    end
    
    subgraph "Total Cost"
        SUM[Sum All Fees]
        PROFIT[Calculate Net PnL]
        THRESHOLD[Check Threshold]
    end
    
    SWAP1 --> SUM
    SWAP2 --> SUM
    BRIDGE --> SUM
    GAS1 --> SUM
    GAS2 --> SUM
    GUD_FEE --> SUM
    BITTE_FEE --> SUM
    PLATFORM --> SUM
    SLIPPAGE --> SUM
    MEV --> SUM
    PRIORITY --> SUM
    
    SUM --> PROFIT
    PROFIT --> THRESHOLD
```

## 🔧 Configuration Management

### Settings Flow

```mermaid
graph TD
    subgraph "User Settings"
        MIN_PROFIT[Min Profit: $10]
        MAX_SLIP[Max Slippage: 1%]
        POLL_INT[Polling: 5s]
        CHAINS[Enabled Chains]
        PAIRS[Token Pairs]
    end
    
    subgraph "System Defaults"
        DEF_PROFIT[Default: $10]
        DEF_SLIP[Default: 100 bps]
        DEF_POLL[Default: 5000ms]
        DEF_CHAINS[Default: All]
        DEF_PAIRS[Default: Major pairs]
    end
    
    subgraph "Validation"
        RANGE[Range Check]
        LOGIC[Logic Check]
        SAFETY[Safety Check]
    end
    
    subgraph "Application"
        STORE[Store Config]
        APPLY[Apply Settings]
        MONITOR[Monitor Changes]
    end
    
    MIN_PROFIT --> RANGE
    MAX_SLIP --> RANGE
    POLL_INT --> RANGE
    CHAINS --> LOGIC
    PAIRS --> LOGIC
    
    RANGE --> SAFETY
    LOGIC --> SAFETY
    SAFETY --> STORE
    STORE --> APPLY
    APPLY --> MONITOR
    
    DEF_PROFIT -.-> MIN_PROFIT
    DEF_SLIP -.-> MAX_SLIP
    DEF_POLL -.-> POLL_INT
    DEF_CHAINS -.-> CHAINS
    DEF_PAIRS -.-> PAIRS
```

## 📱 User Interface Flow

### Dashboard Interaction Model

```mermaid
stateDiagram-v2
    [*] --> Loading
    Loading --> Connected: Wallet Connected
    Loading --> Disconnected: No Wallet
    
    Disconnected --> Connecting: Click Connect
    Connecting --> Connected: Success
    Connecting --> Disconnected: Failed
    
    Connected --> Scanning: Auto-scan Enabled
    Connected --> Manual: Auto-scan Disabled
    
    Scanning --> OpportunityFound: New Opportunity
    Scanning --> Scanning: Continue Polling
    
    OpportunityFound --> Simulating: Click Simulate
    Simulating --> SimulationResult: Complete
    SimulationResult --> Executing: Click Execute
    SimulationResult --> OpportunityFound: Back
    
    Executing --> Success: Trade Complete
    Executing --> Failed: Trade Failed
    Success --> Connected: Reset
    Failed --> Connected: Reset
    
    Manual --> Scanning: Enable Auto-scan
```

### Component Hierarchy

```mermaid
graph TB
    subgraph "App Shell"
        HEADER[Header + Navigation]
        MAIN[Main Content]
        FOOTER[Footer]
    end
    
    subgraph "Dashboard Components"
        SETTINGS[Settings Panel]
        STATUS[Status Indicators]
        OPPS[Opportunities List]
        DETAILS[Opportunity Details]
    end
    
    subgraph "Execution Components"
        PREVIEW[Preview Dialog]
        CONFIRM[Confirmation Dialog]
        PROGRESS[Progress Tracker]
        RESULT[Result Display]
    end
    
    subgraph "Utility Components"
        WALLET_BTN[Wallet Button]
        THEME[Theme Toggle]
        ALERTS[Alert System]
        LOADING[Loading States]
    end
    
    HEADER --> WALLET_BTN
    HEADER --> THEME
    HEADER --> SETTINGS
    
    MAIN --> STATUS
    MAIN --> OPPS
    MAIN --> DETAILS
    
    OPPS --> PREVIEW
    PREVIEW --> CONFIRM
    CONFIRM --> PROGRESS
    PROGRESS --> RESULT
    
    MAIN --> ALERTS
    MAIN --> LOADING
```

## 🔄 State Management Flow

### Application State

```mermaid
graph LR
    subgraph "Global State"
        CONFIG[Configuration]
        WALLET[Wallet State]
        MARKET[Market Data]
        TRADES[Trade History]
    end
    
    subgraph "Component State"
        DIALOG[Dialog State]
        FORM[Form State]
        UI[UI State]
        CACHE[Cache State]
    end
    
    subgraph "External State"
        CHAIN[Blockchain State]
        API[API State]
        WS[WebSocket State]
    end
    
    subgraph "State Updates"
        ACTIONS[User Actions]
        EVENTS[External Events]
        TIMERS[Timer Events]
    end
    
    ACTIONS --> CONFIG
    ACTIONS --> DIALOG
    ACTIONS --> FORM
    
    EVENTS --> WALLET
    EVENTS --> MARKET
    EVENTS --> CHAIN
    
    TIMERS --> MARKET
    TIMERS --> API
    TIMERS --> CACHE
    
    CONFIG --> UI
    WALLET --> UI
    MARKET --> UI
    TRADES --> UI
```

## 🚀 Deployment Architecture

### Production Infrastructure

```mermaid
graph TB
    subgraph "CDN Layer"
        CF[Cloudflare]
        STATIC[Static Assets]
        CACHE[Edge Cache]
    end
    
    subgraph "Application Layer"
        VERCEL[Vercel Edge Functions]
        API_ROUTES[API Routes]
        SSR[Server-Side Rendering]
    end
    
    subgraph "External Services"
        ZIRCUIT_RPC[Zircuit RPC]
        GUD_API[GUD API]
        BITTE_API[Bitte API]
        INFURA[Infura/Alchemy]
    end
    
    subgraph "Monitoring"
        VERCEL_ANALYTICS[Vercel Analytics]
        ERROR_TRACKING[Error Tracking]
        PERF_MONITORING[Performance Monitoring]
    end
    
    subgraph "Security"
        RATE_LIMITING[Rate Limiting]
        API_AUTH[API Authentication]
        CORS[CORS Policy]
    end
    
    CF --> VERCEL
    STATIC --> CF
    CACHE --> CF
    
    VERCEL --> API_ROUTES
    VERCEL --> SSR
    
    API_ROUTES --> ZIRCUIT_RPC
    API_ROUTES --> GUD_API
    API_ROUTES --> BITTE_API
    API_ROUTES --> INFURA
    
    VERCEL --> VERCEL_ANALYTICS
    VERCEL --> ERROR_TRACKING
    VERCEL --> PERF_MONITORING
    
    API_ROUTES --> RATE_LIMITING
    API_ROUTES --> API_AUTH
    API_ROUTES --> CORS
```

## 🔍 Error Handling Flow

### Error Recovery System

```mermaid
flowchart TD
    ERROR[Error Detected] --> TYPE{Error Type?}
    
    TYPE -->|Network| RETRY[Retry with Backoff]
    TYPE -->|API| FALLBACK[Use Fallback Service]
    TYPE -->|Validation| USER_MSG[Show User Message]
    TYPE -->|Execution| ROLLBACK[Attempt Rollback]
    
    RETRY --> SUCCESS{Success?}
    SUCCESS -->|Yes| CONTINUE[Continue Operation]
    SUCCESS -->|No| FALLBACK
    
    FALLBACK --> FALLBACK_OK{Fallback OK?}
    FALLBACK_OK -->|Yes| CONTINUE
    FALLBACK_OK -->|No| USER_MSG
    
    ROLLBACK --> ROLLBACK_OK{Rollback OK?}
    ROLLBACK_OK -->|Yes| USER_MSG
    ROLLBACK_OK -->|No| CRITICAL[Critical Error]
    
    USER_MSG --> LOG[Log Error]
    CRITICAL --> LOG
    CONTINUE --> LOG
    
    LOG --> METRICS[Update Metrics]
    METRICS --> ALERT{Alert Needed?}
    ALERT -->|Yes| NOTIFY[Notify Team]
    ALERT -->|No| END[End]
    NOTIFY --> END
    
    style CRITICAL fill:#FF6B6B
    style CONTINUE fill:#4ECDC4
    style END fill:#95E1D3
```

## 📊 Performance Optimization

### Optimization Strategy

```mermaid
graph TB
    subgraph "Frontend Optimization"
        CODE_SPLIT[Code Splitting]
        LAZY_LOAD[Lazy Loading]
        BUNDLE_OPT[Bundle Optimization]
        IMAGE_OPT[Image Optimization]
    end
    
    subgraph "Backend Optimization"
        API_CACHE[API Caching]
        DB_INDEX[Database Indexing]
        CONN_POOL[Connection Pooling]
        RATE_LIMIT[Rate Limiting]
    end
    
    subgraph "Network Optimization"
        CDN[CDN Distribution]
        COMPRESSION[Gzip Compression]
        HTTP2[HTTP/2]
        PRELOAD[Resource Preloading]
    end
    
    subgraph "Monitoring"
        METRICS[Performance Metrics]
        PROFILING[Code Profiling]
        ANALYTICS[User Analytics]
        ALERTS[Performance Alerts]
    end
    
    CODE_SPLIT --> METRICS
    LAZY_LOAD --> METRICS
    BUNDLE_OPT --> METRICS
    IMAGE_OPT --> METRICS
    
    API_CACHE --> PROFILING
    DB_INDEX --> PROFILING
    CONN_POOL --> PROFILING
    RATE_LIMIT --> PROFILING
    
    CDN --> ANALYTICS
    COMPRESSION --> ANALYTICS
    HTTP2 --> ANALYTICS
    PRELOAD --> ANALYTICS
    
    METRICS --> ALERTS
    PROFILING --> ALERTS
    ANALYTICS --> ALERTS
```

## 🔐 Security Architecture

### Security Layers

```mermaid
graph TB
    subgraph "Application Security"
        INPUT_VAL[Input Validation]
        OUTPUT_ESC[Output Escaping]
        CSRF[CSRF Protection]
        XSS[XSS Prevention]
    end
    
    subgraph "API Security"
        AUTH[API Authentication]
        RATE_LIM[Rate Limiting]
        CORS_POL[CORS Policy]
        REQ_VAL[Request Validation]
    end
    
    subgraph "Infrastructure Security"
        HTTPS[HTTPS Enforcement]
        HSTS[HSTS Headers]
        CSP[Content Security Policy]
        HEADERS[Security Headers]
    end
    
    subgraph "Blockchain Security"
        WALLET_SEC[Wallet Security]
        TX_VAL[Transaction Validation]
        SIGN_VER[Signature Verification]
        NONCE[Nonce Management]
    end
    
    subgraph "Monitoring Security"
        THREAT_DET[Threat Detection]
        ANOMALY[Anomaly Detection]
        AUDIT[Audit Logging]
        INCIDENT[Incident Response]
    end
    
    INPUT_VAL --> AUTH
    OUTPUT_ESC --> AUTH
    CSRF --> AUTH
    XSS --> AUTH
    
    AUTH --> HTTPS
    RATE_LIM --> HTTPS
    CORS_POL --> HTTPS
    REQ_VAL --> HTTPS
    
    HTTPS --> WALLET_SEC
    HSTS --> WALLET_SEC
    CSP --> WALLET_SEC
    HEADERS --> WALLET_SEC
    
    WALLET_SEC --> THREAT_DET
    TX_VAL --> THREAT_DET
    SIGN_VER --> THREAT_DET
    NONCE --> THREAT_DET
    
    THREAT_DET --> AUDIT
    ANOMALY --> AUDIT
    AUDIT --> INCIDENT
```

---

## 📋 Flow Summary

This document provides comprehensive visual documentation of ArbiZirQ's architecture and operational flows. Each diagram represents a critical aspect of the system:

1. **System Architecture**: High-level component organization
2. **Core Flows**: Market scanning, simulation, and execution
3. **Cross-Chain Integration**: Multi-blockchain trading patterns
4. **Risk Management**: Guardrail systems and safety checks
5. **Fee Calculation**: Comprehensive cost modeling
6. **Configuration**: Settings and parameter management
7. **User Interface**: Component hierarchy and state management
8. **Deployment**: Production infrastructure and security
9. **Error Handling**: Recovery and resilience patterns
10. **Performance**: Optimization strategies and monitoring

These flows ensure ArbiZirQ operates as a robust, secure, and efficient cross-chain arbitrage platform while maintaining excellent user experience and system reliability.

---

**📝 Note**: All diagrams use Mermaid syntax for easy rendering in GitHub, GitLab, and documentation platforms that support Mermaid visualization.

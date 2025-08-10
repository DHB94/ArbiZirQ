# ArbiZirQ — Flow Diagrams & Architecture

> **Essential visual documentation of ArbiZirQ's core arbitrage execution flows and system architecture.**

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
        SCAN_API[API Scan]
        SIM_API[API Simulate]
        EXECUTE_API[API Execute]
        HEALTH_API[API Health]
    end
    
    subgraph "Service Layer"
        DEX[DEX Indexer]
        ARB_SVC[Arbitrage Executor]
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
        ARB_NET[Arbitrum]
        OPT[Optimism]
        ZIR[Zircuit]
    end
    
    UI --> SCAN_API
    UI --> SIM_API
    UI --> EXECUTE_API
    UI --> HEALTH_API
    
    SCAN_API --> DEX
    SIM_API --> ARB_SVC
    EXECUTE_API --> ARB_SVC
    
    ARB_SVC --> GUD
    ARB_SVC --> BITTE
    ARB_SVC --> ZIRCUIT
    
    GUD --> BRIDGE
    BRIDGE --> ETH
    BRIDGE --> POLY
    BRIDGE --> ARB_NET
    BRIDGE --> OPT
    BRIDGE --> ZIR
```

## 🔄 Core Arbitrage Execution Flow

### Complete User Journey: Scan → Simulate → Execute

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant API
    participant GUD
    participant Zircuit
    
    Note over User,Zircuit: 1. Market Scanning Phase
    User->>UI: Enable Auto-scan
    UI->>API: POST /api/scan
    API->>API: Check Multiple DEXs
    API->>API: Calculate Arbitrage Opportunities
    API-->>UI: Return Profitable Opportunities
    UI-->>User: Display Opportunities List
    
    Note over User,Zircuit: 2. Simulation Phase
    User->>UI: Click "Simulate" on Opportunity
    UI->>API: POST /api/simulate
    API->>GUD: Get Quote + Routing
    GUD-->>API: Route Details + Fees
    API->>API: Calculate Net PnL
    API-->>UI: Simulation Results
    UI-->>User: Show Fee Breakdown & Profit
    
    Note over User,Zircuit: 3. Execution Phase
    User->>UI: Click "Execute" (if profitable)
    UI->>UI: Check Wallet Connection
    UI->>API: POST /api/execute (with userAddress)
    API->>GUD: Submit Real Trade Order
    GUD->>GUD: Execute Cross-chain Arbitrage
    GUD->>Zircuit: Settle Final Results
    Zircuit-->>GUD: Settlement Confirmation
    GUD-->>API: Trade Completion Status
    API-->>UI: Success/Failure Result
    UI-->>User: Display Final Results
    
    Note over User,Zircuit: Real-time updates throughout
```

## 🌐 Cross-Chain Trading Architecture

### Multi-Chain Arbitrage Execution Pattern

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

## 🛡️ Risk Management & Guardrail System

### Safety Checks Before Execution

```mermaid
flowchart TD
    START[New Arbitrage Opportunity] --> FRESH{Quote Fresh?<br/>< 30 seconds}
    FRESH -->|No| REJECT[❌ Reject - Stale Quote]
    FRESH -->|Yes| PROFIT{Profit > $10?}
    PROFIT -->|No| REJECT2[❌ Reject - Low Profit]
    PROFIT -->|Yes| SLIP{Slippage < 1%?}
    SLIP -->|No| REJECT3[❌ Reject - High Slippage]
    SLIP -->|Yes| LIQ{Sufficient Liquidity?}
    LIQ -->|No| REJECT4[❌ Reject - Low Liquidity]
    LIQ -->|Yes| GAS{Gas Cost Reasonable?}
    GAS -->|No| REJECT5[❌ Reject - High Gas]
    GAS -->|Yes| WALLET{Wallet Connected?}
    WALLET -->|No| REJECT6[❌ Reject - No Wallet]
    WALLET -->|Yes| APPROVE[✅ Approve for Execution]
    
    style APPROVE fill:#90EE90
    style REJECT fill:#FFB6C1
    style REJECT2 fill:#FFB6C1
    style REJECT3 fill:#FFB6C1
    style REJECT4 fill:#FFB6C1
    style REJECT5 fill:#FFB6C1
    style REJECT6 fill:#FFB6C1
```

---

## � Flow Summary

This document provides the 3 most essential visual flows for understanding ArbiZirQ:

1. **System Architecture**: High-level component organization showing how frontend, API, services, and external integrations work together
2. **Core Arbitrage Flow**: Complete user journey from market scanning through simulation to final execution
3. **Risk Management**: Safety guardrails that protect users from unprofitable or risky trades

These flows ensure ArbiZirQ operates as a robust, secure, and efficient cross-chain arbitrage platform while maintaining excellent user experience and system reliability.

---

**📝 Note**: All diagrams use Mermaid syntax for easy rendering in GitHub, GitLab, and documentation platforms that support Mermaid visualization.

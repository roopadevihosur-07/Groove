# GuardianVoice 🛡️
### AI Voice Companion for Elderly People — Ship to Prod Hackathon

> Protects elderly users from scams, schedules appointments, manages reminders, and teaches AI literacy — all by voice.

---

## Sponsors Used
| Sponsor | Role |
|---|---|
| **VAPI** | Voice AI — all user interactions (call, speak, listen) |
| **Tinyfish** | Live web — real-time scam alerts, healthcare data |
| **Nexla** | Data pipelines — government APIs, calendar, pharmacy |
| **WunderGraph** | API orchestration — unified GraphQL supergraph |
| **Redis** | Agent memory, reminders, real-time pub/sub dashboard |
| **Ghost by TigerData** | Knowledge base — AI literacy, scam education content |
| **Chainguard** | Zero-CVE containers — secure deployment of all services |

---

## Quick Start (Development)

### 1. Clone & install
```bash
# Backend
cd backend && cp .env.example .env  # fill in your API keys
npm install

# Frontend
cd ../frontend && cp .env.example .env  # fill in VAPI public key
npm install
```

### 2. Start Redis
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

### 3. Run backend
```bash
cd backend && npm run dev
# API running at http://localhost:3001
```

### 4. Run frontend
```bash
cd frontend && npm run dev
# UI running at http://localhost:5173
```

### 5. Setup VAPI agents (one-time)
```bash
curl -X POST http://localhost:3001/api/voice/setup/demo-user-001
```

---

## Production Deploy (Docker + Chainguard)
```bash
cp backend/.env.example backend/.env   # fill in keys
docker-compose up --build
# Frontend: http://localhost:8080
# Backend:  http://localhost:3001
```

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check |
| `/api/user/:id/profile` | GET/POST | User profile |
| `/api/voice/setup/:id` | POST | Create VAPI agents |
| `/api/voice/call/web` | POST | Start a web call |
| `/api/scam/alerts` | GET | Live scam alerts (Tinyfish) |
| `/api/scam/analyze` | POST | Analyze a suspicious call |
| `/api/reminders/:id` | GET/POST/DELETE | Manage reminders |
| `/api/appointments/:id` | POST | Book doctor appointment (Nexla) |
| `/api/benefits/:id` | GET | Pension/benefit schedule |
| `/api/knowledge?q=` | GET | Query knowledge base (Ghost) |
| `/api/dashboard/:id` | GET | Full dashboard data |
| `/api/dashboard/:id/live` | GET (SSE) | Real-time events stream |

---

## Architecture

```
User voice call
      ↓
   VAPI Squads (ScamGuard / Scheduler / Educator)
      ↓ (tool calls)
 ┌────────────────────────────────────────┐
 │         WunderGraph Supergraph         │
 │    (unified API + MCP Gateway)         │
 └────┬──────┬──────┬──────┬─────────────┘
      │      │      │      │
   Tinyfish Nexla Ghost  Redis
   (live   (data  (know- (memory
    web)   pipes) ledge) + pub/sub)
                              ↓
                    Family Dashboard (SSE)
                              ↓
                    Chainguard containers
```

---

## Demo Flow (3 minutes)
1. Open web app — show family dashboard with live Redis stream
2. Click "Call GuardianVoice" — speak: *"I got a call saying I owe the IRS money"*
3. Agent responds via VAPI + Tinyfish fetches live scam data
4. Say: *"Book a doctor appointment for Thursday"* — Nexla syncs to calendar
5. Ask: *"What is a deepfake?"* — Ghost KB returns plain-language explanation
6. Show published output on docs.senso.ai (cited.md requirement)
7. Show Chainguard containers proving secure-by-default deployment

---

## Live Use Cases
- Scam call detection with real web data (Tinyfish)
- Doctor appointment booking (Nexla → calendar APIs)
- Medication + pension reminders (Redis scheduler)
- AI literacy education (Ghost knowledge base)
- Family monitoring dashboard (Redis pub/sub SSE)
- Secure deployment (Chainguard zero-CVE images)

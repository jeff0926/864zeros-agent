# 864zeros System Architecture
## Complete Autonomous Business Machine
**Version:** 1.0.0
**Created:** 2026-01-26
**Purpose:** Master blueprint for fully autonomous operation

---

## System Overview

864zeros is an autonomous micro-SaaS factory. The system should:
1. **DISCOVER** opportunities (scan markets, trends, gaps)
2. **SCORE** opportunities (apply playbook formula)
3. **DECIDE** what to build (pick highest score ≥75)
4. **PLAN** the build (generate task breakdown)
5. **BUILD** the product (execute tasks with QA)
6. **DEPLOY** to market (submit to stores/publish)
7. **MONITOR** revenue (track results, learn, iterate)

Currently only step 5 (BUILD) partially exists. Everything else is manual or missing.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTONOMOUS BUSINESS LOOP                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │  DISCOVERY   │───▶│   SCORING    │───▶│   DECISION   │                  │
│  │   Service    │    │   Engine     │    │   Engine     │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│         │                   │                   │                           │
│         ▼                   ▼                   ▼                           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │ opportunities│    │  pipeline    │    │ Approved     │                  │
│  │    .json     │    │    .json     │    │ Opportunity  │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│                                                 │                           │
│                                                 ▼                           │
│                           ┌──────────────────────────────────┐             │
│                           │         TASK GENERATOR           │             │
│                           │  (Break opportunity into tasks)  │             │
│                           └──────────────────────────────────┘             │
│                                                 │                           │
│                                                 ▼                           │
│                           ┌──────────────────────────────────┐             │
│                           │         queue/tasks.json         │             │
│                           └──────────────────────────────────┘             │
│                                                 │                           │
│                                                 ▼                           │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        EXECUTION PIPELINE                             │  │
│  │  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌────────┐ │  │
│  │  │  TASK   │──▶│  LINT   │──▶│  TEST   │──▶│  BUILD  │──▶│COMPLETE│ │  │
│  │  │ START   │   │  CHECK  │   │  CHECK  │   │  CHECK  │   │        │ │  │
│  │  └─────────┘   └─────────┘   └─────────┘   └─────────┘   └────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                 │                           │
│                                                 ▼                           │
│                           ┌──────────────────────────────────┐             │
│                           │       DEPLOYMENT PIPELINE        │             │
│                           │  (Submit to stores / publish)    │             │
│                           └──────────────────────────────────┘             │
│                                                 │                           │
│                                                 ▼                           │
│                           ┌──────────────────────────────────┐             │
│                           │       REVENUE MONITOR            │             │
│                           │  (Track results, feed back)      │             │
│                           └──────────────────────────────────┘             │
│                                                 │                           │
│                                                 ▼                           │
│                           ┌──────────────────────────────────┐             │
│                           │       LEARNING SYSTEM            │             │
│                           │  (Update playbook from results)  │             │
│                           └──────────────────────────────────┘             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. DISCOVERY SERVICE

**Purpose:** Find market opportunities automatically

**Data Sources:**
- Google Trends API
- Reddit API (r/SideProject, r/Entrepreneur, r/ADHD, etc.)
- Product Hunt (new launches, gaps in comments)
- App Store reviews (complaints = opportunities)
- Twitter/X trends
- Hacker News (Show HN posts, comments)

**Output:** `state/opportunities.json`
```json
{
  "opportunities": [
    {
      "id": "OPP-XXX",
      "name": "Descriptive name",
      "source": "Where discovered",
      "evidence": ["URL1", "URL2"],
      "market_signals": {
        "search_volume": "number or null",
        "reddit_mentions": "count",
        "competitor_revenue": "estimate or null"
      },
      "discovered_at": "ISO timestamp",
      "status": "new|scored|approved|rejected|building|launched"
    }
  ]
}
```

**Trigger:** Daily at 6 AM UTC (or on-demand)

---

### 2. SCORING ENGINE

**Purpose:** Apply playbook formula to rank opportunities

**Formula (from playbook.json):**
```
Score = (Validated Revenue × 0.3) + (Build Speed × 0.25) +
        (Automation Potential × 0.25) + (Competition Gap × 0.2)
```

**Scoring Criteria:**

| Factor | Weight | How to Score (1-100) |
|--------|--------|----------------------|
| Validated Revenue | 30% | Evidence of people paying for similar |
| Build Speed | 25% | Can build in 3-5 days? 100=yes, 0=months |
| Automation Potential | 25% | Can achieve ≥95% automation? |
| Competition Gap | 20% | Clear differentiation exists? |

**Thresholds:**
- **≥75:** Pursue (auto-approve for build)
- **60-74:** Consider (flag for human review)
- **<60:** Reject (archive with reason)

**Output:** Updates `state/pipeline.json` with scores

---

### 3. DECISION ENGINE

**Purpose:** Pick what to build next

**Logic:**
```
1. Get all opportunities with status="scored" and score ≥75
2. Sort by score descending
3. Check: Is there already something "building"?
   - Yes: Wait (one product at a time)
   - No: Pick highest score, set status="approved"
4. Notify via Telegram: "Approved OPP-XXX: [name] (Score: XX)"
```

**Guard Rails:**
- Max 1 active build at a time
- If score is 60-74, flag for Jeff's approval
- Never auto-approve anything requiring:
  - External API costs > $50/month
  - Complex infrastructure
  - Legal/compliance concerns

---

### 4. TASK GENERATOR

**Purpose:** Break approved opportunity into executable tasks

**Input:** Approved opportunity from pipeline
**Output:** Tasks in `queue/tasks.json`

**Standard Task Breakdown:**
```json
{
  "tasks": [
    {"id": "TASK-001", "type": "spec", "description": "Create technical specification", "priority": 1},
    {"id": "TASK-002", "type": "scaffold", "description": "Initialize project structure", "priority": 2},
    {"id": "TASK-003", "type": "core", "description": "Implement core functionality", "priority": 3},
    {"id": "TASK-004", "type": "ui", "description": "Build user interface", "priority": 4},
    {"id": "TASK-005", "type": "integration", "description": "Connect AI/API services", "priority": 5},
    {"id": "TASK-006", "type": "monetization", "description": "Implement payment flow", "priority": 6},
    {"id": "TASK-007", "type": "test", "description": "Write and run tests", "priority": 7},
    {"id": "TASK-008", "type": "docs", "description": "Create README and docs", "priority": 8},
    {"id": "TASK-009", "type": "deploy-prep", "description": "Prepare store assets", "priority": 9},
    {"id": "TASK-010", "type": "deploy", "description": "Submit to store", "priority": 10, "requires_approval": true}
  ]
}
```

---

### 5. QUALITY GATES

**Purpose:** Ensure code quality before marking tasks complete

**Gate 1: Lint Check**
- JavaScript/TypeScript: ESLint
- Python: flake8 + black
- **Fail = Block task completion**

**Gate 2: Build Check**
- Code must compile/bundle without errors
- For mobile: APK/IPA must build
- **Fail = Block task completion**

**Gate 3: Test Check**
- Unit tests must exist for core functions
- All tests must pass
- Minimum coverage: 60%
- **Fail = Block task completion**

**Gate 4: Security Check**
- No hardcoded secrets (use gitleaks or similar)
- No obvious vulnerabilities
- **Fail = Block task completion**

**Implementation:**
- Add to `.github/workflows/qa.yml`
- Run on every push and before task completion
- Agent cannot mark task complete if gates fail

---

### 6. DEPLOYMENT PIPELINE

**Purpose:** Get product to users

**For Mobile Apps (Android):**
```
1. Build release APK (signed)
2. Generate store assets (screenshots, description)
3. Submit to Google Play Console
4. Monitor review status
5. Notify when live
```

**For Web Apps:**
```
1. Build production bundle
2. Deploy to hosting (Vercel/Netlify/Cloudflare)
3. Configure domain
4. Set up monitoring
5. Notify when live
```

**For Browser Extensions:**
```
1. Build production package
2. Generate store assets
3. Submit to Chrome Web Store
4. Monitor review status
5. Notify when live
```

**Requires:**
- Google Play Developer account (Jeff has)
- Signing keys (stored securely)
- Store assets (generated or created)

**CRITICAL:** Deployment requires Jeff's approval (set `requires_approval: true`)

---

### 7. REVENUE MONITOR

**Purpose:** Track results and feed back into learning

**Data to Track:**
```json
{
  "products": {
    "task-breakdown-ai": {
      "launched_at": "ISO timestamp",
      "platform": "android",
      "downloads": 0,
      "active_users": 0,
      "revenue": {
        "total": 0,
        "by_month": {}
      },
      "ratings": {
        "average": null,
        "count": 0
      },
      "costs": {
        "api_monthly": 0,
        "hosting_monthly": 0
      },
      "profit": 0
    }
  }
}
```

**Data Sources:**
- Google Play Console API
- Stripe/payment processor API
- Analytics (if implemented)

**Triggers:**
- Daily revenue check
- Weekly summary to Telegram
- Alert if revenue drops >20% week-over-week

---

### 8. LEARNING SYSTEM

**Purpose:** Improve decision-making over time

**What to Learn:**
- Which market signals predict success?
- How accurate are build time estimates?
- What types of products perform best?
- Which features drive revenue?

**Implementation:**
- Log predictions vs outcomes in diary
- Weekly self-review
- Update playbook.json weights based on evidence

---

## File Structure (Complete)

```
864zeros-agent/
├── .github/
│   └── workflows/
│       ├── agent.yml           # Main agent runner (exists)
│       ├── qa.yml              # Quality gates (TO BUILD)
│       └── deploy.yml          # Deployment pipeline (TO BUILD)
├── config/
│   └── settings.json           # Configuration values
├── diary/
│   └── diary-YYYY-MM-DD.md     # Daily entries
├── queue/
│   └── tasks.json              # Task queue (exists)
├── research/
│   └── *.md                    # Research documents
├── scripts/
│   ├── agent.py                # Main agent (exists)
│   ├── discovery.py            # Opportunity scanner (TO BUILD)
│   ├── scoring.py              # Scoring engine (TO BUILD)
│   ├── task_generator.py       # Task generator (TO BUILD)
│   └── revenue_monitor.py      # Revenue tracking (TO BUILD)
├── sessions/
│   └── YYYY-MM-DD-*.md         # Session summaries
├── state/
│   ├── costs.json              # Spending tracking
│   ├── opportunities.json      # Discovered opportunities (TO BUILD)
│   ├── pipeline.json           # Scored/tracked opportunities
│   ├── playbook.json           # Scoring rules
│   └── products.json           # Launched products + metrics (TO BUILD)
├── products/                   # Built products live here
│   └── task-breakdown-ai/      # (exists, in progress)
├── agent-persona.md            # WHO the agent is
├── agent-definition.md         # HOW the agent operates
├── agent-tools.md              # WHAT tools available
├── quality-standards.md        # QA requirements (TO BUILD)
├── CLAUDE.md                   # Agent brain (exists)
└── README.md                   # Repo overview
```

---

## Implementation Priority

### Phase 1: QA Gates (DO FIRST)
Without QA, we ship broken code. This blocks everything.

**Tasks:**
1. Create `quality-standards.md` with lint/test/build rules
2. Create `.github/workflows/qa.yml`
3. Update `scripts/agent.py` to check QA before task completion
4. Add ESLint config for JS/TS projects
5. Add pytest setup for Python code

### Phase 2: Complete First Product
Task Breakdown AI is approved. Finish it properly.

**Tasks:**
1. Complete all screens and navigation
2. Implement AI integration
3. Implement subscription flow
4. Pass all QA gates
5. Prepare store assets
6. Submit for Jeff's deployment approval

### Phase 3: Discovery + Scoring
Enable autonomous opportunity finding.

**Tasks:**
1. Create `scripts/discovery.py` with Reddit + Trends scanning
2. Create `scripts/scoring.py` with playbook formula
3. Create `state/opportunities.json` schema
4. Schedule discovery to run daily
5. Create decision engine logic

### Phase 4: Revenue Monitoring
Close the feedback loop.

**Tasks:**
1. Create `scripts/revenue_monitor.py`
2. Integrate with Google Play Console API
3. Create `state/products.json` schema
4. Set up daily revenue checks
5. Weekly Telegram summaries

---

## Manual Actions Required From Jeff

These cannot be automated:

| Action | When | Why |
|--------|------|-----|
| Merge PRs to main | After Claude Code pushes | Branch protection |
| Google Play account setup | Before first deploy | Requires payment info |
| Signing key creation | Before first deploy | Security requirement |
| Final deploy approval | Before each launch | Safety gate |
| Payment processor setup | Before monetization | Requires legal/tax info |
| Respond to store rejections | If app rejected | Human judgment needed |
| Pay bills | Monthly | Financial access |

**Goal:** Reduce this list over time. First target: Remove PR merge requirement.

---

## Scheduled Operations

| Schedule | What Runs | Purpose |
|----------|-----------|---------|
| Every 6 hours | Main agent | Process task queue |
| Daily 6 AM UTC | Discovery | Find new opportunities |
| Daily 7 AM UTC | Scoring | Score new opportunities |
| Daily 8 AM UTC | Decision | Pick next build if ready |
| Daily 9 AM EST | Summary | Telegram status report |
| Weekly Sunday | Revenue report | Track product performance |

---

## Success Metrics

**Phase 1 Complete When:**
- [ ] QA workflow runs on every push
- [ ] Agent checks QA before marking tasks done
- [ ] Zero broken code gets committed

**Phase 2 Complete When:**
- [ ] Task Breakdown AI passes all QA gates
- [ ] App is submitted to Google Play
- [ ] App is approved and live

**Phase 3 Complete When:**
- [ ] Discovery runs daily without human trigger
- [ ] At least 5 opportunities scored automatically
- [ ] One opportunity auto-approved based on score

**Phase 4 Complete When:**
- [ ] Revenue data pulled automatically
- [ ] Weekly reports sent via Telegram
- [ ] Playbook weights updated based on results

---

## What "Fully Autonomous" Means

The system is fully autonomous when:

1. **I don't decide what to build** — Discovery + Scoring + Decision do
2. **I don't create tasks** — Task Generator does
3. **I don't check quality** — QA Gates do
4. **I don't deploy** — Pipeline does (with Jeff's one-click approval)
5. **I don't track revenue** — Monitor does
6. **I don't learn** — Learning System updates playbook

Jeff's role becomes:
- One-click approvals for deploys
- Handle store rejections
- Pay bills
- Strategic direction (optional)

**Everything else runs without human initiation.**

---

*This is the complete system. Build it in order. Phase 1 first.*

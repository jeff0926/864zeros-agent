# Agent Tools: Capabilities & Integrations
## 864zeros Autonomous Agent Toolkit
**Version:** 1.0.0  
**Created:** 2026-01-25  
**Purpose:** Defines WHAT tools and capabilities are available

---

## Current Environment

### Primary Interfaces

| Interface | Access | Use For |
|-----------|--------|---------|
| **Claude.ai** | Active (Pro $100/mo) | Strategy, research, complex reasoning, this conversation |
| **Claude Code** | Via Claude.ai computer use | File operations, git, code execution |
| **Claude API** | Active (Anthropic) | Programmatic access, autonomous agents |
| **Gemini Pro API** | Active (Google) | Validation, second opinions, quick classification |

### State Repository

**Location:** https://github.com/jeff0926/864zeros-agent

```
864zeros-agent/
├── config/
│   └── settings.json          # Configuration values
├── diary/
│   └── diary.md               # Detailed learnings and events
├── queue/
│   └── tasks.json             # Pending work items
├── research/
│   └── *.md                   # Research documents
├── sessions/
│   └── YYYY-MM-DD-*.md        # Session summaries
├── state/
│   ├── costs.json             # Spending tracking
│   ├── pipeline.json          # Opportunity tracking
│   └── playbook.json          # Scoring criteria and rules
├── agent-persona.md           # WHO I am
├── agent-definition.md        # HOW I operate
├── agent-tools.md             # WHAT I can use (this file)
└── README.md                  # Repo overview
```

---

## Built-In Tools (Claude.ai)

### Web Search
- **Trigger:** Questions about current events, verification, research
- **Capability:** Search web, fetch pages, synthesize findings
- **Use when:** Need current data, validating claims, researching markets

### Computer Use (Claude Code)
- **Trigger:** File operations, code execution, git commands
- **Capability:** Full Linux environment, file read/write, bash execution
- **Use when:** Creating files, running code, managing git repo

### Memory
- **Trigger:** Principles to remember across sessions
- **Capability:** Persistent storage of key learnings
- **Use when:** Learning a reusable principle, updating beliefs

### Past Chats Search
- **Trigger:** References to previous conversations
- **Capability:** Search conversation history in this project
- **Use when:** Continuing work, referencing decisions, checking context

---

## External Tools (To Be Configured)

### Telegram Bot (Primary Notification)
**Status:** Not yet configured

**Planned Capabilities:**
- Send notifications to Jeff
- Receive commands from Jeff
- Daily summaries
- Alert on blockers/milestones

**Setup Required:**
1. Create bot via @BotFather
2. Get bot token
3. Store token securely
4. Configure MCP tool or webhook

### GitHub API
**Status:** Token available, not yet integrated

**Planned Capabilities:**
- Programmatic commits
- Issue creation/management
- PR operations
- Workflow triggers

**Access Pattern:**
```python
# Via Claude Agent SDK MCP tool
@tool("github_commit", "Commit and push changes", {"message": str, "files": list})
async def github_commit(args):
    # Implementation
    pass
```

### Gemini API
**Status:** Active, manual use only

**Planned Capabilities:**
- Quick classification tasks
- Validation/second opinion on analysis
- Cost-efficient simple queries

**Use Cases:**
- Validate opportunity scoring
- Quick market size estimates
- Sentiment analysis on feedback

---

## Claude Agent SDK (Autonomous Execution)

**Status:** Researched and validated, not yet implemented

### Core Capabilities

```python
from claude_agent_sdk import query, ClaudeAgentOptions

# Basic autonomous query
options = ClaudeAgentOptions(
    system_prompt="You are The Operator for 864zeros",
    allowed_tools=["Read", "Write", "Edit", "Bash", "Glob", "Grep", "WebSearch"],
    permission_mode='acceptEdits',
    cwd="/path/to/864zeros-agent"
)

async for message in query(prompt="Execute pending tasks", options=options):
    print(message)
```

### Built-In Tools (SDK)

| Tool | Purpose |
|------|---------|
| `Read` | Read file contents |
| `Write` | Create new files |
| `Edit` | Modify existing files |
| `Bash` | Execute shell commands |
| `Glob` | Find files by pattern |
| `Grep` | Search file contents |
| `WebSearch` | Search the web |

### Custom MCP Tools (Planned)

```python
from claude_agent_sdk import tool, create_sdk_mcp_server

@tool("send_telegram", "Send notification via Telegram", {"message": str})
async def send_telegram(args):
    # Telegram bot API call
    return {"content": [{"type": "text", "text": f"Sent: {args['message']}"}]}

@tool("update_pipeline", "Update opportunity in pipeline", {"opp_id": str, "updates": dict})
async def update_pipeline(args):
    # Read pipeline.json, update, write back
    return {"content": [{"type": "text", "text": f"Updated: {args['opp_id']}"}]}

@tool("log_cost", "Record API spend", {"service": str, "amount": float, "description": str})
async def log_cost(args):
    # Append to costs.json
    return {"content": [{"type": "text", "text": f"Logged: ${args['amount']}"}]}

tools_server = create_sdk_mcp_server(
    name="864zeros-tools",
    version="1.0.0",
    tools=[send_telegram, update_pipeline, log_cost]
)
```

### Scheduled Execution (GitHub Actions)

```yaml
name: 864zeros Autonomous Agent
on:
  schedule:
    - cron: '0 */4 * * *'  # Every 4 hours
  workflow_dispatch:        # Manual trigger

jobs:
  agent-run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install claude-agent-sdk
      - run: python scripts/autonomous_agent.py
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      - run: |
          git config user.name "864zeros-agent"
          git add -A
          git diff --staged --quiet || git commit -m "Agent run: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
          git push
```

---

## Scoring Tools

### Opportunity Scoring Formula

```
Score = (Validated Revenue × 0.3) + (Build Speed × 0.25) + 
        (Automation Potential × 0.25) + (Competition Gap × 0.2)
```

**Thresholds:**
- Pursue: ≥75
- Consider: ≥60
- Reject: <60

### Evaluation Criteria

| Factor | Weight | Scoring Guide |
|--------|--------|---------------|
| Validated Revenue | 30% | Evidence of people paying for similar solutions |
| Build Speed | 25% | Can build MVP in 3-5 days with available tools? |
| Automation Potential | 25% | Can achieve ≥95% automation post-launch? |
| Competition Gap | 20% | Clear differentiation from existing solutions? |

### Build Complexity Check

Before approving any build:
```
□ Can I build this in 3-5 days with Claude Code?
□ Will it require ≤2 hours/week maintenance?
□ Is the tech stack simple (no complex infrastructure)?
□ Can I test it without expensive resources?
```

---

## Research Tools

### Market Research Pattern

1. **Web search** for market size, trends, competitors
2. **Fetch** key pages for detailed analysis
3. **Cross-reference** multiple sources
4. **Validate** with Gemini for second opinion (optional)
5. **Document** findings in research/ folder

### Competitive Analysis Pattern

1. **Identify** top 5-10 competitors
2. **Analyze** pricing, features, positioning
3. **Find gaps** — what are they NOT doing?
4. **Score** opportunity based on gaps
5. **Document** in pipeline with evidence

---

## File Operation Patterns

### Reading State

```python
# Pattern for reading JSON state
import json
with open('state/pipeline.json', 'r') as f:
    pipeline = json.load(f)
```

### Updating State

```python
# Pattern for atomic state updates
import json
from datetime import datetime

# Read
with open('state/pipeline.json', 'r') as f:
    pipeline = json.load(f)

# Modify
pipeline['opportunities']['OPP-001']['status'] = 'in_progress'
pipeline['last_updated'] = datetime.utcnow().isoformat()

# Write
with open('state/pipeline.json', 'w') as f:
    json.dump(pipeline, f, indent=2)
```

### Adding Diary Entry

```markdown
## YYYY-MM-DD HH:MM — [Topic]

**Context:** [Why this matters]

**What Happened:** [Facts]

**Learning:** [Principle extracted]

**Next Action:** [What to do with this]
```

---

## Safety Constraints

### Never Execute:
- `rm -rf` on important directories
- Commands with `sudo` without explicit approval
- Anything that exposes credentials
- External API calls without rate limiting
- Deploys to production without approval

### Always Verify:
- File paths before writing (don't overwrite critical files)
- API responses before acting on them
- Costs before expensive operations
- Permissions before accessing resources

### Rate Limits to Respect:
- Anthropic API: Check current limits
- GitHub API: 5000 requests/hour (authenticated)
- Web searches: Reasonable intervals
- External APIs: Per their documentation

---

## Tool Request Protocol

When I need a tool that doesn't exist:

1. **Document the need** — What am I trying to do?
2. **Check if it exists** — Search before building
3. **Propose solution** — How would I build it?
4. **Get approval** — If it requires new infrastructure
5. **Implement** — Build the MCP tool
6. **Document** — Update this file

---

## Monitoring & Observability

### What to Track:
- API costs per operation
- Task completion times
- Error rates and types
- Decision outcomes vs predictions

### Where to Track:
- `state/costs.json` — Financial tracking
- `diary/diary.md` — Event logging
- Session summaries — Decision records

### Alerting (When Configured):
- Telegram notification on errors
- Daily cost summary
- Milestone achievements

---

*These are my tools. I use them to get work done.*

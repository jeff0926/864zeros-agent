# Claude Agent SDK: Validated Research
## Reference Document for 864zeros Autonomous Operations
**Research Date:** 2026-01-25  
**Status:** VALIDATED via Anthropic official documentation and sources  
**Purpose:** Authoritative reference for implementation decisions

---

## TL;DR

The Claude Agent SDK is Anthropic's official framework for building autonomous AI agents. Released September 29, 2025, it provides the same infrastructure that powers Claude Code — now available as a Python/TypeScript library. This enables scheduled, autonomous agent execution without human initiation.

**This is not third-party tooling. This is Anthropic's own infrastructure.**

---

## What It Provides

| Capability | Status | Notes |
|------------|--------|-------|
| File operations (read/write/edit) | ✅ Confirmed | Built-in tools |
| Bash command execution | ✅ Confirmed | Full terminal access |
| Web search | ✅ Confirmed | Built-in tool |
| Custom tools via MCP | ✅ Confirmed | GitHub, Telegram, APIs, databases |
| Context management (long sessions) | ✅ Confirmed | Auto-compaction, session persistence |
| Scheduled execution | ✅ Confirmed | Via cron/GitHub Actions |
| Subagents (parallel execution) | ✅ Confirmed | Isolated contexts |
| Session resume/fork | ✅ Confirmed | Full state preservation |

---

## Installation

```bash
# Install Claude Code CLI (required runtime - bundled with SDK but can install separately)
curl -fsSL https://claude.ai/install.sh | bash

# Install Python SDK
pip install claude-agent-sdk

# Set API key
export ANTHROPIC_API_KEY=your-api-key
```

**Requirements:** Python 3.10+, Node.js 18+ (for some features)

---

## Core Patterns

### Basic Query
```python
import anyio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    async for message in query(prompt="What files are in this directory?"):
        print(message)

anyio.run(main())
```

### With Tools and Permissions
```python
options = ClaudeAgentOptions(
    system_prompt="You are the autonomous operator for 864zeros",
    allowed_tools=["Read", "Write", "Edit", "Bash", "Glob", "Grep", "WebSearch"],
    permission_mode='acceptEdits',  # Auto-accept file edits
    cwd="/path/to/working/directory"
)

async for message in query(prompt="Check queue and execute tasks", options=options):
    print(message)
```

### Custom MCP Tools (e.g., Telegram, GitHub)
```python
from claude_agent_sdk import tool, create_sdk_mcp_server, ClaudeAgentOptions

@tool("send_telegram", "Send a message via Telegram", {"message": str})
async def send_telegram(args):
    # Your Telegram bot logic here
    return {"content": [{"type": "text", "text": f"Sent: {args['message']}"}]}

@tool("github_commit", "Commit and push to GitHub", {"message": str, "files": list})
async def github_commit(args):
    # Your GitHub logic here
    return {"content": [{"type": "text", "text": f"Committed: {args['message']}"}]}

# Create MCP server with custom tools
tools_server = create_sdk_mcp_server(
    name="864zeros-tools",
    version="1.0.0",
    tools=[send_telegram, github_commit]
)

# Use with agent
options = ClaudeAgentOptions(
    mcp_servers={"tools": tools_server},
    allowed_tools=["mcp__tools__send_telegram", "mcp__tools__github_commit", "Read", "Write", "Bash"]
)
```

### Session Persistence (Resume Work)
```python
# First run - capture session ID
session_id = None
async for message in query(prompt="Start analyzing codebase", options=options):
    if hasattr(message, 'session_id'):
        session_id = message.session_id
    print(message)

# Later - resume with full context
options_resume = ClaudeAgentOptions(
    resume=session_id,
    allowed_tools=["Read", "Write", "Bash"]
)
async for message in query(prompt="Continue where we left off", options=options_resume):
    print(message)
```

---

## Scheduled Execution via GitHub Actions

This is how autonomous execution works without human initiation:

```yaml
# .github/workflows/864zeros-agent.yml
name: 864zeros Autonomous Agent

on:
  schedule:
    - cron: '0 */4 * * *'  # Every 4 hours
    - cron: '0 9 * * *'    # Daily at 9 AM
  workflow_dispatch:        # Manual trigger option

jobs:
  agent-run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install claude-agent-sdk
      
      - name: Run autonomous agent
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          python scripts/autonomous_agent.py
      
      - name: Commit state changes
        run: |
          git config user.name "864zeros-agent"
          git config user.email "agent@864zeros.com"
          git add -A
          git diff --staged --quiet || git commit -m "Agent run: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
          git push
```

### Alternative: Claude Code Action (Simpler)
```yaml
name: Agent Task
on:
  schedule:
    - cron: '0 9 * * *'
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "Read queue/tasks.json, execute pending tasks, update state files, commit changes"
          claude_args: "--model claude-sonnet-4-5-20250929"
```

---

## Subagents (Parallel Execution)

For complex tasks, spawn isolated subagents:

```python
options = ClaudeAgentOptions(
    agents={
        'researcher': {
            'description': 'Use for market research and competitive analysis',
            'prompt': 'You are a market research specialist. Gather data, analyze trends, return findings.',
            'tools': ['WebSearch', 'Read', 'Write'],
            'model': 'sonnet'
        },
        'builder': {
            'description': 'Use for code generation and file creation',
            'prompt': 'You are a code builder. Create files, write code, test functionality.',
            'tools': ['Read', 'Write', 'Edit', 'Bash'],
            'model': 'sonnet'
        }
    }
)
```

The main agent automatically delegates to subagents based on task matching.

---

## Hooks (Safety & Control)

Intercept tool execution for validation, logging, or blocking:

```python
async def block_dangerous_commands(input_data, tool_name, context):
    if tool_name == "Bash":
        command = input_data.get("command", "")
        dangerous = ["rm -rf", "sudo", "chmod 777", "> /dev/"]
        if any(d in command for d in dangerous):
            return {"behavior": "deny", "message": "Blocked dangerous command"}
    return {"behavior": "allow"}

options = ClaudeAgentOptions(
    hooks={
        'PreToolUse': [
            {'matcher': 'Bash', 'hooks': [block_dangerous_commands]}
        ]
    }
)
```

---

## Key Configuration Options

| Option | Type | Purpose |
|--------|------|---------|
| `system_prompt` | str | Define agent identity and instructions |
| `allowed_tools` | list | Whitelist of permitted tools |
| `permission_mode` | str | 'default', 'acceptEdits', 'plan', 'bypassPermissions' |
| `cwd` | str | Working directory for file operations |
| `max_turns` | int | Limit agent loop iterations |
| `max_budget_usd` | float | Cost ceiling for the session |
| `mcp_servers` | dict | Custom tool servers |
| `agents` | dict | Subagent definitions |
| `hooks` | dict | Execution interception callbacks |
| `resume` | str | Session ID to continue |
| `fork_session` | bool | Branch from resumed session |

---

## What This Means for 864zeros

### Autonomous Operation Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions (Cron)                     │
│                   Triggers every 4 hours                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Claude Agent SDK (Python)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Read State  │→ │Execute Tasks│→ │Update State │         │
│  │ Files       │  │             │  │ Files       │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│         │                │                │                  │
│         ▼                ▼                ▼                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │queue/tasks  │  │Web Search   │  │diary.md     │         │
│  │pipeline.json│  │Bash/Files   │  │pipeline.json│         │
│  │playbook.json│  │Custom Tools │  │costs.json   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Custom MCP Tools                                │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│  │ GitHub    │  │ Telegram  │  │ Gemini    │               │
│  │ Operations│  │ Notify    │  │ API       │               │
│  └───────────┘  └───────────┘  └───────────┘               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Git Commit & Push                         │
│                 State persisted to repo                      │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Priority

1. **Phase 1:** Basic autonomous loop
   - GitHub Actions workflow
   - Simple Python script using claude-agent-sdk
   - Read tasks → Execute → Update state → Commit

2. **Phase 2:** Custom tools
   - Telegram notification MCP tool
   - GitHub operations MCP tool
   - State management helpers

3. **Phase 3:** Advanced features
   - Session persistence for long tasks
   - Subagents for parallel work
   - Hooks for safety controls
   - Cost tracking

---

## Cost Considerations

- API costs apply for each agent invocation
- Use `max_budget_usd` to set spending limits
- Consider using Haiku for simpler tasks, Sonnet for complex work
- Subagents can route to cheaper models where appropriate

---

## Sources (Validated)

1. Anthropic Official Documentation: https://platform.claude.com/docs/en/agent-sdk/overview
2. Anthropic Engineering Blog: https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk
3. GitHub Repos:
   - https://github.com/anthropics/claude-agent-sdk-python
   - https://github.com/anthropics/claude-agent-sdk-typescript
   - https://github.com/anthropics/claude-code-action
4. Claude Code Documentation: https://code.claude.com/docs/en/github-actions

---

## Usage Note for Agent

This document is validated research. When implementing:
1. Reference this document for architecture decisions
2. Do not re-research these topics — they are confirmed
3. Proceed to implementation specs and code
4. Ask Jeff for approval before deploying any scheduled workflows

---

*Document created: 2026-01-25*  
*Research validated via official Anthropic sources*

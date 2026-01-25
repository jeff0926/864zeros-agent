# 864zeros Agent State

This repository is the persistent memory and state system for the 864zeros autonomous AI agent.

## Structure

```
├── state/
│   ├── playbook.json    # Strategy, criteria, constraints
│   └── pipeline.json    # Opportunity rankings and status
├── diary/
│   └── diary.md         # Agent reflections and learnings
├── queue/
│   └── tasks.json       # Pending research, decisions, questions
├── research/
│   └── ai_tools.md      # AI tools inventory
└── config/
    └── settings.json    # Configuration (no secrets)
```

## Purpose

The agent reads this state at the start of each session and updates it at the end. This enables continuity across conversations.

## Owner

864zeros LLC

## Last Updated

2026-01-24

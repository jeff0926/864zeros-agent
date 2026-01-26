#!/usr/bin/env python3
"""
864zeros Autonomous Agent

Uses the Anthropic SDK directly (no LangChain/CrewAI) to process tasks
from the queue and execute them autonomously.
"""

import os
import json
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Any

import anthropic

# Configuration
REPO_ROOT = Path(__file__).parent.parent
QUEUE_FILE = REPO_ROOT / "queue" / "tasks.json"
DIARY_FILE = REPO_ROOT / "diary" / "diary.md"
STATE_DIR = REPO_ROOT / "state"
MODEL = "claude-sonnet-4-20250514"
MAX_TURNS = 25


def load_tasks() -> list[dict]:
    """Load pending tasks from queue."""
    if not QUEUE_FILE.exists():
        return []
    with open(QUEUE_FILE) as f:
        data = json.load(f)
    return [t for t in data.get("tasks", []) if t.get("status") == "pending"]


def save_tasks(tasks: list[dict]) -> None:
    """Save tasks back to queue file."""
    QUEUE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(QUEUE_FILE, "w") as f:
        json.dump({"tasks": tasks, "updated_at": datetime.now().isoformat()}, f, indent=2)


def load_state() -> dict[str, Any]:
    """Load all state files."""
    state = {}
    if STATE_DIR.exists():
        for file in STATE_DIR.glob("*.json"):
            with open(file) as f:
                state[file.stem] = json.load(f)
    return state


def append_diary(entry: str) -> None:
    """Append an entry to the diary."""
    DIARY_FILE.parent.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    with open(DIARY_FILE, "a") as f:
        f.write(f"\n## {timestamp}\n\n{entry}\n")


def git_commit_and_push(message: str) -> str:
    """Commit changes and push to remote."""
    try:
        subprocess.run(["git", "add", "-A"], cwd=REPO_ROOT, check=True)
        subprocess.run(["git", "commit", "-m", message], cwd=REPO_ROOT, check=True)
        subprocess.run(["git", "push"], cwd=REPO_ROOT, check=True)
        return "Successfully committed and pushed changes."
    except subprocess.CalledProcessError as e:
        return f"Git operation failed: {e}"


# Tool definitions for the agent
TOOLS = [
    {
        "name": "read_file",
        "description": "Read the contents of a file in the repository",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Path relative to repo root"}
            },
            "required": ["path"]
        }
    },
    {
        "name": "write_file",
        "description": "Write content to a file in the repository",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Path relative to repo root"},
                "content": {"type": "string", "description": "Content to write"}
            },
            "required": ["path", "content"]
        }
    },
    {
        "name": "run_command",
        "description": "Run a shell command in the repository",
        "input_schema": {
            "type": "object",
            "properties": {
                "command": {"type": "string", "description": "Command to execute"}
            },
            "required": ["command"]
        }
    },
    {
        "name": "update_task_status",
        "description": "Update the status of a task in the queue",
        "input_schema": {
            "type": "object",
            "properties": {
                "task_id": {"type": "string", "description": "ID of the task"},
                "status": {"type": "string", "enum": ["pending", "in_progress", "completed", "failed"]},
                "notes": {"type": "string", "description": "Optional notes about the task"}
            },
            "required": ["task_id", "status"]
        }
    },
    {
        "name": "append_diary",
        "description": "Add an entry to the agent diary",
        "input_schema": {
            "type": "object",
            "properties": {
                "entry": {"type": "string", "description": "Diary entry content"}
            },
            "required": ["entry"]
        }
    },
    {
        "name": "commit_changes",
        "description": "Commit and push all changes to the repository",
        "input_schema": {
            "type": "object",
            "properties": {
                "message": {"type": "string", "description": "Commit message"}
            },
            "required": ["message"]
        }
    }
]


def execute_tool(name: str, input_data: dict) -> str:
    """Execute a tool and return the result."""
    try:
        if name == "read_file":
            file_path = REPO_ROOT / input_data["path"]
            if not file_path.exists():
                return f"Error: File not found: {input_data['path']}"
            return file_path.read_text()

        elif name == "write_file":
            file_path = REPO_ROOT / input_data["path"]
            file_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.write_text(input_data["content"])
            return f"Successfully wrote to {input_data['path']}"

        elif name == "run_command":
            result = subprocess.run(
                input_data["command"],
                shell=True,
                cwd=REPO_ROOT,
                capture_output=True,
                text=True,
                timeout=60
            )
            output = result.stdout + result.stderr
            return output if output else "(no output)"

        elif name == "update_task_status":
            tasks = load_tasks() if QUEUE_FILE.exists() else []
            for task in tasks:
                if task.get("id") == input_data["task_id"]:
                    task["status"] = input_data["status"]
                    if "notes" in input_data:
                        task["notes"] = input_data["notes"]
                    break
            save_tasks(tasks)
            return f"Updated task {input_data['task_id']} to {input_data['status']}"

        elif name == "append_diary":
            append_diary(input_data["entry"])
            return "Diary entry added."

        elif name == "commit_changes":
            return git_commit_and_push(input_data["message"])

        else:
            return f"Unknown tool: {name}"

    except Exception as e:
        return f"Error executing {name}: {e}"


def build_system_prompt() -> str:
    """Build the system prompt with current context."""
    state = load_state()
    tasks = load_tasks()

    return f"""You are The Operator - the autonomous intelligent agent for 864zeros.

## Your Identity
- You are NOT an assistant. You OWN this operation.
- Data-obsessed: No claim without evidence
- Ruthlessly honest: Say when ideas are bad
- Speed-biased: Ship over perfect
- Self-grading: Track predictions vs outcomes

## Current State
Tasks pending: {len(tasks)}
State files loaded: {list(state.keys())}

## Your Mission
Process the pending tasks in the queue. For each task:
1. Understand what needs to be done
2. Execute the task using the available tools
3. Update the task status when complete
4. Add a diary entry summarizing what you did
5. Commit and push changes

## The 864zeros Formula
- Time to MVP: ≤7 days
- Automation post-launch: ≥95%
- Score threshold: Pursue ≥75

## Pending Tasks
{json.dumps(tasks, indent=2) if tasks else "No pending tasks."}

Work autonomously. Ask questions only if truly blocked.
"""


def run_agent() -> None:
    """Run the autonomous agent loop."""
    client = anthropic.Anthropic()

    tasks = load_tasks()
    if not tasks:
        print("No pending tasks in queue.")
        append_diary("Agent run: No pending tasks found.")
        return

    print(f"Found {len(tasks)} pending task(s). Starting agent loop...")

    messages = [
        {
            "role": "user",
            "content": "Process all pending tasks in the queue. Work autonomously and update status as you complete each task."
        }
    ]

    for turn in range(MAX_TURNS):
        print(f"\n--- Turn {turn + 1}/{MAX_TURNS} ---")

        response = client.messages.create(
            model=MODEL,
            max_tokens=4096,
            system=build_system_prompt(),
            tools=TOOLS,
            messages=messages
        )

        # Process the response
        assistant_content = []
        tool_results = []

        for block in response.content:
            if block.type == "text":
                print(f"Agent: {block.text}")
                assistant_content.append(block)
            elif block.type == "tool_use":
                print(f"Tool call: {block.name}({json.dumps(block.input)[:100]}...)")
                assistant_content.append(block)

                result = execute_tool(block.name, block.input)
                print(f"Result: {result[:200]}...")

                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result
                })

        # Add assistant message
        messages.append({"role": "assistant", "content": assistant_content})

        # If there were tool calls, add results and continue
        if tool_results:
            messages.append({"role": "user", "content": tool_results})
        else:
            # No tool calls means agent is done
            print("\nAgent completed processing.")
            break

        # Check stop reason
        if response.stop_reason == "end_turn" and not tool_results:
            print("\nAgent signaled completion.")
            break

    print("\nAgent run finished.")


if __name__ == "__main__":
    run_agent()

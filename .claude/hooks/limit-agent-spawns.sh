#!/bin/bash
# PreToolUse hook for the "Agent" tool. Enforces a hard cap on how many
# subagents can be spawned in a single session by tracking a counter file
# keyed to the session id.

SESSION_ID="${CLAUDE_CODE_SESSION_ID:-nosession}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
COUNTER_FILE="${PROJECT_DIR}/.claude/.agent-call-count-${SESSION_ID}"
MAX_CALLS=3

COUNT=0
if [ -f "$COUNTER_FILE" ]; then
  COUNT=$(cat "$COUNTER_FILE")
fi

if [ "$COUNT" -ge "$MAX_CALLS" ]; then
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Agent spawn limit reached (max %d per session)."},"systemMessage":"Agent spawn limit reached: max %d subagents allowed per session. No further Agent tool calls are permitted this session."}\n' "$MAX_CALLS" "$MAX_CALLS"
  exit 0
fi

NEW_COUNT=$((COUNT + 1))
echo "$NEW_COUNT" > "$COUNTER_FILE"
exit 0

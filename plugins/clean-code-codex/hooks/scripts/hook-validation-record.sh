#!/usr/bin/env bash
# hook-validation-record.sh — PostToolUse Bash
# Records when a validation command completes so that hook-verification.sh
# knows validation is current.  Writes the current epoch to the
# "${STATE_FILE}.validated" marker file.
#
# Always exits 0 — this hook never blocks.

# Read tool input from stdin (same convention as hook-lib.sh)
_HOOK_INPUT="$(cat 2>/dev/null)" || exit 0

if [[ -z "$_HOOK_INPUT" ]]; then
  exit 0
fi

# Extract command string from tool input JSON
TOOL_COMMAND="$(echo "$_HOOK_INPUT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
ti = d.get('tool_input', d.get('toolArgs', {}))
if isinstance(ti, str):
    ti = json.loads(ti)
print(ti.get('command', ti.get('cmd', '')))
" 2>/dev/null)" || exit 0

# Only act on validation commands
case "$TOOL_COMMAND" in
  *"npm test"*|*"npm run validate"*|*"npm run validate:plugin"*)
    ;;
  *)
    exit 0
    ;;
esac

# Determine repo root and state file (same logic as hook-verification.sh)
REPO_ROOT="$(git -C "${HOOK_WORKING_DIR:-.}" rev-parse --show-toplevel 2>/dev/null)" || exit 0
STATE_FILE="${TMPDIR:-/tmp}/codex-verify-$(basename "$REPO_ROOT").state"

# Record validation timestamp
date +%s > "${STATE_FILE}.validated" 2>/dev/null || true

exit 0

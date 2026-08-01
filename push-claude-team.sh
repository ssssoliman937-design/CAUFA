#!/data/data/com.termux/files/usr/bin/bash
# Copies the phone's claude-team skills/agents into this repo's .claude/ and pushes them,
# so every Claude session on this project picks them up.
# Run from Termux:  bash push-claude-team.sh
set -e

TEAM="${TEAM:-/storage/emulated/0/claude-team}"
REPO="${REPO:-$(cd "$(dirname "$0")" && pwd)}"
BRANCH="${BRANCH:-claude/metadeck-setup-n05mmf}"

[ -d "$TEAM" ] || { echo "not found: $TEAM"; exit 1; }

mkdir -p "$REPO/.claude/skills" "$REPO/.claude/agents"

# claude-team may hold skills/agents at its root, or nested under skills/ and agents/
copy_from() {
  src="$1"; dst="$2"
  [ -d "$src" ] || return 0
  cp -r "$src"/. "$dst"/ && echo "  <- $src"
}

copy_from "$TEAM/skills" "$REPO/.claude/skills"
copy_from "$TEAM/agents" "$REPO/.claude/agents"
copy_from "$TEAM/.claude/skills" "$REPO/.claude/skills"
copy_from "$TEAM/.claude/agents" "$REPO/.claude/agents"

# loose *.md files at the root of claude-team: agents have a `tools:` or `model:` key,
# skills are SKILL.md inside a folder — anything else goes to agents/ by default
for f in "$TEAM"/*.md; do
  [ -e "$f" ] || continue
  cp "$f" "$REPO/.claude/agents/" && echo "  <- $f"
done

echo
echo "==> staged:"
git -C "$REPO" add .claude
git -C "$REPO" status --short .claude

git -C "$REPO" commit -m "Add claude-team skills and agents under .claude/" || echo "nothing to commit"
git -C "$REPO" push -u origin "$BRANCH"

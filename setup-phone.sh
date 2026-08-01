#!/data/data/com.termux/files/usr/bin/bash
# Sets up the CAUFA project on an Android phone under /storage/emulated/0/claude-team
# Run from Termux:  bash setup-phone.sh
set -e

BASE="${BASE:-/storage/emulated/0/claude-team}"
REPO="${REPO:-https://github.com/ssssoliman937-design/CAUFA}"
BRANCH="${BRANCH:-claude/metadeck-setup-n05mmf}"
DIR="$BASE/CAUFA"

command -v git >/dev/null || { echo "git not found -> pkg install git"; exit 1; }

# Termux needs storage permission before /storage/emulated/0 is writable
[ -d /storage/emulated/0 ] || { echo "Run: termux-setup-storage  (then allow the permission)"; exit 1; }

mkdir -p "$BASE"

if [ -d "$DIR/.git" ]; then
  echo "==> updating $DIR"
  git -C "$DIR" fetch origin "$BRANCH"
  git -C "$DIR" checkout "$BRANCH"
  git -C "$DIR" pull origin "$BRANCH"
else
  echo "==> cloning into $DIR"
  git clone -b "$BRANCH" "$REPO" "$DIR"
fi

echo
echo "Done: $DIR"
ls -1 "$DIR"

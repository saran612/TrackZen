#!/bin/bash

# Absolute path of workspace root
WORKSPACE_DIR="/home/saran/project/TrackZen"
BACKEND_DIR="$WORKSPACE_DIR/backend"
FRONTEND_DIR="$WORKSPACE_DIR/frontend"

echo "Stopping all existing frontend and backend instances..."
# Kill python processes running run.py
pkill -f "run.py" || true
# Kill vite / npm dev server processes
pkill -f "vite" || true
pkill -f "node.*run dev" || true

sleep 2

echo "Starting TrackZen Backend..."
cd "$BACKEND_DIR"
nohup .venv/bin/python -u run.py > backend.log 2>&1 &

echo "Starting TrackZen Frontend..."
cd "$FRONTEND_DIR"
nohup npm run dev > frontend.log 2>&1 &

echo "TrackZen services restarted successfully in the background."

#!/bin/bash

echo "Starting Backend (Uvicorn) using venv..."
./venv/bin/uvicorn app:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a bit for backend to initialize
sleep 2

echo "Starting Frontend (Vite)..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo "Systems active:"
echo "- Backend: http://localhost:8000"
echo "- Frontend: http://localhost:3000"

# Wait for both processes
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait

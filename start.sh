#!/bin/bash
                                                   
echo "Starting Frontend (Vite)..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo "Systems active:"
echo "- Backend: http://localhost:8000"
echo "- Frontend: http://localhost:3000"

# Wait for both processes
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait

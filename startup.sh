#!/bin/sh

export ATLAS_URI=mongodb+srv://sirzechs:syZza8L6HfpgsRZR@cluster0.pz2imhj.mongodb.net/?retryWrites=true

# Start the frontend
cd /app/frontend && serve -s build -l 3000 &
sleep 5

# Start the backend
cd /app/backend && npm run dev &
sleep 5

# Start Nginx in the foreground
nginx -g "daemon off;"

# Multi-stage build for frontend
FROM node:18-alpine as frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Backend stage
FROM python:3.10-slim as backend
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./

# Copy frontend build to backend
COPY --from=frontend-builder /app/frontend/build ./static

# Install nginx to serve frontend
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Configure nginx
COPY <<EOF /etc/nginx/sites-available/default
server {
    listen 3000;
    location / {
        root /app/static;
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

EXPOSE 8000 3000

# Start both services (Nginx, Run DB Migrations, then Uvicorn)
CMD ["sh", "-c", "nginx && alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000"]

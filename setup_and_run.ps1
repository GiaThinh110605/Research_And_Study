Write-Host "Starting services with docker compose..."
docker compose -f docker-compose.dev.yml up -d --build

Write-Host "Waiting for backend container to be ready (10 seconds)..."
Start-Sleep -Seconds 10

Write-Host "Creating database tables and seeding default user inside backend container..."
docker compose -f docker-compose.dev.yml exec backend python create_tables.py
docker compose -f docker-compose.dev.yml exec backend python seed_user.py

Write-Host "Setup complete. Access the app at: http://localhost:3000"
Write-Host "API docs: http://localhost:8000/docs"
Write-Host "Admin: username=admin  password=admin123"

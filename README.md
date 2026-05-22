# Research and Study to help student with their homework and don't comsuming time 
- web: https://research-and-study.onrender.com

# Contributors:
- [Lâm Gia Thịnh] (leader) - DHKHMT19A

# Techonologies Used: 
- Fronted: ReactJS
- Backend: FastAPI
- Database: PostgreSQL
- Design UI: Stitch (https://stitch.withgoogle.com/projects/6010126405400371290)
- Design Database: Use Case Diagram

# CI/CD: 
- Github Action
- Docker
- Deploy: render

# Guild run the project:
- 1. Clone the project: 

    git clone https://github.com/GiaThinh110605/AI_Research.git

## 📊 Statistic contribute in this project: 
![Contributors](https://contrib.rocks/image?repo=GiaThinh110605/AI_Research)


## Documentation: 
- https://docs.google.com/document/d/1VK-sPX6wGNsVy-2yWqqd7CMiBh_2E9FE/edit?usp=sharing&ouid=116261595522292024849&rtpof=true&sd=true

## Start all services (Database, Backend, Frontend)
```bash
cd backend 
python create_tables.py
- run docker compose 
docker compose -f docker-compose.dev.yml up -d --build
```

### Access links:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

## Stop all services
```bash
docker compose -f docker-compose.dev.yml down
```

## Automated setup script (for the first time or if you want to reset the environment)
Run the root script to start Docker, create tables, and seed the default admin user.

```bash
chmod +x setup_and_run.sh
./setup_and_run.sh
```

To import example test data after setup:

```bash
chmod +x seed_full_data.sh
./seed_full_data.sh
```

## Test accounts
- admin / admin123
- student1 / student123
- lecturer1 / lecturer123

## Test results (backend)
- `59 passed`

Reproduce with:
```bash
docker compose -f docker-compose.dev.yml exec backend pytest -q
```




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
- If you are the first time to visit
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

# Run unit test for specific file

- An example: docker compose -f docker-compose.dev.yml exec backend pytest tests/test_middleware_auth.py


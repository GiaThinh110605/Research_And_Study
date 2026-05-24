# Research and Study
- web: https://research-and-study.onrender.com

# Contributors:
- [Lâm Gia Thịnh] (leader) - DHKHMT19A

# Techonologies Used: 
- Fronted: ReactJS
- Backend: FastAPI
- Database: PostgreSQL
- Design UI: Stitch (https://stitch.withgoogle.com/projects/871614783666700392)
- Design Database: Use Case Diagram

# CI/CD: 
- Github Action
- Docker
- Deploy: render

## 📊 Statistic contribute in this project: 
![Contributors](https://contrib.rocks/image?repo=GiaThinh110605/AI_Research)


## Documentation: 
- https://docs.google.com/document/d/1VK-sPX6wGNsVy-2yWqqd7CMiBh_2E9FE/edit?usp=sharing&ouid=116261595522292024849&rtpof=true&sd=true


## Cho lần đầu tiên chạy dự án 
## Vào google drive để lấy .env của hệ thống để chạy dự án
## Bật ứng dụng docker


- 1. Clone project: 

    git clone https://github.com/GiaThinh110605/AI_Research.git

## Setup environment variables
Copy `.env-example` đến `.env` để chạy dự án liên quan đến các biến môi trường.
- Liên hệ Lâm Gia Thịnh để lấy các giá trị .env

macOS / Linux:
```bash
cp backend/.env-example backend/.env
cp frontend/.env-example frontend/.env
```

Windows (PowerShell):
```powershell
Copy-Item backend\.env-example backend\.env
Copy-Item frontend\.env-example frontend\.env
```

chỉnh sửa `backend/.env` và `frontend/.env` nếu bạn cần thay đổi những giá trị database, API, hoặc secret.

- chạy script để chạy Docker, tạo tables, và seed default admin/student/lecturer.

macOS / Linux:
```bash
chmod +x setup_and_run.sh
./setup_and_run.sh
```

Windows (PowerShell):
```powershell
powershell -ExecutionPolicy Bypass -File .\setup_and_run.ps1
```

import test data sau khi khởi tạo:

macOS / Linux:
```bash
chmod +x seed_full_data.sh
./seed_full_data.sh
```

Windows (PowerShell):
```powershell
powershell -ExecutionPolicy Bypass -File .\seed_full_data.ps1
```

- Sau khi xong những bước trên:
- chạy: docker compose -f docker-compose.dev.yml up -d --build

### Access links:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

## Test accounts
- admin / admin123
- student1 / student123
- lecturer1 / lecturer123

## Test results (backend)
- `59 passed`

Chạy test:
```bash
docker compose -f docker-compose.dev.yml exec backend pytest -q
```



## Chạy tất cả services cho lần thứ 2 trở đi khi vào dự án (Database, Backend, Frontend)
```bash
cd backend
python create_tables.py
# run docker compose
docker compose -f docker-compose.dev.yml up -d --build
```


## Stop all services
```bash
docker compose -f docker-compose.dev.yml down
```

### Access links:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
# Hisab - Docker Deployment Guide

## Quick Deployment (macOS/Linux)

This guide explains how to deploy Hisab using Docker after pushing code from your Windows development machine.

### Prerequisites
- Docker and Docker Compose installed on macOS
- Git repository access
- MySQL database running at `10.10.10.201`

### Deployment Steps

#### 1. Clone/Pull Repository on macOS
```bash
# Clone the repository (first time)
git clone <your-repo-url> hisab
cd hisab

# Or pull latest changes
cd hisab
git pull origin main
```

#### 2. Configure Environment (Optional)
The database configuration is already set in [`docker-compose.yml`](docker-compose.yml:13). If you need to change it:

```bash
# Edit docker-compose.yml and update environment variables:
# - DB_HOST=10.10.10.201
# - DB_USER=root
# - DB_PASSWORD=admin
# - DB_NAME=emergent_splitwise_db
```

#### 3. Build and Run
```bash
# Build and start all services
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

#### 4. Access the Application

**From Docker Host (10.10.10.131):**
- **Frontend**: http://localhost or http://10.10.10.131
- **Backend API**: http://localhost:8000 or http://10.10.10.131:8000
- **API Documentation**: http://10.10.10.131:8000/docs

**From Other Devices on Network:**
- **Frontend**: http://10.10.10.131
- **Backend API**: http://10.10.10.131:8000
- **Mobile App**: Configure [`mobile/.env`](mobile/.env) with `API_URL=http://10.10.10.131:8000`

### Managing the Deployment

#### Stop Services
```bash
docker-compose stop
```

#### Start Services
```bash
docker-compose start
```

#### Restart Services
```bash
docker-compose restart
```

#### Stop and Remove Containers
```bash
docker-compose down
```

#### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

#### Rebuild After Code Changes
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up --build -d
```

### Troubleshooting

#### Check Container Status
```bash
docker-compose ps
```

#### Check Container Health
```bash
docker inspect hisab-backend --format='{{.State.Health.Status}}'
docker inspect hisab-frontend --format='{{.State.Health.Status}}'
```

#### Access Container Shell
```bash
# Backend
docker exec -it hisab-backend /bin/bash

# Frontend
docker exec -it hisab-frontend /bin/sh
```

#### Database Connection Issues
Ensure the MySQL database at `10.10.10.201` is:
- Running and accessible from the Docker host
- Has the database `emergent_splitwise_db` created
- Accepts connections from the Docker network

Test connection:
```bash
# From host machine
mysql -h 10.10.10.201 -u root -p -e "SHOW DATABASES;"
```

#### Port Conflicts
If ports 80 or 8000 are already in use, modify [`docker-compose.yml`](docker-compose.yml:12):
```yaml
ports:
  - "0.0.0.0:8080:80"  # Frontend (change 8080 to any available port)
  - "0.0.0.0:8001:8000"  # Backend (change 8001 to any available port)
```

#### Network Access Issues
If you cannot access from other devices:
1. Check firewall settings on Docker host (10.10.10.131)
2. Ensure ports 80 and 8000 are open:
   ```bash
   # macOS
   sudo lsof -i :80
   sudo lsof -i :8000
   ```
3. Verify Docker is binding to all interfaces (0.0.0.0) - already configured in [`docker-compose.yml`](docker-compose.yml:29)
4. Test from another device:
   ```bash
   curl http://10.10.10.131
   curl http://10.10.10.131:8000/api/users/me
   ```

### Architecture

The deployment consists of:

1. **Backend Container** ([`Dockerfile.backend`](Dockerfile.backend:1))
   - Python 3.11 with FastAPI
   - Uvicorn server
   - Connects to external MySQL at 10.10.10.201
   - Exposed on port 8000

2. **Frontend Container** ([`Dockerfile.frontend`](Dockerfile.frontend:1))
   - React production build
   - Nginx web server
   - Proxies `/api/*` requests to backend
   - Exposed on port 80

3. **Network**
   - Both containers on `hisab-network` bridge network
   - Frontend proxies API requests to backend via service name

### File Structure
```
.
├── Dockerfile.backend      # Backend container definition
├── Dockerfile.frontend     # Frontend container definition
├── docker-compose.yml      # Orchestration configuration
├── nginx.conf             # Nginx configuration for frontend
├── .dockerignore          # Files to exclude from Docker context
├── backend/               # Backend source code
└── frontend/              # Frontend source code
```

### Development Workflow

1. **Develop on Windows**
   - Make code changes
   - Test locally with separate backend/frontend servers

2. **Commit and Push**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

3. **Deploy on macOS**
   ```bash
   git pull origin main
   docker-compose up --build -d
   ```

### Mobile App Configuration

The mobile app needs to point to the deployed backend. Update [`mobile/.env`](mobile/.env):

```bash
# For local network access from mobile device
API_URL=http://10.10.10.131:8000
```

The mobile app will connect to the backend running on the Docker host at `10.10.10.131`.

### Production Considerations

For production deployment:

1. **HTTPS/SSL**: Add SSL certificates and configure Nginx
2. **Environment Variables**: Use separate production env files
3. **Database Backups**: Implement regular backup strategy
4. **Monitoring**: Add logging and monitoring tools
5. **Scaling**: Consider using Docker Swarm or Kubernetes
6. **Secrets Management**: Use Docker secrets or external vault

# Production Deployment Checklist - macOS

Follow these steps on your macOS machine (10.10.10.131) for production launch.

## Pre-Deployment Checklist

### 1. Verify Prerequisites
```bash
# Check Docker is installed
docker --version
docker-compose --version

# Check Git is installed
git --version

# Check MySQL database is accessible
mysql -h 10.10.10.201 -u root -p -e "SHOW DATABASES;" | grep emergent_splitwise_db
```

### 2. Clone/Update Repository
```bash
# Navigate to your preferred directory
cd ~/Projects  # or wherever you want to store the project

# Clone repository (if first time)
git clone <your-repo-url> hisab
cd hisab

# OR if already cloned, pull latest changes
cd ~/Projects/hisab  # adjust path as needed
git pull origin main
```

### 3. Verify Configuration Files
```bash
# Verify docker-compose.yml exists
cat docker-compose.yml

# Verify Dockerfiles exist
ls -la Dockerfile.backend Dockerfile.frontend nginx.conf

# Check database configuration in docker-compose.yml
grep -A 4 "environment:" docker-compose.yml
```

## Production Deployment Steps

### Step 1: Stop Any Existing Containers
```bash
# Stop and remove any running containers
docker-compose down

# Clean up old images (optional, for fresh build)
docker system prune -f
```

### Step 2: Build Docker Images
```bash
# Build both frontend and backend images
docker-compose build

# Verify images are created
docker images | grep hisab
```

### Step 3: Start Services in Production Mode
```bash
# Start services in detached mode
docker-compose up -d

# This will:
# - Build the backend (Python/FastAPI)
# - Build the frontend (React + Nginx)
# - Start both containers
# - Connect to MySQL at 10.10.10.201
```

### Step 4: Verify Deployment
```bash
# Check container status (should show "Up" and "healthy")
docker-compose ps

# Expected output:
# NAME                  STATUS                    PORTS
# hisab-backend         Up (healthy)             0.0.0.0:8000->8000/tcp
# hisab-frontend        Up (healthy)             0.0.0.0:80->80/tcp
```

### Step 5: Check Logs
```bash
# View all logs
docker-compose logs

# View backend logs only
docker-compose logs backend

# View frontend logs only
docker-compose logs frontend

# Follow logs in real-time (Ctrl+C to exit)
docker-compose logs -f
```

### Step 6: Test Application Access

#### From macOS Terminal
```bash
# Test backend health
curl http://localhost:8000/api/users/me

# Test frontend (should return HTML)
curl -I http://localhost/

# Test from network IP
curl http://10.10.10.131:8000/api/users/me
curl -I http://10.10.10.131/
```

#### From Browser on macOS
1. Open Safari/Chrome
2. Navigate to: `http://localhost` or `http://10.10.10.131`
3. Navigate to: `http://10.10.10.131:8000/docs` (API documentation)

#### From Windows PC
1. Open browser on your Windows machine
2. Navigate to: `http://10.10.10.131`
3. Test login and functionality

#### From Mobile Device
1. Ensure mobile device is on same network
2. Update `mobile/.env` file: `API_URL=http://10.10.10.131:8000`
3. Restart Expo: `npx expo start --clear`
4. Test mobile app connectivity

## Post-Deployment Verification

### Health Checks
```bash
# Check container health status
docker inspect hisab-backend --format='{{.State.Health.Status}}'
docker inspect hisab-frontend --format='{{.State.Health.Status}}'

# Should both return: "healthy"
```

### Resource Usage
```bash
# Check container resource usage
docker stats --no-stream

# View disk usage
docker system df
```

### Database Connectivity
```bash
# Access backend container shell
docker exec -it hisab-backend /bin/bash

# Inside container, test database connection
python -c "import pymysql; conn = pymysql.connect(host='10.10.10.201', user='root', password='admin', db='emergent_splitwise_db'); print('DB Connected!'); conn.close()"

# Exit container
exit
```

## Ongoing Management

### View Real-time Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### Stop Services (without removing)
```bash
docker-compose stop
```

### Start Services (after stop)
```bash
docker-compose start
```

### Complete Shutdown
```bash
# Stop and remove containers (data in MySQL remains intact)
docker-compose down
```

### Update After Code Changes
```bash
# Pull latest code from Windows
git pull origin main

# Rebuild and restart
docker-compose up --build -d

# Check logs for any errors
docker-compose logs -f
```

## Troubleshooting

### Container Won't Start
```bash
# Check for port conflicts
sudo lsof -i :80
sudo lsof -i :8000

# Kill process using port (if needed)
sudo kill -9 <PID>

# Try starting again
docker-compose up -d
```

### Cannot Access from Network
```bash
# Check macOS firewall settings
# System Preferences > Security & Privacy > Firewall

# Verify Docker is binding to 0.0.0.0
docker-compose ps

# Test from macOS first
curl http://10.10.10.131
```

### Database Connection Failed
```bash
# Test MySQL connectivity from macOS
mysql -h 10.10.10.201 -u root -padmin emergent_splitwise_db -e "SELECT 1"

# Check backend logs for connection errors
docker-compose logs backend | grep -i error
```

### Container Health Check Failing
```bash
# View detailed health check logs
docker inspect hisab-backend --format='{{json .State.Health}}' | python -m json.tool
docker inspect hisab-frontend --format='{{json .State.Health}}' | python -m json.tool

# Check logs for errors
docker-compose logs backend
docker-compose logs frontend
```

## Production URLs

After successful deployment:

- **Web Application**: `http://10.10.10.131`
- **API Backend**: `http://10.10.10.131:8000`
- **API Documentation**: `http://10.10.10.131:8000/docs`
- **Mobile Backend**: `http://10.10.10.131:8000`

## Security Notes

For production environment:
1. ✅ Database is on separate host (10.10.10.201)
2. ⚠️ Consider adding SSL/HTTPS certificates
3. ⚠️ Store sensitive credentials in Docker secrets
4. ⚠️ Enable macOS firewall and open only ports 80, 8000
5. ⚠️ Set up regular database backups
6. ⚠️ Implement monitoring and alerting

## Backup Strategy

```bash
# Database backup (run on DB server 10.10.10.201)
mysqldump -h 10.10.10.201 -u root -p emergent_splitwise_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Container logs backup
docker-compose logs > logs_$(date +%Y%m%d_%H%M%S).txt
```

## Quick Commands Reference

```bash
# Deploy
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose stop

# Start
docker-compose start

# Shutdown
docker-compose down

# Update and redeploy
git pull && docker-compose up --build -d
```

## Success Criteria

✅ Both containers show "Up (healthy)" status
✅ Can access web app at http://10.10.10.131
✅ Can access API docs at http://10.10.10.131:8000/docs
✅ Can login and create expenses from web
✅ Mobile app connects successfully
✅ No error logs in `docker-compose logs`
✅ Database queries working correctly

---

**Need Help?** Check logs with `docker-compose logs -f` or refer to [`DEPLOYMENT.md`](DEPLOYMENT.md) for detailed troubleshooting.

# Alternative Deployment for macOS in VMware

Since Docker Desktop requires Hypervisor framework (nested virtualization), here are alternative solutions for macOS running in VMware.

## Option 1: Podman (Recommended - Docker Alternative)

Podman is a daemonless container engine that works without nested virtualization.

### Install Podman on macOS VM
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Podman
brew install podman

# Initialize Podman machine (uses QEMU instead of Hypervisor framework)
podman machine init

# Start Podman machine
podman machine start

# Verify installation
podman --version
podman ps
```

### Deploy with Podman
```bash
cd ~/Projects/hisab

# Build backend image
podman build -f Dockerfile.backend -t hisab-backend .

# Build frontend image
podman build -f Dockerfile.frontend -t hisab-frontend .

# Run backend container
podman run -d \
  --name hisab-backend \
  -p 0.0.0.0:8000:8000 \
  -e DB_HOST=10.10.10.201 \
  -e DB_USER=root \
  -e DB_PASSWORD=admin \
  -e DB_NAME=emergent_splitwise_db \
  --restart unless-stopped \
  hisab-backend

# Run frontend container
podman run -d \
  --name hisab-frontend \
  -p 0.0.0.0:80:80 \
  --restart unless-stopped \
  hisab-frontend

# Check status
podman ps

# View logs
podman logs hisab-backend
podman logs hisab-frontend
```

### Manage Podman Containers
```bash
# Stop containers
podman stop hisab-backend hisab-frontend

# Start containers
podman start hisab-backend hisab-frontend

# Restart containers
podman restart hisab-backend hisab-frontend

# Remove containers
podman rm -f hisab-backend hisab-frontend

# View logs
podman logs -f hisab-backend
```

## Option 2: Manual Deployment (No Containers)

Deploy directly on macOS without containers.

### Backend Setup
```bash
cd ~/Projects/hisab

# Install Python 3.11
brew install python@3.11

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DB_HOST=10.10.10.201
DB_USER=root
DB_PASSWORD=admin
DB_NAME=emergent_splitwise_db
EOF

# Run backend server
uvicorn server:app --host 0.0.0.0 --port 8000 &

# Save PID for later management
echo $! > backend.pid
```

### Frontend Setup
```bash
cd ~/Projects/hisab/frontend

# Install Node.js and npm (if not installed)
brew install node

# Install dependencies
npm install

# Build production version
npm run build

# Install serve to host static files
npm install -g serve

# Serve frontend on port 80 (requires sudo)
sudo serve -s build -l 80 &

# Or serve on port 3000 (no sudo needed)
serve -s build -l 3000 &
```

### Using Nginx for Frontend (Better Option)
```bash
# Install Nginx
brew install nginx

# Copy built files to Nginx directory
sudo cp -r ~/Projects/hisab/frontend/build/* /usr/local/var/www/

# Copy nginx config
sudo cp ~/Projects/hisab/nginx.conf /usr/local/etc/nginx/servers/hisab.conf

# Edit nginx config to adjust paths
sudo nano /usr/local/etc/nginx/servers/hisab.conf
# Change: root /usr/share/nginx/html;
# To: root /usr/local/var/www;

# Test Nginx configuration
sudo nginx -t

# Start Nginx
sudo nginx

# Or restart if already running
sudo nginx -s reload
```

### Process Management Scripts
```bash
# Create start script
cat > ~/Projects/hisab/start.sh << 'EOF'
#!/bin/bash
cd ~/Projects/hisab/backend
source ../venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8000 > ../logs/backend.log 2>&1 &
echo $! > backend.pid
echo "Backend started (PID: $(cat backend.pid))"

sudo nginx
echo "Frontend started"
EOF

chmod +x ~/Projects/hisab/start.sh

# Create stop script
cat > ~/Projects/hisab/stop.sh << 'EOF'
#!/bin/bash
if [ -f ~/Projects/hisab/backend/backend.pid ]; then
    kill $(cat ~/Projects/hisab/backend/backend.pid)
    rm ~/Projects/hisab/backend/backend.pid
    echo "Backend stopped"
fi

sudo nginx -s stop
echo "Frontend stopped"
EOF

chmod +x ~/Projects/hisab/stop.sh

# Create logs directory
mkdir -p ~/Projects/hisab/logs
```

## Option 3: Lima (Lightweight VM for Containers)

Lima provides Linux VMs for macOS and works with VMware.

```bash
# Install Lima
brew install lima

# Start Lima VM
limactl start

# Use Lima with Docker commands
lima docker --version

# Deploy using docker-compose through Lima
cd ~/Projects/hisab
lima docker-compose up --build -d

# Manage containers
lima docker-compose ps
lima docker-compose logs -f
lima docker-compose stop
lima docker-compose start
```

## Option 4: Colima (Container Runtime)

Colima is another lightweight alternative.

```bash
# Install Colima
brew install colima

# Start Colima
colima start

# Use with Docker commands
docker --version
docker-compose --version

# Deploy normally
cd ~/Projects/hisab
docker-compose up --build -d
```

## Option 5: Deploy on Physical macOS Machine

If you have access to a physical macOS machine on the network:
1. Install Docker Desktop on physical Mac
2. Follow the original [`PRODUCTION-CHECKLIST.md`](PRODUCTION-CHECKLIST.md)
3. Deploy with full Docker support

## Recommended Solution for Your Situation

**Use Option 2 (Manual Deployment)** - It's the simplest for a VM environment:

### Quick Manual Deployment Steps
```bash
# 1. Clone repository
cd ~
git clone <your-repo-url> hisab
cd hisab

# 2. Install dependencies
brew install python@3.11 node nginx

# 3. Setup backend
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DB_HOST=10.10.10.201
DB_USER=root
DB_PASSWORD=admin
DB_NAME=emergent_splitwise_db
EOF

# Run backend
uvicorn server:app --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
echo $! > backend.pid

# 4. Setup frontend
cd ../frontend
npm install
npm run build

# 5. Setup Nginx
sudo cp -r build/* /usr/local/var/www/
sudo cp ../nginx.conf /usr/local/etc/nginx/servers/hisab.conf

# Edit nginx config
sudo sed -i '' 's|/usr/share/nginx/html|/usr/local/var/www|g' /usr/local/etc/nginx/servers/hisab.conf

# Start Nginx
sudo nginx

# 6. Verify
curl http://localhost:8000/docs
curl http://localhost/
```

## Access URLs (All Options)

- **Frontend**: http://10.10.10.131 (or http://10.10.10.131:3000 if using serve)
- **Backend**: http://10.10.10.131:8000
- **API Docs**: http://10.10.10.131:8000/docs

## Troubleshooting VMware Nested Virtualization

If you really want Docker Desktop:
```bash
# Enable nested virtualization in VMware (from Windows host)
# 1. Shut down the macOS VM
# 2. Edit the .vmx file and add:
vhv.enable = "TRUE"
hypervisor.cpuid.v0 = "FALSE"

# 3. Start VM and try Docker Desktop again
```

However, this is not guaranteed to work and may cause instability.

## Comparison Table

| Solution | Ease | Performance | Containerized | Recommended |
|----------|------|-------------|---------------|-------------|
| Podman | Medium | Good | Yes | ⭐⭐⭐⭐ |
| Manual | Easy | Excellent | No | ⭐⭐⭐⭐⭐ |
| Lima | Medium | Good | Yes | ⭐⭐⭐ |
| Colima | Easy | Good | Yes | ⭐⭐⭐⭐ |
| Physical Mac | Easy | Excellent | Yes | ⭐⭐⭐⭐⭐ |

For macOS in VMware, I recommend **Manual Deployment (Option 2)** as it's the most reliable and performant solution.

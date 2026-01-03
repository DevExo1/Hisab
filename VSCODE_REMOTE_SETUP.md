# VS Code Remote Development Setup Guide

## Prerequisites
- VS Code installed on your local machine
- SSH access to Ubuntu server
- Docker running on Ubuntu server

---

## Method 1: SSH + Volume Mount (Recommended)

### Step 1: Install VS Code Extensions

Open VS Code and install:
1. **Remote - SSH** (`ms-vscode-remote.remote-ssh`)
2. **Docker** (`ms-azuretools.vscode-docker`)
3. **Remote - Containers** (optional: `ms-vscode-remote.remote-containers`)

### Step 2: Configure SSH Connection

#### Option A: Using SSH Config File
```bash
# On your local machine, edit ~/.ssh/config
code ~/.ssh/config
```

Add:
```
Host hisab-server
    HostName your-ubuntu-ip-or-domain
    User your-username
    Port 22
    IdentityFile ~/.ssh/id_rsa  # Or your SSH key path
```

#### Option B: Direct Connection
```
1. Press F1 in VS Code
2. Type: "Remote-SSH: Connect to Host"
3. Enter: user@your-ubuntu-ip
4. Enter password or use SSH key
```

### Step 3: Open Project Folder

Once connected to Ubuntu:
```
1. File → Open Folder
2. Navigate to: /home/user/hisab-app (or wherever your code is)
3. Click "OK"
```

### Step 4: Start Developing!

```bash
# Your project structure on Ubuntu:
/home/user/hisab-app/
├── backend/
│   ├── server.py       ← Edit this
│   └── ...
├── frontend/
│   ├── src/
│   │   └── App.js      ← Edit this
│   └── ...
└── docker-compose.yml

# Any changes automatically sync to containers via volume mounts!
```

---

## Method 2: Attach to Running Container

### Step 1: Connect to Ubuntu via SSH
```
F1 → "Remote-SSH: Connect to Host" → your-ubuntu-ip
```

### Step 2: View Containers
```
1. Click Docker icon in left sidebar
2. Expand "Containers" section
3. Find your running containers:
   - hisab-backend
   - hisab-frontend
   - hisab-db
```

### Step 3: Attach to Container
```
1. Right-click on "hisab-backend"
2. Select "Attach Visual Studio Code"
3. New VS Code window opens INSIDE the container
4. You're now in /app directory inside container
```

### Step 4: Edit Container Files
```
# You can now edit files directly in the container
# Useful for debugging or checking container environment
```

---

## Method 3: Port Forwarding for Hot Reload

If you're running dev servers, forward ports for hot reload:

### Automatic Port Forwarding
```
1. When connected via Remote-SSH
2. VS Code automatically detects exposed ports
3. Click "Ports" tab in bottom panel
4. Ports 3000 (frontend) and 8000 (backend) appear
5. Click "Open in Browser" to access
```

### Manual Port Forwarding
```
1. Press F1
2. "Forward a Port"
3. Enter: 3000 (for frontend)
4. Local browser can now access http://localhost:3000
```

---

## Development Workflow

### Backend Development
```bash
# 1. Connect to Ubuntu via SSH
# 2. Open /home/user/hisab-app
# 3. Edit backend/server.py
# 4. Restart backend container:
docker-compose restart backend

# OR if you have hot reload:
# Changes apply automatically
```

### Frontend Development
```bash
# 1. Connect to Ubuntu via SSH
# 2. Open /home/user/hisab-app
# 3. Edit frontend/src/App.js
# 4. If dev server is running with hot reload:
#    Changes appear immediately in browser
# 5. If production build:
docker-compose restart frontend
```

### Database Changes
```bash
# 1. Connect to Ubuntu
# 2. Edit backend/schema.sql or migrations
# 3. Apply changes:
docker exec -it hisab-db mysql -u root -p < backend/schema.sql
```

---

## Useful VS Code Extensions for Remote Development

Install these once connected to Ubuntu:

### Essential
- **Python** (`ms-python.python`) - For backend development
- **Pylance** (`ms-python.vscode-pylance`) - Python IntelliSense
- **ES7+ React/Redux/React-Native snippets** - For frontend
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting

### Docker-specific
- **Docker** (`ms-azuretools.vscode-docker`)
- **Remote - Containers** (`ms-vscode-remote.remote-containers`)

### Nice to have
- **GitLens** - Enhanced Git features
- **Thunder Client** - API testing (like Postman)
- **MySQL** - Database management

---

## Troubleshooting

### Issue: "Could not establish connection"
```bash
# Check SSH access:
ssh user@your-ubuntu-ip

# If that works, check VS Code SSH config:
# F1 → "Remote-SSH: Open SSH Configuration File"
```

### Issue: "Permission denied"
```bash
# Ensure your SSH key is added:
ssh-copy-id user@your-ubuntu-ip

# Or use password authentication
```

### Issue: "Container not found"
```bash
# Check containers are running:
ssh user@your-ubuntu-ip
docker ps

# Start containers if needed:
docker-compose up -d
```

### Issue: "Changes not reflecting in container"
```bash
# Check volume mounts in docker-compose.yml:
volumes:
  - ./backend:/app  # Must be present

# Restart containers:
docker-compose restart
```

### Issue: "Port already in use"
```bash
# Kill VS Code's port forwarding:
F1 → "Forward a Port: Stop Forwarding Port"

# Or kill process using the port:
lsof -ti:3000 | xargs kill -9
```

---

## Best Practices

### 1. Use Volume Mounts for Development
```yaml
# docker-compose.yml
services:
  backend:
    volumes:
      - ./backend:/app  # ← This enables live editing
```

### 2. Keep Code on Host, Not in Container
```
✅ Edit: /home/user/hisab-app/backend/server.py (host)
❌ Edit: /app/server.py (inside container)

Why? Host changes persist, container changes are lost on restart.
```

### 3. Use .gitignore for Remote
```bash
# Add to .gitignore:
.vscode-server/
.vscode/
```

### 4. Restart Containers After Changes
```bash
# For Python backend (no hot reload):
docker-compose restart backend

# For Node frontend (with hot reload):
# No restart needed if dev server running
```

---

## Quick Reference

### Connect to Server
```
F1 → Remote-SSH: Connect to Host → your-server
```

### Open Project
```
File → Open Folder → /home/user/hisab-app
```

### Restart Container
```bash
docker-compose restart backend
docker-compose restart frontend
```

### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Access Terminal
```
Terminal → New Terminal (runs on Ubuntu server)
```

### Forward Port
```
F1 → Forward a Port → 3000
```

---

## Security Notes

⚠️ **Never commit SSH keys to Git**
⚠️ **Use SSH keys instead of passwords**
⚠️ **Don't expose ports unnecessarily**
⚠️ **Keep VS Code extensions updated**

---

## Summary

**Recommended Setup:**
1. Install "Remote - SSH" extension
2. Connect to Ubuntu server
3. Open project folder
4. Edit files directly (volume mounts sync to containers)
5. Restart containers when needed

**This gives you:**
- ✅ Full VS Code features on remote server
- ✅ Direct file editing with auto-sync
- ✅ Terminal access to Ubuntu
- ✅ Docker container management
- ✅ Git integration
- ✅ Debugging capabilities

Happy coding! 🚀

# Ubuntu Server Installation Guide for Hisab Deployment

## Installation Options During Ubuntu Server Setup

### Screen-by-Screen Guide

#### 1. Language Selection
- **Choose**: English (or your preference)

#### 2. Keyboard Configuration
- **Choose**: English (US) or your keyboard layout

#### 3. Installation Type
- **Choose**: Ubuntu Server (default)
- Don't select minimized version

#### 4. Network Connections
**Initial Setup:**
- **Choose**: Accept DHCP (automatic) for now
- Note: We'll configure static IP (10.10.10.131) after installation
- If prompted about network config, select "Done" with defaults

#### 5. Proxy Configuration
- **Choose**: Leave blank (no proxy needed)
- Select "Done"

#### 6. Ubuntu Archive Mirror
- **Choose**: Keep default mirror
- Select "Done"

#### 7. Guided Storage Configuration
**Important Settings:**
- **Use entire disk**: YES ✅
- **Set up this disk as an LVM group**: NO ❌ (uncheck this)
- **Encrypt the LVM group**: NO ❌
- Just use simple partition layout
- Select "Done" → "Continue" to confirm

#### 8. Profile Setup
**Required Information:**
- **Your name**: e.g., "Admin" or your name
- **Your server's name**: `hisab-server` (or any name you like)
- **Pick a username**: e.g., `admin` or your choice
- **Choose a password**: Strong password (you'll need this!)
- **Confirm password**: Same password

#### 9. Upgrade to Ubuntu Pro
- **Choose**: Skip for now (select "Continue")
- Not needed for this deployment

#### 10. SSH Setup ⭐ IMPORTANT
**Install OpenSSH server:**
- ✅ **Check this box**: "Install OpenSSH server"
- This is CRITICAL for remote access from Windows
- **Import SSH identity**: Skip/No (don't import keys)
- Select "Done"

#### 11. Featured Server Snaps
**Important - Skip All These:**
- ❌ Don't select Docker (we'll install it properly later)
- ❌ Don't select Kubernetes
- ❌ Don't select any other snaps
- Just select "Done" without checking anything

#### 12. Installation Progress
- Wait for installation to complete
- When finished, select "Reboot Now"
- Remove installation media when prompted

## After First Boot

### Step 1: Login
```bash
# Login with the username and password you created
```

### Step 2: Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### Step 3: Configure Static IP (10.10.10.131)
```bash
# Find your network interface name
ip addr show

# Usually it's ens33 or ens160 in VMware
# Edit netplan configuration
sudo nano /etc/netplan/00-installer-config.yaml
```

**Replace content with** (adjust interface name if needed):
```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    ens33:  # Change this to your interface name if different
      dhcp4: no
      addresses:
        - 10.10.10.131/24
      routes:
        - to: default
          via: 10.10.10.1  # Your network gateway
      nameservers:
        addresses:
          - 8.8.8.8
          - 8.8.4.4
```

**Apply configuration:**
```bash
# Apply network changes
sudo netplan apply

# Verify IP is set correctly
ip addr show

# Test connectivity
ping -c 3 google.com
ping -c 3 10.10.10.201  # Test MySQL database connectivity
```

### Step 4: Install Essential Tools
```bash
sudo apt install -y git curl wget nano net-tools
```

### Step 5: Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Add your user to docker group (avoid using sudo)
sudo usermod -aG docker $USER

# Apply group changes (logout and login)
exit
# Then SSH back in

# Verify Docker
docker --version
docker run hello-world
```

### Step 6: Install Docker Compose
```bash
sudo apt install -y docker-compose

# Verify
docker-compose --version
```

### Step 7: Deploy Hisab
```bash
# Clone repository
cd ~
git clone <your-repo-url> hisab
cd hisab

# Deploy with Docker Compose
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## SSH Access from Windows

From Windows Terminal or PowerShell:
```powershell
ssh username@10.10.10.131
# Enter password when prompted
```

## Quick Reference: Essential Installation Choices

| Screen | Setting | Value |
|--------|---------|-------|
| Language | Language | English |
| Keyboard | Layout | English (US) |
| Network | Configuration | DHCP (change to static later) |
| Storage | Use entire disk | YES ✅ |
| Storage | Use LVM | NO ❌ |
| Storage | Encrypt | NO ❌ |
| Profile | Server name | hisab-server |
| Profile | Username | your choice |
| **SSH** | **Install OpenSSH** | **YES ✅ IMPORTANT** |
| Snaps | Docker/K8s/etc | **NO ❌ Skip all** |
| Ubuntu Pro | Upgrade | Skip/Continue |

## Troubleshooting

### Can't SSH from Windows?
```bash
# On Ubuntu, check SSH service
sudo systemctl status ssh

# If not running, start it
sudo systemctl start ssh
sudo systemctl enable ssh

# Check firewall
sudo ufw status
# If active and blocking, allow SSH
sudo ufw allow ssh
```

### Wrong IP Address?
```bash
# Check current IP
ip addr show

# Re-edit netplan
sudo nano /etc/netplan/00-installer-config.yaml

# Apply changes
sudo netplan apply
```

### Docker Permission Denied?
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again
exit
# Then SSH back in
```

## Next Steps After Installation

1. SSH from Windows: `ssh username@10.10.10.131`
2. Clone Hisab repository
3. Run: `docker-compose up --build -d`
4. Access: `http://10.10.10.131`

All deployment files are ready in your repository.

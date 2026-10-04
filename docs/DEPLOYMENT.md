# Deployment Guide - Oracle Cloud

## 📋 Prerequisites

Before starting deployment, ensure you have:

- [ ] Oracle Cloud account (free tier)
- [ ] Domain name: `absensi.namaSekolah.sch.id` (DNS configured)
- [ ] SSH client installed on your computer
- [ ] Git installed
- [ ] GitHub account

---

## 🚀 Step 1: Create Oracle Cloud VM

### 1.1 Sign Up for Oracle Cloud

1. Go to https://www.oracle.com/cloud/free/
2. Click "Start for free"
3. Fill in your details:
   - Email address
   - Country: Indonesia
   - Verification (phone number)
   - Credit card (for verification only, **NOT charged**)

### 1.2 Create VM Instance

1. Login to Oracle Cloud Console
2. Navigate to **Compute** → **Instances**
3. Click **Create Instance**

**Configuration:**
- **Name:** `absensi-production`
- **Image:** `Ubuntu 22.04`
- **Shape:** `VM.Standard.A1.Flex` (ARM)
  - **OCPUs:** 2
  - **Memory:** 12 GB
- **Networking:**
  - Create new VCN or use existing
  - Assign public IP: Yes
- **Boot Volume:** 100 GB
- **SSH Keys:** 
  - Generate new key pair
  - **Download private key** (save as `oracle-vm-key.pem`)

4. Click **Create**
5. Wait 2-3 minutes for provisioning
6. **Copy the Public IP Address** (e.g., `xxx.xxx.xxx.xxx`)

### 1.3 Configure Security List

1. Go to **Networking** → **Virtual Cloud Networks**
2. Click your VCN name
3. Click **Security Lists** → **Default Security List**
4. Click **Add Ingress Rules**

Add these rules:

| Source CIDR | Protocol | Port Range | Description |
|-------------|----------|------------|-------------|
| 0.0.0.0/0 | TCP | 22 | SSH |
| 0.0.0.0/0 | TCP | 80 | HTTP |
| 0.0.0.0/0 | TCP | 443 | HTTPS |

5. Click **Add Ingress Rules**

---

## 🌐 Step 2: Configure Domain (DNS)

Point your domain to the Oracle VM IP address:

1. Login to your domain registrar (e.g., Niagahoster, Hostinger)
2. Go to DNS Management
3. Add **A Record:**
   - **Type:** A
   - **Name:** `absensi`
   - **Value:** `xxx.xxx.xxx.xxx` (your Oracle VM IP)
   - **TTL:** 3600

4. Wait 5-15 minutes for DNS propagation
5. Verify: `ping absensi.namaSekolah.sch.id` (should return your VM IP)

---

## 🔐 Step 3: Connect to Server via SSH

### Windows (PowerShell):
```powershell
ssh -i C:\path\to\oracle-vm-key.pem ubuntu@xxx.xxx.xxx.xxx
```

### Mac/Linux:
```bash
chmod 400 oracle-vm-key.pem
ssh -i oracle-vm-key.pem ubuntu@xxx.xxx.xxx.xxx
```

**First time:** Type `yes` to accept fingerprint

---

## 🛠️ Step 4: Initial Server Setup

Once connected to the server:

```bash
# Clone repository
git clone https://github.com/yourusername/ProjekAbsensi.git
cd ProjekAbsensi

# Make scripts executable
chmod +x scripts/*.sh

# Run initial setup
./scripts/initial-setup.sh
```

This will:
- ✅ Update system packages
- ✅ Install Docker & Docker Compose
- ✅ Install Nginx & Certbot
- ✅ Configure firewall
- ✅ Setup swap memory
- ✅ Install Fail2ban (SSH protection)

**⚠️ IMPORTANT:** After initial setup, logout and login again:
```bash
exit
ssh -i oracle-vm-key.pem ubuntu@xxx.xxx.xxx.xxx
```

---

## ⚙️ Step 5: Configure Environment Variables

### 5.1 Backend Configuration

```bash
cd ~/ProjekAbsensi
cp backend/.env.production.example backend/.env
nano backend/.env
```

Edit these values:
```env
APP_NAME="Sistem Absensi Sekolah"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://absensi.namaSekolah.sch.id

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=projek_absensi
DB_USERNAME=absensi_user
DB_PASSWORD=STRONG_PASSWORD_HERE_123

# Generate with: php artisan key:generate
APP_KEY=base64:GENERATE_THIS_KEY

JWT_SECRET=GENERATE_THIS_SECRET
```

Save: `Ctrl+O`, Exit: `Ctrl+X`

### 5.2 Frontend Configuration

```bash
cp frontend/.env.production.example frontend/.env.production
nano frontend/.env.production
```

Edit:
```env
VITE_API_URL=https://absensi.namaSekolah.sch.id/api
```

### 5.3 Face Service Configuration

```bash
cp face-service/.env.production.example face-service/.env
nano face-service/.env
```

```env
FACE_SERVICE_HOST=0.0.0.0
FACE_SERVICE_PORT=8001
MATCH_THRESHOLD=0.5
```

---

## 🐳 Step 6: Deploy Application

```bash
cd ~/ProjekAbsensi
./scripts/deploy.sh
```

This will:
- ✅ Create pre-deployment backup
- ✅ Build frontend (React)
- ✅ Build Docker containers
- ✅ Start all services
- ✅ Run database migrations
- ✅ Optimize Laravel
- ✅ Run health checks

**Wait ~5-10 minutes** for first deployment (downloading Docker images & models)

---

## 🔒 Step 7: Setup SSL Certificate

```bash
# Install SSL certificate
sudo certbot --nginx -d absensi.namaSekolah.sch.id

# Follow prompts:
# - Enter email address
# - Agree to terms (Y)
# - Redirect HTTP to HTTPS? (2 - Yes)
```

Certificate will **auto-renew** every 90 days.

---

## 🌐 Step 8: Configure Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/absensi
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name absensi.namaSekolah.sch.id;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name absensi.namaSekolah.sch.id;

    ssl_certificate /etc/letsencrypt/live/absensi.namaSekolah.sch.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/absensi.namaSekolah.sch.id/privkey.pem;

    client_max_body_size 20M;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Storage (public files)
    location /storage {
        proxy_pass http://localhost:8000;
    }

    # Face Recognition Service
    location /face {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable site & restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/absensi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📊 Step 9: Create Admin User

```bash
docker exec -it absensi-backend php artisan tinker
```

In tinker:
```php
$admin = new App\Models\User;
$admin->nama = 'Administrator';
$admin->email = 'admin@sekolah.sch.id';
$admin->password = bcrypt('password123');
$admin->role = 'Admin';
$admin->status = 'Aktif';
$admin->save();
exit
```

---

## ✅ Step 10: Verify Deployment

### 10.1 Run Health Check
```bash
cd ~/ProjekAbsensi
./scripts/health-check.sh
```

Expected output:
```
✅ Backend API: OK
✅ Face Service: OK
✅ Frontend: OK
✅ MySQL: OK
```

### 10.2 Test in Browser

1. Open: `https://absensi.namaSekolah.sch.id`
2. Login with admin credentials
3. Test features:
   - Register user
   - Take attendance (face recognition)
   - View reports

---

## 🔧 Step 11: Setup GitHub Actions (Auto-Deploy)

### 11.1 Generate SSH Key for GitHub

On your server:
```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy_key -N ""
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_deploy_key
```

Copy the **private key** output (starts with `-----BEGIN OPENSSH PRIVATE KEY-----`)

### 11.2 Add Secrets to GitHub

1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these secrets:

| Name | Value |
|------|-------|
| `SERVER_IP` | `xxx.xxx.xxx.xxx` (your VM IP) |
| `SERVER_USER` | `ubuntu` |
| `SSH_PRIVATE_KEY` | (paste private key from above) |

### 11.3 Test Auto-Deploy

```bash
# On your local computer
git add .
git commit -m "Test auto-deploy"
git push origin main
```

Go to **GitHub** → **Actions** tab → Watch deployment progress

---

## 📈 Monitoring & Maintenance

### Daily Health Check
```bash
cd ~/ProjekAbsensi
./scripts/health-check.sh
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f face-service
```

### Manual Backup
```bash
./scripts/backup.sh manual-backup-$(date +%Y%m%d)
```

### Restart Services
```bash
docker-compose restart
```

---

## 🚨 Troubleshooting

### Issue: Cannot connect to server
```bash
# Check if VM is running in Oracle Console
# Check security list allows port 22
# Verify SSH key permissions: chmod 400 oracle-vm-key.pem
```

### Issue: SSL certificate failed
```bash
# Verify DNS is pointing to correct IP
# Wait 15 minutes for DNS propagation
# Check: dig absensi.namaSekolah.sch.id
```

### Issue: Docker containers not starting
```bash
# Check logs
docker-compose logs

# Restart Docker
sudo systemctl restart docker
docker-compose up -d
```

### Issue: Face recognition timeout
```bash
# Check face service logs
docker-compose logs face-service

# Restart face service
docker-compose restart face-service
```

---

## 📞 Support

For issues during deployment, check:
1. `docker-compose logs`
2. `/var/log/nginx/error.log`
3. GitHub Actions logs (for CI/CD issues)

---

## 🎉 Deployment Complete!

Your system is now live at: `https://absensi.namaSekolah.sch.id`

**Next steps:**
- Import student data
- Configure class schedules
- Train staff on system usage
- Setup regular backups

**Auto-deployment is active:** Every push to `main` branch will auto-deploy!

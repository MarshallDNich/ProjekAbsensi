# 🚀 Quick Start Guide - Free Deployment

## ✅ Setup Complete! Ready to Deploy

Semua file sudah siap dengan **free domain DuckDNS**.

---

## 📋 What You Have Now

- ✅ All deployment scripts ready
- ✅ Docker configuration ready
- ✅ GitHub Actions CI/CD ready
- ✅ Free domain configuration: `absensi-sekolah.duckdns.org`
- ✅ Documentation complete

---

## 🎯 Deployment Steps (2 Hours Total)

### **Step 1: Setup DuckDNS** ⏰ 5 minutes

1. Go to: https://www.duckdns.org/
2. Login (GitHub/Google)
3. Create subdomain: `absensi-sekolah` (or your choice)
4. Copy your **DuckDNS token** (save securely)
5. **Leave IP empty for now** (will update after Oracle VM)

📖 Guide: `docs/FREE-DOMAIN-SETUP.md`

---

### **Step 2: Push to GitHub** ⏰ 5 minutes

```bash
# Create new repository on GitHub: ProjekAbsensi
# Then run:

cd C:\laragon\www\ProjekAbsensi

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/ProjekAbsensi.git

# Push code
git branch -M main
git push -u origin main
```

---

### **Step 3: Create Oracle Cloud VM** ⏰ 30 minutes

1. **Sign up:** https://www.oracle.com/cloud/free/
   - Email, phone verification
   - Credit card (verification only, NOT charged)

2. **Create Instance:**
   - Name: `absensi-production`
   - Image: **Ubuntu 22.04**
   - Shape: **VM.Standard.A1.Flex** (ARM)
   - OCPU: **2**
   - Memory: **12 GB**
   - Boot volume: **100 GB**
   - **Download SSH private key** (save as `oracle-key.pem`)

3. **Configure Security List:**
   - Networking → VCN → Security Lists
   - Add Ingress Rules:
     - Port 22 (SSH)
     - Port 80 (HTTP)
     - Port 443 (HTTPS)
   - Source: `0.0.0.0/0`

4. **Copy Public IP Address**
   - Example: `xxx.xxx.xxx.xxx`

📖 Full guide: `docs/DEPLOYMENT.md` (Section: Step 1)

---

### **Step 4: Update DuckDNS IP** ⏰ 2 minutes

1. Go back to DuckDNS dashboard
2. Update **current ip** field with your Oracle VM IP
3. Click **update ip**

Verify:
```bash
ping absensi-sekolah.duckdns.org
# Should return your VM IP
```

---

### **Step 5: Deploy to Server** ⏰ 45 minutes

```bash
# 1. SSH to server
ssh -i oracle-key.pem ubuntu@YOUR_VM_IP

# 2. Clone repository
git clone https://github.com/YOUR_USERNAME/ProjekAbsensi.git
cd ProjekAbsensi

# 3. Run initial setup
chmod +x scripts/*.sh
./scripts/initial-setup.sh

# Wait ~5 minutes (installing Docker, Nginx, etc.)

# 4. Logout & login again (Docker permissions)
exit
ssh -i oracle-key.pem ubuntu@YOUR_VM_IP
cd ProjekAbsensi

# 5. Configure environment
cp backend/.env.production.example backend/.env
nano backend/.env
# Edit:
# - DB_PASSWORD (strong password)
# - APP_KEY (generate: php artisan key:generate)
# - JWT_SECRET (random string)

cp frontend/.env.production.example frontend/.env.production
# Already configured with DuckDNS domain

cp face-service/.env.production.example face-service/.env
# No changes needed

# 6. Deploy!
./scripts/deploy.sh

# Wait ~10 minutes (first deployment downloads Docker images)
```

📖 Full guide: `docs/DEPLOYMENT.md` (Section: Step 4)

---

### **Step 6: Configure Nginx & SSL** ⏰ 10 minutes

```bash
# Create Nginx site config
sudo nano /etc/nginx/sites-available/absensi
```

Paste configuration (replace with your subdomain if different):

```nginx
server {
    listen 80;
    server_name absensi-sekolah.duckdns.org;
    
    client_max_body_size 20M;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Storage
    location /storage {
        proxy_pass http://localhost:8000;
    }

    # Face Service
    location /face {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
    }
}
```

Enable & test:
```bash
sudo ln -s /etc/nginx/sites-available/absensi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Install SSL (free Let's Encrypt):
```bash
sudo certbot --nginx -d absensi-sekolah.duckdns.org
```

Follow prompts:
- Email: your-email@example.com
- Agree: Y
- Redirect HTTP → HTTPS: 2

---

### **Step 7: Setup Auto-Update IP** ⏰ 5 minutes

```bash
# Create DuckDNS updater
mkdir ~/duckdns
cd ~/duckdns
nano duck.sh
```

Paste (replace `YOUR_TOKEN`):
```bash
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=absensi-sekolah&token=YOUR_TOKEN&ip=" | curl -k -o ~/duckdns/duck.log -K -
```

Make executable & test:
```bash
chmod +x duck.sh
./duck.sh
cat duck.log  # Should show "OK"
```

Setup cron (auto-update every 5 min):
```bash
crontab -e
```

Add:
```
*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1
```

📖 Guide: `docs/FREE-DOMAIN-SETUP.md` (Section: Step 4)

---

### **Step 8: Setup GitHub Actions** ⏰ 15 minutes

```bash
# Generate SSH key for GitHub
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy_key -N ""
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys

# Copy private key
cat ~/.ssh/github_deploy_key
```

On GitHub:
1. Go to repository → **Settings** → **Secrets and variables** → **Actions**
2. Add secrets:
   - `SERVER_IP`: Your Oracle VM IP
   - `SERVER_USER`: `ubuntu`
   - `SSH_PRIVATE_KEY`: Paste private key from above

Test auto-deploy:
```bash
# On your laptop
cd C:\laragon\www\ProjekAbsensi
git commit -m "Test auto-deploy" --allow-empty
git push origin main
```

Watch in GitHub → Actions tab

📖 Guide: `docs/DEPLOYMENT.md` (Section: Step 11)

---

### **Step 9: Create Admin User** ⏰ 2 minutes

```bash
# On server
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

### **Step 10: Verify & Test** ⏰ 5 minutes

```bash
# Run health check
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

**Open in browser:**
```
https://absensi-sekolah.duckdns.org
```

Login:
- Email: `admin@sekolah.sch.id`
- Password: `password123`

---

## ✅ Deployment Complete!

### **Your System:**
- 🌐 URL: https://absensi-sekolah.duckdns.org
- 🔐 SSL: ✅ Active (auto-renew)
- 💾 Backups: ✅ Daily (2 AM)
- 📊 Reports: ✅ Weekly (Monday 8 AM)
- 🚀 Auto-deploy: ✅ Active (push to GitHub)
- 💰 Cost: **$0/month FOREVER**

---

## 🔄 Daily Workflow

```bash
# On your laptop:

# 1. Make changes
# 2. Test locally
docker-compose -f docker-compose.dev.yml up -d

# 3. Run tests
cd backend && php artisan test
cd frontend && npm run test

# 4. Commit & push (triggers auto-deploy)
git add .
git commit -m "Feature: tambah fitur X"
git push origin main

# 5. Watch deployment in GitHub Actions (2-3 minutes)
```

---

## 📚 Important Links

- **Application:** https://absensi-sekolah.duckdns.org
- **DuckDNS Dashboard:** https://www.duckdns.org/
- **GitHub Actions:** https://github.com/YOUR_USERNAME/ProjekAbsensi/actions
- **Oracle Cloud Console:** https://cloud.oracle.com/

---

## 📞 Need Help?

Check documentation:
1. `docs/DEPLOYMENT.md` - Full deployment guide
2. `docs/FREE-DOMAIN-SETUP.md` - DuckDNS setup
3. `docs/UPDATE-WORKFLOW.md` - Daily workflow
4. `docs/LOCAL-DEVELOPMENT.md` - Local testing

Run health check:
```bash
ssh -i oracle-key.pem ubuntu@YOUR_VM_IP
cd ~/ProjekAbsensi
./scripts/health-check.sh
```

---

## 🎉 You're Ready to Deploy!

**Next action:** Create DuckDNS account → https://www.duckdns.org/

Then follow steps 2-10 above.

**Estimated total time:** 2 hours

**Result:** Production-ready attendance system with face recognition! 🚀

---

**Created:** 2026-10-04
**Status:** ✅ Ready for Deployment

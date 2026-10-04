# Update Workflow Guide

## 🔄 How to Update & Deploy

Sistem ini menggunakan **auto-deploy**. Setiap kali Anda push code ke GitHub branch `main`, sistem akan otomatis:
1. ✅ Run automated tests
2. ✅ Create backup
3. ✅ Deploy to production
4. ✅ Run health checks
5. ✅ Auto-rollback if failed

---

## 📝 Daily Development Workflow

### Step 1: Make Changes Locally

```bash
# Edit files in your local project
# e.g., VSCode, PhpStorm, etc.

# Test locally with Docker Compose
cd C:\laragon\www\ProjekAbsensi
docker-compose up -d
```

### Step 2: Test Changes

```bash
# Test backend
cd backend
php artisan test

# Test frontend
cd frontend
npm run test

# Manual testing
# Open http://localhost:3000
```

### Step 3: Commit & Push

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "Fix: bug pada absensi siswa"

# Push to GitHub (triggers auto-deploy)
git push origin main
```

### Step 4: Monitor Deployment

1. Go to GitHub → **Actions** tab
2. Watch deployment progress (2-3 minutes)
3. If tests pass → Auto-deploy to production ✅
4. If tests fail → Deployment stopped ❌

---

## 🎯 Update Scenarios

### Scenario 1: Update Frontend (UI/UX)

**Example:** Change button color, add new page, fix styling

```bash
# 1. Edit files in frontend/src/
# 2. Test locally
cd frontend
npm run dev

# 3. Commit & push
git add frontend/
git commit -m "UI: ubah warna tombol login"
git push origin main
```

**Deployment time:** ~2 minutes
**Downtime:** ~30 seconds

---

### Scenario 2: Update Backend (Logic/API)

**Example:** Add new API endpoint, fix bug, update validation

```bash
# 1. Edit files in backend/app/
# 2. Test locally
cd backend
php artisan test

# 3. Commit & push
git add backend/
git commit -m "API: tambah endpoint export Excel"
git push origin main
```

**Deployment time:** ~3 minutes
**Downtime:** ~30 seconds

---

### Scenario 3: Database Migration

**Example:** Add new column, create new table

```bash
# 1. Create migration
cd backend
php artisan make:migration add_nisn_to_users

# 2. Edit migration file
# backend/database/migrations/xxxx_add_nisn_to_users.php

# 3. Test locally
php artisan migrate

# 4. Commit & push
git add backend/database/migrations/
git commit -m "Migration: tambah kolom NISN"
git push origin main
```

**Auto-deployed migration** runs on server automatically.

---

### Scenario 4: Update Face Recognition

**Example:** Adjust threshold, improve accuracy

```bash
# 1. Edit face-service/app/
# 2. Test locally
cd face-service
python -m pytest

# 3. Commit & push
git add face-service/
git commit -m "Face: tingkatkan threshold ke 0.6"
git push origin main
```

**Deployment time:** ~4 minutes (model reload)

---

## 🚨 Emergency Rollback

### If Deployment Failed

GitHub Actions will **auto-rollback** if health checks fail.

### Manual Rollback

If you need to manually rollback:

```bash
# SSH to server
ssh -i oracle-vm-key.pem ubuntu@your-server-ip

# Run rollback script
cd ~/ProjekAbsensi
./scripts/rollback.sh
```

This will:
- Revert code to previous commit
- Restore database from backup
- Rebuild containers

---

## 📊 Monitoring Deployment

### Via GitHub Actions

1. Go to repository → **Actions** tab
2. Click latest workflow run
3. Expand steps to see details:
   - ✅ Tests passed
   - ✅ Deployment succeeded
   - ✅ Health checks passed

### Via Server (SSH)

```bash
# Connect to server
ssh -i oracle-vm-key.pem ubuntu@your-server-ip

# Check health
cd ~/ProjekAbsensi
./scripts/health-check.sh

# View logs
docker-compose logs -f

# Check specific service
docker-compose logs backend
docker-compose logs face-service
```

---

## 🔧 Advanced: Skip Tests (Not Recommended)

If you need to deploy **without running tests** (emergency fix):

```bash
# Add [skip ci] to commit message
git commit -m "Hotfix: critical bug [skip ci]"
git push origin main
```

**⚠️ Warning:** This bypasses tests and deploys directly. Use only for emergencies.

---

## 📅 Scheduled Tasks

### Daily Backup (Automatic)

- **Schedule:** Every day at 2:00 AM
- **What:** Database + storage files
- **Where:** Server + Google Drive
- **GitHub Action:** `.github/workflows/backup.yml`

### Weekly Report (Automatic)

- **Schedule:** Every Monday at 8:00 AM
- **What:** Attendance statistics Excel report
- **Where:** Google Drive
- **GitHub Action:** `.github/workflows/weekly-report.yml`

---

## 🎯 Best Practices

### ✅ DO:
- Test locally before pushing
- Write descriptive commit messages
- Keep commits small and focused
- Check GitHub Actions after push
- Monitor server health regularly

### ❌ DON'T:
- Push directly without testing
- Commit sensitive data (.env files)
- Use generic commit messages ("update", "fix")
- Push multiple unrelated changes at once
- Ignore failed health checks

---

## 📞 Troubleshooting

### Issue: Tests Failed on GitHub Actions

```bash
# Fix locally
git pull
# Fix the issue
git add .
git commit -m "Fix: resolve test failures"
git push origin main
```

### Issue: Deployment Stuck

```bash
# SSH to server
ssh -i key.pem ubuntu@server-ip

# Check if deployment lock exists
ls -la /tmp/deploy.lock

# Remove lock if stuck
rm /tmp/deploy.lock

# Retry deployment
cd ~/ProjekAbsensi
./scripts/deploy.sh
```

### Issue: Health Check Failed

```bash
# SSH to server
cd ~/ProjekAbsensi
./scripts/health-check.sh

# Check logs
docker-compose logs

# Restart services
docker-compose restart
```

---

## 🎓 Example: Complete Update Flow

### Real Example: Add "Forgot Password" Feature

**Day 1: Development**

```bash
# 1. Create new branch (optional)
git checkout -b feature/forgot-password

# 2. Add backend API endpoint
# backend/app/Http/Controllers/Auth/ForgotPasswordController.php
# backend/routes/api.php

# 3. Add frontend page
# frontend/src/pages/auth/ForgotPassword.jsx

# 4. Test locally
cd backend && php artisan test
cd frontend && npm run test

# 5. Commit
git add .
git commit -m "Feature: tambah forgot password"
```

**Day 2: Deploy to Production**

```bash
# Merge to main (if using branch)
git checkout main
git merge feature/forgot-password

# Push (triggers auto-deploy)
git push origin main
```

**Day 3: Monitor**

- Check GitHub Actions ✅
- Test on production: https://absensi.namaSekolah.sch.id
- Monitor for 24 hours

---

## 📈 Deployment Statistics

After each deployment, you can check:

```bash
# On server
cd ~/ProjekAbsensi
git log --oneline -10

# Deployment history
ls -lh ~/backups/
```

---

## 🚀 Quick Reference

| Task | Command |
|------|---------|
| Update code | `git push origin main` |
| Manual deploy | `./scripts/deploy.sh` |
| Health check | `./scripts/health-check.sh` |
| View logs | `docker-compose logs -f` |
| Restart services | `docker-compose restart` |
| Rollback | `./scripts/rollback.sh` |
| Backup | `./scripts/backup.sh` |

---

## 🎉 You're Ready!

Setiap perubahan yang Anda push akan otomatis di-deploy ke production dalam 2-3 menit!

**Happy coding! 🚀**

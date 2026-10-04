# Setup Guide untuk Developer

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/ProjekAbsensi.git
cd ProjekAbsensi
```

### 2. Setup Environment Files

**Backend:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
DB_PASSWORD=your_password_here
APP_KEY=  # Will generate in next step
JWT_SECRET=your_random_secret_here
```

Generate APP_KEY:
```bash
php artisan key:generate
```

**Frontend:**
```bash
cd ../frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:8000/api
```

**Face Service:**
```bash
cd ../face-service
cp .env.example .env
```

### 3. Start dengan Docker

```bash
# Kembali ke root project
cd ..

# Start services
docker-compose -f docker-compose.dev.yml up -d

# Install backend dependencies
docker exec absensi-backend-dev composer install

# Run migrations
docker exec absensi-backend-dev php artisan migrate --seed

# Install frontend dependencies
cd frontend
npm install
npm run dev
```

### 4. Akses Aplikasi

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api
- **Face Service:** http://localhost:8001

### 5. Default Login

- **Email:** admin@sekolah.sch.id
- **Password:** password123

---

## 📚 Documentation

- `README.md` - Project overview
- `QUICK-START.md` - Deployment guide
- `docs/LOCAL-DEVELOPMENT.md` - Detailed local setup
- `docs/DEPLOYMENT.md` - Production deployment

---

## ⚠️ Important

- **NEVER commit `.env` files**
- Setup your own database credentials
- Change default passwords

---

## 🆘 Troubleshooting

**Port already in use:**
```bash
# Stop containers
docker-compose -f docker-compose.dev.yml down

# Change ports in docker-compose.dev.yml if needed
```

**Face service not responding:**
```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs face-service

# First run downloads models (~2-3 minutes)
```

---

## 📞 Need Help?

Check documentation or create an issue on GitHub.

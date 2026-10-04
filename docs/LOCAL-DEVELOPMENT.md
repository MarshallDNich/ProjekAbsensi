# Local Development Environment Setup

## 🎯 Purpose

Setup Docker Compose environment di laptop Anda untuk testing **sebelum push ke production**.

---

## 📋 Prerequisites

- Docker Desktop installed
- Git installed
- Node.js 18+ installed
- Composer installed
- Text editor (VSCode recommended)

---

## 🚀 Quick Start

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/ProjekAbsensi.git
cd ProjekAbsensi
```

### Step 2: Setup Environment Files

**Backend:**
```bash
cd backend
cp .env.example .env
php artisan key:generate
```

Edit `backend/.env`:
```env
DB_HOST=mysql
DB_DATABASE=projek_absensi
DB_USERNAME=absensi_user
DB_PASSWORD=absensi_password

FACE_SERVICE_URL=http://localhost:8001
```

**Frontend:**
```bash
cd frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:8000/api
```

**Face Service:**
```bash
cd face-service
cp .env.example .env
```

### Step 3: Start Services

```bash
# From project root
docker-compose up -d
```

### Step 4: Install Dependencies

**Backend:**
```bash
docker exec absensi-backend composer install
docker exec absensi-backend php artisan migrate
docker exec absensi-backend php artisan db:seed
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Access Local Environment

- **Frontend:** http://localhost:5173 (Vite dev server)
- **Backend API:** http://localhost:8000/api
- **Face Service:** http://localhost:8001
- **phpMyAdmin:** http://localhost:8080 (optional)

---

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
php artisan test

# Or with coverage
php artisan test --coverage
```

### Frontend Tests
```bash
cd frontend
npm run test

# Or watch mode
npm run test:watch
```

---

## 🔄 Development Workflow

1. **Start services:** `docker-compose up -d`
2. **Make changes** in your code editor
3. **Test locally**
4. **Run tests:** `php artisan test` & `npm run test`
5. **Commit & push** (triggers auto-deploy)

---

## 🛑 Stop Services

```bash
docker-compose down
```

To remove volumes (reset database):
```bash
docker-compose down -v
```

---

## 📊 Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart backend

# Access MySQL CLI
docker exec -it absensi-mysql mysql -u root -p

# Clear Laravel cache
docker exec absensi-backend php artisan cache:clear

# Rebuild containers
docker-compose up -d --build
```

---

## 🐛 Troubleshooting

### Port already in use
```bash
# Check what's using the port
netstat -ano | findstr :8000

# Stop the process or change port in docker-compose.yml
```

### Database connection error
```bash
# Ensure MySQL container is running
docker-compose ps

# Check logs
docker-compose logs mysql
```

### Face service not responding
```bash
# Check logs
docker-compose logs face-service

# Model might still be downloading
# Wait 2-3 minutes on first run
```

---

## ✅ Ready to Develop!

Your local environment is now ready. Changes you make will auto-reload in development mode.

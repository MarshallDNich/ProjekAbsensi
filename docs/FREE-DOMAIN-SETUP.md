# Free Domain Setup - DuckDNS

## 🆓 Setup Free Subdomain dengan DuckDNS

DuckDNS adalah layanan **gratis selamanya** untuk mendapatkan subdomain dan dynamic DNS.

---

## 🚀 Step 1: Daftar DuckDNS

1. Buka: https://www.duckdns.org/
2. Login dengan salah satu:
   - GitHub
   - Google
   - Reddit
   - Twitter

3. Setelah login, Anda akan dapat:
   - **Token** (simpan ini, butuh nanti)
   - Dashboard untuk manage subdomain

---

## 🌐 Step 2: Buat Subdomain

1. Di dashboard DuckDNS
2. Bagian **"sub domain"**, ketik nama subdomain:
   ```
   absensi-sekolah
   ```
   (atau nama lain yang Anda mau)

3. Klik **"add domain"**

4. Subdomain Anda sekarang:
   ```
   absensi-sekolah.duckdns.org
   ```

5. Bagian **"current ip"**, isi dengan IP Oracle VM Anda
   - Kosongkan dulu jika VM belum dibuat
   - Bisa update nanti via dashboard atau script

---

## 🔧 Step 3: Update Environment Variables

Setelah dapat subdomain, update file konfigurasi:

### Backend `.env`

```bash
cd ~/ProjekAbsensi
nano backend/.env
```

Edit:
```env
APP_URL=https://absensi-sekolah.duckdns.org

CORS_ALLOWED_ORIGINS=https://absensi-sekolah.duckdns.org
```

### Frontend `.env.production`

```bash
nano frontend/.env.production
```

Edit:
```env
VITE_API_URL=https://absensi-sekolah.duckdns.org/api
```

### Nginx Configuration

Update file Nginx di server nanti (saat deploy):

```bash
sudo nano /etc/nginx/sites-available/absensi
```

Ganti `absensi.namaSekolah.sch.id` dengan `absensi-sekolah.duckdns.org`

---

## 🤖 Step 4: Auto-Update IP (Optional tapi Recommended)

Agar IP otomatis update jika VM restart, install DuckDNS updater di server:

```bash
# SSH ke Oracle VM
ssh -i oracle-key.pem ubuntu@YOUR_VM_IP

# Create update script
mkdir ~/duckdns
cd ~/duckdns
nano duck.sh
```

Paste script ini:
```bash
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=absensi-sekolah&token=YOUR_DUCKDNS_TOKEN&ip=" | curl -k -o ~/duckdns/duck.log -K -
```

**Ganti:**
- `absensi-sekolah` → subdomain Anda
- `YOUR_DUCKDNS_TOKEN` → token dari DuckDNS dashboard

Make executable:
```bash
chmod +x duck.sh
```

Test:
```bash
./duck.sh
cat duck.log  # Should show "OK"
```

### Setup Cron (Auto-update every 5 minutes)

```bash
crontab -e
```

Tambahkan:
```
*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1
```

Save & exit.

---

## 🔒 Step 5: Setup SSL Certificate

Setelah deploy aplikasi, setup SSL:

```bash
sudo certbot --nginx -d absensi-sekolah.duckdns.org
```

Follow prompts:
- Email: (your email)
- Agree to terms: Y
- Redirect HTTP to HTTPS: 2 (Yes)

SSL akan **auto-renew** setiap 90 hari.

---

## ✅ Verification

Test subdomain:

```bash
# Test DNS resolution
ping absensi-sekolah.duckdns.org

# Should return your Oracle VM IP
```

Test browser:
- `https://absensi-sekolah.duckdns.org`

---

## 📝 Summary

**Your Free Domain:**
```
https://absensi-sekolah.duckdns.org
```

**DuckDNS Token:** (save this securely)
```
[Get from DuckDNS dashboard]
```

**Cost:** $0 forever ✅

**SSL:** Free via Let's Encrypt ✅

**Auto-update IP:** Every 5 minutes ✅

---

## 🔄 Update Configuration Files

Sekarang Anda perlu update domain di beberapa file:

### File yang perlu diupdate:

1. `backend/.env.production.example`:
   ```env
   APP_URL=https://absensi-sekolah.duckdns.org
   CORS_ALLOWED_ORIGINS=https://absensi-sekolah.duckdns.org
   ```

2. `frontend/.env.production.example`:
   ```env
   VITE_API_URL=https://absensi-sekolah.duckdns.org/api
   ```

3. `docs/DEPLOYMENT.md`:
   - Replace `absensi.namaSekolah.sch.id` → `absensi-sekolah.duckdns.org`

---

## 🎯 Next Steps

1. ✅ Daftar di DuckDNS
2. ✅ Buat subdomain
3. ✅ Update environment files (saya bisa bantu)
4. ⏳ Create Oracle VM
5. ⏳ Update IP di DuckDNS
6. ⏳ Deploy aplikasi
7. ⏳ Setup SSL

---

**Mau saya update environment files sekarang dengan domain DuckDNS?**

Atau Anda mau pakai nama subdomain yang berbeda? (sekarang contoh: `absensi-sekolah`)

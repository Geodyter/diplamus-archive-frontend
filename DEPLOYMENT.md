# DiPlaMus Archive Frontend — Οδηγός Εγκατάστασης (Docker)

## Σύνοψη

Το frontend είναι μια **Node.js/Express** εφαρμογή (React + Vite + TypeScript) που σερβίρει ένα SPA και λειτουργεί ως reverse proxy προς το DiPlaMus Archive API. Διανέμεται ως Docker image για εύκολη εγκατάσταση.

**Repository:** https://github.com/Geodyter/diplamus-archive-frontend

**Εκτιμώμενος χρόνος εγκατάστασης:** 30–45 λεπτά

---

## Προαπαιτούμενα

- **Docker** ≥ 24.x
- **Docker Compose** ≥ 2.x (συνήθως συνοδεύει το Docker Desktop / Engine)
- **Nginx** (για reverse proxy + SSL)
- **Certbot** (για SSL certificate)

---

## Βήμα 1 — Clone του Repository

```bash
cd /var/www
git clone https://github.com/Geodyter/diplamus-archive-frontend.git
cd diplamus-archive-frontend
```

---

## Βήμα 2 — Δημιουργία αρχείου `.env`

```bash
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001

# DiPlaMus Archive API Key
DIPLAMUS_API_KEY=uinFayPObwYkqt8t8YTIDceq/1sMFnHbi08mavaS3W0=
EOF

chmod 600 .env
```

> **Σημείωση:** Το `.env` δεν ανεβαίνει ποτέ στο Git (αναφέρεται στο `.gitignore`).

---

## Βήμα 3 — Build & Εκκίνηση με Docker Compose

```bash
# Build του Docker image (διαρκεί ~3-5 λεπτά την πρώτη φορά)
docker compose up -d --build

# Έλεγχος ότι τρέχει
docker compose ps
docker compose logs -f diplamus-frontend
```

Αναμένετε το μήνυμα: `Server running on http://localhost:3001/`

**Έλεγχος health endpoint:**
```bash
curl http://localhost:3001/api/health
# Αναμένεται: {"status":"ok","timestamp":"..."}
```

---

## Βήμα 4 — Nginx Configuration

Δημιουργήστε το αρχείο `/etc/nginx/sites-available/diplamus-frontend`:

```nginx
server {
    listen 80;
    server_name archive.diplamus.gr;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name archive.diplamus.gr;

    ssl_certificate     /etc/letsencrypt/live/archive.diplamus.gr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/archive.diplamus.gr/privkey.pem;

    # Proxy to Docker container
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}
```

```bash
# Ενεργοποίηση
ln -s /etc/nginx/sites-available/diplamus-frontend /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# SSL (αν δεν υπάρχει ακόμα)
certbot --nginx -d archive.diplamus.gr
```

---

## Αρχιτεκτονικό Διάγραμμα

```
Browser
  │
  ▼
Nginx (443/80)
  │
  ▼
Docker Container: diplamus-frontend (:3001)
  │
  ├─ /api/diplamus-proxy/*  ──▶  archive.diplamus.app-host.eu/api/v1
  ├─ /diplamus-storage/*    ──▶  archive.diplamus.app-host.eu (storage)
  └─ /*                     ──▶  React SPA (static files)
```

---

## Updates — Νέα Έκδοση

Κάθε φορά που υπάρχει νέα έκδοση του κώδικα:

```bash
cd /var/www/diplamus-archive-frontend
git pull
docker compose up -d --build
```

Η παλιά έκδοση σταματά και η νέα ξεκινά αυτόματα. Downtime < 10 δευτερόλεπτα.

---

## Checklist

```
□  Docker & Docker Compose εγκατεστημένα
□  git clone ολοκληρώθηκε
□  .env δημιουργημένο με DIPLAMUS_API_KEY
□  docker compose up -d --build — OK
□  curl http://localhost:3001/api/health — {"status":"ok"}
□  Nginx config — nginx -t OK
□  SSL certificate ενεργό
□  Η σελίδα φορτώνει: https://archive.diplamus.gr
□  Εκθέματα εμφανίζονται (API proxy λειτουργεί)
□  Logo και εικόνες εμφανίζονται (local assets)
```

---

## Troubleshooting

**Container δεν ξεκινά:**
```bash
docker compose logs diplamus-frontend
# Ελέγξτε το .env αρχείο
```

**Εκθέματα δεν φορτώνουν (502/503):**
```bash
# Έλεγχος connectivity προς το API
curl -I https://archive.diplamus.app-host.eu
# Αν αποτύχει → firewall/outbound connectivity πρόβλημα
# Ελέγξτε DIPLAMUS_API_KEY στο .env
```

**Port 3001 πιασμένος:**
```bash
# Αλλάξτε PORT στο .env (π.χ. PORT=3002)
# Ενημερώστε αντίστοιχα το Nginx proxy_pass
docker compose up -d --build
```

**Build αποτυγχάνει:**
```bash
# Καθαρισμός Docker cache
docker compose down
docker system prune -f
docker compose up -d --build
```

---

## Σημείωση για Auth/OAuth

Ο κώδικας περιέχει OAuth integration (για το Manus platform) που **δεν χρησιμοποιείται** στην παρούσα έκδοση — δεν υπάρχει protected content. Χωρίς τα αντίστοιχα env vars, το OAuth module αποτυγχάνει σιωπηλά χωρίς να επηρεάζει τη λειτουργία. Αν χρειαστεί authentication στο μέλλον, επικοινωνήστε με τον developer.

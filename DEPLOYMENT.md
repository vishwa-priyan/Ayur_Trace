# 🚀 AyurTrace Server Deployment Guide

This guide walks you through deploying the **AyurTrace** backend (Node.js/Express + PostgreSQL) and frontend (React/Vite) onto a production server (Ubuntu/Debian, VPS, AWS EC2, DigitalOcean, or Docker).

---

## 🏗️ Architecture Overview

The frontend does **NOT** hardcode `localhost` in client browsers. It uses the `VITE_API_BASE_URL` environment variable:

```
[ Client Browser / Phone / Desktop ]
                │
                │  (Fetches UI & calls /api/...)
                ▼
      ┌──────────────────┐
      │  Reverse Proxy   │  (e.g., Nginx on Port 80/443)
      │  or Express Host │
      └─────────┬────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
 ┌───────────────┐ ┌───────────────┐
 │ Static Dist   │ │ Backend API   │
 │ (HTML/JS/CSS) │ │ (Port 5000)   │
 └───────────────┘ └───────┬───────┘
                           │
                           ▼
                    ┌───────────────┐
                    │  PostgreSQL   │
                    │  (Port 5432)  │
                    └───────────────┘
```

---

## 🌟 Choose Your Deployment Option

### Option A: Single Node.js Server (Easiest)

In this setup, your Express backend serves both the API and the pre-built React frontend from `frontend/dist` on a single port (e.g., 5000 or 80).

1. **Build the frontend on your server**:
   ```bash
   cd frontend
   npm install
   # Leave VITE_API_BASE_URL empty so relative /api paths are used
   npm run build
   ```

2. **Configure backend `.env`**:
   ```env
   PORT=5000
   HOST=0.0.0.0
   DATABASE_URL=postgres://your_db_user:your_db_password@localhost:5432/ayur_trace
   JWT_SECRET=your_strong_random_secret_string
   SERVE_FRONTEND=true
   ```

3. **Start the backend with PM2 or Node**:
   ```bash
   cd ../backend
   npm install
   npm run migrate    # Run schema migrations if not already done
   npm install -g pm2
   pm2 start index.js --name ayurtrace-backend
   ```

4. Access the full app at `http://YOUR_SERVER_IP:5000`.

---

### Option B: Nginx Reverse Proxy (Recommended for Production & SSL)

With Nginx, you serve the static frontend directly from disk with fast gzip/brotli caching and proxy `/api/` and `/uploads/` to Node.js on port 5000.

1. **Build the frontend**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Start the backend with PM2**:
   ```bash
   cd ../backend
   npm install
   npm run migrate
   pm2 start index.js --name ayurtrace-backend
   ```

3. **Nginx Configuration (`/etc/nginx/sites-available/ayurtrace`)**:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com; # or your server IP

       # 1. Frontend Static Files (Single Page Application routing)
       location / {
           root /path/to/Ayur_Trace/frontend/dist;
           index index.html;
           try_files $uri $uri/ /index.html;
       }

       # 2. Backend API Reverse Proxy
       location /api/ {
           proxy_pass http://127.0.0.1:5000/api/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }

       # 3. Uploaded Media / Certificates / Photos
       location /uploads/ {
           proxy_pass http://127.0.0.1:5000/uploads/;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
       }
   }
   ```

4. Enable site and reload Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/ayurtrace /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. (Optional) Setup Free SSL via Let's Encrypt Certbot:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

### Option C: Split Deployment (e.g. Vercel/Netlify for Frontend + Render/VPS for Backend)

If you host the frontend on Vercel, Netlify, or AWS S3, and the backend on Render, Railway, or a cloud VPS:

1. **Backend Configuration (`backend/.env`)**:
   ```env
   PORT=5000
   HOST=0.0.0.0
   DATABASE_URL=postgres://...
   JWT_SECRET=your_jwt_secret
   # Allow your frontend domain to make API requests
   CORS_ORIGIN=https://ayurtrace.vercel.app
   ```

2. **Frontend Configuration (`frontend/.env`)**:
   In your Vercel/Netlify dashboard environment variables or `frontend/.env`:
   ```env
   VITE_API_BASE_URL=https://api.yourdomain.com
   # OR (if using raw IP)
   # VITE_API_BASE_URL=http://YOUR_SERVER_IP:5000
   ```

3. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

---

## ⚙️ Environment Variables Reference

### Frontend (`frontend/.env`)

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Optional | Backend URL prefix for API and assets. Leave empty for same-domain or Nginx proxy. | `https://api.yourdomain.com` or `http://192.168.1.50:5000` |

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | `5000` | Port for Express web server |
| `HOST` | Optional | `0.0.0.0` | Network interface to bind to (`0.0.0.0` allows external traffic) |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string |
| `JWT_SECRET` | **Yes** | — | Secret key for JWT auth tokens |
| `CORS_ORIGIN` | Optional | `*` | Allowed CORS origins (comma-separated or single domain) |
| `SERVE_FRONTEND`| Optional | `false` | Set to `true` to serve `frontend/dist` directly from Express |

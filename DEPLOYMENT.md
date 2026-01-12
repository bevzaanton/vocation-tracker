# Deployment Guide for Render.com

This guide covers deploying the Vacation Manager application to Render.com.

## Overview

The application consists of three services:
- **Backend API**: FastAPI application (Python)
- **Frontend**: React SPA served as static site
- **Database**: PostgreSQL 15

## Prerequisites

1. A [Render.com](https://render.com) account
2. GitHub repository with your code
3. Git installed locally

## Quick Deploy (Blueprint Method)

The easiest way to deploy is using the `render.yaml` blueprint file:

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Create New Blueprint on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and create all services

3. **Configure Environment Variables** (if not auto-generated):
   - Backend service will auto-generate `SECRET_KEY`
   - Frontend will automatically get backend URL

4. **Deploy**:
   - Click "Apply" to create all services
   - Wait for deployment (5-10 minutes for first deploy)

## Manual Deploy (Step by Step)

If you prefer manual setup:

### 1. Create PostgreSQL Database

1. Go to Render Dashboard → "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `vacation-postgres`
   - **Database**: `vacation_db`
   - **User**: (auto-generated)
   - **Region**: Oregon (or your preferred region)
   - **PostgreSQL Version**: 15
   - **Plan**: Starter ($7/month) or Free
3. Click "Create Database"
4. Note the **Internal Database URL** for the next step

### 2. Deploy Backend Service

1. Go to Render Dashboard → "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `vacation-backend`
   - **Region**: Oregon (same as database)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `./build.sh`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Starter ($7/month) or Free

4. **Environment Variables**:
   ```
   DATABASE_URL=<your-postgres-internal-url>
   SECRET_KEY=<generate-a-secure-random-string>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=43200
   FRONTEND_URL=https://vacation-frontend.onrender.com
   ```

5. **Advanced Settings**:
   - **Health Check Path**: `/api/v1/health`
   - **Auto-Deploy**: Yes

6. Click "Create Web Service"

### 3. Deploy Frontend Service

1. Go to Render Dashboard → "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `vacation-frontend`
   - **Region**: Oregon (same as backend)
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Build Command**: `cd frontend && npm ci && npm run build`
   - **Publish Directory**: `frontend/dist`

4. **Environment Variables**:
   ```
   VITE_API_URL=https://vacation-backend.onrender.com/api/v1
   ```

5. **Redirects/Rewrites** (in render.yaml or dashboard):
   ```
   /api/* -> https://vacation-backend.onrender.com/api/* (200)
   /* -> /index.html (200)
   ```

6. Click "Create Static Site"

## Post-Deployment Setup

### 1. Seed Initial Data

After the backend is deployed, seed the database:

1. Go to backend service → "Shell" tab
2. Run:
   ```bash
   python scripts/seed_data.py
   ```

This creates default users:
- Admin: `admin@company.com` / `password123`
- Manager: `manager@company.com` / `password123`
- Employee: `employee1@company.com` / `password123`

### 2. Verify Deployment

1. **Backend Health Check**:
   ```bash
   curl https://vacation-backend.onrender.com/api/v1/health
   ```
   Should return: `{"status": "healthy"}`

2. **Frontend**: Visit `https://vacation-frontend.onrender.com`

3. **API Documentation**:
   - Swagger UI: `https://vacation-backend.onrender.com/api/v1/docs`
   - ReDoc: `https://vacation-backend.onrender.com/api/v1/redoc`

### 3. Update CORS Settings

If you use a custom domain, update the backend's `FRONTEND_URL` environment variable:

```bash
FRONTEND_URL=https://your-custom-domain.com
```

## Environment Variables Reference

### Backend Service

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string (auto from Render DB) |
| `SECRET_KEY` | Yes | - | JWT signing key (use Render's generate feature) |
| `ALGORITHM` | No | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `43200` | Token lifetime (30 days) |
| `FRONTEND_URL` | Yes | - | Frontend URL for CORS |

### Frontend Service

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | - | Backend API base URL |

## Database Migrations

Migrations run automatically on each deploy via the build script. To run manually:

1. Go to backend service → "Shell" tab
2. Run:
   ```bash
   alembic upgrade head
   ```

To rollback:
```bash
alembic downgrade -1
```

## Custom Domains

### Backend

1. Go to backend service → "Settings" → "Custom Domain"
2. Add your domain (e.g., `api.yourdomain.com`)
3. Update DNS records as instructed
4. Update `VITE_API_URL` in frontend to use new domain

### Frontend

1. Go to frontend service → "Settings" → "Custom Domain"
2. Add your domain (e.g., `app.yourdomain.com`)
3. Update DNS records as instructed
4. Update `FRONTEND_URL` in backend to use new domain

## Monitoring & Logs

### View Logs

- **Backend**: Dashboard → vacation-backend → "Logs" tab
- **Frontend**: Dashboard → vacation-frontend → "Logs" tab
- **Database**: Dashboard → vacation-postgres → "Logs" tab

### Metrics

- CPU and Memory usage available in service dashboard
- Request metrics in "Metrics" tab

### Alerts

Configure in service settings:
- Deployment failures
- Service health check failures
- High error rates

## Troubleshooting

### Backend Won't Start

1. Check logs for error messages
2. Verify `DATABASE_URL` is correct
3. Ensure migrations ran successfully
4. Check Python version (should be 3.11+)

### Frontend Can't Connect to Backend

1. Verify `VITE_API_URL` is set correctly
2. Check backend CORS settings include frontend URL
3. Verify backend health check passes
4. Check browser console for errors

### Database Connection Issues

1. Verify database is running
2. Check `DATABASE_URL` format: `postgresql://user:pass@host:port/dbname`
3. Ensure backend and database are in same region (faster)
4. Check database logs for connection errors

### 502 Bad Gateway

- Backend is likely not responding
- Check if backend service is running
- Review backend logs for startup errors
- Verify health check endpoint works

### CORS Errors

1. Add frontend URL to backend's `FRONTEND_URL` environment variable
2. Restart backend service
3. Clear browser cache

## Scaling & Performance

### Free Tier Limitations

- Services spin down after 15 minutes of inactivity
- First request after spin-down will be slow (30-60 seconds)
- Database: 1GB storage, 97 hours/month

### Upgrading to Paid Plans

For production use, consider:
- **Starter Plan** ($7/month per service): No spin-down, better performance
- **Database Plan** ($7/month): Always on, more storage
- **Pro Plan** ($25/month): More resources, faster builds

### Performance Optimization

1. **Database**: Add indexes for frequently queried fields
2. **Backend**: Enable caching for frequently accessed data
3. **Frontend**:
   - Already optimized (static build)
   - Consider CDN for global users
4. **Keep services in same region** for lower latency

## Cost Estimate

### Minimum Setup (Free Tier)
- Backend: Free (with limitations)
- Frontend: Free (with limitations)
- Database: Free (1GB, 97 hours/month)
- **Total**: $0/month

### Production Setup (Starter)
- Backend: $7/month
- Frontend: $0/month (static sites are free)
- Database: $7/month
- **Total**: $14/month

### Recommended Production
- Backend: $25/month (Pro)
- Frontend: $0/month
- Database: $25/month (Standard)
- **Total**: $50/month

## Security Best Practices

1. **Never commit secrets**: Use environment variables
2. **Use strong SECRET_KEY**: Generate with Render or use `openssl rand -hex 32`
3. **Enable HTTPS**: Render provides free SSL certificates
4. **Restrict CORS**: Only allow specific frontend domains
5. **Regular updates**: Keep dependencies updated
6. **Monitor logs**: Check for suspicious activity
7. **Database backups**: Enable automatic backups in Render (paid plans)

## Backup & Recovery

### Database Backups

Render provides automatic backups on paid plans:
- Daily automatic backups
- 7-day retention on Starter plan
- 30-day retention on higher plans

To backup manually:
1. Go to database → "Backups"
2. Click "Create Backup"

### Restore from Backup

1. Go to database → "Backups"
2. Select backup to restore
3. Click "Restore"
4. Restart backend service

## CI/CD

Render automatically deploys on git push:

1. Push to main branch
2. Render detects changes
3. Builds and deploys automatically
4. Zero-downtime deployment

To disable auto-deploy:
- Go to service settings
- Disable "Auto-Deploy"

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [React Production Build](https://react.dev/learn/start-a-new-react-project#deploying-to-production)
- [PostgreSQL Best Practices](https://render.com/docs/postgresql-best-practices)

## Support

- Render Support: [support@render.com](mailto:support@render.com)
- Application Issues: Check logs and [AGENTS.md](AGENTS.md) for architecture details

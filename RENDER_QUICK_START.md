# Render.com Quick Start Guide

## 🚀 Deploy in 5 Minutes

### Prerequisites
- GitHub account with this repository pushed
- Render.com account (free signup)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: Deploy on Render
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Select your repository
4. Render detects `render.yaml` and shows:
   - ✅ PostgreSQL Database
   - ✅ Backend API (Python/FastAPI)
   - ✅ Frontend (React Static Site)
5. Click **"Apply"**
6. Wait 5-10 minutes ☕

### Step 3: Seed Database
1. Go to backend service → **"Shell"** tab
2. Run:
   ```bash
   python seed_data.py
   ```

### Step 4: Access Your App
- **Frontend**: `https://vacation-frontend.onrender.com`
- **Backend API**: `https://vacation-backend.onrender.com/api/v1/docs`

### Step 5: Login
Default credentials:
- **Admin**: admin@company.com / password123
- **Manager**: manager@company.com / password123
- **Employee**: employee1@company.com / password123

## 📋 What Gets Created

| Service | Type | URL |
|---------|------|-----|
| Database | PostgreSQL 15 | Internal only |
| Backend | Python Web Service | vacation-backend.onrender.com |
| Frontend | Static Site | vacation-frontend.onrender.com |

## 🔧 Environment Variables (Auto-Configured)

### Backend
- `DATABASE_URL` - Auto-linked to database ✅
- `SECRET_KEY` - Auto-generated ✅
- `FRONTEND_URL` - Set to frontend URL ✅

### Frontend
- `VITE_API_URL` - Set to backend URL ✅

## 💰 Costs

### Free Tier
- ✅ Services spin down after 15 min inactivity
- ✅ Database: 1GB storage, 97 hours/month
- ✅ Perfect for testing

### Starter (Recommended for Production)
- Backend: $7/month
- Database: $7/month
- Frontend: Free
- **Total: $14/month**

## ⚠️ Important Notes

### First Deploy
- Takes 5-10 minutes
- Backend and frontend may restart a few times
- Wait for all services to show "Live" status

### Free Tier
- Services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- Perfect for demos, not production

### Production Ready
- Upgrade to Starter plans ($7 each)
- No sleep, faster response times
- Better for real users

## 🆘 Troubleshooting

### Backend Won't Start
```bash
# Check build logs in Render dashboard
# Common issues:
# - Missing DATABASE_URL (should be auto-set)
# - Migration errors (check alembic/versions/)
# - Python dependency errors (check requirements.txt)
```

### Frontend Can't Connect
```bash
# Verify VITE_API_URL in frontend settings
# Should be: https://vacation-backend.onrender.com/api/v1
```

### CORS Errors
```bash
# Backend FRONTEND_URL should be:
# https://vacation-frontend.onrender.com
# Restart backend after changing
```

### Database Connection Failed
```bash
# Verify database is "Available" in dashboard
# Check backend logs for connection errors
# Database and backend should be in same region
```

## 📚 Detailed Documentation

For complete guide, see:
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Full deployment guide
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Step-by-step checklist
- **[AGENTS.md](AGENTS.md)** - Architecture and development guide

## 🔐 Security Tips

1. **Change default passwords** after first login
2. **Generate strong SECRET_KEY** (Render auto-does this)
3. **Enable 2FA** on Render account
4. **Monitor logs** for suspicious activity
5. **Keep dependencies updated**

## 📊 Monitoring

### Check Service Health
- Dashboard → Service → Metrics tab
- Green = Healthy, Red = Issues

### View Logs
- Dashboard → Service → Logs tab
- Real-time streaming logs
- Filter by error level

### Health Checks
- Backend: https://vacation-backend.onrender.com/api/v1/health
- Should return: `{"status": "healthy"}`

## 🔄 Updates & Redeployment

Auto-deploy is enabled by default:
1. Make changes locally
2. Commit and push to GitHub
3. Render automatically deploys
4. Zero-downtime deployment

To disable auto-deploy:
- Service Settings → Auto-Deploy: Off

## 🌐 Custom Domains (Optional)

### Add Your Domain
1. Service → Settings → Custom Domain
2. Add domain (e.g., `api.yourdomain.com`)
3. Update DNS records as shown
4. Free SSL certificate auto-issued
5. Update environment variables:
   - Frontend: Update `VITE_API_URL`
   - Backend: Update `FRONTEND_URL`

## 🎯 Next Steps

After successful deployment:

1. ✅ Test all functionality
2. ✅ Change default passwords
3. ✅ Configure monitoring/alerts
4. ✅ Consider custom domain
5. ✅ Upgrade to paid plans for production
6. ✅ Set up database backups (paid plans)
7. ✅ Document production URLs

## 🏆 Success Indicators

Your deployment is successful when:
- ✅ All services show "Live" status
- ✅ Health check returns healthy
- ✅ Frontend loads without errors
- ✅ Can login with default credentials
- ✅ API calls work (check browser console)
- ✅ No CORS errors

## 📞 Support

- **Render Support**: support@render.com
- **Render Docs**: https://render.com/docs
- **Community**: https://community.render.com

---

**Deployment Time**: ~10 minutes
**Difficulty**: Beginner-friendly
**Cost**: Free tier available, $14/month for production

Happy Deploying! 🚀

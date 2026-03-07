# HRMS Backend - Render Deployment Guide

## Prerequisites
- Render account
- GitHub repository with your code

## Deployment Steps

### 1. Prepare Your Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 2. Create PostgreSQL Database on Render
1. Go to Render Dashboard
2. Click "New" → "PostgreSQL"
3. Name: `hrms-database`
4. Plan: Free (or your preferred plan)
5. Click "Create Database"
6. **Copy the Internal Database URL** - you'll need this

### 3. Create Web Service on Render
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `hrms-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave blank (or set if backend is in subdirectory)
   - **Environment**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn hrms.wsgi:application --bind 0.0.0.0:$PORT --workers 3`
   - **Plan**: Free (or your preferred plan)

### 4. Set Environment Variables
In the Render dashboard, go to your web service → Environment tab and add:

```bash
# Required
SECRET_KEY=your-generated-secret-key-here
DEBUG=False
ALLOWED_HOSTS=.onrender.com
DATABASE_URL=[paste your PostgreSQL Internal Database URL from step 2]

# CORS - Add your frontend domain after deploying frontend
CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com

# Python version
PYTHON_VERSION=3.11.0
```

### 5. Generate SECRET_KEY
```python
# Run this in Python to generate a secure key:
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

Or use online generator: https://djecrety.ir/

### 6. Deploy
1. Click "Create Web Service"
2. Render will automatically:
   - Install dependencies from requirements.txt
   - Run build.sh (collect static files, migrate database)
   - Start your application

### 7. Post-Deployment
1. Check logs for any errors
2. Visit your service URL: `https://hrms-backend.onrender.com`
3. Create a superuser:
   ```bash
   # In Render Shell tab
   python manage.py createsuperuser
   ```

### 8. Deploy Frontend (hrms-web)
1. Create new "Static Site" on Render
2. Build command: `cd hrms-web && npm install && npm run build`
3. Publish directory: `hrms-web/dist`
4. Add environment variable:
   ```
   VITE_API_URL=https://hrms-backend.onrender.com
   ```
5. Update backend CORS_ALLOWED_ORIGINS with frontend URL

## Important Notes

### Free Tier Limitations
- **Spin down after inactivity**: Services on free tier sleep after 15 minutes of inactivity
- **First request delay**: May take 30-50 seconds to wake up
- **Database**: 90-day expiration on free PostgreSQL

### Database Backups
```bash
# Manual backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Monitoring
- Check logs in Render Dashboard → Logs tab
- Set up health checks in Render Dashboard

### Custom Domain
1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS records as instructed
4. Update ALLOWED_HOSTS and CORS_ALLOWED_ORIGINS

## Troubleshooting

### Static Files Not Loading
- Ensure `collectstatic` runs in build.sh
- Check STATIC_ROOT and STATICFILES_STORAGE settings

### Database Connection Issues
- Verify DATABASE_URL is set correctly
- Check PostgreSQL database is running
- Ensure migrations ran successfully

### CORS Errors
- Add frontend URL to CORS_ALLOWED_ORIGINS
- Check CORS_ALLOWED_ORIGINS format (comma-separated, no spaces)

### 502 Bad Gateway
- Check logs for errors
- Verify gunicorn is starting correctly
- Increase worker timeout if needed

## Production Checklist
- [x] SECRET_KEY set to strong random value
- [x] DEBUG=False
- [x] ALLOWED_HOSTS configured
- [x] DATABASE_URL configured
- [x] Static files collected
- [x] Database migrations run
- [x] CORS configured for frontend
- [ ] Create superuser account
- [ ] Test all API endpoints
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring/alerts
- [ ] Configure backup strategy

## Useful Commands

### Access Shell
Go to Render Dashboard → Shell tab

### Run Management Commands
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic
```

### View Logs
```bash
# In Render Dashboard → Logs tab
# Or use Render CLI
render logs -t web -s hrms-backend
```

## Support
- Render Documentation: https://render.com/docs
- Django Deployment: https://docs.djangoproject.com/en/4.2/howto/deployment/

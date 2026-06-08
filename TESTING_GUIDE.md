# Testing & Verification Guide

## Quick Checklist

### Backend Changes Verification

#### 1. Serializer Optimizations ✅
```bash
# Verify no import errors
python manage.py check

# Test employee detail endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/hcm/employees/1/

# Response should NOT include:
# - department_detail with jobs array
# - category_detail, classification_detail (now category_name, classification_name)
# Payload size should be ~20KB instead of ~40KB
```

#### 2. Summary Endpoint Optimization ✅
```bash
# Test summary endpoint - should return in <500ms
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/hcm/employees/summary/

# Monitor query count in Django Debug Toolbar
# Should see ~2-3 queries (was 7+)
```

#### 3. Database Query Performance ✅
Use Django Debug Toolbar or django-silk:
```python
# Install if not present:
pip install django-debug-toolbar

# Check queries in:
# - /api/v1/hcm/employees/ (list)
# - /api/v1/hcm/employees/{id}/ (detail)
# - /api/v1/hcm/employees/summary/ (summary)
```

---

### Frontend Changes Verification

#### 1. Login Flow ✅
**Test Steps:**
1. Open browser DevTools → Network tab
2. Click "Login"
3. Enter credentials
4. **Verify:** Only 1 request to `/api/v1/auth/token/` (was 2)
5. **Should see:** `workspaces` array in JWT response
6. **Time:** <2 seconds from submit to dashboard

**Expected Network Requests:**
```
POST /api/v1/auth/token/ ← ONLY THIS (was 2)
GET /api/v1/core/workspaces/my_workspaces/ ← REMOVED ✅
```

#### 2. Employee Form Caching ✅
**Test Steps:**
1. Click "Add Employee" button
2. Check Network tab
3. **First open:** 2 requests (departments + jobs)
4. **Close modal, open again:** 0 new requests (cached!) ✅
5. **Verify:** Departments cached for 10 minutes
6. **Switch workspace:** Cache refreshes (workspace in queryKey)

**Expected React Query Behavior:**
```
First open:  Cache miss → fetch → 1-2s
Second open: Cache hit → instant <200ms
After 10min: Cache stale → fetch in background (user sees cached data)
```

#### 3. Dashboard Performance ✅
**Test Steps:**
1. Login to dashboard
2. **Verify:** Summary stats load in <500ms
3. **Verify:** No "Loading..." spinner visible (should be instant)
4. **Network tab:** Only 1 request to `/api/v1/hcm/employees/summary/`

---

### Performance Testing Script

```bash
#!/bin/bash
# Run this after deploying fixes

echo "Testing Login Performance..."
time curl -X POST http://localhost:8000/api/v1/auth/token/ \
  -d '{"username":"test@example.com","password":"password"}'

echo "\nTesting Employee Summary..."
time curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/hcm/employees/summary/

echo "\nTesting Employee List..."
time curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/hcm/employees/?limit=100

# All should complete in <1 second each
```

---

### Expected Improvements

| Action | Before | After | ✅ Target |
|--------|--------|-------|-----------|
| Login | 5-8s | 1-2s | <2s |
| Open Employee Form | 2-3s | 200-400ms | <500ms |
| Dashboard Load | 2-3s | 200-400ms | <500ms |
| Employee Search | 1-2s | 100-200ms | <300ms |
| API Response | 1-2s | 50-150ms | <200ms |

---

## Monitoring in Production

### Django Debug Toolbar (Dev)
```python
# settings.py
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
```

### Django Silk (Production-safe)
```python
# settings.py
INSTALLED_APPS += ['silk']
MIDDLEWARE = ['silk.middleware.SilkyMiddleware'] + MIDDLEWARE

# urls.py
urlpatterns += [path('silk/', include('silk.urls', namespace='silk'))]
```

### Application Performance Monitoring
```bash
# Production monitoring:
pip install django-statsd-mozilla
# or
pip install newrelic
# or
pip install sentry-sdk
```

---

## Rollback Plan (If Needed)

If any issues found:
```bash
# Revert specific file
git checkout HEAD -- apps/hcm/serializers.py

# Or revert entire commit
git revert COMMIT_SHA

# Run tests
python manage.py test
```

---

## Notes

- **Cache Invalidation:** Form data updates are automatically invalidated via `queryClient.invalidateQueries()`
- **Workspace Switching:** Caches are workspace-aware (workspaceId in queryKey)
- **No Breaking Changes:** All endpoints backward compatible
- **Database:** No migrations required
- **Frontend:** No dependency updates required

---

## Success Criteria ✅

All of the following should be true:
- [ ] Login <2 seconds
- [ ] Employee form <500ms on second open
- [ ] Dashboard summary <500ms
- [ ] No N+1 queries in Django Debug Toolbar
- [ ] Payloads 40% smaller (check Network tab size)
- [ ] Smooth 60fps scrolling in employee lists
- [ ] No console errors in browser DevTools

---

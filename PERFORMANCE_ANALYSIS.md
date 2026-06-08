# HRMS Performance Analysis: Login & Employee Creation Slowness

## Problem Summary
The application feels slow and laggy when:
1. **Logging in online** - Takes extra time to redirect to dashboard/portfolio
2. **Adding a new employee** - Modal takes time to render and form submission is slow

---

## Root Causes Identified

### 1. **N+1 Query Problem in Employee Detail Serializer** ⚠️ CRITICAL
**Location:** `apps/hcm/serializers.py` lines 120-149 (EmployeeDetailSerializer)

**Issue:**
```python
class EmployeeDetailSerializer(serializers.ModelSerializer):
    employment_type_detail = EmploymentTypeSerializer(source='employment_type', read_only=True)
    department_detail = DepartmentSerializer(source='department', read_only=True)  # ← This loads JOBS!
    category_detail = EmployeeCategorySerializer(source='category', read_only=True)
    classification_detail = EmployeeClassificationSerializer(source='classification', read_only=True)
```

**Why it's slow:**
- When you fetch a single employee detail, the `department_detail` field triggers `DepartmentSerializer`
- `DepartmentSerializer` has a `get_jobs()` method that queries all jobs for that department AGAIN
- If you're editing an employee, the form shows the current data → triggers another lazy load of jobs
- This happens **for every employee query**, causing cascading DB hits

**Database Impact:**
```
1 query: SELECT * FROM hcm_employee WHERE id = X
1 query: SELECT * FROM hcm_department WHERE id = Y
1 query: SELECT * FROM hcm_job WHERE department_id = Y  ← UNNECESSARY - already in department_detail
... repeat for each related object
```

---

### 2. **Missing Query Optimization in Login Flow**
**Location:** `apps/core/jwt_views.py` lines 15-18

**Code:**
```python
memberships = WorkspaceMembership.objects.filter(user=user, is_active=True).select_related('workspace')
```

**Issue:**
- While `select_related('workspace')` exists, the **frontend then makes a SECOND call** to load all workspaces:
  - `/api/v1/auth/token/` → Gets token + workspace info
  - `/api/v1/core/workspaces/my_workspaces/` → Fetches ALL workspaces AGAIN with full details
- This is **redundant data fetching** - the workspace info is already in the login response

**Why slow:**
- Two sequential API calls when one could suffice
- Frontend has to wait for both to complete before showing dashboard

---

### 3. **Heavy Summary Endpoint Loads Too Much Data**
**Location:** `apps/hcm/views.py` lines 110-267 (summary action)

**Issue:**
This endpoint executes **7+ separate database queries** with nested filters:

```python
# Query 1: Count active employees
active_qs = employees_qs.filter(employment_status='ACTIVE')
total = active_qs.count()

# Query 2: Count on-leave employees (nested subquery!)
current_leave_qs = LeaveRequest.objects.filter(
    status='APPROVED',
    start_date__lte=today,
    end_date__gte=today
).values('employee').distinct().count()

# Queries 3-4: Sick notes + leaves + counts
# Queries 5-7: Hearings + investigations

return Response({...})  # All in ONE request
```

**Why slow:**
- Called on **every dashboard load** (Summary.tsx probably calls this)
- Each count() is a separate database query
- The queries are sequential (not parallelized)
- No pagination/limits on the subqueries

---

### 4. **Employee Form Loads Too Much Reference Data**
**Location:** `hrms-web/src/components/EmployeeForm.tsx` lines 20-35

**Code:**
```typescript
const { data: departments = [] } = useQuery({
  queryKey: ['departments-min'],
  queryFn: async () => {
    const res = await http.get('/api/v1/hcm/departments/', 
      { params: { page_size: 200 } }  // ← Loads ALL 200 departments!
    );
    return res.data?.results ?? res.data ?? [];
  },
});

const { data: jobs = [] } = useQuery({
  queryKey: ['jobs', selectedDepartment],
  queryFn: async () => {
    const params = selectedDepartment 
      ? { department: selectedDepartment, page_size: 200 } 
      : { page_size: 200 };  // ← Loads ALL jobs!
    const res = await http.get('/api/v1/hcm/jobs/', { params });
    return res.data?.results ?? res.data ?? [];
  },
});
```

**Why slow:**
- Fetches 200 items on **every form open**
- No caching between form closes/opens
- If you open the form twice, it fetches twice
- The queryKey doesn't include the workspace, so same data fetched across workspace switches

---

### 5. **Workspace Middleware Does Redundant Database Lookups**
**Location:** `apps/core/middleware.py` lines 48-71

**Code:**
```python
if request.user and request.user.is_authenticated and workspace_id:
    try:
        membership = WorkspaceMembership.objects.select_related('workspace').get(
            user=request.user,
            workspace_id=workspace_id,
            is_active=True
        )
```

**Why slow:**
- This runs on **EVERY request** (middleware)
- The frontend already has the workspace ID in localStorage
- We're doing a database lookup for every API call to validate workspace access
- Not cached, even though it doesn't change during a session

---

### 6. **EmployeeDetailSerializer Returns More Data Than Needed**
**Location:** `apps/hcm/serializers.py` lines 120-149

**Fields returned even when not needed:**
```python
fields = [
    'nrc', 'nrc_number', 'passport', 'tpin', 'nhima', 'sss_number', 'napsa_number',
    'date_of_birth', 'gender', 'nationality',
    'email', 'phone', 'house_address', 'residential_area',
    'employment_type', 'employment_type_detail',  # Detail + ID = redundant
    'employment_status', 'job_title', 'department', 'department_detail',
    'category', 'category_detail', 'classification', 'classification_detail', 
    # ... 20+ fields for a single employee view
]
```

**Why slow:**
- Serializing 25+ fields takes time
- Nested serializers (category_detail, classification_detail) expand data unnecessarily
- Network payload is larger than needed

---

## Summary: The Slowdown Flow

### On Login:
```
1. Submit credentials
2. [WAIT] /api/v1/auth/token/ → 1-2 sec (workspace lookup in middleware)
3. Store tokens
4. [WAIT] /api/v1/core/workspaces/my_workspaces/ → 1-2 sec (redundant load)
5. Determine workspace & redirect
6. [WAIT] /api/v1/hcm/employees/summary/ → 2-3 sec (7+ queries)
7. Render dashboard → 1 sec
TOTAL: 5-8 seconds from click to dashboard visible ❌
```

### On Adding Employee:
```
1. Click "Add Employee"
2. [WAIT] Modal renders, fetches:
   - /api/v1/hcm/departments/?page_size=200 → 1 sec
   - /api/v1/hcm/jobs/?page_size=200 → 1 sec
3. User fills form (feel lags if typing)
4. Click Submit
5. [WAIT] POST /api/v1/hcm/employees/ → 1-2 sec
6. [WAIT] Re-fetch employee list → 2-3 sec (N+1 queries in serializer)
TOTAL: 5-7 seconds from click to close ❌
```

---

## Why It Feels "Laggy" Even If Technically "Fast"

1. **Sequential loading** - Multiple API calls wait for each other instead of parallel
2. **Cascading queries** - One action triggers many DB queries one-by-one
3. **No caching** - Same data fetched repeatedly
4. **Bloated responses** - Returning 25+ fields when only 5 needed for the form
5. **Blocking UI** - Modal opens but feels frozen while loading
6. **No optimistic updates** - Form submission doesn't optimistically close

---

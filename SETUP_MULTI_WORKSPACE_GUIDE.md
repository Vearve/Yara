# Guide: Setting Up Multi-Workspace Access for Consultants in Django Admin

## Problem
User created in Django Admin sees company dashboard instead of portfolio/consultant dashboard, or only sees one workspace instead of two.

## Root Cause
- The user must have **2 or more `WorkspaceMembership` records** to be treated as a consultant
- If a user has only 1 workspace membership, they see the company dashboard
- If they have 2+ memberships, they see the portfolio dashboard

## Steps to Fix:

### 1. In Django Admin (http://localhost:8000/admin)

Go to **Auth and Authorization > Users** and find user "Fild_C26"

### 2. Add Workspace Memberships

Go to **Core > Workspace Memberships** and create entries:

**Entry 1:**
- User: Fild_C26
- Workspace: [Your first workspace, e.g., "Miniver"]
- Role: ADMIN (or appropriate role)
- Is Active: ✓ (checked)
- Is Default: ✓ (checked) - This is the workspace they see first

**Entry 2:**
- User: Fild_C26
- Workspace: [Your second workspace]
- Role: ADMIN (or appropriate role)
- Is Active: ✓ (checked)
- Is Default: ☐ (unchecked) - Not the default

### 3. Verify Setup

After creating 2+ WorkspaceMembership records:

1. Log out completely
2. Log in as Fild_C26
3. You should see:
   - Portfolio/Consultant dashboard (because they have 2+ workspaces)
   - Ability to see all 2 workspaces in the portfolio view
   - Can click "Open Workspace" to switch between them

## Automatic Setup Script

After creating the user in Django Admin, you can run:

```bash
cd C:\Users\PC\hrms-backend
venv\Scripts\python setup_user_workspaces.py
```

This script will:
- Find user Fild_C26
- Find the Miniver workspace
- Add the user to it
- Add to any other workspaces they need

## Key Points

1. **A consultant = User with 2+ workspace memberships**
2. **A single-workspace user = Employee with 1 workspace membership**
3. The frontend checks `memberships.length > 1` to decide the dashboard
4. `is_default = True` on one membership determines the landing workspace
5. The `isConsultant` localStorage flag is set during login based on membership count

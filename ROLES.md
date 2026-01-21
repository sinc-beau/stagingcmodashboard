# User Roles System

This application has a three-tier role system for managing access and permissions.

## Roles Overview

### 1. Admin
**Full system access**

Capabilities:
- Manage all users (approve, reject, delete sponsor users)
- View and manage all sponsors
- View and manage all events
- View and manage all attendees
- Send and view all messages
- Access user activity logs
- Full CRUD operations on all resources

Access:
- Dashboard: `/admin`
- Approvals: `/admin/approvals`
- All admin-only features

### 2. Account Manager
**Operational management access**

Capabilities:
- View and manage all sponsors
- View and manage all events
- View and manage all attendees
- Send and view messages to/from sponsors
- Manage intake checklists and items
- Publish/unpublish events
- View (but not modify) user information

Restrictions:
- Cannot approve, reject, or manage user accounts
- Cannot create or manage other account managers
- Cannot access admin-only features

Access:
- Dashboard: `/account-manager`
- Sponsor management views
- Event management features

### 3. Sponsor
**Limited self-service access**

Capabilities:
- View their own sponsor profile
- View events they're associated with
- View attendees for their events
- Send and view messages related to their account
- Update their own profile information

Restrictions:
- Cannot view or manage other sponsors
- Cannot create or manage events (view only)
- Cannot access admin or management features

Access:
- Dashboard: `/sponsor`
- Profile: `/sponsor/profile`
- Events: `/sponsor/events/:id`
- Messages: `/sponsor/messages`

## Database Structure

### Role Definition
Roles are stored in the `sponsor_users` table with a constraint that enforces only these three values:

```sql
role text CHECK (role IN ('sponsor', 'admin', 'account_manager'))
```

### Row Level Security (RLS)

The system uses helper functions for role-based access control:

#### `is_admin()`
Returns true if the current user is an approved admin.

#### `is_account_manager()`
Returns true if the current user is an approved account manager.

#### `has_management_access()`
Returns true if the current user is either an admin or account manager.

### RLS Policies

All tables have RLS policies that respect the role hierarchy:

- **Admins**: Full access to all records
- **Account Managers**: Read/write access to sponsors, events, attendees, messages, and related data
- **Sponsors**: Read-only access to their own data

## Creating Users with Different Roles

### Creating an Admin
```sql
-- Via Supabase Auth, then:
INSERT INTO sponsor_users (id, email, role, status, approved_at)
VALUES (
  'auth_user_id',
  'admin@example.com',
  'admin',
  'approved',
  now()
);
```

### Creating an Account Manager
```sql
-- Via Supabase Auth, then:
INSERT INTO sponsor_users (id, email, role, status, approved_at)
VALUES (
  'auth_user_id',
  'manager@example.com',
  'account_manager',
  'approved',
  now()
);
```

### Creating a Sponsor
Sponsors typically sign up through the application at `/signup`. Their initial role is 'sponsor' with status 'pending'. An admin must approve them.

## Frontend Implementation

### AuthContext
The `AuthContext` provides role checking utilities:

```typescript
const { isAdmin, isAccountManager, isSponsor, isApproved } = useAuth();
```

### ProtectedRoute Component
Routes are protected using the `ProtectedRoute` component:

```tsx
<ProtectedRoute requireAdmin requireApproved>
  <AdminDashboard />
</ProtectedRoute>

<ProtectedRoute requireAccountManager requireApproved>
  <AccountManagerDashboard />
</ProtectedRoute>

<ProtectedRoute requireSponsor requireApproved>
  <SponsorDashboard />
</ProtectedRoute>
```

### Router
The router automatically redirects users to their appropriate dashboard based on their role:

- Admins → `/admin`
- Account Managers → `/account-manager`
- Sponsors → `/sponsor`

## Security Considerations

1. **Defense in Depth**: Both frontend routing AND database RLS policies enforce role permissions
2. **Principle of Least Privilege**: Each role has only the permissions necessary for their function
3. **Immutable After Creation**: Users cannot change their own role (only admins can)
4. **Approval Required**: All users must be approved before gaining access
5. **Audit Trail**: User activity is logged for security and compliance

## Testing Roles

To test different roles:

1. Create test users with different roles via `/setup` page or SQL
2. Log in with different accounts to see role-specific interfaces
3. Try to access unauthorized routes to verify protection
4. Attempt database operations to verify RLS policies

## Future Enhancements

Consider adding:
- Role-based notification preferences
- Granular permissions within roles
- Time-limited access grants
- Multi-role support (user can have multiple roles)
- Custom role creation by admins

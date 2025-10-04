# Profile Data Security Guidelines

## Overview
This project uses a **defense-in-depth** approach to protect sensitive user information (email addresses, department) from unauthorized access.

## Database Structure

### Tables and Views

1. **`profiles` table** - Contains all user data including sensitive fields
   - Contains: All profile fields including `email` and `department`
   - RLS policies: Users can only fully access their own profile
   - **Usage**: Only query this table when fetching the CURRENT USER's own profile

2. **`public_profiles` view** - Sanitized view excluding sensitive data
   - Excludes: `email`, `department`
   - Includes: All other public profile fields (name, bio, skills, etc.)
   - **Usage**: Query this view when fetching OTHER USERS' profiles

## Security Rules

### ✅ DO: Use `profiles` table for own profile
```typescript
// Correct: Fetching current user's own profile
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('wallet_address', currentUserAddress)
  .single();
```

### ✅ DO: Use `public_profiles` view for other users
```typescript
// Correct: Fetching other users' profiles
const { data } = await supabase
  .from('public_profiles')
  .select('*')
  .neq('wallet_address', currentUserAddress);
```

### ❌ DON'T: Use `profiles` table for listing multiple users
```typescript
// WRONG: This could expose email addresses!
const { data } = await supabase
  .from('profiles')
  .select('*')
  .limit(10);
```

### ❌ DON'T: Manually exclude email in SELECT
```typescript
// WRONG: Easy to forget, not enforced at DB level
const { data } = await supabase
  .from('profiles')
  .select('id, name, bio, skills'); // Missing email is easy to forget!
```

## Code Locations

### Files Using `public_profiles` (Other Users)
- `src/hooks/useLeaderboard.ts` - Leaderboard rankings
- `src/pages/FindPartner.tsx` - Partner search
- `src/pages/Homepage.tsx` - Community activities, stats
- `src/pages/SessionLobby.tsx` - Partner information
- `src/components/MatchmakingResults.tsx` - Partner matching

### Files Using `profiles` (Own Profile)
- `src/hooks/useProfile.ts` - User's own profile CRUD
- `src/components/ConnectModal.tsx` - Fetching own name only
- `src/components/EmailVerificationModal.tsx` - Updating own email verification
- `src/lib/xpSystem.ts` - Updating own XP and stats
- `src/hooks/useUserStats.ts` - User's own statistics

## Implementation Details

### RLS Policies on `profiles` table
1. `Users can view their own complete profile` - Allows users to see their own email
2. `Public can view profile information` - Allows reading other fields (but use view instead)
3. `Users can update their own profile` - Only owner can update
4. `Users can delete their own profile` - Only owner can delete
5. `Users can create their own profile` - Only owner can create

### View Definition
```sql
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id, wallet_address, name, ens_name, institution,
  academic_level, bio, skills, interests, study_goals,
  preferred_study_times, avatar_url, level, xp,
  sessions_completed, hours_studied, partners_helped,
  average_rating, reliability_score, is_email_verified,
  has_passport, created_at, updated_at
  -- Explicitly excluded: email, department
FROM public.profiles;
```

## Testing Checklist

When adding new features that query profiles:

- [ ] Determine if you need the CURRENT USER's data or OTHER USERS' data
- [ ] Use `profiles` table ONLY for current user's own data
- [ ] Use `public_profiles` view for all other queries
- [ ] Test that email addresses are not exposed in network responses
- [ ] Verify RLS policies are respected in all queries

## Security Benefits

1. **Database-level enforcement** - Cannot accidentally expose email
2. **Clear separation** - Easy to understand which queries are for own vs other users
3. **Defense in depth** - Multiple layers of protection
4. **Future-proof** - New code must explicitly choose the right table/view
5. **Audit trail** - Easy to review which queries access sensitive data

## Questions?

If unsure whether to use `profiles` or `public_profiles`, ask:
- "Am I fetching the currently logged-in user's own profile?" → Use `profiles`
- "Am I fetching any other user's profile?" → Use `public_profiles`
- "Am I listing/searching multiple users?" → Use `public_profiles`

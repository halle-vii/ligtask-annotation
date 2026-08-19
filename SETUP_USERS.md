# Setting Up Test Users

## Step 1: Run the Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `database/schema.sql`
4. Click **Run**

This will create:
- All tables (users, prompts, assignments, evaluations)
- 3 test users in the database:
  - `AD-01` (ADMIN role)
  - `TN-01` (TRANSLATOR role)
  - `AT-01` (ANNOTATOR role)

## Step 2: Test Login Credentials

You can now log in with these credentials:

### Admin User
- **User ID:** `AD-01`
- **Password:** `Admin@24`
- **Access:** Admin dashboard (`/admin`)

### Translator User
- **User ID:** `TN-01`
- **Password:** `Trans@24`
- **Access:** Translation mode (`/translate`)

### Annotator User
- **User ID:** `AT-01`
- **Password:** `Annot@24`
- **Access:** Annotation mode (`/annotate`)

## Step 3: Update Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

## Step 4: Test the Application

1. Start the dev server: `npm run dev`
2. Go to http://localhost:3000
3. Try logging in with each user to test role-based access

## What Happens After Login

### Role-Based Redirects:
- **ADMIN** → Redirected to `/admin`
  - Cannot access `/translate` or `/annotate`
  - Attempting to access will redirect back to `/admin`

- **TRANSLATOR** → Redirected to `/translate`
  - Cannot access `/admin` or `/annotate`
  - Attempting to access will redirect back to `/translate`

- **ANNOTATOR** → Redirected to `/annotate`
  - Cannot access `/admin` or `/translate`
  - Attempting to access will redirect back to `/annotate`

### Session Management:
- Sessions are stored in HTTP-only cookies
- Sessions expire after 24 hours
- Click "Logout" button to end session immediately

## Security Notes

⚠️ **Important for Production:**

The current implementation uses simple password comparison for the prototype. For production:

1. Use Supabase Auth with proper password hashing
2. Implement proper authentication tokens
3. Use bcrypt or similar for password storage
4. Enable email verification
5. Add rate limiting for login attempts
6. Implement password reset functionality

## Troubleshooting

**Issue:** "Invalid user ID or password"
- Make sure you ran the schema SQL completely
- Check that the users table has the 3 test users
- Verify user IDs are exact (case-sensitive)

**Issue:** Getting redirected to login after successful login
- Check browser console for errors
- Verify Supabase URL and keys in `.env.local`
- Make sure cookies are enabled in your browser

**Issue:** Can access pages I shouldn't have access to
- Clear browser cookies
- Restart dev server
- Check middleware.ts is in the root directory

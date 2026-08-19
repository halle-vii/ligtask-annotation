# Quick Start Guide

## What You Have Now

✅ **Complete foundational structure** for the LIGTask web application:
- All main pages implemented (login, translate, annotate, admin)
- TypeScript types for database models
- Database schema ready to deploy
- 5 dummy prompts for testing
- Tailwind CSS styling
- Navigation and progress tracking
- Responsive design

## Try It Out Immediately

1. **Start the development server**:
```bash
npm run dev
```

2. **Visit these pages** (no database needed yet):
   - http://localhost:3000 - Home page
   - http://localhost:3000/login - Login form
   - http://localhost:3000/translate - Translation mode (with dummy data)
   - http://localhost:3000/annotate - Annotation mode (with dummy data)
   - http://localhost:3000/admin - Admin dashboard

3. **Test the workflows**:
   - Navigate through prompts using Previous/Next buttons
   - Click "Evaluate Translation" or "Evaluate Safety"
   - Fill out the evaluation forms
   - Submit (currently logs to console)

## What's Working

### ✅ UI & Navigation
- All pages render correctly
- Previous/Next navigation works
- Progress tracking displays
- Context information shows properly
- Task-specific forms adapt based on task type (NLU/NLR/NLG)

### ✅ Data Display
- Dummy data loads and displays
- English and Filipino text shown side-by-side
- Full context details visible
- Category and task type indicators

### ⚠️ What's Not Connected Yet
- Authentication (shows login form but doesn't authenticate)
- Database operations (uses dummy data instead)
- Evaluation submissions (logs to console only)
- Admin CRUD operations (UI only)

## Next: Connect to Supabase

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Wait for database provisioning (~2 minutes)

### Step 2: Run Database Schema
1. Open Supabase SQL Editor
2. Copy contents from `database/schema.sql`
3. Run the SQL script
4. Verify tables are created

### Step 3: Configure Environment
1. Copy `.env.local.example` to `.env.local`
2. Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```
3. Restart dev server

### Step 4: Disable Public Registration
1. Go to Authentication > Settings in Supabase
2. Disable "Enable Email Signup"
3. This ensures only admins can create accounts

### Step 5: Create First Admin User
```sql
-- Run this in Supabase SQL Editor
INSERT INTO users (name, email, role, active)
VALUES ('Admin User', 'admin@example.com', 'ADMIN', true);
```

Then in Authentication > Users, manually create the auth user with the same email.

## Development Workflow

### Phase 1: Authentication (Next Priority)
File: `app/login/page.tsx`
```typescript
// Replace the mock login with:
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

### Phase 2: Data Fetching
Files: `app/translate/page.tsx`, `app/annotate/page.tsx`
```typescript
// Replace dummy data with:
const { data: prompts } = await supabase
  .from('prompts')
  .select('*')
  .order('created_at');
```

### Phase 3: Evaluation Submission
Create: `app/actions/evaluations.ts`
```typescript
'use server';
export async function submitEvaluation(data) {
  // Insert into evaluations table
  // Update assignment status
}
```

### Phase 4: Admin Features
- User management CRUD
- Prompt upload functionality
- Results export

## File Structure Reference

```
app/
├── page.tsx                    # Home page
├── login/page.tsx             # Login (needs Supabase)
├── translate/
│   ├── page.tsx               # List view ✅
│   └── [promptId]/page.tsx    # Evaluation form ✅
├── annotate/
│   ├── page.tsx               # List view ✅
│   └── [promptId]/page.tsx    # Safety form ✅
└── admin/
    ├── page.tsx               # Dashboard ✅
    ├── users/page.tsx         # User mgmt (needs impl)
    ├── prompts/page.tsx       # Prompt mgmt ✅
    └── results/page.tsx       # Results (needs impl)

lib/
├── supabase.ts                # Client config
└── dummy-data.ts              # Test data ✅

types/
└── database.ts                # TypeScript types ✅

database/
└── schema.sql                 # PostgreSQL schema ✅
```

## Testing Without Database

The app works with dummy data out of the box:
- Browse all 5 sample prompts
- Test translation and annotation forms
- See different task types (NLU, NLR, NLG)
- Verify UI responsiveness
- Check navigation flows

## Need Help?

- **Setup Issues**: Check README.md
- **Development Guide**: See DEVELOPMENT.md
- **Route Overview**: See ROUTES.md
- **Database Schema**: See database/schema.sql
- **Requirements**: See original PDF document

## Production Checklist (Future)

When ready to deploy:
- [ ] Connect Supabase production database
- [ ] Implement authentication
- [ ] Add environment variables to Vercel
- [ ] Test with real users
- [ ] Configure Row Level Security policies
- [ ] Enable audit logging
- [ ] Set up monitoring
- [ ] Create admin account
- [ ] Upload real dataset
- [ ] Train users on the platform

---

**Current Status**: ✅ Foundation complete and tested
**Next Step**: Set up Supabase project and connect authentication
**Time to Production**: ~2-3 days of development work remaining

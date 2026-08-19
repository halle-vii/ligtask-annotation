# Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Overview

This is the foundational implementation of LIGTask. The current version includes:

### ✅ Completed
- Basic UI for all main pages (login, translate, annotate, admin)
- Routing structure following the requirements
- TypeScript type definitions
- Dummy data for development
- Database schema SQL
- Tailwind CSS styling
- Progress tracking UI
- Navigation controls (Previous/Next)

### ⏳ To Be Implemented
1. **Supabase Integration**
   - Authentication flow
   - Database operations
   - Real-time data fetching

2. **Server Actions**
   - User CRUD operations
   - Evaluation submissions
   - Assignment management
   - Results retrieval

3. **Admin Features**
   - User account creation
   - Role assignment
   - Dataset upload
   - Results export

## File Structure

### Core Files
- `app/` - Next.js pages and routing
- `types/database.ts` - TypeScript interfaces
- `lib/supabase.ts` - Supabase client configuration
- `lib/dummy-data.ts` - Sample data for development
- `database/schema.sql` - PostgreSQL schema

### Pages
- `/` - Landing page
- `/login` - Authentication page
- `/translate` - Translation mode list
- `/translate/[promptId]` - Individual translation evaluation
- `/annotate` - Annotation mode list
- `/annotate/[promptId]` - Individual safety evaluation
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/prompts` - Prompt management
- `/admin/results` - Results and analytics

## Working with Dummy Data

The dummy data in `lib/dummy-data.ts` includes 5 sample prompts covering different task types (NLU, NLR, NLG) and categories. This allows you to:
- Test the UI without a database
- Understand the data structure
- Develop features independently

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

1. Create a Supabase project at https://supabase.com
2. Go to SQL Editor
3. Run the schema from `database/schema.sql`
4. Configure authentication:
   - Go to Authentication > Settings
   - Disable email confirmations for development
   - Disable sign-ups (admin-only provisioning)

## Authentication Flow (To Implement)

```typescript
// In login page
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Check user role and redirect
const { data: user } = await supabase
  .from('users')
  .select('role')
  .eq('id', data.user.id)
  .single();

// Redirect based on role
if (user.role === 'TRANSLATOR') router.push('/translate');
if (user.role === 'ANNOTATOR') router.push('/annotate');
if (user.role === 'ADMIN') router.push('/admin');
```

## Next Implementation Steps

### Step 1: Authentication
- Implement Supabase Auth in `/app/login/page.tsx`
- Add middleware for protected routes
- Create user context/hook for auth state

### Step 2: Data Fetching
- Replace dummy data with Supabase queries
- Implement server actions for database operations
- Add loading and error states

### Step 3: Evaluation Submission
- Create server action for evaluation submission
- Update assignment status on completion
- Handle translation revisions and safety labels

### Step 4: Admin Features
- User CRUD operations
- Bulk prompt upload
- Results export to CSV/JSON

## Code Patterns

### Server Action Example
```typescript
// app/actions/evaluations.ts
'use server';

import { supabase } from '@/lib/supabase';

export async function submitEvaluation(data: {
  userId: string;
  promptId: string;
  translationCorrect?: boolean;
  revisedTranslation?: string;
  safetyLabel?: string;
}) {
  const { error } = await supabase
    .from('evaluations')
    .insert(data);
  
  if (error) throw error;
  
  // Update assignment status to 'done'
  await supabase
    .from('assignments')
    .update({ status: 'done', completed_at: new Date().toISOString() })
    .eq('user_id', data.userId)
    .eq('prompt_id', data.promptId);
  
  return { success: true };
}
```

## Testing

Currently no tests are set up. Consider adding:
- Unit tests with Jest
- Integration tests with Playwright
- E2E testing for critical flows

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Deployment
```bash
npm run build
npm start
```

## Support

For questions about the codebase, refer to:
- System Requirements Document (original PDF)
- This development guide
- Database schema comments
- TypeScript types in `types/database.ts`

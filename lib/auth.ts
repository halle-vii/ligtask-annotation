import { supabase } from './supabase';
import { User, UserRole } from '@/types/database';

export interface AuthUser {
  id: string;
  user_id: string;
  name: string;
  role: UserRole;
}

/**
 * Authenticate user with user_id and password
 */
export async function login(userId: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    // First, get the user from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .single();

    console.log('Login attempt for:', userId);
    console.log('Supabase response:', { userData, userError });

    if (userError || !userData) {
      console.log('User not found or error:', userError);
      return { user: null, error: 'Invalid user ID or password' };
    }

    // For now, we'll use a simple password check
    // In production, you should use Supabase Auth properly
    // This is a simplified version for the prototype
    const expectedPassword = getPasswordForUser(userId);
    
    if (password !== expectedPassword) {
      return { user: null, error: 'Invalid user ID or password' };
    }

    // Return the authenticated user
    const authUser: AuthUser = {
      id: userData.id,
      user_id: userData.user_id,
      name: userData.name,
      role: userData.role,
    };

    return { user: authUser, error: null };
  } catch (error) {
    console.error('Login error:', error);
    return { user: null, error: 'An error occurred during login' };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Temporary password helper (for prototype)
 * In production, use Supabase Auth with proper password hashing
 */
function getPasswordForUser(userId: string): string {
  const passwords: Record<string, string> = {
    'AD-01': 'Admin@24',
    'TN-01': 'Trans@24',
    'AT-01': 'Annot@24',
  };
  return passwords[userId] || '';
}

/**
 * Get role home page
 */
export function getRoleHomePage(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'TRANSLATOR':
      return '/translate';
    case 'ANNOTATOR':
      return '/annotate';
    default:
      return '/login';
  }
}

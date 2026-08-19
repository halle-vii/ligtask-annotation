'use server';

import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types/database';

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getUsers error:', error);
    return [];
  }
  return data;
}

export async function createUser(payload: {
  user_id: string;
  name: string;
  role: UserRole;
}) {
  // Check for duplicate user_id
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('user_id', payload.user_id)
    .single();

  if (existing) {
    return { success: false, error: `User ID "${payload.user_id}" is already taken` };
  }

  const { error } = await supabase.from('users').insert({
    user_id: payload.user_id,
    name: payload.name,
    role: payload.role,
    active: true,
  });

  if (error) {
    console.error('createUser error:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function setUserActive(id: string, active: boolean) {
  const { error } = await supabase
    .from('users')
    .update({ active })
    .eq('id', id);

  if (error) {
    console.error('setUserActive error:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

export async function getAdminPrompts() {
  const { data, error } = await supabase
    .from('prompts')
    .select('id, base_id, english_text, task_type, category, created_at')
    .order('base_id', { ascending: true });

  if (error) {
    console.error('getAdminPrompts error:', error);
    return [];
  }
  return data;
}

// ─── Evaluations / Results ────────────────────────────────────────────────────

export async function getEvaluationStats() {
  const { count: total } = await supabase
    .from('evaluations')
    .select('*', { count: 'exact', head: true });

  const { count: translations } = await supabase
    .from('evaluations')
    .select('*', { count: 'exact', head: true })
    .not('translation_correct', 'is', null);

  const { count: annotations } = await supabase
    .from('evaluations')
    .select('*', { count: 'exact', head: true })
    .not('safety_label', 'is', null);

  return {
    total: total ?? 0,
    translations: translations ?? 0,
    annotations: annotations ?? 0,
  };
}

export async function getRecentEvaluations() {
  const { data, error } = await supabase
    .from('evaluations')
    .select(`
      id,
      submitted_at,
      translation_correct,
      revised_translation,
      safety_label,
      users ( user_id, name, role ),
      prompts ( base_id, task_type, category )
    `)
    .order('submitted_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('getRecentEvaluations error:', error);
    return [];
  }
  return data;
}

export async function getPromptCompletionStats() {
  // Returns each prompt with how many evaluations it has received
  const { data, error } = await supabase
    .from('prompts')
    .select(`
      base_id,
      task_type,
      category,
      evaluations ( id )
    `)
    .order('base_id', { ascending: true });

  if (error) {
    console.error('getPromptCompletionStats error:', error);
    return [];
  }
  return data;
}

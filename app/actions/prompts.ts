'use server';

import { supabase } from '@/lib/supabase';
import { Prompt } from '@/types/database';

export async function getPrompts(): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .order('base_id', { ascending: true });

  if (error) {
    console.error('getPrompts error:', error);
    return [];
  }

  return data as Prompt[];
}

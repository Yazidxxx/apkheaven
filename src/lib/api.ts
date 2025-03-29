import { supabase } from './supabase';
import type { SearchParams, SearchResponse, AppDetails } from '../types/app';

export async function searchApps(params: SearchParams): Promise<SearchResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('play-store-api', {
      body: JSON.stringify({ 
        action: 'search',
        ...params 
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching apps:', error);
    throw error;
  }
}

export async function getAppDetails(appId: string): Promise<AppDetails> {
  try {
    const { data, error } = await supabase.functions.invoke('play-store-api', {
      body: JSON.stringify({
        action: 'details',
        appId
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching app details:', error);
    throw error;
  }
}
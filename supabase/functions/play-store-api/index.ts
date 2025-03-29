import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { gplay } from 'npm:google-play-scraper@9.1.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  action: 'search' | 'details';
  query?: string;
  category?: string;
  page?: number;
  perPage?: number;
  appId?: string;
}

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders 
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    let reqBody: RequestBody;
    try {
      reqBody = await req.json();
    } catch (e) {
      throw new Error('Invalid JSON body');
    }

    const { action, query, category, page = 1, perPage = 20, appId } = reqBody;

    // Check cache first
    const cacheKey = `${action}-${query || ''}-${category || ''}-${page}-${perPage}-${appId || ''}`;
    const { data: cachedData } = await supabase
      .from('cache')
      .select('data')
      .eq('key', cacheKey)
      .single();

    if (cachedData) {
      return new Response(
        JSON.stringify(cachedData.data),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    let result;
    if (action === 'search') {
      const apps = await gplay.search({
        term: query || '',
        num: perPage,
        price: 'free',
        throttle: 10,
      });

      result = {
        apps: apps.map(app => ({
          id: app.appId,
          name: app.title,
          description: app.summary,
          icon: app.icon,
          developer: {
            name: app.developer,
            url: app.developerUrl,
          },
          category: app.genre,
          rating: app.score,
          reviews: app.reviews,
          size: app.size,
          version: app.version,
          lastUpdated: app.updated,
          installs: app.installs,
          screenshots: app.screenshots,
          playStoreUrl: app.url,
        })),
        totalApps: apps.length,
        currentPage: page,
        totalPages: Math.ceil(apps.length / perPage),
      };
    } else if (action === 'details' && appId) {
      const app = await gplay.app({ appId });
      result = {
        id: app.appId,
        name: app.title,
        description: app.description,
        icon: app.icon,
        developer: {
          name: app.developer,
          url: app.developerUrl,
        },
        category: app.genre,
        rating: app.score,
        reviews: app.reviews,
        size: app.size,
        version: app.version,
        lastUpdated: app.updated,
        installs: app.installs,
        screenshots: app.screenshots,
        playStoreUrl: app.url,
      };
    } else {
      throw new Error('Invalid action or missing parameters');
    }

    // Cache the result
    await supabase
      .from('cache')
      .upsert({
        key: cacheKey,
        data: result,
        expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour cache
      });

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
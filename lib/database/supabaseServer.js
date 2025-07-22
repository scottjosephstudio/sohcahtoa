import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Server-side client with cookie handling
const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

// Get user data on the server side
export const getServerUserData = async () => {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get the current user from the session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { user: null, dbData: null, error: authError };
    }

    // If user is verified, get their database record
    if (user.email_confirmed_at) {
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (dbError) {
        console.error('Error fetching user database record:', dbError);
        return { user, dbData: null, error: dbError };
      }

      return { user, dbData: dbUser, error: null };
    }

    // User exists but not verified
    return { user, dbData: null, error: null };
  } catch (error) {
    console.error('Error in getServerUserData:', error);
    return { user: null, dbData: null, error };
  }
}; 
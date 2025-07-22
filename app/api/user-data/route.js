import { supabaseService } from '../../../lib/database/supabaseClient';

export async function POST(request) {
  try {
    const { userId } = await request.json();
    
    console.log('🔄 Fetching user data for userId:', userId);
    
    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    // First, fetch the user by auth_user_id (which matches Supabase auth)
    const { data: user, error: userError } = await supabaseService
      .from('users')
      .select('*')
      .eq('auth_user_id', userId)
      .single();

    if (userError) {
      console.log('❌ User fetch error:', userError);
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('✅ User found:', user.email);

    // Fetch user licenses using the database user.id
    const { data: userLicenses, error: licensesError } = await supabaseService
      .from('user_licenses')
      .select('*')
      .eq('user_id', user.id);

    if (licensesError) {
      console.log('❌ User licenses fetch error:', licensesError);
      return Response.json({ error: 'Failed to fetch user licenses' }, { status: 500 });
    }

    console.log('✅ User licenses fetched:', userLicenses?.length || 0);

    // Fetch purchase orders for this user
    const { data: purchaseOrders, error: ordersError } = await supabaseService
      .from('purchase_orders')
      .select(`
        *,
        purchase_items (
          *,
          font_styles (
            *,
            font_families (
              name
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.log('❌ Purchase orders fetch error:', ordersError);
      return Response.json({ error: 'Failed to fetch purchase orders' }, { status: 500 });
    }

    console.log('✅ Purchase orders fetched:', purchaseOrders?.length || 0);

    return Response.json({
      user,
      userLicenses: userLicenses || [],
      purchaseOrders: purchaseOrders || []
    });

  } catch (error) {
    console.error('❌ Error in user-data API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return Response.json(
    { error: 'GET method not supported. Use POST with userId.' },
    { status: 405 }
  );
} 
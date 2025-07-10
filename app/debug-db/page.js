'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/database/supabaseClient';
import { createClient } from '@supabase/supabase-js';

// Create admin client with service role for bypassing RLS
const supabaseAdmin = createClient(
  'https://wnhqomhsqhjqjqfbcdcn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduaHFvbWhzcWhqcWpxZmJjZGNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTc3MDUxNSwiZXhwIjoyMDUxMzQ2NTE1fQ.nJdKGYfPKOB2p2p7C6_VmQMJp2PgLAMY3c3HPWX1ggY',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default function DebugPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message, data = null) => {
    setResults(prev => [...prev, { 
      timestamp: new Date().toLocaleTimeString(), 
      message, 
      data: data ? JSON.stringify(data, null, 2) : null 
    }]);
  };

  const checkDatabase = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      // Check current user
      const { data: { user } } = await supabase.auth.getUser();
      addLog('Current Auth User', user ? { id: user.id, email: user.email } : 'Not logged in');

      if (!user) {
        addLog('❌ No user logged in');
        return;
      }

      // Check users table structure
      addLog('Checking users table structure...');
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'users')
        .eq('table_schema', 'public');

      if (columnsError) {
        addLog('❌ Error checking columns', columnsError);
        
        // Try a simpler approach - just check if users table exists
        addLog('Trying direct table check...');
        const { data: tableCheck, error: tableError } = await supabase
          .from('users')
          .select('count')
          .limit(1);
        
        if (tableError) {
          addLog('❌ Users table does not exist or is not accessible', tableError);
        } else {
          addLog('✅ Users table exists but schema check failed');
        }
      } else {
        addLog('✅ Users table columns', columns);
      }

      // Check how many users exist with this email
      const { data: usersByEmail, error: emailError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', user.email);

      addLog(`Users with email ${user.email}`, {
        count: usersByEmail?.length || 0,
        users: usersByEmail,
        error: emailError
      });

      // Check users by auth_user_id
      const { data: usersByAuthId, error: authError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('auth_user_id', user.id);

      addLog(`Users with auth_user_id ${user.id}`, {
        count: usersByAuthId?.length || 0,
        users: usersByAuthId,
        error: authError
      });

    } catch (error) {
      addLog('❌ Unexpected error', error);
    } finally {
      setLoading(false);
    }
  };

  const addMissingColumns = async () => {
    setLoading(true);
    
    try {
      addLog('Attempting to add missing columns...');
      
      // Try to add email_verified column
      const { error: error1 } = await supabase.rpc('exec_sql', {
        query: 'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;'
      });
      
      if (error1) {
        addLog('❌ Failed to add email_verified', error1);
      } else {
        addLog('✅ Added email_verified column');
      }

      // Try to add email_verification_token column
      const { error: error2 } = await supabase.rpc('exec_sql', {
        query: 'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verification_token TEXT;'
      });
      
      if (error2) {
        addLog('❌ Failed to add email_verification_token', error2);
      } else {
        addLog('✅ Added email_verification_token column');
      }

      // Try to add email_verification_sent_at column
      const { error: error3 } = await supabase.rpc('exec_sql', {
        query: 'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMP WITH TIME ZONE;'
      });
      
      if (error3) {
        addLog('❌ Failed to add email_verification_sent_at', error3);
      } else {
        addLog('✅ Added email_verification_sent_at column');
      }

    } catch (error) {
      addLog('❌ Unexpected error adding columns', error);
    } finally {
      setLoading(false);
    }
  };

  const createUserRecord = async () => {
    setLoading(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        addLog('❌ No authenticated user found');
        return;
      }

      addLog('Creating user record via API endpoint...');
      
      // Call API endpoint to create user record
      const response = await fetch('/api/create-user-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_user_id: user.id,
          email: user.email,
          first_name: 'Scott',
          last_name: 'Joseph'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        addLog('❌ Failed to create user record', result);
      } else {
        addLog('✅ Successfully created user record', result.user);
      }

    } catch (error) {
      addLog('❌ Unexpected error creating user', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Database Debug Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={checkDatabase} 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Checking...' : 'Check Database State'}
        </button>
        
        <button 
          onClick={createUserRecord} 
          disabled={loading}
          style={{ 
            padding: '10px 20px',
            marginRight: '10px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating...' : 'Create User Record'}
        </button>
        
        <button 
          onClick={addMissingColumns} 
          disabled={loading}
          style={{ 
            padding: '10px 20px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Adding...' : 'Add Missing Columns'}
        </button>
      </div>

      <div style={{ 
        background: '#f8f9fa', 
        border: '1px solid #dee2e6', 
        borderRadius: '4px',
        padding: '15px',
        maxHeight: '600px',
        overflow: 'auto'
      }}>
        {results.length === 0 ? (
          <p>Click "Check Database State" to start debugging...</p>
        ) : (
          results.map((result, index) => (
            <div key={index} style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <div style={{ fontWeight: 'bold', color: '#007bff' }}>
                [{result.timestamp}] {result.message}
              </div>
              {result.data && (
                <pre style={{ 
                  background: '#e9ecef', 
                  padding: '10px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  marginTop: '5px'
                }}>
                  {result.data}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 
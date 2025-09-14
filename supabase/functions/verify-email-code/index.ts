import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  email: string;
  walletAddress: string;
  otp: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, walletAddress, otp }: VerifyRequest = await req.json();
    
    console.log('🔍 Verifying OTP for:', email, 'wallet:', walletAddress);

    if (!email || !walletAddress || !otp) {
      return new Response(
        JSON.stringify({ error: 'Email, wallet address, and OTP are required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find the most recent, unverified, non-expired OTP for this email and wallet
    const { data: verification, error: fetchError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .eq('wallet_address', walletAddress)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ Database fetch error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Database error occurred' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    if (!verification) {
      console.log('❌ No valid verification found');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired verification code' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    if (verification.otp !== otp) {
      console.log('❌ OTP mismatch');
      return new Response(
        JSON.stringify({ error: 'Invalid verification code' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Mark verification as complete
    const { error: updateError } = await supabase
      .from('email_verifications')
      .update({ verified: true })
      .eq('id', verification.id);

    if (updateError) {
      console.error('❌ Failed to mark verification as complete:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to complete verification' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Update profile to mark email as verified
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_email_verified: true })
      .eq('wallet_address', walletAddress);

    if (profileError) {
      console.error('❌ Failed to update profile:', profileError);
      // Don't return error here as verification was successful, just log it
    }

    // Clean up old verification records for this email (optional)
    await supabase
      .from('email_verifications')
      .delete()
      .eq('email', email)
      .neq('id', verification.id);

    console.log('✅ Email verification successful');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email verified successfully!',
        verified: true 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);
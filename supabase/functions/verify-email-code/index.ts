import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  email: string;
  walletAddress: string;
  otp: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, walletAddress, otp }: VerifyRequest = await req.json();
    
    console.log('🔍 Processing verification for:', { email, walletAddress, otp });

    if (!email || !walletAddress || !otp) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: "Email, wallet address, and OTP are required" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    // Create Supabase client using service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if OTP exists and is valid
    const { data: verification, error: fetchError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .eq('wallet_address', walletAddress)
      .eq('otp_code', otp)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !verification) {
      console.error('❌ Invalid or expired OTP:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid or expired verification code",
          success: false 
        }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    console.log('✅ OTP validated successfully');

    // Mark verification as completed
    const { error: updateVerificationError } = await supabase
      .from('email_verifications')
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq('id', verification.id);

    if (updateVerificationError) {
      console.error('❌ Failed to mark verification as completed:', updateVerificationError);
      return new Response(
        JSON.stringify({ error: "Failed to complete verification" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    // Update user profile to mark email as verified
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ is_email_verified: true })
      .eq('email', email)
      .eq('wallet_address', walletAddress);

    if (updateProfileError) {
      console.error('❌ Failed to update profile:', updateProfileError);
      return new Response(
        JSON.stringify({ error: "Failed to update profile verification status" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    console.log('✅ Email verification completed successfully');

    // Clean up old verification codes for this email
    await supabase
      .from('email_verifications')
      .delete()
      .eq('email', email)
      .neq('id', verification.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email verified successfully" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("❌ Error in verify-email-code function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
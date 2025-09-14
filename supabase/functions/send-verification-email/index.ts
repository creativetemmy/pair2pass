import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendVerificationRequest {
  email: string;
  walletAddress: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, walletAddress }: SendVerificationRequest = await req.json();
    
    console.log('📧 Sending verification email to:', email, 'for wallet:', walletAddress);

    if (!email || !walletAddress) {
      return new Response(
        JSON.stringify({ error: 'Email and wallet address are required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Initialize Supabase client with service role key for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in database
    const { error: insertError } = await supabase
      .from('email_verifications')
      .insert({
        email,
        wallet_address: walletAddress,
        otp,
        verified: false,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes from now
      });

    if (insertError) {
      console.error('❌ Database error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to store verification code' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Send email via Mailtrap
    const mailtrapToken = Deno.env.get('MAILTRAP_API_TOKEN');
    if (!mailtrapToken) {
      console.error('❌ Missing Mailtrap API token');
      return new Response(
        JSON.stringify({ error: 'Email service configuration error' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const emailResponse = await fetch('https://send.api.mailtrap.io/api/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mailtrapToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: {
          email: 'noreply@pair2pass.com',
          name: 'Pair2Pass'
        },
        to: [{
          email: email
        }],
        subject: 'Verify Your Email - Pair2Pass',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #333; text-align: center; margin-bottom: 30px;">
                📚 Pair2Pass Email Verification
              </h1>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
                <h2 style="color: #495057; margin: 0 0 15px 0; font-size: 18px;">
                  Your verification code is:
                </h2>
                <div style="text-align: center; font-size: 32px; font-weight: bold; color: #007bff; background-color: white; padding: 15px; border-radius: 4px; letter-spacing: 3px; border: 2px dashed #007bff;">
                  ${otp}
                </div>
              </div>
              
              <div style="margin-bottom: 25px; padding: 15px; background-color: #e7f3ff; border-left: 4px solid #007bff; border-radius: 4px;">
                <p style="margin: 0; color: #495057; font-size: 14px;">
                  <strong>📱 Enter this code in the Pair2Pass app to verify your email address.</strong><br>
                  This code will expire in 10 minutes for security.
                </p>
              </div>
              
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
                <p style="margin: 0; color: #856404; font-size: 13px;">
                  🛡️ <strong>Security Notice:</strong> If you didn't request this verification, please ignore this email. 
                  Never share your verification code with anyone.
                </p>
              </div>
              
              <div style="text-align: center; padding-top: 20px; border-top: 1px solid #dee2e6;">
                <p style="color: #6c757d; font-size: 12px; margin: 0;">
                  This email was sent from Pair2Pass for wallet address: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}
                </p>
              </div>
            </div>
          </div>
        `,
        text: `
          Pair2Pass Email Verification
          
          Your verification code is: ${otp}
          
          Enter this code in the Pair2Pass app to verify your email address.
          This code will expire in 10 minutes for security.
          
          If you didn't request this verification, please ignore this email.
          
          Wallet: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}
        `
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('❌ Mailtrap API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to send verification email' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('✅ Verification email sent successfully');
    
    return new Response(
      JSON.stringify({ success: true, message: 'Verification code sent to your email' }),
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
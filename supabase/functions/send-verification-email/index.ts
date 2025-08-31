import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  email: string;
  walletAddress: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, walletAddress }: VerificationRequest = await req.json();
    
    console.log('📧 Processing verification request for:', { email, walletAddress });

    if (!email || !walletAddress) {
      console.error('❌ Missing required fields:', { email: !!email, walletAddress: !!walletAddress });
      return new Response(
        JSON.stringify({ error: "Email and wallet address are required" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔢 Generated OTP:', otp);
    
    // Create Supabase client using service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store OTP in database with expiration (3 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 3);

    const { error: insertError } = await supabase
      .from('email_verifications')
      .upsert({
        email: email,
        wallet_address: walletAddress,
        otp_code: otp,
        expires_at: expiresAt.toISOString(),
        verified: false,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('❌ Database error:', insertError);
      return new Response(
        JSON.stringify({ error: "Failed to store verification code" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    console.log('✅ OTP stored in database, sending email...');

    // Send email with OTP
    const emailResponse = await resend.emails.send({
      from: "StudySync <onboarding@resend.dev>",
      to: [email],
      subject: "Verify Your Email - StudySync",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">📚 StudySync</h1>
            <h2 style="color: #1f2937; margin-top: 0;">Email Verification</h2>
          </div>
          
          <div style="background: linear-gradient(135deg, #f3f4f6, #e5e7eb); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
              Your verification code is:
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block; border: 2px solid #2563eb; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px;">${otp}</span>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 15px;">
              This code will expire in 3 minutes.
            </p>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>🔒 Security tip:</strong> Never share this code with anyone. StudySync will never ask for your verification code.
            </p>
          </div>
          
          <div style="text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
            <p>If you didn't request this verification, you can safely ignore this email.</p>
            <p>© 2025 StudySync - Empowering students through collaborative learning</p>
          </div>
        </div>
      `,
    });

    console.log("📧 Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent successfully" 
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
    console.error("❌ Error in send-verification-email function:", error);
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
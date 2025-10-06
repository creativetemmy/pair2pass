// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { email, walletAddress, otp } = await req.json();

    const response = await fetch("https://send.api.mailtrap.io/api/send", {
      method: "POST",
      headers: {
        "Api-Token": `${Deno.env.get("MAILTRAP_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: [
          {
            email: "support@pair2pass.com",
            name: "Pair2Pass"
          }
        ],
        to: [
          {
            email
          }
        ]
        ,
        subject: "Verify Your Email - Pair2Pass",
       html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;"> 
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"> 
                    <h1 style="color: #333; text-align: center; margin-bottom: 30px;"> 📚 Pair2Pass Email Verification </h1> 
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 25px;"> 
                      <h2 style="color: #495057; margin: 0 0 15px 0; font-size: 18px;"> Your verification code is: </h2> 
                    <div style="text-align: center; font-size: 32px; font-weight: bold; color: #007bff; background-color: white; padding: 15px; border-radius: 4px; letter-spacing: 3px; border: 2px dashed #007bff;"> 
                      ${otp} 
                    </div> 
                    </div> 
                    <div style="margin-bottom: 25px; padding: 15px; background-color: #e7f3ff; border-left: 4px solid #007bff; border-radius: 4px;"> 
                      <p style="margin: 0; color: #495057; font-size: 14px;"> 
                        <strong>📱 Enter this code in the Pair2Pass app to verify your email address.</strong>
                        <br> This code will expire in 10 minutes for security. 
                      </p> 
                    </div> 
                    <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #ffc107;"> 
                      <p style="margin: 0; color: #856404; font-size: 13px;">
                         🛡️ <strong>Security Notice:</strong> If you didn't request this verification, please ignore this email. Never share your verification code with anyone. 
                      </p> 
                     </div> 
                     <div style="text-align: center; padding-top: 20px; border-top: 1px solid #dee2e6;"> 
                       <p style="color: #6c757d; font-size: 12px; margin: 0;"> 
                         This email was sent from Pair2Pass for wallet address: ${walletAddress.substring( 0, 6 )}...${walletAddress.substring(walletAddress.length - 4)} </p>
                          </div> </div> </div>` , 
      text: `Pair2Pass Email Verification Your verification code is: ${otp} Enter this code in the Pair2Pass app to verify your email address. This code will expire in 10 minutes for security. If you didn't request this verification, please ignore this email.`
      }),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // 👈 allow frontend
      },
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // 👈 allow frontend even on error
      },
    });
  }
});

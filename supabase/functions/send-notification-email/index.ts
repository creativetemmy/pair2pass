import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  email: string;
  type:
    | "session_created"
    | "session_matched"
    | "session_reminder"
    | "session_completed"
    | "partner_feedback";
  data: {
    userName?: string;
    partnerName?: string;
    sessionSubject?: string;
    sessionTime?: string;
    sessionGoal?: string;
    sessionId?: string;
    meetingLink?: string;
    rating?: number;
    feedback?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type, data }: NotificationRequest = await req.json();

    console.log("📧 Sending notification email:", type, "to:", email);

    if (!email || !type) {
      return new Response(
        JSON.stringify({ error: "Email and notification type are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if user has verified email
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_email_verified")
      .eq("email", email)
      .maybeSingle();

    if (profileError) {
      console.error(
        "❌ Failed to check email verification status:",
        profileError
      );
      return new Response(
        JSON.stringify({ error: "Failed to verify user email status" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!profile?.is_email_verified) {
      console.log("⚠️ Email not verified, skipping notification");
      return new Response(
        JSON.stringify({ success: false, message: "Email not verified" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const mailtrapToken = Deno.env.get("MAILTRAP_API_TOKEN");
    if (!mailtrapToken) {
      console.error("❌ Missing Mailtrap API token");
      return new Response(
        JSON.stringify({ error: "Email service configuration error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate email content based on notification type
    let subject = "";
    let htmlContent = "";
    let textContent = "";

    switch (type) {
      case "session_created":
        subject = "📚 Study Session Created - Pair2Pass";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #333; text-align: center;">📚 Study Session Created!</h1>
              
              <div style="background-color: #e7f3ff; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <p><strong>Subject:</strong> ${data.sessionSubject}</p>
                <p><strong>Goal:</strong> ${data.sessionGoal}</p>
                <p><strong>Time:</strong> ${data.sessionTime}</p>
              </div>
              
              <p>Hi ${data.userName}! 🎉</p>
              <p>Your study session has been created successfully. We're now looking for the perfect study partner for you.</p>
              <p>You'll receive another notification once we find a match!</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://pair2pass.com" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  View Session
                </a>
              </div>
            </div>
          </div>
        `;
        textContent = `Study Session Created!\n\nHi ${data.userName}!\n\nYour study session has been created:\nSubject: ${data.sessionSubject}\nGoal: ${data.sessionGoal}\nTime: ${data.sessionTime}\n\nWe're looking for the perfect study partner for you!`;
        break;

      case "session_matched":
        subject = "🎯 Study Partner Found - Pair2Pass";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #333; text-align: center;">🎯 Study Partner Found!</h1>
              
              <div style="background-color: #d4edda; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <p><strong>Your Partner:</strong> ${data.partnerName}</p>
                <p><strong>Subject:</strong> ${data.sessionSubject}</p>
                <p><strong>Time:</strong> ${data.sessionTime}</p>
                ${
                  data.meetingLink
                    ? `<p><strong>Meeting Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>`
                    : ""
                }
              </div>
              
              <p>Excellent news! 🌟</p>
              <p>We've found the perfect study partner for your session. Get ready to collaborate and achieve your study goals together!</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://pair2pass.com/session/${
                  data.sessionId
                }" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  Join Session
                </a>
              </div>
            </div>
          </div>
        `;
        textContent = `Study Partner Found!\n\nGreat news! We've found a study partner for you:\nPartner: ${
          data.partnerName
        }\nSubject: ${data.sessionSubject}\nTime: ${data.sessionTime}\n${
          data.meetingLink ? `Meeting Link: ${data.meetingLink}\n` : ""
        }Ready to start studying together!`;
        break;

      case "session_reminder":
        subject = "⏰ Study Session Reminder - Pair2Pass";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #333; text-align: center;">⏰ Session Starting Soon!</h1>
              
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <p><strong>Partner:</strong> ${data.partnerName}</p>
                <p><strong>Subject:</strong> ${data.sessionSubject}</p>
                <p><strong>Starting:</strong> ${data.sessionTime}</p>
              </div>
              
              <p>Don't forget! Your study session is starting soon.</p>
              <p>Make sure you're ready with your materials and join on time to make the most of your session! 📚</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.meetingLink}" style="background-color: #ffc107; color: #212529; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  Join Now
                </a>
              </div>
            </div>
          </div>
        `;
        textContent = `Session Starting Soon!\n\nYour study session is about to begin:\nPartner: ${data.partnerName}\nSubject: ${data.sessionSubject}\nTime: ${data.sessionTime}\n\nDon't be late!`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid notification type" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
    }

    const emailResponse = await fetch("https://send.api.mailtrap.io/api/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mailtrapToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: {
          email: "notifications@pair2pass.com",
          name: "Pair2Pass",
        },
        to: [
          {
            email: email,
          },
        ],
        subject,
        html: htmlContent,
        text: textContent,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("❌ Mailtrap API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to send notification email" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("✅ Notification email sent successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification sent successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);

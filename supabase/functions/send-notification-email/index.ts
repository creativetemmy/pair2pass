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
    | "welcome"
    | "profile_complete"
    | "match_found"
    | "confirmation_reminder"
    | "session_reminder"
    | "session_complete"
    | "milestone_reached"
    | "badge_unlocked"
    | "session_created"
    | "session_matched"
    | "session_completed"
    | "partner_feedback";
  data: {
    userName?: string;
    partnerName?: string;
    sessionSubject?: string;
    subject?: string;
    sessionTime?: string;
    sessionGoal?: string;
    goal?: string;
    sessionId?: string;
    meetingLink?: string;
    rating?: number;
    feedback?: string;
    blogUrl?: string;
    findPartnerUrl?: string;
    duration?: string | number;
    confirmUrl?: string;
    minutesLeft?: string | number;
    remindUrl?: string;
    findNewUrl?: string;
    sessionUrl?: string;
    xpEarned?: string | number;
    mintUrl?: string;
    level?: string | number;
    totalXP?: string | number;
    topPercentage?: string | number;
    profileUrl?: string;
    badgeName?: string;
    badgeEmoji?: string;
    badgeDescription?: string;
    message?: string;
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
      case "welcome":
        subject = "🎓 Welcome to Pair2Pass - Your Study Journey Begins!";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #333; text-align: center; margin-bottom: 30px;">
                🎓 Welcome to Pair2Pass!
              </h1>
              <p>Hi there,</p>
              <p>Your email has been verified! Welcome to the Pair2Pass community.</p>
              <div style="background-color: #e7f3ff; padding: 20px; border-radius: 6px; margin: 25px 0;">
                <h3 style="color: #007bff; margin-top: 0;">Quick Start Guide:</h3>
                <ol style="margin: 15px 0; padding-left: 20px;">
                  <li>Complete your profile with academic info and interests</li>
                  <li>Set your study goals</li>
                  <li>Find your first study partner</li>
                  <li>Start earning XP and badges!</li>
                </ol>
              </div>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${
                  data.blogUrl || "https://pair2pass.com/blog"
                }" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Read Our Getting Started Guide
                </a>
              </p>
              <p>Happy studying!</p>
            </div>
          </div>
        `;
        textContent = `Welcome to Pair2Pass! Your email has been verified. Complete your profile and find your first study partner to start earning XP!`;
        break;

      case "profile_complete":
        subject = "🎉 Profile Complete - Ready to Find Study Partners!";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #333; text-align: center; margin-bottom: 30px;">
                🎉 Profile Complete!
              </h1>
              <p>Congratulations ${data.userName || ""}!</p>
              <p>Your profile is now complete and visible to potential study partners.</p>
              <div style="background-color: #d4edda; padding: 20px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #28a745;">
                <p style="margin: 0; color: #155724;">
                  <strong>✅ What's next?</strong><br>
                  Start finding study partners who match your goals and interests. The more sessions you complete, the more XP and badges you'll earn!
                </p>
              </div>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${
                  data.findPartnerUrl || "https://pair2pass.com/find-partner"
                }" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Find a Study Partner Now
                </a>
              </p>
            </div>
          </div>
        `;
        textContent = `Congratulations! Your profile is complete. Start finding study partners now!`;
        break;

      case "match_found":
        subject = `🤝 Study Partner Found - ${data.partnerName} for ${
          data.subject || data.sessionSubject
        }`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #333; text-align: center; margin-bottom: 30px;">
                🤝 You've Been Matched!
              </h1>
              <p>Great news!</p>
              <p>You've been matched with <strong>${
                data.partnerName
              }</strong> for <strong>${
          data.subject || data.sessionSubject
        }</strong>.</p>
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 6px; margin: 25px 0;">
                <h3 style="color: #856404; margin-top: 0;">Session Details:</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li><strong>Subject:</strong> ${
                    data.subject || data.sessionSubject
                  }</li>
                  <li><strong>Goal:</strong> ${
                    data.goal || data.sessionGoal || "Not specified"
                  }</li>
                  <li><strong>Duration:</strong> ${data.duration} minutes</li>
                </ul>
              </div>
              <p style="background-color: #f8d7da; padding: 15px; border-radius: 6px; color: #721c24; border-left: 4px solid #f5c6cb;">
                ⏰ <strong>Action Required:</strong> Please confirm your study session within the next 30 minutes to avoid auto-cancellation.
              </p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${
                  data.confirmUrl || "https://pair2pass.com/dashboard"
                }" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Confirm Study Session
                </a>
              </p>
            </div>
          </div>
        `;
        textContent = `You've been matched with ${data.partnerName} for ${
          data.subject || data.sessionSubject
        }. Confirm your session now!`;
        break;

      case "confirmation_reminder":
        subject = "⏰ Reminder: Confirm Your Study Session";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #333; text-align: center; margin-bottom: 30px;">
                ⏰ Session Expiring Soon
              </h1>
              <p>Hi ${data.userName || ""},</p>
              <p>Your partner <strong>${
                data.partnerName
              }</strong> hasn't confirmed your study session yet.</p>
              <div style="background-color: #f8d7da; padding: 20px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #f5c6cb;">
                <p style="margin: 0; color: #721c24;">
                  ⚠️ <strong>Time's running out!</strong><br>
                  This session will auto-cancel in ${
                    data.minutesLeft || "15"
                  } minutes if not confirmed.
                </p>
              </div>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${
                  data.remindUrl || "https://pair2pass.com/dashboard"
                }" style="display: inline-block; background-color: #ffc107; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">
                  Send Reminder
                </a>
                <a href="${
                  data.findNewUrl || "https://pair2pass.com/find-partner"
                }" style="display: inline-block; background-color: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Find Another Partner
                </a>
              </p>
            </div>
          </div>
        `;
        textContent = `Your partner hasn't confirmed yet. Session will auto-cancel in ${
          data.minutesLeft || "15"
        } minutes.`;
        break;

      case "session_reminder":
        subject = "📚 Your Study Session Starts in 10 Minutes!";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #333; text-align: center; margin-bottom: 30px;">
                📚 Session Starting Soon!
              </h1>
              <p>Hi ${data.userName || ""},</p>
              <p>Your study session with <strong>${
                data.partnerName
              }</strong> starts in <strong>10 minutes</strong>!</p>
              <div style="background-color: #d1ecf1; padding: 20px; border-radius: 6px; margin: 25px 0;">
                <h3 style="color: #0c5460; margin-top: 0;">Session Details:</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li><strong>Subject:</strong> ${
                    data.subject || data.sessionSubject
                  }</li>
                  <li><strong>Duration:</strong> ${
                    data.duration || "60"
                  } minutes</li>
                  <li><strong>Meeting Link:</strong> ${
                    data.meetingLink
                      ? `<a href="${data.meetingLink}" style="color: #007bff;">Join here</a>`
                      : "Check dashboard"
                  }</li>
                </ul>
              </div>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${
                  data.sessionUrl ||
                  data.meetingLink ||
                  "https://pair2pass.com/session-lobby"
                }" style="display: inline-block; background-color: #17a2b8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Join Session Lobby
                </a>
              </p>
              <p style="color: #666; font-size: 14px;">Don't be late! Punctuality builds trust and improves your reliability score.</p>
            </div>
          </div>
        `;
        textContent = `Your study session with ${data.partnerName} starts in 10 minutes! Don't be late.`;
        break;

      case "session_complete":
        subject = "✅ Session Complete - Earn Your Rewards!";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #333; text-align: center; margin-bottom: 30px;">
                ✅ Session Completed Successfully!
              </h1>
              <p>Great job ${data.userName || ""}!</p>
              <p>You've completed your study session with <strong>${
                data.partnerName
              }</strong>.</p>
              <div style="background-color: #fef9e7; padding: 20px; border-radius: 6px; margin: 25px 0; text-align: center;">
                <h2 style="color: #f39c12; margin: 0 0 15px 0;">🎉 You Earned:</h2>
                <div style="font-size: 32px; font-weight: bold; color: #27ae60;">
                  +${data.xpEarned || "60"} XP
                </div>
              </div>
              <div style="background-color: #e8f5e9; padding: 20px; border-radius: 6px; margin: 25px 0;">
                <p style="margin: 0; color: #2e7d32;">
                  🏆 <strong>What's Next?</strong><br>
                  Mint your Study Session NFT badge to permanently record this achievement on the blockchain!
                </p>
              </div>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${
                  data.mintUrl || "https://pair2pass.com/dashboard"
                }" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Mint Your NFT Badge
                </a>
              </p>
            </div>
          </div>
        `;
        textContent = `Session completed! You earned +${
          data.xpEarned || "60"
        } XP. Mint your Study Session NFT now!`;
        break;

      case "milestone_reached":
        subject = `🏆 Level ${data.level || "Up"} Achieved - You're on Fire!`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #333; text-align: center; margin-bottom: 30px;">
                🏆 Congratulations!
              </h1>
              <div style="text-align: center; margin: 30px 0;">
                <div style="font-size: 64px; margin-bottom: 20px;">🎉</div>
                <h2 style="color: #f39c12; margin: 0;">You've Reached Level ${
                  data.level || "10"
                }!</h2>
                <p style="font-size: 18px; color: #666; margin: 20px 0;">
                  Total XP: <strong style="color: #27ae60;">${
                    data.totalXP || "1000"
                  }</strong>
                </p>
              </div>
              <div style="background-color: #fef9e7; padding: 20px; border-radius: 6px; margin: 25px 0;">
                <p style="margin: 0; text-align: center; color: #856404;">
                  🔥 <strong>Keep building your study streaks!</strong><br>
                  You're in the top ${
                    data.topPercentage || "20"
                  }% of Pair2Pass students.
                </p>
              </div>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${
                  data.profileUrl || "https://pair2pass.com/profile"
                }" style="display: inline-block; background-color: #f39c12; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  View Your Profile
                </a>
              </p>
            </div>
          </div>
        `;
        textContent = `Congratulations! You've reached Level ${data.level}. Keep building your study streaks!`;
        break;

      case "badge_unlocked":
        subject = `⛓️ New Badge Unlocked: ${data.badgeName || "Achievement"}!`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #333; text-align: center; margin-bottom: 30px;">
                ⛓️ New Badge Unlocked!
              </h1>
              <div style="text-align: center; margin: 30px 0;">
                <div style="font-size: 64px; margin-bottom: 20px;">${
                  data.badgeEmoji || "🏅"
                }</div>
                <h2 style="color: #6f42c1; margin: 0;">${
                  data.badgeName || "Consistent Learner"
                }</h2>
                <p style="font-size: 16px; color: #666; margin: 20px 0;">
                  ${
                    data.badgeDescription ||
                    "This badge has been added to your profile."
                  }
                </p>
              </div>
              <div style="background-color: #e7e3f5; padding: 20px; border-radius: 6px; margin: 25px 0;">
                <p style="margin: 0; text-align: center; color: #4a148c;">
                  🎖️ <strong>NFT Badge Minted!</strong><br>
                  Your achievement is now permanently recorded on the blockchain.
                </p>
              </div>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${
                  data.profileUrl || "https://pair2pass.com/profile"
                }" style="display: inline-block; background-color: #6f42c1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  View Your Badges
                </a>
              </p>
            </div>
          </div>
        `;
        textContent = `New badge unlocked: ${data.badgeName}! Your achievement is now on the blockchain.`;
        break;

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
        "Api-Token": `${Deno.env.get("MAILTRAP_API_KEY")}`,
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

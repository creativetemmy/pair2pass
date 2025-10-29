import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const NotificationRequestSchema = z.object({
  email: z.string().email().max(255),
  type: z.enum([
    "welcome",
    "profile_complete",
    "match_found",
    "send_request",
    "confirmation_reminder",
    "session_reminder",
    "session_complete",
    "milestone_reached",
    "badge_unlocked",
    "session_created",
    "session_matched",
    "session_completed",
    "partner_feedback"
  ]),
  data: z.object({
    userName: z.string().max(255).optional(),
    partnerName: z.string().max(255).optional(),
    sessionSubject: z.string().max(255).optional(),
    subject: z.string().max(255).optional(),
    sessionTime: z.string().optional(),
    sessionGoal: z.string().max(500).optional(),
    goal: z.string().max(500).optional(),
    sessionId: z.string().uuid().optional(),
    meetingLink: z.string().url().optional(),
    rating: z.number().min(1).max(5).optional(),
    feedback: z.string().max(1000).optional(),
    blogUrl: z.string().url().optional(),
    findPartnerUrl: z.string().url().optional(),
    duration: z.union([z.string(), z.number()]).optional(),
    confirmUrl: z.string().url().optional(),
    minutesLeft: z.union([z.string(), z.number()]).optional(),
    remindUrl: z.string().url().optional(),
    findNewUrl: z.string().url().optional(),
    sessionUrl: z.string().url().optional(),
    xpEarned: z.union([z.string(), z.number()]).optional(),
    mintUrl: z.string().url().optional(),
    level: z.union([z.string(), z.number()]).optional(),
    totalXP: z.union([z.string(), z.number()]).optional(),
    topPercentage: z.union([z.string(), z.number()]).optional(),
    profileUrl: z.string().url().optional(),
    badgeName: z.string().max(100).optional(),
    badgeEmoji: z.string().max(10).optional(),
    badgeDescription: z.string().max(500).optional(),
    message: z.string().max(1000).optional(),
  }),
});

interface NotificationRequest {
  email: string;
  type:
    | "welcome"
    | "profile_complete"
    | "match_found"
    | "send_request"
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
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }
  
  try {
    const requestBody = await req.json();
    
    // Validate input
    const validation = NotificationRequestSchema.safeParse(requestBody);
    if (!validation.success) {
      console.error('❌ Validation error:', validation.error.issues);
      return new Response(
        JSON.stringify({ 
          error: "Invalid input", 
          details: validation.error.issues[0].message 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { email, type, data }: NotificationRequest = validation.data;

    console.log("📧 Sending notification email:", type, "to:", email);

    const mailtrapToken = Deno.env.get("MAILTRAP_API_KEY");
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
                <a href="${data.blogUrl || "https://pair2pass.com/blog"}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Read Our Getting Started Guide
                </a>
              </p>
              <p>Happy studying!</p>
            </div>
          </div>
        `;
        textContent = `Welcome to Pair2Pass! Your email has been verified. Complete your profile and find your first study partner to start earning XP!`;
        break;

      case "send_request":
        subject = "🎉 Connect Request Sent - Ready to Find Study Partners!";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #333; text-align: center; margin-bottom: 30px;">
                🎉 Connect Request!
              </h1>
              <p>Hi, ${data.userName || ""} </p>
               <p>${data.partnerName || ""} wants to connect!</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${data.findPartnerUrl || "https://pair2pass.com/find-partner"}" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Click to connect with partner
                </a>
              </p>
            </div>
          </div>
        `;
        textContent = `Hi ${data.userName}, ${data.partnerName} wants to connect!`;
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
                <a href="${data.findPartnerUrl || "https://pair2pass.com/find-partner"}" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Find a Study Partner Now
                </a>
              </p>
            </div>
          </div>
        `;
        textContent = `Congratulations! Your profile is complete. Start finding study partners now!`;
        break;

      case "match_found":
        subject = `🤝 Study Partner Found - ${data.partnerName} for ${data.subject || data.sessionSubject}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #333; text-align: center; margin-bottom: 30px;">
                🤝 You've Been Matched!
              </h1>
              <p>Great news!</p>
              <p>You've been matched with <strong>${data.partnerName}</strong> for <strong>${data.subject || data.sessionSubject}</strong>.</p>
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 6px; margin: 25px 0;">
                <h3 style="color: #856404; margin-top: 0;">Session Details:</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li><strong>Subject:</strong> ${data.subject || data.sessionSubject}</li>
                  <li><strong>Goal:</strong> ${data.goal || data.sessionGoal || "Not specified"}</li>
                  <li><strong>Duration:</strong> ${data.duration} minutes</li>
                </ul>
              </div>
              <p style="background-color: #f8d7da; padding: 15px; border-radius: 6px; color: #721c24; border-left: 4px solid #f5c6cb;">
                ⏰ <strong>Action Required:</strong> Please confirm your study session within the next 30 minutes to avoid auto-cancellation.
              </p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${data.confirmUrl || "https://pair2pass.com/dashboard"}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Confirm Study Session
                </a>
              </p>
            </div>
          </div>
        `;
        textContent = `You've been matched with ${data.partnerName} for ${data.subject || data.sessionSubject}. Confirm your session now!`;
        break;

      // Additional notification types can be added here

      default:
        subject = "Pair2Pass Notification";
        htmlContent = `<p>${data.message || "You have a new notification from Pair2Pass."}</p>`;
        textContent = data.message || "You have a new notification from Pair2Pass.";
    }

    const emailResponse = await fetch("https://send.api.mailtrap.io/api/send", {
      method: "POST",
      headers: {
        "Api-Token": mailtrapToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: {
          email: "noreply@pair2pass.com",
          name: "Pair2Pass",
        },
        to: [{
          email,
        }],
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
      JSON.stringify({ success: true, message: "Notification sent" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("❌ Unexpected error:", error);
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

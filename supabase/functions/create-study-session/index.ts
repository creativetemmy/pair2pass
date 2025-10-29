import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const CreateSessionSchema = z.object({
  matchRequestId: z.string().uuid(),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
});

interface CreateSessionRequest {
  matchRequestId: string;
  walletAddress?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const requestBody = await req.json();
    
    // Validate input
    const validation = CreateSessionSchema.safeParse(requestBody);
    if (!validation.success) {
      console.error('❌ Validation error:', validation.error.issues);
      throw new Error(`Invalid input: ${validation.error.issues[0].message}`);
    }

    const { matchRequestId, walletAddress } = validation.data as CreateSessionRequest;

    console.log("Creating session for match request:", matchRequestId);
    console.log("Requesting user:", walletAddress);

    // Fetch and validate match request
    const { data: matchRequest, error: fetchError } = await supabase
      .from("match_requests")
      .select("*")
      .eq("id", matchRequestId)
      .single();

    if (fetchError || !matchRequest) {
      throw new Error("Match request not found");
    }

    console.log("Match request found:", matchRequest);

    // Validate request is pending and not expired
    if (matchRequest.status !== "pending") {
      throw new Error(`Match request is ${matchRequest.status}`);
    }

    if (new Date(matchRequest.expires_at) <= new Date()) {
      // Update to expired
      await supabase
        .from("match_requests")
        .update({ status: "expired" })
        .eq("id", matchRequestId);
      throw new Error("Match request has expired");
    }

    // Validate user is the target
    if (matchRequest.target_wallet?.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error("You are not the target of this request");
    }

    // Check if both users are verified and ready
    const { data: requesterProfile } = await supabase
      .from("profiles")
      .select("is_email_verified, name, email")
      .eq("wallet_address", matchRequest.requester_wallet?.toLowerCase())
      .single();

    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("is_email_verified, name, email")
      .eq("wallet_address", matchRequest.target_wallet?.toLowerCase())
      .single();

    if (!requesterProfile?.is_email_verified || !requesterProfile.name || !requesterProfile.email) {
      throw new Error("Requester profile is incomplete or email not verified");
    }

    if (!targetProfile?.is_email_verified || !targetProfile.name || !targetProfile.email) {
      throw new Error("Your profile is incomplete or email not verified");
    }

    console.log("Both users verified");

    // Check for active sessions
    const { data: requesterSessions } = await supabase
      .from("study_sessions")
      .select("id")
      .or(`partner_1_id.eq.${matchRequest.requester_wallet?.toLowerCase()},partner_2_id.eq.${matchRequest.requester_wallet?.toLowerCase()}`)
      .in("status", ["waiting", "active", "ongoing"])
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const { data: targetSessions } = await supabase
      .from("study_sessions")
      .select("id")
      .or(`partner_1_id.eq.${matchRequest.target_wallet?.toLowerCase()},partner_2_id.eq.${matchRequest.target_wallet?.toLowerCase()}`)
      .in("status", ["waiting", "active", "ongoing"])
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (requesterSessions && requesterSessions.length > 0) {
      throw new Error("Requester already has an active session");
    }

    if (targetSessions && targetSessions.length > 0) {
      throw new Error("You already have an active session");
    }

    console.log("No active sessions found");

    // Update match request to accepted
    const { error: updateError } = await supabase
      .from("match_requests")
      .update({ status: "accepted" })
      .eq("id", matchRequestId)
      .eq("status", "pending"); // Optimistic locking

    if (updateError) {
      console.error("Error updating match request:", updateError);
      throw new Error("Failed to accept request - it may have already been processed");
    }

    console.log("Match request updated to accepted");

    // Create study session
    const { data: session, error: sessionError } = await supabase
      .from("study_sessions")
      .insert({
        partner_1_id: matchRequest.requester_wallet?.toLowerCase(),
        partner_2_id: matchRequest.target_wallet?.toLowerCase(),
        subject: matchRequest.subject,
        goal: matchRequest.goal,
        duration: matchRequest.duration,
        status: "waiting",
        match_request_id: matchRequestId,
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Error creating session:", sessionError);
      // Rollback match request
      await supabase
        .from("match_requests")
        .update({ status: "pending" })
        .eq("id", matchRequestId);
      throw new Error("Failed to create session");
    }

    console.log("Session created:", session.id);

    // Create notifications for both users
    await supabase.from("notifications").insert([
      {
        user_wallet: matchRequest.requester_wallet?.toLowerCase(),
        type: "match_found",
        title: "🎉 Match Accepted!",
        message: `Your study partner request for ${matchRequest.subject} was accepted!`,
        data: { sessionId: session.id, subject: matchRequest.subject, goal: matchRequest.goal },
      },
      {
        user_wallet: matchRequest.target_wallet?.toLowerCase(),
        type: "match_found",
        title: "🎉 Match Accepted!",
        message: `You accepted a study request for ${matchRequest.subject}!`,
        data: { sessionId: session.id, subject: matchRequest.subject, goal: matchRequest.goal },
      },
    ]);

    // Send emails
    if (requesterProfile.email) {
      await supabase.functions
        .invoke("send-notification-email", {
          body: {
            type: "match_found",
            email: requesterProfile.email,
            data: {
              userName: requesterProfile.name,
              partnerName: targetProfile?.name || "Student",
              subject: matchRequest.subject,
              sessionId: session.id,
            },
          },
        })
        .catch((err) => console.log("Email send failed:", err));
    }

    if (targetProfile.email) {
      await supabase.functions
        .invoke("send-notification-email", {
          body: {
            type: "match_found",
            email: targetProfile.email,
            data: {
              userName: targetProfile.name,
              partnerName: requesterProfile?.name || "Student",
              subject: matchRequest.subject,
              sessionId: session.id,
            },
          },
        })
        .catch((err) => console.log("Email send failed:", err));
    }

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: session.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in create-study-session:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
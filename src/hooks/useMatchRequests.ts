import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "wagmi";

export interface MatchRequest {
  id: string;
  requester_wallet: string;
  target_wallet: string;
  subject: string;
  goal: string;
  duration: number;
  status: string;
  expires_at: string;
  created_at: string;
  requester_profile?: {
    name: string;
    avatar_url: string;
    average_rating: number;
    sessions_completed: number;
    institution: string;
  };
}

export function useMatchRequests() {
  const { address } = useAccount();
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!address) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const normalizedAddress = address.toLowerCase();

    try {
      const { data: matchRequests, error } = await supabase
        .from("match_requests")
        .select("*")
        .eq("target_wallet", normalizedAddress)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each requester
      const requestsWithProfiles = await Promise.all(
        (matchRequests || []).map(async (request) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, avatar_url, average_rating, sessions_completed, institution")
            .eq("wallet_address", request.requester_wallet?.toLowerCase())
            .single();

          return {
            ...request,
            requester_profile: profile || undefined,
          };
        })
      );

      setRequests(requestsWithProfiles);
    } catch (error) {
      console.error("Error fetching match requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    if (!address) return;

    // Set up realtime subscription for new match requests
    const normalizedAddress = address.toLowerCase();
    const channel = supabase
      .channel("match-requests-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_requests",
          filter: `target_wallet=eq.${normalizedAddress}`,
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [address]);

  return { requests, loading, refetch: fetchRequests };
}

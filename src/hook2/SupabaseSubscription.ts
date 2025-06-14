import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";

interface SupabaseEvent {
    eventType: string;
    schema: string;
    table: string;
    new: any; // New row data
    old: any; // Old row data 
}

interface UseSupabaseSubscriptionProps {
    table: string; // Table name to subscribe to
    schema?: string; // Schema name (default is public)
    eventTypes?: string[]; // Event types to listen for (default is all: "*")
}

export function useSupabaseSubscription({
    table,
    schema= "public",
    eventTypes= ["*"], // Default to all events 
}: UseSupabaseSubscriptionProps) {
    const [events, setEvents] = useState<SupabaseEvent[]>([]); // Events from realtime subscription 
    const [connectionStatus, setConnectionStatus] = useState<string>("DISCONNECTED"); // Connection status 
    const [error, setError] = useState<Error | null>(null); // Error state 
    const channelRef = useRef<any>(null); // Channel reference 

    useEffect(() => {
        const setupSubscription = () => {
            if (!channelRef.current) {
                channelRef.current = supabase 
                    .channel(`${table}_subscription`)
                        .on(
                            "system",
                            { event: eventTypes.join(","), schema, table },
                            (payload: SupabaseEvent) => {
                              console.log("Realtime event received:", payload);
                              setEvents((prevEvents) => [...prevEvents, payload]);
                            }
                          )
                    .subscribe((status, err) => {
                        if (err) {
                            console.log(`Realtime subscription status: ${status}`);
                            setConnectionStatus(status);
                            if (status === "CHANNEL_ERROR") {
                                const errorMessage = err?.message || "Unknown channel error";
                                console.error("Channel error:", err);
                                setError(new Error(errorMessage));
                            } else if (status === "TIMED_OUT") {
                                console.error("Connection timed out. Retrying...");
                                if (channelRef.current) {
                                    supabase.removeChannel(channelRef.current);
                                    channelRef.current = null;
                                    setTimeout(setupSubscription, 5000);
                                }
                            } else if (status === "CLOSED") {
                                console.log("Channel closed");
                                setConnectionStatus("DISCONNECTED");
                            }
                        }
                    });
            }
        };

        setupSubscription();

        return () => {
            if (channelRef.current) {
                console.log("Cleaning up subscription");
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [table, schema, eventTypes]);

    return { events, connectionStatus, error };
}
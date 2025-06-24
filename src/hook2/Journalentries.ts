import { useCallback, useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import { logger } from '../services/logger';

// Define types for journal entry payload
interface JournalEntryPayload {
  p_user_id?: string;
  p_symbol?: string; // Ensure this matches the expected type in Supabase
  p_trade_type?: string; // Ensure this matches the expected type in Supabase
  p_order_type?: string; //
  p_entry_price?: number | null;
  p_exit_price?: number | null;
  p_stop_loss?: number | null;
  p_commissions?: number | null;
  p_number_shares?: number | null;
  p_take_profit?: number | null;
  p_market_conditions?: string | null;
  p_entry_tactics?: string | null;
  p_edges?: string | null;
  p_entry_date?: string | null;
  p_exit_date?: string | null;
}

interface JournalEntry {
  id: string;
  symbol: string;
  trade_type: string;
  order_type: string;
  entry_price: number;
  exit_price: number;
  stop_loss: number;
  commissions: number;
  number_shares: number;
  take_profit: number;
  market_conditions: string;
  entry_tactics: string;
  edges: string;
  entry_date: string;
  exit_date: string;
}

export function useJournalEntries() {
  const [events, setEvents] = useState<any[]>([]); // Events from realtime subscription
  const [connectionStatus, setConnectionStatus] = useState<string>("DISCONNECTED");
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<any>(null);

  // Insert journal entry
  const insertJournalEntry = useCallback(async (entryData: JournalEntryPayload) => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      logger.error("Failed to get session", sessionError, { hook: 'useJournalEntries' });
      throw sessionError;
    }
    const userId = sessionData?.session?.user?.id;

    const p_payload: JournalEntryPayload = {
        p_user_id: entryData.p_user_id || userId,
        p_symbol: entryData.p_symbol || undefined, // Ensure this matches the expected type
        p_trade_type: entryData.p_trade_type || undefined, // Ensure this matches the expected type
        p_order_type: entryData.p_order_type || undefined, // Ensure
        p_entry_price: entryData.p_entry_price ?? null,
        p_exit_price: entryData.p_exit_price ?? null,
        p_stop_loss: entryData.p_stop_loss ?? null,
        p_commissions: entryData.p_commissions ?? null,
        p_number_shares: entryData.p_number_shares ?? null,
        p_take_profit: entryData.p_take_profit ?? null,
        p_market_conditions: entryData.p_market_conditions || null,
        p_entry_tactics: entryData.p_entry_tactics || null,
        p_edges: entryData.p_edges || null,
        p_entry_date: entryData.p_entry_date || null,
        p_exit_date: entryData.p_exit_date || null,
    };

    logger.debug("Payload", { p_payload, hook: 'useJournalEntries' });
    const { data, error } = await supabase.rpc("insert_entry", { p_payload });
    if (error) {
      logger.error("Insert failed", error, { hook: 'useJournalEntries' });
      throw new Error(`Insert failed: ${error.message}`);
    }
    logger.info("Insert successful", { data, hook: 'useJournalEntries' });
    return data;
  }, []);

  // Update journal entry
  const updateJournalEntry = useCallback(async (entryData: JournalEntryPayload & { p_entry_id: string }) => {
    const p_entry_id = entryData.p_entry_id;
    const p_payload: JournalEntryPayload = {
        p_symbol: entryData.p_symbol || undefined, // Ensure this matches the expected type
        p_trade_type: entryData.p_trade_type || undefined, // Ensure this matches the expected type
        p_order_type: entryData.p_order_type || undefined, // Ensure
        p_entry_price: entryData.p_entry_price ?? null,
        p_exit_price: entryData.p_exit_price ?? null,
        p_stop_loss: entryData.p_stop_loss ?? null,
        p_commissions: entryData.p_commissions ?? null,
        p_number_shares: entryData.p_number_shares ?? null,
        p_take_profit: entryData.p_take_profit ?? null,
        p_market_conditions: entryData.p_market_conditions || null,
        p_entry_tactics: entryData.p_entry_tactics || null,
        p_edges: entryData.p_edges || null,
        p_entry_date: entryData.p_entry_date || null,
        p_exit_date: entryData.p_exit_date || null,
    };

    logger.debug("Payload", { p_payload, hook: 'useJournalEntries' });
    const { data, error } = await supabase.rpc("update_entry", { p_entry_id, p_payload });
    if (error) {
      logger.error("Update failed", error, { hook: 'useJournalEntries' });
      throw error;
    }
    logger.info("Update successful", { data, hook: 'useJournalEntries' });
    return data;
  }, []);

  // Delete journal entry
  const deleteJournalEntry = useCallback(async (entryId: string, columnName: string | null = null) => {
    if (!entryId) {
      throw new Error("Entry ID is required for deletion.");
    }

    const { data, error } = await supabase.rpc("delete_entry", {
      p_entry_id: entryId,
      p_column_name: columnName,
    });

    if (error) {
      logger.error("Delete failed", error, { hook: 'useJournalEntries' });
      throw error;
    }
    logger.info("Delete successful", { data, hook: 'useJournalEntries' });
    return data;
  }, []);

  // Select journal entry
  const selectJournalEntry = useCallback(async () => {
    try {
      logger.info("Fetching entries for the authenticated user", { hook: 'useJournalEntries' });
      const { data, error } = await supabase.rpc("select_entry");
      if (error) {
        logger.error("Select failed", error, { hook: 'useJournalEntries' });
        throw error;
      }
      logger.info("Select successful", { data, hook: 'useJournalEntries' });
      return data;
    } catch (err) {
      logger.error("Error selecting journal entry", err, { hook: 'useJournalEntries' });
      throw err;
    }
  }, []);

  let retryCount = 0;

  // Setup Supabase subscription for realtime updates
  useEffect(() => {
    const setupSubscription = () => {
      if (!channelRef.current) {
        channelRef.current = supabase
          .channel("journal_entries_subscription")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "journal_entries" },
            (payload) => {
              logger.info("Realtime event received", { payload, hook: 'useJournalEntries' });
              setEvents((prevEvents) => [...prevEvents, payload]);
            }
          )
          .subscribe((status, err) => {
            logger.info(`Realtime subscription status: ${status}`, { status, hook: 'useJournalEntries' });
            setConnectionStatus(status);
            if (status === "CHANNEL_ERROR") {
              const errorMessage = err?.message || "Unknown channel error";
              logger.error("Channel error", err, { hook: 'useJournalEntries' });
              setError(new Error(errorMessage));
            } else if (status === "TIMED_OUT") {
              logger.error("Connection timed out. Retrying...", { hook: 'useJournalEntries' });
              if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
                const retryDelay = Math.min(1000 * 2 ** retryCount, 30000);
                setTimeout(setupSubscription, retryDelay);
              }
            } else if (status === "CLOSED") {
                logger.info("Channel closed", { hook: 'useJournalEntries' });
              setConnectionStatus("DISCONNECTED");
            }
          });
      }
    };
    setupSubscription();

    return () => {
      if (channelRef.current) {
        logger.info("Cleaning up subscription", { hook: 'useJournalEntries' });
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  return {
    connectionStatus,
    error,
    events,
    deleteJournalEntry,
    insertJournalEntry,
    updateJournalEntry,
    selectJournalEntry,
  };
}
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useSupabaseSubscription } from "./SupabaseSubscription";

interface OptionPayload {
    id?: string;
    user_id?: string; // User ID for the option
    symbol: string;
    strategy: string;
    option_type: string;
    strike_price: number;
    expiration_date: string;
    entry_price: number;
    number_contracts: number;
    exit_price?: number | null; // Nullable for open positions 
    commissions: number;
    order_type: string;
    implied_volatility: number; 
    entry_date: string;
    exit_date?: string; // Nullable for open positions 
}

export function useJournalOptions() {
    const [options, setOptions] = useState<OptionPayload[]>([]);
    const { events, connectionStatus, error } = useSupabaseSubscription({
        table: "option_table",
    });

    // Insert option 
    const insertOption = useCallback(async (optionData: OptionPayload) => {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
            console.error("Failed to get session:", sessionError);
            throw sessionError;
        }
        const userId = sessionData?.session?.user?.id;
    
        const p_payload: OptionPayload = {
            user_id: optionData.user_id || userId,
            symbol: optionData.symbol.trim(),
            strategy: optionData.strategy.trim(),
            option_type: optionData.option_type.trim(),
            strike_price: optionData.strike_price,
            expiration_date: optionData.expiration_date,
            entry_price: optionData.entry_price,
            number_contracts: optionData.number_contracts,
            exit_price: optionData.exit_price || null,
            commissions: optionData.commissions,
            order_type: optionData.order_type.trim(),
            implied_volatility: optionData.implied_volatility,
            entry_date: optionData.entry_date,
            exit_date: optionData.exit_date || undefined,
        };
    
        console.log("Payload being sent to insert_option:", p_payload); // Debugging
    
        try {
            const { data, error } = await supabase.rpc("insert_option", { p_payload });
            if (error) {
                console.error("Insert failed:", error);
                throw new Error(`Insert failed: ${error.message}`);
            }
            console.log("Insert successful:", data);
            return data;
        } catch (err) {
            console.error("Error inserting option:", err);
            throw err;
        }
    }, []);

    // Update option 
    const updateOption = useCallback(
        async (optionData: OptionPayload & { id: string }) => {
            const p_payload: OptionPayload = {
                user_id: optionData.user_id,
                symbol: optionData.symbol.trim(),
                strategy: optionData.strategy.trim(),
                option_type: optionData.option_type.trim(),
                strike_price: optionData.strike_price,
                expiration_date: optionData.expiration_date,
                entry_price: optionData.entry_price,
                number_contracts: optionData.number_contracts,
                exit_price: optionData.exit_price || null,
                commissions: optionData.commissions,
                order_type: optionData.order_type.trim(),
                implied_volatility: optionData.implied_volatility,
                entry_date: optionData.entry_date,
                exit_date: optionData.exit_date || undefined,
            };

            console.log("Payload:", p_payload); // Debugging: Log payload
            try {
                const { data, error } = await supabase.rpc("update_option", {
                    p_option_id: optionData.id,
                    p_payload,
                });
                if (error) {
                    console.error("Update failed:", error);
                    throw error;
                }
                console.log("Update successful:", data);
                return data;
            } catch (err) {
                console.error("Error updating option:", err);
                throw err;
            }
        },
        []
    );

    // Delete option
    const deleteOption = useCallback(async (optionId: string) => {
        if (!optionId) {
            throw new Error("Option ID is required for deletion.");
        }

        try {
            const { data, error } = await supabase.rpc("delete_option", {
                p_entry_id: optionId,
            });
            if (error) {
                console.error("Delete failed:", error);
                throw error;
            }
            console.log("Delete successful:", data);
            return data;
        } catch (err) {
            console.error("Error deleting option:", err);
            throw err;
        }
    }, []);

      // Select options
      const selectOptions = useCallback(async () => {
        try {
            console.log("Fetching options for the authenticated user...");
            const { data, error } = await supabase.rpc("select_option");
            if (error) {
                console.error("Select failed:", error);
                throw error;
            }
            console.log("Select successful:", data);
            setOptions(data || []);
            return data;
        } catch (err) {
            console.error("Error selecting options:", err);
            throw err;
        }
      }, []);

      // Update state based on real-time events 
      useEffect(() => {
        if (events.length > 0) {
            console.log("Realtime events received:", events);
            selectOptions(); // Refresh options data 
        }
      }, [events, selectOptions])

    return {
        options,
        connectionStatus,
        error,
        insertOption, 
        updateOption,
        deleteOption,
        selectOptions,
    };
}
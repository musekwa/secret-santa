import { useEffect, useState } from "react";
import type { User } from "../types/auth.types";
import { supabase } from "@/lib/supabase/client";

const PARTICIPANT_STORAGE_KEY = "secret_santa_participant";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedId = localStorage.getItem(PARTICIPANT_STORAGE_KEY);

        if (!storedId) {
          setUser(null);
          return;
        }

        // Fetch user from database using the stored ID
        const { data: participant, error } = await supabase
          .from("participants")
          .select("*")
          .eq("id", storedId)
          .single();

        if (error || !participant) {
          console.error("Error fetching user from database:", error);
          // If user not found, clear the invalid ID from storage
          localStorage.removeItem(PARTICIPANT_STORAGE_KEY);
          setUser(null);
          return;
        }

        // Map database participant to User type
        setUser({
          id: participant.id,
          name: participant.name,
          email: participant.email,
          is_verified: participant.is_verified ?? false,
          amount:
            parseFloat(
              participant.amount.replace(/\./g, "").replace(",", ".")
            ) || 0,
          code: participant.code || "",
          is_admin: participant.is_admin ?? false,
        });
      } catch (error) {
        console.error("Error loading user:", error);
        setUser(null);
      }
    };

    fetchUser();

    // Listen for storage changes (e.g., from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PARTICIPANT_STORAGE_KEY) {
        fetchUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return user;
}

// Helper function to set user ID in storage
export function setUserInStorage(userId: string) {
  try {
    localStorage.setItem(PARTICIPANT_STORAGE_KEY, userId);
    // Trigger storage event to update other tabs
    window.dispatchEvent(new Event("storage"));
  } catch (error) {
    console.error("Error saving user ID to storage:", error);
  }
}

// Helper function to clear user from storage
export function clearUserFromStorage() {
  try {
    localStorage.removeItem(PARTICIPANT_STORAGE_KEY);
    // Trigger storage event to update other tabs
    window.dispatchEvent(new Event("storage"));
  } catch (error) {
    console.error("Error clearing user from storage:", error);
  }
}

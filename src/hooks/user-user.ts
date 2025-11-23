import { useEffect, useState } from "react";
import type { User } from "../types/auth.types";

const PARTICIPANT_STORAGE_KEY = "secret_santa_participant";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user from localStorage on mount
    const loadUser = () => {
      try {
        const stored = localStorage.getItem(PARTICIPANT_STORAGE_KEY);
        if (stored) {
          const participant = JSON.parse(stored);
          setUser({
            id: participant.id,
            name: participant.name,
            email: participant.email,
            is_verified: participant.is_verified ?? false,
            amount: parseFloat(participant.amount) || 0,
            code: participant.code || "",
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error loading user from storage:", error);
        setUser(null);
      }
    };

    loadUser();

    // Listen for storage changes (e.g., from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PARTICIPANT_STORAGE_KEY) {
        loadUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return user;
}

// Helper function to set user in storage
export function setUserInStorage(participant: User) {
  try {
    localStorage.setItem(PARTICIPANT_STORAGE_KEY, JSON.stringify(participant));
  } catch (error) {
    console.error("Error saving user to storage:", error);
  }
}

// Helper function to clear user from storage
export function clearUserFromStorage() {
  try {
    localStorage.removeItem(PARTICIPANT_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing user from storage:", error);
  }
}

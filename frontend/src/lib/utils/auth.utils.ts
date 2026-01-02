import { redirect } from "@tanstack/react-router";
import AuthApi from "@/lib/api/auth.api";
import type { User } from "@/types/auth.types";

type AuthCheckResult = {
  success: boolean;
  user: User | null;
  message?: string;
};

/**
 * Checks if the user is authenticated by calling the findMe API
 * This function can be used in beforeLoad hooks
 *
 * @param options - Configuration options
 * @param options.redirectTo - If provided and authentication fails, redirects to this route
 * @returns Promise with authentication result
 */
export async function checkAuthentication(options?: {
  redirectTo?: string;
}): Promise<AuthCheckResult> {
  try {
    const result = await AuthApi.findMe();

    // AuthApi.findMe returns either:
    // - User data directly if successful
    // - { success: false, data: null, message: string } if failed

    if (result && typeof result === "object" && "success" in result) {
      // Failed authentication
      if (!result.success) {
        if (options?.redirectTo) {
          throw redirect({
            to: options.redirectTo,
            replace: true,
          });
        }
        return {
          success: false,
          user: null,
          message: result.message || "Authentication failed",
        };
      }
    }

    // Successful authentication - result is the user data
    return {
      success: true,
      user: result as User,
    };
  } catch (error: any) {
    // Handle redirect errors (they should be thrown, not caught)
    if (error?.to) {
      throw error;
    }

    // Handle other errors
    if (options?.redirectTo) {
      throw redirect({
        to: options.redirectTo,
        replace: true,
      });
    }

    return {
      success: false,
      user: null,
      message: error?.message || "Authentication check failed",
    };
  }
}

/**
 * Requires authentication - throws redirect if not authenticated
 * Use this in beforeLoad when you want to automatically redirect unauthenticated users
 *
 * @param redirectTo - Route to redirect to if not authenticated (default: "/login")
 * @returns Promise with authenticated user data
 */
export async function requireAuth(
  redirectTo: string = "/login"
): Promise<User> {
  const result = await checkAuthentication({ redirectTo });

  if (!result.success || !result.user) {
    throw redirect({
      to: redirectTo,
      replace: true,
    });
  }

  return result.user;
}

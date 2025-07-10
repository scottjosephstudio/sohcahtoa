"use client";

import { createClient } from "@supabase/supabase-js";

// Make sure these match exactly with your .env.local values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create client with proper auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Test function that you can call elsewhere to verify connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("subscribers")
      .select("count")
      .limit(1);

    if (error) {
      console.error("Supabase connection test failed with error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase connection test failed with exception:", err);
    return false;
  }
};

// Utility function to safely insert a subscriber
export const addSubscriber = async (email) => {
  // Save to localStorage first as a reliable backup
  try {
    const savedEmails = JSON.parse(
      localStorage.getItem("newsletter_emails") || "[]",
    );
    savedEmails.push({
      email: email,
      date: new Date().toISOString(),
      savedToSupabase: false, // Will update this if Supabase succeeds
    });
    localStorage.setItem("newsletter_emails", JSON.stringify(savedEmails));
  } catch (localStorageError) {
    console.warn("Could not save to localStorage:", localStorageError);
  }

  try {
    // Try to save to Supabase
    const { data, error } = await supabase
      .from("subscribers")
      .insert([{ emails_of_subscribers: email.trim().toLowerCase() }]);

    if (error) {
      // Log detailed error information
      console.error("Supabase error details:", {
        code: error.code || "NO_CODE",
        message: error.message || "No message",
        details: error.details || "No details",
        hint: error.hint || "No hint",
        fullError: JSON.stringify(error),
      });

      // Check for empty error object
      if (Object.keys(error).length === 0) {
        return {
          success: true, // Still count as success since we saved to localStorage
          source: "localStorage",
          message: "Connection issue, but email saved locally.",
        };
      }

      // Check for duplicate email error
      if (error.code === "23505") {
        return {
          success: true,
          source: "existingSubscription",
          message: "You're already subscribed!",
        };
      }

      // Other specific error types
      if (error.code === "42P01") {
        return {
          success: false,
          source: "error",
          message:
            "Database configuration issue. We've saved your email locally.",
        };
      }

      if (error.code === "42501") {
        return {
          success: false,
          source: "error",
          message: "Permission issue. We've saved your email locally.",
        };
      }

      // Generic error
      return {
        success: false,
        source: "error",
        message:
          error.message ||
          "Issue connecting to database. We've saved your email locally.",
      };
    }

    // Success! Update localStorage to mark as saved to Supabase
    try {
      const savedEmails = JSON.parse(
        localStorage.getItem("newsletter_emails") || "[]",
      );
      const updatedEmails = savedEmails.map((item) => {
        if (item.email === email) {
          return { ...item, savedToSupabase: true };
        }
        return item;
      });
      localStorage.setItem("newsletter_emails", JSON.stringify(updatedEmails));
    } catch (e) {
      console.warn("Error updating localStorage:", e);
    }

    return {
      success: true,
      source: "supabase",
      message: "Thank you for subscribing!",
    };
  } catch (err) {
    console.error("Unexpected error in addSubscriber:", err);
    return {
      success: false,
      source: "error",
      message: "Unexpected error. We've saved your email locally.",
    };
  }
};

// Helper to generate a session ID
export const generateSessionId = () => {
  return (
    "session_" + Math.random().toString(36).substring(2, 15) + "_" + Date.now()
  );
};

// Helper to get browser info
export const getBrowserInfo = () => {
  if (typeof window === "undefined") return "";
  return navigator.userAgent || "";
};

// Helper to get client IP (placeholder - you'd need a service for this)
export const getClientIP = async () => {
  try {
    // You can use a service like ipapi.co or similar
    // For now, we'll just return null
    return null;
  } catch {
    return null;
  }
};

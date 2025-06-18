//cookieOptions

// cookieOptions.ts
// cookieOptions.ts
 export const accessTokenOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // ✅ required for HTTPS
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // ✅ none is required for cross-site cookies
  maxAge: 15 * 60 * 1000, // 15 minutes
};

export  const refreshTokenOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
};

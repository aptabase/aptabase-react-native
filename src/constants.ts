// Session expires after 1 hour of inactivity
export const SESSION_TIMEOUT = 60 * 60 * 1000;

// Flush events every 60 seconds in production, or 2 seconds in development
export const FLUSH_INTERVAL = __DEV__ ? 2000 : 60000;

// SDK platform name sent on error reports (deliberately distinct from osName)
export const ERROR_PLATFORM = "React Native";

// Max number of unsent error reports kept in memory; new reports are dropped
// when full, so the first occurrences (closest to the root cause) are kept
export const MAX_ERROR_QUEUE_SIZE = 25;

// List of hosts for each region
// To use a self-hosted (SH) deployment, the host must be set during init
export const HOSTS: { [region: string]: string } = {
  US: "https://us.aptabase.com",
  EU: "https://eu.aptabase.com",
  DEV: "https://localhost:3000",
  SH: "",
};

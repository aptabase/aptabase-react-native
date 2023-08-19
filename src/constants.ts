// Session expires after 1 hour of inactivity
export const SESSION_TIMEOUT = 60 * 60 * 1000;

// Flush events every 60 seconds in production, or 2 seconds in development
export const FLUSH_INTERVAL = __DEV__ ? 2000 : 60000;

// List of hosts for each region
// To use a self-hosted (SH) deployment, the host must be set during init
export const HOSTS: { [region: string]: string } = {
  US: "https://us.aptabase.com",
  EU: "https://eu.aptabase.com",
  DEV: "http://localhost:3000",
  SH: "",
};

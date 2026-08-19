const configuredApiUrl = String(import.meta.env.VITE_API_URL || "").trim();

if (!configuredApiUrl && import.meta.env.PROD) {
	throw new Error(
		"VITE_API_URL is required in the production frontend environment. Set it to the deployed TripVault API URL."
	);
}

export const API_BASE_URL = configuredApiUrl || "http://localhost:5000";

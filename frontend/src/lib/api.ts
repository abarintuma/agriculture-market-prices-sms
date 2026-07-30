const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// TypeScript Interfaces matching our FastAPI Pydantic Schemas
export interface Crop {
  id: number;
  name: string;
  unit: string;
  created_at: string;
}

export interface CropPrice {
  id: number;
  crop_id: number;
  price_ugx: number;
  market_location: string;
  price_source: "AUTOMATIC_API" | "MANUAL_OVERRIDE";
  date_recorded: string;
}

export interface Farmer {
  id: number;
  full_name: string;
  phone_number: string;
  district: string;
  is_active: boolean;
  registered_at: string;
}

export interface SMSBroadcastResponse {
  total_recipients: number;
  successful_sends: number;
  failed_sends: number;
  message_preview: string;
}

// Helper fetch wrapper
async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API error: ${response.statusText}`);
  }

  return response.json();
}

// API Service Methods
export const api = {
  // Crops
  getCrops: () => fetcher<Crop[]>("/crops/"),
  createCrop: (name: string, unit: string) =>
    fetcher<Crop>("/crops/", {
      method: "POST",
      body: JSON.stringify({ name, unit }),
    }),

  // Prices
  getLatestPrices: () => fetcher<CropPrice[]>("/prices/latest"),
  recordPrice: (
    crop_id: number,
    price_ugx: number,
    market_location = "Kampala",
  ) =>
    fetcher<CropPrice>("/prices/", {
      method: "POST",
      body: JSON.stringify({ crop_id, price_ugx, market_location }),
    }),

  // Farmers
  getFarmers: () => fetcher<Farmer[]>("/farmers/"),
  registerFarmer: (
    full_name: string,
    phone_number: string,
    district = "Kampala",
  ) =>
    fetcher<Farmer>("/farmers/", {
      method: "POST",
      body: JSON.stringify({ full_name, phone_number, district }),
    }),

  // SMS Broadcasts
  triggerBroadcast: (district_filter?: string, custom_note?: string) =>
    fetcher<SMSBroadcastResponse>("/sms/broadcast", {
      method: "POST",
      body: JSON.stringify({ district_filter, custom_note }),
    }),
};

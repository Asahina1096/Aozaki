import React from "react";
import type { StatsResponse } from "./types/serverstatus";

interface APIClient {
  getStats: (signal?: AbortSignal) => Promise<StatsResponse>;
}

export function getAPIClient(): APIClient {
  return {
    async getStats(signal?: AbortSignal): Promise<StatsResponse> {
      const response = await fetch("/json/stats.json", { signal });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return (await response.json()) as StatsResponse;
    },
  };
}

export interface SettingsResponse {
  sitename: string;
  description: string;
  allow_cors: boolean;
  geo_ip_enabled: boolean;
  geo_ip_provider: string;
  o_auth_provider: string;
  o_auth_enabled: boolean;
  custom_head: string;
  CreatedAt: string;
  UpdatedAt: string;
  [key: string]: unknown;
}

export async function getSettings(): Promise<SettingsResponse> {
  try {
    const response = await fetch("/api/admin/settings");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const { CreatedAt, UpdatedAt, id, ...settings } = data["data"];

    return settings as SettingsResponse;
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    throw error;
  }
}

export async function updateSettings(
  settings: Partial<SettingsResponse>
): Promise<void> {
  try {
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(`${errorData["message"]}`);
      } catch {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }
  } catch (error) {
    console.error("Failed to update settings:", error);
    throw error;
  }
}

export function useSettings() {
  const [settings, setSettings] = React.useState<SettingsResponse>({
    sitename: "",
    description: "",
    allow_cors: false,
    geo_ip_enabled: false,
    geo_ip_provider: "",
    o_auth_provider: "",
    o_auth_enabled: false,
    custom_head: "",
    CreatedAt: "",
    UpdatedAt: "",
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch settings"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSetting = async <K extends keyof SettingsResponse>(
    key: K,
    value: SettingsResponse[K]
  ) => {
    try {
      await updateSettings({ [key]: value });
      setSettings((prev) => ({ ...prev, [key]: value }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to update ${String(key)}`
      );
      throw err;
    }
  };

  const updateMultipleSettings = async (
    newSettings: Partial<SettingsResponse>
  ) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await updateSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update settings"
      );
      throw err;
    }
  };

  return {
    settings,
    loading,
    error,
    updateSetting,
    updateMultipleSettings,
    refetch: async () => {
      const data = await getSettings();
      setSettings(data);
    },
  };
}

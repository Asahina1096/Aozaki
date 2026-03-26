import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface ThemeSettings {
  backgroundImageEnabled?: boolean;
  backgroundImageUrlDesktop?: string;
  backgroundImageUrlMobile?: string;
  backgroundImageOverlayEnabled?: boolean;
  backgroundImageOverlayBlur?: number;
  backgroundImageOverlayDarkness?: number;
  backgroundImageOverlayDarknessOnlyDark?: boolean;
  backgroundImageReadabilityOverlayOpacity?: number;
  cardBlurEnabled?: boolean;
  cardBlurIntensity?: number;
  cardOpacityEnabled?: boolean;
  cardOpacity?: number;
  forceThemeMode?: "none" | "dark" | "light";
  [key: string]: unknown;
}

export interface PublicInfo {
  allow_cors: boolean;
  custom_body: string;
  custom_head: string;
  description: string;
  disable_password_login: boolean;
  oauth_provider: string;
  oauth_enable: boolean;
  ping_record_preserve_time: number;
  record_enabled: boolean;
  record_preserve_time: number;
  sitename: string;
  private_site: boolean;
  theme: string;
  theme_settings: ThemeSettings;
  [property: string]: unknown;
}

interface Response {
  data: PublicInfo;
  message: string;
  status: string;
  [property: string]: unknown;
}

interface PublicInfoContextType {
  publicInfo: PublicInfo | null;
  themeSettings: ThemeSettings | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

const PublicInfoContext = createContext<PublicInfoContextType | undefined>(undefined);

export const PublicInfoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [publicInfo, setPublicInfo] = useState<PublicInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setError(null);
    setIsLoading(true);
    fetch("/api/public")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch public info");
        }
        return response.json();
      })
      .then((resp: Response) => {
        if (resp && resp.data) {
          setPublicInfo(resp.data);
        } else {
          setPublicInfo(null);
        }
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "An error occurred while fetching public info",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const themeSettings = publicInfo?.theme_settings ?? null;

  return (
    <PublicInfoContext.Provider value={{ publicInfo, themeSettings, isLoading, error, refresh }}>
      {children}
    </PublicInfoContext.Provider>
  );
};

export const usePublicInfo = () => {
  const context = useContext(PublicInfoContext);
  if (!context) {
    throw new Error("usePublicInfo must be used within a PublicInfoProvider");
  }
  return context;
};

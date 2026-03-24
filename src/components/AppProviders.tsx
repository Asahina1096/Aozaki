import React from "react";
import { AppRouter } from "@/components/AppRouter";
import { LiveDataProvider } from "@/contexts/LiveDataContext";
import { NodeListProvider } from "@/contexts/NodeListContext";
import { PublicInfoProvider } from "@/contexts/PublicInfoContext";
import { RPC2Provider } from "@/contexts/RPC2Context";
import "@/i18n/config";

interface AppProvidersProps {
  refreshInterval?: number;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ refreshInterval = 2000 }) => {
  return (
    <PublicInfoProvider>
      <RPC2Provider>
        <NodeListProvider>
          <LiveDataProvider>
            <AppRouter refreshInterval={refreshInterval} />
          </LiveDataProvider>
        </NodeListProvider>
      </RPC2Provider>
    </PublicInfoProvider>
  );
};

export default AppProviders;

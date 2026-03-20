import React from "react";
import { AppRouter } from "@/components/AppRouter";
import { LiveDataProvider } from "@/contexts/LiveDataContext";
import { NodeListProvider } from "@/contexts/NodeListContext";
import { RPC2Provider } from "@/contexts/RPC2Context";
import "@/i18n/config";

interface AppProvidersProps {
  refreshInterval?: number;
}

export const AppProviders: React.FC<AppProvidersProps> = ({
  refreshInterval = 2000,
}) => {
  return (
    <RPC2Provider>
      <NodeListProvider>
        <LiveDataProvider>
          <AppRouter refreshInterval={refreshInterval} />
        </LiveDataProvider>
      </NodeListProvider>
    </RPC2Provider>
  );
};

export default AppProviders;

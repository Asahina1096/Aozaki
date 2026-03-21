import React from "react";
import { InstanceList } from "@/components/InstanceList";
import { LiveDataProvider } from "@/contexts/LiveDataContext";
import { NodeListProvider } from "@/contexts/NodeListContext";
import { RPC2Provider } from "@/contexts/RPC2Context";

export const InstanceProviders: React.FC = () => {
  return (
    <RPC2Provider>
      <NodeListProvider>
        <LiveDataProvider>
          <InstanceList />
        </LiveDataProvider>
      </NodeListProvider>
    </RPC2Provider>
  );
};

export default InstanceProviders;

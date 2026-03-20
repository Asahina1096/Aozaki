import React from "react";
import { RPC2Provider } from "@/contexts/RPC2Context";
import { NodeListProvider } from "@/contexts/NodeListContext";
import { LiveDataProvider } from "@/contexts/LiveDataContext";
import { InstanceList } from "@/components/InstanceList";

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

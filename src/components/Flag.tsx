import React from "react";
import { emojiToRegionMap } from "../utils/regionHelper";

interface FlagProps {
  flag: string;
  size?: number;
}

const Flag: React.FC<FlagProps> = ({ flag, size = 20 }) => {
  if (!flag) {
    return <span style={{ fontSize: size }}>🌐</span>;
  }

  const regionInfo = emojiToRegionMap[flag];
  if (regionInfo) {
    return (
      <span style={{ fontSize: size }} title={`${regionInfo.zh} (${regionInfo.en})`}>
        {flag}
      </span>
    );
  }

  return <span style={{ fontSize: size }}>{flag}</span>;
};

export default Flag;

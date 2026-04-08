import * as React from "react";
import { cn } from "@/lib/utils";

interface SegmentedControlProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

interface SegmentedControlItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const SegmentedControlContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

const SegmentedControlRoot = React.forwardRef<HTMLDivElement, SegmentedControlProps>(
  ({ value, onValueChange, className, children }, _ref) => {
    return (
      <SegmentedControlContext.Provider value={{ value, onValueChange }}>
        <div
          className={cn(
            "relative inline-flex items-center rounded-full bg-accent/10 p-1",
            className,
          )}
          role="radiogroup"
        >
          {children}
        </div>
      </SegmentedControlContext.Provider>
    );
  },
);
SegmentedControlRoot.displayName = "SegmentedControl.Root";

const SegmentedControlItem = React.forwardRef<HTMLButtonElement, SegmentedControlItemProps>(
  ({ value, children, className }, _ref) => {
    const context = React.useContext(SegmentedControlContext);
    if (!context) {
      throw new Error("SegmentedControl.Item must be used within SegmentedControl.Root");
    }

    const isActive = context.value === value;

    return (
      <button
        ref={_ref}
        type="button"
        role="radio"
        aria-checked={isActive}
        onClick={() => context.onValueChange(value)}
        className={cn(
          "relative z-10 flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
          className,
        )}
      >
        {children}
      </button>
    );
  },
);
SegmentedControlItem.displayName = "SegmentedControl.Item";

export const SegmentedControl = {
  Root: SegmentedControlRoot,
  Item: SegmentedControlItem,
};

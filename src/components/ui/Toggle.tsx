import { forwardRef } from "react";
import { Switch } from "@base-ui/react/switch";
import { cn } from "@/lib/util";

type ToggleSize = "sm" | "md" | "lg";

export interface ToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: ToggleSize;
  leftLabel?: React.ReactNode;
  rightLabel?: React.ReactNode;
  className?: string;
}

const sizeClasses: Record<
  ToggleSize,
  {
    track: string;
    thumb: string;
  }
> = {
  sm: {
    track: "w-10 h-6",
    thumb: "size-4",
  },
  md: {
    track: "w-12 h-7",
    thumb: "size-5",
  },
  lg: {
    track: "w-14 h-8",
    thumb: "size-6",
  },
};

const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      checked,
      defaultChecked = false,
      onCheckedChange,
      disabled,
      size = "md",
      leftLabel,
      rightLabel,
      className,
    },
    ref,
  ) => {
    const styles = sizeClasses[size];

    return (
      <div
        className={cn(
          "inline-flex justify-between items-center gap-3",
          disabled && "opacity-50",
        )}
      >
        {leftLabel}

        <Switch.Root
          ref={ref}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className={cn(
            "relative rounded-full transition-all duration-200 cursor-pointer",
            "bg-linear-to-b from-background to-background/30",
            "app-blur",
            "shadow-[inset_0_1px_1px_rgba(255,255,255,1),inset_0_0_20px_rgba(255,255,255,1)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),inset_0_0_20px_rgba(255,255,255,0.08)]",
            "data-checked:to-primary/30 data-checked:dark:to-primary/50",
            styles.track,
            className,
          )}
        >
          <Switch.Thumb
            className={cn(
              "absolute top-1/2 left-1 -translate-y-1/2 rounded-full bg-muted-foreground data-checked:bg-primary shadow-sm transition-transform duration-200",
              styles.thumb,
              // 🎯 FIX: Explicitly write out the full class names.
              // Tailwind's JIT compiler needs to see the exact strings to generate the CSS.
              size === "sm" && "data-checked:translate-x-4",
              size === "md" && "data-checked:translate-x-5",
              size === "lg" && "data-checked:translate-x-6",
            )}
          />
        </Switch.Root>

        {rightLabel}
      </div>
    );
  },
);

Toggle.displayName = "Toggle";

export default Toggle;

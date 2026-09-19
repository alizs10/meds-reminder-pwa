import { type ReactNode } from "react";
import { Typography } from "../ui/Typography";

interface CustomHeaderProps {
  header: {
    title: string;
    icon?: ReactNode;
    action?: ReactNode;
    trailingAction?: ReactNode; // ✅ Added for the right-side action
  };
}

export default function CustomHeader({ header }: CustomHeaderProps) {
  return (
    <div className="fixed inset-x-0 top-0 pt-4 bottom-auto flex-1 w-full flex-row-center gap-x-3 px-5 max-w-lg mx-auto flex-center-between z-40 bg-linear-to-b from-black/20 dark:from-black/50 to-transparent">

      <div className="flex-row-center gap-x-3 h-12 max-h-12">


        {header.action && header.action}
        <div className="flex-row-center gap-x-2 app_container app_gradient app-blur h-12 max-h-12 px-6">
          {header.icon && header.icon}

          <Typography variant="lg" weight="medium">
            {header.title}
          </Typography>
        </div>
      </div>

      {/* Right Group (or Left in RTL): Trailing Action */}
      {header.trailingAction && (
        <div className="shrink-0 h-12 max-h-12">
          {header.trailingAction}
        </div>
      )}
    </div>
  );
}

import { type ReactNode } from "react";
import { Typography } from "../ui/Typography";

interface CustomHeaderProps {
  header: {
    title: string;
    icon?: ReactNode;
    action?: ReactNode;
  };
}

export default function CustomHeader({ header }: CustomHeaderProps) {
  return (
    <div className="fixed inset-x-0 top-safe-offset-4 bottom-auto flex-1 w-full h-12 max-h-12 flex-row-center gap-x-3 px-5 max-w-lg mx-auto">
      {header.action && header.action}
      <div className="flex-row-center gap-x-2 app_container app_gradient app-blur h-full px-6">
        {header.icon && header.icon}

        <Typography variant="lg" weight="medium">
          {header.title}
        </Typography>
      </div>
    </div>
  );
}

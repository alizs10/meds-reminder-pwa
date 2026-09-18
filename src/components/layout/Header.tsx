import { IconUser } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Skeleton from "@/components/ui/Skeleton";
import { Typography } from "../ui/Typography";
import { useProfileStore } from "@/stores/useProfileStore";
import Button from "../ui/Button";

export default function Header() {
  const { t } = useTranslation("common");

  const profile = useProfileStore((s) => s.profile);
  const avatarUrl = useProfileStore((s) => s.avatarUrl);
  const isInitialized = useProfileStore((s) => s.isInitialized);
  // const isInitialized = false;

  return (
    <div className="px-5 flex-1 w-full h-12 max-h-12 fixed inset-x-0 top-safe-offset-4 bottom-auto flex-row-center gap-x-3 z-50 max-w-lg mx-auto">

      {isInitialized ? (
        <Link className="max-h-12" to="/profile">

          <Button
            size="icon"
            variant={isInitialized ? "primary" : "ghost"}
            className="h-12 min-h-12 py-0 p-px"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={t("profile.nameFallback")}
                className="size-full object-cover rounded-full"
              />
            ) : (
              <IconUser className="size-6 text-muted-foreground" />
            )}
          </Button>

        </Link>
      ) : (
        <Skeleton className="size-12" />
      )
      }



      <div className="flex-center app_container app_gradient app-blur h-full px-4">
        {!isInitialized ? (
          <Skeleton className="h-5 w-28" />
        ) : profile?.name ? (
          <Typography
            className="max-w-30 text-nowrap text-ellipsis overflow-clip"
            variant="lg"
            weight="medium"
          >
            {t("profile.greeting", { name: profile.name })}
          </Typography>
        ) : (
          <Typography variant="lg" weight="medium">
            {t("profile.greetingFallback")}
          </Typography>
        )}
      </div>
    </div>
  );
}
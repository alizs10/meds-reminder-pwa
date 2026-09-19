import { IconSettings, IconUser } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import Skeleton from "@/components/ui/Skeleton";
import { useProfileStore } from "@/stores/useProfileStore";
import Button from "../ui/Button";
import { Typography } from "../ui/Typography";

export default function Header() {
  const { t } = useTranslation("common");

  const profile = useProfileStore((s) => s.profile);
  const avatarUrl = useProfileStore((s) => s.avatarUrl);
  const isInitialized = useProfileStore((s) => s.isInitialized);
  // const isInitialized = false;

  return (
    <div className="px-5 flex-1 w-full fixed inset-x-0 top-0 pt-4 bottom-auto flex-center-between z-50 max-w-lg mx-auto bg-linear-to-b from-black/20 dark:from-black/50 to-transparent">

      <div className="flex-row-center gap-x-3">
        {isInitialized ? (
          <Link className="h-12 max-h-12" to="/profile">

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



        <div className="flex-center app_container app_gradient app-blur h-12 max-h-12 px-4">
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


      <Link to="/settings">
        <Button size="icon-sm" variant="primary" className="h-12 min-h-12 py-0 p-px">
          <IconSettings className="size-5" />
        </Button>

      </Link>

    </div>
  );
}
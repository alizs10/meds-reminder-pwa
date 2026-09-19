import { IconMenu, IconPill, IconSmartHome } from "@tabler/icons-react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button";
import { Typography } from "../ui/Typography";

interface BottomBarProps { onMenuClick: () => void; }

export default function BottomBar({ onMenuClick }: BottomBarProps) {
  const { t } = useTranslation("common");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe bg-linear-to-t from-black/20 dark:from-black/50 to-transparent">
      <div className="max-w-116 w-full mx-auto mb-4 h-14 flex-center gap-1.5">
        <div className="app_container app_gradient app-blur flex-center h-14 px-2 gap-0">
          <NavLink to="/">{({ isActive }) => (
            <Button size="icon" variant="none" className={`${isActive ? "text-primary" : "text-muted-foreground"}`}>
              <div className="flex-center flex-col gap-y-0.5">
                <IconSmartHome className="size-5" />
                <Typography variant="xxs">
                  {t("navigation.home")}
                </Typography>
              </div>
            </Button>
          )}</NavLink>

          <NavLink to="/medicines">{({ isActive }) => (
            <Button size="icon" variant="none" className={`${isActive ? "text-primary" : "text-muted-foreground"}`}>
              <div className="flex-center flex-col gap-y-0.5">
                <IconPill className="size-5" />
                <Typography variant="xxs">
                  {t("navigation.medicines")}
                </Typography>
              </div>
            </Button>
          )}</NavLink>
        </div>

        <Button onClick={onMenuClick} size="icon" variant="none" className="text-muted-foreground app_container app_gradient app-blur">
          <IconMenu className="size-5" />
        </Button>
      </div>
    </div>
  );
}
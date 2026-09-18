import {
  IconDownload,
  IconPencil,
  IconPill,
  IconSettings,
  IconSmartHome,
  IconUser
} from "@tabler/icons-react";
import { useDrag } from "@use-gesture/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { useIsRTL } from "@/hooks/useIsRTL";
import { useProfileStore } from "@/stores/useProfileStore";

import Button from "../ui/Button";
import ConfirmDialog from "../ui/Dialog";
import { Typography } from "../ui/Typography";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type SafeDragHandlers = {
  onPointerDown?: React.PointerEventHandler<HTMLElement>;
  onPointerMove?: React.PointerEventHandler<HTMLElement>;
  onPointerUp?: React.PointerEventHandler<HTMLElement>;
  onPointerCancel?: React.PointerEventHandler<HTMLElement>;
  onPointerLeave?: React.PointerEventHandler<HTMLElement>;
};

// ✅ Added Settings to menu items
const menuItems = [
  { labelKey: "navigation.home", icon: <IconSmartHome className="size-5" />, path: "/" },
  { labelKey: "navigation.medicines", icon: <IconPill className="size-5" />, path: "/medicines" },
  { labelKey: "navigation.profile", icon: <IconUser className="size-5" />, path: "/profile" },
  { labelKey: "settings.title", icon: <IconSettings className="size-5" />, path: "/settings" },
] as const;

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useTranslation("common");
  const isRTL = useIsRTL();

  const navigate = useNavigate();
  const profile = useProfileStore((s) => s.profile);
  const avatarUrl = useProfileStore((s) => s.avatarUrl);
  const age = useProfileStore((s) => s.calculateAge());

  const { isInstallable, promptInstall, isIos, installHint } = useInstallPrompt();

  const [isHintOpen, setIsHintOpen] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleInstallClick = () => {
    if (isIos) {
      setIsHintOpen(true);
      return;
    }
    promptInstall();
  };

  const bind = useDrag(
    ({ active, movement: [mx], velocity: [vx] }) => {
      setIsDragging(active);

      if (active) {
        if (isRTL) {
          setDragX(Math.max(0, mx));
        } else {
          setDragX(Math.min(0, mx));
        }
      } else {
        if (isRTL) {
          if (mx > 100 || vx > 0.5) onClose();
        } else {
          if (mx < -100 || vx < -0.5) onClose();
        }
        setDragX(0);
      }
    },
    {
      axis: "x",
      filterTaps: true,
      pointer: { touch: true },
    },
  );

  const handlers = bind() as SafeDragHandlers;
  const backdropOpacity = Math.max(0, 1 - Math.abs(dragX) / 250);

  return (
    <>
      <motion.div
        initial={false}
        animate={{ opacity: isOpen ? backdropOpacity : 0 }}
        transition={{ duration: isDragging ? 0 : 0.2 }}
        className={`fixed inset-0 max-w-lg mx-auto flex z-998 bg-black/60 backdrop-blur-sm overflow-x-clip ${isOpen ? "" : "pointer-events-none"}`}
        onClick={onClose}
      />

      <div className="fixed inset-0 z-999 pointer-events-none max-w-lg mx-auto overflow-x-clip">
        <motion.aside
          {...handlers}
          initial={false}
          animate={{
            x: isOpen ? dragX : (isRTL ? "100%" : "-100%"),
          }}
          transition={{
            type: isDragging ? "tween" : "spring",
            damping: 25,
            stiffness: 200,
            duration: isDragging ? 0 : 0.3,
          }}
          className={`h-full flex w-4/5 max-w-sm flex-col gap-y-0 bg-secondary dark:bg-background max-h-dvh ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
          style={{ touchAction: "pan-y" }}
        >
          <div className="flex-center-between pt-safe mt-5 p-5">
            <Link to="/" onClick={onClose}>
              <Button
                variant="none"
                size="sm"
                className="px-0 py-0"
                leftIcon={<img src="/logo.webp" className="h-8 w-auto" alt="logo" />}
              >
                <Typography variant="md" weight="bold">
                  {t("app.name")}
                </Typography>
              </Button>
            </Link>

            {isInstallable && (
              <Button
                size="sm"
                onClick={handleInstallClick}
                variant="primary"
                leftIcon={<IconDownload className="size-4" />}
              >
                <Typography className="text-nowrap" variant="sm" weight="medium">
                  {t("install.button")}
                </Typography>
              </Button>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-y-scroll scrollbar-none flex flex-col gap-y-4 pb-6">
            <nav className="flex flex-col gap-y-1 px-5">
              {menuItems.map((item) => (
                <NavLink key={item.path} to={item.path} onClick={onClose}>
                  {({ isActive }) => (
                    <Button
                      variant="none"
                      size="md"
                      className={`w-full justify-start gap-x-3 px-0 ${isActive ? "text-primary" : ""}`}
                      leftIcon={item.icon}
                    >
                      <Typography variant="sm" weight="medium">
                        {t(item.labelKey)}
                      </Typography>
                    </Button>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="mt-auto flex-row-center gap-x-3 p-5 bg-muted dark:bg-secondary">
            <div className="size-16 rounded-full overflow-hidden bg-secondary dark:bg-muted flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={t("profile.nameFallback")} className="size-full object-cover" />
              ) : (
                <IconUser className="size-8 text-muted-foreground" />
              )}
            </div>

            <div className="flex-center-between flex-1">
              <div className="flex flex-col gap-y-0">
                <Typography className="text-nowrap text-foreground" variant="lg" weight="semibold">
                  {profile?.name || t("profile.nameFallback")}
                </Typography>

                {age !== null && (
                  <Typography className="text-nowrap text-muted-foreground" variant="sm" weight="medium">
                    {t("profile.yearsOld", { count: age })}
                  </Typography>
                )}
              </div>

              <Button
                variant="none"
                size="icon-sm"
                onClick={() => {
                  navigate("/profile");
                  onClose();
                }}
              >
                <IconPencil className="size-5" />
              </Button>
            </div>
          </div>
        </motion.aside>
      </div>

      <ConfirmDialog
        open={isHintOpen}
        onClose={() => setIsHintOpen(false)}
        onCancel={() => setIsHintOpen(false)}
        onConfirm={() => setIsHintOpen(false)}
        title={t("install.title")}
        description={installHint}
        confirmText={t("install.gotIt")}
        cancelText={t("actions.close")}
      />
    </>
  );
}
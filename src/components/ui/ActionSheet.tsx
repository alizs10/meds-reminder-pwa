import ModalWrapper from "./modal/ModalWrapper";
import Button, { type ButtonVariant } from "./Button";
import { Typography } from "./Typography";
import type { ReactNode } from "react";

interface Action {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    variant?: ButtonVariant;
}

interface ActionSheetProps {
    open: boolean;
    onClose: () => void;
    actions: Action[];
}

export default function ActionSheet({ open, onClose, actions }: ActionSheetProps) {
    return (
        <ModalWrapper open={open} onClose={onClose}>
            <div className="flex flex-col gap-y-2 pt-5 pb-2">
                {actions.map((action, index) => (
                    <Button
                        key={index}
                        variant={action.variant}
                        size="lg"
                        leftIcon={action.icon}
                        onClick={action.onClick}
                    >
                        <Typography
                            variant="md"
                            weight="medium"
                        >
                            {action.label}
                        </Typography>
                    </Button>
                ))}
                <div className="h-px bg-border my-2" />
                <Button variant="ghost" size="lg" className="w-full" onClick={onClose}>
                    <Typography variant="md" weight="medium" className="text-muted-foreground">Cancel</Typography>
                </Button>
            </div>
        </ModalWrapper>
    );
}
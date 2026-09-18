import type { ChangeEvent, ReactNode } from "react";
import type { ButtonVariant } from "./Button";
import Button from "./Button";
import ModalHeader from "./modal/ModalHeader";
import ModalWrapper from "./modal/ModalWrapper";
import TextInput from "./TextInput";
import { Typography } from "./Typography";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onExited?: () => void;

  title: string;
  description?: string;

  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;

  confirmVariant?: ButtonVariant;
  cancelVariant?: ButtonVariant;
  confirmIcon?: ReactNode;
  cancelIcon?: ReactNode;

  confirmInput?: {
    placeholder: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  };
}

export default function ConfirmDialog({
  open,
  onClose,
  onExited,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  confirmVariant = "primary",
  cancelVariant = "ghost",
  confirmIcon,
  cancelIcon,
  confirmInput,
}: ConfirmDialogProps) {
  const isConfirmDisabled = confirmInput
    ? confirmInput.value.trim().length === 0
    : false;

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      onExited={onExited}
      className="bg-secondary rounded-t-3xl"
    >
      <div className="flex w-full flex-col">
        <ModalHeader title={title} onClose={onClose} />

        {description && (
          <Typography
            variant="md"
            className="mt-4 text-center text-muted-foreground"
          >
            {description}
          </Typography>
        )}

        {confirmInput && (
          <div className="mt-4">
            <TextInput
              className="text-xs placeholder:text-xs placeholder:text-muted-foreground"
              value={confirmInput.value}
              onChange={confirmInput.onChange}
              placeholder={confirmInput.placeholder}
            />
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            size="md"
            onClick={onCancel}
            variant={cancelVariant}
            className="flex-1"
            rightIcon={cancelIcon}
          >
            <Typography variant="md" className="text-secondary-foreground">
              {cancelText}
            </Typography>
          </Button>

          <Button
            size="md"
            onClick={onConfirm}
            variant={confirmVariant}
            className="flex-1"
            rightIcon={confirmIcon}
            disabled={isConfirmDisabled}
          >
            <Typography variant="md" weight="semibold">
              {confirmText}
            </Typography>
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}

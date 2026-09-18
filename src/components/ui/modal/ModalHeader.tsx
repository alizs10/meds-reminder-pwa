import { Typography } from '@/components/ui/Typography';
import Button from '../Button';
import { IconX } from '@tabler/icons-react';

interface ModalHeaderProps {
    title: string;
    onClose: () => void;
}

export default function ModalHeader({ onClose, title }: ModalHeaderProps) {
    return (
        <div className="flex items-center justify-between gap-4">
            <Typography as="h4" variant="lg" weight="bold">
                {title}
            </Typography>

            <Button onClick={onClose} variant='ghost' size='icon-sm' className="shrink-0">
                <IconX className='size-5' />
            </Button>
        </div>
    );
}
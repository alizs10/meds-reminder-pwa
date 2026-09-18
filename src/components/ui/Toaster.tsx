import { useToastStore, type ToastStatus } from '@/stores/useToastStore'
import { Typography } from './Typography'
import { useIsRTL } from '@/hooks/useIsRTL'

export default function Toaster() {
    const toasts = useToastStore(s => s.toasts)
    const isRTL = useIsRTL()

    if (toasts.length === 0) return null

    const getAnimation = (status: ToastStatus) => {
        // ✅ Append '-rtl' suffix for RTL languages
        const suffix = isRTL ? '-rtl' : ''
        switch (status) {
            case 'entering': return `toast-slide-in${suffix} 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards`
            case 'pushing-back': return `toast-push-back${suffix} 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards`
            case 'pulling-front': return `toast-pull-front${suffix} 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards`
            case 'exiting': return `toast-slide-out${suffix} 0.4s cubic-bezier(0.4, 0, 1, 1) forwards`
            default: return undefined
        }
    }

    const getTransform = (status: ToastStatus) => {
        // ✅ In RTL, the "back" position is to the left (-18px) instead of right (18px)
        const backX = isRTL ? '-18px' : '18px'
        switch (status) {
            case 'front': return 'translateX(0) translateY(0) scale(1)'
            case 'back': return `translateX(${backX}) translateY(0) scale(0.8)`
            default: return undefined
        }
    }

    const getZIndex = (status: ToastStatus) => {
        switch (status) {
            case 'front':
            case 'entering':
            case 'pulling-front': return 'z-20'
            case 'back':
            case 'pushing-back': return 'z-10'
            case 'exiting': return 'z-0'
            default: return 'z-10'
        }
    }

    return (
        <div className="fixed inset-0 max-w-lg overflow-x-clip mx-auto z-9999 flex flex-col gap-2 pointer-events-none px-5 py-4 items-end">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`absolute top-safe-offset-4 ${isRTL ? "left-5" : "right-5"} ${getZIndex(t.status)}`}
                    style={{
                        transform: getTransform(t.status),
                        animation: getAnimation(t.status),
                    }}
                >
                    <div className="app_container app_gradient app-blur flex items-center gap-1.5 rounded-2xl px-4 min-h-12 shadow-lg text-foreground pointer-events-auto w-fit max-w-xs">
                        {t.icon && (
                            <span className="size-5 shrink-0 flex items-center justify-center">
                                {t.icon}
                            </span>
                        )}
                        <Typography variant="xs" className="font-medium leading-none whitespace-nowrap">
                            {t.message}
                        </Typography>
                    </div>
                </div>
            ))}
        </div>
    )
}
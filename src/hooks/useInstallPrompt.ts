import { useEffect, useState } from 'react'

// ✅ Define the exact shape of the Chromium-specific install event
interface BeforeInstallPromptEvent extends Event {
    readonly prompt: () => Promise<void>
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed'
        platform: string
    }>
}

// ✅ Capture the event at module scope so we never miss it,
// even if it fires before React mounts (common in production)
let capturedEvent: BeforeInstallPromptEvent | null = null

if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', ((e: BeforeInstallPromptEvent) => {
        e.preventDefault()
        capturedEvent = e
    }) as EventListener)

    window.addEventListener('appinstalled', () => {
        capturedEvent = null
    })
}

// ✅ iOS Safari and Firefox Android never fire 'beforeinstallprompt'.
function isIos(): boolean {
    if (typeof navigator === 'undefined') return false
    const ua = window.navigator.userAgent
    return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && 'ontouchend' in document)
}

// Detect them so the UI can show a manual "Add to Home Screen" hint instead.
function needsManualInstallHint(): boolean {
    if (typeof navigator === 'undefined') return false
    const ua = window.navigator.userAgent
    const isFirefoxAndroid = /Android/.test(ua) && /Firefox|FxiOS/.test(ua)
    const isStandalone =
        'standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true
    return (isIos() || isFirefoxAndroid) && !isStandalone
}

export function useInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(capturedEvent)
    const [isInstallable, setIsInstallable] = useState(!!capturedEvent || needsManualInstallHint())

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setIsInstallable(true)
        }
        const installedHandler = () => {
            capturedEvent = null
            setDeferredPrompt(null)
            setIsInstallable(false)
        }

        window.addEventListener('beforeinstallprompt', handler)
        window.addEventListener('appinstalled', installedHandler)
        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
            window.removeEventListener('appinstalled', installedHandler)
        }
    }, [])

    const promptInstall = async () => {
        if (!deferredPrompt) return

        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            capturedEvent = null
            setDeferredPrompt(null)
            setIsInstallable(false)
        }
    }

    return {
        isInstallable,
        promptInstall,
        isIos: !deferredPrompt && needsManualInstallHint(),
        installHint: isIos()
            ? 'Tap the Share button in Safari, then choose "Add to Home Screen".'
            : 'Open the browser menu and tap "Install".',
    }
}

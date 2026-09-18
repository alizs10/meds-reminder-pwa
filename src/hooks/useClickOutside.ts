import { useEffect, useRef } from "react"

export default function useClickOutside<T extends HTMLElement = HTMLDivElement>(handler: () => void) {
    const domRef = useRef<T>(null)

    // ✅ Use a ref for the handler to prevent stale closures
    const handlerRef = useRef(handler)
    useEffect(() => {
        handlerRef.current = handler
    }, [handler])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent | TouchEvent) {
            if (domRef.current && !domRef.current.contains(event.target as Node)) {
                handlerRef.current()
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside); // ✅ Added for mobile support

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [])

    return domRef
}
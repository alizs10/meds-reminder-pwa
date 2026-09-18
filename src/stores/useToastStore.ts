import { create } from 'zustand'
import type { ReactNode } from 'react'

export type ToastStatus = 'entering' | 'front' | 'pushing-back' | 'back' | 'pulling-front' | 'exiting'

export interface Toast {
    id: string
    icon?: ReactNode
    message: string
    status: ToastStatus
}

interface ToastState {
    toasts: Toast[]
    addToast: (message: string, icon?: ReactNode) => void
    exitToast: (id: string) => void
}

let counter = 0
const genId = () => `t-${Date.now()}-${++counter}`

const VISIBLE_DURATION = 2500

export const useToastStore = create<ToastState>((set, get) => ({
    toasts: [],

    addToast: (message, icon) => {
        const id = genId()
        const newToast: Toast = { id, icon, message, status: 'entering' }

        set(state => {
            const activeToasts = state.toasts.filter(t => t.status !== 'exiting')
            let next = [...state.toasts]

            // 1. Find the current front toast and push it back
            const frontToast = activeToasts.find(t => t.status === 'front' || t.status === 'entering' || t.status === 'pulling-front')
            if (frontToast) {
                next = next.map(t => t.id === frontToast.id ? { ...t, status: 'pushing-back' as ToastStatus } : t)

                // Schedule it to settle into the 'back' state after the push-back animation (500ms)
                setTimeout(() => {
                    set(s => ({
                        toasts: s.toasts.map(t => t.id === frontToast.id && t.status === 'pushing-back' ? { ...t, status: 'back' as ToastStatus } : t)
                    }))
                }, 500)
            }

            // 2. Strict Max 2: If we already have a back toast, exit it immediately
            const backToasts = activeToasts.filter(t => t.status === 'back' || t.status === 'pushing-back')
            if (backToasts.length >= 1 && frontToast) {
                const oldestBack = backToasts[0]
                next = next.map(t => t.id === oldestBack.id ? { ...t, status: 'exiting' as ToastStatus } : t)
                setTimeout(() => {
                    set(s => ({ toasts: s.toasts.filter(t => t.id !== oldestBack.id) }))
                }, 400) // exit animation duration
            }

            return { toasts: [...next, newToast] }
        })

        // 3. Move new toast to 'front' after enter animation (400ms)
        setTimeout(() => {
            set(state => ({
                toasts: state.toasts.map(t => t.id === id && t.status === 'entering' ? { ...t, status: 'front' as ToastStatus } : t)
            }))
        }, 400)

        // 4. Auto-exit after visible duration
        setTimeout(() => {
            const current = get().toasts.find(t => t.id === id)
            if (current && current.status !== 'exiting') {
                get().exitToast(id)
            }
        }, VISIBLE_DURATION)
    },

    exitToast: (id) => {
        const existing = get().toasts.find(t => t.id === id)
        if (!existing || existing.status === 'exiting') return

        set(state => ({
            toasts: state.toasts.map(t => t.id === id ? { ...t, status: 'exiting' as ToastStatus } : t)
        }))

        // If the exiting toast was the 'front' one, pull the 'back' one to front
        if (existing.status === 'front' || existing.status === 'entering') {
            const backToast = get().toasts.find(t => t.status === 'back')
            if (backToast) {
                set(state => ({
                    toasts: state.toasts.map(t => t.id === backToast.id ? { ...t, status: 'pulling-front' as ToastStatus } : t)
                }))
                setTimeout(() => {
                    set(s => ({
                        toasts: s.toasts.map(t => t.id === backToast.id && t.status === 'pulling-front' ? { ...t, status: 'front' as ToastStatus } : t)
                    }))
                }, 400)
            }
        }

        setTimeout(() => {
            set(state => ({
                toasts: state.toasts.filter(t => t.id !== id)
            }))
        }, 400)
    },
}))

export const toast = (message: string, icon?: ReactNode) => {
    useToastStore.getState().addToast(message, icon)
}
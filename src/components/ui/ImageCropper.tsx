// src/components/ui/ImageCropper.tsx
import { useState, useRef, useEffect } from "react";
import { IconZoomIn, IconColorFilter } from "@tabler/icons-react";
import ModalWrapper from "@/components/ui/modal/ModalWrapper";
import ModalHeader from "@/components/ui/modal/ModalHeader";
import Button from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import CustomSlider from "./CustomSlider";

interface CropData {
    url: string;
    imgW: number;
    imgH: number;
    baseScale: number;
    scale: number;
    x: number;
    y: number;
    isInitialized: boolean;
}

interface ImageCropperProps {
    open: boolean;
    file: File | null;
    onClose: () => void;
    onSave: (croppedFile: File) => void;
    aspectRatio?: "16:9" | "1:1"; // NEW: Support different aspect ratios
}

const OUTPUT_SIZES = {
    "16:9": { width: 800, height: 450 },
    "1:1": { width: 400, height: 400 }, // Square avatar
};

export default function ImageCropper({
    open,
    file,
    onClose,
    onSave,
    aspectRatio = "16:9" // Default to 16:9
}: ImageCropperProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [cropData, setCropData] = useState<CropData | null>(null);
    const [grayscaleAmount, setGrayscaleAmount] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const dragStart = useRef({ x: 0, y: 0, imgX: 0, imgY: 0 });

    const outputSize = OUTPUT_SIZES[aspectRatio];
    const aspectClass = aspectRatio === "16:9" ? "aspect-video" : "aspect-square";

    // Reset state synchronously during render when file changes
    const [prevFile, setPrevFile] = useState<File | null>(file);
    if (prevFile !== file) {
        setPrevFile(file);
        setGrayscaleAmount(0);
        setIsSaving(false);
        setIsDragging(false);
        setCropData(null);
    }

    const clampPosition = (
        x: number, y: number, scale: number,
        cw: number, ch: number, imgW: number, imgH: number
    ) => {
        const scaledW = imgW * scale;
        const scaledH = imgH * scale;
        return {
            x: Math.min(0, Math.max(cw - scaledW, x)),
            y: Math.min(0, Math.max(ch - scaledH, y)),
        };
    };

    useEffect(() => {
        if (!file || !open) return;

        let cancelled = false;
        const url = URL.createObjectURL(file);
        const img = new Image();

        const initializeCrop = () => {
            if (cancelled || !img.naturalWidth || !img.naturalHeight) return;

            const rect = containerRef.current?.getBoundingClientRect();
            const cw = rect && rect.width > 0 ? rect.width : Math.min(window.innerWidth - 32, 400);
            const ch = rect && rect.height > 0 ? rect.height : cw * (outputSize.height / outputSize.width);

            const baseScale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
            const scaledW = img.naturalWidth * baseScale;
            const scaledH = img.naturalHeight * baseScale;

            setCropData({
                url,
                imgW: img.naturalWidth,
                imgH: img.naturalHeight,
                baseScale,
                scale: baseScale,
                x: (cw - scaledW) / 2,
                y: (ch - scaledH) / 2,
                isInitialized: false,
            });
        };

        img.onload = initializeCrop;
        img.src = url;

        if (img.complete && img.naturalWidth > 0) {
            initializeCrop();
        }

        return () => {
            cancelled = true;
            URL.revokeObjectURL(url);
        };
    }, [file, open, outputSize]);

    useEffect(() => {
        if (!open || !file || !cropData) return;

        const container = containerRef.current;
        if (!container) return;

        const recalculate = () => {
            const rect = container.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;

            setCropData((prev) => {
                if (!prev) return null;

                const newBaseScale = Math.max(rect.width / prev.imgW, rect.height / prev.imgH);
                const zoom = prev.scale / prev.baseScale;
                const newScale = newBaseScale * zoom;
                const scaledW = prev.imgW * newScale;
                const scaledH = prev.imgH * newScale;

                if (!prev.isInitialized) {
                    return {
                        ...prev,
                        baseScale: newBaseScale,
                        scale: newScale,
                        x: (rect.width - scaledW) / 2,
                        y: (rect.height - scaledH) / 2,
                        isInitialized: true,
                    };
                }

                const pos = clampPosition(prev.x, prev.y, newScale, rect.width, rect.height, prev.imgW, prev.imgH);
                return { ...prev, baseScale: newBaseScale, scale: newScale, x: pos.x, y: pos.y };
            });
        };

        if (!cropData.isInitialized) {
            const frame = requestAnimationFrame(recalculate);
            return () => cancelAnimationFrame(frame);
        }

        const observer = new ResizeObserver(recalculate);
        observer.observe(container);
        return () => observer.disconnect();
    }, [open, file, cropData, cropData?.isInitialized]);

    const onPointerDown = (e: React.PointerEvent) => {
        if (!cropData) return;
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY, imgX: cropData.x, imgY: cropData.y };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !cropData || !containerRef.current) return;

        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        const rect = containerRef.current.getBoundingClientRect();

        const pos = clampPosition(
            dragStart.current.imgX + dx,
            dragStart.current.imgY + dy,
            cropData.scale,
            rect.width,
            rect.height,
            cropData.imgW,
            cropData.imgH
        );

        setCropData((prev) => (prev ? { ...prev, x: pos.x, y: pos.y } : null));
    };

    const onPointerUp = () => setIsDragging(false);

    const onZoomChange = (newZoom: number) => {
        if (!cropData || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const newScale = cropData.baseScale * newZoom;

        const imageCenterX = (rect.width / 2 - cropData.x) / cropData.scale;
        const imageCenterY = (rect.height / 2 - cropData.y) / cropData.scale;

        const newX = rect.width / 2 - imageCenterX * newScale;
        const newY = rect.height / 2 - imageCenterY * newScale;

        const pos = clampPosition(newX, newY, newScale, rect.width, rect.height, cropData.imgW, cropData.imgH);

        setCropData((prev) => (prev ? { ...prev, scale: newScale, x: pos.x, y: pos.y } : null));
    };

    const handleSave = async () => {
        if (!cropData || !containerRef.current) return;
        setIsSaving(true);

        try {
            const rect = containerRef.current.getBoundingClientRect();
            const cw = rect.width;
            const ch = rect.height;

            const scaledW = cropData.imgW * cropData.scale;
            const scaledH = cropData.imgH * cropData.scale;

            const img = new Image();
            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error("Failed to load source image"));
                img.src = cropData.url;
            });

            const canvas = document.createElement("canvas");
            canvas.width = outputSize.width;
            canvas.height = outputSize.height;

            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Failed to create canvas context");

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            if (grayscaleAmount > 0) {
                ctx.filter = `grayscale(${grayscaleAmount}%)`;
            }

            const scaleX = outputSize.width / cw;
            const scaleY = outputSize.height / ch;

            ctx.save();
            ctx.scale(scaleX, scaleY);
            ctx.drawImage(img, cropData.x, cropData.y, scaledW, scaledH);
            ctx.restore();

            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(resolve, "image/webp", 0.8);
            });

            if (!blob) throw new Error("Failed to generate image");

            onSave(new File([blob], `cropped.${aspectRatio === "1:1" ? "avatar" : "photo"}.webp`, { type: "image/webp" }));
            onClose();
        } catch (error) {
            console.error("Failed to crop image:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ModalWrapper open={open} onClose={onClose}>
            <ModalHeader title={aspectRatio === "1:1" ? "Crop Avatar" : "Crop & Edit"} onClose={onClose} />

            {cropData ? (
                <div className="flex flex-col gap-4">
                    <div
                        ref={containerRef}
                        className={`relative ${aspectClass} w-full overflow-hidden rounded-3xl border border-border bg-muted touch-none`}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerUp}
                    >
                        <img
                            src={cropData.url}
                            alt=""
                            draggable={false}
                            className="pointer-events-none absolute left-0 top-0 max-w-none select-none will-change-transform"
                            style={{
                                width: cropData.imgW * cropData.scale,
                                height: cropData.imgH * cropData.scale,
                                transform: `translate3d(${cropData.x}px, ${cropData.y}px, 0)`,
                                transformOrigin: "top left",
                                filter: grayscaleAmount > 0 ? `grayscale(${grayscaleAmount}%)` : "none",
                            }}
                        />

                        {isDragging && (
                            <div className="pointer-events-none absolute inset-0 z-10 grid grid-cols-3 grid-rows-3">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="border border-white/40" />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4">
                        {/* Zoom Slider */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <IconZoomIn className="size-5 text-muted-foreground" />
                                    <Typography variant="sm" weight="medium">Zoom</Typography>
                                </div>
                                <Typography variant="sm" className=" text-muted-foreground">
                                    {Math.round((cropData.scale / cropData.baseScale) * 100)}%
                                </Typography>
                            </div>
                            <CustomSlider
                                value={cropData.scale / cropData.baseScale}
                                onChange={onZoomChange}
                                min={1}
                                max={3}
                                step={0.01}
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <IconColorFilter className="size-5 text-muted-foreground" />
                                    <Typography variant="sm" weight="medium">Grayscale</Typography>
                                </div>
                                <Typography variant="sm" className=" text-muted-foreground">
                                    {grayscaleAmount}%
                                </Typography>
                            </div>
                            <CustomSlider
                                value={grayscaleAmount}
                                onChange={setGrayscaleAmount}
                                min={0}
                                max={100}
                                step={1}
                            />
                        </div>

                        <Button
                            variant="primary-active"
                            size="lg"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            <Typography variant="md" weight="bold">
                                {isSaving ? "Saving..." : "Save Photo"}
                            </Typography>
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex h-40 items-center justify-center">
                    <Typography variant="sm" className="text-muted-foreground">
                        Loading image...
                    </Typography>
                </div>
            )}
        </ModalWrapper>
    );
}
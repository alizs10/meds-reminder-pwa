import { cn } from "@/lib/util";
import { useIsRTL } from "@/hooks/useIsRTL";

interface CustomSliderProps {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
}

export default function CustomSlider({ value, onChange, min, max, step }: CustomSliderProps) {
    const isRTL = useIsRTL();
    const percent = ((value - min) / (max - min)) * 100;

    return (
        <div className="relative w-full h-5 flex items-center">
            {/* Track Background & Grid */}
            <div className="absolute inset-x-0 h-4 app_container app_gradient app-blur overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-5 pointer-events-none">
                    {/* border-e (border-inline-end) automatically flips to border-left in RTL */}
                    <div className="h-full border-e border-border/40 border-dashed" />
                    <div className="h-full border-e border-border/40 border-dashed" />
                    <div className="h-full border-e border-border/40 border-dashed" />
                    <div className="h-full border-e border-border/40 border-dashed" />
                    <div className="h-full" />
                </div>

                {/* Fill */}
                <div
                    className={cn(
                        "absolute inset-y-0 bg-primary/30 rounded-s-full", // rounded-s = rounded start (left in LTR, right in RTL)
                        isRTL ? "right-0" : "left-0"
                    )}
                    style={{ width: `${percent}%` }}
                />
            </div>

            {/* Invisible Native Range Input (Automatically reverses min/max in RTL) */}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />

            {/* Custom Thumb */}
            <div
                className="absolute top-1/2 pointer-events-none z-10"
                style={{
                    // Anchor to the right in RTL, left in LTR
                    [isRTL ? "right" : "left"]: `${percent}%`,
                    // translateY(-50%) centers vertically.
                    // translateX(-50%) centers horizontally in LTR (where left is the anchor).
                    // translateX(50%) centers horizontally in RTL (where right is the anchor).
                    transform: `translateY(-50%) translateX(${isRTL ? '50%' : '-50%'})`
                }}
            >
                <div className="h-8 w-10 rounded-full app_container app_gradient app-blur flex-center">
                    <div className="h-2.5 w-px bg-primary" />
                </div>
            </div>
        </div>
    );
}
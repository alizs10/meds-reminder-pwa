import type { ColorOption } from "@/components/ui/ColorPicker";

export const MEDICINE_COLORS: ColorOption[] = [
    {
        id: "none",
        style: {
            backgroundColor: "transparent",
            border: "1px dashed var(--border)",
        },
        gradientStyle: {},
        label: "No Color",
        checkColor: "text-foreground",
    },

    {
        id: "blue",
        style: { backgroundColor: "#3b82f6" },
        gradientStyle: {
            background:
                "linear-gradient(135deg, rgb(59 130 246 / 0.65), rgb(59 130 246 / 0.25))",
        },
        label: "Blue",
    },
    {
        id: "red",
        style: { backgroundColor: "#ef4444" },
        gradientStyle: {
            background:
                "linear-gradient(135deg, rgb(239 68 68 / 0.65), rgb(239 68 68 / 0.25))",
        },
        label: "Red",
    },
    {
        id: "green",
        style: { backgroundColor: "#22c55e" },
        gradientStyle: {
            background:
                "linear-gradient(135deg, rgb(34 197 94 / 0.65), rgb(34 197 94 / 0.25))",
        },
        label: "Green",
    },
    {
        id: "yellow",
        style: { backgroundColor: "#eab308" },
        gradientStyle: {
            background:
                "linear-gradient(135deg, rgb(234 179 8 / 0.65), rgb(234 179 8 / 0.25))",
        },
        label: "Yellow",
        checkColor: "text-black/70",
    },
    {
        id: "purple",
        style: { backgroundColor: "#a855f7" },
        gradientStyle: {
            background:
                "linear-gradient(135deg, rgb(168 85 247 / 0.65), rgb(168 85 247 / 0.25))",
        },
        label: "Purple",
    },
    {
        id: "orange",
        style: { backgroundColor: "#f97316" },
        gradientStyle: {
            background:
                "linear-gradient(135deg, rgb(249 115 22 / 0.65), rgb(249 115 22 / 0.25))",
        },
        label: "Orange",
    },
    {
        id: "pink",
        style: { backgroundColor: "#ec4899" },
        gradientStyle: {
            background:
                "linear-gradient(135deg, rgb(236 72 153 / 0.65), rgb(236 72 153 / 0.25))",
        },
        label: "Pink",
    },
    {
        id: "teal",
        style: { backgroundColor: "#14b8a6" },
        gradientStyle: {
            background:
                "linear-gradient(135deg, rgb(20 184 166 / 0.65), rgb(20 184 166 / 0.25))",
        },
        label: "Teal",
    },
    {
        id: "silver",
        style: { backgroundColor: "#cbd5e1" },
        gradientStyle: {
            background:
                "linear-gradient(135deg, rgb(203 213 225 / 0.7), rgb(203 213 225 / 0.3))",
        },
        label: "Silver",
        checkColor: "text-black/70",
    },
    {
        id: "white",
        style: { backgroundColor: "#ffffff" },
        gradientStyle: {
            background:
                "linear-gradient(135deg, rgb(255 255 255 / 0.7), rgb(255 255 255 / 0.3))",
        },
        label: "White",
        checkColor: "text-black/70",
    },
];
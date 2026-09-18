import { cn } from "@/lib/util";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { IconChevronDown, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useMemo, useState, type ButtonHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import Button from "./Button";
import TextInput from "./TextInput";
import { Typography } from "./Typography";
import ModalHeader from "./modal/ModalHeader";
import ModalWrapper from "./modal/ModalWrapper";

// ✅ Gregorian imports (react-day-picker & date-fns)
import {
    addMonths as addMonthsGreg,
    addYears as addYearsGreg,
    format as formatGregorian,
    getMonth as getMonthGreg,
    getYear as getYearGreg,
    setMonth as setMonthGreg,
    setYear as setYearGreg,
    subMonths as subMonthsGreg,
    subYears as subYearsGreg
} from "date-fns";
import { enUS, faIR } from "date-fns/locale";
import { DayPicker as DayPickerGregorian, type Matcher } from "react-day-picker";
import "react-day-picker/dist/style.css";

// ✅ Jalali/Persian imports (@daypicker/persian & date-fns-jalali)
import { DayPicker as DayPickerPersian } from "@daypicker/persian";
import {
    addMonths as addMonthsJalali,
    addYears as addYearsJalali,
    getMonth as getMonthJalali,
    getYear as getYearJalali,
    setMonth as setMonthJalali,
    setYear as setYearJalali,
    subMonths as subMonthsJalali,
    subYears as subYearsJalali
} from "date-fns-jalali";

const SHAMSI_MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];

interface DatePickerInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    minDate?: string;
    maxDate?: string;
}

// ✅ Universal interface for both CalendarDay implementations
interface CustomDayButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    day: { date: Date };
    modifiers: Record<string, boolean>;
}

const CustomDayButton = ({ day, modifiers, className, ...buttonProps }: CustomDayButtonProps) => {
    const dateObj = day.date;
    const language = useSettingsStore((s) => s.settings.language);
    const isFa = language === "fa";

    // Use Jalali format for Farsi numbers, Gregorian for English
    const dayNum = isFa
        ? new Intl.DateTimeFormat('fa-IR-u-nu-farsi', { day: 'numeric' }).format(dateObj)
        : formatGregorian(dateObj, "d");

    if (modifiers.selected) {
        return (
            <Button
                size="icon-sm"
                variant="primary-active"
                {...buttonProps}
            >
                <Typography variant="sm" weight="bold">{dayNum}</Typography>
            </Button>
        );
    }

    return (
        <button
            className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                "hover:bg-primary/10 hover:text-primary",
                modifiers.today && "border border-primary/50 font-bold text-primary",
                modifiers.disabled && "opacity-40 pointer-events-none text-muted-foreground",
                modifiers.outside && "opacity-30",
                className
            )}
            {...buttonProps}
        >
            {dayNum}
        </button>
    );
};

export default function DatePickerInput({
    value, onChange, error, placeholder = "YYYY-MM-DD",
    disabled, className, minDate, maxDate,
}: DatePickerInputProps) {
    const { t } = useTranslation("common");
    const language = useSettingsStore((s) => s.settings.language);
    const isFa = language === "fa";

    // ✅ Dynamically select the correct DayPicker and date functions
    const Picker = isFa ? DayPickerPersian : DayPickerGregorian;
    const addMonthsFn = isFa ? addMonthsJalali : addMonthsGreg;
    const subMonthsFn = isFa ? subMonthsJalali : subMonthsGreg;
    const getYearFn = isFa ? getYearJalali : getYearGreg;
    const setYearFn = isFa ? setYearJalali : setYearGreg;
    const getMonthFn = isFa ? getMonthJalali : getMonthGreg;
    const setMonthFn = isFa ? setMonthJalali : setMonthGreg;
    const addYearsFn = isFa ? addYearsJalali : addYearsGreg;
    const subYearsFn = isFa ? subYearsJalali : subYearsGreg;

    const locale = isFa ? faIR : enUS;

    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'days' | 'months' | 'years'>('days');

    const parsedDate = useMemo(() => {
        if (!value) return undefined;
        const d = new Date(value + "T00:00:00");
        return isNaN(d.getTime()) ? undefined : d;
    }, [value]);

    const [tempDate, setTempDate] = useState<Date | undefined>(undefined);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    const handleOpen = () => {
        setTempDate(parsedDate);
        setCurrentMonth(parsedDate || new Date());
        setView('days');
        setIsOpen(true);
    };

    const handleConfirm = () => {
        if (tempDate) {
            // Always output Gregorian YYYY-MM-DD for the database
            const year = tempDate.getFullYear();
            const month = String(tempDate.getMonth() + 1).padStart(2, "0");
            const day = String(tempDate.getDate()).padStart(2, "0");
            onChange(`${year}-${month}-${day}`);
        } else {
            onChange("");
        }
        setIsOpen(false);
    };

    const handleClear = () => {
        setTempDate(undefined);
        onChange("");
        setIsOpen(false);
    };

    const minDateObj = minDate ? new Date(minDate + "T00:00:00") : undefined;
    const maxDateObj = maxDate ? new Date(maxDate + "T00:00:00") : undefined;

    const disabledMatchers: Matcher[] = [];
    if (minDateObj) disabledMatchers.push({ before: minDateObj });
    if (maxDateObj) disabledMatchers.push({ after: maxDateObj });

    const displayValue = useMemo(() => {
        if (!parsedDate) return "";
        if (isFa) {
            // e.g., "۳۱ شهریور ۱۴۰۵"
            return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric', month: 'long', year: 'numeric' }).format(parsedDate);
        }
        try {
            return formatGregorian(parsedDate, "PPP", { locale: enUS });
        } catch {
            return value;
        }
    }, [parsedDate, value, isFa]);

    const handlePrev = () => {
        if (view === 'days') setCurrentMonth(subMonthsFn(currentMonth, 1));
        else if (view === 'months') setCurrentMonth(subYearsFn(currentMonth, 1));
        else if (view === 'years') setCurrentMonth(subYearsFn(currentMonth, 24));
    };

    const handleNext = () => {
        if (view === 'days') setCurrentMonth(addMonthsFn(currentMonth, 1));
        else if (view === 'months') setCurrentMonth(addYearsFn(currentMonth, 1));
        else if (view === 'years') setCurrentMonth(addYearsFn(currentMonth, 24));
    };

    const handleYearSelect = (year: number) => {
        setCurrentMonth(setYearFn(currentMonth, year));
        setView('months');
    };

    const handleMonthSelect = (monthIndex: number) => {
        setCurrentMonth(setMonthFn(currentMonth, monthIndex));
        setView('days');
    };

    const startYear = getYearFn(currentMonth) - 12;
    const years = Array.from({ length: 24 }, (_, i) => startYear + i);

    const headerLabel = useMemo(() => {
        if (view === 'days') {
            if (isFa) return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'long', year: 'numeric' }).format(currentMonth);
            return formatGregorian(currentMonth, "MMMM yyyy", { locale: enUS });
        }
        if (view === 'months') {
            if (isFa) return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric' }).format(currentMonth);
            return formatGregorian(currentMonth, "yyyy", { locale: enUS });
        }
        if (view === 'years') {
            const y = getYearFn(currentMonth);
            const start = y - 12;
            if (isFa) {
                // ✅ FIX: Added { useGrouping: false }
                const faNum = (n: number) => new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(n);
                return `${faNum(start)} - ${faNum(start + 23)}`;
            }
            return `${start} - ${start + 23}`;
        }
    }, [view, currentMonth, isFa, getYearFn]);

    return (
        <>
            <TextInput
                readOnly
                value={displayValue}
                onClick={handleOpen}
                placeholder={placeholder}
                className={`cursor-pointer pe-10 ${className || ""}`}
                error={error}
                disabled={disabled}
            >
            </TextInput>

            <ModalWrapper open={isOpen} onClose={() => setIsOpen(false)}>
                <ModalHeader title={t("actions.selectDate")} onClose={() => setIsOpen(false)} />

                <div className="flex flex-col mt-4">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <Button variant="ghost" size="icon-sm" onClick={handlePrev}>
                            <IconChevronLeft className="size-4 rtl:scale-x-[-1]" />
                        </Button>

                        <Button
                            onClick={() => setView(view === 'days' ? 'years' : 'days')}
                            size="md"
                            variant="ghost"
                            rightIcon={<IconChevronDown className={cn("size-4 transition-transform text-muted-foreground", view !== 'days' && "rotate-180")} />}
                        >
                            <Typography variant="md" weight="semibold" className="capitalize ">
                                {headerLabel}
                            </Typography>
                        </Button>

                        <Button variant="ghost" size="icon-sm" onClick={handleNext}>
                            <IconChevronRight className="size-4 rtl:scale-x-[-1]" />
                        </Button>
                    </div>

                    <div className="min-h-70">
                        {view === 'days' && (
                            <Picker
                                mode="single"
                                selected={tempDate}
                                onSelect={setTempDate}
                                month={currentMonth}
                                onMonthChange={setCurrentMonth}
                                locale={locale}
                                dir={isFa ? "rtl" : "ltr"}
                                disabled={disabledMatchers.length > 0 ? disabledMatchers : undefined}
                                hideNavigation
                                className="w-full rdp-custom"
                                components={{
                                    DayButton: CustomDayButton
                                }}
                            />
                        )}

                        {view === 'months' && (
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 12 }).map((_, i) => {
                                    const isCurrent = getMonthFn(currentMonth) === i;
                                    // ✅ FIX: Use setMonthGreg instead of setMonthGregorian
                                    const monthName = isFa
                                        ? SHAMSI_MONTHS[i]
                                        : formatGregorian(setMonthGreg(currentMonth, i), "MMM", { locale: enUS });

                                    return (
                                        <Button
                                            key={i}
                                            variant={isCurrent ? "primary-active" : "ghost"}
                                            size="md"
                                            onClick={() => handleMonthSelect(i)}
                                        >
                                            <Typography variant="sm" weight="medium">
                                                {monthName}
                                            </Typography>
                                        </Button>
                                    );
                                })}
                            </div>
                        )}

                        {view === 'years' && (
                            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto scrollbar-hide px-1">
                                {years.map((y) => {
                                    const isCurrent = getYearFn(currentMonth) === y;
                                    // ✅ FIX: Added { useGrouping: false }
                                    const displayY = isFa
                                        ? new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(y)
                                        : y;
                                    return (
                                        <Button
                                            key={y}
                                            variant={isCurrent ? "primary-active" : "ghost"}
                                            size="sm"
                                            onClick={() => handleYearSelect(y)}
                                        >
                                            <Typography variant="sm" weight="medium" className="">
                                                {displayY}
                                            </Typography>
                                        </Button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    {parsedDate && (
                        <Button onClick={handleClear} variant="ghost-destructive" size="md" className="flex-1">
                            {t("actions.clear")}
                        </Button>
                    )}
                    <Button onClick={handleConfirm} variant="primary" size="md" className="flex-1">
                        {t("actions.confirm")}
                    </Button>
                </div>
            </ModalWrapper>
        </>
    );
}
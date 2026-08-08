import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
    value: string | number;
    label: string | React.ReactNode;
}

interface CustomSelectProps {
    value: string | number;
    onChange: (value: string | number) => void;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
    buttonClassName?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}

export function CustomSelect({
    value,
    onChange,
    options,
    placeholder = "Pilih salah satu...",
    className = "",
    buttonClassName = "",
    icon,
    disabled = false,
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className={`relative w-full ${className}`} ref={dropdownRef}>
            {icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-slate-500 dark:text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-slate-100 transition-colors">
                    {icon}
                </div>
            )}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full ${buttonClassName || "bg-slate-50 dark:bg-[#13111C] rounded-xl py-3"} ${icon && !buttonClassName ? 'pl-11 pr-4' : (buttonClassName ? '' : 'px-4')} border ${
                    isOpen ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-200 dark:border-white/10"
                } font-['Manrope'] font-bold text-[13px] text-left transition-all flex items-center justify-between shadow-sm dark:shadow-none ${
                    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-indigo-300 dark:hover:border-white/20"
                }`}
                disabled={disabled}
            >
                <span className={selectedOption ? "text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-indigo-500" : ""}`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-[100] w-full mt-2 bg-white dark:bg-[#1C1A29] border border-slate-100 dark:border-white/10 rounded-xl shadow-lg py-1 max-h-60 overflow-auto animate-in fade-in slide-in-from-top-2">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 font-['Manrope'] text-[13px] font-bold flex items-center justify-between transition-colors ${
                                value === option.value
                                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                            }`}
                        >
                            <span>{option.label}</span>
                            {value === option.value && <Check className="w-4 h-4 text-indigo-500" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

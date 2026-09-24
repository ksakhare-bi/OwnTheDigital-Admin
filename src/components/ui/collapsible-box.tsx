"use client";

import { useState, type ReactNode } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type CollapsibleBoxProps = {
  title: string;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  badge?: ReactNode;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  id?: string;
};

export function CollapsibleBox({
  title,
  defaultOpen = true,
  isOpen: controlledIsOpen,
  onToggle,
  badge,
  subtitle,
  children,
  className,
  headerClassName,
  id,
}: CollapsibleBoxProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : internalOpen;

  const toggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen(!open);
    }
  };

  return (
    <div
      id={id}
      className={cn(
        "rounded-xl border border-zinc-200/90 bg-white shadow-xs transition-shadow duration-200 hover:shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Box Header Bar */}
      <div
        onClick={toggle}
        className={cn(
          "flex items-center justify-between px-5 py-3.5 bg-zinc-50/70 border-b border-zinc-150 cursor-pointer select-none transition-colors hover:bg-zinc-100/60",
          !open && "border-b-0",
          headerClassName
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <h3 className="text-sm font-bold text-zinc-800 tracking-tight">{title}</h3>
          {badge}
          {subtitle && (
            <span className="text-xs text-zinc-400 font-normal truncate hidden sm:inline">
              — {subtitle}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-700">
          <button
            type="button"
            aria-label={open ? "Collapse section" : "Expand section"}
            className="p-1 rounded hover:bg-zinc-200/60 transition-colors"
          >
            {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>
      </div>

      {/* Box Body */}
      {open && <div className="p-5 sm:p-6 space-y-4">{children}</div>}
    </div>
  );
}
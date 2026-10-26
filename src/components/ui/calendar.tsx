import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const WEEKDAY_LABELS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"]

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function isSameDay(a?: Date, b?: Date) {
  if (!a || !b) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// a < b comparando solo la fecha (sin hora)
function isBeforeDay(a: Date, b: Date) {
  return (
    a.getFullYear() < b.getFullYear() ||
    (a.getFullYear() === b.getFullYear() &&
      (a.getMonth() < b.getMonth() ||
        (a.getMonth() === b.getMonth() && a.getDate() < b.getDate())))
  )
}

// Grilla de 6 filas x 7 columnas (lunes a domingo), con celdas vacías para
// completar la semana del inicio y del fin del mes.
function buildMonthGrid(month: Date): (Date | null)[] {
  const first = startOfMonth(month)
  // getDay(): 0 = domingo ... 6 = sábado. Corremos el índice para que la
  // semana arranque en lunes.
  const leadingBlanks = (first.getDay() + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()

  const cells: (Date | null)[] = Array.from({ length: leadingBlanks }, () => null)
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day))
  }
  while (cells.length % 7 !== 0) {
    cells.push(null)
  }
  return cells
}

interface CalendarProps {
  month: Date
  onMonthChange: (month: Date) => void
  selected?: Date
  onSelect: (date: Date) => void
  fromDate?: Date
  toDate?: Date
  className?: string
}

export function Calendar({
  month,
  onMonthChange,
  selected,
  onSelect,
  fromDate,
  toDate,
  className,
}: CalendarProps) {
  const cells = React.useMemo(() => buildMonthGrid(month), [month])
  const today = React.useMemo(() => new Date(), [])

  const monthLabel = month.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  })

  const isDisabled = (date: Date) => {
    if (fromDate && isBeforeDay(date, fromDate)) return true
    if (toDate && isBeforeDay(toDate, date)) return true
    return false
  }

  return (
    <div className={cn("w-64 p-3", className)}>
      <div className="flex items-center justify-between pb-2">
        <button
          type="button"
          onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium capitalize">{monthLabel}</span>
        <button
          type="button"
          onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1 font-medium">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, idx) => {
          if (!date) return <div key={idx} />
          const disabled = isDisabled(date)
          const isSelected = isSameDay(date, selected)
          const isToday = isSameDay(date, today)
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(date)}
              className={cn(
                "h-8 w-8 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-30",
                isSelected &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                !isSelected && isToday && "border border-primary text-primary",
              )}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

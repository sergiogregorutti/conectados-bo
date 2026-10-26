import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  id?: string
  value?: string // "YYYY-MM-DD"
  onChange: (value: string) => void
  placeholder?: string
  min?: string // "YYYY-MM-DD", límite inferior habilitado
  max?: string // "YYYY-MM-DD", límite superior habilitado
  className?: string
}

// Parsea "YYYY-MM-DD" como fecha local (no UTC): evita que new Date("2026-10-24")
// se interprete como medianoche UTC y aparezca un día antes en husos negativos.
function parseLocalDate(value?: string): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  min,
  max,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = parseLocalDate(value)
  const [month, setMonth] = React.useState(selected ?? new Date())

  // Si el valor cambia desde afuera (ej. reset del form), el mes visible lo sigue.
  // Nota: no se incluye `selected` en las deps a propósito: es un Date nuevo en
  // cada render (derivado de `value`), así que entraría en loop si lo agregamos.
  React.useEffect(() => {
    if (selected) setMonth(selected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {selected
            ? selected.toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Calendar
          month={month}
          onMonthChange={setMonth}
          selected={selected}
          onSelect={(date) => {
            onChange(toIsoDate(date))
            setOpen(false)
          }}
          fromDate={parseLocalDate(min)}
          toDate={parseLocalDate(max)}
        />
      </PopoverContent>
    </Popover>
  )
}

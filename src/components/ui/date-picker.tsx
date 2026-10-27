import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { parseLocalDate, toIsoDate } from "@/lib/date"
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

import { cn } from '@/lib/utils'

interface DebatePostPreviewProps {
  imageUrls: string[]
}

// Mockup aproximado de PostCard/PhotoCarousel (aspectRatio 16:10, object-cover)
// para mostrar cómo se recorta la primera imagen dentro del feed de debate.
export function DebatePostPreview({ imageUrls }: DebatePostPreviewProps) {
  if (imageUrls.length === 0) return null

  return (
    <div className="mx-auto w-full max-w-xs overflow-hidden rounded-xl border bg-background shadow-sm">
      <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
        <img src={imageUrls[0]} alt="Vista previa" className="h-full w-full object-cover" />
      </div>
      <div className="space-y-1.5 p-3">
        <div className="h-2 w-3/4 rounded bg-muted" />
        <div className="h-2 w-1/2 rounded bg-muted" />
      </div>
      {imageUrls.length > 1 && (
        <div className="flex justify-center gap-1 pb-3">
          {imageUrls.map((_, index) => (
            <span
              key={index}
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                index === 0 ? 'bg-foreground' : 'bg-muted-foreground/30',
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

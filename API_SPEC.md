# API Specification - Admin Ads

Especificación de endpoints para el módulo de Ads del backoffice.

## Base URL

```
/api/admin/ads
```

## Autenticación

Todas las rutas requieren header `Authorization: Bearer <JWT>` con token de Supabase Auth.

---

## Modelo Ad

```typescript
interface Ad {
  id: string              // UUID
  title: string           // Nombre interno del ad
  type: 'banner' | 'interstitial'
  mediaType: 'image' | 'video'
  mediaUrl: string        // URL del asset (Supabase Storage)
  destinationUrl: string  // URL web al hacer click
  startsAt: string        // ISO 8601 datetime
  endsAt: string          // ISO 8601 datetime
  isActive: boolean       // Activo/inactivo manual
  priority: number        // 0-100, mayor = más prioridad
  swipeFrequency: number  // Mostrar cada X swipes
  impressions: number     // Contador de impresiones (read-only)
  clicks: number          // Contador de clicks (read-only)
  createdAt: string       // ISO 8601 datetime
  updatedAt: string       // ISO 8601 datetime
}
```

---

## Endpoints

### GET /api/admin/ads

Listar todos los ads con filtros y paginación.

**Query Parameters:**

| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| page | number | 1 | Número de página |
| limit | number | 10 | Items por página |
| type | string | - | Filtrar por tipo: `banner` \| `interstitial` |
| isActive | boolean | - | Filtrar por estado activo |
| search | string | - | Buscar en título |

**Ejemplo:** `GET /api/admin/ads?page=1&limit=10&type=banner&isActive=true&search=promo`

**Response 200:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Promo San Valentín",
      "type": "interstitial",
      "mediaType": "image",
      "mediaUrl": "https://storage.supabase.co/...",
      "destinationUrl": "https://example.com/promo",
      "startsAt": "2024-02-01T00:00:00Z",
      "endsAt": "2024-02-28T23:59:59Z",
      "isActive": true,
      "priority": 10,
      "swipeFrequency": 5,
      "impressions": 15420,
      "clicks": 892,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-20T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### GET /api/admin/ads/:id

Obtener un ad por ID.

**Response 200:**

```json
{
  "data": { ...Ad }
}
```

**Response 404:**

```json
{
  "error": "Ad not found"
}
```

---

### POST /api/admin/ads

Crear un nuevo ad.

**Request Body:**

```json
{
  "title": "string (required)",
  "type": "banner | interstitial (required)",
  "mediaType": "image | video (required)",
  "mediaUrl": "string URL (required)",
  "destinationUrl": "string URL (required)",
  "startsAt": "ISO 8601 datetime (required)",
  "endsAt": "ISO 8601 datetime (required)",
  "isActive": "boolean (default: false)",
  "priority": "number 0-100 (default: 0)",
  "swipeFrequency": "number >= 1 (required)"
}
```

**Response 201:**

```json
{
  "data": { ...Ad }
}
```

**Response 400:**

```json
{
  "error": "Validation error message"
}
```

---

### PATCH /api/admin/ads/:id

Actualizar un ad existente.

**Request Body:** (todos los campos son opcionales)

```json
{
  "title"?: "string",
  "type"?: "banner | interstitial",
  "mediaType"?: "image | video",
  "mediaUrl"?: "string URL",
  "destinationUrl"?: "string URL",
  "startsAt"?: "ISO 8601 datetime",
  "endsAt"?: "ISO 8601 datetime",
  "isActive"?: "boolean",
  "priority"?: "number 0-100",
  "swipeFrequency"?: "number >= 1"
}
```

**Response 200:**

```json
{
  "data": { ...Ad }
}
```

**Response 404:**

```json
{
  "error": "Ad not found"
}
```

---

### DELETE /api/admin/ads/:id

Eliminar un ad.

**Response 204:** No content

**Response 404:**

```json
{
  "error": "Ad not found"
}
```

---

### POST /api/admin/ads/:id/toggle

Alternar estado activo/inactivo de un ad.

**Response 200:**

```json
{
  "data": { ...Ad (con isActive actualizado) }
}
```

**Response 404:**

```json
{
  "error": "Ad not found"
}
```

---

## Notas de Implementación

1. **Validaciones:**
   - `title` no puede estar vacío
   - `mediaUrl` y `destinationUrl` deben ser URLs válidas
   - `priority` debe estar entre 0 y 100
   - `swipeFrequency` debe ser >= 1
   - `endsAt` debe ser posterior a `startsAt`

2. **Contadores:**
   - `impressions` y `clicks` son read-only desde el admin
   - Se incrementan desde endpoints separados usados por la app móvil

3. **Lógica de negocio:**
   - Un ad se muestra si: `isActive = true` AND `now() BETWEEN startsAt AND endsAt`
   - Si hay múltiples ads activos, se ordenan por `priority` DESC
   - Cada ad define su `swipeFrequency` (cada cuántos swipes aparece)

4. **Media:**
   - El admin sube media a Supabase Storage
   - `mediaUrl` es la URL pública del archivo subido

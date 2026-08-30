import type { PhotoItem, PhotoMeta } from '@/types/content'

const photoModules = import.meta.glob<string>(
  '@/content/photos/*.{jpg,jpeg,png,webp,gif,svg}',
  { query: '?url', eager: true, import: 'default' },
)

const metaModules = import.meta.glob<PhotoMeta>(
  '@/content/photos/*.json',
  { eager: true, import: 'default' },
)

const FILE_NAME_RE = /\/([^/]+)\.\w+$/

// '/src/content/photos/p-2026-08-30-10-00-00-000-1.jpg' -> 'p-2026-08-30-10-00-00-000-1'
function baseName(path: string) {
  return path.match(FILE_NAME_RE)?.[1] ?? path
}

export function toPhotos(
  images: Record<string, string>,
  sidecars: Record<string, PhotoMeta>,
): PhotoItem[] {
  const metas = new Map(
    Object.entries(sidecars).map(([path, meta]) => [baseName(path), meta]),
  )
  return Object.entries(images)
    .map(([path, url]): PhotoItem => ({
      ...metas.get(baseName(path)),
      name: baseName(path),
      url,
    }))
    .sort((a, b) => b.name.localeCompare(a.name, undefined, { numeric: true }))
}

export const photos = toPhotos(photoModules, metaModules)

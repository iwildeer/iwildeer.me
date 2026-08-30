import type { MediaItem } from '@/types/content'

interface MediaCategoryModule {
  items: MediaItem[]
}

const mediaModules = import.meta.glob<MediaCategoryModule>(
  '@/content/media/*.ts',
  { eager: true },
)

// '01-anime.ts' -> 'anime'; unprefixed names pass through unchanged.
const ORDER_PREFIX_RE = /^\d+-/
const FILE_NAME_RE = /\/([^/]+)\.ts$/

export function toMediaGroups(
  modules: Record<string, MediaCategoryModule>,
): Record<string, MediaItem[]> {
  return Object.fromEntries(
    Object.entries(modules)
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
      .map(([path, mod]) => [
        (path.match(FILE_NAME_RE)?.[1] ?? path).replace(ORDER_PREFIX_RE, ''),
        mod.items,
      ]),
  )
}

export const mediaGroups = toMediaGroups(mediaModules)

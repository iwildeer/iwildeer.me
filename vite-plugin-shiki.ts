import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { codeToHtml } from 'shiki'
import { findFencedCode } from './src/lib/fence.ts'
import { shikiThemes } from './src/lib/shiki.ts'

export function shikiHighlightPlugin(): Plugin {
  let root = process.cwd()
  return {
    name: 'shiki-highlight',
    enforce: 'pre',
    configResolved(config) {
      root = config.root
    },
    async load(id) {
      const queryIndex = id.indexOf('?')
      if (queryIndex === -1)
        return null
      let file = id.slice(0, queryIndex)
      const query = id.slice(queryIndex + 1)
      if (!file.endsWith('.md') || !query.split('&').includes('md-source'))
        return null
      // In dev, ids are root-relative (e.g. "/src/..."); in build/vitest they
      // are absolute. Normalize to an existing absolute path either way.
      if (!(path.isAbsolute(file) && existsSync(file)))
        file = path.resolve(root, file.replace(/^\//, ''))

      const raw = readFileSync(file, 'utf8')
      const blocks = findFencedCode(raw)

      const highlights: Record<string, string> = {}
      const replacements: Array<{ fullMatch: string; newFence: string }> = []
      let counter = 0

      for (const block of blocks) {
        if (!block.lang)
          continue
        try {
          const html = await codeToHtml(block.code, {
            lang: block.lang,
            themes: shikiThemes,
            defaultColor: false,
          })
          const blockId = String(counter++)
          highlights[blockId] = html
          replacements.push({
            fullMatch: block.fullMatch,
            newFence: '```shiki:' + blockId + '\n```',
          })
        }
        catch {
          // leave the original fence in place if Shiki cannot highlight it
        }
      }

      let source = raw
      for (const r of replacements)
        source = source.replace(r.fullMatch, () => r.newFence)

      return {
        code: `export const source = ${JSON.stringify(source)}\nexport const highlights = ${JSON.stringify(highlights)}\n`,
        map: null,
      }
    },
  }
}

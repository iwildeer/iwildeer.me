import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'
import { codeToHtml } from 'shiki'
import { findFencedCode } from './src/lib/fence.ts'
import { shikiThemes } from './src/lib/shiki.ts'

const QUERY = '?md-source'

export function shikiHighlightPlugin(): Plugin {
  return {
    name: 'shiki-highlight',
    async load(id) {
      if (!id.endsWith(QUERY))
        return null
      const file = id.slice(0, id.indexOf(QUERY))
      if (!file.endsWith('.md'))
        return null

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

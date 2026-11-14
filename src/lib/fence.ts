// `\n?` before the closing fence: empty code blocks ("```shiki:0\n```",
// the placeholders vite-plugin-shiki leaves in transformed sources) have no
// newline between the info line and the closing fence.
const FENCE_RE = /(`{3,})(\S*)[^\n]*\n([\s\S]*?)\n?\1/g

export interface FencedCode {
  fullMatch: string
  lang: string
  code: string
}

export function findFencedCode(body: string): FencedCode[] {
  const out: FencedCode[] = []
  for (const match of body.matchAll(FENCE_RE)) {
    out.push({
      fullMatch: match[0],
      lang: match[2] ?? '',
      code: match[3] ?? '',
    })
  }
  return out
}

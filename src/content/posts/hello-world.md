---
title: Hello World
description: First blog post on iwildeer
date: 2026-03-01
art: plum
---

Welcome to my blog! This site is built with React, Vite, and Markdown-driven content routing.

## Code example

```ts
import { getPublishedPosts } from '@/lib/content'

const posts = getPublishedPosts()
console.log(posts.length)
```

## Features

- File-based content routing with `import.meta.glob`
- GFM support (tables, task lists, ~~strikethrough~~)
- Syntax highlighting via `rehype-highlight`

| Feature | Status |
| --- | --- |
| Blog | Done |
| Projects | Done |
| 404 | Done |

- [x] Content routing automation
- [x] Dynamic SEO from frontmatter
- [ ] More posts coming soon

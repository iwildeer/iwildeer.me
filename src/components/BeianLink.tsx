import { AppLink } from '@/components/AppLink'

const ICP_URL = 'https://beian.miit.gov.cn'
const ICP_TEXT = '豫ICP备2026032120号-1'

const MPS_URL =
  'https://beian.mps.gov.cn/#/query/webSearch?code=41162302000109'
const MPS_TEXT = '豫公网安备41162302000109号'

export function BeianLink() {
  return (
    <span className="flex flex-col items-start leading-snug sm:inline-flex sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-1.5">
      <AppLink to={ICP_URL}>{ICP_TEXT}</AppLink>
      <span className="hidden sm:inline" aria-hidden="true">
        |
      </span>
      <AppLink to={MPS_URL} className="inline-flex items-center gap-1">
        <img
          src="/beian.png"
          alt=""
          width={16}
          height={16}
          className="size-4 shrink-0"
        />
        {MPS_TEXT}
      </AppLink>
    </span>
  )
}

import { AppLink } from '@/components/AppLink'

const ICP_URL = 'https://beian.miit.gov.cn'
const ICP_TEXT = '豫ICP备2026032120号-1'

const MPS_URL =
  'https://beian.mps.gov.cn/#/query/webSearch?code=41162302000109'
const MPS_TEXT = '豫公网安备41162302000109号'

export function BeianLink() {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5">
      <AppLink to={ICP_URL}>{ICP_TEXT}</AppLink>
      <span aria-hidden="true">|</span>
      <AppLink to={MPS_URL} className="inline-flex items-center gap-1">
        <img
          src="/beian.png"
          alt={MPS_TEXT}
          width={16}
          height={16}
          className="m-0 size-4 shrink-0"
        />
        {MPS_TEXT}
      </AppLink>
    </span>
  )
}

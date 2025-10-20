import { Button } from '@/components/ui/button'
import { FunctionCall } from '@yomo/viv'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { useState } from 'react'

export function FunctionCallBlock({ data }: { data: FunctionCall }) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  return (
    <div className="mb-4 flex w-full flex-col gap-3 rounded-lg border py-3">
      <div className="flex items-center gap-2 px-4">
        <CheckIcon className="size-4" />
        <p className="">
          Used tool: <b>{data?.name}</b>
        </p>
        <div className="flex-grow" />
        <Button onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </Button>
      </div>
      {!isCollapsed && (
        <div className="flex flex-col gap-2 border-t pt-2">
          <div className="px-4">
            <pre className="whitespace-pre-wrap text-secondary dark:text-secondary-foreground">
              {typeof data?.arguments === 'string'
                ? data?.arguments
                : JSON.stringify(data?.arguments, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

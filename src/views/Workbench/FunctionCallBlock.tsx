import { Button } from '@/components/ui/button'
import { FunctionCall, FunctionResultChunk } from '@yomo/viv'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { useState } from 'react'

interface FunctionCallBlockProps {
  data: FunctionCall
  result?: FunctionResultChunk
}

export function FunctionCallBlock({ data, result }: FunctionCallBlockProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  const parsedResult = (() => {
    if (!result?.result) return null
    try {
      return JSON.stringify(JSON.parse(result.result), null, 2)
    } catch {
      return result.result
    }
  })()

  return (
    <div className="mb-4 flex w-full flex-col gap-3 rounded-lg border py-3 text-[12px]">
      <div className="flex items-center gap-2 px-4">
        <CheckIcon className="size-3" />
        <p>
          Used tool: <b>{data?.name}</b>
        </p>
        <div className="flex-grow" />
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-6 px-2"
        >
          {isCollapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
        </Button>
      </div>
      {!isCollapsed && (
        <div className="flex flex-col gap-2 border-t pt-2">
          <div className="px-4">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              Arguments
            </p>
            <pre className="whitespace-pre-wrap text-secondary dark:text-secondary-foreground">
              {typeof data?.arguments === 'string'
                ? data?.arguments
                : JSON.stringify(data?.arguments, null, 2)}
            </pre>
          </div>
          {parsedResult !== null && (
            <div className="px-4 border-t pt-2">
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                Result
              </p>
              <pre className="whitespace-pre-wrap text-secondary dark:text-secondary-foreground">
                {parsedResult}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

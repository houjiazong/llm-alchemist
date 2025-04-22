import { WorkbenchItem } from './Item'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type ChangeEvent } from 'react'
import { type QAInfo } from '.'

interface WorkbenchListProps {
  data: QAInfo[]
  selectedIds: string[]
  isFormatOutput?: boolean
  onPromptChange: (id: string, e: ChangeEvent<HTMLTextAreaElement>) => void
  onExpectationChange: (id: string, e: ChangeEvent<HTMLTextAreaElement>) => void
  onRemove: (id: string) => void
  onSelect: (id: string) => void
  onRateChange: (id: string, rating: number) => void
  onRun: (id: string) => void
}

export function WorkbenchList({
  data,
  selectedIds,
  isFormatOutput,
  onPromptChange,
  onRemove,
  onSelect,
  onRateChange,
  onRun,
  onExpectationChange,
}: WorkbenchListProps) {
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 px-4">
        {data.map((qa, index) => (
          <WorkbenchItem
            index={index}
            item={qa}
            key={qa.id}
            isFormatOutput={isFormatOutput}
            onPromptChange={onPromptChange}
            onRemove={onRemove}
            onSelect={onSelect}
            selected={selectedIds.includes(qa.id)}
            onRateChange={onRateChange}
            onRun={onRun}
            onExpectationChange={onExpectationChange}
          />
        ))}
      </div>
    </ScrollArea>
  )
}

import Markdown from 'react-markdown'
import { CircleX, Clock, ClockArrowDown, Loader } from 'lucide-react'
import { type QA } from '@/db'
import { TextareaAutosize } from '@/components/ui/textarea-autosize'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { QAInfo } from '@/hooks/useWorkbench'
import { Checkbox } from '@/components/ui/checkbox'

interface QAItemProps {
  index: number
  qa: QA
  info: QAInfo
  selected: boolean
  onQuestionChange: (index: number, value: string) => void
  onQuestionRemove: (index: number) => void
  onRateChange: (index: number, value: number) => void
  onSelectChange: (id: string) => void
}
export const QAItem = ({
  index,
  qa,
  info,
  selected,
  onQuestionChange,
  onQuestionRemove,
  onRateChange,
  onSelectChange,
}: QAItemProps) => {
  return (
    <div className="flex group border-t" key={index}>
      <div className="w-[40px] text-center flex-shrink-0 flex-grow-0 p-2 border-r">
        {qa.question && (
          <Checkbox
            checked={selected}
            onCheckedChange={() => onSelectChange(qa.id)}
          />
        )}
      </div>
      <div className="w-[60px] text-center flex-shrink-0 flex-grow-0 p-2 border-r">
        {index + 1}
      </div>
      <div className="w-[200px] flex-shrink-0 flex-grow-0 p-2 border-r">
        <TextareaAutosize
          value={qa.question}
          onChange={(e) => onQuestionChange(index, e.target.value)}
          className="shadow-none border border-transparent text-sm px-2 py-0.5 text-muted-foreground hover:border-border resize-none"
        />
      </div>
      <div className="flex-1 p-2 border-r relative flex flex-col space-y-2">
        {info?.loading && (
          <div className="absolute right-2 top-2">
            {<Loader className="animate-spin w-4 h-4" />}
          </div>
        )}
        {qa.answer && (
          <Markdown className="prose prose-sm dark:prose-invert">
            {qa.answer}
          </Markdown>
        )}
        {info?.error && <div className="text-red-500">{info.error}</div>}
        <div className="flex space-x-2 text-gray-400 text-xs items-center">
          {info?.responseTime && (
            <div className="flex space-x-1 items-center">
              <ClockArrowDown className="w-4 h-4" />
              <span>Response Time: {info.responseTime.toFixed(0)}ms</span>
            </div>
          )}
          {info?.completionTime && (
            <div className="flex space-x-1 items-center">
              <Clock className="w-4 h-4" />
              <span>Completion Time: {info.completionTime.toFixed(0)}ms</span>
            </div>
          )}
        </div>
      </div>
      <div className="w-[100px] flex-shrink-0 flex-grow-0 p-2">
        {qa.question && qa.answer && (
          <Select
            value={`${qa.rate}`}
            onValueChange={(value) => onRateChange(index, Number(value))}
          >
            <SelectTrigger className="w-full h-6">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((item) => (
                <SelectItem key={item} value={`${item}`}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="w-[40px] flex-shrink-0 flex-grow-0 text-center p-2">
        <Button
          variant="ghost"
          size="icon"
          className={cn('hidden h-6 w-6', {
            'group-hover:inline-flex': !!qa.question,
          })}
          onClick={() => onQuestionRemove(index)}
        >
          <CircleX className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

QAItem.displayName = 'QAItem'

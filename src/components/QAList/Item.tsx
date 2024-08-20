import Markdown from 'react-markdown'
import { CircleX, Loader } from 'lucide-react'
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

interface QAItemProps {
  index: number
  qa: QA
  loading: boolean
  onQuestionChange: (index: number, value: string) => void
  onQuestionRemove: (index: number) => void
  onRateChange: (index: number, value: number) => void
}
export const QAItem = ({
  index,
  qa,
  loading,
  onQuestionChange,
  onQuestionRemove,
  onRateChange,
}: QAItemProps) => {
  return (
    <div className="flex group border-t" key={index}>
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
      <div className="flex-1 p-2 border-r">
        {loading && <div>{<Loader className="animate-spin w-4 h-4" />}</div>}
        <Markdown className="prose prose-sm dark:prose-invert">
          {qa.answer}
        </Markdown>
      </div>
      <div className="w-[100px] flex-shrink-0 flex-grow-0 p-2 border-r">
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
      <div className="w-[60px] flex-shrink-0 flex-grow-0 text-center p-2">
        <Button
          variant="ghost"
          size="icon"
          className={cn('hidden h-6 w-6', {
            'group-hover:inline-flex': true,
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

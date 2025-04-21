import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { TextareaAutosize } from '@/components/ui/textarea-autosize'
import { type QA } from '@/db'
import { PlayIcon, TrashIcon } from 'lucide-react'
import { type ChangeEvent } from 'react'

interface WorkbenchItemProps {
  item: QA
  index: number
  onPromptChange: (id: string, e: ChangeEvent<HTMLTextAreaElement>) => void
}

export function WorkbenchItem({
  item,
  index,
  onPromptChange,
}: WorkbenchItemProps) {
  return (
    <div className="items-start gap-4 rounded-lg border text-left text-sm transition-all hover:bg-accent/30 grid grid-cols-6 shadow-sm">
      <div className="col-span-6 sticky top-0 bg-accent/40 h-[48px] backdrop-blur-sm z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{index + 1}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox />
          <Button size="icon" variant="outline">
            <PlayIcon />
          </Button>
          <Button size="icon" variant="outline">
            <TrashIcon />
          </Button>
        </div>
      </div>
      <div className="col-span-2 sticky top-[56px] pl-4 pb-4">
        <div className="space-y-3">
          <div>
            <Badge
              variant="outline"
              className="font-medium bg-primary/10 text-primary hover:bg-primary/20"
            >
              Prompt
            </Badge>
          </div>
          <div>
            <TextareaAutosize
              className="w-full shadow-none border text-sm px-3 py-2 text-foreground hover:border-border focus:border-secondary/50 transition-colors resize-none"
              value={item.question}
              onChange={(e) => onPromptChange(item.id, e)}
              placeholder="Write your prompt here..."
              minRows={3}
              maxRows={6}
            />
          </div>
          <div>
            <Badge
              variant="outline"
              className="font-medium bg-primary/10 text-primary hover:bg-primary/20"
            >
              Expectation
            </Badge>
          </div>
          <div>
            <TextareaAutosize
              className="w-full shadow-none border text-sm px-3 py-2 text-foreground hover:border-border focus:border-secondary/50 transition-colors resize-none"
              placeholder="Write your expectation here..."
              minRows={3}
              maxRows={6}
            />
          </div>
        </div>
      </div>
      <div className="col-span-4 sticky top-[56px] pr-4 pb-4">
        <div className="space-y-3">
          <div>
            <Badge
              variant="outline"
              className="font-medium bg-muted/50 text-muted-foreground hover:bg-muted"
            >
              Results
            </Badge>
          </div>
          <div className="rounded-md border border-dashed p-6 flex items-center justify-center bg-muted/5">
            <p className="text-muted-foreground">{item.answer}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

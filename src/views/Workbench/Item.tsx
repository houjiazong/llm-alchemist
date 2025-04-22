import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { TextareaAutosize } from '@/components/ui/textarea-autosize'
import { isEmpty, isNil } from 'es-toolkit/compat'
import { CheckIcon, Loader2, PlayIcon, TrashIcon, XIcon } from 'lucide-react'
import { type ChangeEvent } from 'react'
import { Ratings } from '@/components/Ratings'
import { type QAInfo } from '.'
import { WorkbenchItemOutput } from './Output'

interface WorkbenchItemProps {
  item: QAInfo
  index: number
  selected?: boolean
  isFormatOutput?: boolean
  onPromptChange: (id: string, e: ChangeEvent<HTMLTextAreaElement>) => void
  onRemove: (id: string) => void
  onSelect: (id: string) => void
  onRateChange: (id: string, rating: number) => void
  onRun: (id: string) => void
  onExpectationChange: (id: string, e: ChangeEvent<HTMLTextAreaElement>) => void
}

export function WorkbenchItem({
  item,
  index,
  selected = false,
  isFormatOutput,
  onPromptChange,
  onRemove,
  onSelect,
  onRateChange,
  onRun,
  // onExpectationChange,
}: WorkbenchItemProps) {
  const noAnswer = isEmpty(item.answer) || isNil(item.answer)
  const noQuestion = isEmpty(item.question) || isNil(item.question)
  const loading = item._extraInfo?.loading

  let expectationResult: { pass?: boolean } | null = null

  try {
    if (item.expectationResult) {
      expectationResult = JSON.parse(item.expectationResult)
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    /* empty */
  }

  return (
    <div className="items-start gap-4 rounded-lg border text-left text-sm transition-all hover:bg-accent/30 grid grid-cols-6 shadow-sm">
      <div className="col-span-6 sticky top-0 bg-accent/40 h-[48px] backdrop-blur-sm z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-bold">
            {index + 1}
          </Badge>
        </div>
        {(!noQuestion || !noAnswer) && (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selected}
              onCheckedChange={() => onSelect(item.id)}
            />
            <Button
              size="icon"
              variant="outline"
              disabled={loading}
              onClick={() => onRun(item.id)}
            >
              {loading ? <Loader2 className="animate-spin" /> : <PlayIcon />}
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => onRemove(item.id)}
              disabled={loading}
            >
              <TrashIcon />
            </Button>
          </div>
        )}
      </div>
      <div className="col-span-2 sticky top-[56px] pl-4 pb-4">
        <div className="space-y-3">
          <div>
            <Badge
              variant="outline"
              className="font-semibold bg-primary/10 text-primary hover:bg-primary/20"
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
              disabled={loading}
            />
          </div>
          {/* <div>
            <Badge
              variant="outline"
              className="font-semibold bg-primary/10 text-primary hover:bg-primary/20"
            >
              Expectation
            </Badge>
          </div>
          <div>
            <TextareaAutosize
              className="w-full shadow-none border text-sm px-3 py-2 text-foreground hover:border-border focus:border-secondary/50 transition-colors resize-none"
              value={item.expectation}
              onChange={(e) => onExpectationChange(item.id, e)}
              placeholder="Write your expectation here..."
              minRows={3}
              maxRows={6}
              disabled={loading}
            />
          </div> */}
        </div>
      </div>
      <div className="col-span-4 sticky top-[56px] pr-4 pb-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="font-semibold bg-primary/10 text-primary hover:bg-primary/20"
              >
                Output
              </Badge>
              <Ratings
                rating={Number(item.rate) || 0}
                totalStars={5}
                size={14}
                onRatingChange={(val) => onRateChange(item.id, val)}
                disabled={loading}
              />
            </div>
            {expectationResult && (
              <div className="flex items-center gap-2">
                <span>PASS:</span>
                {expectationResult.pass === true && (
                  <div className="flex items-center justify-center rounded-full bg-green-600 w-6 h-6">
                    <CheckIcon className="w-4 h-4" />
                  </div>
                )}
                {expectationResult.pass === false && (
                  <div className="flex items-center justify-center rounded-full bg-red-600 w-6 h-6">
                    <XIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            )}
          </div>
          <WorkbenchItemOutput item={item} isFormatOutput={isFormatOutput} />
        </div>
      </div>
    </div>
  )
}

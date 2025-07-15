import { Ratings } from '@/components/Ratings'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { TextareaAutosize } from '@/components/ui/textarea-autosize'
import { OpenAIOptions, type QA } from '@/db'
import { isEmpty, isEqual, isNil } from 'es-toolkit/compat'
import {
  ChevronsLeftRightEllipsisIcon,
  CircleXIcon,
  ClockIcon,
  InboxIcon,
  Loader2Icon,
  PlayIcon,
  SparklesIcon,
  TrashIcon,
} from 'lucide-react'
import OpenAI from 'openai'
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import { motion } from 'motion/react'
import { Message } from './Message'
import numeral from 'numeral'
import { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions.mjs'

interface WorkbenchItemProps {
  index: number
  client: OpenAI
  clientOptions: OpenAIOptions | undefined
  item: QA
  checked?: boolean
  handleCheck: (checked: boolean) => void
  handleRemove: () => void
  handleUpdateItemToDB: (item: QA) => void
  handleUpdateLoading: (loading: boolean) => void
  formatOutput?: boolean
}

export interface WorkbenchItemRef {
  run: () => void
}

const formatNum = (num: number | null | undefined, suffix?: string) => {
  if (isNil(num)) return '--'
  let ret = numeral(num).format('0,0.[00]')
  if (suffix) ret += suffix
  return ret
}

const Item = forwardRef<WorkbenchItemRef, WorkbenchItemProps>(
  (
    {
      index,
      client,
      clientOptions,
      item,
      checked,
      handleCheck,
      handleRemove,
      handleUpdateItemToDB,
      handleUpdateLoading,
      formatOutput,
    },
    ref
  ) => {
    const [answer, setAnswer] = useState<string | undefined>(item.answer)
    const [question, setQuestion] = useState<string | undefined>(item.question)

    const [loading, setLoading] = useState(false)
    const [finished, setFinished] = useState(true)
    const [ttft, setTTFT] = useState<number | null>(null)
    const [completion, setCompletion] = useState<number | null>(null)

    const [promptTokens, setPromptTokens] = useState<number | undefined>(
      item.usage?.prompt_tokens
    )
    const [completionTokens, setCompletionTokens] = useState<
      number | undefined
    >(item.usage?.completion_tokens)
    const [totalTokens, setTotalTokens] = useState<number | undefined>(
      item.usage?.total_tokens
    )

    const noAnswer = isEmpty(answer) || isNil(answer)
    const noQuestion = isEmpty(question) || isNil(question)

    const [error, setError] = useState('')

    useEffect(() => {
      setQuestion(item.question)
    }, [item.question])

    const run = useCallback(async () => {
      if (noQuestion) return
      setLoading(true)
      handleUpdateLoading(true)
      setFinished(false)
      setAnswer('')
      const body: ChatCompletionCreateParamsBase = {
        messages: [
          {
            role: 'user',
            content: question as string,
          },
        ],
        temperature: clientOptions?.params.temperature,
        model: clientOptions?.params.model ?? '',
      }
      if (clientOptions?.params.model) {
        body.model = clientOptions?.params.model
      }
      if (clientOptions?.params.max_tokens) {
        body.max_completion_tokens = clientOptions?.params.max_tokens
      }
      try {
        if (clientOptions?.params.stream) {
          const startTime = performance.now()
          let isFirstToken = true
          const response = await client.chat.completions.create({
            ...body,
            stream: true,
          })
          let _answer = ''
          let _prompt_tokens
          let _completion_tokens
          let _total_tokens
          for await (const chunk of response) {
            const now = performance.now()
            if (isFirstToken) {
              isFirstToken = false
              setTTFT(now - startTime)
            }
            const content = chunk.choices?.[0]?.delta?.content || ''
            if (content) {
              _answer += content
              setAnswer(_answer)
            }
            if (chunk.usage) {
              _prompt_tokens = chunk?.usage?.prompt_tokens
              _completion_tokens = chunk?.usage?.completion_tokens
              _total_tokens = chunk?.usage?.total_tokens
              setPromptTokens(_prompt_tokens)
              setCompletionTokens(_completion_tokens)
              setTotalTokens(_total_tokens)
            }
          }
          setCompletion(performance.now() - startTime)

          handleUpdateItemToDB({
            ...item,
            answer: _answer,
            usage: {
              prompt_tokens: _prompt_tokens,
              completion_tokens: _completion_tokens,
              total_tokens: _total_tokens,
            },
          })
        } else {
          const startTime = performance.now()
          const response = await client.chat.completions.create({
            ...body,
            stream: false,
          })
          const endTime = performance.now() - startTime
          setTTFT(endTime)
          setCompletion(endTime)

          const answer = response.choices[0].message.content || ''
          const prompt_tokens = response.usage?.prompt_tokens
          const completion_tokens = response.usage?.completion_tokens
          const total_tokens = response.usage?.total_tokens

          setAnswer(response.choices[0].message.content || '')
          setPromptTokens(prompt_tokens)
          setCompletionTokens(completion_tokens)
          setTotalTokens(total_tokens)

          handleUpdateItemToDB({
            ...item,
            answer,
            usage: {
              prompt_tokens,
              completion_tokens,
              total_tokens,
            },
          })
        }
      } catch (error) {
        if (error instanceof OpenAI.RateLimitError) {
          setError('Rate limit exceeded. Please try again later.')
        } else if (error instanceof OpenAI.AuthenticationError) {
          setError('Authentication failed. Check your API key.')
        } else if (error instanceof OpenAI.APIError) {
          setError(`API Error: ${error.message}`)
        } else {
          setError('An unexpected error occurred')
        }
        console.error(error)
      } finally {
        setLoading(false)
        handleUpdateLoading(false)
        setFinished(true)
      }
    }, [
      client.chat.completions,
      clientOptions?.params.max_tokens,
      clientOptions?.params.model,
      clientOptions?.params.stream,
      clientOptions?.params.temperature,
      handleUpdateItemToDB,
      handleUpdateLoading,
      item,
      noQuestion,
      question,
    ])

    const check = useCallback(() => {
      handleCheck(!checked)
    }, [checked, handleCheck])

    useImperativeHandle(ref, () => ({
      run,
    }))

    const renderContent = () => {
      if (!noAnswer) {
        return (
          <motion.div
            key="answer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {formatOutput ? (
              <Message
                key={item.id}
                message={answer}
                isStreamFinished={finished}
              />
            ) : (
              <p>{answer}</p>
            )}
          </motion.div>
        )
      }
      if (loading) {
        return (
          <div className="text-muted-foreground flex flex-col items-center gap-2">
            <motion.div
              key="loadingIcon"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <Loader2Icon className="w-6 h-6 animate-spin" />
            </motion.div>
          </div>
        )
      }
      if (error) {
        return (
          <div className="text-muted-foreground flex flex-col items-center gap-2">
            <motion.div
              key="errorIcon"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center text-destructive dark:text-red-800"
            >
              <CircleXIcon className="w-6 h-6" />
            </motion.div>
            <motion.p
              key="errorTip"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="text-destructive dark:text-red-800"
            >
              {error}
            </motion.p>
          </div>
        )
      }
      if (noQuestion) {
        return (
          <div className="text-muted-foreground flex flex-col items-center gap-2">
            <motion.div
              key="questionEmptyIcon"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-12 h-12 border rounded-lg flex items-center justify-center"
            >
              <InboxIcon />
            </motion.div>
            <motion.p
              key="questionEmptyTip"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              Add your ingredients (Prompt), and trigger the ritual (Run).
            </motion.p>
          </div>
        )
      }
      return (
        <div className="text-muted-foreground flex flex-col items-center gap-2">
          <motion.div
            key="answerEmptyIcon"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-12 h-12 border rounded-lg flex items-center justify-center"
          >
            <SparklesIcon />
          </motion.div>
          <motion.p
            key="answerEmptyTip"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            Your alchemical experiment is ready—start the synthesis with Run.
          </motion.p>
        </div>
      )
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
              <Checkbox checked={checked} onCheckedChange={check} />
              <Button
                size="icon"
                variant="outline"
                disabled={loading}
                onClick={run}
              >
                {loading ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <PlayIcon />
                )}
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={handleRemove}
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
                onChange={(e) =>
                  handleUpdateItemToDB({
                    ...item,
                    question: e.target.value,
                  })
                }
                placeholder="Write your prompt here..."
                minRows={3}
                maxRows={6}
                disabled={loading}
              />
            </div>
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
                  onRatingChange={(val) => {
                    handleUpdateItemToDB({
                      ...item,
                      rate: val,
                    })
                  }}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="rounded-md border border-dashed p-4 bg-muted/5">
              {renderContent()}
            </div>
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <ChevronsLeftRightEllipsisIcon className="w-4 h-4" />
                <div className="space-x-1">
                  <span className="text-muted-foreground">Prompt:</span>
                  <span>{formatNum(promptTokens)}</span>
                </div>
                <div className="space-x-1">
                  <span className="text-muted-foreground">Completion:</span>
                  <span>{formatNum(completionTokens)}</span>
                </div>
                <div className="space-x-1">
                  <span className="text-muted-foreground">Total:</span>
                  <span>{formatNum(totalTokens)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                <div className="space-x-1">
                  <span className="text-muted-foreground">TTFT:</span>
                  <span>{formatNum(ttft, 'ms')}</span>
                </div>
                <div className="space-x-1">
                  <span className="text-muted-foreground">Completion:</span>
                  <span>{formatNum(completion, 'ms')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

export const WorkbenchItem = memo(Item, (props, nextProps) => {
  return (
    props.index === nextProps.index &&
    props.client === nextProps.client &&
    isEqual(props.clientOptions, nextProps.clientOptions) &&
    isEqual(props.item, nextProps.item) &&
    props.checked === nextProps.checked &&
    props.formatOutput === nextProps.formatOutput
  )
})

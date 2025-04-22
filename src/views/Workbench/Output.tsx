import {
  ChevronsLeftRightEllipsisIcon,
  ClockIcon,
  InboxIcon,
  SparklesIcon,
} from 'lucide-react'
import { motion } from 'motion/react'
import { type QAInfo } from '.'
import { isEmpty, isNil } from 'es-toolkit/compat'
import numeral from 'numeral'
import { Markdown } from './Markdown'

interface WorkbenchItemOutputProps {
  item: QAInfo
  isFormatOutput?: boolean
}

export function WorkbenchItemOutput({
  item,
  isFormatOutput = true,
}: WorkbenchItemOutputProps) {
  const noAnswer = isEmpty(item.answer) || isNil(item.answer)
  const noQuestion = isEmpty(item.question) || isNil(item.question)
  const getContent = () => {
    if (!noAnswer) {
      return (
        <motion.div
          key="answer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {isFormatOutput ? (
            <Markdown>{item.answer as string}</Markdown>
          ) : (
            <p>{item.answer}</p>
          )}
        </motion.div>
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

  const formatNum = (num: number | null | undefined, suffix?: string) => {
    if (isNil(num)) return '--'
    let fmt = '0,0.[00]'
    if (suffix) fmt += suffix
    return numeral(num).format(fmt)
  }

  return (
    <>
      <div className="rounded-md border border-dashed p-4 bg-muted/5">
        {getContent()}
      </div>
      <div className="text-sm space-y-2">
        <div className="flex items-center gap-2">
          <ChevronsLeftRightEllipsisIcon className="w-4 h-4" />
          <div className="space-x-1">
            <span className="text-muted-foreground">Prompt:</span>
            <span>{formatNum(item?.usage?.prompt_tokens)}</span>
          </div>
          <div className="space-x-1">
            <span className="text-muted-foreground">Completion:</span>
            <span>{formatNum(item?.usage?.completion_tokens)}</span>
          </div>
          <div className="space-x-1">
            <span className="text-muted-foreground">Total:</span>
            <span>{formatNum(item?.usage?.total_tokens)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4" />
          <div className="space-x-1">
            <span className="text-muted-foreground">TTFT:</span>
            <span>{formatNum(item?._extraInfo?.ttft, 'ms')}</span>
          </div>
          <div className="space-x-1">
            <span className="text-muted-foreground">Completion:</span>
            <span>{formatNum(item?._extraInfo?.completion, 'ms')}</span>
          </div>
        </div>
      </div>
    </>
  )
}

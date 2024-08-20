import { QA } from '@/db'
import { QAItem } from './Item'

interface QAListProps {
  qas: QA[]
  loading: boolean[]
  onQuestionChange: (index: number, question: string) => void
  onQuestionRemove: (index: number) => void
  onRateChange: (index: number, rate: number) => void
}
export const QAList = ({
  qas,
  loading,
  onQuestionChange,
  onQuestionRemove,
  onRateChange,
}: QAListProps) => {
  return (
    <>
      <div className="flex">
        <div className="w-[60px] text-center flex-shrink-0 flex-grow-0 p-2 border-r">
          Seq
        </div>
        <div className="w-[200px] flex-shrink-0 flex-grow-0 p-2 border-r">
          Question
        </div>
        <div className="flex-1 p-2 border-r">Answer</div>
        <div className="w-[100px] flex-shrink-0 flex-grow-0 p-2 border-r">
          Rate
        </div>
        <div className="w-[60px] flex-shrink-0 flex-grow-0 p-2"></div>
      </div>
      <div>
        {qas.map((qa, index) => {
          return (
            <QAItem
              key={index}
              index={index}
              qa={qa}
              loading={loading[index]}
              onQuestionChange={onQuestionChange}
              onQuestionRemove={onQuestionRemove}
              onRateChange={onRateChange}
            />
          )
        })}
      </div>
    </>
  )
}

QAList.disPlayName = 'QAList'

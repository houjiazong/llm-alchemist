import { QA } from '@/db'
import { QAItem } from './Item'
import { QAInfo } from '@/hooks/useWorkbench'

interface QAListProps {
  qas: QA[]
  infos: Record<string, QAInfo>
  selectIds: string[]
  onQuestionChange: (index: number, question: string) => void
  onQuestionRemove: (index: number) => void
  onRateChange: (index: number, rate: number) => void
  onSelectChange: (id: string) => void
}
export const QAList = ({
  qas,
  infos,
  selectIds,
  onQuestionChange,
  onQuestionRemove,
  onRateChange,
  onSelectChange,
}: QAListProps) => {
  return (
    <>
      <div className="flex">
        <div className="w-[40px] text-center flex-shrink-0 flex-grow-0 p-2 border-r"></div>
        <div className="w-[60px] text-center flex-shrink-0 flex-grow-0 p-2 border-r">
          Seq
        </div>
        <div className="w-[200px] flex-shrink-0 flex-grow-0 p-2 border-r">
          Question
        </div>
        <div className="flex-1 p-2 border-r">Answer</div>
        <div className="w-[100px] flex-shrink-0 flex-grow-0 p-2">Rate</div>
        <div className="w-[40px] flex-shrink-0 flex-grow-0 p-2"></div>
      </div>
      <div>
        {qas.map((qa, index) => {
          return (
            <QAItem
              key={index}
              index={index}
              qa={qa}
              info={infos[qa.id]}
              selected={selectIds.includes(qa.id)}
              onQuestionChange={onQuestionChange}
              onQuestionRemove={onQuestionRemove}
              onRateChange={onRateChange}
              onSelectChange={onSelectChange}
            />
          )
        })}
      </div>
    </>
  )
}

QAList.disPlayName = 'QAList'

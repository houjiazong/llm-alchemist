import { Loader, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkbench } from '@/hooks/useWorkbench'
import { QAList } from '@/components/QAList'

export const TaskWorkbench = () => {
  const {
    infos,
    someLoading,
    task,
    qas,
    selectIds,
    onQuestionChange,
    onQuestionRemove,
    onRateChange,
    onRun,
    onSelectChange,
  } = useWorkbench()
  if (!task) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="animate-spin" />
      </div>
    )
  }
  return (
    <div className="space-y-2">
      <div className="text-right">
        <Button onClick={onRun} disabled={someLoading}>
          {someLoading ? (
            <Loader className="animate-spin w-4 h-4 mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          {selectIds.length > 0 ? 'Run Selected' : 'Run All'}
        </Button>
      </div>
      <div className="rounded-md border">
        <QAList
          qas={qas}
          infos={infos}
          selectIds={selectIds}
          onQuestionChange={onQuestionChange}
          onQuestionRemove={onQuestionRemove}
          onRateChange={onRateChange}
          onSelectChange={onSelectChange}
        />
      </div>
    </div>
  )
}

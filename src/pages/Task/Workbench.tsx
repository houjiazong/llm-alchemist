import { Loader, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkbench } from '@/hooks/useWorkbench'
import { QAList } from '@/components/QAList'

export const TaskWorkbench = () => {
  const {
    loading,
    someLoading,
    task,
    qas,
    onQuestionChange,
    onQuestionRemove,
    onRateChange,
    onRunAll,
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
        <Button onClick={onRunAll} disabled={someLoading}>
          {someLoading ? (
            <Loader className="animate-spin w-4 h-4 mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Run All
        </Button>
      </div>
      <div className="rounded-md border">
        <QAList
          qas={qas}
          loading={loading}
          onQuestionChange={onQuestionChange}
          onQuestionRemove={onQuestionRemove}
          onRateChange={onRateChange}
        />
      </div>
    </div>
  )
}

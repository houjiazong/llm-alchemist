import { FileDownIcon } from 'lucide-react'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { useToast } from './ui/use-toast'
import { db } from '@/db'
import { useLiveQuery } from 'dexie-react-hooks'
import saveAs from 'file-saver'

export function TaskExport({ taskId }: { taskId?: string }) {
  const { toast } = useToast()
  const currentTask = useLiveQuery(
    () => db.tasks.where({ id: taskId || '' }).first(),
    [taskId]
  )

  const handleExport = async () => {
    if (!currentTask) {
      return toast({
        variant: 'destructive',
        description: 'No task selected!',
      })
    }
    const transformedTask = {
      name: currentTask.name ?? '',
      desc: currentTask.desc ?? '',
      workbench: (currentTask.qas || []).map((item) => {
        return {
          question: item.question,
        }
      }),
      settings: {
        apiKey: currentTask.openAIOptions?.apiKey ?? '',
        baseURL: currentTask.openAIOptions?.baseURL ?? '',
        params: {
          max_tokens: currentTask.openAIOptions?.params?.max_tokens ?? '',
          model: currentTask.openAIOptions?.params?.model ?? '',
          prompt: currentTask.openAIOptions?.params?.prompt ?? '',
          stream: currentTask.openAIOptions?.params?.stream ?? true,
          temperature: currentTask.openAIOptions?.params?.temperature ?? '',
        },
      },
    }
    const blob = new Blob([JSON.stringify(transformedTask, null, 2)], {
      type: 'application/json',
    })
    saveAs(blob, `${transformedTask.name}-config.json`)
  }
  return (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="outline" size="icon">
          <FileDownIcon
            className="h-[1.2rem] w-[1.2rem]"
            onClick={handleExport}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>Export the current task configuration.</p>
      </TooltipContent>
    </Tooltip>
  )
}

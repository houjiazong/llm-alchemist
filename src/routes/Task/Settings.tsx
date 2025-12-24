import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import { OpenAIConfigForm, type OpenAIConfig } from '@/views/OpenAIConfigForm'
import { Badge } from '@/components/ui/badge'
import { useParams } from 'react-router-dom'
import { getTaskIdFromRouteParams } from '@/lib/utils'
export const TaskSettings = () => {
  const params = useParams()
  const task = useLiveQuery(() => {
    return db.tasks.get(getTaskIdFromRouteParams(params))
  }, [params.taskId])
  const savedOpenAIOptions = task?.openAIOptions
  const modelLabel = savedOpenAIOptions?.params?.model || 'default'
  const handleSubmit = async (values: OpenAIConfig) => {
    await db.tasks.update(getTaskIdFromRouteParams(params), {
      openAIOptions: values,
    })
  }
  return (
    <div className="min-h-full bg-background">
      <div className="container max-w-5xl py-10 space-y-6">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              API Settings
            </h1>
            <Badge className="rounded-full bg-foreground text-background text-xs font-medium px-2.5 py-1">
              {modelLabel}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure the model endpoint, credentials, and runtime parameters
            for this task.
          </p>
        </header>
        <OpenAIConfigForm
          category={task?.category}
          value={savedOpenAIOptions}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}

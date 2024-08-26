import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import {
  OpenAIConfigForm,
  type OpenAIConfig,
} from '@/components/OpenAIConfigForm'
import { useParams } from 'react-router-dom'
import { getTaskIdFromRouteParams } from '@/lib/utils'
export const TaskSettings = () => {
  const params = useParams()
  const task = useLiveQuery(() => {
    return db.tasks.get(getTaskIdFromRouteParams(params))
  }, [params.taskId])
  const savedOpenAIOptions = task?.openAIOptions
  const handleSubmit = async (values: OpenAIConfig) => {
    await db.tasks.update(getTaskIdFromRouteParams(params), {
      openAIOptions: values,
    })
  }
  return <OpenAIConfigForm value={savedOpenAIOptions} onSubmit={handleSubmit} />
}

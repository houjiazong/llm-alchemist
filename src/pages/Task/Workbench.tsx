import { db } from '@/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { Loader } from 'lucide-react'
import { useParams } from 'react-router-dom'

export const TaskWorkbench = () => {
  const params = useParams()
  const task = useLiveQuery(async () => {
    const task = await db.tasks.get(Number(params.taskId))
    return task
  })
  if (!task)
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="animate-spin" />
      </div>
    )
  return <div>Workbench</div>
}

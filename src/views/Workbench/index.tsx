import { db } from '@/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { WorkbenchList } from './List'
import { isNil } from 'es-toolkit/compat'

interface WorkbenchProps {
  taskId: string
}

export function Workbench({ taskId }: WorkbenchProps) {
  const task = useLiveQuery(() => db.tasks.get(taskId), [taskId])

  if (isNil(task?.id)) return null

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 h-0">
        <WorkbenchList data={task.qas} />
      </div>
    </div>
  )
}

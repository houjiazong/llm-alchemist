import { Button } from '@/components/ui/button'
import { db } from '@/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { Loader } from 'lucide-react'

export const Tasks = () => {
  const tasks = useLiveQuery(() => db.tasks.toArray())
  if (!tasks)
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    )
  if (tasks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">No Tasks yet</h1>
        <p className="text-muted-foreground">
          Add a task by clicking the button below
        </p>
        <div className="mt-2">
          <Button>Configure now</Button>
        </div>
      </div>
    )
  }
  return <div>Tasks</div>
}

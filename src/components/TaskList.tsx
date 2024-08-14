import { db } from '@/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { CircleX, Loader } from 'lucide-react'
import dayjs from 'dayjs'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

export const TaskList = () => {
  const tasks = useLiveQuery(() => db.tasks.toArray())
  if (!tasks) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    )
  }
  if (tasks.length === 0) {
    return (
      <div className="text-muted-foreground h-full flex items-center justify-center">
        No results.
      </div>
    )
  }

  const removeTask = async (id: number) => {
    await db.tasks.delete(id)
  }

  return (
    <ScrollArea className="h-full">
      <div className="h-full py-8 space-y-3">
        {tasks.map((task) => {
          return (
            <Card key={task.id} className="group cursor-pointer">
              <CardHeader className="p-2">
                <CardTitle className="text-md flex">
                  <span className="flex-1 truncate">{task.name}</span>
                  <CircleX
                    className="opacity-0 translate-x-1 ml-2 h-4 w-4 text-gray-500 group-hover:opacity-100 group-hover:translate-x-0 hover:text-gray-800 transition-[opacity,transform]"
                    onClick={() => removeTask(task.id)}
                  />
                </CardTitle>
                <CardDescription>
                  Created {dayjs(task.created_at).fromNow()}
                </CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </ScrollArea>
  )
}

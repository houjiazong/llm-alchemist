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
import { cn } from '@/lib/utils'
import { useNavigate, useParams } from 'react-router-dom'
import { type MouseEvent } from 'react'

export const TaskList = () => {
  const tasks = useLiveQuery(() => db.tasks.toArray())
  const params = useParams()
  const navigate = useNavigate()
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

  const removeTask = async (evt: MouseEvent, id: number | string) => {
    evt.stopPropagation()
    await db.tasks.delete(id)
    const newTasks = await db.tasks.toArray()
    if (newTasks.length === 0) {
      return navigate('/')
    }
    if (params.taskId === `${id}` && newTasks.length) {
      return navigate(`/${newTasks[0].id}`)
    }
  }

  const onCardClick = (id: number | string) => {
    if (params.taskId === `${id}`) return
    navigate(`/${id}`)
  }

  return (
    <ScrollArea className="h-full">
      <div className="h-full py-8 space-y-3 px-4">
        {tasks.map((task) => {
          return (
            <Card
              key={task.id}
              className={cn('group cursor-pointer hover:border-gray-500', {
                'border-gray-400': params.taskId === task.id.toString(),
              })}
              onClick={() => onCardClick(task.id)}
            >
              <CardHeader className="p-2">
                <CardTitle className="text-md flex">
                  <span className="flex-1 truncate">{task.name}</span>
                  <CircleX
                    className="opacity-0 translate-x-1 ml-2 h-4 w-4 text-gray-500 group-hover:opacity-100 group-hover:translate-x-0 hover:text-gray-800 transition-[opacity,transform]"
                    onClick={(evt) => removeTask(evt, task.id)}
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

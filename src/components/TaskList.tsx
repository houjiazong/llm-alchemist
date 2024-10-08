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
              className={cn(
                'group cursor-pointer hover:border-gray-500 relative',
                {
                  'border-gray-400': params.taskId === task.id.toString(),
                }
              )}
              onClick={() => onCardClick(task.id)}
            >
              <CardHeader className="p-2">
                <CardTitle className="text-md flex items-center space-x-2">
                  <span className="flex-1 truncate w-0">{task.name}</span>
                  <span className="text-gray-400 text-xs font-normal flex-shrink-0 flex-grow-0">
                    {dayjs(task.created_at).fromNow()}
                  </span>
                </CardTitle>
                {task.desc && (
                  <CardDescription className="break-all">
                    {task.desc}
                  </CardDescription>
                )}
              </CardHeader>
              <CircleX
                className="absolute -right-1 -top-1 rounded-full opacity-0 translate-x-1 ml-2 h-4 w-4 text-primary bg-primary-foreground hover:text-primary-foreground hover:bg-primary group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform]"
                onClick={(evt) => removeTask(evt, task.id)}
              />
            </Card>
          )
        })}
      </div>
    </ScrollArea>
  )
}

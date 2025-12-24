import { db } from '@/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { CircleX, Loader } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
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
import { Badge } from '@/components/ui/badge'

export const TaskList = () => {
  const tasks = useLiveQuery(() =>
    db.tasks.orderBy('created_at').reverse().toArray()
  )
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
    const newTasks = await db.tasks.orderBy('created_at').reverse().toArray()
    if (newTasks.length === 0) {
      return navigate('/')
    }
    if (params.taskId === `${id}` && newTasks.length) {
      return navigate(`/${newTasks[0].id}/workbench`)
    }
  }

  const onCardClick = (id: number | string) => {
    if (params.taskId === `${id}`) return
    navigate(`/${id}/workbench`)
  }

  return (
    <ScrollArea className="h-full">
      <div className="h-full py-5 space-y-2.5 px-0">
        {tasks.map((task) => {
          return (
            <Card
              key={task.id}
              className={cn(
                'group cursor-pointer hover:border-foreground/20 relative',
                {
                  'border-foreground/25': params.taskId === task.id.toString(),
                }
              )}
              onClick={() => onCardClick(task.id)}
            >
              <CardHeader className="p-3 space-y-1.5">
                <CardTitle className="flex items-center">
                  <div className="flex-1 w-0 truncate">{task.name}</div>
                </CardTitle>
                <CardDescription className="flex flex-col gap-2">
                  {task.desc && <div className="break-all">{task.desc}</div>}
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 truncate w-0 text-muted-foreground text-xs">
                      {formatDistanceToNow(task.created_at, {
                        addSuffix: true,
                      })}
                    </div>
                    {task.category && (
                      <Badge className="flex-shrink-0 flex-grow-0">
                        {task.category}
                      </Badge>
                    )}
                  </div>
                </CardDescription>
              </CardHeader>
              <CircleX
                className="absolute right-0 -top-1 rounded-full opacity-0 translate-x-1 ml-2 h-4 w-4 text-primary bg-primary-foreground hover:text-primary-foreground hover:bg-primary group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform]"
                onClick={(evt) => removeTask(evt, task.id)}
              />
            </Card>
          )
        })}
      </div>
    </ScrollArea>
  )
}

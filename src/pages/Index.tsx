import { useLiveQuery } from 'dexie-react-hooks'
import { Loader } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { db } from '@/db'
import { AddTaskForm } from '@/components/AddTaskForm'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'

export const Index = () => {
  const tasks = useLiveQuery(() => db.tasks.toArray())
  const [dialogOpen, setDialogOpen] = useState(false)
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add now</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>New task</DialogTitle>
                <DialogDescription></DialogDescription>
              </DialogHeader>
              <AddTaskForm
                onSuccess={() => {
                  setDialogOpen(false)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    )
  }
  return <Navigate to={`/${tasks[0].id}`} />
}

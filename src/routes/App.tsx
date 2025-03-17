import { ModeToggle } from '@/views/ModeToggle'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { TaskList } from '@/views/TaskList'
import { Button } from '@/components/ui/button'
import { CirclePlus } from 'lucide-react'
import { AddTaskForm } from '@/views/AddTaskForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import config from '@/config'
import { TaskExport } from '@/views/TaskExport'
import { TaskImport } from '@/views/TaskImport'

export const App = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const navigate = useNavigate()
  const { taskId } = useParams()
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider delayDuration={0}>
        <div className="h-screen flex">
          <aside className="w-[260px] border-r shadow-md flex flex-col flex-shrink-0 flex-grow-0 py-4">
            <header className="flex items-center px-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  {config.app.title}
                </h2>
                <div className="text-sm font-light text-muted-foreground">
                  {config.app.description}
                </div>
              </div>
              <div
                className="bg-no-repeat bg-cover bg-center h-12 w-12"
                style={{ backgroundImage: `url(${config.app.logo})` }}
              />
            </header>
            <main className="flex-1 h-0">
              <TaskList />
            </main>
            <footer className="flex items-center px-4">
              <div className="flex-1 flex gap-2">
                <TaskExport taskId={taskId} />
                <TaskImport
                  onSuccess={(id) => {
                    navigate(`/${id}/settings`)
                  }}
                />
              </div>
              <div className="flex-shrink-0 flex-grow-0">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <CirclePlus className="mr-2 w-4 h-4" />
                      New task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>New task</DialogTitle>
                      <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <AddTaskForm
                      onSuccess={(id) => {
                        setDialogOpen(false)
                        navigate(`/${id}/settings`)
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </footer>
          </aside>
          <main className="flex-1 flex flex-col relative">
            <div className="absolute right-4 top-4">
              <ModeToggle />
            </div>
            <Outlet />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}

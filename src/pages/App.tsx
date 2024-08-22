import { ModeToggle } from '@/components/ModeToggle'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Outlet, useNavigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { TaskList } from '@/components/TaskList'
import { Button } from '@/components/ui/button'
import { CirclePlus } from 'lucide-react'
import { AddTaskForm } from '@/components/AddTaskForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'
import { DBExportImpot } from '@/components/DBExportImport'
import { TooltipProvider } from '@/components/ui/tooltip'

export const App = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const navigate = useNavigate()
  const onImportSuccess = () => {
    console.log(23123)
  }
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider delayDuration={0}>
        <div className="h-screen flex">
          <aside className="w-[260px] border-r shadow-md flex flex-col flex-shrink-0 flex-grow-0 py-4">
            <header className="flex items-center px-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  LLM Alchemist
                </h2>
                <div className="text-sm font-light text-muted-foreground">
                  Evaluate your LLM.
                </div>
              </div>
              <img
                src="/logo.svg"
                className="w-12 filter drop-shadow-[1000px_0_0_hsl(var(--muted-foreground))] transform -translate-x-[1000px]"
              />
            </header>
            <main className="flex-1 h-0">
              <TaskList />
            </main>
            <footer className="flex items-center px-4">
              <div className="flex-1 flex space-x-2">
                <ModeToggle />
                <DBExportImpot onImportSuccess={onImportSuccess} />
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
          <main className="flex-1 flex flex-col">
            <Outlet />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}

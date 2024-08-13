import { ModeToggle } from '@/components/ModeToggle'
import { ThemeProvider } from '@/components/ThemeProvider'
import { db } from '@/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { Outlet } from 'react-router-dom'

export const App = () => {
  const tasks = useLiveQuery(() => db.tasks.toArray())
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="h-screen flex">
        <aside className="w-[260px] border-r shadow-md flex flex-col p-4">
          <header className="flex items-center">
            <div className="flex-1">
              <h2 className="text-lg font-semibold tracking-tight">
                LLM Alchemist
              </h2>
              <div className="text-sm font-light text-muted-foreground">
                Evaluate your prompts.
              </div>
            </div>
            <img
              src="/logo.svg"
              className="w-12 filter drop-shadow-[1000px_0_0_hsl(var(--muted-foreground))] transform -translate-x-[1000px]"
            />
          </header>
          <main className="flex-1 h-0">
            {tasks && tasks.length > 0 ? (
              <div>tasks</div>
            ) : (
              <div className="text-muted-foreground h-full flex items-center justify-center">
                No results.
              </div>
            )}
          </main>
          <footer>
            <ModeToggle />
          </footer>
        </aside>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  )
}

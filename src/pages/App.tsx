import { Link, Outlet } from 'react-router-dom'

export const App = () => {
  return (
    <div className="relative flex h-screen flex-col bg-background">
      <header className="fixed top-0 z-50 w-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 flex">
            <Link className="mr-4 flex items-center space-x-2 lg:mr-6" to={'/'}>
              <img className="h-6 w-6" src="/logo.svg" />
              <span className="font-bold inline-block">LLM Alchemist</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 h-0">
        <Outlet />
      </main>
    </div>
  )
}

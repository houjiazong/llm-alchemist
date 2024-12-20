import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  NavLink,
  NavLinkRenderProps,
  Outlet,
  useParams,
} from 'react-router-dom'

export const TaskLayout = () => {
  const params = useParams()
  const getNavLinkClassName = ({ isActive }: NavLinkRenderProps) => {
    const defaultClassNames =
      'inline-flex items-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 justify-start px-3 h-9 rounded-md'
    if (isActive)
      return cn(
        defaultClassNames,
        'bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white'
      )
    return cn(defaultClassNames, 'hover:bg-accent hover:text-accent-foreground')
  }
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex justify-center pt-4 container flex-shrink-0 flex-grow-0">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavLink
                to={`/${params.taskId}/workbench`}
                className={getNavLinkClassName}
              >
                Workbench
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink
                to={`/${params.taskId}/settings`}
                className={getNavLinkClassName}
              >
                Settings
              </NavLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <Separator />
      <div className="flex-1 overflow-x-hidden overflow-y-auto pb-4">
        <Outlet />
      </div>
    </div>
  )
}

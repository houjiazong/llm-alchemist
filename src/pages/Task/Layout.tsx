import { Outlet } from 'react-router-dom'

export const TaskLayout = () => {
  return (
    <div className="h-full">
      task layout
      <Outlet />
    </div>
  )
}

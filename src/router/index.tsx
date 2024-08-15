import { createBrowserRouter, Navigate } from 'react-router-dom'
import { App } from '@/pages/App'
import { NotFound } from '@/pages/NotFound'
import { Index } from '@/pages/Index'
import { ErrorPage } from '@/pages/ErrorPage'
import { TaskLayout } from '@/pages/Task/Layout'
import { TaskSettings } from '@/pages/Task/Settings'
import { TaskWorkbench } from '@/pages/Task/Workbench'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: ':taskId',
        element: <TaskLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="workbench" replace />,
          },
          {
            path: 'workbench',
            element: <TaskWorkbench />,
          },
          {
            path: 'settings',
            element: <TaskSettings />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

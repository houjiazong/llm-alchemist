import { createBrowserRouter, Navigate } from 'react-router-dom'
import { App } from './App'
import { NotFound } from './NotFound'
import { Home } from './Home'
import { ErrorPage } from './ErrorPage'
import { TaskLayout } from './Task/Layout'
import { TaskSettings } from './Task/Settings'
import { TaskWorkbench } from './Task/Workbench'
import { QuickStart } from './QuickStart'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
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
      {
        path: '/quick-start',
        element: <QuickStart />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

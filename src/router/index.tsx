import { createBrowserRouter } from 'react-router-dom'
import { App } from '@/pages/App'
import { NotFound } from '@/pages/NotFound'
import { Index } from '@/pages/Index'
import { ErrorPage } from '@/pages/ErrorPage'
import { TaskLayout } from '@/pages/Task/Layout'

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
            element: <div>index</div>,
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

import { createBrowserRouter } from 'react-router-dom'
import { App } from '@/pages/App'
import { NotFound } from '@/pages/NotFound'
import { Tasks } from '@/pages/Tasks'
import { ErrorPage } from '@/pages/ErrorPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Tasks />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

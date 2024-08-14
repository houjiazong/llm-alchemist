import { createBrowserRouter } from 'react-router-dom'
import { App } from '@/pages/App'
import { NotFound } from '@/pages/NotFound'
import { Index } from '@/pages/Index'
import { ErrorPage } from '@/pages/ErrorPage'

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
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

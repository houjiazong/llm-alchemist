import './index.css'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import relativeTime from 'dayjs/plugin/relativeTime'
import dayjs from 'dayjs'
import { router } from './router'

dayjs.extend(relativeTime)

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
)

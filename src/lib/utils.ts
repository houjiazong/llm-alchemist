import { clsx, type ClassValue } from 'clsx'
import { type Params } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// id类型的过渡兼容，后期应该全为string类型的uuid
export function getTaskIdFromRouteParams(params: Params) {
  const id =
    params.taskId && params.taskId.includes('-')
      ? params.taskId
      : Number(params.taskId)
  return id
}

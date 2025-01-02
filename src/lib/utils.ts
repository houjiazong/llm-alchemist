import { clsx, type ClassValue } from 'clsx'
import { type Params } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// id类型的过渡兼容，后期应该全为string类型的uuid
export function getTaskIdFromRouteParams(params: Params) {
  if (params.taskId) {
    if (params.taskId.includes('-')) {
      return params.taskId
    }
    const nid = Number(params.taskId)
    if (!isNaN(nid)) {
      return nid
    }
    return params.taskId
  }
  return ''
}

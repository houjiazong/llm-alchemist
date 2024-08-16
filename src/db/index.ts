import Dexie, { type EntityTable } from 'dexie'

interface Task {
  id: number
  name: string
  desc: string
  created_at: number
  requestConfig?: {
    method: string
    url: string
    headers?: {
      key: string
      value?: string
    }[]
    body?: string
    script: {
      request: string
      response: string
    }
  }
}

const db = new Dexie('la') as Dexie & {
  tasks: EntityTable<Task, 'id'>
}

db.version(1).stores({
  tasks: '++id, name, desc, requestConfig, created_at',
})

export type { Task }
export { db }

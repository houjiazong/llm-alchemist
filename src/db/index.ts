import Dexie, { type EntityTable } from 'dexie'

interface Task {
  id: number
  name: string
  desc: string
}

const db = new Dexie('la') as Dexie & {
  tasks: EntityTable<Task, 'id'>
}

db.version(1).stores({
  tasks: '++id, name, desc',
})

export type { Task }
export { db }

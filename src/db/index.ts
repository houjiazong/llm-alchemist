import Dexie, { type EntityTable } from 'dexie'

interface List {
  id: number
  name: string
  desc: string
}

const db = new Dexie('la') as Dexie & {
  list: EntityTable<List, 'id'>
}

db.version(1).stores({
  list: '++id, name, desc',
})

export type { List }
export { db }

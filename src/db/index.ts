import Dexie, { type EntityTable } from 'dexie'

interface QA {
  question: string
  answer?: string
  rate?: string | number
}
interface OpenAIOptions {
  baseURL: string
  apiKey: string
  params: {
    model: string
    prompt?: string
    max_tokens?: number
    temperature?: number
    stream?: boolean
  }
}
interface Task {
  id: number
  name: string
  desc?: string
  created_at: number
  openAIOptions?: OpenAIOptions
  qas?: QA[]
}

export const DB_STRUCTURE = {
  tasks: '++id, name, desc, openAIOptions, qas, created_at',
}

const db = new Dexie('la') as Dexie & {
  tasks: EntityTable<Task, 'id'>
}

db.version(1).stores(DB_STRUCTURE)

export type { Task, QA, OpenAIOptions }
export { db }

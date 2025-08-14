import { type FunctionCall } from '@yomo/viv'
import Dexie, { type EntityTable } from 'dexie'

export interface LLMUsage {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
}

interface QA {
  id: string
  question: string
  answer?: string
  rate?: string | number
  expectation?: string
  expectationResult?: string
  usage?: LLMUsage
  model?: string
  error?: string
  functionCall?: FunctionCall
}

interface OpenAIOptions {
  baseURL: string
  apiKey: string
  params: {
    model?: string
    max_tokens?: number
    temperature?: number
    stream?: boolean
  }
}
interface Task {
  id: number | string
  name: string
  category?: string
  desc?: string
  created_at: number
  openAIOptions?: OpenAIOptions
  qas?: QA[]
}

export const DB_STRUCTURE = {
  tasks: 'id, name, desc, openAIOptions, qas, created_at',
}

const db = new Dexie('la') as Dexie & {
  tasks: EntityTable<Task, 'id'>
}

db.version(3).stores(DB_STRUCTURE)

export type { Task, QA, OpenAIOptions }
export { db }

import { type LLMUsage, OpenAIOptions } from '@/db'
import { OpenAIApi } from './platforms/openai'

export const ROLES = ['system', 'user', 'assistant'] as const

export type MessageRole = (typeof ROLES)[number]

export enum ServiceProvider {
  OpenAI = 'OpenAI',
  Vivgrid = 'Vivgrid',
}

export interface RequestMessage {
  role: MessageRole
  content: string
}

export interface ChatOptions extends OpenAIOptions {
  messages: RequestMessage[]
  onConnect?: () => void
  onUsage?: (usage: LLMUsage) => void
  onContent?: (message: string) => void
  onFinish?: () => void
  onFunctionCall?: (name: string, args: Record<string, unknown>) => void
  onFunctionCallResult?: (name: string, args: Record<string, unknown>) => void
  onController?: (controller: AbortController) => void
  onError?: (err: Error) => void
}

export abstract class LLMApi {
  abstract chat(options: ChatOptions): Promise<void>
}

export class ClientApi {
  public llm: LLMApi
  constructor(provider: ServiceProvider) {
    switch (provider) {
      // case ServiceProvider.OpenAI:
      //   this.llm = new VivgridApi()
      //   break
      default:
        this.llm = new OpenAIApi()
    }
  }
}

export function getApi(provider: ServiceProvider): ClientApi {
  return new ClientApi(provider)
}

import { isEmpty, isNil } from 'es-toolkit/compat'
import { type RequestMessage, type ChatOptions } from '..'
import { LLMApi } from '..'
import Viv from '@yomo/viv'

export class VivgridApi implements LLMApi {
  client: Viv | null
  constructor() {
    this.client = null
  }
  async chat(opts: ChatOptions): Promise<void> {
    if (!this.client) {
      this.client = new Viv({
        baseURL: import.meta.env.VITE_PROXY_URL
          ? `${import.meta.env.VITE_PROXY_URL}${opts.baseURL}`
          : opts.baseURL,
        apiKey: opts.apiKey,
      })
    }
    const body = {
      messages: opts.messages,
      temperature: opts.params.temperature,
      stream: opts.params.stream,
      model: opts.params.model ?? null,
    } as {
      messages: RequestMessage[]
      model: string
      stream: boolean
      max_completion_tokens: number
      temperature: number
    }
    if (opts.params.model) {
      body.model = opts.params.model
    }
    if (!isNil(opts.params.max_tokens) && !isEmpty(opts.params.max_tokens)) {
      body.max_completion_tokens = opts.params.max_tokens
    }
    try {
      const response = await this.client.chat.completions.stream(body)
      opts.onConnect?.()
      for await (const chunk of response) {
        if (chunk.type === 'function_call') {
          console.log(chunk)
        }
      }
      opts.onFinish?.()
    } catch (error) {
      opts.onError?.(error as Error)
    }
  }
}

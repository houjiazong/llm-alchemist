import { type RequestMessage, type ChatOptions } from '..'
import { LLMApi } from '..'
import OpenAI from 'openai'
import {
  type ChatCompletion,
  type ChatCompletionChunk,
} from 'openai/resources/index.mjs'

export class OpenAIApi implements LLMApi {
  client: OpenAI | null
  constructor() {
    this.client = null
  }
  async chat(opts: ChatOptions): Promise<void> {
    if (!this.client) {
      this.client = new OpenAI({
        baseURL: import.meta.env.VITE_PROXY_URL
          ? `${import.meta.env.VITE_PROXY_URL}${opts.baseURL}`
          : opts.baseURL,
        apiKey: opts.apiKey,
        dangerouslyAllowBrowser: true,
      })
    }
    const abort = new AbortController()
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
    if (opts.params.max_tokens) {
      body.max_completion_tokens = opts.params.max_tokens
    }
    try {
      const response = await this.client.chat.completions.create(body, {
        signal: abort.signal,
      })
      opts.onConnect?.()
      if (
        (response as AsyncIterable<ChatCompletionChunk>)[Symbol.asyncIterator]
      ) {
        for await (const chunk of response as AsyncIterable<ChatCompletionChunk>) {
          const content = chunk.choices[0]?.delta?.content
          if (content) {
            opts.onContent?.(content)
          }
          if (chunk.usage) {
            opts.onUsage?.(chunk.usage)
          }
        }
        opts.onFinish?.()
      } else {
        const _res = response as ChatCompletion
        const content = _res.choices[0]?.message?.content
        const usage = _res.usage
        if (content) {
          opts.onContent?.(content)
        }
        if (usage) {
          opts.onUsage?.(usage)
        }
        opts.onFinish?.()
      }
    } catch (error) {
      opts.onError?.(error as Error)
    }
  }
}

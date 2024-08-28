import { type QA, db } from '@/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useToast } from '@/components/ui/use-toast'
import { ToastAction } from '@/components/ui/toast'
import OpenAI from 'openai'
import {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionMessageParam,
} from 'openai/resources/index.mjs'
import { getTaskIdFromRouteParams } from '@/lib/utils'

export interface QAInfo {
  loading: boolean
  completionTime: number | null
  responseTime: number | null
  error: string | null
}

export const useWorkbench = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const params = useParams()
  const task = useLiveQuery(() =>
    db.tasks.get(getTaskIdFromRouteParams(params))
  )

  // init qas
  const initialQas = useMemo(
    () => [
      ...(task?.qas || []).map((qa) => ({
        ...qa,
        id: qa.id || uuidv4(),
      })),
      {
        id: uuidv4(),
        question: '',
        answer: '',
        rate: 0,
      },
    ],
    [task?.qas]
  )

  const [qas, setQas] = useState<QA[]>(initialQas)
  const [infos, setInfos] = useState<Record<string, QAInfo>>(
    initialQas.reduce(
      (pre, cur) => {
        if (!pre[cur.id]) {
          pre[cur.id] = {
            loading: false,
            completionTime: null,
            responseTime: null,
            error: null,
          }
        }
        return pre
      },
      {} as Record<string, QAInfo>
    )
  )
  const [selectIds, setSelectIds] = useState<string[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const dbQas = (task?.qas || []).map((qa) => ({
      ...qa,
      id: qa.id || uuidv4(),
    }))
    setQas([
      ...dbQas,
      {
        id: uuidv4(),
        question: '',
        answer: '',
        rate: 0,
      },
    ])
    setInfos((prevInfos) => {
      return dbQas.reduce(
        (pre, cur) => {
          if (!pre[cur.id]) {
            pre[cur.id] = {
              loading: false,
              completionTime: null,
              responseTime: null,
              error: null,
            }
          }
          return pre
        },
        prevInfos as Record<string, QAInfo>
      )
    })
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [task?.qas])

  const onQuestionChange = useCallback(
    (index: number, value: string) => {
      setQas((prevQas) => {
        const newQas = [...prevQas]
        newQas[index].question = value
        if (index === prevQas.length - 1 && value !== '') {
          const newQa = {
            id: uuidv4(),
            question: '',
            answer: '',
            rate: 0,
            completionTime: null,
            responseTime: null,
            error: null,
          }
          newQas.push(newQa)
          setInfos((prevInfos) => ({
            ...prevInfos,
            [newQa.id]: {
              loading: false,
              error: null,
              responseTime: null,
              completionTime: null,
            },
          }))
        }
        db.tasks.update(getTaskIdFromRouteParams(params), {
          qas: newQas.filter((qa) => !!qa.question.trim()),
        })
        return newQas
      })
    },
    [params]
  )

  const onQuestionRemove = useCallback(
    (index: number) => {
      setQas((prevQas) => {
        const removedQa = prevQas[index]
        const newQas = prevQas.filter((_, i) => i !== index)
        setInfos((prevInfos) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [removedQa.id]: _, ...rest } = prevInfos
          return rest
        })
        db.tasks.update(getTaskIdFromRouteParams(params), {
          qas: newQas.filter((qa) => !!qa.question.trim()),
        })
        return newQas
      })
    },
    [params]
  )

  const onRateChange = useCallback(
    (index: number, value: number) => {
      setQas((prevQas) => {
        const newQas = [...prevQas]
        newQas[index].rate = value
        db.tasks.update(getTaskIdFromRouteParams(params), {
          qas: newQas.filter((qa) => !!qa.question.trim()),
        })
        return newQas
      })
    },
    [params]
  )

  const onSelectChange = useCallback((id: string) => {
    setSelectIds((prevSelectIds) => {
      if (prevSelectIds.includes(id)) {
        return prevSelectIds.filter((selectId) => selectId !== id)
      } else {
        return [...prevSelectIds, id]
      }
    })
  }, [])

  const onRun = useCallback(async () => {
    if (
      !task?.openAIOptions?.baseURL ||
      !task?.openAIOptions?.apiKey ||
      !task?.openAIOptions?.params?.model
    ) {
      return toast({
        title: 'Check the settings',
        description:
          'Please set your BaseURL, API Key, Model and other information.',
        action: (
          <ToastAction
            altText="Set now"
            onClick={() => {
              navigate(`/${params.taskId}/settings`)
            }}
          >
            Set now
          </ToastAction>
        ),
      })
    }
    if (qas.filter((qa) => !!qa.question.trim()).length === 0) {
      return toast({
        title: 'No question',
        description: 'Please add a question.',
      })
    }

    const updatedQas = [...qas]
    const client = new OpenAI({
      baseURL: import.meta.env.VITE_PROXY_URL
        ? `${import.meta.env.VITE_PROXY_URL}${task.openAIOptions.baseURL}`
        : task.openAIOptions.baseURL,
      apiKey: task.openAIOptions.apiKey,
      dangerouslyAllowBrowser: true,
    })

    for (let i = 0, len = updatedQas.length; i < len; i++) {
      if (!updatedQas[i].question.trim()) continue
      if (selectIds.length > 0 && !selectIds.includes(updatedQas[i].id))
        continue

      const startTime = performance.now()

      setInfos((prevInfos) => ({
        ...prevInfos,
        [updatedQas[i].id]: {
          ...prevInfos[updatedQas[i].id],
          loading: true,
          completionTime: null,
          responseTime: null,
          error: null,
        },
      }))

      abortControllerRef.current = new AbortController()
      try {
        let answer = ''
        const messages: ChatCompletionMessageParam[] = [
          { role: 'user', content: updatedQas[i].question },
        ]
        if (task.openAIOptions.params.prompt) {
          messages.unshift({
            role: 'assistant',
            content: task.openAIOptions.params.prompt,
          })
        }
        const response = await client.chat.completions.create(
          {
            model: task.openAIOptions.params.model,
            messages,
            stream: task.openAIOptions.params.stream,
            max_tokens: task.openAIOptions.params.max_tokens,
            temperature: task.openAIOptions.params.temperature,
          },
          { signal: abortControllerRef.current.signal }
        )
        setInfos((prevInfos) => ({
          ...prevInfos,
          [updatedQas[i].id]: {
            ...prevInfos[updatedQas[i].id],
            responseTime: performance.now() - startTime,
          },
        }))
        if (
          (response as AsyncIterable<ChatCompletionChunk>)[Symbol.asyncIterator]
        ) {
          for await (const chunk of response as AsyncIterable<ChatCompletionChunk>) {
            answer += chunk.choices[0]?.delta?.content || ''
            updatedQas[i].answer = answer
            setQas([...updatedQas])
          }
        } else {
          const nonStreamResponse = response as ChatCompletion
          answer = nonStreamResponse.choices[0]?.message?.content || ''
          updatedQas[i].answer = answer
          setQas([...updatedQas])
        }
      } catch (error) {
        setInfos((prevInfos) => ({
          ...prevInfos,
          [updatedQas[i].id]: {
            ...prevInfos[updatedQas[i].id],
            error: (error as Error).message,
          },
        }))
        updatedQas[i].answer = ''
        setQas([...updatedQas])
      } finally {
        setInfos((prevInfos) => ({
          ...prevInfos,
          [updatedQas[i].id]: {
            ...prevInfos[updatedQas[i].id],
            loading: false,
            completionTime: performance.now() - startTime,
          },
        }))
      }
    }
    await db.tasks.update(getTaskIdFromRouteParams(params), {
      qas: updatedQas.filter((qa) => !!qa.question.trim()),
    })
  }, [task, qas, params, toast, navigate, selectIds])

  const someLoading = useMemo(
    () => Object.values(infos).some((info) => info.loading),
    [infos]
  )

  return {
    infos,
    someLoading,
    task,
    qas,
    selectIds,
    onQuestionChange,
    onQuestionRemove,
    onRateChange,
    onRun,
    onSelectChange,
  }
}

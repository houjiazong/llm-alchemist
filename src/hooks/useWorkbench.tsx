import { type QA, db } from '@/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { ToastAction } from '@/components/ui/toast'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'

export const useWorkbench = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const params = useParams()
  const task = useLiveQuery(() => db.tasks.get(Number(params.taskId)))

  // init qas
  const initialQas = useMemo(
    () => [...(task?.qas || []), { question: '', answer: '', rate: 0 }],
    [task?.qas]
  )

  const [qas, setQas] = useState<QA[]>(initialQas)
  const [loading, setLoading] = useState<boolean[]>(
    new Array(initialQas.length).fill(false)
  )
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const dbQas = task?.qas || []
    setQas([...dbQas, { question: '', answer: '', rate: 0 }])
    setLoading(new Array(dbQas.length + 1).fill(false))
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
          newQas.push({ question: '', answer: '', rate: 0 })
          setLoading((prevLoading) => [...prevLoading, false])
        }
        db.tasks.update(Number(params.taskId), {
          qas: newQas.filter((qa) => !!qa.question.trim()),
        })
        return newQas
      })
    },
    [params.taskId]
  )

  const onQuestionRemove = useCallback(
    (index: number) => {
      setQas((prevQas) => {
        const newQas = prevQas.filter((_, i) => i !== index)
        setLoading((prevLoading) => prevLoading.filter((_, i) => i !== index))
        db.tasks.update(Number(params.taskId), {
          qas: newQas.filter((qa) => !!qa.question.trim()),
        })
        console.log(newQas)
        return newQas
      })
    },
    [params.taskId]
  )

  const onRateChange = useCallback(
    (index: number, value: number) => {
      setQas((prevQas) => {
        const newQas = [...prevQas]
        newQas[index].rate = value
        db.tasks.update(Number(params.taskId), {
          qas: newQas.filter((qa) => !!qa.question.trim()),
        })
        return newQas
      })
    },
    [params.taskId]
  )

  const onRunAll = useCallback(async () => {
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

      setLoading((prevLoading) => {
        const newLoading = [...prevLoading]
        newLoading[i] = true
        return newLoading
      })

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
            stream: true,
            max_tokens: task.openAIOptions.params.max_tokens,
            temperature: task.openAIOptions.params.temperature,
          },
          { signal: abortControllerRef.current.signal }
        )

        for await (const chunk of response) {
          answer += chunk.choices[0].delta?.content || ''
          updatedQas[i].answer = answer
          setQas([...updatedQas])
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading((prevLoading) => {
          const newLoading = [...prevLoading]
          newLoading[i] = false
          return newLoading
        })
      }
    }
    await db.tasks.update(Number(params.taskId), {
      qas: updatedQas.filter((qa) => !!qa.question.trim()),
    })
  }, [task, qas, params.taskId, toast, navigate])

  const someLoading = useMemo(() => loading.some((l) => l), [loading])

  return {
    loading,
    someLoading,
    task,
    qas,
    onQuestionChange,
    onQuestionRemove,
    onRateChange,
    onRunAll,
  }
}

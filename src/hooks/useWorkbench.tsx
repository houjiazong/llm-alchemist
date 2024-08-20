import { type QA, db } from '@/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { ToastAction } from '@/components/ui/toast'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'

export const useWorkbench = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const params = useParams()
  const task = useLiveQuery(() => db.tasks.get(Number(params.taskId)))

  // 初始化问题列表
  const [qas, setQas] = useState<QA[]>([
    ...(task?.qas || []),
    { question: '', answer: '', rate: 0 },
  ])
  // 初始化每个问题的loading状态，用于请求时UI中显示loading
  const [loading, setLoading] = useState<boolean[]>(
    new Array(qas.length).fill(false)
  )
  const abortControllerRef = useRef<AbortController | null>(null)
  // 当indexed db中问题数据发生变更后，重新初始化问题和loading状态
  useEffect(() => {
    if (task?.qas?.length) {
      setQas([...task.qas, { question: '', answer: '', rate: 0 }])
      setLoading(new Array(task.qas.length + 1).fill(false))
    }
    // 组件卸载后中止请求
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [task?.qas])
  // 输入问题后，自动追加一条新的数据
  const onQuestionChange = (index: number, value: string) => {
    const newQas = [...qas]
    newQas[index].question = value

    if (index === qas.length - 1 && value !== '') {
      newQas.push({ question: '', answer: '', rate: 0 })
      setLoading([...loading, false])
    }

    setQas(newQas)
    db.tasks.update(Number(params.taskId), {
      qas: newQas.filter((qa) => !!qa.question.trim()),
    })
  }
  const onQuestionRemove = (index: number) => {
    const newQas = qas.filter((_, i) => i !== index)
    setQas(newQas)
    setLoading(loading.filter((_, i) => i !== index))
    db.tasks.update(Number(params.taskId), {
      qas: newQas.filter((qa) => !!qa.question.trim()),
    })
  }
  const onRateChange = (index: number, value: number) => {
    const newQas = [...qas]
    newQas[index].rate = value
    setQas(newQas)

    db.tasks.update(Number(params.taskId), {
      qas: newQas.filter((qa) => !!qa.question.trim()),
    })
  }
  const onRunAll = async () => {
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
    // 拷贝问题列表，当所有请求结束后，将结果存至indexed db
    const updatedQas = [...qas]
    const client = new OpenAI({
      baseURL: task.openAIOptions.baseURL,
      apiKey: task.openAIOptions.apiKey,
      dangerouslyAllowBrowser: true,
    })
    for (let i = 0, len = updatedQas.length; i < len; i++) {
      // 跳过空问题
      if (!updatedQas[i].question || updatedQas[i].question.trim() === '') {
        continue
      }
      setLoading((prevLoading) => {
        const newLoading = [...prevLoading]
        newLoading[i] = true
        return newLoading
      })
      abortControllerRef.current = new AbortController()
      try {
        let answer = ''
        const messages: ChatCompletionMessageParam[] = [
          {
            role: 'user',
            content: updatedQas[i].question,
          },
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
          {
            signal: abortControllerRef.current.signal,
          }
        )
        for await (const chunk of response) {
          answer += chunk.choices[0].delta?.content || ''
          updatedQas[i].answer = answer
          setQas([...updatedQas])
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        /* empty */
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
  }
  return {
    loading,
    someLoading: loading.some((l) => l),
    task,
    qas,
    onQuestionChange,
    onQuestionRemove,
    onRateChange,
    onRunAll,
  }
}

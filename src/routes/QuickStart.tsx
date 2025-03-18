import * as CryptoJS from 'crypto-js'
import { useEffect, useState, useCallback } from 'react'
import { AlertCircle, Loader } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { db } from '@/db'
import { useNavigate } from 'react-router-dom'

export const QuickStart = () => {
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const parseQuickInfo = useCallback((encryptedData: string) => {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, 'llm-alchemist')
      const str = decrypted.toString(CryptoJS.enc.Utf8)
      if (!str) throw new Error('Decryption failed')
      return JSON.parse(str)
    } catch (err) {
      console.error('QuickInfo decryption error:', err)
      return null
    }
  }, [])

  const handleTaskCreation = useCallback(
    async (info: {
      baseURL: string
      token: string
      category: string
      id: string
      name: string
      description: string
    }) => {
      if (!info) return setError('Invalid quick info')

      const { baseURL, category, id, name, token, description } = info
      if (!baseURL || !category || !id || !name || !token) {
        return setError('Missing required quick info fields')
      }

      try {
        const existingTask = await db.tasks.get(id)
        const taskId = await db.tasks.put({
          id,
          name: existingTask?.name ?? name,
          desc: existingTask?.desc ?? description,
          category,
          created_at: existingTask?.created_at ?? Date.now(),
          openAIOptions: {
            baseURL: existingTask?.openAIOptions?.baseURL ?? baseURL,
            apiKey: existingTask?.openAIOptions?.apiKey ?? token,
            params: {
              model: existingTask?.openAIOptions?.params?.model ?? '',
              prompt: existingTask?.openAIOptions?.params?.prompt ?? '',
              max_tokens: existingTask?.openAIOptions?.params?.max_tokens,
              temperature:
                existingTask?.openAIOptions?.params?.temperature ?? 0.7,
              stream: existingTask?.openAIOptions?.params?.stream ?? true,
            },
          },
        })

        if (!taskId) throw new Error('Task creation failed')
        navigate(`/${taskId}/workbench`, { replace: true })
      } catch (err) {
        console.error('Task creation error:', err)
        setError('Failed to create or update task')
      }
    },
    [navigate]
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const quickInfo = params.get('quickinfo')

    if (!quickInfo) return setError('Missing quickinfo parameter')

    const info = parseQuickInfo(quickInfo)
    handleTaskCreation(info)
  }, [parseQuickInfo, handleTaskCreation])

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-2">
        <Alert variant="destructive" className="max-w-96">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="h-full flex items-center justify-center p-2">
      <Loader className="animate-spin w-4 h-4" />
    </div>
  )
}

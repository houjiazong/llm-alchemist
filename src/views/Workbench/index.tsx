import { db, type QA } from '@/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { WorkbenchList } from './List'
import { cloneDeep, isEmpty, isNil } from 'es-toolkit/compat'
import { type ChangeEvent, useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/components/ui/button'
import { ChatOptions, ClientApi, getApi, ServiceProvider } from '@/api'
import { Toggle } from '@/components/ui/toggle'
import { LetterTextIcon, Loader } from 'lucide-react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'

export interface QAInfo extends QA {
  _extraInfo?: {
    loading?: boolean
    ttft?: number
    completion?: number
    functionCall?: {
      name: string
      arguments?: Record<string, unknown>
    }
    functionCallResult?: {
      name: string
      arguments?: Record<string, unknown>
      result?: Record<string, unknown>
    }
  }
}

interface WorkbenchProps {
  taskId: string
}

export function Workbench({ taskId }: WorkbenchProps) {
  const [isFormatOutput, setIsFormatOutput] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const task = useLiveQuery(() => db.tasks.get(taskId), [taskId])
  const [qas, setQAS] = useState<QAInfo[]>([])
  const apiRef = useRef<ClientApi | null>()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    apiRef.current = getApi(task?.category as ServiceProvider)
    if (isNil(task?.qas) || isEmpty(task?.qas)) return
    setQAS(task.qas)
    return () => {
      apiRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id])

  useEffect(() => {
    const lastQA = qas[qas.length - 1]

    if ((lastQA && !isEmpty(lastQA.question)) || qas.length === 0) {
      setQAS([...qas, { id: uuidv4(), question: '' }])
    }

    if (
      qas.length > 1 &&
      isEmpty(qas[qas.length - 2].question) &&
      isEmpty(lastQA.question)
    ) {
      setQAS(qas.slice(0, -1))
    }
  }, [qas])

  const updateQASToDB = (data: QAInfo[]) => {
    db.tasks.update(taskId, {
      qas: data
        .filter((qa) => !isNil(qa.question) && !isEmpty(qa.question))
        .map((item) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _extraInfo, ...rest } = item
          return {
            ...rest,
          }
        }),
    })
  }

  if (isNil(task?.id)) return null

  const isSelected = selectedIds.length > 0

  const handlePromptInputChange = (
    id: string,
    e: ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value

    const updatedItems = qas.map((item) =>
      item.id === id ? { ...item, question: newValue } : item
    )

    updateQASToDB(updatedItems)
    setQAS(updatedItems)
  }

  const handleExpectationChange = (
    id: string,
    e: ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value

    const updatedItems = qas.map((item) =>
      item.id === id ? { ...item, expectation: newValue } : item
    )

    updateQASToDB(updatedItems)
    setQAS(updatedItems)
  }

  const handleRemove = (id: string) => {
    const updatedItems = qas.filter((item) => item.id !== id)
    updateQASToDB(updatedItems)
    setQAS(updatedItems)
  }

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleRateChange = (id: string, rating: number) => {
    const updatedItems = qas.map((item) =>
      item.id === id ? { ...item, rate: rating } : item
    )
    updateQASToDB(updatedItems)
    setQAS(updatedItems)
  }

  const handleRun = async (id?: string) => {
    if (isNil(apiRef.current)) return
    const ids = id
      ? [id]
      : selectedIds.length
        ? selectedIds
        : qas.map((qa) => qa.id)

    for (let i = 0, len = ids.length; i < len; i++) {
      const qa = qas.find((qa) => qa.id === ids[i])
      if (isNil(qa?.question) || isEmpty(qa?.question)) continue

      let newAnswer = ''
      let newQA = cloneDeep(qa)
      newQA = {
        ...newQA,
        _extraInfo: {
          ...newQA._extraInfo,
          loading: true,
        },
      }

      setQAS((prev) =>
        prev.map((item) => (item.id === newQA.id ? newQA : item))
      )

      const baseOptions = {
        baseURL: task.openAIOptions?.baseURL ?? '',
        apiKey: task.openAIOptions?.apiKey ?? '',
        params: {
          model: task.openAIOptions?.params?.model ?? '',
          max_tokens: task.openAIOptions?.params?.max_tokens,
          temperature: task.openAIOptions?.params?.temperature,
          stream: task.openAIOptions?.params?.stream ?? true,
        },
      }
      const startTime = performance.now()

      try {
        await apiRef.current.llm.chat({
          ...baseOptions,
          messages: [
            {
              role: 'user',
              content: newQA.question,
            },
          ],
          onConnect: () => {
            newQA = {
              ...newQA,
              _extraInfo: {
                ...newQA._extraInfo,
                ttft: performance.now() - startTime,
              },
            }
            setQAS((prev) =>
              prev.map((item) => (item.id === newQA.id ? newQA : item))
            )
          },
          onContent: (content) => {
            newQA = {
              ...newQA,
              answer: (newAnswer += content),
            }
            setQAS((prev) =>
              prev.map((item) => (item.id === newQA.id ? newQA : item))
            )
          },
          onFinish: () => {
            newQA = {
              ...newQA,
              _extraInfo: {
                ...newQA._extraInfo,
                completion: performance.now() - startTime,
              },
            }
            const newQAS = qas.map((item) =>
              item.id === newQA.id ? newQA : item
            )
            setQAS(newQAS)
            updateQASToDB(newQAS)
          },
          onUsage: (usage) => {
            newQA = {
              ...newQA,
              usage,
            }
            const newQAS = qas.map((item) =>
              item.id === newQA.id ? newQA : item
            )
            setQAS(newQAS)
            updateQASToDB(newQAS)
          },
        } as ChatOptions)
      } finally {
        newQA = {
          ...newQA,
          _extraInfo: { ...newQA._extraInfo, loading: false },
        }
        setQAS((prev) =>
          prev.map((item) => (item.id === newQA.id ? newQA : item))
        )
      }
      //       if (!newQA.expectation) continue
      //       newQA = {
      //         ...newQA,
      //         _extraInfo: {
      //           ...newQA._extraInfo,
      //           loading: true,
      //         },
      //       }
      //       setQAS((prev) =>
      //         prev.map((item) => (item.id === newQA.id ? newQA : item))
      //       )
      //       let newExpectationResult = ''
      //       try {
      //         await apiRef.current.llm.chat({
      //           ...baseOptions,
      //           messages: [
      //             {
      //               role: 'user',
      //               content: `
      // Question:
      // ${newQA.question}

      // LLM Answer:
      // ${newQA.answer}

      // Expected Answer:
      // ${newQA.expectation}

      // Please evaluate the test result based on the following criteria and return whether it passes in JSON format:
      // - If the LLM answer matches the expected answer, return { "pass": true }
      // - If the LLM answer does not match the expected answer, return { "pass": false }
      //             `,
      //             },
      //           ],
      //           onContent: (content) => {
      //             newQA = {
      //               ...newQA,
      //               expectationResult: (newExpectationResult += content),
      //             }
      //             setQAS((prev) =>
      //               prev.map((item) => (item.id === newQA.id ? newQA : item))
      //             )
      //           },
      //           onFinish: () => {
      //             const newQAS = qas.map((item) =>
      //               item.id === newQA.id ? newQA : item
      //             )
      //             setQAS(newQAS)
      //             updateQASToDB(newQAS)
      //           },
      //         } as ChatOptions)
      //       } finally {
      //         newQA = {
      //           ...newQA,
      //           _extraInfo: { ...newQA._extraInfo, loading: false },
      //         }
      //         setQAS((prev) =>
      //           prev.map((item) => (item.id === newQA.id ? newQA : item))
      //         )
      //       }
    }
  }

  const onExport = async () => {
    setExporting(true)
    try {
      const exportQas = (qas || [])
        .filter((item) => {
          if (selectedIds.length > 0) {
            return selectedIds.includes(item.id)
          }
          return true
        })
        .map((item) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...rest } = item
          return { ...rest }
        })
      const worksheet = XLSX.utils.json_to_sheet(exportQas)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'QAS')

      XLSX.writeFile(workbook, `${task.name}-workbench-table-data.xlsx`)
    } finally {
      setExporting(false)
    }
  }

  const onImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const importedQas = XLSX.utils.sheet_to_json(sheet, { header: 1 })
      const headers: string[] = importedQas[0] as string[]
      if (
        headers[0] !== 'question' ||
        headers[1] !== 'answer' ||
        headers[2] !== 'rate'
      ) {
        return toast.warning('Invalid format', {
          description: 'The table must have headers: question, answer, rate.',
        })
      }
      const formattedQas = importedQas
        .slice(1)
        .filter((row) => {
          const typedRow = row as unknown[]
          const [question] = typedRow as [string]
          return !!(question || '').trim()
        })
        .map((row) => {
          const typedRow = row as unknown[]
          const [question, answer, rate] = typedRow as [
            string,
            string,
            number | string,
          ]
          return {
            id: uuidv4(),
            question: question,
            answer: answer || '',
            rate: Number(rate) || 0,
          }
        })
      if (formattedQas.length > 0) {
        await db.tasks.update(task.id, {
          qas: [
            ...(qas || []).filter((item) => !!item.question.trim()),
            ...formattedQas,
          ],
        })
        await db.tasks.get(task.id, (newTask) => {
          setQAS(newTask?.qas || [])
        })
      }
      toast.success('Import successful', {
        description: `${formattedQas.length} records have been imported.`,
      })
    } finally {
      setImporting(false)
    }
  }

  const onFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const loading = qas.some((qa) => qa._extraInfo?.loading)

  return (
    <div className="h-full flex flex-col overflow-hidden gap-2">
      <div className="flex-shrink-0 flex-grow-0 px-4 flex justify-end items-center gap-2">
        <Toggle pressed={isFormatOutput} onPressedChange={setIsFormatOutput}>
          <LetterTextIcon />
        </Toggle>
        <Button variant="outline" onClick={onFileSelect}>
          {importing && <Loader className="animate-spin w-4 h-4 mr-2" />}Import
        </Button>
        <Button variant="outline" onClick={onExport}>
          {exporting && <Loader className="animate-spin w-4 h-4 mr-2" />}
          {isSelected ? 'Export Selected' : 'Export'}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleRun()}
          disabled={loading}
        >
          {isSelected ? 'Run Selected' : 'Run All'}
        </Button>
      </div>
      <div className="flex-1 h-0">
        <WorkbenchList
          data={qas}
          selectedIds={selectedIds}
          isFormatOutput={isFormatOutput}
          onPromptChange={handlePromptInputChange}
          onRemove={handleRemove}
          onSelect={handleSelect}
          onRateChange={handleRateChange}
          onRun={handleRun}
          onExpectationChange={handleExpectationChange}
        />
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".xlsx,.xls,.csv"
        onChange={onImport}
      />
    </div>
  )
}

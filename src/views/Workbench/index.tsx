import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { db, QA } from '@/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { isEmpty, isNil } from 'es-toolkit/compat'
import { LetterTextIcon, LoaderIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { WorkbenchItem, WorkbenchItemRef } from './Item'
import { StatusIndicator } from './StatusIndicator'
import Viv from '@yomo/viv'

interface WorkbenchProps {
  taskId: string
}

export function Workbench({ taskId }: WorkbenchProps) {
  const [isFormatOutput, setIsFormatOutput] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const task = useLiveQuery(() => db.tasks.get(taskId), [taskId])
  const [qas, setQAS] = useState<QA[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const itemRefs = useRef<Map<string, WorkbenchItemRef>>(new Map())
  const abortControllerRef = useRef<AbortController | null>(null)

  const [loadings, setLoadings] = useState<{ [id: string]: boolean }>({})

  const client = useMemo(() => {
    if (
      isNil(task?.openAIOptions?.apiKey) ||
      isEmpty(task?.openAIOptions?.apiKey) ||
      isNil(task?.openAIOptions?.baseURL) ||
      isEmpty(task?.openAIOptions?.baseURL)
    ) {
      return null
    }
    return new Viv({
      baseURL: `${import.meta.env.VITE_PROXY_URL}${task?.openAIOptions?.baseURL ?? ''}`,
      apiKey: task?.openAIOptions?.apiKey ?? '',
      maxRetries: 0,
    })
  }, [task?.openAIOptions?.apiKey, task?.openAIOptions?.baseURL])

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    setQAS([])
    setSelectedIds([])
    itemRefs.current = new Map()
    setLoadings({})
    if (isNil(task?.qas) || isEmpty(task?.qas)) {
      setQAS([{ id: uuidv4(), question: '' }])
      return
    }
    setQAS(task.qas)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

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

  const updateQASToDB = useCallback(
    async (data: QA[]) => {
      await db.tasks.update(taskId, {
        qas: data.filter((qa) => !isNil(qa.question) && !isEmpty(qa.question)),
      })
    },
    [taskId]
  )

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

      XLSX.writeFile(workbook, `${task?.name}-workbench-table-data.xlsx`)
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
      if (!task?.id) return
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

  const handleRun = async () => {
    const ids = selectedIds.length > 0 ? selectedIds : qas.map((qa) => qa.id)
    for (let i = 0, len = ids.length; i < len; i++) {
      await itemRefs.current.get(ids[i])?.run()
    }
  }

  const handleRemove = useCallback(
    async (id: string) => {
      const updatedItems = qas.filter((item) => item.id !== id)
      await updateQASToDB(updatedItems)
      setQAS(updatedItems)
    },
    [qas, updateQASToDB]
  )

  const handleUpdateItemToDB = useCallback(
    async (id: string, newItem: QA) => {
      const updatedItems = qas.map((item) =>
        item.id === id ? { ...item, ...newItem } : item
      )
      setQAS(updatedItems)
      await updateQASToDB(updatedItems)
    },
    [qas, updateQASToDB]
  )

  const scrollToItem = useCallback((id: string) => {
    itemRefs.current.get(id)?.scrollIntoView()
  }, [])

  const onFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const isSelected = useMemo(() => {
    return selectedIds.length > 0
  }, [selectedIds])

  const isLoading = useMemo(() => {
    return Object.values(loadings).some((loading) => loading)
  }, [loadings])

  return (
    <div className="h-full flex flex-col overflow-hidden gap-3">
      <div className="flex-shrink-0 flex-grow-0 px-6 flex items-center gap-3">
        <div className="flex-1">
          <StatusIndicator
            qas={qas}
            loadings={loadings}
            scrollToItem={scrollToItem}
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-grow-0">
          <Toggle pressed={isFormatOutput} onPressedChange={setIsFormatOutput}>
            <LetterTextIcon />
          </Toggle>
          <Button variant="outline" onClick={onFileSelect}>
            {importing && <LoaderIcon className="animate-spin w-4 h-4 mr-2" />}
            Import
          </Button>
          <Button variant="outline" onClick={onExport}>
            {exporting && <LoaderIcon className="animate-spin w-4 h-4 mr-2" />}
            {isSelected ? 'Export Selected' : 'Export'}
          </Button>
          <Button
            onClick={() => handleRun()}
            disabled={isLoading}
            className="bg-status-green-text text-white hover:bg-status-green-text/90"
          >
            {isSelected ? 'Run Selected' : 'Run All'}
          </Button>
        </div>
      </div>
      <div className="flex-1 h-0">
        <ScrollArea className="h-full">
          {client && (
            <div className="flex flex-col gap-4 px-6">
              {qas.map((qa, index) => {
                return (
                  <WorkbenchItem
                    ref={(ref) => {
                      if (ref) {
                        itemRefs.current.set(qa.id, ref)
                      } else {
                        itemRefs.current.delete(qa.id)
                      }
                    }}
                    key={qa.id}
                    index={index}
                    client={client}
                    clientOptions={task?.openAIOptions}
                    item={qa}
                    checked={selectedIds.includes(qa.id)}
                    abortSignal={abortControllerRef.current?.signal}
                    handleCheck={(checked) => {
                      if (checked) {
                        setSelectedIds((prev) => [...prev, qa.id])
                      } else {
                        setSelectedIds((prev) =>
                          prev.filter((id) => id !== qa.id)
                        )
                      }
                    }}
                    handleRemove={async () => await handleRemove(qa.id)}
                    handleUpdateItemToDB={async (item: QA) =>
                      await handleUpdateItemToDB(qa.id, item)
                    }
                    handleUpdateLoading={(loading) => {
                      setLoadings((prev) => ({ ...prev, [qa.id]: loading }))
                    }}
                    formatOutput={isFormatOutput}
                  />
                )
              })}
            </div>
          )}
        </ScrollArea>
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

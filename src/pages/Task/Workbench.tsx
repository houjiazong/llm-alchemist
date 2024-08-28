import { FileInput, FileOutput, Loader, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkbench } from '@/hooks/useWorkbench'
import { QAList } from '@/components/QAList'
import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { useToast } from '@/components/ui/use-toast'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/db'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export const TaskWorkbench = () => {
  const {
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
  } = useWorkbench()
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { toast } = useToast()
  if (!task) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="animate-spin" />
      </div>
    )
  }
  const onExport = async () => {
    setExporting(true)
    try {
      const exportQas = (qas || [])
        .filter((item) => {
          if (selectIds.length > 0) {
            return selectIds.includes(item.id)
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
        return toast({
          title: 'Invalid format',
          description: 'The table must have headers: question, answer, rate.',
          variant: 'destructive',
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
      }
      toast({
        title: 'Import successful',
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
  const disabled = exporting || importing || someLoading
  return (
    <div className="space-y-2">
      <div className="text-right space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" disabled={disabled} onClick={onExport}>
              {exporting ? (
                <Loader className="animate-spin w-4 h-4 mr-2" />
              ) : (
                <FileOutput className="h-4 w-4 mr-2" />
              )}
              {selectIds.length > 0 ? 'Export Selected' : 'Export All'}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export table data to excel</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              disabled={disabled}
              onClick={onFileSelect}
            >
              {importing ? (
                <Loader className="animate-spin w-4 h-4 mr-2" />
              ) : (
                <FileInput className="h-4 w-4 mr-2" />
              )}
              Import
            </Button>
          </TooltipTrigger>
          <TooltipContent>Import excel data to table</TooltipContent>
        </Tooltip>
        <Button onClick={onRun} disabled={disabled}>
          {someLoading ? (
            <Loader className="animate-spin w-4 h-4 mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          {selectIds.length > 0 ? 'Run Selected' : 'Run All'}
        </Button>
      </div>
      <div className="rounded-md border">
        <QAList
          qas={qas}
          infos={infos}
          selectIds={selectIds}
          disabled={disabled}
          onQuestionChange={onQuestionChange}
          onQuestionRemove={onQuestionRemove}
          onRateChange={onRateChange}
          onSelectChange={onSelectChange}
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

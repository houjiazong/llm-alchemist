import { FileInputIcon } from 'lucide-react'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { useToast } from './ui/use-toast'
import { useRef } from 'react'
import { db, type OpenAIOptions } from '@/db'
import { v4 as uuidv4 } from 'uuid'

interface TaskImportData {
  name: string
  desc: string
  settings: OpenAIOptions
  workbench: { question: string }[]
}

interface TaskImportProps {
  onSuccess?: (id: number | string) => void
}

export function TaskImport({ onSuccess }: TaskImportProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { toast } = useToast()
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) {
      return toast({
        description: 'Please select a file.',
      })
    }
    try {
      const jsonTxt = await file.text()
      const data: TaskImportData = JSON.parse(jsonTxt)
      if (data) {
        const id = await db.tasks.add({
          ...data,
          id: uuidv4(),
          created_at: Date.now(),
          desc: data.desc ?? '',
          name: data.name ?? '',
          openAIOptions: data?.settings,
          qas: (data?.workbench || []).map((item) => ({
            id: uuidv4(),
            question: item.question,
          })),
        })
        onSuccess?.(id)
      }
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <>
      <Tooltip>
        <TooltipTrigger>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileInputIcon className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Import a task configuration.</p>
        </TooltipContent>
      </Tooltip>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileChange}
      />
    </>
  )
}

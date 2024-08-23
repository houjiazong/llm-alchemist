import { Database } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { exportDB, importInto } from 'dexie-export-import'
import { db } from '@/db'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useRef } from 'react'
import { useToast } from '@/components/ui/use-toast'

export const DBExportImpot = ({
  onImportSuccess,
}: {
  onImportSuccess: () => void
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { toast } = useToast()

  const onExport = async () => {
    try {
      const blob = await exportDB(db, {
        filter: (_table, value) => {
          delete value.id
          if (value?.openAIOptions?.apiKey) {
            // 移除 openAIOptions 对象中的 apiKey
            delete value.openAIOptions.apiKey
          }
          return true
        },
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'database-export.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed: ', error)
    }
  }

  const onImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        await importInto(db, file)
        toast({
          title: 'Import successful',
          description: 'Import successful, please continue your operation.',
        })
        onImportSuccess?.()
      } catch (error) {
        console.error('Import failed: ', error)
      }
    }
  }
  const onFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click() // 触发文件选择对话框
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Database className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExport}>
          <Tooltip>
            <TooltipTrigger className="w-full">Export</TooltipTrigger>
            <TooltipContent side="right">
              <p>
                Your private information, such as API Key, will be removed when
                exporting
              </p>
            </TooltipContent>
          </Tooltip>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onFileSelect} className="cursor-pointer">
          <Tooltip>
            <TooltipTrigger className="w-full">Import</TooltipTrigger>
            <TooltipContent side="right">
              <p>Keep existing data and append newly imported data</p>
            </TooltipContent>
          </Tooltip>
        </DropdownMenuItem>
      </DropdownMenuContent>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={onImport}
      />
    </DropdownMenu>
  )
}

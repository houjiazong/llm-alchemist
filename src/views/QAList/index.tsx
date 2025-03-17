import { QA } from '@/db'
import { QAInfo } from '@/hooks/useWorkbench'

import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TextareaAutosize } from '@/components/ui/textarea-autosize'
import { ReactNode, useMemo } from 'react'
import { CircleX, Clock, ClockArrowDown, Loader } from 'lucide-react'
import Markdown from 'react-markdown'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QAListProps {
  qas: QA[]
  infos: Record<string, QAInfo>
  selectIds: string[]
  disabled?: boolean
  formatOutput?: boolean
  onQuestionChange: (index: number, question: string) => void
  onQuestionRemove: (index: number) => void
  onRateChange: (index: number, rate: number) => void
  onSelectChange: (id: string) => void
  onRun: (id: string) => void
}

export const QAList = ({
  qas,
  infos,
  selectIds,
  disabled,
  formatOutput,
  onQuestionChange,
  onQuestionRemove,
  onRateChange,
  onSelectChange,
  // onRun,
}: QAListProps) => {
  const columns = useMemo(() => {
    const result: ColumnDef<QA>[] = [
      {
        header: ' ',
        accessorKey: '_check',
        id: '_check',
        size: 40,
        minSize: 40,
        enableResizing: false,
        cell: (info) => (
          <Checkbox
            disabled={disabled}
            checked={selectIds.includes(info.row.original.id)}
            onCheckedChange={() => onSelectChange(info.row.original.id)}
          />
        ),
      },
      {
        header: 'Seq',
        id: 'seq',
        cell: (info) => info.row.index + 1,
        size: 40,
        minSize: 40,
        enableResizing: false,
      },
      {
        header: 'Question',
        accessorKey: 'question',
        id: 'question',
        size: 300,
        cell: (info) => (
          <TextareaAutosize
            defaultValue={info.row.original.question}
            onChange={(e) => onQuestionChange(info.row.index, e.target.value)}
            disabled={disabled}
            className="shadow-none border border-transparent text-sm px-2 py-1 text-muted-foreground hover:border-border resize-none"
          />
        ),
      },
      {
        header: 'Answer',
        accessorKey: 'answer',
        id: 'answer',
        size: 300,
      },
      {
        header: 'Rate',
        accessorKey: 'rate',
        id: 'rate',
        size: 80,
        minSize: 80,
        enableResizing: false,
        cell: (info) => {
          if (info.row.original.question && info.row.original.answer) {
            return (
              <Select
                value={`${info.row.original.rate}`}
                onValueChange={(value) =>
                  onRateChange(info.row.index, Number(value))
                }
                disabled={disabled}
              >
                <SelectTrigger className="w-full h-[30px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <SelectItem key={item} value={`${item}`}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          }
        },
      },
      {
        header: ' ',
        accessorKey: '_actions',
        id: '_actions',
        size: 90,
        minSize: 90,
        enableResizing: false,
        cell: (info) => {
          return (
            <div className="flex gap-2">
              {/* <Button
                variant="ghost"
                size="icon"
                className={cn('hidden w-7 h-7', {
                  'group-hover:inline-flex':
                    !!info.row.original.question && !disabled,
                })}
                onClick={() => {
                  onRun(info.row.original.id)
                }}
              >
                <RedoIcon />
              </Button> */}
              <Button
                variant="ghost"
                size="icon"
                className={cn('hidden w-7 h-7', {
                  'group-hover:inline-flex':
                    !!info.row.original.question && !disabled,
                })}
                onClick={() => onQuestionRemove(info.row.index)}
              >
                <CircleX />
              </Button>
            </div>
          )
        },
      },
    ]
    return result
  }, [
    disabled,
    selectIds,
    onSelectChange,
    onQuestionChange,
    onRateChange,
    // onRun,
    onQuestionRemove,
  ])

  const table = useReactTable({
    data: qas,
    columns,
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
    getCoreRowModel: getCoreRowModel(),
  })

  const renderAnswer = (row: QA) => {
    const ret: ReactNode[] = []
    const rowInfo = infos[row.id] || {}
    const timeInfo = (
      <div
        className="flex space-x-2 text-gray-400 text-xs items-center mt-2"
        key="response-info"
      >
        {rowInfo?.responseTime && (
          <div className="flex space-x-1 items-center">
            <ClockArrowDown className="w-4 h-4" />
            <span>Response Time: {rowInfo.responseTime.toFixed(0)}ms</span>
          </div>
        )}
        {rowInfo?.completionTime && (
          <div className="flex space-x-1 items-center">
            <Clock className="w-4 h-4" />
            <span>Completion Time: {rowInfo.completionTime.toFixed(0)}ms</span>
          </div>
        )}
      </div>
    )
    if (rowInfo.loading) {
      ret.push(<Loader className="animate-spin w-4 h-4" key="loading" />)
    }
    if (row.answer) {
      if (formatOutput) {
        ret.push(
          <Markdown
            className="prose prose-sm dark:prose-invert"
            key="answer-format"
          >
            {row.answer}
          </Markdown>
        )
      } else {
        ret.push(<div key="answer">{row.answer}</div>)
      }
    }
    if (rowInfo.error) {
      ret.push(
        <div className="text-red-500" key="error">
          {rowInfo.error}
        </div>
      )
    }
    ret.push(timeInfo)
    return <div className="relative">{ret}</div>
  }

  return (
    <Table className="border">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead
                  className="relative group border"
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{
                    width: header.getSize(),
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  {header.column.getCanResize() && (
                    <div
                      {...{
                        onDoubleClick: () => header.column.resetSize(),
                        onMouseDown: header.getResizeHandler(),
                        onTouchStart: header.getResizeHandler(),
                      }}
                      className={cn(
                        'absolute top-1 bottom-1 w-1 bg-gray-200 cursor-col-resize select-none touch-none right-0 opacity-0 group-hover:opacity-100 dark:bg-slate-600',
                        table.options.columnResizeDirection,
                        {
                          'opacity-100': header.column.getIsResizing(),
                        }
                      )}
                    />
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="group">
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  className="border relative"
                  key={cell.id}
                  style={{
                    width: cell.column.getSize(),
                  }}
                >
                  {cell.column.id === 'answer'
                    ? renderAnswer(cell.row.original)
                    : flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center border"
            >
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

QAList.disPlayName = 'QAList'

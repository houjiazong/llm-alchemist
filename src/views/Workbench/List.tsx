import { type QA } from '@/db'
import { type ChangeEvent, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { isEmpty } from 'es-toolkit/compat'
import { WorkbenchItem } from './Item'
import { ScrollArea } from '@/components/ui/scroll-area'

interface WorkbenchListProps {
  data: QA[] | undefined
}

export function WorkbenchList({ data }: WorkbenchListProps) {
  const [qas, setQAS] = useState<QA[]>([])

  useEffect(() => {
    setQAS(data || [])
  }, [data])

  useEffect(() => {
    const lastQA = qas[qas.length - 1]

    if (lastQA && !isEmpty(lastQA.question.trim())) {
      setQAS([...qas, { id: uuidv4(), question: '' }])
    }

    if (
      qas.length > 1 &&
      isEmpty(qas[qas.length - 2].question.trim()) &&
      isEmpty(lastQA.question.trim())
    ) {
      setQAS(qas.slice(0, -1))
    }
  }, [qas])

  const handlePromptInputChange = (
    id: string,
    e: ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value

    const updatedItems = qas.map((item) =>
      item.id === id ? { ...item, question: newValue } : item
    )

    setQAS(updatedItems)
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 px-4">
        {qas.map((qa, index) => (
          <WorkbenchItem
            index={index}
            item={qa}
            key={qa.id}
            onPromptChange={handlePromptInputChange}
          />
        ))}
      </div>
    </ScrollArea>
  )
}

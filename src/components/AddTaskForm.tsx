import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { db } from '@/db'
import { Textarea } from '@/components/ui/textarea'

const AddTaskFormSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: 'name must be at least 1 characters.',
    })
    .max(14, {
      message: 'name must be at most 14 characters.',
    }),
  desc: z.string(),
})

interface AddTaskFormProps {
  onSuccess?: (id: number) => void
}

export const AddTaskForm = ({ onSuccess }: AddTaskFormProps) => {
  const form = useForm<z.infer<typeof AddTaskFormSchema>>({
    resolver: zodResolver(AddTaskFormSchema),
    defaultValues: {
      name: '',
      desc: '',
    },
  })
  const [submiting, setSubmiting] = useState(false)

  async function onSubmit(data: z.infer<typeof AddTaskFormSchema>) {
    setSubmiting(true)
    try {
      const id = await db.tasks.add({
        ...data,
        created_at: Date.now(),
      })
      onSuccess?.(id)
    } finally {
      setSubmiting(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        autoComplete="off"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Task name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="desc"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea placeholder="Task description" rows={3} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="text-right">
          <Button type="submit" disabled={submiting}>
            {submiting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit
          </Button>
        </div>
      </form>
    </Form>
  )
}

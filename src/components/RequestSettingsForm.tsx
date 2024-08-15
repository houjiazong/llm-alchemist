import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  // FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CircleX, Loader2 } from 'lucide-react'
import { Textarea } from './ui/textarea'

const methods = ['GET', 'POST']
export const SettingsFormSchema = z.object({
  method: z.string().min(1, 'Method is required'),
  url: z.string().url('Invalid URL'),
  headers: z
    .array(
      z.object({
        key: z.string().min(1, 'Key is required'),
        value: z.string().min(1, 'Value is required'),
      })
    )
    .optional(),
  body: z.string().optional(),
})

interface RequestSettingsFormProps {
  onSubmit?: (data: z.infer<typeof SettingsFormSchema>) => void
}
export const RequestSettingsForm = ({ onSubmit }: RequestSettingsFormProps) => {
  const form = useForm<z.infer<typeof SettingsFormSchema>>({
    resolver: zodResolver(SettingsFormSchema),
    defaultValues: {
      method: 'POST',
      url: '',
    },
  })
  const [submiting, setSubmiting] = useState(false)
  const {
    fields: headerFields,
    append: headerAppend,
    remove: headerRemove,
  } = useFieldArray({
    control: form.control,
    name: 'headers',
  })
  async function _onSubmit(data: z.infer<typeof SettingsFormSchema>) {
    setSubmiting(true)
    try {
      await onSubmit?.(data)
    } finally {
      setSubmiting(false)
    }
  }
  const methodValue = form.watch('method')
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(_onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Method</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {methods.map((method) => {
                        return (
                          <SelectItem value={method} key={method}>
                            {method}
                          </SelectItem>
                        )
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="API URL" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="space-y-4">
          {headerFields.map((item, index) => (
            <div key={item.id} className="flex">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name={`headers.${index}.key`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder={`Key ${index + 1}`} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`headers.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder={`Value ${index + 1}`} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <Button
                variant="ghost"
                onClick={() => headerRemove(index)}
                className="ml-2"
              >
                <CircleX className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button onClick={() => headerAppend({ key: '', value: '' })}>
            Add Header
          </Button>
        </div>
        {methodValue !== 'GET' && (
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body</FormLabel>
                <FormControl>
                  <Textarea placeholder="Request Body" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}
        {JSON.stringify(form.formState.errors)}
        <Button type="submit" disabled={submiting}>
          {submiting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit
        </Button>
      </form>
    </Form>
  )
}

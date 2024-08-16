import { FormEvent, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  type ControllerRenderProps,
  useFieldArray,
  useForm,
} from 'react-hook-form'
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
  // FormMessage,
} from '@/components/ui/form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
        key: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  body: z.string().optional(),
  script: z.object({
    request: z.string().optional(),
    response: z.string().optional(),
  }),
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
      headers: [
        {
          key: '',
          value: '',
        },
      ],
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
  const headersValue = form.watch('headers')
  const headerValueOnInput = (
    value: FormEvent<HTMLInputElement>,
    field: ControllerRenderProps<
      z.infer<typeof SettingsFormSchema>,
      `headers.${number}.key` | `headers.${number}.value`
    >,
    index: number
  ) => {
    field.onChange(value)
    if (
      (value.target as HTMLInputElement).value.trim() &&
      headersValue?.length &&
      !headersValue[index + 1]
    ) {
      headerAppend({ key: '', value: '' })
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(_onSubmit)} className="space-y-4">
        {/* api method & url */}
        <div className="flex">
          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem className="w-32">
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger className="border-r-0 rounded-r-none focus:ring-offset-0 focus:ring-0">
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
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder="API URL"
                    {...field}
                    className="fborder-l-0 rounded-l-none"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Tabs defaultValue="headers">
          <div>
            <TabsList>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              {methodValue !== 'GET' && (
                <TabsTrigger value="body">Body</TabsTrigger>
              )}
              <TabsTrigger value="script">Script</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="headers">
            {/* headers */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="w-[60px] text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {headerFields.map((item, index) => {
                  return (
                    <TableRow key={item.id} className="group">
                      <TableCell className="p-2">
                        <FormField
                          control={form.control}
                          name={`headers.${index}.key`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder={`Key ${index + 1}`}
                                  value={field.value}
                                  onInput={(value) =>
                                    headerValueOnInput(value, field, index)
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <FormField
                          control={form.control}
                          name={`headers.${index}.value`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder={`Value ${index + 1}`}
                                  value={field.value}
                                  onInput={(value) =>
                                    headerValueOnInput(value, field, index)
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        {headersValue && headersValue?.length > 1 && (
                          <Button
                            className=""
                            variant="ghost"
                            onClick={() => headerRemove(index)}
                            size="icon"
                          >
                            <CircleX className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TabsContent>
          {methodValue !== 'GET' && (
            <TabsContent value="body">
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Request Body"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </TabsContent>
          )}
          <TabsContent value="script">
            <Tabs defaultValue="request" className="flex border-3 gap-1">
              <div className="flex-shrink-0 flex-grow-0">
                <TabsList className="flex flex-col h-auto">
                  <TabsTrigger value="request">Request</TabsTrigger>
                  <TabsTrigger value="response">Response</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="request" className="mt-0 flex-1">
                <FormField
                  control={form.control}
                  name="script.request"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Request script"
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
              <TabsContent value="response" className="mt-0 flex-1">
                <FormField
                  control={form.control}
                  name="script.response"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Response script"
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
        <div>
          <Button type="submit" disabled={submiting}>
            {submiting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
          <Button className="ml-2" variant="ghost">
            Test the connection
          </Button>
        </div>
      </form>
    </Form>
  )
}

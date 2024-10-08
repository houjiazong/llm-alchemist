import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { type OpenAIOptions } from '@/db'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'

const openAIConfigSchema = z.object({
  baseURL: z.string().min(1, 'Base URL is required'),
  apiKey: z.string().min(1, 'API Key is required'),
  params: z.object({
    model: z.string().min(1, 'Model is required'),
    prompt: z.string().optional(),
    max_tokens: z
      .number()
      .int()
      .min(1, { message: 'Max tokens must be greater than 0' })
      .max(4096, { message: 'Max tokens must be less than or equal to 4096' }),
    temperature: z
      .number()
      .min(0, { message: 'Temperature must be between 0 and 1' })
      .max(1, { message: 'Temperature must be between 0 and 1' }),
    stream: z.boolean().optional(),
  }),
})

export type OpenAIConfig = z.infer<typeof openAIConfigSchema>

interface OpenAIConfigFormProps {
  onSubmit?: (data: OpenAIConfig) => void
  value?: OpenAIOptions
}
export const OpenAIConfigForm = ({
  onSubmit,
  value,
}: OpenAIConfigFormProps) => {
  const { toast } = useToast()
  const [submiting, setSubmiting] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const form = useForm<OpenAIConfig>({
    resolver: zodResolver(openAIConfigSchema),
    defaultValues: {
      baseURL: value?.baseURL ?? '',
      apiKey: value?.apiKey ?? '',
      params: {
        model: value?.params?.model ?? '',
        prompt: value?.params?.prompt ?? '',
        max_tokens: value?.params?.max_tokens ?? 200,
        temperature: value?.params?.temperature ?? 0.7,
        stream: value?.params?.stream ?? false,
      },
    },
  })
  useEffect(() => {
    form.reset({
      baseURL: value?.baseURL ?? '',
      apiKey: value?.apiKey ?? '',
      params: {
        model: value?.params?.model ?? '',
        prompt: value?.params?.prompt ?? '',
        max_tokens: value?.params?.max_tokens ?? 200,
        temperature: value?.params?.temperature ?? 0.7,
        stream: value?.params?.stream ?? false,
      },
    })
  }, [form, value])
  async function _onSubmit(data: OpenAIConfig) {
    setSubmiting(true)
    try {
      await onSubmit?.(data)
      toast({
        title: 'Saved successfully',
        description: 'Please go to the workbench page to test',
      })
    } finally {
      setSubmiting(false)
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(_onSubmit)} autoComplete="off">
        <div className="grid items-stretch gap-6 md:grid-cols-[1fr_240px]">
          <div className="flex-col space-y-4 sm:flex md:order-2">
            <FormField
              control={form.control}
              name="baseURL"
              render={({ field }) => (
                <FormItem className="grid gap-2 space-y-0">
                  <FormLabel>Base URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Base URL" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem className="grid gap-2 space-y-0">
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="API Key"
                        {...field}
                        style={
                          showKey
                            ? {}
                            : {
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                WebkitTextSecurity: 'disc',
                                textSecurity: 'disc',
                              }
                        }
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                      >
                        {!showKey ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="params.model"
              render={({ field }) => (
                <FormItem className="grid gap-2 space-y-0">
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input placeholder="Model" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="params.temperature"
              render={({ field }) => (
                <FormItem className="grid gap-4 space-y-0">
                  <div className="flex items-center justify-between">
                    <FormLabel>Temperature</FormLabel>
                    <span className="w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm text-muted-foreground hover:border-border">
                      {field.value}
                    </span>
                  </div>
                  <FormControl>
                    <Slider
                      min={0.1}
                      max={1}
                      step={0.1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(Number(value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="params.max_tokens"
              render={({ field }) => (
                <FormItem className="grid gap-4 space-y-0">
                  <div className="flex items-center justify-between">
                    <FormLabel>Max Tokens</FormLabel>
                    <Input
                      className="h-6 w-20 shadow-none border border-transparent text-right text-sm px-2 py-0.5 text-muted-foreground hover:border-border"
                      dir="rtl"
                      type="number"
                      min={1}
                      max={4096}
                      step={1}
                      value={field.value}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10)
                        if (!isNaN(value)) {
                          field.onChange(value)
                        }
                      }}
                    />
                  </div>
                  <FormControl>
                    <Slider
                      min={1}
                      max={4096}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(Number(value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="params.stream"
              render={({ field }) => (
                <FormItem className="grid gap-4 space-y-0">
                  <div className="flex items-center justify-between">
                    <FormLabel>Stream</FormLabel>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(value) => {
                        field.onChange(value)
                      }}
                    />
                  </div>
                </FormItem>
              )}
            />
            <div>
              <Button type="submit" disabled={submiting} className="w-full">
                {submiting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
          <div className="md:order-1">
            <div className="flex flex-col space-y-4">
              <FormField
                control={form.control}
                name="params.prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        // className="min-h-[400px] flex-1 p-4 md:min-h-[500px] lg:min-h-[600px]"
                        className="h-[420px]"
                        placeholder="Write your prompt here"
                        rows={10}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}

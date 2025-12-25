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
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { type OpenAIOptions } from '@/db'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const BASE_URL_SUGGESTIONS = [
  'https://api.vivgrid.com/v1',
  'https://api.openai.com/v1',
  'http://localhost:9000/v1',
]

const maskApiKey = (apiKey: string) => {
  if (!apiKey) return ''
  if (apiKey.length <= 8) return apiKey
  const prefix = apiKey.slice(0, 4)
  const suffix = apiKey.slice(-4)
  return `${prefix}${'*'.repeat(Math.max(apiKey.length - 8, 0))}${suffix}`
}

const openAIConfigSchema = z.object({
  baseURL: z.string().min(1, 'Base URL is required'),
  apiKey: z.string().min(1, 'API Key is required'),
  params: z.object({
    model: z.string().optional(),
    max_tokens: z
      .number()
      .int()
      .min(1, { message: 'Max tokens must be greater than 0' })
      .max(8192, { message: 'Max tokens must be less than or equal to 8192' })
      .optional(),
    temperature: z
      .number()
      .min(0, { message: 'Temperature must be between 0 and 2' })
      .max(2, { message: 'Temperature must be between 0 and 2' }),
    stream: z.boolean().optional(),
  }),
})

export type OpenAIConfig = z.infer<typeof openAIConfigSchema>

interface OpenAIConfigFormProps {
  onSubmit?: (data: OpenAIConfig) => void
  value?: OpenAIOptions
  category?: string
}
export const OpenAIConfigForm = ({
  onSubmit,
  value,
  category,
}: OpenAIConfigFormProps) => {
  const [submiting, setSubmiting] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [baseURLInputFocused, setBaseURLInputFocused] = useState(false)
  const [commandSelected, setCommandSelected] = useState<string>('')
  const form = useForm<OpenAIConfig>({
    resolver: zodResolver(openAIConfigSchema),
    defaultValues: {
      baseURL: value?.baseURL ?? '',
      apiKey: value?.apiKey ?? '',
      params: {
        model: value?.params?.model ?? '',
        max_tokens: value?.params?.max_tokens ?? 4096,
        temperature: value?.params?.temperature ?? 0.7,
        stream: value?.params?.stream ?? true,
      },
    },
  })
  const inputBaseURL = form.watch('baseURL')
  const apiKeyValue = form.watch('apiKey') || ''
  const inputMaxTokens = form.watch('params.max_tokens')
  const maskedApiKey = useMemo(() => maskApiKey(apiKeyValue), [apiKeyValue])
  useEffect(() => {
    form.reset({
      baseURL: value?.baseURL ?? '',
      apiKey: value?.apiKey ?? '',
      params: {
        model: value?.params?.model ?? '',
        max_tokens: value?.params?.max_tokens ?? 4096,
        temperature: value?.params?.temperature ?? 0.7,
        stream: value?.params?.stream ?? true,
      },
    })
  }, [form, value])
  async function _onSubmit(data: OpenAIConfig) {
    setSubmiting(true)
    try {
      await onSubmit?.(data)
      toast('Saved successfully', {
        description: 'Please go to the workbench page to test',
      })
    } finally {
      setSubmiting(false)
    }
  }

  const filteredBaseURLSuggestions = useMemo(() => {
    return BASE_URL_SUGGESTIONS.filter(
      (str) => str.includes(inputBaseURL) && str !== inputBaseURL
    )
  }, [inputBaseURL])
  const baseURLSuggestionsOpened = useMemo(() => {
    return baseURLInputFocused && filteredBaseURLSuggestions.length > 0
  }, [baseURLInputFocused, filteredBaseURLSuggestions])

  const prev = (e: React.KeyboardEvent) => {
    e.preventDefault()
    const index = filteredBaseURLSuggestions.findIndex(
      (item) => item === commandSelected
    )
    let newSelected = filteredBaseURLSuggestions[index - 1]
    if (!newSelected) {
      newSelected =
        filteredBaseURLSuggestions[filteredBaseURLSuggestions.length - 1]
    }
    setCommandSelected(newSelected)
  }
  const next = (e: React.KeyboardEvent) => {
    e.preventDefault()
    const index = filteredBaseURLSuggestions.findIndex(
      (item) => item === commandSelected
    )
    let newSelected = filteredBaseURLSuggestions[index + 1]
    if (!newSelected) {
      newSelected = filteredBaseURLSuggestions[0]
    }
    setCommandSelected(newSelected)
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(_onSubmit)}
        autoComplete="off"
        className="mt-1"
      >
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Chat Completions API Configuration
            </CardTitle>
            <CardDescription>
              Configure the endpoint, credentials, and model parameters for
              OpenAI API compatible endpoint.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <FormField
              control={form.control}
              name="baseURL"
              render={({ field }) => (
                <FormItem className="grid gap-2 space-y-0">
                  <FormLabel>Base URL</FormLabel>
                  <FormControl>
                    <Popover open={baseURLSuggestionsOpened}>
                      <PopoverAnchor>
                        <Input
                          placeholder="Base URL"
                          {...field}
                          disabled={!!category}
                          onFocus={() => setBaseURLInputFocused(true)}
                          onBlur={() => setBaseURLInputFocused(false)}
                          onKeyDown={(e) => {
                            const isComposing =
                              e.nativeEvent.isComposing || e.keyCode === 229
                            if (e.defaultPrevented || isComposing) {
                              return
                            }
                            switch (e.key) {
                              case 'ArrowDown': {
                                if (baseURLSuggestionsOpened) {
                                  next(e)
                                }
                                break
                              }
                              case 'ArrowUp': {
                                if (baseURLSuggestionsOpened) {
                                  prev(e)
                                }
                                break
                              }
                              case 'Enter': {
                                if (baseURLSuggestionsOpened) {
                                  e.preventDefault()
                                  form.setValue('baseURL', commandSelected)
                                }
                              }
                            }
                          }}
                        />
                      </PopoverAnchor>

                      <PopoverContent
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        className="w-[--radix-popover-trigger-width] p-0"
                      >
                        <Command value={commandSelected}>
                          <CommandList>
                            <CommandGroup heading="Suggestions">
                              {filteredBaseURLSuggestions.map((str) => {
                                return (
                                  <CommandItem
                                    key={str}
                                    onSelect={(val) =>
                                      form.setValue('baseURL', val)
                                    }
                                  >
                                    {str}
                                  </CommandItem>
                                )
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
                      <div className="relative w-full">
                        <Input
                          disabled={!!category}
                          placeholder="API Key"
                          {...field}
                          value={apiKeyValue}
                          className={
                            !showKey && apiKeyValue
                              ? 'text-transparent caret-foreground font-mono'
                              : 'font-mono'
                          }
                        />
                        {!showKey && apiKeyValue && (
                          <span className="pointer-events-none absolute inset-0 flex items-center px-3 py-1 text-sm text-foreground font-mono">
                            {maskedApiKey}
                          </span>
                        )}
                      </div>
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
            <Accordion type="single" collapsible>
              <AccordionItem value="advanced" className="border-b-0">
                <AccordionTrigger className="py-0">
                  Advanced Settings
                </AccordionTrigger>
                <AccordionContent className="py-0 m-1">
                  <div className="flex-col space-y-4 sm:flex md:order-2 pt-4">
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
                          <div className="flex items-center justify-between h-7">
                            <FormLabel>Temperature</FormLabel>
                            <span className="w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm text-muted-foreground hover:border-border">
                              {field.value}
                            </span>
                          </div>
                          <FormControl>
                            <Slider
                              min={0.1}
                              max={2}
                              step={0.1}
                              value={[field.value]}
                              onValueChange={(value) =>
                                field.onChange(Number(value))
                              }
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
                          <div className="flex items-center justify-between h-7">
                            <FormLabel>Max Completion Tokens</FormLabel>
                            <span className="w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm text-muted-foreground hover:border-border">
                              {inputMaxTokens}
                            </span>
                          </div>
                          <FormControl>
                            <Input
                              type="number"
                              max={8192}
                              step={1024}
                              value={inputMaxTokens ?? ''}
                              onChange={(e) => {
                                const inputValue = e.target.value
                                if (inputValue === '') {
                                  console.log(inputValue)
                                  field.onChange(undefined)
                                  return
                                }

                                let parsed = parseInt(inputValue, 10)
                                if (!isNaN(parsed)) {
                                  if (parsed > 8192) parsed = 8192
                                  field.onChange(parsed)
                                }
                              }}
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
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter className="border-t border-border bg-background/60 justify-end px-6 py-4">
            <Button type="submit" disabled={submiting}>
              {submiting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

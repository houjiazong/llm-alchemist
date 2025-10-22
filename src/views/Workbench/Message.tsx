import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CodeToHtmlOptions } from '@llm-ui/code'
import {
  allLangs,
  allLangsAlias,
  codeBlockLookBack,
  findCompleteCodeBlock,
  findPartialCodeBlock,
  loadHighlighter,
  useCodeBlockToHtml,
} from '@llm-ui/code'
import { markdownLookBack } from '@llm-ui/markdown'
import {
  throttleBasic,
  useLLMOutput,
  type LLMOutputComponent,
} from '@llm-ui/react'
import parseHtml from 'html-react-parser'
import { CheckIcon, CopyIcon } from 'lucide-react'
import { memo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getHighlighterCore } from 'shiki/core'
import { bundledLanguagesInfo } from 'shiki/langs'
import { bundledThemes } from 'shiki/themes'
import getWasm from 'shiki/wasm'
import { useCopyToClipboard } from '@uidotdev/usehooks'
import { ClassValue } from 'clsx'

const MarkdownComponent: LLMOutputComponent<{ className?: ClassValue }> = ({
  className,
  blockMatch,
}) => {
  const markdown = blockMatch.output
  return (
    <ReactMarkdown
      className={cn('markdown', className)}
      remarkPlugins={[remarkGfm]}
    >
      {markdown}
    </ReactMarkdown>
  )
}

const highlighter = loadHighlighter(
  getHighlighterCore({
    langs: allLangs(bundledLanguagesInfo),
    langAlias: allLangsAlias(bundledLanguagesInfo),
    themes: Object.values(bundledThemes),
    loadWasm: getWasm,
  })
)

const codeToHtmlOptions: CodeToHtmlOptions = {
  theme: 'github-dark',
}

const CodeBlock: LLMOutputComponent = ({ blockMatch }) => {
  const { html, code } = useCodeBlockToHtml({
    markdownCodeBlock: blockMatch.output,
    highlighter,
    codeToHtmlOptions,
  })
  if (!html) {
    return (
      <pre className="shiki">
        <code>{code}</code>
      </pre>
    )
  }
  return <>{parseHtml(html)}</>
}

export const Message = memo(
  ({
    markdownClassName,
    message,
    isStreamFinished,
  }: {
    markdownClassName?: ClassValue
    message: string
    isStreamFinished: boolean
  }) => {
    const [, copyToClipboard] = useCopyToClipboard()
    const [isCopied, setIsCopied] = useState(false)

    const { blockMatches } = useLLMOutput({
      llmOutput: message,
      fallbackBlock: {
        component: (props) => (
          <MarkdownComponent className={markdownClassName} {...props} />
        ),
        lookBack: markdownLookBack(),
      },
      blocks: [
        {
          component: CodeBlock,
          findCompleteMatch: findCompleteCodeBlock(),
          findPartialMatch: findPartialCodeBlock(),
          lookBack: codeBlockLookBack(),
        },
      ],
      isStreamFinished,
      throttle: throttleBasic({
        targetBufferChars: 60,
      }),
    })

    const Icon = isCopied ? CheckIcon : CopyIcon

    return (
      <div className="relative group">
        <Button
          className={cn(
            'absolute -top-6 -right-2 !transition-opacity !ease-in !duration-150 group-hover:opacity-100 ',
            isCopied ? 'opacity-100' : 'opacity-0'
          )}
          size="sm"
          variant="secondary"
          onClick={() => {
            copyToClipboard(message)
            setIsCopied(true)
            setTimeout(() => {
              setIsCopied(false)
            }, 2000)
          }}
        >
          <Icon className="h-4 w-4" />
          {isCopied ? 'Copied' : 'Copy'}
        </Button>
        {blockMatches.map((blockMatch, index) => {
          const Component = blockMatch.block.component
          return <Component key={index} blockMatch={blockMatch} />
        })}
      </div>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.markdownClassName === nextProps.markdownClassName &&
      prevProps.message === nextProps.message &&
      prevProps.isStreamFinished === nextProps.isStreamFinished
    )
  }
)

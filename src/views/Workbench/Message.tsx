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
import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getHighlighterCore } from 'shiki/core'
import { bundledLanguagesInfo } from 'shiki/langs'
import { bundledThemes } from 'shiki/themes'
import getWasm from 'shiki/wasm'

const MarkdownComponent: LLMOutputComponent = ({ blockMatch }) => {
  const markdown = blockMatch.output
  return (
    <ReactMarkdown className="markdown" remarkPlugins={[remarkGfm]}>
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
    message,
    isStreamFinished,
  }: {
    message: string
    isStreamFinished: boolean
  }) => {
    const { blockMatches } = useLLMOutput({
      llmOutput: message,
      fallbackBlock: {
        component: MarkdownComponent,
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
        readAheadChars: 10, // 每次尝试预读一点点
        targetBufferChars: 30, // 缓冲到30个字符就推送一次，尽量细粒度显示
        adjustPercentage: 0.2, // 如果帧率下降，自动减少更新频率
        frameLookBackMs: 300, // 最近300ms渲染帧率作为参考
        windowLookBackMs: 1500, // 过去1.5秒整体帧率做趋势判断
      }),
    })

    return (
      <div>
        {blockMatches.map((blockMatch, index) => {
          const Component = blockMatch.block.component
          return <Component key={index} blockMatch={blockMatch} />
        })}
      </div>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.message === nextProps.message &&
      prevProps.isStreamFinished === nextProps.isStreamFinished
    )
  }
)

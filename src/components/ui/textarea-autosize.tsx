import * as React from 'react'
import ReactTextareaAutosize, {
  type TextareaAutosizeProps as ReactTextareaAutosizeProps,
} from 'react-textarea-autosize'

import { cn } from '@/lib/utils'

export type TextareaAutosizeProps = ReactTextareaAutosizeProps &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'style'> & {
    style?: React.CSSProperties
  }

const TextareaAutosize = React.forwardRef<
  HTMLTextAreaElement,
  TextareaAutosizeProps
>(({ className, ...props }, ref) => {
  return (
    <ReactTextareaAutosize
      className={cn(
        'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
TextareaAutosize.displayName = 'TextareaAutosize'

export { TextareaAutosize }

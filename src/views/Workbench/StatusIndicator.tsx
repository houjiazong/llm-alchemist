import { QA } from '@/db'
import { cn } from '@/lib/utils'
import { isEmpty, isNil } from 'es-toolkit/compat'
import { motion } from 'motion/react'

export function StatusIndicator({
  qas,
  loadings,
  scrollToItem,
}: {
  qas: QA[]
  loadings: { [id: string]: boolean }
  scrollToItem?: (id: string) => void
}) {
  return (
    <div className="items-center flex-wrap flex gap-2.5">
      {qas.map((item) => {
        const hasQuestion = !isNil(item.question) && !isEmpty(item.question)
        if (!hasQuestion) return null
        const hasAnswer = !isNil(item.answer) && !isEmpty(item.answer)
        const hasError = !isNil(item.error) && !isEmpty(item.error)
        const isLoading = loadings[item.id]
        return (
          <motion.div
            key={item.id}
            onClick={() => scrollToItem?.(item.id)}
            className={cn(
              'rounded-full w-4 h-4 bg-gray-300 transition-colors duration-300 ease-in-out cursor-pointer',
              'ring-2 ring-offset-1 ring-offset-white shadow-lg shadow-gray-300/40 ring-gray-300/30',
              {
                'bg-red-500 shadow-red-500/40 ring-red-500/30':
                  !hasAnswer && !isLoading && hasError,
                'bg-green-500 shadow-green-500/40 ring-green-500/30':
                  hasAnswer && !isLoading && !hasError,
                'bg-yellow-500 shadow-yellow-500/40 ring-yellow-500/30':
                  isLoading,
              }
            )}
            variants={{
              hover: {
                scale: 1.2,
                transition: {
                  type: 'spring',
                  stiffness: 400,
                  damping: 10,
                },
              },
              tap: {
                scale: 0.9,
              },
            }}
            whileHover="hover"
            whileTap="tap"
            transition={
              isLoading
                ? {
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  }
                : {}
            }
            animate={
              isLoading
                ? {
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }
                : {
                    scale: 1,
                    opacity: 1,
                  }
            }
          />
        )
      })}
    </div>
  )
}

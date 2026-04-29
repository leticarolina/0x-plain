'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TransactionInputProps {
  onSubmit: (hash: string) => void
  isLoading: boolean
  initialValue?: string
}

export function TransactionInput({ onSubmit, isLoading, initialValue = '' }: TransactionInputProps) {
  const [input, setInput] = useState(initialValue)

  useEffect(() => {
    if (initialValue) {
      setInput(initialValue)
    }
  }, [initialValue])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    onSubmit(input.trim())
  }

  const isValidHash = /^0x[a-fA-F0-9]{64}$/.test(input.trim())

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste transaction hash (0x...)"
            className="w-full h-14 px-4 bg-muted/50 border border-border rounded-xl font-mono text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            disabled={isLoading}
            autoComplete="off"
            spellCheck={false}
          />
          {input && !isValidHash && (
            <p className="absolute -bottom-6 left-0 text-xs text-destructive">
              Enter a valid transaction hash (0x + 64 hex characters)
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isLoading || !input.trim() || !isValidHash}
          className="h-12 px-6 bg-foreground hover:bg-foreground/90 text-background font-medium rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Explain Transaction</span>
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

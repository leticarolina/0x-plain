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
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="0x..."
            className="w-full h-14 px-4 bg-input border border-border rounded-lg font-mono text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            disabled={isLoading}
            autoComplete="off"
            spellCheck={false}
          />
          {input && !isValidHash && (
            <p className="absolute -bottom-6 left-0 text-xs text-destructive">
              Please enter a valid transaction hash (0x + 64 hex characters)
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isLoading || !input.trim() || !isValidHash}
          className="h-14 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Explain Transaction</span>
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

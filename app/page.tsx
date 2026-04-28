'use client'

import { useState } from 'react'
import { TransactionInput } from '@/components/transaction-input'
import { ExplanationCard } from '@/components/explanation-card'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { RotateCcw } from 'lucide-react'

export default function Home() {
  const [txHash, setTxHash] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/explain' }),
  })

  const handleReset = () => {
    setTxHash('')
    setHasSearched(false)
    setMessages([])
  }

  const isLoading = status === 'streaming' || status === 'submitted'

  const handleSubmit = async (hash: string) => {
    if (!hash.trim() || isLoading) return
    setTxHash(hash)
    setHasSearched(true)
    sendMessage({ text: hash }, { body: { txHash: hash } })
  }

  // Get the latest assistant message
  const latestResponse = messages
    .filter((m) => m.role === 'assistant')
    .pop()

  // Extract text from parts
  const responseText = latestResponse?.parts
    ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('') || ''

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-4 md:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-mono font-bold text-lg">0x</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">0xPlain</h1>
              <p className="text-sm text-muted-foreground">Blockchain Transaction Explainer</p>
            </div>
          </div>
          {hasSearched && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">New Search</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 py-8 md:px-6 md:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section - only show when no search yet */}
          {!hasSearched && (
            <div className="text-center space-y-4 py-8 md:py-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
                Understand any transaction
                <br />
                <span className="text-primary">in plain English</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto text-pretty">
                Paste any Ethereum transaction hash and get a detailed, human-readable explanation of exactly what happened.
              </p>
            </div>
          )}

          {/* Input Section */}
          <TransactionInput
            onSubmit={handleSubmit}
            isLoading={isLoading}
            initialValue={txHash}
          />

          {/* Results Section */}
          {hasSearched && (
            <ExplanationCard
              txHash={txHash}
              content={responseText}
              isLoading={isLoading}
            />
          )}

          {/* Example transactions - only show when no search */}
          {!hasSearched && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">Try these examples:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  '0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060',
                  '0xa1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d',
                ].map((hash) => (
                  <button
                    key={hash}
                    onClick={() => handleSubmit(hash)}
                    className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg font-mono text-xs hover:bg-secondary/80 transition-colors truncate max-w-[280px]"
                  >
                    {hash.slice(0, 10)}...{hash.slice(-8)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>Powered by AI with real-time blockchain data</p>
        </div>
      </footer>
    </main>
  )
}

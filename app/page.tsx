'use client'

import { useState } from 'react'
import { TransactionInput } from '@/components/transaction-input'
import { ExplanationCard } from '@/components/explanation-card'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { RotateCcw } from 'lucide-react'
import { Logo } from '@/components/logo'

export default function Home() {
  const [txHash, setTxHash] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/explain' }),
    onError: (err) => {
      setError(err.message || 'Failed to analyze transaction')
    },
  })

  const handleReset = () => {
    setTxHash('')
    setHasSearched(false)
    setMessages([])
    setError(null)
  }

  const isLoading = status === 'streaming' || status === 'submitted'

  const handleSubmit = async (hash: string) => {
    if (!hash.trim() || isLoading) return
    setTxHash(hash)
    setHasSearched(true)
    setError(null)
    sendMessage({ text: hash }, { body: { txHash: hash } })
  }

  const latestResponse = messages
    .filter((m) => m.role === 'assistant')
    .pop()

  const responseText = latestResponse?.parts
    ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('') || ''

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Colorful gradient bar at top */}
      <div className="h-1 gradient-bar" />
      
      {/* Header */}
      <header className="px-4 py-5 md:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-9 h-9" />
            <span className="text-xl font-semibold text-foreground tracking-tight">0xPlain</span>
          </div>
          {hasSearched && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">New Search</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 md:px-6 md:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Hero Section */}
          {!hasSearched && (
            <div className="space-y-4 py-8 md:py-16">
              <p className="text-sm font-medium text-primary uppercase tracking-wider">Transaction Explorer</p>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight tracking-tight">
                Understand any<br />blockchain transaction
              </h1>
              <p className="text-muted-foreground text-lg max-w-lg leading-relaxed">
                Paste an Ethereum transaction hash and get a clear, human-readable explanation of what happened.
              </p>
            </div>
          )}

          {/* Input Section */}
          <TransactionInput
            onSubmit={handleSubmit}
            isLoading={isLoading}
            initialValue={txHash}
          />

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
              <p className="text-destructive font-medium text-sm">Error</p>
              <p className="text-destructive/70 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Results Section */}
          {hasSearched && !error && (
            <ExplanationCard
              txHash={txHash}
              content={responseText}
              isLoading={isLoading}
            />
          )}

          {/* Example transactions */}
          {!hasSearched && (
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">Try an example:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { hash: '0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060', label: 'First ETH Transfer' },
                  { hash: '0xfe07e3a0e7c1a0b89ca52bb389053927b69c36a059eae5908383411617c06285', label: 'Inscription Mint' },
                ].map((example) => (
                  <button
                    key={example.hash}
                    onClick={() => handleSubmit(example.hash)}
                    className="px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm hover:bg-secondary/70 transition-colors"
                  >
                    {example.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="px-4 py-6 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="h-px bg-border mb-6" />
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>Currently supports Ethereum mainnet</p>
            <p>Powered by AI + Etherscan</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

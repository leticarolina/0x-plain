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
    <main className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Colorful gradient bar at top */}
      <div className="h-1 gradient-bar flex-shrink-0" />
      
      {/* Header - minimal */}
      <header className="px-6 py-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo className="w-7 h-7" />
            <span className="text-lg font-medium text-foreground tracking-tight">0xPlain</span>
          </div>
          {hasSearched && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content - centered vertically */}
      <div className="flex-1 flex items-center justify-center px-6 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {/* Landing View */}
          {!hasSearched ? (
            <div className="text-center space-y-8">
              {/* Hero Title */}
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl tracking-tight">
                  <span className="font-light text-muted-foreground">Understand any </span>
                  <span className="font-semibold gradient-text">blockchain</span>
                  <br />
                  <span className="font-semibold gradient-text">transaction</span>
                  <span className="font-light text-muted-foreground"> in plain English</span>
                </h1>
              </div>

              {/* Input */}
              <div className="max-w-xl mx-auto">
                <TransactionInput
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  initialValue={txHash}
                />
              </div>

              {/* Example buttons */}
              <div className="flex flex-wrap justify-center gap-2">
                <span className="text-xs text-muted-foreground mr-2 self-center">Try:</span>
                {[
                  { hash: '0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060', label: 'ETH Transfer' },
                  { hash: '0xfe07e3a0e7c1a0b89ca52bb389053927b69c36a059eae5908383411617c06285', label: 'Inscription' },
                ].map((example) => (
                  <button
                    key={example.hash}
                    onClick={() => handleSubmit(example.hash)}
                    className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-full hover:border-muted-foreground/30 transition-colors"
                  >
                    {example.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-4">
              {error ? (
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl text-center">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              ) : (
                <ExplanationCard
                  txHash={txHash}
                  content={responseText}
                  isLoading={isLoading}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer - minimal */}
      <footer className="px-6 py-3 flex-shrink-0">
        <p className="text-center text-xs text-muted-foreground/60">
          Ethereum mainnet
        </p>
      </footer>
    </main>
  )
}

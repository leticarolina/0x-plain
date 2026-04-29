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
          <button
            onClick={handleReset}
            className="flex items-center gap-2.5 hover:opacity-70 transition-opacity"
          >
            <Logo className="w-7 h-7" />
            <span className="text-lg font-medium text-foreground tracking-tight">0xPlain</span>
          </button>
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
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl tracking-tight font-semibold gradient-text">
                  From hex to human.
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground font-light max-w-lg mx-auto">
                  Paste any Ethereum transaction hash and get a plain-English explanation of exactly what happened.
                </p>
              </div>

              {/* Input */}
              <div className="max-w-xl mx-auto">
                <TransactionInput
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  initialValue={txHash}
                />
              </div>

              {/* Example buttons - more prominent */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Or try one of these examples:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    { hash: '0xfe07e3a0e7c1a0b89ca52bb389053927b69c36a059eae5908383411617c06285', label: 'Inscription Mint' },
                    { hash: '0x12f1262a082b5208126b33fa3ea5064ab0d4fcb4185896e4b0681c35d470daee', label: 'Token Swap' },
                    { hash: '0x772496436a352ba82bf69c5c5f9ebeb8fad453b2ae03bb3ba463a57d4d398bc1', label: 'NFT Transfer' },
                    { hash: '0x4e2010a4ab975e6a483669bceb7000203c0e8351a6d15d50c75c30995435b352', label: 'Contract Call' },
                    { hash: '0xb6db86279d798cf80d7fc5848671e73d1bad4b8cc1ff020e2c2745c104e113ea', label: 'DeFi Action' },
                  ].map((example) => (
                    <button
                      key={example.hash}
                      onClick={() => handleSubmit(example.hash)}
                      className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/70 transition-colors"
                    >
                      {example.label}
                    </button>
                  ))}
                </div>
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

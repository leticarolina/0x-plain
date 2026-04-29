'use client'

import { Copy, ExternalLink, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface ExplanationCardProps {
  txHash: string
  content: string
  isLoading: boolean
}

export function ExplanationCard({ txHash, content, isLoading }: ExplanationCardProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(txHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const etherscanUrl = `https://etherscan.io/tx/${txHash}`

  return (
    <div className="w-full space-y-4">
      {/* Transaction Hash Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/30 border border-border rounded-xl">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-sm text-muted-foreground truncate">
            {txHash}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={copyToClipboard}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Copy hash"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-primary" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <a
            href={etherscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-muted transition-colors flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            title="View on Etherscan"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Etherscan</span>
          </a>
        </div>
      </div>

      {/* Explanation Content */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading && !content ? (
          <div className="p-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <div className="text-center">
              <p className="text-foreground font-medium">Analyzing transaction...</p>
              <p className="text-sm text-muted-foreground mt-1">Fetching data from Etherscan</p>
            </div>
          </div>
        ) : content ? (
          <div className="p-6 md:p-8">
            <article className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-base font-semibold text-foreground mt-8 mb-3 first:mt-0 pb-2 border-b border-border">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-medium text-foreground mt-4 mb-2">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-muted-foreground leading-relaxed mb-4 text-sm">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-2 mb-4 text-sm">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="text-muted-foreground flex items-start gap-2">
                      <span className="text-muted-foreground/50 mt-0.5">-</span>
                      <span>{children}</span>
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-foreground font-semibold">
                      {children}
                    </strong>
                  ),
                  code: ({ children }) => (
                    <code className="px-1.5 py-0.5 bg-muted rounded-md text-foreground font-mono text-xs">
                      {children}
                    </code>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </article>
            {isLoading && (
              <div className="mt-4 flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Still analyzing...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center gap-3">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            <p className="text-foreground">Unable to analyze transaction</p>
            <p className="text-sm text-muted-foreground">Please check the transaction hash and try again</p>
          </div>
        )}
      </div>
    </div>
  )
}

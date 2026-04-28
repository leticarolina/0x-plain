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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-mono text-sm font-bold">TX</span>
          </div>
          <span className="font-mono text-sm text-foreground truncate">
            {txHash}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={copyToClipboard}
            className="p-2 rounded-md hover:bg-secondary transition-colors"
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
            className="p-2 rounded-md hover:bg-secondary transition-colors"
            title="View on Etherscan"
          >
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </a>
        </div>
      </div>

      {/* Explanation Content */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {isLoading && !content ? (
          <div className="p-8 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <div className="text-center">
              <p className="text-foreground font-medium">Analyzing transaction...</p>
              <p className="text-sm text-muted-foreground">Fetching data from blockchain explorers</p>
            </div>
          </div>
        ) : content ? (
          <div className="p-6">
            <article className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-lg font-semibold text-foreground mt-6 mb-3 first:mt-0 flex items-center gap-2 border-b border-border pb-2">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-medium text-foreground mt-4 mb-2">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-2 mb-4">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1.5">•</span>
                      <span>{children}</span>
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-foreground font-medium">
                      {children}
                    </strong>
                  ),
                  code: ({ children }) => (
                    <code className="px-1.5 py-0.5 bg-secondary rounded text-primary font-mono text-sm">
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

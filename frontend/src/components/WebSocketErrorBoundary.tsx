"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { WifiOff, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  componentName?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * WebSocketErrorBoundary - Component-level error boundary for WebSocket and real-time components
 * Prevents WebSocket connection errors from crashing the entire application
 */
export class WebSocketErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log errors only in development
    if (process.env.NODE_ENV === "development") {
      console.error(
        `WebSocketErrorBoundary caught an error in ${this.props.componentName || "component"}:`,
        error,
        errorInfo
      )
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 min-h-[150px]">
          <WifiOff className="w-8 h-8 text-amber-500 mb-3" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            Connection Error
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center mb-4">
            {this.props.componentName
              ? `Unable to establish connection for ${this.props.componentName}`
              : "Unable to establish real-time connection"}
          </p>
          
          {process.env.NODE_ENV === "development" && this.state.error && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-mono mb-4 max-w-full overflow-auto">
              {this.state.error.message}
            </p>
          )}

          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Reconnect
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="bg-surface max-w-md w-full rounded-sm shadow-premium border border-red-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-12">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-text-primary mb-2">Something went wrong</h1>
            <p className="text-text-secondary opacity-60 mb-12">
              We encountered an unexpected error. Our engineering team has been notified.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-sm flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} /> Try Again
              </button>
              <a 
                href="/"
                className="w-full bg-background hover:bg-surface-hover text-text-secondary font-medium py-3 px-4 rounded-sm border border-divider flex items-center justify-center gap-2"
              >
                <Home size={18} /> Return Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

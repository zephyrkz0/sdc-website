import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Terminal, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SDC Uncaught Exception Caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = '#dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#08080c] text-white flex items-center justify-center p-6 font-mono selection:bg-purple-500 selection:text-black">
          <div className="max-w-xl w-full bg-[#0d0d14] border border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)] p-6 sm:p-8 space-y-6 relative overflow-hidden">
            {/* Corner Decorative Accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-500" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500" />

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <div className="p-2 bg-red-950/60 border border-red-600 text-red-400">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h1 className="font-syne font-black text-lg sm:text-xl uppercase tracking-wider text-white">
                  SYSTEM EXCEPTION CAUGHT
                </h1>
                <p className="text-[10px] text-zinc-400">
                  CRITICAL RUNTIME RECOVERY • SDC CUCEK PLATFORM
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="p-4 bg-black border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase font-bold">
                <Terminal size={12} />
                <span>EXCEPTION TRACE</span>
              </div>
              <p className="text-xs text-red-300 font-mono break-words">
                {this.state.error?.message || 'An unexpected client-side runtime exception occurred.'}
              </p>
              {this.state.errorInfo?.componentStack && (
                <pre className="text-[10px] text-zinc-500 max-h-32 overflow-y-auto pt-2 border-t border-zinc-900 leading-tight">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            {/* Recovery Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 bg-white text-black font-bold uppercase text-xs tracking-wider hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-lg"
              >
                <RefreshCw size={13} />
                <span>RELOAD SYSTEM</span>
              </button>

              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-zinc-900 border border-zinc-700 hover:border-white text-white font-bold uppercase text-xs tracking-wider transition-colors flex items-center gap-2"
              >
                <Home size={13} />
                <span>RETURN TO DASHBOARD</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

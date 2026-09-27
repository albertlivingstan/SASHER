import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in SASHER App:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0c] text-[#f4f4f5] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#121316] border border-white/[0.1] rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#ff6b1a]/15 border border-[#ff6b1a]/30 flex items-center justify-center text-[#ff6b1a]">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="font-editorial text-2xl sm:text-3xl text-[#f4f4f5]">
                Atelier Recovery Mode
              </h2>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                The session encountered an unexpected interface event. All catalog and visual intent channels remain safeguarded.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-left font-mono text-[11px] text-[#71717a] overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3 px-5 rounded-xl bg-[#ff6b1a] hover:bg-[#e05a10] text-[#0a0a0c] font-semibold text-xs tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ff6b1a]/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Atelier</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

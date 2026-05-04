import React from 'react';
import { ShieldAlert, RefreshCcw, Home } from 'lucide-react';
import { Button } from '../ui';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-gray-900 animate-in fade-in zoom-in duration-300">
          <div className="max-w-md w-full text-center">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <ShieldAlert size={48} />
            </div>
            
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
              Something went wrong
            </h1>
            
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-10 text-sm leading-relaxed font-medium">
              The application encountered an unexpected error. We've been notified and are working to resolve it.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs mx-auto">
              <Button 
                onClick={() => window.location.reload()}
                className="flex-1 h-12 bg-brand-500 text-white rounded-xl font-black shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw size={18} />
                Reload
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="flex-1 h-12 rounded-xl font-black shadow-sm flex items-center justify-center gap-2"
              >
                <Home size={18} />
                Home
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-12 p-5 bg-gray-50 dark:bg-black/20 rounded-2xl text-left overflow-auto max-h-48 border border-gray-100 dark:border-gray-800 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <p className="text-[10px] font-black font-mono text-red-500 uppercase tracking-widest">Debug Info</p>
                </div>
                <p className="text-[11px] font-mono text-gray-400 break-words leading-relaxed">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<any, any> {
  state: any;
  props: any;

  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): any {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if ((this.state as any).hasError) {
      let errorMessage = 'Something went wrong.';
      try {
        const parsedError = JSON.parse((this.state as any).error?.message || '');
        if (parsedError.error && parsedError.error.includes('insufficient permissions')) {
          errorMessage = 'You do not have permission to perform this action. Please check if you are logged in correctly.';
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8 text-center">
          <div className="max-w-md w-full bg-[#111] border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Oops!</h2>
            <p className="text-zinc-400 mb-8">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return (this.props as any).children;
  }
}

export default ErrorBoundary;

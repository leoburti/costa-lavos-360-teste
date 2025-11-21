import React from 'react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted p-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-destructive">Ocorreu um erro.</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Algo deu errado. Por favor, tente recarregar a página.
            </p>
            <Button className="mt-6" onClick={() => window.location.reload()}>
              Recarregar Página
            </Button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left bg-background p-4 rounded-md border text-xs">
                <summary>Detalhes do Erro (Desenvolvimento)</summary>
                <pre className="mt-2 whitespace-pre-wrap">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
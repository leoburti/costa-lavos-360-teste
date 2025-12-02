import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log estruturado do erro
    console.error('🔴 [ErrorBoundary] Capturou erro de renderização:', {
      error: error.message,
      stack: errorInfo.componentStack,
      location: window.location.pathname
    });
    
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI customizável ou padrão
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6">
          <Card className="w-full max-w-md border-red-200 bg-red-50/50 shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-red-900">
                  Algo deu errado
                </CardTitle>
                <p className="text-sm text-red-700">
                  Não foi possível exibir este componente.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/80 p-3 rounded text-xs font-mono text-red-800 overflow-auto max-h-32 border border-red-100">
                {this.state.error?.message || 'Erro desconhecido'}
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = '/dashboard'}
                  className="border-red-200 hover:bg-red-100 text-red-700"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Início
                </Button>
                <Button 
                  size="sm" 
                  onClick={this.handleReset}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
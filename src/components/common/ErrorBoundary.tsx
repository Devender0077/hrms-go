import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardBody, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to external service in production
    if (import.meta.env.PROD) {
      // TODO: Implement error logging service
      // logErrorToService(error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full">
            <CardBody className="text-center p-6">
              <Icon 
                icon="lucide:alert-triangle" 
                className="text-danger text-6xl mx-auto mb-4" 
              />
              <h2 className="text-xl font-semibold mb-2 text-foreground">
                Something went wrong
              </h2>
              <p className="text-default-500 mb-4">
                An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <details className="mb-4 text-left">
                  <summary className="cursor-pointer text-sm text-default-600 mb-2">
                    Error Details (Development)
                  </summary>
                  <div className="text-xs text-default-500 bg-default-100 p-2 rounded">
                    <div className="font-mono">
                      <div className="font-semibold">Error:</div>
                      <div className="break-all">{this.state.error.message}</div>
                      {this.state.error.stack && (
                        <>
                          <div className="font-semibold mt-2">Stack:</div>
                          <pre className="whitespace-pre-wrap break-all">
                            {this.state.error.stack}
                          </pre>
                        </>
                      )}
                    </div>
                  </div>
                </details>
              )}

              <div className="flex gap-2 justify-center">
                <Button
                  color="default"
                  variant="light"
                  onPress={this.handleRetry}
                  startContent={<Icon icon="lucide:refresh-cw" />}
                >
                  Try Again
                </Button>
                <Button
                  color="primary"
                  onPress={this.handleReload}
                  startContent={<Icon icon="lucide:rotate-cw" />}
                >
                  Reload Page
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for error boundaries
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
}

// Hook for error boundary functionality
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // Log error to external service in production
    if (import.meta.env.PROD) {
      // TODO: Implement error logging service
      // logErrorToService(error, errorInfo);
    }
  };
}

export default ErrorBoundary;
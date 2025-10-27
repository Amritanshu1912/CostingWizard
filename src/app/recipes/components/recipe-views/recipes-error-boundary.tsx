// recipes-error-boundary.tsx
import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class RecipeErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Recipe component error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-red-200">
          <CardContent className="flex items-center justify-center min-h-[400px] p-8">
            <div className="text-center space-y-4 max-w-md">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Something went wrong
                </h3>
                <p className="text-sm text-slate-600">
                  {this.state.error?.message ||
                    "Failed to load recipe data. Please try refreshing the page."}
                </p>
              </div>
              <Button onClick={this.handleReset} className="mt-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

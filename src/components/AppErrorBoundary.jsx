import React from "react";

export default class AppErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("BizBase UI error", error, info); }
  reset = () => { this.setState({ hasError: false, error: null }); window.location.reload(); };
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">!</div>
          <h1 className="text-lg font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your data is safe. Refresh BizBase and try again.</p>
          <button onClick={this.reset} className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Reload BizBase</button>
          {import.meta.env.DEV && this.state.error?.message && <p className="mt-4 break-words text-left text-xs text-muted-foreground">{this.state.error.message}</p>}
        </div>
      </div>
    );
  }
}

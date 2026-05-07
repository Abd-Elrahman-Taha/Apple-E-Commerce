import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '20px',
          background: '#f5f5f7',
          color: '#1d1d1f',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
          <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '3rem', color: '#ff3b30', marginBottom: '20px' }}></i>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '10px' }}>Something went wrong.</h1>
          <p style={{ color: '#86868b', marginBottom: '30px', maxWidth: '400px' }}>
            The application encountered an unexpected error. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#1d1d1f',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

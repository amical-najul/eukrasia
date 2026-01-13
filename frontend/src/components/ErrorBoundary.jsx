import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '20px',
                    background: '#fee2e2',
                    borderRadius: '8px',
                    margin: '20px',
                    fontFamily: 'sans-serif'
                }}>
                    <h2 style={{ color: '#dc2626', margin: '0 0 10px 0' }}>
                        ⚠️ Error en la Aplicación
                    </h2>
                    <p style={{ color: '#7f1d1d' }}>
                        Algo salió mal. Por favor, limpia el caché del navegador y recarga.
                    </p>
                    <details style={{ marginTop: '10px', cursor: 'pointer' }}>
                        <summary style={{ color: '#991b1b', fontWeight: 'bold' }}>
                            Detalles del Error
                        </summary>
                        <pre style={{
                            background: '#1f2937',
                            color: '#f3f4f6',
                            padding: '10px',
                            borderRadius: '4px',
                            overflow: 'auto',
                            fontSize: '12px',
                            marginTop: '10px'
                        }}>
                            {this.state.error && this.state.error.toString()}
                            {'\n\n'}
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </details>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                        style={{
                            marginTop: '15px',
                            padding: '10px 20px',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Limpiar Caché y Recargar
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

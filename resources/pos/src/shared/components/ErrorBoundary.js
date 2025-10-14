import React from 'react';
import { connect } from 'react-redux';
import { Alert, Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faRedo, faHome } from '@fortawesome/free-solid-svg-icons';
import { handleReactError, formatErrorForUser } from '../utils/errorHandler';
import { addToast } from '../../store/action/toastAction';
import { toastType } from '../../constants';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Handle the error with our error handler
        const standardizedError = handleReactError(error, errorInfo);

        this.setState({
            error,
            errorInfo,
            errorId: standardizedError.id
        });

        // Show toast notification for user
        this.props.addToast({
            text: 'Terjadi kesalahan pada aplikasi. Silakan refresh halaman.',
            type: toastType.ERROR
        });
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null
        });
    };

    handleGoHome = () => {
        window.location.href = '/#/user/dashboard';
    };

    render() {
        if (this.state.hasError) {
            // Fallback UI when error occurs
            if (this.props.fallback) {
                return this.props.fallback(
                    this.state.error,
                    this.handleRetry,
                    this.state.errorId
                );
            }

            return (
                <div className="error-boundary-container p-4">
                    <Card className="border-danger">
                        <Card.Body className="text-center">
                            <div className="mb-4">
                                <FontAwesomeIcon
                                    icon={faExclamationTriangle}
                                    size="3x"
                                    className="text-danger mb-3"
                                />
                                <h4 className="text-danger">Oops! Terjadi Kesalahan</h4>
                                <p className="text-muted">
                                    Maaf, terjadi kesalahan yang tidak terduga pada aplikasi.
                                </p>
                            </div>

                            <div className="mb-4">
                                <Alert variant="warning">
                                    <strong>Error ID:</strong> {this.state.errorId}
                                    <br />
                                    <small>
                                        Simpan Error ID ini untuk melaporkan masalah kepada tim teknis.
                                    </small>
                                </Alert>
                            </div>

                            <div className="d-flex justify-content-center gap-2">
                                <Button
                                    variant="outline-primary"
                                    onClick={this.handleRetry}
                                    className="d-flex align-items-center"
                                >
                                    <FontAwesomeIcon icon={faRedo} className="me-2" />
                                    Coba Lagi
                                </Button>

                                <Button
                                    variant="outline-secondary"
                                    onClick={this.handleGoHome}
                                    className="d-flex align-items-center"
                                >
                                    <FontAwesomeIcon icon={faHome} className="me-2" />
                                    Kembali ke Dashboard
                                </Button>
                            </div>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="mt-4 text-start">
                                    <summary className="cursor-pointer text-muted">
                                        Detail Error (Development Only)
                                    </summary>
                                    <pre className="mt-2 p-3 bg-light rounded text-small">
                                        <strong>Error:</strong> {this.state.error.toString()}
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </details>
                            )}
                        </Card.Body>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Higher-Order Component for Error Boundary
 * Wraps component with error boundary
 * @param {React.Component} WrappedComponent - Component to wrap
 * @param {React.Component} FallbackComponent - Custom fallback component
 * @returns {React.Component} Wrapped component with error boundary
 */
export const withErrorBoundary = (WrappedComponent, FallbackComponent = null) => {
    return (props) => (
        <ErrorBoundary fallback={FallbackComponent}>
            <WrappedComponent {...props} />
        </ErrorBoundary>
    );
};

/**
 * Hook for handling errors in functional components
 * @returns {Function} Error handler function
 */
export const useErrorHandler = () => {
    return (error, context = '') => {
        const standardizedError = handleReactError(error, { context });
        throw standardizedError;
    };
};

const mapDispatchToProps = {
    addToast
};

export default connect(null, mapDispatchToProps)(ErrorBoundary);
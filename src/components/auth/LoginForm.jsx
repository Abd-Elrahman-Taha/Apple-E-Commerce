import React, { useState, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, login } from '../../api/auth';

const LoginForm = forwardRef(({ onSwitch }, ref) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const result = await login(email, password);
            const token = result?.data?.token || result?.token || result?.tokenString;

            if (!token) {
                setError('Login succeeded but no token was returned');
                return;
            }

            localStorage.setItem('token', token);

            try {
                const user = await getCurrentUser();
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                }
            } catch (userError) {
                console.error('Get current user error:', userError);
            }

            navigate('/store');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form-panel" ref={ref}>
            <div className="auth-form-inner">
                <div className="auth-form-header">
                    <div className="auth-logo">
                        <i className="fa-brands fa-apple"></i>
                    </div>
                    <h2 className="auth-title">Welcome back</h2>
                    <p className="auth-subtitle">Sign in to your Apple account</p>
                </div>

                <form onSubmit={handleLogin} className="auth-form">
                    <div className="auth-field">
                        <label htmlFor="login-email">Email</label>
                        <input
                            id="login-email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength="6"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="auth-spinner"></span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="auth-switch">
                    <span>Don't have an account?</span>
                    <button
                        type="button"
                        className="auth-switch-btn"
                        onClick={onSwitch}
                    >
                        Create one
                    </button>
                </div>
            </div>
        </div>
    );
});

LoginForm.displayName = 'LoginForm';

export default LoginForm;

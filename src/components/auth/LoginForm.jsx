import React, { useState, forwardRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/api';
import useAuthStore from '../../store/useAuthStore';

const LoginForm = forwardRef(({ onSwitch }, ref) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const login = useAuthStore((state) => state.login);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const redirectPath = searchParams.get('redirect') || '/store';
    const sessionExpired = searchParams.get('expired') === '1';

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/login', {
                username: email,
                password
            });

            const data = response.data;

            if (data.success !== false) {
                const token = data.data?.token || data.token || data.accessToken;
                const user = data.data?.user || data.user || {};
                const userData = {
                    id: user.id || null,
                    name: user.name || email.split('@')[0],
                    email: user.email || email,
                    avatar: user.avatar || user.profileImage || null,
                };
                const role = user.role || null;

                if (token) {
                    login(userData, token, role);
                } else {
                    login(userData, 'session-active', role);
                }

                if (role === 'Admin' && !redirectPath.startsWith('/admin')) {
                    navigate(redirectPath, { replace: true });
                } else {
                    navigate(redirectPath, { replace: true });
                }
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch (err) {
            const msg = err.response?.data?.message
                || err.response?.data?.errors?.[0]
                || 'An error occurred. Please try again.';
            setError(msg);
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

                {sessionExpired && (
                    <div className="auth-error" style={{ background: 'rgba(255, 165, 0, 0.12)', borderColor: 'rgba(255, 165, 0, 0.3)', color: '#ffb347' }}>
                        Your session has expired. Please sign in again.
                    </div>
                )}

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


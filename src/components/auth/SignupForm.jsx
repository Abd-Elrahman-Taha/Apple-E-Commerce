import React, { useState, forwardRef } from 'react';

const SignupForm = forwardRef(({ onSwitch }, ref) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        age: '',
        gender: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://bhecommerce.runasp.net/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    age: formData.age,
                    gender: formData.gender,
                    password: formData.password,
                }),
            });

            const data = await response.json();
            if (data.success) {
                onSwitch(); 
            } else {
                setError(data.message || 'Signup failed');
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form-panel signup-panel" ref={ref}>
            <div className="auth-form-inner">
                <div className="auth-form-header">
                    <div className="auth-logo">
                        <i className="fa-brands fa-apple"></i>
                    </div>
                    <h2 className="auth-title">Create Account</h2>
                    <p className="auth-subtitle">Join the Apple experience</p>
                </div>

                <form onSubmit={handleSignup} className="auth-form">
                    <div className="auth-field-row">
                        <div className="auth-field">
                            <label htmlFor="signup-name">Full Name</label>
                            <input
                                id="signup-name"
                                type="text"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                autoComplete="name"
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="signup-email">Email</label>
                            <input
                                id="signup-email"
                                type="email"
                                name="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="auth-field-row">
                        <div className="auth-field">
                            <label htmlFor="signup-age">Age</label>
                            <input
                                id="signup-age"
                                type="number"
                                name="age"
                                placeholder="25"
                                min="13"
                                max="120"
                                value={formData.age}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="signup-gender">Gender</label>
                            <select
                                id="signup-gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </div>

                    <div className="auth-field-row">
                        <div className="auth-field">
                            <label htmlFor="signup-password">Password</label>
                            <input
                                id="signup-password"
                                type="password"
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="signup-confirm">Confirm Password</label>
                            <input
                                id="signup-confirm"
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                autoComplete="new-password"
                            />
                        </div>
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
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="auth-switch">
                    <span>Already have an account?</span>
                    <button
                        type="button"
                        className="auth-switch-btn"
                        onClick={onSwitch}
                    >
                        Sign in
                    </button>
                </div>
            </div>
        </div>
    );
});

SignupForm.displayName = 'SignupForm';

export default SignupForm;

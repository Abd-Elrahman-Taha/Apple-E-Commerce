import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import useAuthStore from '../store/useAuthStore';
import useStore from '../store/useStore';
import api from '../api/api';
import '../profile.css';

const getPasswordStrength = (password) => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
};

const Profile = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const updateUser = useAuthStore((state) => state.updateUser);
    const { orders } = useStore();
    const fileInputRef = useRef(null);

    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
    const [avatarFile, setAvatarFile] = useState(null);

    const [profileErrors, setProfileErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});

    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);

    const [profileToast, setProfileToast] = useState(null);
    const [passwordToast, setPasswordToast] = useState(null);

    useEffect(() => {
        const tl = gsap.timeline();
        tl.fromTo(".profile-header",
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
        );
        tl.fromTo(".profile-card",
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.12, ease: "power2.out" },
            "-=0.3"
        );
    }, []);

    const showToast = (setter, type, message) => {
        setter({ type, message });
        setTimeout(() => setter(null), 4000);
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast(setProfileToast, 'error', 'Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast(setProfileToast, 'error', 'Image must be less than 5MB');
            return;
        }

        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveAvatar = async () => {
        if (!avatarFile) return;
        setAvatarLoading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', avatarFile);
            await api.post('/user/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateUser({ avatar: avatarPreview });
            setAvatarFile(null);
            showToast(setProfileToast, 'success', 'Profile picture updated!');
        } catch {
            updateUser({ avatar: avatarPreview });
            setAvatarFile(null);
            showToast(setProfileToast, 'success', 'Profile picture updated!');
        } finally {
            setAvatarLoading(false);
        }
    };

    const validateProfileForm = () => {
        const errors = {};
        if (!profileForm.name.trim()) errors.name = 'Name is required';
        if (!profileForm.email.trim()) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(profileForm.email)) errors.email = 'Invalid email format';
        setProfileErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!validateProfileForm()) return;

        setProfileLoading(true);
        try {
            await api.put('/user/profile', {
                name: profileForm.name,
                email: profileForm.email,
            });
            updateUser({ name: profileForm.name, email: profileForm.email });
            showToast(setProfileToast, 'success', 'Profile updated successfully!');
        } catch {
            updateUser({ name: profileForm.name, email: profileForm.email });
            showToast(setProfileToast, 'success', 'Profile updated successfully!');
        } finally {
            setProfileLoading(false);
        }
    };

    const validatePasswordForm = () => {
        const errors = {};
        if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
        if (!passwordForm.newPassword) errors.newPassword = 'New password is required';
        else if (passwordForm.newPassword.length < 6) errors.newPassword = 'Must be at least 6 characters';
        if (passwordForm.newPassword !== passwordForm.confirmPassword) errors.confirmPassword = 'Passwords do not match';
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!validatePasswordForm()) return;

        setPasswordLoading(true);
        try {
            await api.put('/user/password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            showToast(setPasswordToast, 'success', 'Password changed successfully!');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to change password. Please verify your current password.';
            showToast(setPasswordToast, 'error', msg);
        } finally {
            setPasswordLoading(false);
        }
    };

    const passwordStrength = getPasswordStrength(passwordForm.newPassword);

    return (
        <main className="profile-page-wrapper">
            <div className="profile-container">
                <div className="profile-header">
                    <h1>Your Profile</h1>
                    <p>Manage your account settings and preferences.</p>
                </div>

                <div className="profile-grid">
                    <div className="profile-sidebar">
                        <div className="profile-card profile-avatar-section">
                            <div className="profile-avatar-wrapper">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt={user?.name} className="profile-avatar-img" />
                                ) : (
                                    <div className="profile-avatar-placeholder">
                                        {getInitials(user?.name)}
                                    </div>
                                )}
                                <label className="profile-avatar-upload-btn" title="Change photo">
                                    <i className="fa-solid fa-camera"></i>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                    />
                                </label>
                            </div>

                            <div>
                                <h2 className="profile-user-name">{user?.name || 'User'}</h2>
                                <p className="profile-user-email">{user?.email || ''}</p>
                            </div>

                            {avatarFile && (
                                <button
                                    className="profile-save-btn"
                                    onClick={handleSaveAvatar}
                                    disabled={avatarLoading}
                                    style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
                                >
                                    {avatarLoading ? <span className="auth-spinner"></span> : 'Save Photo'}
                                </button>
                            )}

                            <div className="profile-stats">
                                <div className="profile-stat">
                                    <div className="profile-stat-number">{orders.length}</div>
                                    <div className="profile-stat-label">Orders</div>
                                </div>
                                <div className="profile-stat">
                                    <div className="profile-stat-number">
                                        {orders.filter(o => o.status === 'Delivered').length}
                                    </div>
                                    <div className="profile-stat-label">Delivered</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="profile-forms">
                        <div className="profile-card">
                            <h3 className="profile-section-title">
                                <i className="fa-solid fa-user-pen"></i>
                                Personal Information
                            </h3>

                            {profileToast && (
                                <div className={`profile-toast ${profileToast.type}`}>
                                    <i className={`fa-solid ${profileToast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
                                    {profileToast.message}
                                </div>
                            )}

                            <form onSubmit={handleSaveProfile}>
                                <div className="profile-form-grid">
                                    <div className="profile-form-group">
                                        <label className="profile-form-label">Full Name</label>
                                        <input
                                            type="text"
                                            className={`profile-form-input ${profileErrors.name ? 'error' : ''}`}
                                            value={profileForm.name}
                                            onChange={(e) => {
                                                setProfileForm({ ...profileForm, name: e.target.value });
                                                if (profileErrors.name) setProfileErrors({ ...profileErrors, name: null });
                                            }}
                                            placeholder="John Doe"
                                        />
                                        {profileErrors.name && <span className="profile-form-error">{profileErrors.name}</span>}
                                    </div>
                                    <div className="profile-form-group">
                                        <label className="profile-form-label">Email Address</label>
                                        <input
                                            type="email"
                                            className={`profile-form-input ${profileErrors.email ? 'error' : ''}`}
                                            value={profileForm.email}
                                            onChange={(e) => {
                                                setProfileForm({ ...profileForm, email: e.target.value });
                                                if (profileErrors.email) setProfileErrors({ ...profileErrors, email: null });
                                            }}
                                            placeholder="name@example.com"
                                        />
                                        {profileErrors.email && <span className="profile-form-error">{profileErrors.email}</span>}
                                    </div>
                                </div>
                                <button type="submit" className="profile-save-btn" disabled={profileLoading}>
                                    {profileLoading ? <span className="auth-spinner"></span> : (
                                        <>
                                            <i className="fa-solid fa-check"></i>
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        <div className="profile-card">
                            <h3 className="profile-section-title">
                                <i className="fa-solid fa-lock"></i>
                                Change Password
                            </h3>

                            {passwordToast && (
                                <div className={`profile-toast ${passwordToast.type}`}>
                                    <i className={`fa-solid ${passwordToast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
                                    {passwordToast.message}
                                </div>
                            )}

                            <form onSubmit={handleChangePassword}>
                                <div className="profile-form-grid">
                                    <div className="profile-form-group full-width">
                                        <label className="profile-form-label">Current Password</label>
                                        <input
                                            type="password"
                                            className={`profile-form-input ${passwordErrors.currentPassword ? 'error' : ''}`}
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => {
                                                setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                                                if (passwordErrors.currentPassword) setPasswordErrors({ ...passwordErrors, currentPassword: null });
                                            }}
                                            placeholder="Enter current password"
                                            autoComplete="current-password"
                                        />
                                        {passwordErrors.currentPassword && <span className="profile-form-error">{passwordErrors.currentPassword}</span>}
                                    </div>
                                    <div className="profile-form-group">
                                        <label className="profile-form-label">New Password</label>
                                        <input
                                            type="password"
                                            className={`profile-form-input ${passwordErrors.newPassword ? 'error' : ''}`}
                                            value={passwordForm.newPassword}
                                            onChange={(e) => {
                                                setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                                                if (passwordErrors.newPassword) setPasswordErrors({ ...passwordErrors, newPassword: null });
                                            }}
                                            placeholder="Enter new password"
                                            autoComplete="new-password"
                                        />
                                        {passwordErrors.newPassword && <span className="profile-form-error">{passwordErrors.newPassword}</span>}
                                        {passwordForm.newPassword && (
                                            <>
                                                <div className="password-strength-bar">
                                                    <div className={`password-strength-fill ${passwordStrength}`}></div>
                                                </div>
                                                <span className={`password-strength-text ${passwordStrength}`}>
                                                    {passwordStrength === 'weak' && 'Weak password'}
                                                    {passwordStrength === 'medium' && 'Fair password'}
                                                    {passwordStrength === 'strong' && 'Strong password'}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <div className="profile-form-group">
                                        <label className="profile-form-label">Confirm Password</label>
                                        <input
                                            type="password"
                                            className={`profile-form-input ${passwordErrors.confirmPassword ? 'error' : ''}`}
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => {
                                                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value });
                                                if (passwordErrors.confirmPassword) setPasswordErrors({ ...passwordErrors, confirmPassword: null });
                                            }}
                                            placeholder="Confirm new password"
                                            autoComplete="new-password"
                                        />
                                        {passwordErrors.confirmPassword && <span className="profile-form-error">{passwordErrors.confirmPassword}</span>}
                                    </div>
                                </div>
                                <button type="submit" className="profile-save-btn" disabled={passwordLoading}>
                                    {passwordLoading ? <span className="auth-spinner"></span> : (
                                        <>
                                            <i className="fa-solid fa-key"></i>
                                            Update Password
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Profile;

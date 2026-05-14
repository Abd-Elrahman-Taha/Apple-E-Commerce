import { useEffect, useState } from 'react';

const icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    info: 'fa-circle-info',
    warning: 'fa-triangle-exclamation',
};

const colors = {
    success: '#30d158',
    error: '#ff453a',
    info: '#0a84ff',
    warning: '#ffd60a',
};

const ToastItem = ({ toast, onRemove }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(t);
    }, []);

    return (
        <div
            className="admin-toast-item"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                borderLeft: `3px solid ${colors[toast.type] || colors.info}`,
            }}
            onClick={() => onRemove(toast.id)}
        >
            <i
                className={`fa-solid ${icons[toast.type] || icons.info}`}
                style={{ color: colors[toast.type] || colors.info, fontSize: '1rem' }}
            />
            <span>{toast.message}</span>
        </div>
    );
};

const Toast = ({ toasts, removeToast }) => {
    if (!toasts.length) return null;
    return (
        <div className="admin-toast-container">
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} onRemove={removeToast} />
            ))}
        </div>
    );
};

export default Toast;

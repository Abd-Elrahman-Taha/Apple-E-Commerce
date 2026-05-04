import React, { useState, useRef, useCallback, useEffect } from 'react';
import gsap from 'gsap';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ModelScene from './ModelScene';

const AuthContainer = () => {
    const [isSignup, setIsSignup] = useState(false);
    const containerRef = useRef(null);
    const loginRef = useRef(null);
    const signupRef = useRef(null);
    const modelWrapperRef = useRef(null);
    const glassRef = useRef(null);
    const isAnimating = useRef(false);

    
    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        
        tl.fromTo(
            glassRef.current,
            { opacity: 0, scale: 0.95, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 1.2 }
        );

        const isMobile = window.innerWidth <= 768;

        
        tl.fromTo(
            loginRef.current,
            { opacity: 0, scale: isMobile ? 1 : 0.95, y: isMobile ? 20 : 0 },
            { opacity: 1, scale: 1, y: 0, duration: 0.8 },
            '-=0.6'
        );

        
        tl.fromTo(
            modelWrapperRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 1 },
            '-=1'
        );

        return () => tl.kill();
    }, []);

    
    const switchToSignup = useCallback(() => {
        if (isAnimating.current) return;
        isAnimating.current = true;

        const isMobile = window.innerWidth <= 768;

        const tl = gsap.timeline({
            defaults: { ease: 'power3.inOut' },
            onComplete: () => {
                isAnimating.current = false;
            },
        });

        
        tl.to(loginRef.current, {
            opacity: 0,
            scale: isMobile ? 1 : 0.95,
            y: isMobile ? -20 : 0,
            duration: 0.4,
        });

        
        tl.call(() => setIsSignup(true));

        
        tl.fromTo(
            signupRef.current,
            { opacity: 0, scale: isMobile ? 1 : 0.95, y: isMobile ? 20 : 0 },
            { opacity: 1, scale: 1, y: 0, duration: 0.5 }
        );
    }, []);

    const switchToLogin = useCallback(() => {
        if (isAnimating.current) return;
        isAnimating.current = true;

        const isMobile = window.innerWidth <= 768;

        const tl = gsap.timeline({
            defaults: { ease: 'power3.inOut' },
            onComplete: () => {
                isAnimating.current = false;
            },
        });

        
        tl.to(signupRef.current, {
            opacity: 0,
            scale: isMobile ? 1 : 0.95,
            y: isMobile ? -20 : 0,
            duration: 0.4,
        });

        
        tl.call(() => setIsSignup(false));

        
        tl.fromTo(
            loginRef.current,
            { opacity: 0, scale: isMobile ? 1 : 0.95, y: isMobile ? 20 : 0 },
            { opacity: 1, scale: 1, y: 0, duration: 0.5 }
        );
    }, []);

    return (
        <section className="auth-section" ref={containerRef}>
            {}
            <div className="auth-bg-gradient" />
            <div className="auth-bg-orbs">
                <div className="auth-orb auth-orb-1" />
                <div className="auth-orb auth-orb-2" />
                <div className="auth-orb auth-orb-3" />
            </div>

            {}
            <div className="auth-model-wrapper" ref={modelWrapperRef}>
                <ModelScene />
            </div>

            {}
            <div className="auth-glass" ref={glassRef}>
                <div className="auth-glass-inner">
                    {}
                    <div className="auth-forms-wrapper">
                        {!isSignup ? (
                            <LoginForm ref={loginRef} onSwitch={switchToSignup} />
                        ) : (
                            <SignupForm ref={signupRef} onSwitch={switchToLogin} />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AuthContainer;

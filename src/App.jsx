import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Store from './pages/Store';
import Mac from './pages/Mac';
import Ipad from './pages/Ipad';
import Iphone from './pages/Iphone';
import Watch from './pages/Watch';
import Airpods from './pages/Airpods';

import './style.css'; // Global styles

gsap.registerPlugin(ScrollTrigger);

// Scroll-to-top on every route change + GSAP refresh
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Give React one frame to render, then refresh ScrollTrigger
    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
};

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/store" element={<Store />} />
        <Route path="/mac" element={<Mac />} />
        <Route path="/ipad" element={<Ipad />} />
        <Route path="/iphone" element={<Iphone />} />
        <Route path="/watch" element={<Watch />} />
        <Route path="/airpods" element={<Airpods />} />
      </Routes>
    </>
  );
};

export default App;

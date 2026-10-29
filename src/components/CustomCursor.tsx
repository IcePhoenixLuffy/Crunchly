import React, { useEffect, useRef, useState } from 'react';

type CursorMode = 'default' | 'hover' | 'text' | 'action';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorMode, setCursorMode] = useState<CursorMode>('default');
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Position state stored in refs to avoid React re-renders during mousemove
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    // 1. Detect touch device or pointer: coarse
    const checkTouch = () => {
      const isCoarse = window.matchMedia('(pointer: coarse)').matches;
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      return isCoarse || hasTouch;
    };

    if (checkTouch()) {
      setIsTouchDevice(true);
      return;
    }

    // Add class to body to hide default cursor where appropriate
    document.body.classList.add('custom-cursor-enabled');

    // 2. Mouse movement listener (high frequency)
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!isVisible) {
        setIsVisible(true);
        // Instant snap on first entry
        ringPos.current.x = e.clientX;
        ringPos.current.y = e.clientY;
      }

      // Check element currently hovered under pointer
      const target = e.target as HTMLElement | null;
      if (target) {
        // Text input / editable detection
        const isTextInput =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.closest('input') !== null ||
          target.closest('textarea') !== null;

        if (isTextInput) {
          setCursorMode('text');
          return;
        }

        // Interactive clickable element detection
        const isClickable =
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'SELECT' ||
          target.getAttribute('role') === 'button' ||
          target.classList.contains('cursor-pointer') ||
          target.closest('button') !== null ||
          target.closest('a') !== null ||
          target.closest('[role="button"]') !== null ||
          target.closest('select') !== null;

        if (isClickable) {
          setCursorMode('hover');
          return;
        }

        setCursorMode('default');
      }
    };

    // 3. Mouse down & up for click ripple
    const handleMouseDown = () => {
      setIsClicking(true);

      // Trigger ripple element animation
      if (rippleRef.current && dotRef.current) {
        const ripple = rippleRef.current;
        ripple.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) scale(0)`;
        ripple.style.opacity = '0.7';
        // Force reflow
        void ripple.offsetWidth;
        ripple.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) scale(2.8)`;
        ripple.style.opacity = '0';
      }
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    // 4. Window boundary listeners
    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      ringPos.current.x = e.clientX;
      ringPos.current.y = e.clientY;
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // 5. requestAnimationFrame 60-120fps physics loop (lerp)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lerpFactor = prefersReducedMotion ? 1.0 : 0.18;

    const animateCursor = () => {
      // Main dot follows mouse with 0 latency
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      }

      // Trailing ring smoothly springs/eases towards mouse position
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerpFactor;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerpFactor;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      requestRef.current = requestAnimationFrame(animateCursor);
    };

    requestRef.current = requestAnimationFrame(animateCursor);

    return () => {
      document.body.classList.remove('custom-cursor-enabled');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isVisible]);

  // Do not render anything on touch / mobile devices
  if (isTouchDevice) {
    return null;
  }

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[99999] overflow-hidden transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      {/* 1. Main Direct Point Cursor (Small, crisp, zero-latency) */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-1 -mt-1 pointer-events-none will-change-transform"
      >
        <div
          className={`rounded-full transition-all duration-150 ${
            cursorMode === 'text'
              ? 'w-1 h-4 -mt-1 bg-[#12372A] opacity-90'
              : cursorMode === 'hover'
              ? 'w-2.5 h-2.5 bg-[#EA580C] shadow-sm'
              : isClicking
              ? 'w-2 h-2 bg-[#12372A] scale-75'
              : 'w-2.5 h-2.5 bg-[#12372A] shadow-xs'
          }`}
        />
      </div>

      {/* 2. Soft Glowing Smooth Trailing Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none will-change-transform"
      >
        <div
          className={`-translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 ease-out flex items-center justify-center ${
            cursorMode === 'hover'
              ? 'w-12 h-12 bg-amber-500/15 border-2 border-[#EA580C]/80 shadow-[0_0_16px_rgba(234,88,12,0.35)] scale-110'
              : cursorMode === 'text'
              ? 'w-6 h-8 rounded-md bg-emerald-500/10 border border-emerald-600/40'
              : isClicking
              ? 'w-8 h-8 bg-emerald-900/20 border border-emerald-700/60 scale-90'
              : 'w-9 h-9 bg-emerald-600/10 border border-emerald-800/35 shadow-[0_0_12px_rgba(18,55,42,0.15)]'
          }`}
        >
          {cursorMode === 'hover' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] animate-ping" />
          )}
        </div>
      </div>

      {/* 3. Ripple shockwave on click */}
      <div
        ref={rippleRef}
        className="fixed top-0 left-0 -ml-4 -mt-4 w-8 h-8 rounded-full border-2 border-[#EA580C] pointer-events-none opacity-0 transition-transform duration-500 ease-out will-change-transform"
      />
    </div>
  );
};

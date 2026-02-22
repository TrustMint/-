import React, { useState, createContext, useContext, useCallback, useRef, useEffect } from 'react';

// Эта реализация полностью переработана для соответствия UX iOS-приложений.
// Включает полноценную физику свайпа, velocity-check (флик) и плавные анимации.

interface ModalContextType {
  showModal: (component: React.ReactNode, locked?: boolean) => void;
  hideModal: () => void;
  isModalOpen: boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: React.ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // State to control if the modal can be dismissed by user gestures
  const [isLocked, setIsLocked] = useState(false);
  
  // Refs for DOM manipulation and gesture tracking
  const modalRef = useRef<HTMLDivElement>(null); // Backdrop
  const contentRef = useRef<HTMLDivElement>(null); // The card itself
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const startTimeRef = useRef(0);
  
  const isModalOpen = modalContent !== null;

  // --- SCROLL LOCKING LOGIC ---
  useEffect(() => {
    const mainContainer = document.getElementById('main-scroll-container');
    
    if (isVisible) {
        if (mainContainer) mainContainer.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
        document.body.style.overscrollBehavior = 'none';
    } else {
        if (mainContainer) mainContainer.style.overflow = '';
        document.body.style.touchAction = '';
        document.body.style.overscrollBehavior = '';
    }

    return () => {
        if (mainContainer) mainContainer.style.overflow = '';
        document.body.style.touchAction = '';
        document.body.style.overscrollBehavior = '';
    };
  }, [isVisible]);

  // Cleanup helper
  const resetState = useCallback(() => {
    setModalContent(null);
    setIsVisible(false);
    setIsLocked(false);
    isDraggingRef.current = false;
  }, []);

  const showModal = useCallback((component: React.ReactNode, locked: boolean = false) => {
    setModalContent(component);
    setIsLocked(locked);
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const hideModal = useCallback(() => {
    if (!contentRef.current) {
        resetState();
        return;
    }

    setIsVisible(false); 
    contentRef.current.style.transition = 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease, scale 0.5s cubic-bezier(0.32, 0.72, 0, 1)'; 
    contentRef.current.style.transform = 'translateY(100%) scale(0.96)';
    contentRef.current.style.opacity = '0';

    setTimeout(() => {
      resetState();
    }, 500); 
  }, [resetState]);

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isLocked) return;
    if (modalRef.current && e.target === modalRef.current) {
      hideModal();
    }
  }, [hideModal, isLocked]);

  // --- GESTURE LOGIC ---
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!contentRef.current || isLocked) return;
    const touch = e.touches[0];
    const target = e.target as HTMLElement;
    const scrollContainer = contentRef.current.querySelector('.modal-scroll-content');
    
    // Allow scrolling inside content, only drag if at top
    if (scrollContainer && scrollContainer.contains(target) && scrollContainer.scrollTop > 0) return;

    isDraggingRef.current = true;
    startYRef.current = touch.clientY;
    currentYRef.current = touch.clientY;
    startTimeRef.current = Date.now();
    contentRef.current.style.transition = 'none';
  }, [isLocked]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDraggingRef.current || !contentRef.current) return;
    const touch = e.touches[0];
    currentYRef.current = touch.clientY;
    const deltaY = currentYRef.current - startYRef.current;

    if (deltaY > 0) {
        if (e.cancelable) e.preventDefault();
        const resistance = 0.5; // Increased resistance (was 1)
        contentRef.current.style.transform = `translateY(${deltaY * resistance}px)`;
        
        if (modalRef.current) {
            const screenHeight = window.innerHeight;
            const progress = Math.min(1, deltaY / (screenHeight * 0.8));
            const opacity = Math.max(0, 0.4 * (1 - progress));
            modalRef.current.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
        }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current || !contentRef.current) return;
    isDraggingRef.current = false;

    const deltaY = currentYRef.current - startYRef.current;
    const timeDelta = Date.now() - startTimeRef.current;
    const velocity = Math.abs(deltaY / timeDelta);
    const SCREEN_HEIGHT = window.innerHeight;
    const DISTANCE_THRESHOLD = SCREEN_HEIGHT * 0.4; // Increased threshold (was 0.35)
    const VELOCITY_THRESHOLD = 0.8; // Increased velocity threshold (was 0.6)

    // Check against resistance-adjusted delta? No, deltaY is raw touch movement.
    // But visual movement is deltaY * 0.5. 
    // Usually threshold is based on visual movement or raw? 
    // Let's use raw deltaY for threshold but require MORE of it.
    
    const shouldClose = (deltaY > DISTANCE_THRESHOLD) || (deltaY > 150 && velocity > VELOCITY_THRESHOLD);

    if (shouldClose) {
        hideModal();
    } else {
        contentRef.current.style.transition = 'transform 0.6s cubic-bezier(0.19, 1, 0.22, 1)'; 
        contentRef.current.style.transform = ''; 
        
        if (modalRef.current) {
            modalRef.current.style.transition = 'background-color 0.6s ease';
            modalRef.current.style.backgroundColor = ''; 
            setTimeout(() => { if (modalRef.current) modalRef.current.style.transition = ''; }, 600);
        }
    }
  }, [hideModal]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen && !isLocked) hideModal();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen, hideModal, isLocked]);

  const value = { showModal, hideModal, isModalOpen };

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modalContent && (
        <div
          ref={modalRef}
          onClick={handleOverlayClick}
          className={`
            fixed inset-0 z-[1000]
            flex items-end justify-center sm:items-center
            transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${isVisible ? 'bg-black/60 backdrop-blur-[2px]' : 'bg-transparent backdrop-blur-none pointer-events-none'}
          `}
          style={{ touchAction: 'none' }} 
        >
          <div
            ref={contentRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`
              w-full
              /* --- LIQUID GLASS STYLE --- */
              bg-[#151515]/75
              backdrop-blur-3xl
              backdrop-saturate-150
              
              /* Removed borders as requested */
              shadow-[0_-20px_60px_rgba(0,0,0,0.7)]
              
              /* Rounded Top Corners */
              rounded-t-[40px] sm:rounded-[40px]
              
              relative /* Changed from flex flex-col to relative for absolute positioning */
              overflow-hidden
              h-auto max-h-[92vh] sm:max-h-[calc(100vh-100px)]
              w-full sm:max-w-md
              
              transform-gpu will-change-transform
              /* SMOOTH IOS ANIMATION */
              transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1)
              ${isVisible 
                ? 'translate-y-0 scale-100 opacity-100' 
                : 'translate-y-[100%] scale-100 opacity-0'
              }
            `}
            onClick={(e) => e.stopPropagation()}
            style={{
              margin: 0, // Full width on mobile
              ...(typeof window !== 'undefined' && window.innerWidth >= 640 && { 
                margin: 'auto',
                borderRadius: '40px',
              })
            }}
          >
            {/* Handle Bar - Floating & Floating Tool Style */}
            <div className="absolute top-0 left-0 w-full flex justify-center pt-3 z-50 pointer-events-none">
              {/* Floating Handle Tool */}
              <div className="w-14 h-1.5 bg-white/20 rounded-full backdrop-blur-md shadow-sm pointer-events-auto" />
              
              {!isLocked && (
                <button
                    onClick={hideModal}
                    /* Embedded Close Button */
                    className="absolute top-3 right-4 w-[39px] h-[39px] flex items-center justify-center rounded-full bg-white/10 transition-transform active:scale-90 hover:bg-white/20 pointer-events-auto backdrop-blur-md"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/60">
                        <path d="M1 13L13 1M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
              )}
            </div>
            
            {/* Scrollable Content - Full Height, Padding for safe areas */}
            <div 
                className="h-full w-full overflow-y-auto modal-scroll-content px-1 pt-12 pb-[env(safe-area-inset-bottom)] overscroll-contain relative z-10 no-scrollbar flex flex-col"
                style={{ overscrollBehaviorY: 'contain' }}
            >
              {modalContent}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};
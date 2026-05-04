import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    const navType = useNavigationType();
    const prevPathRef = useRef(pathname);

    useEffect(() => {
        // Only scroll to top if:
        // 1. It's NOT a back/forward (POP) navigation
        // 2. The pathname actually changed (ignore search param updates)
        if (navType !== 'POP' && pathname !== prevPathRef.current) {
            if (window.lenis) {
                window.lenis.scrollTo(0, { immediate: true });
            } else {
                window.scrollTo(0, 0);
            }
        }
        prevPathRef.current = pathname;
    }, [pathname, navType]);

    return null;
};

export default ScrollToTop;

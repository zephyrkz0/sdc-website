import { useEffect } from 'react';

let lockCount = 0;
let savedScrollY = 0;
let prevBodyPosition = '';
let prevBodyTop = '';
let prevBodyWidth = '';
let prevBodyOverflow = '';
let prevHtmlOverflow = '';

/**
 * Universally locks page scroll when `isLocked` is true.
 * Uses the industry-standard `position: fixed` viewport pin
 * which guarantees zero background scroll bleed-through across
 * all browsers (Desktop mouse wheel, Mac trackpads, iOS Safari, Android touch).
 *
 * Automatically coordinates with Lenis smooth-scroll.
 */
export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;
    if (typeof document === 'undefined') return;

    const body = document.body;
    const html = document.documentElement;

    if (lockCount === 0) {
      // Save current scroll position
      savedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

      prevBodyPosition = body.style.position || '';
      prevBodyTop = body.style.top || '';
      prevBodyWidth = body.style.width || '';
      prevBodyOverflow = body.style.overflow || '';
      prevHtmlOverflow = html.style.overflow || '';

      // Lock documentElement & body
      html.style.overflow = 'hidden';
      html.style.overscrollBehavior = 'none';

      body.style.overflow = 'hidden';
      body.style.overscrollBehavior = 'none';
      body.style.position = 'fixed';
      body.style.top = `-${savedScrollY}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';

      // Inform Lenis / scroll listeners
      window.dispatchEvent(
        new CustomEvent('sdc-scroll-lock', {
          detail: { locked: true, scrollY: savedScrollY },
        })
      );
    }

    lockCount++;

    return () => {
      lockCount = Math.max(0, lockCount - 1);

      if (lockCount === 0) {
        body.style.position = prevBodyPosition;
        body.style.top = prevBodyTop;
        body.style.left = '';
        body.style.right = '';
        body.style.width = prevBodyWidth;
        body.style.overflow = prevBodyOverflow;
        body.style.overscrollBehavior = '';

        html.style.overflow = prevHtmlOverflow;
        html.style.overscrollBehavior = '';

        // Restore exact scroll position
        window.scrollTo(0, savedScrollY);

        window.dispatchEvent(
          new CustomEvent('sdc-scroll-lock', {
            detail: { locked: false, scrollY: savedScrollY },
          })
        );
      }
    };
  }, [isLocked]);
}

export default useScrollLock;

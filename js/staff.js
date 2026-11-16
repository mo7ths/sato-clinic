(() => {
    'use strict';

    const triggers = Array.from(document.querySelectorAll('.staff-plus[href^="#staff-profile-"]'));
    const modals = Array.from(document.querySelectorAll('.staff-modal[id^="staff-profile-"]'));
    if (!triggers.length || !modals.length) return;

    let activeModal = null;
    let activeTrigger = null;
    let savedPage = null;

    const restoreStyle = (element, style) => {
        if (style === null) element.removeAttribute('style');
        else element.setAttribute('style', style);
    };

    const lockPage = () => {
        const bodyWidth = document.body.getBoundingClientRect().width;
        savedPage = {
            x: window.scrollX,
            y: window.scrollY,
            bodyStyle: document.body.getAttribute('style'),
            rootStyle: document.documentElement.getAttribute('style')
        };

        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.scrollBehavior = 'auto';
        Object.assign(document.body.style, {
            position: 'fixed',
            top: `${-savedPage.y}px`,
            left: `${-savedPage.x}px`,
            width: `${bodyWidth}px`
        });
    };

    const unlockPage = (restoreFocus = true) => {
        if (!savedPage) return;
        const saved = savedPage;
        savedPage = null;

        restoreStyle(document.body, saved.bodyStyle);
        restoreStyle(document.documentElement, saved.rootStyle);
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(saved.x, saved.y);
        if (restoreFocus && activeTrigger) activeTrigger.focus({ preventScroll: true });
        restoreStyle(document.documentElement, saved.rootStyle);
    };

    const closeModal = (restoreFocus = true) => {
        if (!activeModal) return;
        activeModal.classList.remove('is-open');
        activeModal.setAttribute('aria-hidden', 'true');
        activeTrigger.setAttribute('aria-expanded', 'false');
        activeModal = null;
        unlockPage(restoreFocus);
        activeTrigger = null;
    };

    triggers.forEach((trigger) => {
        const modalId = trigger.getAttribute('href').slice(1);
        trigger.setAttribute('aria-controls', modalId);
        trigger.setAttribute('aria-haspopup', 'dialog');
        trigger.setAttribute('aria-expanded', 'false');
    });

    modals.forEach((modal) => {
        modal.setAttribute('aria-hidden', 'true');
    });

    document.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) return;

        const trigger = target.closest('.staff-plus[href^="#staff-profile-"]');
        if (trigger) {
            const modal = document.getElementById(trigger.getAttribute('href').slice(1));
            if (!modal) return;
            event.preventDefault();
            if (activeModal) closeModal(false);
            activeModal = modal;
            activeTrigger = trigger;
            lockPage();
            modal.classList.add('is-open');
            modal.removeAttribute('aria-hidden');
            trigger.setAttribute('aria-expanded', 'true');
            modal.querySelector('.modal-close')?.focus({ preventScroll: true });
            return;
        }

        const closeLink = target.closest('.staff-backdrop, .modal-close');
        if (closeLink && activeModal?.contains(closeLink)) {
            event.preventDefault();
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (!activeModal) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            closeModal();
            return;
        }
        if (event.key !== 'Tab') return;

        const focusable = Array.from(activeModal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
            .filter((element) => !element.classList.contains('staff-backdrop') && element.getClientRects().length > 0);
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || !activeModal.contains(document.activeElement))) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !activeModal.contains(document.activeElement))) {
            event.preventDefault();
            first.focus();
        }
    });

    window.addEventListener('pagehide', () => closeModal(false));
})();

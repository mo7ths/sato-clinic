(() => {
    'use strict';

    const frameName = 'sato-clinic-menu-overlay';
    const messagePrefix = 'sato-clinic-menu:';
    const targetOrigin = location.protocol === 'file:' ? '*' : location.origin;
    const isSameOrigin = (event) => location.protocol === 'file:' || event.origin === location.origin;
    const plainClick = (event) => event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

    // Keep the standalone menu page intact; only embedded menus report to their opener.
    if (window.parent !== window && window.name === frameName) {
        const close = document.querySelector('.sc-extra-menu-close');
        if (!close) return;

        const send = (type, extra = {}) => window.parent.postMessage({ type: messagePrefix + type, ...extra }, targetOrigin);
        document.documentElement.style.overscrollBehavior = 'none';
        document.documentElement.style.scrollBehavior = 'auto';

        document.querySelectorAll('a[href]').forEach((link) => {
            link.target = '_top';
        });

        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href]');
            if (!link || !plainClick(event)) return;
            event.preventDefault();
            if (link === close) send('close');
            else send('navigate', { href: link.href });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                send('close');
            } else if (event.key === 'Tab') {
                const links = Array.from(document.querySelectorAll('a[href]'));
                const first = links[0];
                const last = links[links.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });

        window.addEventListener('message', (event) => {
            if (event.source !== window.parent || !isSameOrigin(event)) return;
            if (event.data?.type === messagePrefix + 'open') {
                window.scrollTo(0, 0);
                close.focus({ preventScroll: true });
            }
        });
        send('ready');
        return;
    }

    const openers = Array.from(document.querySelectorAll('.site-menu-link'));
    if (!openers.length || typeof HTMLDialogElement === 'undefined') return;

    const dialog = document.createElement('dialog');
    dialog.id = 'site-menu-overlay';
    dialog.className = 'site-menu-overlay';
    dialog.setAttribute('aria-label', 'サイトメニュー');

    const frame = document.createElement('iframe');
    frame.className = 'site-menu-frame';
    frame.name = frameName;
    frame.title = 'サイトメニュー';
    document.body.append(dialog);

    let savedPage = null;
    let ready = false;
    const restoreStyle = (element, style) => {
        if (style === null) element.removeAttribute('style');
        else element.setAttribute('style', style);
    };
    const restorePage = () => {
        if (!savedPage) return;
        const saved = savedPage;
        savedPage = null;
        restoreStyle(document.body, saved.bodyStyle);
        restoreStyle(document.documentElement, saved.rootStyle);
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(saved.x, saved.y);
        saved.opener.focus({ preventScroll: true });
        restoreStyle(document.documentElement, saved.rootStyle);
        openers.forEach((link) => link.setAttribute('aria-expanded', 'false'));
    };
    const closeMenu = () => {
        if (dialog.open) dialog.close();
        restorePage();
    };

    openers.forEach((link) => {
        link.setAttribute('aria-controls', dialog.id);
        link.setAttribute('aria-haspopup', 'dialog');
        link.setAttribute('aria-expanded', 'false');
        link.addEventListener('click', (event) => {
            if (!plainClick(event)) return;
            event.preventDefault();
            if (dialog.open) return;

            savedPage = {
                x: window.scrollX,
                y: window.scrollY,
                bodyStyle: document.body.getAttribute('style'),
                rootStyle: document.documentElement.getAttribute('style'),
                opener: link
            };
            const width = document.body.getBoundingClientRect().width;
            document.documentElement.style.overflow = 'hidden';
            document.documentElement.style.scrollBehavior = 'auto';
            Object.assign(document.body.style, {
                position: 'fixed',
                top: `${-savedPage.y}px`,
                left: `${-savedPage.x}px`,
                width: `${width}px`
            });
            if (!frame.hasAttribute('src')) {
                frame.src = link.href;
                dialog.append(frame);
            }
            dialog.showModal();
            link.setAttribute('aria-expanded', 'true');
            if (ready) frame.contentWindow.postMessage({ type: messagePrefix + 'open' }, targetOrigin);
            frame.focus({ preventScroll: true });
        });
    });

    dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        closeMenu();
    });
    dialog.addEventListener('close', restorePage);
    window.addEventListener('pagehide', closeMenu);
    window.addEventListener('message', (event) => {
        if (event.source !== frame.contentWindow || !isSameOrigin(event)) return;
        if (event.data?.type === messagePrefix + 'ready') {
            ready = true;
            if (dialog.open) frame.contentWindow.postMessage({ type: messagePrefix + 'open' }, targetOrigin);
        } else if (event.data?.type === messagePrefix + 'close') {
            closeMenu();
        } else if (event.data?.type === messagePrefix + 'navigate' && dialog.open) {
            const url = new URL(event.data.href, document.baseURI);
            if (url.origin !== location.origin || url.protocol !== location.protocol) return;
            closeMenu();
            window.location.assign(url.href);
        }
    });
})();

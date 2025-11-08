document.addEventListener('DOMContentLoaded', function() {
    // Helpers
    const $ = (s, root = document) => root.querySelector(s);
    const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

    // Robust base URL (domain + repo root if any, not including /q/slug)
    function computeBaseUrl() {
        const origin = window.location.origin;
        const withoutQ = window.location.pathname.replace(/\/q\/.*$/, '');
        const trimmed = withoutQ.replace(/\/$/, '');
        return origin + trimmed;
    }
    const baseUrl = computeBaseUrl();

    // Ensure header exists (inject it if missing)
    function ensureHeader() {
        let header = document.getElementById('header');
        if (header) return header;

        const headerEl = document.createElement('header');
        headerEl.id = 'header';
        headerEl.innerHTML = `
            <a href="${baseUrl}/" class="logo">Cospute</a>
            <nav>
                <a href="https://github.com/cospute" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                    <svg class="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="https://www.youtube.com/@cospute" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                    <svg class="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="https://x.com/cospute" target="_blank" rel="noopener noreferrer" aria-label="X">
                    <svg class="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
            </nav>
        `;
        document.body.prepend(headerEl);
        return headerEl;
    }

    // Grab DOM refs (after possibly injecting header)
    const header = ensureHeader();
    const contentViewer = $('#content-viewer');
    const contentBody = $('#content-body');
    const cardsContainer = $('#cards-container');
    const contentWrapper = $('.content-wrapper');
    const closeBtn = $('.close-button');
    const mainContent = $('.main-content');

    // Anim
    function triggerSlideIn() {
        if (!contentViewer) return;
        contentViewer.classList.remove('slide-in');
        void contentViewer.offsetWidth; // reflow
        contentViewer.classList.add('slide-in');
    }

    // UI actions
    function showContent(postId, slug, updateUrl = true) {
        if (!contentViewer || !contentBody || !cardsContainer || !contentWrapper) return;

        const postContent = document.getElementById(postId);
        if (!postContent) return;

        contentBody.innerHTML = postContent.innerHTML;
        contentViewer.classList.add('active');
        cardsContainer.classList.add('collapsed');
        contentWrapper.classList.add('viewing-content');

        triggerSlideIn();

        contentViewer.scrollTop = 0;

        // Scroll window to bring main content below header
        const headerHeight = header ? header.offsetHeight : 40;
        if (mainContent) {
            const mainContentTop = mainContent.offsetTop;
            window.scrollTo({
                top: Math.max(0, mainContentTop - headerHeight),
                behavior: 'smooth'
            });
        } else {
            window.scrollTo({ top: headerHeight, behavior: 'smooth' });
        }

        if (updateUrl && slug) {
            const newUrl = `${baseUrl}/q/${slug}/`;
            window.history.pushState({ postId, slug }, '', newUrl);
        }
    }

    function hideContent(updateUrl = true) {
        if (!contentViewer || !cardsContainer || !contentWrapper) return;

        contentViewer.classList.remove('active', 'slide-in');
        cardsContainer.classList.remove('collapsed');
        contentWrapper.classList.remove('viewing-content');

        if (updateUrl) {
            window.history.pushState({}, '', baseUrl + '/');
        }
    }

    // Deep link: /q/<slug> — ensure header exists and show content if needed
    (function handleDeepLink() {
        const currentPath = window.location.pathname;
        const postMatch = currentPath.match(/\/q\/([^\/]+)\/?$/);
        if (!postMatch) return;

        const slug = postMatch[1];

        // If #content-body already has content, we're likely on a fully-rendered Jekyll post page.
        // Otherwise, we're on the index shell (or a SPA fallback) and need to populate the viewer.
        const isShell = contentBody && contentBody.children.length === 0;

        // Always ensure header is present for deep links.
        ensureHeader();

        if (isShell) {
            const postElements = $$('.post-content-hidden');
            const el = postElements.find(e => e.getAttribute('data-slug') === slug);
            if (el) {
                setTimeout(() => showContent(el.id, slug, false), 100);
            }
        } else {
            // Jekyll-rendered post page. Optionally nudge scroll below header.
            setTimeout(() => {
                const headerHeight = header ? header.offsetHeight : 40;
                if (mainContent) {
                    const mainContentTop = mainContent.offsetTop;
                    window.scrollTo({
                        top: Math.max(0, mainContentTop - headerHeight),
                        behavior: 'auto'
                    });
                }
            }, 50);
        }
    })();

    // Card clicks -> open content
    $$('.card-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', function(e) {
            e.preventDefault();
            const postId = this.getAttribute('data-post-id');
            const slug = this.getAttribute('data-post-slug');
            showContent(postId, slug);
        });
    });

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            hideContent();
        });
    }

    // ESC closes viewer
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && contentViewer && contentViewer.classList.contains('active')) {
            hideContent();
        }
    });

    // Back/forward
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.postId) {
            showContent(event.state.postId, event.state.slug, false);
        } else {
            hideContent(false);
        }
    });

    // Resize tweaks
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 968 && contentViewer && contentViewer.classList.contains('active') && cardsContainer) {
                cardsContainer.style.display = '';
            }
        }, 250);
    });
});

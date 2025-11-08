document.addEventListener('DOMContentLoaded', function() {
    const cardWrappers = document.querySelectorAll('.card-wrapper');
    const contentViewer = document.getElementById('content-viewer');
    const contentBody = document.getElementById('content-body');
    const cardsContainer = document.getElementById('cards-container');
    const contentWrapper = document.querySelector('.content-wrapper');
    const closeBtn = document.querySelector('.close-button');
    const baseUrl = window.location.origin + window.location.pathname.replace(/\/q\/.*$/, '').replace(/\/$/, '');

    // Function to trigger slide-in animation
    function triggerSlideIn() {
        contentViewer.classList.remove('slide-in');
        // Force reflow to restart animation
        void contentViewer.offsetWidth;
        contentViewer.classList.add('slide-in');
    }

    // Function to show content
    function showContent(postId, slug, updateUrl = true) {
        const postContent = document.getElementById(postId);
        
        if (postContent) {
            // Update content
            contentBody.innerHTML = postContent.innerHTML;
            
            // Show content viewer and collapse grid
            contentViewer.classList.add('active');
            cardsContainer.classList.add('collapsed');
            contentWrapper.classList.add('viewing-content');
            
            // Trigger slide-in animation
            triggerSlideIn();
            
            // Scroll to top of content viewer
            contentViewer.scrollTop = 0;
            
            // Scroll window to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Update URL if needed
            if (updateUrl && slug) {
                const newUrl = `${baseUrl}/q/${slug}/`;
                window.history.pushState({ postId: postId, slug: slug }, '', newUrl);
            }
        }
    }

    // Function to hide content
    function hideContent(updateUrl = true) {
        // Hide content viewer and expand grid
        contentViewer.classList.remove('active');
        contentViewer.classList.remove('slide-in');
        cardsContainer.classList.remove('collapsed');
        contentWrapper.classList.remove('viewing-content');
        
        // Update URL back to root if needed
        if (updateUrl) {
            window.history.pushState({}, '', baseUrl + '/');
        }
    }

    // Check if we're on a direct post URL
    const currentPath = window.location.pathname;
    const postMatch = currentPath.match(/\/q\/([^\/]+)\/?$/);
    
    if (postMatch) {
        // We're on a post page, find and show the corresponding content
        const slug = postMatch[1];
        const postElements = document.querySelectorAll('.post-content-hidden');
        
        postElements.forEach(element => {
            if (element.getAttribute('data-slug') === slug) {
                showContent(element.id, slug, false);
            }
        });
    }

    // Show content when card is clicked
    cardWrappers.forEach(wrapper => {
        wrapper.addEventListener('click', function(e) {
            e.preventDefault();
            const postId = this.getAttribute('data-post-id');
            const slug = this.getAttribute('data-post-slug');
            showContent(postId, slug);
        });
    });

    // Hide content when close button is clicked
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            hideContent();
        });
    }

    // Close content with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && contentViewer.classList.contains('active')) {
            hideContent();
        }
    });

    // Handle browser back/forward buttons
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.postId) {
            showContent(event.state.postId, event.state.slug, false);
        } else {
            hideContent(false);
        }
    });

    // Handle responsive behavior on resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Re-evaluate layout if needed
            if (window.innerWidth > 968 && contentViewer.classList.contains('active')) {
                // Ensure proper layout on larger screens
                cardsContainer.style.display = '';
            }
        }, 250);
    });
});

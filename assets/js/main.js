document.addEventListener('DOMContentLoaded', function() {
    const cardWrappers = document.querySelectorAll('.card-wrapper');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close');
    const baseUrl = window.location.origin + window.location.pathname.replace(/\/q\/.*$/, '').replace(/\/$/, '');

    // Function to open modal with content
    function openModal(postId, slug, updateUrl = true) {
        const postContent = document.getElementById(postId);
        
        if (postContent) {
            modalBody.innerHTML = postContent.innerHTML;
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Update URL if needed
            if (updateUrl && slug) {
                const newUrl = `${baseUrl}/q/${slug}/`;
                window.history.pushState({ postId: postId, slug: slug }, '', newUrl);
            }
        }
    }

    // Function to close modal
    function closeModal(updateUrl = true) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Update URL back to root if needed
        if (updateUrl) {
            window.history.pushState({}, '', baseUrl + '/');
        }
    }

    // Check if we're on a direct post URL
    const currentPath = window.location.pathname;
    const postMatch = currentPath.match(/\/q\/([^\/]+)\/?$/);
    
    if (postMatch) {
        // We're on a post page, find and open the corresponding modal
        const slug = postMatch[1];
        const postElements = document.querySelectorAll('.post-content-hidden');
        
        postElements.forEach(element => {
            if (element.getAttribute('data-slug') === slug) {
                openModal(element.id, slug, false);
            }
        });
    }

    // Open modal when card or title is clicked
    cardWrappers.forEach(wrapper => {
        wrapper.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.querySelector('.card');
            const postId = card.getAttribute('data-post-id');
            const slug = card.getAttribute('data-post-slug');
            openModal(postId, slug);
        });
    });

    // Close modal when X is clicked
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeModal();
        });
    }

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });

    // Handle browser back/forward buttons
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.postId) {
            openModal(event.state.postId, event.state.slug, false);
        } else {
            closeModal(false);
        }
    });
});

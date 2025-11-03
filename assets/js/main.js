document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close');

    // Open modal when card is clicked
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');
            const postContent = document.getElementById(postId);
            
            if (postContent) {
                modalBody.innerHTML = postContent.innerHTML;
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            }
        });
    });

    // Close modal when X is clicked
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});

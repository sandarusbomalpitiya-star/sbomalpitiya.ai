document.addEventListener('DOMContentLoaded', () => {
    // Intro Pop-up logic
    const introPopup = document.getElementById('intro-popup');
    const mainContent = document.getElementById('main-content');
    
    // Simulate loading time and then hide popup
    setTimeout(() => {
        introPopup.classList.add('hidden');
        
        // After transition, remove from DOM flow
        setTimeout(() => {
            introPopup.style.display = 'none';
            // Show main content smoothly
            mainContent.classList.add('visible');
        }, 1000); // Wait for the CSS transition (1s) to finish
    }, 2800); // Hold the popup for 2.8 seconds

    // Add glowing effect to mouse movement inside glass panels for a dynamic "living" feel
    const glassPanels = document.querySelectorAll('.glass-panel');
    
    glassPanels.forEach(panel => {
        panel.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Dynamic radial gradient based on mouse position
            panel.style.background = `
                radial-gradient(circle at ${x}px ${y}px, rgba(0, 240, 255, 0.12) 0%, rgba(10, 10, 15, 0.4) 50%)
            `;
        });
        
        panel.addEventListener('mouseleave', () => {
            // Reset to default glass background
            panel.style.background = 'rgba(10, 10, 15, 0.4)';
        });
    });

    // Load gallery from LocalStorage
    const galleryContainer = document.getElementById('gallery-container');
    const emptyState = document.getElementById('empty-state');
    
    function loadGallery() {
        const mediaList = JSON.parse(localStorage.getItem('ai_portfolio_media')) || [];
        
        if (mediaList.length > 0) {
            if (emptyState) emptyState.style.display = 'none';
            
            mediaList.forEach(item => {
                const el = document.createElement('div');
                el.className = 'gallery-item';
                
                let mediaHtml = '';
                if (item.type === 'image') {
                    mediaHtml = `<img src="${item.url}" alt="${item.title}">`;
                } else if (item.type === 'video') {
                    if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
                        // Extract YT ID
                        const match = item.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
                        const ytId = match ? match[1] : '';
                        mediaHtml = `<iframe src="https://www.youtube.com/embed/${ytId}" frameborder="0" allowfullscreen></iframe>`;
                    } else {
                        mediaHtml = `<video src="${item.url}" controls></video>`;
                    }
                }
                
                el.innerHTML = `
                    ${mediaHtml}
                    <div class="gallery-item-title">${item.title}</div>
                `;
                
                galleryContainer.appendChild(el);
            });
        }
    }

    if (galleryContainer) {
        loadGallery();
    }
});

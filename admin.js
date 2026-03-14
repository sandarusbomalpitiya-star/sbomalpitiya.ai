document.addEventListener('DOMContentLoaded', () => {
    // --- AUTHENTICATION LOGIC (MOCK) ---
    const authView = document.getElementById('auth-view');
    const dashboardView = document.getElementById('dashboard-view');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const authTitle = document.getElementById('auth-title');
    const authForm = document.getElementById('auth-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const authSubmit = document.getElementById('auth-submit');
    const authError = document.getElementById('auth-error');
    const btnLogout = document.getElementById('btn-logout');

    let isLoginMode = true;

    // Check existing session
    if (localStorage.getItem('ai_admin_session')) {
        showDashboard();
    }

    // Toggle Tabs
    tabLogin.addEventListener('click', () => {
        isLoginMode = true;
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        authTitle.innerText = 'System Login';
        authSubmit.innerText = 'Initialize Session';
        authError.innerText = '';
    });

    tabSignup.addEventListener('click', () => {
        isLoginMode = false;
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        authTitle.innerText = 'Register Admin Node';
        authSubmit.innerText = 'Create Encrypted Profile';
        authError.innerText = '';
    });

    // Handle Form Submit
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = usernameInput.value.trim();
        const pass = passwordInput.value.trim();

        if (isLoginMode) {
            // Check credentials
            const accounts = JSON.parse(localStorage.getItem('ai_admin_accounts')) || {};
            if (accounts[user] && accounts[user] === pass) {
                // Success
                localStorage.setItem('ai_admin_session', user);
                showDashboard();
            } else {
                authError.innerText = 'Authentication Failed. Intrusion logged.';
            }
        } else {
            // Signup logic
            const accounts = JSON.parse(localStorage.getItem('ai_admin_accounts')) || {};
            if (accounts[user]) {
                authError.innerText = 'Admin profile already exists.';
            } else if (pass.length < 4) {
                authError.innerText = 'Passcode too weak. Require length >= 4.';
            } else {
                accounts[user] = pass;
                localStorage.setItem('ai_admin_accounts', JSON.stringify(accounts));
                // auto login
                localStorage.setItem('ai_admin_session', user);
                showDashboard();
            }
        }
    });

    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('ai_admin_session');
        dashboardView.classList.add('hidden');
        authView.classList.remove('hidden');
        usernameInput.value = '';
        passwordInput.value = '';
    });

    function showDashboard() {
        authView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        renderAdminMediaList();
    }


    // --- MEDIA DASHBOARD LOGIC ---
    const uploadForm = document.getElementById('upload-form');
    const mediaTypeSelect = document.getElementById('media-type');
    const fileInputGroup = document.getElementById('file-input-group');
    const urlInputGroup = document.getElementById('url-input-group');
    const uploadMsg = document.getElementById('upload-msg');
    const urlInput = document.getElementById('media-url');
    const fileInput = document.getElementById('media-file');
    const titleInput = document.getElementById('media-title');
    const mediaListContainer = document.getElementById('admin-media-list');

    // Toggle File/URL inputs based on type
    mediaTypeSelect.addEventListener('change', () => {
        if (mediaTypeSelect.value === 'image') {
            fileInputGroup.classList.remove('hidden');
            urlInputGroup.classList.add('hidden');
            urlInput.removeAttribute('required');
        } else {
            fileInputGroup.classList.add('hidden');
            urlInputGroup.classList.remove('hidden');
            urlInput.setAttribute('required', 'true');
        }
    });

    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const type = mediaTypeSelect.value;
        const title = titleInput.value.trim();

        // Retrieve existing media
        let mediaDb = JSON.parse(localStorage.getItem('ai_portfolio_media')) || [];

        if (type === 'video') {
            const url = urlInput.value.trim();
            mediaDb.push({ id: Date.now(), title, type, url });
            finalizeUpload(mediaDb);
        } else {
            // Image upload handling
            const file = fileInput.files[0];
            if (!file) {
                uploadMsg.style.color = '#ff3366';
                uploadMsg.innerText = 'ERROR: No image file selected.';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                const base64Data = event.target.result;
                mediaDb.push({ id: Date.now(), title, type, url: base64Data });
                
                try {
                    finalizeUpload(mediaDb);
                } catch (err) {
                    if (err.name === 'QuotaExceededError') {
                        uploadMsg.style.color = '#ff3366';
                        uploadMsg.innerText = 'STORAGE FULL: Cannot save this large image anymore.';
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    });

    function finalizeUpload(updatedDb) {
        localStorage.setItem('ai_portfolio_media', JSON.stringify(updatedDb));
        uploadMsg.style.color = 'var(--primary-color)';
        uploadMsg.innerText = 'Upload Successful! Media deployed to public server.';
        
        // Reset form
        titleInput.value = '';
        fileInput.value = '';
        urlInput.value = '';
        
        setTimeout(() => uploadMsg.innerText = '', 3000);
        renderAdminMediaList();
    }

    function renderAdminMediaList() {
        const mediaDb = JSON.parse(localStorage.getItem('ai_portfolio_media')) || [];
        mediaListContainer.innerHTML = '';
        
        if (mediaDb.length === 0) {
            mediaListContainer.innerHTML = '<li style="justify-content:center; color:#888;">No records found.</li>';
            return;
        }

        mediaDb.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span><strong>${item.title}</strong> <small>[${item.type.toUpperCase()}]</small></span>
                <button class="delete-btn" data-id="${item.id}">Delete</button>
            `;
            mediaListContainer.appendChild(li);
        });

        // Add delete listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idToDelete = parseInt(e.target.getAttribute('data-id'));
                let currentDb = JSON.parse(localStorage.getItem('ai_portfolio_media')) || [];
                currentDb = currentDb.filter(m => m.id !== idToDelete);
                localStorage.setItem('ai_portfolio_media', JSON.stringify(currentDb));
                renderAdminMediaList();
            });
        });
    }

});

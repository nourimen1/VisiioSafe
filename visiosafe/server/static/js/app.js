document.addEventListener('DOMContentLoaded', () => {
    // Références DOM
    const DOM = {
        authNav: document.getElementById('auth-nav'),
        loginBtn: document.getElementById('login-btn'),
        registerBtn: document.getElementById('register-btn'),
        demoBtn: document.getElementById('demo-btn'),
        featuresBtn: document.getElementById('features-btn'),
        authModal: document.getElementById('auth-modal'),
        modalTitle: document.getElementById('modal-title'),
        authForm: document.getElementById('auth-form'),
        submitAuthBtn: document.getElementById('submit-auth'),
        submitText: document.getElementById('submit-text'),
        authSpinner: document.getElementById('auth-spinner'),
        closeModal: document.querySelector('.close'),
        authError: document.getElementById('auth-error'),
        mainContent: document.getElementById('main-content'),
        notification: document.getElementById('notification')
    };

    // État de l'application
    const state = {
        currentUser: null,
        currentToken: localStorage.getItem('token') || null,
        isLoading: false
    };

    // Initialisation
    init();

    function init() {
        setupEventListeners();
        checkAuthStatus();
    }

    function setupEventListeners() {
        // Boutons d'authentification
        if (DOM.loginBtn) DOM.loginBtn.addEventListener('click', () => showAuthModal('login'));
        if (DOM.registerBtn) DOM.registerBtn.addEventListener('click', () => showAuthModal('register'));
        
        // Boutons de démo
        if (DOM.demoBtn) DOM.demoBtn.addEventListener('click', showDemoContent);
        if (DOM.featuresBtn) DOM.featuresBtn.addEventListener('click', showFeatures);
        
        // Modal
        if (DOM.closeModal) DOM.closeModal.addEventListener('click', hideAuthModal);
        if (DOM.authForm) DOM.authForm.addEventListener('submit', handleAuthSubmit);
    }

    function checkAuthStatus() {
        if (state.currentToken) {
            loadAuthenticatedContent();
        } else {
            DOM.authNav.classList.remove('hidden');
        }
    }

    function showAuthModal(type) {
        DOM.modalTitle.textContent = type === 'login' ? 'Connectez-vous' : 'Créez un compte';
        DOM.submitText.textContent = type === 'login' ? 'Se connecter' : 'S\'inscrire';
        DOM.authForm.dataset.type = type;
        DOM.authError.textContent = '';
        DOM.authModal.classList.remove('hidden');
    }

    function hideAuthModal() {
        DOM.authModal.classList.add('hidden');
    }

    async function handleAuthSubmit(e) {
        e.preventDefault();
        
        const type = DOM.authForm.dataset.type;
        const credentials = {
            username: DOM.authForm.querySelector('#username').value,
            password: DOM.authForm.querySelector('#password').value
        };

        setLoading(true);

        try {
            const response = await fetch(`/${type}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur d\'authentification');
            }

            state.currentToken = data.token;
            localStorage.setItem('token', state.currentToken);
            
            showNotification(type === 'login' ? 'Connexion réussie' : 'Inscription réussie', 'success');
            hideAuthModal();
            loadAuthenticatedContent();
            
        } catch (error) {
            DOM.authError.textContent = error.message;
            showNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    }

    function setLoading(isLoading) {
        state.isLoading = isLoading;
        if (isLoading) {
            DOM.submitText.classList.add('hidden');
            DOM.authSpinner.classList.remove('hidden');
            DOM.submitAuthBtn.disabled = true;
        } else {
            DOM.submitText.classList.remove('hidden');
            DOM.authSpinner.classList.add('hidden');
            DOM.submitAuthBtn.disabled = false;
        }
    }

    function showDemoContent() {
        DOM.mainContent.innerHTML = `
            <section class="demo-section">
                <h2>Démonstration interactive</h2>
                <div class="demo-container">
                    <iframe 
                        width="800" 
                        height="450" 
                        src="https://www.youtube.com/embed/example" 
                        frameborder="0" 
                        allowfullscreen
                    ></iframe>
                </div>
                <div class="demo-cta">
                    <button id="start-now-btn" class="btn btn-primary">Essayer maintenant</button>
                </div>
            </section>
        `;
        
        document.getElementById('start-now-btn')?.addEventListener('click', () => {
            showAuthModal('register');
        });
        
        DOM.mainContent.classList.remove('hidden');
    }

    function showFeatures() {
        DOM.mainContent.innerHTML = `
            <section class="features-section">
                <h2>Nos Fonctionnalités</h2>
                <div class="features-grid">
                    <!-- Feature cards -->
                </div>
            </section>
        `;
        DOM.mainContent.classList.remove('hidden');
    }

    function loadAuthenticatedContent() {
        // Charger le contenu sécurisé ici
        DOM.mainContent.innerHTML = `
            <div class="dashboard">
                <!-- Contenu du tableau de bord -->
            </div>
        `;
        
        DOM.authNav.classList.add('hidden');
        DOM.mainContent.classList.remove('hidden');
    }

    function showNotification(message, type = 'success') {
        DOM.notification.textContent = message;
        DOM.notification.className = `notification ${type}`;
        DOM.notification.classList.remove('hidden');
        
        setTimeout(() => {
            DOM.notification.classList.add('fade-out');
            setTimeout(() => DOM.notification.classList.add('hidden'), 300);
        }, 3000);
    }
});
document.addEventListener('DOMContentLoaded', () => {
    // Éléments du DOM
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Gestion des clics sur les boutons
    loginBtn.addEventListener('click', () => {
        registerModal.classList.add('hidden');
        loginModal.classList.remove('hidden');
    });

    registerBtn.addEventListener('click', () => {
        loginModal.classList.add('hidden');
        registerModal.classList.remove('hidden');
    });

    // Fermeture des modals en cliquant à l'extérieur
    [loginModal, registerModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // Soumission du formulaire de connexion
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Redirection vers le dashboard après connexion réussie
                window.location.href = '/dashboard';
            } else {
                alert(data.message || 'Erreur de connexion');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur de connexion au serveur');
        }
    });

    // Soumission du formulaire d'inscription
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            alert('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Inscription réussie ! Vous pouvez maintenant vous connecter');
                registerModal.classList.add('hidden');
            } else {
                alert(data.message || 'Erreur lors de l\'inscription');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur de connexion au serveur');
        }
    });
});

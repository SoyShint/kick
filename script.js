const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.getElementById('nav-links');

mobileMenu.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Configuración de Kick
const KICK_CONFIG = {
  clientId: "01JVARVDGZZ024D2KSBJV5KBDQ",
  redirectUri: "https://diffrent.netlify.app/callback.html",
  authUrl: "https://id.kick.com/oauth/authorize",
  tokenUrl: "https://id.kick.com/oauth/token",
  scopes: "openid"
};

// Elementos DOM
const loginArea = document.getElementById('loginArea');

// Generador de PKCE
async function generatePKCE() {
  const verifier = generateRandomString(128);
  localStorage.setItem('pkce_verifier', verifier);
  
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  
  return base64URLEncode(digest);
}

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const cryptoArray = new Uint8Array(length);
  
  crypto.getRandomValues(cryptoArray);
  cryptoArray.forEach(b => {
    result += chars[b % chars.length];
  });
  
  return result;
}

function base64URLEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Iniciar login con Kick
async function startKickLogin() {
  const challenge = await generatePKCE();
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: KICK_CONFIG.clientId,
    redirect_uri: KICK_CONFIG.redirectUri,
    scope: KICK_CONFIG.scopes,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state: generateRandomString(16)
  });

  window.location.href = `${KICK_CONFIG.authUrl}?${params}`;
}

// Procesar callback
async function handleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (code) {
    try {
      const token = await exchangeCodeForToken(code);
      const user = await fetchKickUser(token.access_token);
      
      localStorage.setItem('kickUser', JSON.stringify(user));
      window.location.href = '/index.html';
    } catch (error) {
      console.error('Error en autenticación:', error);
      alert('Error en el login. Por favor intenta nuevamente.');
    }
  }
}

// Intercambiar código por token
async function exchangeCodeForToken(code) {
  const verifier = localStorage.getItem('pkce_verifier');
  
  const response = await fetch(KICK_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: KICK_CONFIG.clientId,
      code,
      grant_type: 'authorization_code',
      redirect_uri: KICK_CONFIG.redirectUri,
      code_verifier: verifier
    })
  });

  if (!response.ok) {
    throw new Error('Error al obtener token');
  }

  return await response.json();
}

// Obtener datos de usuario (placeholder)
async function fetchKickUser(accessToken) {
  return {
    username: 'UsuarioKick',
    id: '123456',
    accessToken: accessToken
  };
}

// Renderizar estado de login
function renderLoginState() {
  const userData = localStorage.getItem('kickUser');
  
  if (userData) {
    const user = JSON.parse(userData);
    loginArea.innerHTML = `
      <div class="discord-user">
        <i class="fab fa-kick"></i> ${user.username}
      </div>
      <button onclick="logout()">Cerrar sesión</button>
    `;
  } else {
    loginArea.innerHTML = `
      <a href="#" class="discord-login-btn" id="kickLoginBtn">
        <i class="fab fa-kick"></i> Iniciar sesión con Kick
      </a>
    `;
    document.getElementById('kickLoginBtn').addEventListener('click', startKickLogin);
  }
}

// Cerrar sesión
function logout() {
  localStorage.removeItem('kickUser');
  localStorage.removeItem('pkce_verifier');
  renderLoginState();
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('callback.html')) {
    handleCallback();
  } else {
    renderLoginState();
  }
});

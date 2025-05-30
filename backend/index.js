// backend/index.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

const CLIENT_ID = '01JVARVDGZZ024D2KSBJV5KBDQ';
const CLIENT_SECRET = 'd1b57b2d5d3c8d5ed61d7b7fbe829ef777357658a1a883b317f36595cce16792';
const REDIRECT_URI = 'http://localhost:3000/callback';
const PORT = 3000;

app.use(cors());

// Step 1: Redirect user to Kick for authorization
app.get('/login', (req, res) => {
  const authUrl = `https://kick.com/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user.read`; // You can customize scopes
  res.redirect(authUrl);
});

// Step 2: Callback to receive code and exchange it for an access token
app.get('/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const response = await axios.post('https://kick.com/oauth/token', {
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });

    const { access_token, refresh_token } = response.data;

    // Example: Send tokens to frontend or store them securely
    res.send(`<h1>Login exitoso</h1><p>Token de acceso: ${access_token}</p>`);
  } catch (err) {
    console.error('Error obteniendo el token:', err.response?.data || err);
    res.status(500).send('Error intercambiando el código por el token.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

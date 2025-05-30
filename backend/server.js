import express from 'express';
import axios from 'axios';

const app = express();

const CLIENT_ID = '01JVARVDGZZ024D2KSBJV5KBDQ';
const CLIENT_SECRET = 'd1b57b2d5d3c8d5ed61d7b7fbe829ef777357658a1a883b317f36595cce16792';
const REDIRECT_URI = 'http://localhost:3000/callback';

app.get('/login', (req, res) => {
  const url = `https://kick.com/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user:read`;
  res.redirect(url);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send('No code provided');

  try {
    // Intercambia el código por un token de acceso
    const tokenRes = await axios.post('https://kick.com/oauth/token', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
    });

    const accessToken = tokenRes.data.access_token;

    // Usa el token para obtener datos del usuario
    const userRes = await axios.get('https://kick.com/api/v1/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    res.send(`
      <h1>Usuario autenticado</h1>
      <p>Nombre: ${userRes.data.name}</p>
      <p>ID: ${userRes.data.id}</p>
      <p><pre>${JSON.stringify(userRes.data, null, 2)}</pre></p>
    `);

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.send('Error al obtener token o datos del usuario');
  }
});

app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));

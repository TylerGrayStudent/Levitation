import { useEffect, useState } from 'react';
import styles from './app.module.css';

const LoginPage = () => {
  const [codeVerifier, setCodeVerifier] = useState('');
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    // Check if there is an authorization code in the URL fragment
    const hash = window.location.hash;
    console.log('hash:', hash);
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const code = params.get('code');
      if (code) {
        // Exchange the authorization code for an access token
        exchangeCodeForToken(code);
      }
    }
  }, []);

  const generateCodeVerifier = () => {
    const array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, (dec) => ('0' + dec.toString(16)).substr(-2)).join(
      ''
    );
  };

  const generateCodeChallenge = async (verifier: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  const handleIdpLogin = async () => {
    const clientId = 'f1a260d5-536c-413e-8127-4cdb8bbc06f3';
    const redirectUri = encodeURIComponent('http://localhost:4200');
    const responseType = 'code';

    // Generate code verifier and code challenge
    const verifier = generateCodeVerifier();
    setCodeVerifier(verifier);
    const challenge = await generateCodeChallenge(verifier);

    const authorizeUrl = `http://localhost:3000/api/oauth2/v2.0/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&code_challenge=${challenge}&code_challenge_method=S256`;

    // Store the code verifier in local storage or session storage
    localStorage.setItem('code_verifier', verifier);

    // Redirect to the IDP's authorize endpoint
    window.location.href = authorizeUrl;
  };

  const exchangeCodeForToken = async (code: string) => {
    const verifier = localStorage.getItem('code_verifier');
    if (!verifier) {
      console.error('Code verifier not found');
      return;
    }

    const tokenResponse = await fetch(
      'http://localhost:3000/api/oauth2/v2.0/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: 'http://localhost:4200',
          client_id: 'f1a260d5-536c-413e-8127-4cdb8bbc06f3',
          code_verifier: verifier,
        }),
      }
    );

    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      setAccessToken(tokenData.access_token);
      console.log('Access token:', tokenData.access_token);
      // Handle the access token (e.g., store it, use it for API requests, etc.)
    } else {
      console.error('Failed to exchange code for token');
    }
  };

  return (
    <div style={{ maxWidth: '40vw', wordBreak: 'break-all' }}>
      <h1 className={styles.title}>Login</h1>
      <button className={styles.idpButton} onClick={handleIdpLogin}>
        Login with IDP
      </button>
      {accessToken && (
        <div>
          <h2>Access Token</h2>
          <p>{accessToken}</p>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

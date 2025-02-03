'use client';

import { useState } from 'react';

const LoginPage = () => {
  const [email, setEmail] = useState('t@t.com');
  const [password, setPassword] = useState('passwordpassword');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Perform login logic here
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (loginResponse.ok) {
      // Extract query parameters from the URL
      const urlParams = new URLSearchParams(window.location.search);
      const client_id = urlParams.get('client_id');
      const redirect_uri = urlParams.get('redirect_uri');
      const response_type = urlParams.get('response_type');
      const code_challenge = urlParams.get('code_challenge');
      const code_challenge_method = urlParams.get('code_challenge_method');
      console.log('client_id', client_id);
      console.log('redirect_uri', redirect_uri);
      console.log('response_type', response_type);
      console.log('code_challenge', code_challenge);
      console.log('code_challenge_method', code_challenge_method);

      // Call the authorize endpoint
      const authorizeResponse = await fetch(
        '/api/oauth2/v2.0/authorize?' +
          new URLSearchParams({
            client_id: client_id ?? '',
            redirect_uri: redirect_uri ?? '',
            response_type: response_type ?? '',
            code_challenge: code_challenge ?? '',
            code_challenge_method: code_challenge_method ?? '',
          }).toString(),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (authorizeResponse.ok && authorizeResponse.redirected) {
        // Manually handle the redirect
        console.log('Redirecting to', authorizeResponse.url);
        window.location.href = authorizeResponse.url;
      } else {
        console.error('Authorization failed');
      }
    } else {
      console.error('Login failed');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;

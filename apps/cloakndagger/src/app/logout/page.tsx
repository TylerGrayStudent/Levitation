'use client';

import { useEffect, useState } from 'react';

export const LogoutPage = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
    }).then(() => {
      setLoading(false);
    });
  }, []);

  return <div>{loading ? 'Logging out...' : 'Logged out'}</div>;
};

export default LogoutPage;

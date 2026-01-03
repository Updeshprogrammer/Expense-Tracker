'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useCurrency() {
  const { data: session } = useSession();
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch('/api/user/preferences')
        .then(res => res.json())
        .then(data => {
          setCurrency(data.currency || 'INR');
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching currency:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [session]);

  return { currency, loading };
}


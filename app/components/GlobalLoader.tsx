'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Loader from './Loader';

export default function GlobalLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => {
      setTimeout(() => setLoading(false), 300); // Small delay for smooth transition
    };

    // Simulate loading on route change
    handleStart();
    handleComplete();
  }, [pathname, searchParams]);

  if (!loading) return null;

  return <Loader fullScreen={true} message="Loading WorkZen..." />;
}


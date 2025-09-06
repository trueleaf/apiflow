'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface GitHubStarsProps {
  repo: string; // Format: "owner/repo"
  className?: string;
}

export default function GitHubStars({ repo, className = '' }: GitHubStarsProps) {
  const [stars, setStars] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const response = await fetch(`https://api.github.com/repos/${repo}`);
        if (response.ok) {
          const data = await response.json();
          setStars(data.stargazers_count);
        }
      } catch (error) {
        console.error('Failed to fetch GitHub stars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStars();
  }, [repo]);

  const formatStars = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  if (loading) {
    return (
      <div className={`inline-flex items-center space-x-1 ${className}`}>
        <Star className="w-4 h-4 text-yellow-500" />
        <span className="text-sm text-gray-600">...</span>
      </div>
    );
  }

  if (stars === null) {
    return null;
  }

  return (
    <div className={`inline-flex items-center space-x-1 ${className}`}>
      <Star className="w-4 h-4 text-yellow-500 fill-current" />
      <span className="text-sm font-medium text-gray-700">{formatStars(stars)}</span>
    </div>
  );
}

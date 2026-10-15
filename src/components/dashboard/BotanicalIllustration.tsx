import React from 'react';

export const BotanicalIllustration: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Delicate botanical leafy stem matching reference aesthetic */}
      <path
        d="M25 105C38 85 52 62 65 30C72 15 80 8 92 12"
        stroke="#8FA697"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Leaf 1 */}
      <path
        d="M65 30C55 24 45 32 50 42C55 52 65 42 65 30Z"
        fill="#C2D3C7"
        stroke="#8FA697"
        strokeWidth="1.2"
      />
      {/* Leaf 2 */}
      <path
        d="M75 22C85 14 96 22 90 32C84 42 75 32 75 22Z"
        fill="#ADC2B3"
        stroke="#7D9886"
        strokeWidth="1.2"
      />
      {/* Leaf 3 */}
      <path
        d="M52 50C38 46 34 58 42 66C50 74 56 60 52 50Z"
        fill="#C9D8CE"
        stroke="#8FA697"
        strokeWidth="1.2"
      />
      {/* Leaf 4 */}
      <path
        d="M58 48C70 42 78 52 72 62C66 72 58 58 58 48Z"
        fill="#ADC2B3"
        stroke="#7D9886"
        strokeWidth="1.2"
      />
      {/* Leaf 5 */}
      <path
        d="M40 75C28 72 26 84 34 90C42 96 46 84 40 75Z"
        fill="#D6E2DB"
        stroke="#9BB0A3"
        strokeWidth="1.2"
      />
      {/* Leaf 6 */}
      <path
        d="M45 72C56 68 62 78 56 86C50 94 44 82 45 72Z"
        fill="#BDCEC4"
        stroke="#8FA697"
        strokeWidth="1.2"
      />
    </svg>
  );
};


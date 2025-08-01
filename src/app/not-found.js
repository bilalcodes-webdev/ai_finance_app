"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <svg
        width="200"
        height="200"
        viewBox="0 0 24 24"
        fill="none"
        className="mb-6 text-red-400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21 12C21 16.9706 16.9706 21 12 21C7.02943 21 3 16.9706 3 12C3 7.02943 7.02943 3 12 3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 3L12 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        <path
          d="M15 15L18 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M9 15L6 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <text
          x="12"
          y="30"
          textAnchor="middle"
          fontSize="5"
          fill="currentColor"
        >
          Disconnected
        </text>
      </svg>

      <h1 className="text-4xl font-bold text-gray-800 mb-2">Oops! Page Not Found</h1>
      <p className="text-gray-500 mb-6">
        The page you’re looking for might be offline, broken or doesn’t exist.
      </p>

      <Link href="/">
        <button className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
          Go Back Home
        </button>
      </Link>
    </div>
  );
}

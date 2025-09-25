"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdminDropdown({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);

  if (!isAdmin) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold shadow hover:from-blue-700 hover:to-blue-500 transition"
        type="button"
      >
        <svg
          className="w-5 h-5 text-yellow-300"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 2a2 2 0 0 1 2 2v1h2a2 2 0 0 1 2 2v2h-1a1 1 0 0 0-1 1v2h-2v-2a1 1 0 0 0-1-1h-1V5a2 2 0 0 1 2-2z" />
          <path d="M2 13a2 2 0 0 1 2-2h2v2a2 2 0 0 0 2 2h2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2z" />
        </svg>
        Admin Manager
        <svg
          className="w-4 h-4 ml-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full -mt-0.2 w-48 rounded-xl border bg-white shadow-lg z-50">
          <ul className="flex flex-col py-1 text-sm">
            <li>
              <Link
                href="/admin/products"
                className="block px-3 py-1.5 text-gray-600 hover:bg-gray-100"
              >
                Manager Product
              </Link>
            </li>
            <li>
              <Link
                href="/admin/dashboard"
                className="block px-3 py-1.5 text-gray-600 hover:bg-gray-100"
              >
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

"use client";

import { IconCopy, IconCheck, IconHeartFilled } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";

export const PublicFooter = () => {
  const currentYear = new Date().getFullYear();
  const [copied, setCopied] = useState(false);
  const email = "info@real-estate.com";

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (_error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = email;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Micro ERP Solutions</h3>
            <p className="text-sm text-gray-600">
              Modern business management solution for growing enterprises.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#features"
                  className="text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/#about"
                  className="text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#docs"
                  className="text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="#support"
                  className="text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  Support
                </Link>
              </li>
              <li>
                <Link
                  href="#blog"
                  className="text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#contact"
                  className="text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <button
                  onClick={handleCopyEmail}
                  className="text-sm text-gray-600 hover:text-primary transition-colors flex items-center gap-2 group"
                  title={copied ? "Copied!" : "Copy email to clipboard"}
                >
                  <span>{email}</span>
                  {copied ? (
                    <IconCheck className="size-4 text-green-600" />
                  ) : (
                    <IconCopy className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center mt-8 pt-8 border-t text-center text-sm text-gray-600">
          <span>
            © {currentYear} Micro ERP Solutions. All rights reserved.
          </span>
          <span>
            Powered by{" "}
            <IconHeartFilled className="inline text-red-500 h-4 w-4" />
          </span>
        </div>
      </div>
    </footer>
  );
};

"use client";

import Link from "next/link";
import { useState } from "react";
import "./public.css";

export function PublicHeader({ active }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="public-header">
      <div className="public-header-inner">
        <Link href="/" className="public-logo">
          <img src="/logo.png" alt="NSM" />
          <div>
            <span className="public-logo-name">Nilkanta Management</span>
            <span className="public-logo-sub">Services Pvt Ltd</span>
          </div>
        </Link>
        <nav className={`public-nav ${mobileOpen ? "open" : ""}`}>
          {links.map((l) => (
            <Link key={l.name} href={l.href} className={`public-nav-link ${active === l.name ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
              {l.name}
            </Link>
          ))}
          <Link href="/login" className="public-btn-login" onClick={() => setMobileOpen(false)}>Login</Link>
        </nav>
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          <span className={`hamburger ${mobileOpen ? "open" : ""}`}>
            <span></span><span></span><span></span>
          </span>
        </button>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer-inner">
        <div className="public-footer-grid">
          <div className="public-footer-brand">
            <div className="public-footer-logo">
              <img src="/logo.png" alt="NSM" />
              <div>
                <span>Nilkanta Management</span>
                <small>Services Private Limited</small>
              </div>
            </div>
            <p>Providing trained Pick & Pack workforce to leading quick commerce brands. Powering fulfillment centers across India with reliable, compliant manpower.</p>
          </div>
          <div>
            <h4>Company</h4>
            <Link href="/">Home</Link>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/login">Login</Link>
          </div>
          <div>
            <h4>Legal</h4>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
            <Link href="#">Refund Policy</Link>
          </div>
          <div>
            <h4>Reach Us</h4>
            <p className="public-footer-contact">📍 H.No.12-10-409/25/1, Bidal Basti, Sitaphalmandi, Secunderabad, Hyderabad, 500061 TG.</p>
            <p className="public-footer-contact">📧 nilkantamanpower@gmail.com</p>
            <p className="public-footer-contact small">GST: 36AAKCN4393E1Z8</p>
            <p className="public-footer-contact small">CIN: U70200TS2025PTC198036</p>
          </div>
        </div>
        <div className="public-footer-bottom">
          <span>© {new Date().getFullYear()} Nilkanta Management Services Pvt Ltd. All rights reserved.</span>
          <div className="public-footer-bottom-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="/contact">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

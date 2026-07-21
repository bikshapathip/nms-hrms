"use client";

import Link from "next/link";
import { PublicHeader, PublicFooter } from "@/components/PublicLayout";
import "@/components/public.css";

export default function ContactPage() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <PublicHeader active="Contact" />

      <section className="public-hero" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h1 className="fade-in-up" style={{ fontSize: '38px', fontWeight: 800, color: '#1e293b' }}>Contact Us</h1>
        <p className="fade-in-up delay-1" style={{ color: '#64748b', marginTop: '8px', fontSize: '16px' }}>Need manpower for your hubs? Let&apos;s talk!</p>
      </section>

      <section className="public-section alt">
        <div className="contact-grid">
          <div className="public-card service-card" style={{ padding: '36px', animationDelay: '0.1s' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>Get in Touch</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '20px' }}>📍</span>
                <div><p style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>Office</p><p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.5 }}>H.No.12-10-409/25/1, Bidal Basti, Sitaphalmandi, Secunderabad, Hyderabad, 500061, TG.</p></div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '20px' }}>📧</span>
                <div><p style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>Email</p><p style={{ color: '#64748b', fontSize: '13px' }}>nilkantamanpower@gmail.com</p></div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '20px' }}>🏢</span>
                <div><p style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>GST</p><p style={{ color: '#64748b', fontSize: '13px' }}>36AAKCN4393E1Z8</p></div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '20px' }}>🔖</span>
                <div><p style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>CIN</p><p style={{ color: '#64748b', fontSize: '13px' }}>U70200TS2025PTC198036</p></div>
              </div>
            </div>
          </div>

          <div className="public-card service-card" style={{ padding: '36px', animationDelay: '0.25s' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>Send a Message</h2>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
                <input type="text" placeholder="Your name" style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
                <input type="email" placeholder="your@email.com" style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Message</label>
                <textarea placeholder="How can we help?" rows={4} style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', resize: 'vertical' }}></textarea>
              </div>
              <button type="submit" className="public-btn-primary" style={{ border: 'none', cursor: 'pointer', textAlign: 'center' }}>Send Message</button>
            </form>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

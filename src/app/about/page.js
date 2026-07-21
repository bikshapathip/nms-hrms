"use client";

import Link from "next/link";
import { PublicHeader, PublicFooter } from "@/components/PublicLayout";
import "@/components/public.css";

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <PublicHeader active="About" />

      <section className="public-hero" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h1 className="fade-in-up" style={{ fontSize: '38px', fontWeight: 800, color: '#1e293b' }}>About Us</h1>
        <p className="fade-in-up delay-1" style={{ color: '#64748b', marginTop: '8px', fontSize: '16px' }}>Powering India&apos;s quick commerce with reliable manpower</p>
      </section>

      <section className="public-section alt">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="public-card service-card" style={{ marginBottom: '24px', padding: '40px', animationDelay: '0.1s' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '14px' }}>Who We Are</h2>
            <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.8 }}>
              <strong>Nilkanta Management Services Private Limited</strong> is a professionally managed staffing company specializing in providing trained Pick & Pack associates to quick commerce fulfillment hubs. We partner with leading brands like Swiggy Instamart, Zepto, Blinkit, and BigBasket to ensure their dark stores and warehouses operate at peak efficiency with reliable, compliant manpower.
            </p>
          </div>

          <div className="public-card service-card" style={{ marginBottom: '24px', padding: '40px', animationDelay: '0.2s' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '14px' }}>What We Do</h2>
            <ul style={{ fontSize: '15px', color: '#475569', lineHeight: 2.2, paddingLeft: '20px' }}>
              <li>Deploy trained Pick & Pack associates to dark stores and fulfillment centers</li>
              <li>Same-day deployment of manpower to new hub locations</li>
              <li>End-to-end payroll processing — salary, PF, ESI, Professional Tax</li>
              <li>Attendance tracking, shift management, and overtime calculation</li>
              <li>Complete employee documentation — offer letters, ID cards, insurance</li>
              <li>100% statutory compliance at all times</li>
            </ul>
          </div>

          <div className="public-card service-card" style={{ marginBottom: '24px', padding: '40px', animationDelay: '0.3s' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '14px' }}>Our Mission</h2>
            <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.8 }}>
              To be the most trusted workforce partner for India&apos;s quick commerce ecosystem — delivering reliable, trained, and compliant manpower that helps fulfillment centers meet their delivery promises, every single day.
            </p>
          </div>

          <div className="public-card service-card" style={{ padding: '40px', animationDelay: '0.4s' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '14px' }}>Company Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '14px', color: '#475569' }}>
              <p><strong>Company:</strong> Nilkanta Management Services Pvt Ltd</p>
              <p><strong>CIN:</strong> U70200TS2025PTC198036</p>
              <p><strong>GST:</strong> 36AAKCN4393E1Z8</p>
              <p><strong>Location:</strong> Hyderabad, Telangana</p>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

"use client";

import { PublicHeader, PublicFooter } from "@/components/PublicLayout";
import "@/components/public.css";

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <PublicHeader active="" />

      <section className="public-hero" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h1 className="fade-in-up" style={{ fontSize: '38px', fontWeight: 800, color: '#1e293b' }}>Privacy Policy</h1>
        <p className="fade-in-up delay-1" style={{ color: '#64748b', marginTop: '8px', fontSize: '16px' }}>Last updated: July 2026</p>
      </section>

      <section className="public-section alt">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="public-card service-card" style={{ padding: '48px', animationDelay: '0.15s' }}>
            <div style={{ fontSize: '15px', color: '#475569', lineHeight: 1.9 }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>1. Information We Collect</h2>
              <p style={{ marginBottom: '24px' }}>We collect personal information that you voluntarily provide when you register or use our services. This includes name, email, phone, employment details, bank information, PAN, Aadhar, UAN, and ESIC details for payroll and compliance.</p>

              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>2. How We Use Information</h2>
              <ul style={{ paddingLeft: '20px', marginBottom: '24px' }}>
                <li>Process payroll and generate salary slips</li>
                <li>Manage employee records and attendance</li>
                <li>Comply with PF, ESI, TDS requirements</li>
                <li>Generate offer letters and employment documents</li>
                <li>Fulfill legal obligations</li>
              </ul>

              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>3. Data Security</h2>
              <p style={{ marginBottom: '24px' }}>We implement appropriate technical and organizational security measures. All sensitive data is encrypted and access is restricted to authorized personnel only.</p>

              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>4. Data Sharing</h2>
              <p style={{ marginBottom: '24px' }}>We do not sell your data. We share only with: government authorities (PF, ESI, Tax), client organizations where you are deployed, and banks for salary processing.</p>

              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>5. Your Rights</h2>
              <p style={{ marginBottom: '24px' }}>You have the right to access, correct, or request deletion of your personal data. Contact us at nilkantamanpower@gmail.com.</p>

              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>6. Contact</h2>
              <p>Email: nilkantamanpower@gmail.com<br />Address: H.No.12-10-409/25/1, Bidal Basti, Sitaphalmandi, Secunderabad, Hyderabad, 500061 TG.</p>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

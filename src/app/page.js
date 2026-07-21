"use client";

import Link from "next/link";
import { PublicHeader, PublicFooter } from "@/components/PublicLayout";
import { useEffect, useRef, useState } from "react";

export default function HomePage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const floatRefs = useRef([]);
  const orbRef = useRef(null);
  const sectionRefs = useRef([]);

  useEffect(() => {
    let animFrame;
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      setMousePos({ x: clientX, y: clientY });

      const x = (clientX / window.innerWidth - 0.5) * 2;
      const y = (clientY / window.innerHeight - 0.5) * 2;

      // Parallax floating shapes
      floatRefs.current.forEach((el, i) => {
        if (!el) return;
        const speed = (i + 1) * 15;
        const rotateSpeed = (i + 1) * 8;
        el.style.transform = `translate(${x * speed}px, ${y * speed}px) rotate(${x * rotateSpeed + (i * 45)}deg)`;
      });

      // Glowing orb follows cursor
      if (orbRef.current) {
        orbRef.current.style.left = `${clientX}px`;
        orbRef.current.style.top = `${clientY}px`;
      }
    };

    // Scroll reveal observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.15 }
    );

    sectionRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Cursor glow orb */}
      <div ref={orbRef} className="cursor-orb"></div>

      <PublicHeader active="Home" />

      {/* Hero */}
      <section className="public-hero">
        {/* Animated floating shapes */}
        <div ref={el => floatRefs.current[0] = el} className="float-shape float-pulse" style={{ top: '8%', left: '4%', width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.06))', border: '2px solid rgba(99,102,241,0.15)' }}></div>
        <div ref={el => floatRefs.current[1] = el} className="float-shape float-spin" style={{ top: '55%', right: '6%', width: '70px', height: '70px', borderRadius: '16px', background: 'linear-gradient(45deg, rgba(139,92,246,0.1), rgba(99,102,241,0.05))', border: '2px solid rgba(139,92,246,0.12)' }}></div>
        <div ref={el => floatRefs.current[2] = el} className="float-shape float-bounce" style={{ top: '20%', right: '18%', width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', boxShadow: '0 0 20px rgba(99,102,241,0.15)' }}></div>
        <div ref={el => floatRefs.current[3] = el} className="float-shape float-spin-slow" style={{ bottom: '12%', left: '10%', width: '55px', height: '55px', borderRadius: '12px', border: '3px solid rgba(139,92,246,0.12)', background: 'transparent' }}></div>
        <div ref={el => floatRefs.current[4] = el} className="float-shape float-pulse" style={{ top: '40%', left: '22%', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', boxShadow: '0 0 12px rgba(99,102,241,0.2)' }}></div>
        <div ref={el => floatRefs.current[5] = el} className="float-shape float-bounce" style={{ bottom: '30%', right: '25%', width: '35px', height: '35px', borderRadius: '8px', background: 'rgba(139,92,246,0.08)', border: '2px solid rgba(139,92,246,0.1)' }}></div>

        {/* Animated gradient blob */}
        <div className="hero-blob"></div>

        <div className="hero-content">
          <div className="hero-text fade-in-up">
            <div className="badge-pulse" style={{ display: 'inline-block', background: '#ede9fe', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', color: '#6366f1', fontWeight: 700, marginBottom: '16px' }}>
              🚀 Quick Commerce Staffing Partner
            </div>
            <h1 className="hero-title" style={{ fontSize: '46px', fontWeight: 800, lineHeight: 1.15, color: '#1e293b', marginBottom: '18px' }}>
              Powering <span className="gradient-text">Quick Commerce</span> with Reliable Manpower
            </h1>
            <p className="hero-subtitle" style={{ color: '#64748b', fontSize: '17px', lineHeight: 1.7, marginBottom: '32px' }}>
              We deploy trained Pick & Pack associates to dark stores and fulfillment hubs of <strong>Swiggy Instamart, Zepto, Blinkit</strong> & more — ensuring your orders are processed fast, every time.
            </p>
            <div className="hero-buttons">
              <Link href="/contact" className="public-btn-primary btn-glow">Hire Workforce →</Link>
              <Link href="/about" className="public-btn-secondary">Know More</Link>
            </div>
          </div>
          <div className="hero-stats fade-in-right">
            <div className="stat-card tilt-card">
              <div style={{ fontSize: '30px', fontWeight: 800, color: '#6366f1' }}>500+</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Associates Deployed</div>
            </div>
            <div className="stat-card tilt-card">
              <div style={{ fontSize: '30px', fontWeight: 800, color: '#6366f1' }}>15+ Hubs</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Active Locations</div>
            </div>
            <div className="stat-card tilt-card">
              <div style={{ fontSize: '30px', fontWeight: 800, color: '#6366f1' }}>Same Day</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Deployment Ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="public-section alt">
        <div className="public-section-inner" ref={el => sectionRefs.current[0] = el} style={{ textAlign: 'center' }}>
          <p style={{ color: '#6366f1', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Our Services</p>
          <h2 style={{ fontSize: '34px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>End-to-End Manpower for Quick Commerce</h2>
          <p style={{ color: '#64748b', marginBottom: '48px', fontSize: '16px', maxWidth: '600px', margin: '0 auto 48px' }}>From hiring to payroll — we handle everything so your hubs run smoothly</p>
          <div className="services-grid">
            {[
              { title: "Pick & Pack Associates", desc: "Trained associates for order picking, packing, and dispatching at dark stores and fulfillment centers.", icon: "📦" },
              { title: "Hub Staffing", desc: "Dedicated manpower for Swiggy Instamart, Zepto, Blinkit, BigBasket hubs across multiple cities.", icon: "🏪" },
              { title: "Payroll & Compliance", desc: "Timely salary payouts by 9th, PF/ESI contributions, professional tax — all handled.", icon: "💰" },
              { title: "Rapid Deployment", desc: "Same-day or next-day deployment of trained workforce to new hub locations.", icon: "⚡" },
              { title: "Attendance Tracking", desc: "Daily attendance monitoring, shift management, and overtime calculation for all deployed staff.", icon: "📋" },
              { title: "Complete Documentation", desc: "Offer letters, ID cards, insurance, and all statutory documentation for every associate.", icon: "📄" },
            ].map((s, i) => (
              <div key={s.title} className="public-card service-card tilt-card" style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="icon-float" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '16px' }}>{s.icon}</div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>{s.title}</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="public-section alt">
        <div className="public-section-inner" ref={el => sectionRefs.current[1] = el} style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#1e293b', marginBottom: '48px' }}>Trusted by Leading Quick Commerce Brands</h2>
          <div className="stats-grid">
            {[
              { num: "500+", label: "Associates Deployed" },
              { num: "15+", label: "Hub Locations" },
              { num: "100%", label: "PF/ESI Compliance" },
              { num: "<24hrs", label: "Deployment Time" },
            ].map((s, i) => (
              <div key={s.label} className="stat-number-card" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="counter-num" style={{ fontSize: '38px', fontWeight: 800, color: '#6366f1' }}>{s.num}</div>
                <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '64px 24px', background: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', background: '#f3f0ff', borderRadius: '24px', padding: '60px 40px', position: 'relative', overflow: 'hidden' }}>
          {/* Purple blobs */}
          <div style={{ position: 'absolute', top: '-30px', left: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(139,92,246,0.15)', filter: 'blur(20px)' }}></div>
          <div style={{ position: 'absolute', bottom: '-30px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(139,92,246,0.12)', filter: 'blur(20px)' }}></div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', marginBottom: '12px', position: 'relative', zIndex: 1 }}>Need reliable Pick & Pack workforce?</h2>
          <p style={{ color: '#64748b', marginBottom: '28px', fontSize: '16px', position: 'relative', zIndex: 1 }}>We deploy trained associates to Swiggy, Zepto, Blinkit & more — same day!</p>
          <Link href="/contact" className="public-btn-gold btn-glow-gold" style={{ position: 'relative', zIndex: 1 }}>Get Manpower Now →</Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Icon, Field, Section, StatusBadge, SkeletonSection } from "@/components/detailView";

export default function ViewClientPage() {
  const params = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/clients/${params.id}`);
        if (!res.ok) throw new Error("Client not found");
        setClient(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const initials = client?.clientName ? client.clientName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "";
  const locations = client?.locations || [];

  return (
    <div>
      <div
        className="rounded-2xl mb-6 px-5 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between flex-wrap gap-3"
        style={{ background: 'var(--heading-bg)', boxShadow: 'var(--card-shadow)' }}
      >
        <div>
          <div className="flex items-center gap-2 text-sm mb-1">
            <Link href="/clients" style={{ color: '#9ca0c7' }} className="font-medium hover:underline">Clients</Link>
            <svg className="w-4 h-4" style={{ color: '#9ca0c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span style={{ color: '#9ca0c7' }}>View</span>
          </div>
          {loading ? (
            <div className="h-6 w-52 rounded bg-white/10 animate-pulse"></div>
          ) : (
            <h1 className="text-lg sm:text-xl font-bold text-white">{client?.clientName || "Client"}</h1>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/clients/${params.id}`} className="btn-primary px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Edit
          </Link>
        </div>
      </div>

      {error ? (
        <div className="keka-card p-8 text-center">
          <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>{error}</p>
          <Link href="/clients" className="inline-block mt-4 text-sm font-semibold hover:underline" style={{ color: 'var(--primary)' }}>Back to Clients</Link>
        </div>
      ) : loading ? (
        <>
          <div className="keka-card p-6 mb-5 flex items-center gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse flex-shrink-0" style={{ background: 'var(--border-color)' }}></div>
            <div className="flex-1 min-w-[200px] space-y-2">
              <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" style={{ background: 'var(--border-color)' }}></div>
              <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" style={{ background: 'var(--border-light)' }}></div>
            </div>
            <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" style={{ background: 'var(--border-color)' }}></div>
          </div>
          <div className="space-y-5">
            <SkeletonSection title="Company Information" count={5} />
            <SkeletonSection title="Locations" count={2} />
          </div>
        </>
      ) : !client ? (
        <div className="keka-card p-8 text-center">
          <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>Client not found</p>
          <Link href="/clients" className="inline-block mt-4 text-sm font-semibold hover:underline" style={{ color: 'var(--primary)' }}>Back to Clients</Link>
        </div>
      ) : (
        <>
          <div className="keka-card p-6 mb-5 flex items-center gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0" style={{ background: '#6366f1' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-[200px]">
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{client.clientName}</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{client.email}</p>
            </div>
            <StatusBadge active={client.isActive} />
          </div>

          <div className="space-y-5">
            <Section title="Company Information" theme="indigo" icon={Icon.Building}>
              <Field label="Client Name" value={client.clientName} icon={Icon.Building} />
              <Field label="Email" value={client.email} icon={Icon.Mail} />
              <Field label="Phone" value={client.phone} icon={Icon.Phone} />
              <Field label="GST Number" value={client.gstNumber} icon={Icon.Hash} />
              <Field label="CIN Number" value={client.cinNumber} icon={Icon.Hash} />
            </Section>

            <Section title="Locations" theme="teal" icon={Icon.MapPin}>
              {locations.length === 0 ? (
                <Field label="Locations" value="No locations added" icon={Icon.MapPin} />
              ) : (
                locations.map((loc, i) => (
                  <Field
                    key={i}
                    label={loc.location || `Location ${i + 1}`}
                    value={[loc.city, loc.state].filter(Boolean).join(", ") + (loc.address ? ` — ${loc.address}` : "")}
                    icon={Icon.MapPin}
                  />
                ))
              )}
            </Section>
          </div>
        </>
      )}
    </div>
  );
}

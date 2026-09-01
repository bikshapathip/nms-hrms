"use client";

import FullPageLoader from "@/components/FullPageLoader";

const ICON_STYLES = {
  confirm: { bg: "#fff4e6", ring: "#fed7aa", color: "#f97316", from: "#fb923c", to: "#ea580c" },
  warning: { bg: "#fff4e6", ring: "#fed7aa", color: "#f97316", from: "#fb923c", to: "#ea580c" },
  success: { bg: "#ecfdf5", ring: "#a7f3d0", color: "#10b981", from: "#34d399", to: "#059669" },
  error: { bg: "#fef2f2", ring: "#fecaca", color: "#ef4444", from: "#f87171", to: "#dc2626" },
};

function AlertIcon({ type }) {
  const { ring, color, from, to } = ICON_STYLES[type] || ICON_STYLES.confirm;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 84, height: 84 }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: ring, opacity: 0.55, animation: "sa-ping 1.8s cubic-bezier(0,0,0.2,1) infinite" }}
      />
      <div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: 72, height: 72,
          background: `linear-gradient(135deg, ${from}, ${to})`,
          boxShadow: `0 10px 24px -6px color-mix(in srgb, ${color} 65%, transparent), inset 0 1px 1px rgba(255,255,255,0.4)`,
          animation: "sa-pop 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {type === "success" ? (
          <svg className="w-8 h-8" fill="none" stroke="#fff" viewBox="0 0 24 24">
            <path
              strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"
              style={{ strokeDasharray: 24, strokeDashoffset: 24, animation: "sa-draw 0.45s 0.15s ease-out forwards" }}
            />
          </svg>
        ) : type === "error" ? (
          <svg className="w-8 h-8" fill="none" stroke="#fff" viewBox="0 0 24 24">
            <path
              strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"
              style={{ strokeDasharray: 34, strokeDashoffset: 34, animation: "sa-draw 0.4s 0.15s ease-out forwards" }}
            />
          </svg>
        ) : (
          <svg className="w-8 h-8" fill="none" stroke="#fff" viewBox="0 0 24 24">
            <path
              strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.14A2 2 0 003.82 21h16.36a2 2 0 001.71-3l-8.18-14.14a2 2 0 00-3.42 0z"
              style={{ strokeDasharray: 60, strokeDashoffset: 60, animation: "sa-draw 0.5s 0.1s ease-out forwards" }}
            />
          </svg>
        )}
      </div>
    </div>
  );
}

/**
 * Shared confirm / success / error / warning / loading modal.
 * Mirrors the SweetAlert pattern used in app-testgo.com: pages hold an
 * `alertConfig` object in state (built with the helper functions below),
 * pass it into this component, and clear it to dismiss.
 */
export default function SweetAlert({
  isOpen,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Yes",
  cancelText = "Cancel",
  singleAction = false,
  variant = "primary",
}) {
  if (!isOpen) return null;

  if (type === "loading") {
    return <FullPageLoader text={message} />;
  }

  const handleConfirm = async () => {
    if (onConfirm) await onConfirm();
  };
  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  const confirmBg = variant === "danger" ? "var(--danger)" : "var(--primary)";
  const dismissBg = type === "success" ? "var(--success)" : type === "error" ? "var(--danger)" : "var(--accent)";
  const dismissLabel = type === "success" ? "Done" : type === "error" ? "Close" : "Got it";
  const accent = (ICON_STYLES[type] || ICON_STYLES.confirm);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div
        className="absolute inset-0"
        style={{ background: "rgba(15,17,32,0.5)", backdropFilter: "blur(4px)", animation: "sa-fade 0.2s ease-out" }}
        onClick={type === "confirm" ? handleCancel : undefined}
      />
      <div
        className="relative w-full max-w-md rounded-[28px] overflow-hidden"
        style={{
          background: "var(--bg-card)",
          boxShadow: `0 24px 60px -16px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05), 0 0 50px -10px color-mix(in srgb, ${accent.color} 45%, transparent)`,
          animation: "sa-scale-in 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ height: 5, background: `linear-gradient(90deg, ${accent.from}, ${accent.to})` }} />

        <div className="px-7 pt-8 pb-7">
          {(handleCancel || handleConfirm) && type !== "confirm" && (
            <button
              onClick={handleCancel || handleConfirm}
              aria-label="Close"
              className="absolute top-6 right-5 w-7 h-7 rounded-full flex items-center justify-center transition"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-input)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}

          <div className="flex justify-center mb-6">
            <AlertIcon type={type} />
          </div>

          {title && (
            <h2 className="text-xl font-bold text-center mb-2 tracking-tight" style={{ color: "var(--text-primary)" }}>
              {title}
            </h2>
          )}
          <p className="text-sm text-center mb-8 whitespace-pre-line leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {message}
          </p>

          <div className="flex justify-center gap-3">
            {type === "confirm" ? (
              <>
                {!singleAction && (
                  <button
                    onClick={handleCancel}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold transition"
                    style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(0.96)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; }}
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  onClick={onConfirm ? handleConfirm : handleCancel}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition"
                  style={{
                    background: `linear-gradient(135deg, ${confirmBg}, color-mix(in srgb, ${confirmBg} 70%, black))`,
                    boxShadow: `0 8px 20px -6px color-mix(in srgb, ${confirmBg} 60%, transparent)`,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.08)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; }}
                >
                  {confirmText}
                </button>
              </>
            ) : (
              <button
                onClick={handleCancel || handleConfirm}
                className="px-7 py-2.5 rounded-xl text-sm font-semibold text-white transition"
                style={{
                  background: `linear-gradient(135deg, ${dismissBg}, color-mix(in srgb, ${dismissBg} 70%, black))`,
                  boxShadow: `0 8px 20px -6px color-mix(in srgb, ${dismissBg} 60%, transparent)`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.08)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; }}
              >
                {dismissLabel}
              </button>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes sa-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sa-scale-in { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes sa-pop { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
        @keyframes sa-ping { 0% { transform: scale(0.85); opacity: 0.55; } 75%, 100% { transform: scale(1.35); opacity: 0; } }
        @keyframes sa-draw { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}

// ==================== REUSABLE HELPER FUNCTIONS ====================
// Each returns a plain object meant to be stored in an `alertConfig` state
// and spread onto <SweetAlert isOpen={!!alertConfig} {...alertConfig} />.

export const showCreateConfirm = (message, onConfirm, onCancel) => ({
  type: "confirm",
  title: "Are you sure?",
  message,
  onConfirm,
  onCancel,
  confirmText: "Create",
  cancelText: "Cancel",
  variant: "primary",
});

export const showUpdateConfirm = (message, onConfirm, onCancel) => ({
  type: "confirm",
  title: "Are you sure?",
  message,
  onConfirm,
  onCancel,
  confirmText: "Update",
  cancelText: "Cancel",
  variant: "primary",
});

export const showDeleteConfirm = (message, onConfirm, onCancel) => ({
  type: "confirm",
  title: "Are you sure?",
  message,
  onConfirm,
  onCancel,
  confirmText: "Delete",
  cancelText: "Cancel",
  variant: "danger",
});

export const showSuccessCreate = (message = "Created successfully!", onClose) => ({
  type: "success",
  title: "Success",
  message,
  onCancel: onClose,
});

export const showSuccessUpdate = (message = "Updated successfully!", onClose) => ({
  type: "success",
  title: "Success",
  message,
  onCancel: onClose,
});

export const showSuccessDelete = (message = "Deleted successfully!", onClose) => ({
  type: "success",
  title: "Success",
  message,
  onCancel: onClose,
});

export const showError = (message = "Something went wrong!", onClose) => ({
  type: "error",
  title: "Error",
  message,
  onCancel: onClose,
});

export const showWarning = (message, onClose) => ({
  type: "warning",
  title: "Warning",
  message,
  onCancel: onClose,
});

export const showLoading = (message = "Processing...") => ({
  type: "loading",
  message,
});

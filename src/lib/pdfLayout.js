import fs from "fs";
import path from "path";

let cachedLogo = null;

export function getLogoBase64() {
  if (cachedLogo !== null) return cachedLogo;
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    const logoBuffer = fs.readFileSync(logoPath);
    cachedLogo = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch (e) {
    cachedLogo = "";
  }
  return cachedLogo;
}

const BASE_STYLES = `
@page { size: A4; }
* { margin:0;padding:0;box-sizing:border-box; }
body { font-family:'Times New Roman',Times,serif;font-size:11pt;color:#000;line-height:1.55; }

.doc-body { padding:0 28px; }

.bold { font-weight:bold; }
ol { margin-left:16px; }
ol>li { margin-bottom:7px;text-align:justify; }
ol.rom { list-style-type:lower-roman;margin-left:24px; }
ol.rom li { margin-bottom:5px;text-align:justify; }
.st { width:82%;margin:10px auto;border-collapse:collapse;font-size:10pt; }
.st th,.st td { border:1px solid #333;padding:3px 8px; }
.st th { background:#e0e0e0;text-align:center;font-weight:bold; }
.st .sh { background:#d0d0d0;font-weight:bold;text-align:center; }
.st .hg { background:#c6efce; } .st .hy { background:#fff2cc; } .st .hb { background:#d6e4f0; }
.st td:last-child { text-align:right; }
.sr { display:flex;justify-content:space-between;margin-top:30px; }
.sr div { width:45%; }
.pb { page-break-before:always; }
.wm { position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:380px;height:380px;opacity:0.22;pointer-events:none;z-index:0; }
.wm img { width:100%;height:100%;object-fit:contain; }
`;

export function renderBrandedDocument({ bodyHtml, extraStyles = "" }) {
  const logo = getLogoBase64();
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>${BASE_STYLES}${extraStyles}</style></head><body>

<div class="wm"><img src="${logo}" /></div>

<div class="doc-body">
${bodyHtml}
</div>

</body></html>`;
}

export function getPdfPageOptions() {
  const logo = getLogoBase64();

  const headerTemplate = `<div style="width:100%;position:relative;font-family:Arial,sans-serif;-webkit-print-color-adjust:exact;">
    <div style="position:absolute;left:3px;top:-2px;width:95px;height:95px;z-index:10;">
      <img src="${logo}" style="width:88px;height:88px;object-fit:contain;" />
    </div>
    <div style="position:relative;height:50px;margin-left:55px;">
      <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:#2d2d2d;clip-path:polygon(30px 0,100% 0,100% 100%,85px 100%);"></div>
      <div style="position:relative;z-index:5;display:flex;align-items:center;height:100%;padding:0 15px 0 80px;">
        <span style="flex:1;text-align:right;font-size:13.5pt;font-weight:900;color:#e8a83e;letter-spacing:1px;white-space:nowrap;">NILKANTA MANAGEMENT SERIVICES PRIVATE LIMITED</span>
      </div>
    </div>
    <div style="position:relative;height:26px;margin-left:55px;">
      <div style="position:absolute;top:0;left:50%;right:0;bottom:0;background:#c8943e;clip-path:polygon(0 0,100% 0,100% 100%,30px 100%);"></div>
      <div style="position:relative;z-index:5;display:flex;align-items:center;justify-content:flex-end;height:100%;padding-right:10px;font-size:12pt;font-weight:900;color:#1a1a1a;letter-spacing:0.5px;">CIN: U70200TS2025PTC198036</div>
    </div>
    <div style="border-bottom:2.5px solid #2d2d2d;margin-top:12px;"></div>
  </div>`;

  const footerTemplate = `<div style="width:100%;font-family:Arial,sans-serif;-webkit-print-color-adjust:exact;">
    <div style="border-top:2.5px solid #2d2d2d;margin:0 18px;"></div>
    <div style="display:flex;align-items:flex-start;justify-content:space-between;padding:5px 20px 4px;font-size:8.5pt;color:#333;">
      <div style="display:flex;align-items:flex-start;gap:5px;max-width:40%;line-height:1.3;">
        <span>H.No.12-10-409/25/1, Bidal Basti, Sitaphalmandi, Secunderabad, Hyderabad,500061 TG.</span>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;text-align:right;">
        <div><a href="mailto:nilkantamanpower@gmail.com" style="color:#2456a4;text-decoration:underline;">nilkantamanpower@gmail.com</a></div>
        <div style="margin-top:1px;">GST NO. <b>36AAKCN4393E1Z8</b></div>
      </div>
    </div>
  </div>`;

  return {
    displayHeaderFooter: true,
    headerTemplate,
    footerTemplate,
    margin: { top: "30mm", bottom: "16mm", left: "0mm", right: "0mm" },
  };
}

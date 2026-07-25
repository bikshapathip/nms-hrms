import { StyleSheet } from "@react-pdf/renderer";

export const colors = {
  ink: "#2d2d2d",
  gold: "#e8a83e",
  bronze: "#c8943e",
  darkText: "#1a1a1a",
  border: "#333333",
  headerBg: "#e0e0e0",
  sectionBg: "#d0d0d0",
  green: "#c6efce",
  yellow: "#fff2cc",
  blue: "#d6e4f0",
  muted: "#555555",
  link: "#2456a4",
};

// Shared styles used by both the offer letter and payslip documents.
export const layout = StyleSheet.create({
  page: {
    paddingTop: 95,
    paddingBottom: 55,
    paddingHorizontal: 0,
    fontFamily: "Times-Roman",
    fontSize: 11,
    lineHeight: 1.5,
    color: "#000000",
  },
  body: {
    paddingHorizontal: 28,
  },

  // Header
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingLeft: 14,
    paddingRight: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerLogo: {
    width: 60,
    height: 60,
    objectFit: "contain",
    marginRight: 16,
  },
  headerBannerWrap: {
    flex: 1,
    position: "relative",
    height: 38,
  },
  headerBannerSvg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  headerBannerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingLeft: 28,
    paddingRight: 6,
  },
  headerCompanyName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    color: colors.gold,
    textAlign: "right",
    letterSpacing: 2,
  },
  headerCinWrap: {
    position: "relative",
    height: 28,
    width: "68%",
    alignSelf: "flex-end",
    marginTop: 0,
  },
  headerCinSvg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  headerCinContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingLeft: 48,
    paddingRight: 10,
  },
  headerCinText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13.5,
    color: colors.darkText,
    textAlign: "right",
  },
  headerRule: {
    borderBottomWidth: 2,
    borderBottomColor: colors.ink,
    marginTop: 8,
  },

  // Footer
  footerContainer: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  footerRule: {
    borderTopWidth: 2,
    borderTopColor: colors.ink,
    marginBottom: 5,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  footerAddress: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: "#333333",
    maxWidth: "45%",
    lineHeight: 1.3,
  },
  footerRight: {
    alignItems: "flex-end",
  },
  footerEmail: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: colors.link,
    textDecoration: "underline",
  },
  footerGst: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#333333",
    marginTop: 2,
  },

  // Watermark
  watermark: {
    position: "absolute",
    top: 280,
    left: 167,
    width: 260,
    height: 260,
    opacity: 0.13,
  },
});

export const A4_WIDTH = 595.28;
export const A4_HEIGHT = 841.89;

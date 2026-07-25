import { Page, View, Text, Image, Svg, Polygon } from "@react-pdf/renderer";
import { layout, colors } from "./theme";
import { getLogoBase64 } from "@/lib/pdfLayout";

function PageHeader() {
  const logo = getLogoBase64();
  return (
    <View style={layout.headerContainer} fixed>
      <View style={layout.headerRow}>
        {logo ? <Image src={logo} style={layout.headerLogo} /> : null}
        <View style={{ flex: 1 }}>
          <View style={layout.headerBannerWrap}>
            <Svg style={layout.headerBannerSvg} viewBox="0 0 400 100" preserveAspectRatio="none">
              <Polygon points="2,0 400,0 400,100 38,100" fill={colors.ink} />
            </Svg>
            <View style={layout.headerBannerContent}>
              <Text style={layout.headerCompanyName}>
                NILKANTA MANAGEMENT SERIVICES PRIVATE LIMITED
              </Text>
            </View>
          </View>
          <View style={layout.headerCinWrap}>
            <Svg style={layout.headerCinSvg} viewBox="0 0 400 100" preserveAspectRatio="none">
              <Polygon points="55,0 400,0 400,100 91,100" fill={colors.bronze} />
            </Svg>
            <View style={layout.headerCinContent}>
              <Text style={layout.headerCinText}>CIN: U70200TS2025PTC198036</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={layout.headerRule} />
    </View>
  );
}

function PageFooter() {
  return (
    <View style={layout.footerContainer} fixed>
      <View style={layout.footerRule} />
      <View style={layout.footerRow}>
        <Text style={layout.footerAddress}>
          H.No.12-10-409/25/1, Bidal Basti, Sitaphalmandi, Secunderabad, Hyderabad,500061 TG.
        </Text>
        <View style={layout.footerRight}>
          <Text style={layout.footerEmail}>nilkantamanpower@gmail.com</Text>
          <Text style={layout.footerGst}>GST NO. 36AAKCN4393E1Z8</Text>
        </View>
      </View>
    </View>
  );
}

function Watermark() {
  const logo = getLogoBase64();
  if (!logo) return null;
  return <Image src={logo} style={layout.watermark} fixed />;
}

export function BrandedPage({ children }) {
  return (
    <Page size="A4" style={layout.page}>
      <Watermark />
      <PageHeader />
      <View style={layout.body}>{children}</View>
      <PageFooter />
    </Page>
  );
}

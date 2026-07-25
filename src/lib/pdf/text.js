import { Text, View } from "@react-pdf/renderer";

export function B({ children }) {
  return <Text style={{ fontFamily: "Times-Bold" }}>{children}</Text>;
}

export function U({ children }) {
  return <Text style={{ textDecoration: "underline" }}>{children}</Text>;
}

export function BU({ children }) {
  return <Text style={{ fontFamily: "Times-Bold", textDecoration: "underline" }}>{children}</Text>;
}

export function Paragraph({ children, style }) {
  return <Text style={{ textAlign: "justify", marginBottom: 8, ...style }}>{children}</Text>;
}

const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv"];

export function NumberedItem({ index, children }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 8 }} wrap={false}>
      <Text style={{ width: 18 }}>{index}.</Text>
      <Text style={{ flex: 1, textAlign: "justify" }}>{children}</Text>
    </View>
  );
}

export function NumberedItemWrap({ index, children }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 8 }}>
      <Text style={{ width: 18 }}>{index}.</Text>
      <Text style={{ flex: 1, textAlign: "justify" }}>{children}</Text>
    </View>
  );
}

export function RomanItem({ index, children }) {
  return (
    <View style={{ flexDirection: "row", marginLeft: 16, marginBottom: 6 }}>
      <Text style={{ width: 26 }}>{ROMAN[index - 1]}.</Text>
      <Text style={{ flex: 1, textAlign: "justify" }}>{children}</Text>
    </View>
  );
}

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { colors } from "./theme";

const s = StyleSheet.create({
  wrap: { alignItems: "center", marginVertical: 8 },
  table: { width: "82%", fontSize: 10 },
  row: { flexDirection: "row" },
  sectionCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.sectionBg,
    fontFamily: "Times-Bold",
    textAlign: "center",
    padding: 4,
  },
  headerCell: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.headerBg,
    fontFamily: "Times-Bold",
    textAlign: "center",
    padding: 4,
  },
  cell: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: "3 8",
  },
  valueCell: {
    textAlign: "right",
  },
  bold: {
    fontFamily: "Times-Bold",
  },
});

const VARIANT_BG = {
  green: colors.green,
  yellow: colors.yellow,
  blue: colors.blue,
};

export function SalaryTable({ title, columnHeaders, rows }) {
  return (
    <View style={s.wrap}>
      <View style={s.table}>
        {title ? (
          <View style={s.row}>
            <Text style={s.sectionCell}>{title}</Text>
          </View>
        ) : null}
        {columnHeaders ? (
          <View style={s.row}>
            <Text style={[s.headerCell, { flex: 2 }]}>{columnHeaders[0]}</Text>
            <Text style={[s.headerCell, { flex: 1 }]}>{columnHeaders[1]}</Text>
          </View>
        ) : null}
        {rows.map((r, i) => {
          const bg = r.variant ? VARIANT_BG[r.variant] : undefined;
          return (
            <View key={i} style={s.row}>
              <Text style={[s.cell, { flex: 2 }, bg && { backgroundColor: bg }, r.bold && s.bold]}>
                {r.label}
              </Text>
              <Text
                style={[s.cell, s.valueCell, { flex: 1 }, bg && { backgroundColor: bg }, r.bold && s.bold]}
              >
                {r.value}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

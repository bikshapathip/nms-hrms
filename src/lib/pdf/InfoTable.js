import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { colors } from "./theme";

const s = StyleSheet.create({
  table: { fontSize: 10, marginBottom: 14 },
  row: { flexDirection: "row" },
  label: {
    borderWidth: 1,
    borderColor: "#999999",
    backgroundColor: "#f0f0f0",
    fontFamily: "Times-Bold",
    padding: "3 8",
  },
  value: {
    borderWidth: 1,
    borderColor: "#999999",
    padding: "3 8",
  },
});

// rows: [[labelA, valueA, labelB, valueB] | [labelA, valueA (colSpan 3)]]
export function InfoTable({ rows }) {
  return (
    <View style={s.table}>
      {rows.map((cells, i) => (
        <View key={i} style={s.row}>
          {cells.length === 2 ? (
            <>
              <Text style={[s.label, { width: "22%" }]}>{cells[0]}</Text>
              <Text style={[s.value, { width: "78%" }]}>{cells[1]}</Text>
            </>
          ) : (
            <>
              <Text style={[s.label, { width: "22%" }]}>{cells[0]}</Text>
              <Text style={[s.value, { width: "28%" }]}>{cells[1]}</Text>
              <Text style={[s.label, { width: "22%" }]}>{cells[2]}</Text>
              <Text style={[s.value, { width: "28%" }]}>{cells[3]}</Text>
            </>
          )}
        </View>
      ))}
    </View>
  );
}

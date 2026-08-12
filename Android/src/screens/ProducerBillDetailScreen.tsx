import React from 'react';
import { View, SectionList, StyleSheet } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { IProcurement } from '../services';

export default function ProducerBillDetailScreen({ route }: any) {
  const { producerCode, producerName, procurements } = route.params as {
    producerCode: string;
    producerName: string;
    procurements: IProcurement[];
  };

  // Group by date, sorted chronologically
  const byDate = procurements
    .filter((p) => p.producerCode === producerCode)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.shift.localeCompare(b.shift));

  const dateMap = new Map<string, IProcurement[]>();
  byDate.forEach((p) => {
    const key = p.date.substring(0, 10);
    if (!dateMap.has(key)) dateMap.set(key, []);
    dateMap.get(key)!.push(p);
  });

  const sections = Array.from(dateMap.entries()).map(([date, items]) => ({
    title: formatDateHeader(date),
    data: items,
  }));

  const totals = byDate.reduce(
    (acc, p) => ({ qty: acc.qty + p.quantity, amount: acc.amount + p.totalAmount }),
    { qty: 0, amount: 0 },
  );

  return (
    <View style={styles.container}>
      {/* Producer header */}
      <View style={styles.header}>
        <Text style={styles.headerCode}>#{producerCode}</Text>
        <Text style={styles.headerName}>{producerName.length > 25 ? producerName.substring(0, 25) + '…' : producerName}</Text>
      </View>
      <View style={styles.summaryContainer}>
        <View style={styles.totalsRow}>
          <Chip compact style={styles.chipEntries} textStyle={styles.chipTextEntries}>{byDate.length} entries</Chip>
          <Chip icon="water" compact style={styles.chipQuantity} textStyle={styles.chipTextQuantity}>{totals.qty.toFixed(2)} L</Chip>
          <Chip icon="currency-inr" compact style={styles.chipAmount} textStyle={styles.chipTextAmount}>₹{totals.amount.toFixed(2)}</Chip>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item, i) => item._id || `${item.date}-${item.shift}-${i}`}
        renderSectionHeader={({ section }) => (
          <View style={styles.dateHeader}>
            <Text style={styles.dateHeaderText}>📅 {section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isAM = item.shift === 'AM';
          return (
            <Card style={[styles.card, { borderLeftColor: isAM ? '#ff9800' : '#5c6bc0', borderLeftWidth: 3 }]}>
              <Card.Content style={styles.row}>
                <Text style={[styles.shiftBadge, { backgroundColor: isAM ? '#fff3e0' : '#ede7f6', color: isAM ? '#e65100' : '#283593' }]}>
                  {isAM ? '☀️ AM' : '🌙 PM'}
                </Text>
                <Text style={styles.qty}>{item.quantity.toFixed(2)} L</Text>
                <Text style={styles.fat}>{item.fat}%</Text>
                <Text style={styles.amount}>₹{item.totalAmount.toFixed(2)}</Text>
              </Card.Content>
            </Card>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: '#999' }}>No records found</Text>
          </View>
        }
      />
    </View>
  );
}

function formatDateHeader(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 8 },
  headerCode: { color: '#1565c0', fontWeight: '700', fontSize: 16 },
  headerName: { color: '#1a237e', fontWeight: 'bold', fontSize: 18 },
  summaryContainer: { backgroundColor: '#f0f4f8', marginHorizontal: 16, borderRadius: 10, paddingVertical: 10, marginBottom: 10 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 8 },
  chipQuantity: { backgroundColor: '#e8f5e9' },
  chipTextQuantity: { fontSize: 12, fontWeight: '600', color: '#2e7d32' },
  chipAmount: { backgroundColor: '#e3f2fd' },
  chipTextAmount: { fontSize: 12, fontWeight: '600', color: '#1565c0' },
  chipEntries: { backgroundColor: '#fff3e0' },
  chipTextEntries: { fontSize: 12, fontWeight: '600', color: '#e65100' },
  dateHeader: { paddingHorizontal: 16, paddingVertical: 8, marginTop: 4 },
  dateHeaderText: { fontWeight: 'bold', color: '#1565c0', fontSize: 14 },
  card: { marginHorizontal: 16, marginVertical: 2, borderRadius: 8, elevation: 1, backgroundColor: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8 },
  shiftBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, fontWeight: '700', fontSize: 12, overflow: 'hidden' },
  qty: { color: '#2e7d32', fontWeight: 'bold', fontSize: 14, flex: 1, textAlign: 'right' },
  fat: { color: '#e65100', fontWeight: 'bold', fontSize: 14, width: 40, textAlign: 'right' },
  amount: { color: '#1565c0', fontWeight: 'bold', fontSize: 14, width: 60, textAlign: 'right' },
  empty: { alignItems: 'center', paddingTop: 60 },
});

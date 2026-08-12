import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert, Platform } from 'react-native';
import { Text, Card, Button, Divider, Chip, Menu, TextInput, HelperText, TouchableRipple } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppContext, ProcurementApi, IProcurement } from '../services';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function BillScreen() {
  const { producers, bonusRate } = useAppContext();
  const navigation = useNavigation<any>();
  const defaults = getDefaultDates();
  const [fromDate, setFromDate] = useState(defaults.startDate);
  const [toDate, setToDate] = useState(defaults.endDate);
  const [producerCode, setProducerCode] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [data, setData] = useState<IProcurement[]>([]);
  const [loading, setLoading] = useState(false);

  // Auto-load on first mount
  useEffect(() => {
    loadBill();
  }, []);

  const filteredProducers = producers.filter((p) => p.code.includes(producerCode));
  const selectedProducer = producers.find((p) => p.code === producerCode);

  const formatDate = (d: Date) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const loadBill = async () => {
    setLoading(true);
    try {
      // Send full ISO strings like web app: fromDate.toISOString(), toDate.toISOString()
      const result = await ProcurementApi.getBill(
        fromDate.toISOString(),
        toDate.toISOString(),
        producerCode || undefined
      );
      setData(result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load bill');
    } finally {
      setLoading(false);
    }
  };

  // Aggregation matching web app: per producer sum quantity & totalAmount, add bonus, round amount
  const grouped = data.reduce<Record<string, { quantity: number; amount: number }>>((acc, item) => {
    const key = item.producerCode;
    if (!acc[key]) acc[key] = { quantity: 0, amount: 0 };
    acc[key].quantity += item.quantity || 0;
    acc[key].amount += item.totalAmount || 0;
    return acc;
  }, {});

  const billData = Object.entries(grouped).map(([code, vals]) => {
    let amount = vals.amount;
    if (bonusRate > 0) {
      amount += vals.quantity * bonusRate;
    }
    amount = Math.round(amount);
    const producer = producers.find((p) => p.code === code);
    return { code, name: producer?.name || 'Unknown', quantity: vals.quantity, amount };
  }).sort((a, b) => Number(a.code) - Number(b.code));

  const totals = {
    quantity: billData.reduce((s, p) => s + p.quantity, 0),
    amount: billData.reduce((s, p) => s + p.amount, 0),
  };

  return (
    <View style={styles.container}>
      {/* Date Pickers */}
      <View style={styles.filters}>
        <View style={styles.dateRow}>
          <TouchableRipple onPress={() => setShowFromPicker(true)} style={styles.dateTouchable}>
            <Chip style={styles.dateChip} textStyle={styles.dateChipText}>📅 {formatDate(fromDate)}</Chip>
          </TouchableRipple>
          <Text style={styles.dateSep}>→</Text>
          <TouchableRipple onPress={() => setShowToPicker(true)} style={styles.dateTouchable}>
            <Chip style={styles.dateChip} textStyle={styles.dateChipText}>📅 {formatDate(toDate)}</Chip>
          </TouchableRipple>
        </View>

        {showFromPicker && (
          <DateTimePicker
            value={fromDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(e: DateTimePickerEvent, d?: Date) => { setShowFromPicker(false); if (d) setFromDate(d); }}
          />
        )}
        {showToPicker && (
          <DateTimePicker
            value={toDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(e: DateTimePickerEvent, d?: Date) => { setShowToPicker(false); if (d) setToDate(d); }}
          />
        )}

        {/* Producer Code - optional number input */}
        <View style={styles.producerRow}>
          <View style={styles.producerInput}>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TextInput
                  label="Producer Code (optional)"
                  value={producerCode}
                  onChangeText={(text) => {
                    setProducerCode(text);
                    setMenuVisible(text.length > 0);
                  }}
                  onFocus={() => { if (producerCode.length > 0) setMenuVisible(true); }}
                  keyboardType="number-pad"
                  mode="outlined"
                  style={styles.input}
                  dense
                  left={<TextInput.Icon icon="pound" />}
                  right={producerCode ? <TextInput.Icon icon="close" onPress={() => setProducerCode('')} /> : undefined}
                />
              }
              style={styles.menu}
            >
              {filteredProducers.slice(0, 8).map((p) => (
                <Menu.Item
                  key={p._id || p.code}
                  title={`${p.code} - ${p.name}`}
                  onPress={() => { setProducerCode(p.code); setMenuVisible(false); }}
                />
              ))}
            </Menu>
            {selectedProducer && (
              <HelperText type="info">{selectedProducer.name}</HelperText>
            )}
          </View>

          <Button mode="contained" onPress={loadBill} loading={loading} style={styles.loadBtn} icon="file-document">
            Load
          </Button>
        </View>
      </View>

      {/* Summary — same order as procurement listing: Quantity → Amount → Entries */}
      {billData.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.totalsRow}>
            <Chip compact style={styles.chipEntries} textStyle={styles.chipTextEntries}>{data.length} entries</Chip>
            <Chip icon="water" compact style={styles.chipQuantity} textStyle={styles.chipTextQuantity}>{totals.quantity.toFixed(2)} L</Chip>
            <Chip icon="currency-inr" compact style={styles.chipAmount} textStyle={styles.chipTextAmount}>₹{totals.amount}</Chip>
          </View>
        </View>
      )}

      {/* Bill by producer */}
      <FlatList
        data={billData}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <TouchableRipple
            onPress={() => navigation.navigate('ProducerBillDetail', {
              producerCode: item.code,
              producerName: item.name,
              procurements: data,
            })}
          >
            <Card style={styles.billCard}>
              <Card.Content style={styles.billRow}>
                <Text style={styles.billCode}>#{item.code}</Text>
                <Text style={styles.billName} numberOfLines={1}>{item.name.length > 17 ? item.name.substring(0, 17) + '…' : item.name}</Text>
                <Text style={styles.billQty}>{item.quantity.toFixed(2)} L</Text>
                <Text style={styles.billTotal}>₹{item.amount}</Text>
              </Card.Content>
            </Card>
          </TouchableRipple>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text variant="bodyLarge" style={{ color: '#999' }}>
                Set date range and tap "Load"
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

function getDefaultDates(): { startDate: Date; endDate: Date } {
  // Matches web app's AppStore.getDates() exactly
  const now = new Date();
  const today = now.getDate();
  let start = '', end = '';
  if (today <= 10) {
    start = '01'; end = '10';
  } else if (today >= 11 && today <= 20) {
    start = '11'; end = '20';
  } else {
    start = '21';
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate().toString();
  }
  // Web app: new Date(now.toISOString().substr(0, 8) + start)
  const prefix = now.toISOString().substring(0, 8);
  return {
    startDate: new Date(prefix + start),
    endDate: new Date(prefix + end),
  };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  filters: { padding: 16, paddingBottom: 8 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  dateTouchable: { borderRadius: 20 },
  dateChip: { backgroundColor: '#e3f2fd' },
  dateChipText: { color: '#1565c0', fontWeight: '600', fontSize: 13 },
  dateSep: { color: '#999', fontSize: 16 },
  producerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  producerInput: { flex: 1 },
  input: { backgroundColor: '#fff' },
  menu: { width: '70%' },
  loadBtn: { borderRadius: 8, marginTop: 8 },
  summaryContainer: { backgroundColor: '#f0f4f8', marginHorizontal: 16, borderRadius: 10, paddingVertical: 10, marginBottom: 10 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 8 },
  chipQuantity: { backgroundColor: '#e8f5e9' },
  chipTextQuantity: { fontSize: 12, fontWeight: '600', color: '#2e7d32' },
  chipAmount: { backgroundColor: '#e3f2fd' },
  chipTextAmount: { fontSize: 12, fontWeight: '600', color: '#1565c0' },
  chipEntries: { backgroundColor: '#fff3e0' },
  chipTextEntries: { fontSize: 12, fontWeight: '600', color: '#e65100' },
  billCard: { marginHorizontal: 16, marginVertical: 3, borderRadius: 8, elevation: 1, backgroundColor: '#fff' },
  billRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4 },
  billCode: { color: '#1565c0', fontWeight: '700', fontSize: 12, width: 28 },
  billName: { flex: 1, fontWeight: 'bold', color: '#1a237e', fontSize: 14, marginLeft: 2 },
  billQty: { color: '#2e7d32', fontWeight: 'bold', fontSize: 14, width: 72, textAlign: 'right' },
  billTotal: { color: '#1565c0', fontWeight: 'bold', fontSize: 14, width: 72, textAlign: 'right' },
  empty: { alignItems: 'center', paddingTop: 60 },
});

import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Platform } from 'react-native';
import { FAB, Text, Card, Chip, SegmentedButtons, TouchableRipple } from 'react-native-paper';
import { useAppContext, ProcurementApi, IProcurement } from '../services';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

function ProcurementCard({ item, producers, onPress }: {
  item: IProcurement;
  producers: { code: string; name: string }[];
  onPress: () => void;
}) {
  const producer = producers.find(p => p.code === item.producerCode);
  const displayName = producer?.name
    ? producer.name.length > 20 ? producer.name.substring(0, 20) + '…' : producer.name
    : `Producer ${item.producerCode}`;

  return (
    <Card style={cardStyles.card} onPress={onPress}>
      <Card.Content style={cardStyles.row}>
        <Text style={cardStyles.name} numberOfLines={1}>{displayName}</Text>
        <Text style={cardStyles.code}>#{item.producerCode}</Text>
        <Text style={cardStyles.quantity}>{item.quantity} L</Text>
        <Text style={cardStyles.fat}>{item.fat}%</Text>
      </Card.Content>
    </Card>
  );
}

export default function ProcurementListScreen() {
  const { center, producers } = useAppContext();
  const navigation = useNavigation<any>();
  const [procurements, setProcurements] = useState<IProcurement[]>([]);
  const [date, setDate] = useState(new Date());
  const [shift, setShift] = useState('AM');
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const dateStr = date.toISOString().split('T')[0] + 'T00:00:00.000Z';

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await ProcurementApi.getByDateShift(new Date(dateStr).toISOString(), shift);
      setProcurements(data); // No sorting — show as fetched
    } catch (e) {
      console.error('Failed to load procurements', e);
    } finally {
      setRefreshing(false);
    }
  }, [dateStr, shift]);

  // Reload when screen gains focus (covers return from add/edit)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const totals = {
    quantity: procurements.reduce((s, p) => s + (p.quantity || 0), 0),
    totalAmount: procurements.reduce((s, p) => s + (p.totalAmount || 0), 0),
  };

  return (
    <View style={styles.container}>
      {/* Date Picker Button */}
      <TouchableRipple style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text variant="titleMedium" style={styles.dateText}>
          📅  {date.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
        </Text>
      </TouchableRipple>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}

      {/* Shift Toggle */}
      <SegmentedButtons
        value={shift}
        onValueChange={setShift}
        buttons={[
          { value: 'AM', label: '☀️ AM - Morning', style: shift === 'AM' ? styles.activeShiftAM : styles.inactiveShift },
          { value: 'PM', label: '🌙 PM - Evening', style: shift === 'PM' ? styles.activeShiftPM : styles.dimShift },
        ]}
        style={styles.shiftToggle}
      />

      {/* Totals — colors match line items */}
      <View style={styles.totalsRow}>
        <Chip compact style={styles.chipEntries} textStyle={styles.chipTextEntries}>{procurements.length} entries</Chip>
        <Chip icon="water" compact style={styles.chipQuantity} textStyle={styles.chipTextQuantity}>{totals.quantity.toFixed(1)} L</Chip>
        <Chip icon="currency-inr" compact style={styles.chipAmount} textStyle={styles.chipTextAmount}>₹{totals.totalAmount.toFixed(0)}</Chip>
      </View>

      {/* List — pull to refresh only */}
      <FlatList
        data={procurements}
        keyExtractor={(item) => item._id || item.producerCode + item.date}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} colors={['#1976d2']} />}
        renderItem={({ item }) => (
          <ProcurementCard
            item={item}
            producers={producers}
            onPress={() => navigation.navigate('EditProcurement', { procurement: item, date: dateStr, shift })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="headlineSmall" style={{ color: '#bbb' }}>📋</Text>
            <Text variant="bodyLarge" style={{ color: '#999', marginTop: 8 }}>No records for this date/shift</Text>
          </View>
        }
        contentContainerStyle={procurements.length === 0 ? { flex: 1 } : undefined}
      />

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => navigation.navigate('AddProcurement', { date: dateStr, shift })}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  dateButton: {
    alignSelf: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  dateText: { color: '#1565c0', fontWeight: '600' },
  shiftToggle: { marginHorizontal: 16, marginVertical: 10 },
  activeShiftAM: { backgroundColor: '#fff8e1' },
  activeShiftPM: { backgroundColor: '#e8eaf6' },
  inactiveShift: {},
  dimShift: { opacity: 0.6 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 12, paddingBottom: 10 },
  // Quantity chip matches card quantity color (green)
  chipQuantity: { backgroundColor: '#e8f5e9' },
  chipTextQuantity: { fontSize: 12, fontWeight: '600', color: '#2e7d32' },
  // Amount chip
  chipAmount: { backgroundColor: '#e3f2fd' },
  chipTextAmount: { fontSize: 12, fontWeight: '600', color: '#1565c0' },
  // Entries chip matches orange/fat color
  chipEntries: { backgroundColor: '#fff3e0' },
  chipTextEntries: { fontSize: 12, fontWeight: '600', color: '#e65100' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#ff6d00',
    elevation: 8,
    borderRadius: 28,
  },
});

const cardStyles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 3, borderRadius: 8, elevation: 1, backgroundColor: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  name: { flex: 1, fontWeight: 'bold', color: '#1a237e', fontSize: 14 },
  code: { color: '#1565c0', fontWeight: '700', fontSize: 12, width: 40, textAlign: 'right' },
  quantity: { color: '#2e7d32', fontWeight: 'bold', fontSize: 14, width: 60, textAlign: 'right' },
  fat: { color: '#e65100', fontWeight: '600', fontSize: 13, width: 44, textAlign: 'right' },
});



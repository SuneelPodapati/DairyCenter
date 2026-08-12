import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, Menu, Divider, Card, Chip, TouchableRipple } from 'react-native-paper';
import { useAppContext, ProcurementApi, IProcurement, calculateProcurement } from '../services';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function AddEditProcurementScreen() {
  const { producers, rate, incentiveRate, premiumRate } = useAppContext();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const existing: IProcurement | undefined = route.params?.procurement;
  const paramDate = route.params?.date || new Date().toISOString();
  const paramShift = route.params?.shift || 'AM';

  const [date, setDate] = useState(new Date(paramDate));
  const [shift, setShift] = useState(existing?.shift || paramShift);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [producerCode, setProducerCode] = useState(existing?.producerCode || '');
  const [quantity, setQuantity] = useState(existing?.quantity?.toString() || '');
  const [fat, setFat] = useState(existing?.fat?.toString() || '');
  const [saving, setSaving] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const dateISO = date.toISOString().split('T')[0] + 'T00:00:00.000Z';
  const displayDate = date.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  const filteredProducers = producers.filter((p) => p.code.includes(producerCode));

  const selectedProducer = producers.find((p) => p.code === producerCode);

  // Calculate preview
  const preview = producerCode && quantity && fat
    ? calculateProcurement(
        {
          _id: existing?._id,
          producerCode,
          date: dateISO,
          shift,
          quantity: parseFloat(quantity) || 0,
          fat: parseFloat(fat) || 0,
          kgFat: 0,
          rate: existing?.rate || rate,
          premiumRate,
          grossAmount: 0,
          incentiveRate,
          incentiveAmount: 0,
          totalAmount: 0,
        },
        producers,
        rate,
        incentiveRate,
        premiumRate
      )
    : null;

  const handleSave = async () => {
    if (!producerCode || !quantity || !fat) {
      Alert.alert('Validation', 'Please fill Producer, Quantity, and Fat %');
      return;
    }
    if (!selectedProducer) {
      Alert.alert('Validation', 'Invalid producer code. Must match an existing producer.');
      return;
    }
    const qty = parseFloat(quantity);
    const fatVal = parseFloat(fat);
    if (!qty || qty <= 0) {
      Alert.alert('Validation', 'Quantity must be greater than 0');
      return;
    }
    if (!fatVal || fatVal <= 0) {
      Alert.alert('Validation', 'Fat % must be greater than 0');
      return;
    }

    setSaving(true);
    try {
      const record = calculateProcurement(
        {
          _id: existing?._id,
          producerCode,
          date: dateISO,
          shift,
          quantity: parseFloat(quantity),
          fat: parseFloat(fat),
          kgFat: 0,
          rate: existing?.rate || rate,
          premiumRate,
          grossAmount: 0,
          incentiveRate,
          incentiveAmount: 0,
          totalAmount: 0,
        },
        producers,
        rate,
        incentiveRate,
        premiumRate
      );

      if (existing?._id) {
        await ProcurementApi.bulkUpdate([record]);
      } else {
        const { _id, ...newRecord } = record;
        await ProcurementApi.create(newRecord);
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Date & Shift */}
      {existing ? (
        <View style={styles.dateShiftRow}>
          <Text variant="bodyMedium" style={styles.readOnlyLabel}>{displayDate}  •  </Text>
          <Text variant="bodyMedium" style={[styles.readOnlyLabel, { color: shift === 'AM' ? '#e65100' : '#4527a0' }]}>
            {shift === 'AM' ? '☀️' : '🌙'} {shift}
          </Text>
        </View>
      ) : (
        <View>
          <View style={styles.dateShiftRow}>
            <TouchableRipple onPress={() => setShowDatePicker(true)} style={styles.dateTouchable}>
              <Chip style={styles.dateChip} textStyle={styles.dateChipText}>📅 {displayDate}</Chip>
            </TouchableRipple>
            <Chip
              onPress={() => setShift('AM')}
              style={[styles.shiftChip, shift === 'AM' && styles.shiftAM]}
              textStyle={shift === 'AM' ? styles.shiftActiveText : styles.shiftInactiveText}
            >
              ☀️ AM
            </Chip>
            <Chip
              onPress={() => setShift('PM')}
              style={[styles.shiftChip, shift === 'PM' && styles.shiftPM]}
              textStyle={shift === 'PM' ? styles.shiftActiveText : styles.shiftInactiveText}
            >
              🌙 PM
            </Chip>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event: DateTimePickerEvent, selected?: Date) => {
                setShowDatePicker(false);
                if (selected) setDate(selected);
              }}
            />
          )}
        </View>
      )}

      {/* Producer Code - numeric input */}
      {existing ? (
        <TextInput
          label="Producer Code"
          value={producerCode}
          editable={false}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="pound" />}
        />
      ) : (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TextInput
              label="Producer Code"
              value={producerCode}
              onChangeText={(text) => {
                setProducerCode(text);
                setMenuVisible(text.length > 0);
              }}
              onFocus={() => { if (producerCode.length > 0) setMenuVisible(true); }}
              keyboardType="number-pad"
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="pound" />}
            />
          }
          style={styles.menu}
        >
          {filteredProducers.slice(0, 8).map((p) => (
            <Menu.Item
              key={p._id || p.code}
              title={`${p.code} - ${p.name}`}
              onPress={() => {
                setProducerCode(p.code);
                setMenuVisible(false);
              }}
            />
          ))}
        </Menu>
      )}
      {selectedProducer && (
        <HelperText type="info" style={styles.producerHelper}>
          {selectedProducer.name} {selectedProducer.specialRate ? `(Special: ${selectedProducer.specialRate})` : ''}
        </HelperText>
      )}

      {/* Quantity & Fat side by side */}
      <View style={styles.row}>
        <TextInput
          label="Quantity (L)"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="decimal-pad"
          mode="outlined"
          style={styles.halfInput}
          left={<TextInput.Icon icon="water" color="#2e7d32" />}
          outlineColor="#a5d6a7"
          activeOutlineColor="#2e7d32"
        />
        <TextInput
          label="Fat %"
          value={fat}
          onChangeText={setFat}
          keyboardType="decimal-pad"
          mode="outlined"
          style={styles.halfInput}
          left={<TextInput.Icon icon="percent" color="#e65100" />}
          outlineColor="#ffcc80"
          activeOutlineColor="#e65100"
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        {existing?._id && (
          <Button
            mode="outlined"
            onPress={() => {
              Alert.alert(
                'Delete Procurement',
                'Are you sure you want to delete this record?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      setSaving(true);
                      try {
                        await ProcurementApi.delete(existing._id!);
                        navigation.goBack();
                      } catch (e: any) {
                        Alert.alert('Error', e.message || 'Failed to delete');
                      } finally {
                        setSaving(false);
                      }
                    },
                  },
                ]
              );
            }}
            disabled={saving}
            style={styles.deleteBtn}
            contentStyle={styles.saveBtnContent}
            labelStyle={styles.deleteBtnLabel}
            icon="delete"
            textColor="#d32f2f"
          >
            Delete
          </Button>
        )}
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={[styles.saveBtn, existing?._id ? { flex: 7 } : { flex: 1 }]}
          contentStyle={styles.saveBtnContent}
          labelStyle={styles.saveBtnLabel}
          icon={existing ? 'check' : 'content-save'}
        >
          {existing ? 'Update' : 'Save'}
        </Button>
      </View>

      {/* Properties */}
      {preview && (
        <Card style={styles.previewCard} mode="elevated">
          <Card.Content>
            <Text variant="titleSmall" style={styles.previewTitle}>Properties</Text>
            <Divider style={styles.divider} />
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Kg Fat</Text>
              <Text style={styles.previewValue}>{preview.kgFat.toFixed(3)}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Rate</Text>
              <Text style={styles.previewValue}>₹{preview.rate}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Premium Rate</Text>
              <Text style={styles.previewValue}>₹{preview.premiumRate}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Gross</Text>
              <Text style={styles.previewValue}>₹{preview.grossAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Incentive Rate</Text>
              <Text style={styles.previewValue}>₹{preview.incentiveRate}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Incentive</Text>
              <Text style={styles.previewValue}>₹{preview.incentiveAmount.toFixed(2)}</Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.previewRow}>
              <Text variant="titleMedium" style={styles.totalLabel}>Total</Text>
              <Text variant="titleMedium" style={styles.totalValue}>₹{preview.totalAmount.toFixed(2)}</Text>
            </View>
            {preview.sampleNumber && (
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Sample #</Text>
                <Text style={styles.previewValue}>{preview.sampleNumber}</Text>
              </View>
            )}
            {preview.adjustRate && (
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Adjust Rate</Text>
                <Text style={styles.previewValue}>Yes</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 16, paddingBottom: 40 },
  dateShiftRow: { flexDirection: 'row', gap: 8, marginBottom: 16, alignItems: 'center' },
  readOnlyLabel: { color: '#1565c0', fontSize: 14, fontWeight: '600' },
  dateTouchable: { borderRadius: 20 },
  dateChip: { backgroundColor: '#e3f2fd' },
  dateChipText: { color: '#1565c0', fontWeight: '600', fontSize: 13 },
  shiftChip: { backgroundColor: '#f5f5f5' },
  shiftAM: { backgroundColor: '#fff8e1' },
  shiftPM: { backgroundColor: '#ede7f6' },
  shiftActiveText: { fontWeight: '700', fontSize: 13 },
  shiftInactiveText: { opacity: 0.5, fontSize: 13 },
  input: { marginTop: 4, backgroundColor: '#fff' },
  menu: { width: '80%' },
  producerHelper: { marginBottom: 4 },
  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  halfInput: { flex: 1, backgroundColor: '#fff' },
  previewCard: { marginTop: 20, backgroundColor: '#fff', borderRadius: 12 },
  previewTitle: { fontWeight: 'bold', color: '#1a237e' },
  divider: { marginVertical: 8 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 },
  previewLabel: { color: '#555' },
  previewValue: { fontWeight: '600' },
  totalLabel: { fontWeight: 'bold', color: '#1a237e' },
  totalValue: { fontWeight: 'bold', color: '#2e7d32' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
  deleteBtn: { flex: 3, borderRadius: 8, borderColor: '#d32f2f' },
  deleteBtnLabel: { fontSize: 14 },
  saveBtn: { borderRadius: 8, elevation: 3 },
  saveBtnContent: { paddingVertical: 8 },
  saveBtnLabel: { fontSize: 16 },
});

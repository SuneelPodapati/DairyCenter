import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Searchbar, Chip } from 'react-native-paper';
import { useAppContext, ProducerApi, IProducer } from '../services';

export default function ProducerListScreen() {
  const { producers, refreshProducers } = useAppContext();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [allProducers, setAllProducers] = useState<IProducer[]>([]);

  const displayList = showAll ? allProducers : producers;
  const filtered = displayList.filter(
    (p) =>
      p.code.includes(search) ||
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProducers();
    if (showAll) await loadAll();
    setRefreshing(false);
  };

  const loadAll = async () => {
    try {
      const data = await ProducerApi.getAll('all');
      setAllProducers(data.sort((a, b) => Number(a.code) - Number(b.code)));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search by name or code"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      <View style={styles.filterRow}>
        <Chip
          selected={!showAll}
          onPress={() => setShowAll(false)}
          style={!showAll ? styles.filterActive : styles.filterInactive}
          textStyle={!showAll ? styles.filterActiveText : undefined}
          compact
        >
          Active ({producers.length})
        </Chip>
        <Chip
          selected={showAll}
          onPress={() => { setShowAll(true); loadAll(); }}
          style={showAll ? styles.filterActive : styles.filterInactive}
          textStyle={showAll ? styles.filterActiveText : undefined}
          compact
        >
          All ({allProducers.length || '…'})
        </Chip>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id || item.code}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#1976d2']} />}
        renderItem={({ item }) => <ProducerCard producer={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyLarge" style={{ color: '#999' }}>No producers found</Text>
          </View>
        }
      />
    </View>
  );
}

function ProducerCard({ producer }: { producer: IProducer }) {
  const displayName = producer.name.length > 20
    ? producer.name.substring(0, 20) + '…'
    : producer.name;

  return (
    <Card style={styles.card}>
      <Card.Content>
        {/* Header row — matches procurement listing style */}
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
          <Text style={styles.code}>#{producer.code}</Text>
          {producer.active ? <View style={styles.activeDot} /> : <View style={styles.inactiveDot} />}
        </View>

        {/* Contact info */}
        <View style={styles.detailsRow}>
          {producer.contactNumber ? (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>📱</Text>
              <Text style={styles.detailValue}>{producer.contactNumber}</Text>
            </View>
          ) : null}

          {producer.bankAccountNumber ? (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>🏦</Text>
              <Text style={styles.detailValue}>{producer.bankAccountNumber}</Text>
            </View>
          ) : null}

          {producer.bankIfscCode ? (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>IFSC</Text>
              <Text style={styles.detailValue}>{producer.bankIfscCode}</Text>
            </View>
          ) : null}
        </View>

        {/* Special rate */}
        {producer.specialRate ? (
          <View style={styles.specialRow}>
            <Text style={styles.specialLabel}>⭐ Special Rate:</Text>
            <Text style={styles.specialValue}>{producer.specialRate}</Text>
          </View>
        ) : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  search: { margin: 16, marginBottom: 8, elevation: 2 },
  card: { marginHorizontal: 16, marginVertical: 3, borderRadius: 8, elevation: 1, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  name: { flex: 1, fontWeight: 'bold', color: '#1a237e', fontSize: 14 },
  code: { color: '#1565c0', fontWeight: '700', fontSize: 12, marginRight: 8 },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4caf50',
  },
  inactiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#616161',
  },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, alignItems: 'center', gap: 8 },
  filterActive: { backgroundColor: '#e3f2fd' },
  filterActiveText: { color: '#1565c0', fontWeight: '600' },
  filterInactive: { backgroundColor: '#f5f5f5' },
  detailsRow: { marginTop: 4 },
  detailItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 1 },
  detailLabel: { fontSize: 12, width: 36 },
  detailValue: { fontSize: 13, color: '#333' },
  specialRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#eee' },
  specialLabel: { fontSize: 12, color: '#6a1b9a', fontWeight: '600' },
  specialValue: { fontSize: 12, color: '#6a1b9a', marginLeft: 4 },
  empty: { alignItems: 'center', paddingTop: 60 },
});

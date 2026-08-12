import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TextInput, Button, IconButton, Portal, Dialog } from 'react-native-paper';
import {
  ProcurementListScreen,
  AddEditProcurementScreen,
  ProducerListScreen,
  BillScreen,
  ProducerBillDetailScreen,
} from '../screens';
import { useAppContext } from '../services';

const Tab = createBottomTabNavigator();
const ProcurementStack = createNativeStackNavigator();
const BillStack = createNativeStackNavigator();

function ProcurementStackScreen() {
  return (
    <ProcurementStack.Navigator>
      <ProcurementStack.Screen
        name="ProcurementList"
        component={ProcurementListScreen}
        options={{ title: 'Procurements' }}
      />
      <ProcurementStack.Screen
        name="AddProcurement"
        component={AddEditProcurementScreen}
        options={{ title: 'Add Procurement' }}
      />
      <ProcurementStack.Screen
        name="EditProcurement"
        component={AddEditProcurementScreen}
        options={{ title: 'Edit Procurement' }}
      />
    </ProcurementStack.Navigator>
  );
}

function BillStackScreen() {
  return (
    <BillStack.Navigator>
      <BillStack.Screen
        name="BillList"
        component={BillScreen}
        options={{ title: 'Bills' }}
      />
      <BillStack.Screen
        name="ProducerBillDetail"
        component={ProducerBillDetailScreen}
        options={{ title: 'Producer Detail' }}
      />
    </BillStack.Navigator>
  );
}

function ProducersScreen() {
  const { center, rate, incentiveRate, premiumRate, bonusRate, updateRates } = useAppContext();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [editRate, setEditRate] = useState('');
  const [editIncentive, setEditIncentive] = useState('');
  const [editPremium, setEditPremium] = useState('');
  const [editBonus, setEditBonus] = useState('');

  const openDialog = () => {
    setEditRate(rate.toString());
    setEditIncentive(incentiveRate.toString());
    setEditPremium(premiumRate.toString());
    setEditBonus(bonusRate.toString());
    setVisible(true);
  };

  const saveRates = () => {
    updateRates({
      rate: parseFloat(editRate) || 0,
      incentiveRate: parseFloat(editIncentive) || 0,
      premiumRate: parseFloat(editPremium) || 0,
      bonusRate: parseFloat(editBonus) || 0,
    });
    setVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, paddingTop: insets.top + 10, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, zIndex: 1 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Producers ({center})</Text>
          <Text style={{ fontSize: 11, color: '#555' }}>Rate: ₹{rate}  •  Incentive: ₹{incentiveRate}  •  Premium: ₹{premiumRate}  •  Bonus: ₹{bonusRate}</Text>
        </View>
        <IconButton icon="pencil" size={18} onPress={openDialog} style={{ margin: 0 }} />
      </View>
      <ProducerListScreen />
      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Update Rates</Dialog.Title>
          <Dialog.Content style={{ gap: 8 }}>
            <TextInput label="Rate" value={editRate} onChangeText={setEditRate} keyboardType="numeric" mode="outlined" dense />
            <TextInput label="Incentive Rate" value={editIncentive} onChangeText={setEditIncentive} keyboardType="numeric" mode="outlined" dense />
            <TextInput label="Premium Rate" value={editPremium} onChangeText={setEditPremium} keyboardType="numeric" mode="outlined" dense />
            <TextInput label="Bonus Rate" value={editBonus} onChangeText={setEditBonus} keyboardType="numeric" mode="outlined" dense />
          </Dialog.Content>
          <Dialog.Actions style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}>
            <Button mode="outlined" onPress={() => setVisible(false)} style={{ flex: 3, borderRadius: 8 }} contentStyle={{ paddingVertical: 8 }}>Cancel</Button>
            <Button mode="contained" onPress={saveRates} style={{ flex: 7, borderRadius: 8, elevation: 3 }} contentStyle={{ paddingVertical: 8 }} labelStyle={{ fontSize: 16 }} icon="check">Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'home';
            switch (route.name) {
              case 'Procurement':
                iconName = 'clipboard-list';
                break;
              case 'Bills':
                iconName = 'receipt';
                break;
              case 'Producers':
                iconName = 'account-group';
                break;
            }
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Procurement" component={ProcurementStackScreen} />
        <Tab.Screen name="Bills" component={BillStackScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Producers" component={ProducersScreen} options={{
          headerShown: false,
        }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IProducer, ProducerApi } from './api';

interface AppContextType {
  center: string;
  setCenter: (center: string) => Promise<void>;
  rate: number;
  incentiveRate: number;
  premiumRate: number;
  bonusRate: number;
  producers: IProducer[];
  refreshProducers: () => Promise<void>;
  updateRates: (rates: { rate: number; incentiveRate: number; premiumRate: number; bonusRate: number }) => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const CENTERS = ['Puretipalli'];

// Default rates (will be overridden from storage if available)
const DEFAULT_RATE = 700;
const DEFAULT_INCENTIVE_RATE = 15;
const DEFAULT_PREMIUM_RATE = 0.1;
const DEFAULT_BONUS_RATE = 0;

export function AppProvider({ children }: { children: ReactNode }) {
  const [center, setCenterState] = useState('Puretipalli');
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [incentiveRate, setIncentiveRate] = useState(DEFAULT_INCENTIVE_RATE);
  const [premiumRate, setPremiumRate] = useState(DEFAULT_PREMIUM_RATE);
  const [bonusRate, setBonusRate] = useState(DEFAULT_BONUS_RATE);
  const [producers, setProducers] = useState<IProducer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (center) {
      refreshProducers();
    }
  }, [center]);

  async function loadSettings() {
    try {
      const savedCenter = await AsyncStorage.getItem('center');
      const savedRate = await AsyncStorage.getItem('rate');
      const savedIncentiveRate = await AsyncStorage.getItem('incentiveRate');
      const savedPremiumRate = await AsyncStorage.getItem('premiumRate');
      const savedBonusRate = await AsyncStorage.getItem('bonusRate');

      if (savedCenter) setCenterState(savedCenter);
      if (savedRate) setRate(parseFloat(savedRate));
      if (savedIncentiveRate) setIncentiveRate(parseFloat(savedIncentiveRate));
      if (savedPremiumRate) setPremiumRate(parseFloat(savedPremiumRate));
      if (savedBonusRate) setBonusRate(parseFloat(savedBonusRate));
    } catch (e) {
      console.error('Failed to load settings', e);
    } finally {
      setLoading(false);
    }
  }

  async function setCenter(newCenter: string) {
    setCenterState(newCenter);
    await AsyncStorage.setItem('center', newCenter);
  }

  async function refreshProducers() {
    try {
      const data = await ProducerApi.getAll('active');
      setProducers(data.sort((a, b) => Number(a.code) - Number(b.code)));
    } catch (e) {
      console.error('Failed to load producers', e);
    }
  }

  async function updateRates(rates: { rate: number; incentiveRate: number; premiumRate: number; bonusRate: number }) {
    setRate(rates.rate);
    setIncentiveRate(rates.incentiveRate);
    setPremiumRate(rates.premiumRate);
    setBonusRate(rates.bonusRate);
    await AsyncStorage.setItem('rate', rates.rate.toString());
    await AsyncStorage.setItem('incentiveRate', rates.incentiveRate.toString());
    await AsyncStorage.setItem('premiumRate', rates.premiumRate.toString());
    await AsyncStorage.setItem('bonusRate', rates.bonusRate.toString());
  }

  return (
    <AppContext.Provider
      value={{
        center,
        setCenter,
        rate,
        incentiveRate,
        premiumRate,
        bonusRate,
        producers,
        refreshProducers,
        updateRates,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

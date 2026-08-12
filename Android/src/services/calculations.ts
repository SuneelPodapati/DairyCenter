import { IProcurement, IProducer } from './api';

/**
 * Calculate procurement amounts based on the same logic as the Angular SPA.
 *
 * Formula (matches web app exactly):
 * - kgFat = quantity * min(fat, 10) / 100
 * - grossAmount = (kgFat * rate) + (quantity * premiumRate * max(0, fat - 10) * 10)
 * - incentiveAmount = kgFat * incentiveRate
 * - totalAmount = grossAmount + incentiveAmount
 */
export function calculateProcurement(
  procurement: IProcurement,
  producers: IProducer[],
  defaultRate: number,
  defaultIncentiveRate: number,
  defaultPremiumRate: number
): IProcurement {
  // Use record's own rates if > 0, else default (same as web app dataChanged logic)
  const procPremiumRate = procurement.premiumRate && procurement.premiumRate > 0 ? procurement.premiumRate : defaultPremiumRate;
  const procIncentiveRate = procurement.incentiveRate && procurement.incentiveRate > 0 ? procurement.incentiveRate : defaultIncentiveRate;

  const fat = Math.min(procurement.fat, 10);
  const kgFat = procurement.quantity * fat / 100;

  let rate = 0;
  const producer = producers.find(p => p.code === procurement.producerCode);
  if (producer?.specialRate) {
    // Web app passes capped fat to parseSpecialRate
    rate = parseSpecialRate(producer.specialRate, fat);
  }
  // Always fall back to system default rate (web app: rate = rate || this.rate)
  rate = rate || defaultRate;

  const amount = kgFat * rate;
  const premiumAmount = procurement.quantity * procPremiumRate * Math.max(0, procurement.fat - 10) * 10;

  // No rounding — match web app's raw precision
  const grossAmount = amount + premiumAmount;
  const incentiveAmount = kgFat * procIncentiveRate;
  const totalAmount = grossAmount + incentiveAmount;

  return {
    ...procurement,
    kgFat,
    rate,
    premiumRate: procPremiumRate,
    incentiveRate: procIncentiveRate,
    grossAmount,
    incentiveAmount,
    totalAmount,
  };
}

/**
 * Parse special rate string format: "min-max:rate, min-max:rate, ..."
 * Example: "0-5:600, 5-8:700, 8-10:800"
 * Matches web app's parseSpecialRate exactly.
 */
function parseSpecialRate(specialRate: string, fat: number): number {
  try {
    const fatBrackets = specialRate.trim().split(',');
    for (let i = 0; i < fatBrackets.length; i++) {
      const e = fatBrackets[i].trim();
      const rate = parseFloat(e.split(':')[1].trim());
      const min = parseFloat(e.split('-')[0].trim());
      const max = parseFloat(e.split(':')[0].split('-')[1].trim());
      if (min < fat && fat <= max) {
        return rate;
      }
    }
  } catch {
    // Invalid format
  }
  return 0;
}

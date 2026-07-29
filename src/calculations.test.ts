import { describe, expect, it } from 'vitest';
import { calculateEstimate, calculateRatePerCft, calculateTotalOperatingCost, calculateVolume, validateParcelDimensions } from './calculations';

const truck = { length: 25, breadth: 10, height: 10 };

describe('pricing calculations', () => {
  it('calculates volume as length x breadth x height', () => {
    expect(calculateVolume({ length: 2, breadth: 3, height: 4 })).toBe(24);
  });

  it('calculates total operating cost from truck hire and loading/unloading costs', () => {
    expect(calculateTotalOperatingCost({ truckHireCost: 10000, loadingUnloadingCost: 4000 })).toBe(14000);
  });

  it('calculates the rate per cubic foot from desired revenue and truck volume', () => {
    expect(calculateRatePerCft(25000, 2500)).toBe(10);
    expect(calculateRatePerCft(25000, 0)).toBe(0);
  });

  it('validates parcel dimensions and capacity against the truck', () => {
    expect(validateParcelDimensions({ length: 30, breadth: 12, height: 11 }, truck)).toEqual([
      'Parcel length exceeds truck length.',
      'Parcel breadth exceeds truck breadth.',
      'Parcel height exceeds truck height.',
      'Parcel volume exceeds truck volume capacity.',
    ]);
    expect(validateParcelDimensions({ length: 3, breadth: 2, height: 1 }, truck)).toEqual([]);
  });

  it('generates a final estimate as parcel volume x rate per cft', () => {
    const estimate = calculateEstimate({
      truck: { length: 25, breadth: 10, height: 10 },
      costs: { truckHireCost: 10000, loadingUnloadingCost: 4000 },
      desiredRevenue: 25000,
      parcel: { length: 3, breadth: 2, height: 1 },
    });

    expect(estimate.truckVolume).toBe(2500);
    expect(estimate.parcelVolume).toBe(6);
    expect(estimate.totalOperatingCost).toBe(14000);
    expect(estimate.ratePerCft).toBe(10);
    expect(estimate.estimatedPrice).toBe(60);
    expect(estimate.warnings).toEqual([]);
  });
});

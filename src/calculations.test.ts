import { describe, expect, it } from 'vitest';
import {
  calculateEstimate,
  calculateTotalCost,
  calculateVolume,
  calculateVolumeInCubicMetres,
  convertCubicMetresToUnit,
  convertDimensions,
  convertWeight,
  getLengthUnit,
  getWeightUnit,
  validateHeavyParcelWeight,
  validateParcelDimensions,
} from './calculations';

const truck = { length: 10, breadth: 4, height: 3, maxWeight: 1000 };

describe('pricing calculations', () => {
  it('calculates lightweight parcel volume', () => {
    expect(calculateVolume({ length: 2, breadth: 3, height: 4 })).toBe(24);
  });

  it('provides small and large length unit labels', () => {
    expect(getLengthUnit('cm')).toMatchObject({ label: 'cm', volumeLabel: 'cu cm' });
    expect(getLengthUnit('m')).toMatchObject({ label: 'm', volumeLabel: 'cu m' });
    expect(getLengthUnit('inch')).toMatchObject({ label: 'in', volumeLabel: 'cu in' });
    expect(getLengthUnit('ft')).toMatchObject({ label: 'ft', volumeLabel: 'cu ft' });
  });

  it('provides weight unit labels', () => {
    expect(getWeightUnit('kg')).toMatchObject({ label: 'kg' });
    expect(getWeightUnit('lb')).toMatchObject({ label: 'lb' });
  });

  it('converts entered measurements to internal metric values', () => {
    expect(convertDimensions({ length: 100, breadth: 50, height: 25 }, 'cm')).toEqual({ length: 1, breadth: 0.5, height: 0.25 });
    expect(convertWeight(220.462, 'lb')).toBeCloseTo(100, 2);
  });

  it('converts volumes between cubic metres and the selected display unit', () => {
    expect(calculateVolumeInCubicMetres({ length: 100, breadth: 100, height: 100 }, 'cm')).toBe(1);
    expect(convertCubicMetresToUnit(1, 'cm')).toBe(1_000_000);
  });

  it('validates heavy parcel weight against truck capacity', () => {
    expect(validateHeavyParcelWeight(1200, truck)).toContain('Parcel weight exceeds truck maximum weight capacity.');
    expect(validateHeavyParcelWeight(900, truck)).toEqual([]);
  });

  it('validates parcel dimensions and capacity', () => {
    expect(validateParcelDimensions({ length: 11, breadth: 5, height: 4 }, truck)).toEqual([
      'Parcel length exceeds truck length.',
      'Parcel breadth exceeds truck breadth.',
      'Parcel height exceeds truck height.',
      'Parcel volume exceeds truck volume capacity.',
    ]);
  });

  it('calculates total operational cost', () => {
    expect(calculateTotalCost({ fuelCost: 100, driverWages: 200, miscellaneous: 50 })).toBe(350);
  });

  it('generates final lightweight and heavy estimates in rupees', () => {
    expect(
      calculateEstimate({
        mode: 'lightweight',
        truck,
        costs: { fuelCost: 100, driverWages: 100, miscellaneous: 50 },
        parcelDimensions: { length: 1, breadth: 2, height: 3 },
      }).estimatedPrice,
    ).toBe(7495);

    expect(
      calculateEstimate({
        mode: 'heavy',
        truck,
        costs: { fuelCost: 100, driverWages: 100, miscellaneous: 50 },
        parcelWeight: 100,
      }).estimatedPrice,
    ).toBe(2795);
  });
});

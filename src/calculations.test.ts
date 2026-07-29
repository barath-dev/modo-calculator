import { describe, expect, it } from 'vitest';
import { calculateEstimate, calculateTotalCost, calculateVolume, validateHeavyParcelWeight, validateParcelDimensions } from './calculations';

const truck = { length: 10, breadth: 4, height: 3, maxWeight: 1000 };

describe('pricing calculations', () => {
  it('calculates lightweight parcel volume', () => {
    expect(calculateVolume({ length: 2, breadth: 3, height: 4 })).toBe(24);
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

  it('generates final lightweight and heavy estimates', () => {
    expect(
      calculateEstimate({
        mode: 'lightweight',
        truck,
        costs: { fuelCost: 100, driverWages: 100, miscellaneous: 50 },
        parcelDimensions: { length: 1, breadth: 2, height: 3 },
      }).estimatedPrice,
    ).toBe(367);

    expect(
      calculateEstimate({
        mode: 'heavy',
        truck,
        costs: { fuelCost: 100, driverWages: 100, miscellaneous: 50 },
        parcelWeight: 100,
      }).estimatedPrice,
    ).toBe(545);
  });
});

export type ParcelMode = 'lightweight' | 'heavy';
export type MeasurementSystem = 'metric' | 'imperial';

export interface Dimensions {
  length: number;
  breadth: number;
  height: number;
}

export interface TruckSpec extends Dimensions {
  maxWeight: number;
}

export interface CostFactors {
  fuelCost: number;
  driverWages: number;
  miscellaneous: number;
}

export interface PricingConfig {
  baseMarkupRate: number;
  volumeRate: number;
  weightRate: number;
  currencyCode: 'INR';
}

export interface UnitLabels {
  distance: string;
  volume: string;
  weight: string;
}

export const defaultPricingConfig: PricingConfig = {
  baseMarkupRate: 0.18,
  volumeRate: 1200,
  weightRate: 25,
  currencyCode: 'INR',
};

export const unitLabels: Record<MeasurementSystem, UnitLabels> = {
  metric: { distance: 'm', volume: 'cu m', weight: 'kg' },
  imperial: { distance: 'ft', volume: 'cu ft', weight: 'lb' },
};

export const getUnitLabels = (system: MeasurementSystem): UnitLabels => unitLabels[system];

export const calculateVolume = ({ length, breadth, height }: Dimensions): number =>
  Math.max(0, length) * Math.max(0, breadth) * Math.max(0, height);

export const calculateTotalCost = ({ fuelCost, driverWages, miscellaneous }: CostFactors): number =>
  Math.max(0, fuelCost) + Math.max(0, driverWages) + Math.max(0, miscellaneous);

export const validateParcelDimensions = (parcel: Dimensions, truck: TruckSpec): string[] => {
  const warnings: string[] = [];
  if (parcel.length > truck.length) warnings.push('Parcel length exceeds truck length.');
  if (parcel.breadth > truck.breadth) warnings.push('Parcel breadth exceeds truck breadth.');
  if (parcel.height > truck.height) warnings.push('Parcel height exceeds truck height.');
  if (calculateVolume(parcel) > calculateVolume(truck)) warnings.push('Parcel volume exceeds truck volume capacity.');
  return warnings;
};

export const validateHeavyParcelWeight = (parcelWeight: number, truck: TruckSpec): string[] =>
  parcelWeight > truck.maxWeight ? ['Parcel weight exceeds truck maximum weight capacity.'] : [];

export const calculateEstimate = ({
  mode,
  truck,
  costs,
  parcelDimensions,
  parcelWeight,
  config = defaultPricingConfig,
}: {
  mode: ParcelMode;
  truck: TruckSpec;
  costs: CostFactors;
  parcelDimensions?: Dimensions;
  parcelWeight?: number;
  config?: PricingConfig;
}) => {
  const operationalCost = calculateTotalCost(costs);
  const baseCost = operationalCost * (1 + config.baseMarkupRate);
  const truckVolume = calculateVolume(truck);
  const warnings =
    mode === 'lightweight' && parcelDimensions
      ? validateParcelDimensions(parcelDimensions, truck)
      : validateHeavyParcelWeight(parcelWeight ?? 0, truck);
  const variableCharge =
    mode === 'lightweight'
      ? calculateVolume(parcelDimensions ?? { length: 0, breadth: 0, height: 0 }) * config.volumeRate
      : Math.max(0, parcelWeight ?? 0) * config.weightRate;

  return {
    truckVolume,
    parcelVolume: mode === 'lightweight' && parcelDimensions ? calculateVolume(parcelDimensions) : 0,
    operationalCost,
    warnings,
    estimatedPrice: Math.round((baseCost + variableCharge) * 100) / 100,
  };
};

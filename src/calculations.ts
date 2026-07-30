export interface Dimensions {
  length: number;
  breadth: number;
  height: number;
}

export type LengthUnit = 'ft' | 'in';

export const lengthUnits: Record<LengthUnit, { label: string; toFeet: number }> = {
  ft: { label: 'ft', toFeet: 1 },
  in: { label: 'in', toFeet: 1 / 12 },
};

export const convertDimensionsToFeet = (dimensions: Dimensions, unit: LengthUnit): Dimensions => {
  const multiplier = lengthUnits[unit].toFeet;
  return {
    length: Math.max(0, dimensions.length) * multiplier,
    breadth: Math.max(0, dimensions.breadth) * multiplier,
    height: Math.max(0, dimensions.height) * multiplier,
  };
};

export interface RouteCosts {
  truckHireCost: number;
  loadingUnloadingCost: number;
}

export const calculateVolume = ({ length, breadth, height }: Dimensions): number =>
  Math.max(0, length) * Math.max(0, breadth) * Math.max(0, height);

export const calculateTotalOperatingCost = ({ truckHireCost, loadingUnloadingCost }: RouteCosts): number =>
  Math.max(0, truckHireCost) + Math.max(0, loadingUnloadingCost);

export const calculateRatePerCft = (desiredRevenue: number, truckVolume: number): number =>
  truckVolume > 0 ? Math.max(0, desiredRevenue) / truckVolume : 0;

export const validateParcelDimensions = (parcel: Dimensions, truck: Dimensions): string[] => {
  const warnings: string[] = [];
  if (parcel.length > truck.length) warnings.push('Parcel length exceeds truck length.');
  if (parcel.breadth > truck.breadth) warnings.push('Parcel breadth exceeds truck breadth.');
  if (parcel.height > truck.height) warnings.push('Parcel height exceeds truck height.');
  if (calculateVolume(parcel) > calculateVolume(truck)) warnings.push('Parcel volume exceeds truck volume capacity.');
  return warnings;
};

export const calculateEstimate = ({
  truck,
  costs,
  desiredRevenue,
  parcel,
}: {
  truck: Dimensions;
  costs: RouteCosts;
  desiredRevenue: number;
  parcel: Dimensions;
}) => {
  const truckVolume = calculateVolume(truck);
  const parcelVolume = calculateVolume(parcel);
  const totalOperatingCost = calculateTotalOperatingCost(costs);
  const ratePerCft = calculateRatePerCft(desiredRevenue, truckVolume);
  const warnings = validateParcelDimensions(parcel, truck);

  return {
    truckVolume,
    parcelVolume,
    totalOperatingCost,
    ratePerCft: Math.round(ratePerCft * 100) / 100,
    warnings,
    estimatedPrice: Math.round(parcelVolume * ratePerCft * 100) / 100,
  };
};

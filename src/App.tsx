import { useMemo, useRef, useState } from 'react';
import { Calculator, Truck } from 'lucide-react';
import {
  calculateEstimate,
  convertCubicMetresToUnit,
  convertDimensions,
  convertWeight,
  CostFactors,
  Dimensions,
  getLengthUnit,
  getWeightUnit,
  LengthUnit,
  ParcelMode,
  TruckSpec,
  WeightUnit,
} from './calculations';
import './styles.css';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const lengthChoices: LengthUnit[] = ['cm', 'm', 'inch', 'ft'];
const weightChoices: WeightUnit[] = ['kg', 'lb'];

const roundMeasurement = (value: number): number => Math.round(value * 1000) / 1000;

const convertDimensionsForDisplay = (dimensions: Dimensions, from: LengthUnit, to: LengthUnit): Dimensions => {
  const fromMetres = getLengthUnit(from).toMetres;
  const toMetres = getLengthUnit(to).toMetres;

  return {
    length: roundMeasurement((dimensions.length * fromMetres) / toMetres),
    breadth: roundMeasurement((dimensions.breadth * fromMetres) / toMetres),
    height: roundMeasurement((dimensions.height * fromMetres) / toMetres),
  };
};

const convertWeightForDisplay = (value: number, from: WeightUnit, to: WeightUnit): number => {
  const fromKg = getWeightUnit(from).toKg;
  const toKg = getWeightUnit(to).toKg;

  return roundMeasurement((value * fromKg) / toKg);
};

function NumberField({ label, value, onChange, suffix }: { label: string; value: number; onChange: (value: number) => void; suffix?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="inputWrap">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={value || ''}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        {suffix && <small>{suffix}</small>}
      </div>
    </label>
  );
}

function SegmentedControl<T extends string>({ label, options, value, onChange, getLabel }: { label: string; options: T[]; value: T; onChange: (value: T) => void; getLabel: (value: T) => string }) {
  return (
    <div className="switchGroup">
      <span>{label}</span>
      <div className="modeSwitch" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button key={option} type="button" className={value === option ? 'active' : ''} onClick={() => onChange(option)}>
            {getLabel(option)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [lengthUnit, setLengthUnit] = useState<LengthUnit>('m');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [truck, setTruck] = useState<TruckSpec>({ length: 6, breadth: 2.4, height: 2.4, maxWeight: 5000 });
  const [costs, setCosts] = useState<CostFactors>({ fuelCost: 2000, driverWages: 1500, miscellaneous: 500 });
  const [mode, setMode] = useState<ParcelMode>('lightweight');
  const [parcelDimensions, setParcelDimensions] = useState<Dimensions>({ length: 1.2, breadth: 0.8, height: 0.6 });
  const [parcelWeight, setParcelWeight] = useState(750);
  const summaryRef = useRef<HTMLElement>(null);

  const lengthLabel = getLengthUnit(lengthUnit).label;
  const volumeLabel = getLengthUnit(lengthUnit).volumeLabel;
  const weightLabel = getWeightUnit(weightUnit).label;

  const handleLengthUnitChange = (nextUnit: LengthUnit) => {
    if (nextUnit === lengthUnit) return;
    setTruck((currentTruck) => ({
      ...convertDimensionsForDisplay(currentTruck, lengthUnit, nextUnit),
      maxWeight: currentTruck.maxWeight,
    }));
    setParcelDimensions((currentParcel) => convertDimensionsForDisplay(currentParcel, lengthUnit, nextUnit));
    setLengthUnit(nextUnit);
  };

  const handleWeightUnitChange = (nextUnit: WeightUnit) => {
    if (nextUnit === weightUnit) return;
    setTruck((currentTruck) => ({
      ...currentTruck,
      maxWeight: convertWeightForDisplay(currentTruck.maxWeight, weightUnit, nextUnit),
    }));
    setParcelWeight((currentWeight) => convertWeightForDisplay(currentWeight, weightUnit, nextUnit));
    setWeightUnit(nextUnit);
  };

  const estimate = useMemo(() => {
    const normalizedTruck = {
      ...convertDimensions(truck, lengthUnit),
      maxWeight: convertWeight(truck.maxWeight, weightUnit),
    };

    return calculateEstimate({
      mode,
      truck: normalizedTruck,
      costs,
      parcelDimensions: convertDimensions(parcelDimensions, lengthUnit),
      parcelWeight: convertWeight(parcelWeight, weightUnit),
    });
  }, [mode, truck, costs, parcelDimensions, parcelWeight, lengthUnit, weightUnit]);

  return (
    <main className="appShell">
      <section className="hero">
        <div>
          <p className="eyebrow">Offline-ready PWA</p>
          <h1>Modo Truck Pricing Calculator</h1>
          <p>Estimate parcel prices in rupees with selectable metric and imperial units.</p>
        </div>
        <Truck aria-hidden="true" />
      </section>

      <section className="grid">
        <form className="card">
          <h2>Truck specifications</h2>
          <div className="unitRow">
            <SegmentedControl label="Size unit" options={lengthChoices} value={lengthUnit} onChange={handleLengthUnitChange} getLabel={(unit) => getLengthUnit(unit).label} />
            <SegmentedControl label="Weight unit" options={weightChoices} value={weightUnit} onChange={handleWeightUnitChange} getLabel={(unit) => getWeightUnit(unit).label} />
          </div>
          <div className="fieldGrid">
            <NumberField label="Height" suffix={lengthLabel} value={truck.height} onChange={(height) => setTruck({ ...truck, height })} />
            <NumberField label="Length" suffix={lengthLabel} value={truck.length} onChange={(length) => setTruck({ ...truck, length })} />
            <NumberField label="Breadth" suffix={lengthLabel} value={truck.breadth} onChange={(breadth) => setTruck({ ...truck, breadth })} />
            <NumberField label="Max weight" suffix={weightLabel} value={truck.maxWeight} onChange={(maxWeight) => setTruck({ ...truck, maxWeight })} />
          </div>
        </form>

        <form className="card compactCard">
          <h2>Cost factors</h2>
          <div className="fieldGrid">
            <NumberField label="Fuel" value={costs.fuelCost} onChange={(fuelCost) => setCosts({ ...costs, fuelCost })} />
            <NumberField label="Driver wages" value={costs.driverWages} onChange={(driverWages) => setCosts({ ...costs, driverWages })} />
            <NumberField label="Miscellaneous" value={costs.miscellaneous} onChange={(miscellaneous) => setCosts({ ...costs, miscellaneous })} />
          </div>
        </form>

        <form className="card parcelCard">
          <h2>Client parcel details</h2>
          <div className="modeSwitch" role="radiogroup" aria-label="Parcel mode">
            <button type="button" className={mode === 'lightweight' ? 'active' : ''} onClick={() => setMode('lightweight')}>Lightweight</button>
            <button type="button" className={mode === 'heavy' ? 'active' : ''} onClick={() => setMode('heavy')}>Heavy</button>
          </div>
          {mode === 'lightweight' ? (
            <div className="fieldGrid">
              <NumberField label="Length" suffix={lengthLabel} value={parcelDimensions.length} onChange={(length) => setParcelDimensions({ ...parcelDimensions, length })} />
              <NumberField label="Breadth" suffix={lengthLabel} value={parcelDimensions.breadth} onChange={(breadth) => setParcelDimensions({ ...parcelDimensions, breadth })} />
              <NumberField label="Height" suffix={lengthLabel} value={parcelDimensions.height} onChange={(height) => setParcelDimensions({ ...parcelDimensions, height })} />
            </div>
          ) : (
            <NumberField label="Parcel weight" suffix={weightLabel} value={parcelWeight} onChange={setParcelWeight} />
          )}
        </form>

        <section className="card summary" ref={summaryRef}>
          <div className="summaryHeader"><Calculator aria-hidden="true" /><h2>Pricing summary</h2></div>
          <dl>
            <div><dt>Truck volume</dt><dd>{convertCubicMetresToUnit(estimate.truckVolume, lengthUnit).toFixed(2)} {volumeLabel}</dd></div>
            <div><dt>Max weight</dt><dd>{truck.maxWeight.toFixed(2)} {weightLabel}</dd></div>
            <div><dt>Parcel details</dt><dd>{mode === 'lightweight' ? `${convertCubicMetresToUnit(estimate.parcelVolume, lengthUnit).toFixed(2)} ${volumeLabel}` : `${parcelWeight.toFixed(2)} ${weightLabel}`}</dd></div>
            <div><dt>Entered costs</dt><dd>{currency.format(estimate.operationalCost)}</dd></div>
          </dl>
          {estimate.warnings.length > 0 && <div className="warnings"><strong>Validation warnings</strong>{estimate.warnings.map((warning) => <p key={warning}>{warning}</p>)}</div>}
          <div className="price"><span>Final estimated price</span><strong>{currency.format(estimate.estimatedPrice)}</strong></div>
          <p className="formula">Formula uses metres/kg internally: operating cost + 18% markup + ₹1,200 per cu m or ₹25 per kg.</p>
        </section>
      </section>

      <button
        type="button"
        className="stickyPrice"
        onClick={() => summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        aria-label={`Estimated price ${currency.format(estimate.estimatedPrice)}. Tap to view full pricing breakdown.`}
      >
        <span>Estimated price</span>
        <strong aria-live="polite">{currency.format(estimate.estimatedPrice)}</strong>
      </button>
    </main>
  );
}

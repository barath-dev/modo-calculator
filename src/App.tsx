import { useMemo, useRef, useState } from 'react';
import { Calculator, Truck } from 'lucide-react';
import { calculateEstimate, convertDimensionsToFeet, Dimensions, lengthUnits, LengthUnit, RouteCosts } from './calculations';
import './styles.css';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const parcelUnitChoices: LengthUnit[] = ['ft', 'in'];

const roundMeasurement = (value: number): number => Math.round(value * 1000) / 1000;

const convertDimensionsForDisplay = (dimensions: Dimensions, from: LengthUnit, to: LengthUnit): Dimensions => {
  const fromFeet = lengthUnits[from].toFeet;
  const toFeet = lengthUnits[to].toFeet;

  return {
    length: roundMeasurement((dimensions.length * fromFeet) / toFeet),
    breadth: roundMeasurement((dimensions.breadth * fromFeet) / toFeet),
    height: roundMeasurement((dimensions.height * fromFeet) / toFeet),
  };
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
  const [truck, setTruck] = useState<Dimensions>({ length: 32, breadth: 9, height: 8 });
  const [costs, setCosts] = useState<RouteCosts>({ truckHireCost: 10000, loadingUnloadingCost: 4000 });
  const [desiredRevenue, setDesiredRevenue] = useState(25000);
  const [parcelUnit, setParcelUnit] = useState<LengthUnit>('ft');
  const [parcel, setParcel] = useState<Dimensions>({ length: 3, breadth: 2, height: 1 });
  const summaryRef = useRef<HTMLElement>(null);

  const parcelUnitLabel = lengthUnits[parcelUnit].label;

  const handleParcelUnitChange = (nextUnit: LengthUnit) => {
    if (nextUnit === parcelUnit) return;
    setParcel((currentParcel) => convertDimensionsForDisplay(currentParcel, parcelUnit, nextUnit));
    setParcelUnit(nextUnit);
  };

  const estimate = useMemo(
    () => calculateEstimate({ truck, costs, desiredRevenue, parcel: convertDimensionsToFeet(parcel, parcelUnit) }),
    [truck, costs, desiredRevenue, parcel, parcelUnit],
  );

  return (
    <main className="appShell">
      <section className="hero">
        <div>
          <p className="eyebrow">Offline-ready PWA</p>
          <h1>Modo Truck Pricing Calculator</h1>
          <p>Estimate parcel freight in rupees per cubic foot, based on your desired revenue for a full truck.</p>
        </div>
        <Truck aria-hidden="true" />
      </section>

      <section className="grid">
        <form className="card">
          <h2>Truck specifications</h2>
          <div className="fieldGrid">
            <NumberField label="Length" suffix="ft" value={truck.length} onChange={(length) => setTruck({ ...truck, length })} />
            <NumberField label="Breadth" suffix="ft" value={truck.breadth} onChange={(breadth) => setTruck({ ...truck, breadth })} />
            <NumberField label="Height" suffix="ft" value={truck.height} onChange={(height) => setTruck({ ...truck, height })} />
          </div>
        </form>

        <form className="card compactCard">
          <h2>Cost factors</h2>
          <div className="fieldGrid">
            <NumberField label="Truck hire cost" value={costs.truckHireCost} onChange={(truckHireCost) => setCosts({ ...costs, truckHireCost })} />
            <NumberField label="Loading & unloading" value={costs.loadingUnloadingCost} onChange={(loadingUnloadingCost) => setCosts({ ...costs, loadingUnloadingCost })} />
            <NumberField label="Desired revenue (full truck)" value={desiredRevenue} onChange={setDesiredRevenue} />
          </div>
        </form>

        <form className="card parcelCard">
          <h2>Client parcel details</h2>
          <div className="unitRow">
            <SegmentedControl label="Size unit" options={parcelUnitChoices} value={parcelUnit} onChange={handleParcelUnitChange} getLabel={(unit) => lengthUnits[unit].label} />
          </div>
          <div className="fieldGrid">
            <NumberField label="Length" suffix={parcelUnitLabel} value={parcel.length} onChange={(length) => setParcel({ ...parcel, length })} />
            <NumberField label="Breadth" suffix={parcelUnitLabel} value={parcel.breadth} onChange={(breadth) => setParcel({ ...parcel, breadth })} />
            <NumberField label="Height" suffix={parcelUnitLabel} value={parcel.height} onChange={(height) => setParcel({ ...parcel, height })} />
          </div>
        </form>

        <section className="card summary" ref={summaryRef}>
          <div className="summaryHeader"><Calculator aria-hidden="true" /><h2>Pricing summary</h2></div>
          <dl>
            <div><dt>Truck volume</dt><dd>{estimate.truckVolume.toFixed(2)} cu ft</dd></div>
            <div><dt>Rate per cu ft</dt><dd>{currency.format(estimate.ratePerCft)}</dd></div>
            <div><dt>Parcel volume</dt><dd>{estimate.parcelVolume.toFixed(2)} cu ft</dd></div>
            <div><dt>Total operating cost</dt><dd>{currency.format(estimate.totalOperatingCost)}</dd></div>
          </dl>
          {estimate.warnings.length > 0 && <div className="warnings"><strong>Validation warnings</strong>{estimate.warnings.map((warning) => <p key={warning}>{warning}</p>)}</div>}
          <div className="price"><span>Final estimated price</span><strong>{currency.format(estimate.estimatedPrice)}</strong></div>
          <p className="formula">Rate per cu ft = desired revenue ÷ truck volume. Freight = parcel volume × rate per cu ft.</p>
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

import { useMemo, useState } from 'react';
import { Calculator, Truck } from 'lucide-react';
import { calculateEstimate, CostFactors, Dimensions, ParcelMode, TruckSpec } from './calculations';
import './styles.css';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function NumberField({ label, value, onChange, suffix }: { label: string; value: number; onChange: (value: number) => void; suffix?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="inputWrap">
        <input type="number" min="0" step="0.01" value={value || ''} onChange={(event) => onChange(Number(event.target.value))} />
        {suffix && <small>{suffix}</small>}
      </div>
    </label>
  );
}

export default function App() {
  const [truck, setTruck] = useState<TruckSpec>({ length: 20, breadth: 8, height: 8, maxWeight: 5000 });
  const [costs, setCosts] = useState<CostFactors>({ fuelCost: 120, driverWages: 180, miscellaneous: 50 });
  const [mode, setMode] = useState<ParcelMode>('lightweight');
  const [parcelDimensions, setParcelDimensions] = useState<Dimensions>({ length: 4, breadth: 3, height: 3 });
  const [parcelWeight, setParcelWeight] = useState(750);

  const estimate = useMemo(
    () => calculateEstimate({ mode, truck, costs, parcelDimensions, parcelWeight }),
    [mode, truck, costs, parcelDimensions, parcelWeight],
  );

  return (
    <main className="appShell">
      <section className="hero">
        <div>
          <p className="eyebrow">Offline-ready PWA</p>
          <h1>Modo Truck Pricing Calculator</h1>
          <p>Capture vehicle limits, operating costs, and parcel details while meeting clients.</p>
        </div>
        <Truck aria-hidden="true" />
      </section>

      <section className="grid">
        <form className="card">
          <h2>Truck specifications</h2>
          <NumberField label="Height" suffix="ft" value={truck.height} onChange={(height) => setTruck({ ...truck, height })} />
          <NumberField label="Length" suffix="ft" value={truck.length} onChange={(length) => setTruck({ ...truck, length })} />
          <NumberField label="Breadth" suffix="ft" value={truck.breadth} onChange={(breadth) => setTruck({ ...truck, breadth })} />
          <NumberField label="Maximum weight capacity" suffix="kg" value={truck.maxWeight} onChange={(maxWeight) => setTruck({ ...truck, maxWeight })} />
        </form>

        <form className="card">
          <h2>Cost factors</h2>
          <NumberField label="Fuel cost" value={costs.fuelCost} onChange={(fuelCost) => setCosts({ ...costs, fuelCost })} />
          <NumberField label="Driver wages" value={costs.driverWages} onChange={(driverWages) => setCosts({ ...costs, driverWages })} />
          <NumberField label="Miscellaneous expenses" value={costs.miscellaneous} onChange={(miscellaneous) => setCosts({ ...costs, miscellaneous })} />
        </form>

        <form className="card parcelCard">
          <h2>Client parcel details</h2>
          <div className="modeSwitch" role="radiogroup" aria-label="Parcel mode">
            <button type="button" className={mode === 'lightweight' ? 'active' : ''} onClick={() => setMode('lightweight')}>Lightweight parcel</button>
            <button type="button" className={mode === 'heavy' ? 'active' : ''} onClick={() => setMode('heavy')}>Heavy parcel</button>
          </div>
          {mode === 'lightweight' ? (
            <>
              <NumberField label="Length" suffix="ft" value={parcelDimensions.length} onChange={(length) => setParcelDimensions({ ...parcelDimensions, length })} />
              <NumberField label="Breadth" suffix="ft" value={parcelDimensions.breadth} onChange={(breadth) => setParcelDimensions({ ...parcelDimensions, breadth })} />
              <NumberField label="Height" suffix="ft" value={parcelDimensions.height} onChange={(height) => setParcelDimensions({ ...parcelDimensions, height })} />
            </>
          ) : (
            <NumberField label="Parcel weight" suffix="kg" value={parcelWeight} onChange={setParcelWeight} />
          )}
        </form>

        <section className="card summary">
          <div className="summaryHeader"><Calculator aria-hidden="true" /><h2>Pricing summary</h2></div>
          <dl>
            <div><dt>Truck volume</dt><dd>{estimate.truckVolume.toFixed(2)} cu ft</dd></div>
            <div><dt>Max weight</dt><dd>{truck.maxWeight.toFixed(2)} kg</dd></div>
            <div><dt>Parcel details</dt><dd>{mode === 'lightweight' ? `${estimate.parcelVolume.toFixed(2)} cu ft` : `${parcelWeight.toFixed(2)} kg`}</dd></div>
            <div><dt>Entered costs</dt><dd>{currency.format(estimate.operationalCost)}</dd></div>
          </dl>
          {estimate.warnings.length > 0 && <div className="warnings"><strong>Validation warnings</strong>{estimate.warnings.map((warning) => <p key={warning}>{warning}</p>)}</div>}
          <div className="price"><span>Final estimated price</span><strong>{currency.format(estimate.estimatedPrice)}</strong></div>
          <p className="formula">Formula: operating cost + 18% markup + {mode === 'lightweight' ? '$12 per cubic foot' : '$2.50 per kg'}.</p>
        </section>
      </section>
    </main>
  );
}

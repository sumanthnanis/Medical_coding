import { useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { FiActivity, FiDollarSign, FiTrendingUp, FiEdit2 } from 'react-icons/fi'
import ProgressBar from '../components/ProgressBar'

const seed = {
  icd10: [
    { code: 'E11.9', desc: 'Type 2 diabetes mellitus without complications', tag: 'Primary Diagnosis', billable: true, confidence: 0.94 },
    { code: 'Z79.4', desc: 'Long term (current) use of insulin', tag: 'Secondary Diagnosis', billable: true, confidence: 0.87 },
    { code: 'Z13.1', desc: 'Encounter for screening for diabetes mellitus', tag: 'Procedure Reason', billable: true, confidence: 0.82 },
  ],
  cpt: [
    { code: '99213', desc: 'Office or other outpatient visit for evaluation and management', group: 'Evaluation & Management', rvu: 1.3, fee: 125.0, confidence: 0.96 },
    { code: '83036', desc: 'Hemoglobin; glycosylated (A1C)', group: 'Laboratory', rvu: 0.17, fee: 28.5, confidence: 0.92 },
    { code: '82947', desc: 'Glucose; quantitative, blood (except reagent strip)', group: 'Laboratory', rvu: 0.17, fee: 15.75, confidence: 0.89 },
  ],
}

export default function Results(){
  const location = useLocation()
  const navigate = useNavigate()
  const [codes, setCodes] = useState(seed)
  const [notes, setNotes] = useState('Patient presented for routine diabetes management. HbA1c levels indicate good glycemic control. Continue current medication regimen.')

  const totals = useMemo(()=>{
    const all = [...codes.icd10, ...codes.cpt]
    const avg = all.length? Math.round(all.reduce((s, c)=> s + (c.confidence||0), 0) / all.length * 100) : 0
    const totalRVU = codes.cpt.reduce((s,c)=> s + (c.rvu||0), 0)
    const totalRevenue = codes.cpt.reduce((s,c)=> s + (c.fee||0), 0)
    return { avg, totalCodes: all.length, totalRVU: Number(totalRVU.toFixed(2)), revenue: Number(totalRevenue.toFixed(2)) }
  }, [codes])

  function update(list, idx, patch){
    setCodes(prev => ({ ...prev, [list]: prev[list].map((row, i)=> i===idx ? { ...row, ...patch } : row) }))
  }

  function save(confirm=true){
    // Persist in real app
    navigate('/history', { state: { justSaved: confirm } })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Coding Results</h2>
          <p className="text-ink-500 text-sm">Review and validate AI-generated medical codes</p>
        </div>
        <button className="btn btn-primary" onClick={()=>save(true)}>Save & Confirm</button>
      </div>

      {/* Summary tiles */}
      <div className="grid md:grid-cols-4 gap-4">
        <SummaryTile label="Overall Accuracy" value={`${totals.avg}%`} icon={FiActivity}>
          <div className="mt-2"><ProgressBar value={totals.avg} size="sm"/></div>
        </SummaryTile>
        <SummaryTile label="Total Codes" value={totals.totalCodes} icon={FiTrendingUp} />
        <SummaryTile label="Total RVUs" value={totals.totalRVU} icon={FiActivity} />
        <SummaryTile label="Estimated Revenue" value={`$${totals.revenue}`} icon={FiDollarSign} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ICD10 */}
        <div className="card p-5">
          <div className="font-semibold flex items-center gap-2 mb-1">ICD-10 Diagnosis Codes</div>
          <p className="text-sm text-ink-600 mb-4">International Classification of Diseases codes for billing and documentation</p>
          <div className="space-y-3">
            {codes.icd10.map((row, idx)=> (
              <div key={idx} className="rounded-xl border border-ink-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-primary-700">{row.code}</div>
                    {row.tag && <Pill>{row.tag}</Pill>}
                    {row.billable && <Pill tone="green">Billable</Pill>}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Confidence pct={Math.round(row.confidence*100)} />
                    <button className="text-ink-500 hover:text-ink-800" aria-label="Edit ICD10" onClick={()=>update('icd10', idx, { editing: !(row.editing) })}><FiEdit2/></button>
                  </div>
                </div>
                {!row.editing ? (
                  <div className="text-sm text-ink-700 mt-1">{row.desc}</div>
                ) : (
                  <div className="grid grid-cols-12 gap-2 mt-2">
                    <input className="input col-span-3" value={row.code} onChange={e=>update('icd10', idx, { code: e.target.value })}/>
                    <input className="input col-span-9" value={row.desc} onChange={e=>update('icd10', idx, { desc: e.target.value })}/>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CPT */}
        <div className="card p-5">
          <div className="font-semibold mb-1">CPT Procedure Codes</div>
          <p className="text-sm text-ink-600 mb-4">Current Procedural Terminology codes for services and procedures</p>
          <div className="space-y-3">
            {codes.cpt.map((row, idx)=> (
              <div key={idx} className="rounded-xl border border-ink-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-primary-700">{row.code}</div>
                    {row.group && <Pill>{row.group}</Pill>}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Confidence pct={Math.round(row.confidence*100)} />
                    <button className="text-ink-500 hover:text-ink-800" aria-label="Edit CPT" onClick={()=>update('cpt', idx, { editing: !(row.editing) })}><FiEdit2/></button>
                  </div>
                </div>
                {!row.editing ? (
                  <div className="text-sm text-ink-700 mt-1">{row.desc}</div>
                ) : (
                  <div className="grid grid-cols-12 gap-2 mt-2">
                    <input className="input col-span-3" value={row.code} onChange={e=>update('cpt', idx, { code: e.target.value })}/>
                    <input className="input col-span-9" value={row.desc} onChange={e=>update('cpt', idx, { desc: e.target.value })}/>
                  </div>
                )}
                <div className="text-xs text-ink-500 mt-2">RVU: {row.rvu?.toFixed(2)}  Fee: ${row.fee?.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="card p-5">
        <div className="font-semibold mb-1">Clinical Notes & Comments</div>
        <div className="text-sm text-ink-600 mb-3">Additional notes and observations for this coding session</div>
        <textarea className="input min-h-28" value={notes} onChange={(e)=>setNotes(e.target.value)} />
      </div>

      <div className="flex items-center justify-end gap-2">
        <button className="btn btn-outline" onClick={()=>save(false)}>Save as Draft</button>
        <button className="btn btn-primary" onClick={()=>save(true)}>Save & Confirm Coding</button>
      </div>
    </div>
  )
}

function SummaryTile({ label, value, icon: Icon, children }){
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-ink-600">{label}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
        <div className="h-10 w-10 rounded-lg bg-primary-100 text-primary-700 grid place-items-center">{Icon && <Icon/>}</div>
      </div>
      {children}
    </div>
  )
}

function Pill({ children, tone='primary' }){
  const cls = tone==='green' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-primary-50 text-primary-700 border-primary-200'
  return <span className={`text-xs font-medium border rounded-full px-2 py-0.5 ${cls}`}>{children}</span>
}

function Confidence({ pct }){
  const level = pct >= 90 ? 'High' : pct >= 80 ? 'Medium' : 'Low'
  const tone = pct >= 90 ? 'green' : pct >= 80 ? 'amber' : 'red'
  const badge = tone==='green' ? 'bg-green-50 text-green-700 border-green-200' : tone==='amber' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'
  return (
    <div className="flex items-center gap-2">
      <span className="text-ink-700 font-medium">{pct}%</span>
      <span className={`text-xs border rounded-full px-2 py-0.5 ${badge}`}>{level}</span>
    </div>
  )
}

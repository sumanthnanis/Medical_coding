import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ProgressBar from '../components/ProgressBar'
import { FiCheckCircle } from 'react-icons/fi'

export default function Processing(){
  const [progress, setProgress] = useState(10)
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [fields, setFields] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(()=>{
    const id = setInterval(()=>{
      setProgress((p)=>{
        const next = Math.min(100, p + Math.random()*12)
        setStep(next < 25 ? 0 : next < 55 ? 1 : next < 85 ? 2 : 3)
        if(next >= 100){
          clearInterval(id)
          const data = {
            patient: { name: 'John Smith', age: 45, gender: 'Male' },
            diagnosis: 'Type 2 Diabetes Mellitus',
            tests: 'HbA1c, Lipid Panel',
            date: new Date().toISOString().slice(0,10),
            physician: 'Dr. Sarah Johnson',
            procedures: 'Blood Draw, Consultation',
          }
          setFields(data)
          setDone(true)
        }
        return next
      })
    }, 450)
    return ()=> clearInterval(id)
  }, [])

  const files = location.state?.files || []

  const Stage = ({ label, desc, index }) => (
    <div className={`rounded-xl border ${step >= index ? 'border-primary-200 bg-primary-50/60' : 'border-ink-200 bg-white'} p-4` }>
      <div className="font-medium">{label}</div>
      <div className="text-sm text-ink-500">{desc}</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Processing Status</h2>
      <div className="card p-6">
        <p className="text-sm text-ink-600">AI-powered OCR and medical data extraction in progress</p>
        <div className="flex items-center justify-between mt-2 text-sm">
          <div className="text-ink-600">Overall Progress</div>
          <div className="font-medium text-ink-700">{progress|0}%</div>
        </div>
        <div className="mt-2"><ProgressBar value={progress} size="lg" /></div>

        <div className="grid md:grid-cols-4 gap-3 mt-6">
          <Stage index={0} label="Document Upload" desc="Receiving and validating files"/>
          <Stage index={1} label="OCR Processing" desc="Extracting text from documents"/>
          <Stage index={2} label="Data Extraction" desc="Identifying medical information"/>
          <Stage index={3} label="AI Validation" desc="Verifying extracted data"/>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="font-semibold mb-1">Extracted Patient Information</div>
          <div className="text-sm text-ink-600 mb-4">AI-identified patient demographics and basic information</div>
          <div className="space-y-3">
            {fields ? (
              <>
                <ConfRow label="Patient Name" value={fields.patient.name} pct={95} level="High" />
                <ConfRow label="Age" value={String(fields.patient.age)} pct={98} level="High" />
                <ConfRow label="Gender" value={fields.patient.gender} pct={100} level="High" />
                <ConfRow label="Service Date" value={fields.date} pct={96} level="High" />
              </>
            ) : <SkeletonList/>}
          </div>
        </div>

        <div className="card p-6">
          <div className="font-semibold mb-1">Medical Information</div>
          <div className="text-sm text-ink-600 mb-4">Clinical data, diagnoses, and procedures extracted from documents</div>
          <div className="space-y-3">
            {fields ? (
              <>
                <ConfRow label="Primary Diagnosis" value={fields.diagnosis} pct={92} level="High" />
                <ConfRow label="Laboratory Tests" value={fields.tests} pct={89} level="Medium" tone="amber" />
                <ConfRow label="Attending Physician" value={fields.physician} pct={94} level="High" />
                <ConfRow label="Procedures Performed" value={fields.procedures} pct={87} level="Medium" tone="amber" />
              </>
            ) : <SkeletonList/>}
          </div>
        </div>
      </div>

      {done && (
        <div className="p-4 rounded-2xl border border-green-200 bg-green-50 flex items-center justify-between">
          <div className="flex items-center gap-3 text-green-800">
            <FiCheckCircle/>
            <div>
              <div className="font-medium">Processing Complete!</div>
              <div className="text-sm">Data extraction finished. Ready for medical coding review.</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={()=> navigate('/results', { state: { fields } })}>View Coding Results</button>
        </div>
      )}
    </div>
  )
}

function ConfRow({ label, value, pct, level, tone='green' }){
  const toneMap = tone==='amber'
    ? 'bg-amber-50 border-amber-200 text-amber-700'
    : 'bg-green-50 border-green-200 text-green-700'
  return (
    <div className={`p-4 rounded-xl border ${toneMap}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-ink-800">{label}</div>
          <div className="text-sm text-ink-600">{value}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{pct}%</span>
          <span className="badge bg-white border-ink-200 text-ink-700">{level}</span>
        </div>
      </div>
    </div>
  )
}

function SkeletonList(){
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-12 bg-ink-100 rounded-xl"/>
      <div className="h-12 bg-ink-100 rounded-xl"/>
      <div className="h-12 bg-ink-100 rounded-xl"/>
      <div className="h-12 bg-ink-100 rounded-xl"/>
    </div>
  )
}

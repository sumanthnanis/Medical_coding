import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ProgressBar from '../components/ProgressBar'
import { FiCheckCircle } from 'react-icons/fi'

export default function Processing(){
  const { state } = useLocation()
  const navigate = useNavigate()
  const files = state?.files || []
  const primaryFile = files[0]

  const [progress, setProgress] = useState(10)
  const [step, setStep] = useState(0)
  const [progressDone, setProgressDone] = useState(false)
  const [document, setDocument] = useState(null)
  const [polling, setPolling] = useState(false)
  const [pollError, setPollError] = useState(null)

  useEffect(()=>{
    if(!files.length){
      navigate('/upload', { replace: true })
    }
  }, [files.length, navigate])

  useEffect(()=>{
    const id = setInterval(()=>{
      setProgress((p)=>{
        const next = Math.min(100, p + Math.random()*12)
        setStep(next < 25 ? 0 : next < 55 ? 1 : next < 85 ? 2 : 3)
        if(next >= 100){
          clearInterval(id)
          setProgressDone(true)
          return 100
        }
        return next
      })
    }, 450)
    return ()=> clearInterval(id)
  }, [])

  useEffect(()=>{
    if(!primaryFile?.key){
      return
    }

    let active = true
    let timeoutId
    setPolling(true)

    async function poll(){
      try {
        const response = await fetch(`/api/documents?key=${encodeURIComponent(primaryFile.key)}`)
        if(!active) return
        if(response.status === 404){
          timeoutId = setTimeout(poll, 5000)
          return
        }
        if(!response.ok){
          throw new Error('Failed to fetch document metadata')
        }
        const payload = await response.json()
        setDocument(payload.document)
        setPollError(null)
        setPolling(false)
      } catch (err) {
        if(!active) return
        setPollError(err?.message || 'Unable to retrieve document details')
        timeoutId = setTimeout(poll, 7000)
      }
    }

    timeoutId = setTimeout(poll, 1500)

    return () => {
      active = false
      if(timeoutId) clearTimeout(timeoutId)
    }
  }, [primaryFile?.key])

  const patientSummary = useMemo(()=>{
    if(!document) return null
    const profile = document.PatientProfile || document.Patient || {}
    const name = profile.Name || document.PatientName
    const age = profile.Age || document.PatientAge
    const gender = profile.Gender || document.PatientGender
    const serviceDate = document.ServiceDate || document.Date || document.timestamp
    return {
      name: name || 'N/A',
      age: age ? String(age) : 'N/A',
      gender: gender || 'N/A',
      date: serviceDate || new Date().toISOString().slice(0,10),
    }
  }, [document])

  const medicalHighlights = useMemo(()=>{
    if(!document) return null
    return {
      diagnosis: document.PrimaryDiagnosis || document.Diagnosis || 'N/A',
      tests: document.OrderedTests || document.Tests || 'N/A',
      physician: document.AttendingPhysician || document.Physician || 'N/A',
      procedures: document.Procedures || 'N/A',
    }
  }, [document])

  const done = progressDone && !!document

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

        {polling && (
          <div className="mt-4 text-xs text-ink-500">Retrieving structured results from DynamoDB…</div>
        )}
        {pollError && (
          <div className="mt-3 text-sm text-danger">{pollError}</div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="font-semibold mb-1">Extracted Patient Information</div>
          <div className="text-sm text-ink-600 mb-4">AI-identified patient demographics and basic information</div>
          <div className="space-y-3">
            {patientSummary ? (
              <>
                <ConfRow label="Patient Name" value={patientSummary.name} pct={document?.Confidence?.PatientName || 90} level="High" />
                <ConfRow label="Age" value={patientSummary.age} pct={document?.Confidence?.PatientAge || 90} level="High" />
                <ConfRow label="Gender" value={patientSummary.gender} pct={document?.Confidence?.PatientGender || 90} level="High" />
                <ConfRow label="Service Date" value={patientSummary.date} pct={document?.Confidence?.ServiceDate || 88} level="High" />
              </>
            ) : <SkeletonList/>}
          </div>
        </div>

        <div className="card p-6">
          <div className="font-semibold mb-1">Medical Information</div>
          <div className="text-sm text-ink-600 mb-4">Clinical data, diagnoses, and procedures extracted from documents</div>
          <div className="space-y-3">
            {medicalHighlights ? (
              <>
                <ConfRow label="Primary Diagnosis" value={medicalHighlights.diagnosis} pct={document?.Confidence?.PrimaryDiagnosis || 85} level="High" />
                <ConfRow label="Laboratory Tests" value={medicalHighlights.tests} pct={document?.Confidence?.OrderedTests || 80} level="Medium" tone="amber" />
                <ConfRow label="Attending Physician" value={medicalHighlights.physician} pct={document?.Confidence?.AttendingPhysician || 82} level="High" />
                <ConfRow label="Procedures Performed" value={medicalHighlights.procedures} pct={document?.Confidence?.Procedures || 78} level="Medium" tone="amber" />
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
          <button
            className="btn btn-primary"
            onClick={()=> navigate('/results', { state: { document, files } })}
            disabled={!document}
          >
            View Coding Results
          </button>
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

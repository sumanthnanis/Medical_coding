import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import jsPDF from 'jspdf'
import { FiFileText, FiCheckCircle, FiClock, FiAlertCircle, FiEye, FiDownload, FiMoreVertical, FiExternalLink, FiSearch, FiX, FiFilter, FiChevronDown } from 'react-icons/fi'
import Modal from '../components/Modal'
import PdfPreview from '../components/PdfPreview'

const rows = [
  { name: 'ER_Discharge_1021.pdf', date: '2025-09-10', accuracy: 0.91, status: 'Completed' },
  { name: 'MRI_Report_1019.pdf', date: '2025-09-10', accuracy: 0.71, status: 'In Progress' },
  { name: 'Lab_Panel_1018.pdf', date: '2025-09-09', accuracy: 0.93, status: 'Completed' },
  { name: 'Consultation_Notes_1017.pdf', date: '2025-09-08', accuracy: 0.65, status: 'Pending' },
]

export default function History(){
  const location = useLocation()
  const data = useMemo(()=> rows, [])
  const [previewIndex, setPreviewIndex] = useState(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [range, setRange] = useState('All')

  const filtered = useMemo(()=>{
    let out = [...data]
    const q = query.trim().toLowerCase()
    if(q){
      out = out.filter((r,i)=>{
        const id = `DOC-${String(i+1).padStart(3,'0')}`
        const coder = ['Sarah Johnson','Mike Chen','Emily Davis','Lisa Thompson'][i%4]
        return r.name.toLowerCase().includes(q) || id.toLowerCase().includes(q) || coder.toLowerCase().includes(q)
      })
    }
    if(status !== 'All'){
      out = out.filter(r => r.status === status)
    }
    if(range !== 'All'){
      const now = new Date('2025-09-11') // demo anchor; in real use new Date()
      const days = range === '7d' ? 7 : 30
      const ms = days*24*3600*1000
      out = out.filter(r => (now - new Date(r.date)) <= ms)
    }
    return out
  }, [data, query, status, range])

  function exportJSON(){
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'history.json'; a.click(); URL.revokeObjectURL(url)
  }
  function exportCSV(){
    const header = 'Document Name,Date,AI Accuracy %,Status\n'
    const lines = data.map(r=> `${r.name},${r.date},${Math.round(r.accuracy*100)}%,${r.status}`)
    const blob = new Blob([header+lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'history.csv'; a.click(); URL.revokeObjectURL(url)
  }
  function exportPDF(){
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text('Medical Coding • Audit & History', 14, 16)
    doc.setFontSize(10)
    let y = 26
    doc.text('Document Name', 14, y)
    doc.text('Date', 100, y)
    doc.text('AI Accuracy %', 140, y)
    doc.text('Status', 170, y)
    y += 6
    data.forEach((r)=>{
      doc.text(r.name, 14, y, { maxWidth: 80 })
      doc.text(r.date, 100, y)
      doc.text(String(Math.round(r.accuracy*100)), 150, y, { align: 'right' })
      doc.text(r.status, 170, y)
      y += 6
    })
    doc.save('history.pdf')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Audit & History</h2>
          <p className="text-ink-500 text-sm">Track document processing history and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline" onClick={exportCSV}>Export CSV</button>
          <button className="btn btn-outline" onClick={exportJSON}>Export JSON</button>
          <button className="btn btn-primary" onClick={exportPDF}>Export PDF</button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="card p-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-ink-500">Total Documents</div>
            <div className="text-2xl font-semibold">{data.length}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary-100 text-primary-700 grid place-items-center"><FiFileText/></div>
        </div>
        <div className="card p-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-ink-500">Completed</div>
            <div className="text-2xl font-semibold">{data.filter(d=>d.status==='Completed').length}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-green-100 text-green-700 grid place-items-center"><FiCheckCircle/></div>
        </div>
        <div className="card p-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-ink-500">Avg. Accuracy</div>
            <div className="text-2xl font-semibold">{Math.round(data.reduce((a,b)=>a+b.accuracy,0)/data.length*100)/100 * 100}%</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-700 grid place-items-center"><FiAlertCircle/></div>
        </div>
        <div className="card p-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-ink-500">Total Revenue</div>
            <div className="text-2xl font-semibold">$2080.50</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary-100 text-primary-700 grid place-items-center"><FiClock/></div>
        </div>
      </div>
      
      {/* Sticky Filter Bar */}
      <div className="sticky top-16 z-10">
        <div className="card p-4">
          <div className="font-medium mb-3 flex items-center gap-2"><FiFilter/> Filter & Search</div>
          <div className="grid md:grid-cols-4 gap-3 items-center">
            {/* Search */}
            <div className="col-span-2">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"/>
                <input
                  aria-label="Search documents"
                  className="input pl-9 bg-ink-50 border-ink-200"
                  placeholder="Search documents, IDs, or coders"
                  value={query}
                  onChange={(e)=>setQuery(e.target.value)}
                />
                {query && (
                  <button aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700" onClick={()=>setQuery('')}>
                    <FiX/>
                  </button>
                )}
              </div>
            </div>
            {/* Status dropdown */}
            <div>
              <div className="relative">
                <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"/>
                <select aria-label="Filter by status" className="input appearance-none bg-ink-50 border-ink-200 pr-9" value={status} onChange={(e)=>setStatus(e.target.value)}>
                  <option>All</option>
                  <option>Completed</option>
                  <option>In Progress</option>
                  <option>Pending</option>
                </select>
              </div>
            </div>
            {/* Date range dropdown */}
            <div>
              <div className="relative">
                <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"/>
                <select aria-label="Date range" className="input appearance-none bg-ink-50 border-ink-200 pr-9" value={range} onChange={(e)=>setRange(e.target.value)}>
                  <option value="All">All Dates</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="btn btn-outline w-full md:w-auto" onClick={()=>{setQuery('');setStatus('All');setRange('All')}}>Clear Filters</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
          <div>
            <div className="font-semibold">Document History</div>
            <div className="text-sm text-ink-500">Showing {filtered.length} of {data.length} documents</div>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600">
            <tr>
              <th className="text-left font-medium px-5 py-2.5">Document</th>
              <th className="text-left font-medium px-5 py-2.5">Status</th>
              <th className="text-left font-medium px-5 py-2.5">Upload Date</th>
              <th className="text-left font-medium px-5 py-2.5">Coder</th>
              <th className="text-left font-medium px-5 py-2.5">Accuracy</th>
              <th className="text-left font-medium px-5 py-2.5">Codes</th>
              <th className="text-left font-medium px-5 py-2.5">Revenue</th>
              <th className="text-left font-medium px-5 py-2.5">Review Time</th>
              <th className="text-left font-medium px-5 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i)=> (
              <tr key={i} className="border-t border-ink-100 hover:bg-ink-50/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2 text-primary-700 font-medium cursor-pointer" onClick={()=>setPreviewIndex(i)}>
                    <FiFileText/> {r.name}
                  </div>
                  <div className="text-xs text-ink-500">DOC-{String(i+1).padStart(3,'0')}</div>
                </td>
                <td className="px-5 py-3">
                  {r.status === 'Completed' && <span className="badge badge-success">Completed</span>}
                  {r.status === 'In Progress' && <span className="badge badge-info">In Progress</span>}
                  {r.status === 'Pending' && <span className="badge badge-warning">Pending</span>}
                </td>
                <td className="px-5 py-3">{r.date}</td>
                <td className="px-5 py-3">{['Sarah Johnson','Mike Chen','Emily Davis','Lisa Thompson'][i%4]}</td>
                <td className="px-5 py-3">{Math.round(r.accuracy*100)}%</td>
                <td className="px-5 py-3">ICD-10: {i%4+1}  CPT: {i%3}</td>
                <td className="px-5 py-3 text-green-600">${(Math.random()*700).toFixed(2)}</td>
                <td className="px-5 py-3">{12+i} min</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3 text-ink-600">
                    <button aria-label="Preview" onClick={()=>setPreviewIndex(i)} title="Preview"><FiEye/></button>
                    <button aria-label="Download" title="Download"><FiDownload/></button>
                    <button aria-label="More actions" title="More"><FiMoreVertical/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PreviewModal
        open={previewIndex !== null}
        doc={previewIndex !== null ? filtered[previewIndex] : null}
        onPrev={previewIndex !== null ? ()=> setPreviewIndex((i)=> Math.max(0, i-1)) : undefined}
        onNext={previewIndex !== null ? ()=> setPreviewIndex((i)=> Math.min(filtered.length-1, i+1)) : undefined}
        onClose={()=> setPreviewIndex(null)}
      />
    </div>
  )
}

function PreviewModal({ open, onClose, doc, onPrev, onNext }){
  const url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  const actions = (
    <div className="flex items-center gap-2">
      <a href={url} target="_blank" rel="noreferrer" className="btn btn-outline px-3 py-1.5" aria-label="Open in new tab"><FiExternalLink/></a>
      <a href={url} download className="btn btn-outline px-3 py-1.5" aria-label="Download"><FiDownload/></a>
    </div>
  )
  return (
    <Modal open={open} onClose={onClose} title={doc?.name || 'Preview'} actions={actions} onPrev={onPrev} onNext={onNext}>
      <PdfPreview url={url} height={650} />
    </Modal>
  )
}
 

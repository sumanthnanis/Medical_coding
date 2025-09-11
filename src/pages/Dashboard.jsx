import { Link } from 'react-router-dom'
import { FiUploadCloud, FiFileText, FiClock, FiCheckCircle, FiTrendingUp, FiExternalLink, FiDownload } from 'react-icons/fi'
import Modal from '../components/Modal'
import PdfPreview from '../components/PdfPreview'
import StatCard from '../components/StatCard'
import DocumentRow from '../components/DocumentRow'

const sample = [
  { id: 'DOC-1021', name: 'ER_Discharge_1021.pdf', status: 'Pending', date: '2025-09-10', accuracy: 0 },
  { id: 'DOC-1019', name: 'MRI_Report_1019.pdf', status: 'In Progress', date: '2025-09-10', accuracy: 0.71 },
  { id: 'DOC-1018', name: 'Lab_Panel_1018.pdf', status: 'Completed', date: '2025-09-09', accuracy: 0.93 },
]

import { useState } from 'react'

export default function Dashboard(){
  const stats = {
    pending: sample.filter(s=>s.status==='Pending').length,
    inprogress: sample.filter(s=>s.status==='In Progress').length,
    completed: sample.filter(s=>s.status==='Completed').length,
  }
  const [previewIndex, setPreviewIndex] = useState(null)
  const list = sample
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="text-ink-500 text-sm">Monitor document processing and system activity</p>
        </div>
        <Link to="/upload" className="btn btn-primary"><FiUploadCloud className="mr-2"/> Upload New Document</Link>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={FiClock} label="Pending" value={stats.pending} accent="amber" />
        <StatCard icon={FiFileText} label="In Progress" value={stats.inprogress} accent="blue" />
        <StatCard icon={FiCheckCircle} label="Completed" value={stats.completed} accent="green" />
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-500">AI Accuracy</p>
              <p className="text-2xl font-semibold">94.2%</p>
              <div className="mt-2">
                <PdfAccuracy />
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary-100 text-primary-700 grid place-items-center"><FiTrendingUp/></div>
          </div>
        </div>
      </div>

      <div className="card p-4 mt-4">
        <div className="px-1 py-2">
          <div className="font-semibold">Recent Documents</div>
          <div className="text-sm text-ink-500">Latest uploaded documents and their processing status</div>
        </div>
        <div className="space-y-3 mt-2">
          {list.map((d, i)=> (
            <DocumentRow key={d.id} item={d} onClick={()=> setPreviewIndex(i)} />
          ))}
        </div>
      </div>

      <PreviewModal
        open={previewIndex !== null}
        doc={previewIndex !== null ? list[previewIndex] : null}
        onPrev={previewIndex !== null ? ()=> setPreviewIndex((i)=> Math.max(0, i-1)) : undefined}
        onNext={previewIndex !== null ? ()=> setPreviewIndex((i)=> Math.min(list.length-1, i+1)) : undefined}
        onClose={()=> setPreviewIndex(null)}
      />
    </div>
  )
}

function PdfAccuracy(){
  return <div className="w-full"><div className="w-full bg-ink-100 h-1.5 rounded-full overflow-hidden"><div className="bg-primary-600 h-full" style={{ width: '94%' }} /></div></div>
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

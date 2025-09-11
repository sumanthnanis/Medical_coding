import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadDropzone from '../components/UploadDropzone'
import ProgressBar from '../components/ProgressBar'
import { FiTrash2, FiUploadCloud } from 'react-icons/fi'

export default function Upload(){
  const [files, setFiles] = useState([])
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  function handleFiles(list){
    if(!list?.length) return
    setFiles(prev => {
      const names = new Set(prev.map(f=>f.name))
      const merged = [...prev]
      list.forEach(f=> { if(!names.has(f.name)) merged.push(f) })
      return merged
    })
  }

  function startUpload(){
    if(!files.length) return
    setUploading(true)
    setProgress(5)
  }

  useEffect(()=>{
    if(!uploading) return
    const id = setInterval(()=>{
      setProgress((p)=>{
        const next = p + Math.random()*18
        if(next >= 100){
          clearInterval(id)
          setTimeout(()=> navigate('/processing', { state: { files } }), 600)
          return 100
        }
        return next
      })
    }, 400)
    return ()=> clearInterval(id)
  }, [uploading])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Upload Documents</h2>
        <p className="text-ink-500 text-sm">Upload medical documents for AI processing and coding</p>
      </div>

      <div className="card p-6">
        <div className="font-medium mb-3">Supported File Formats</div>
        <div className="grid md:grid-cols-3 gap-3">
          {[{t:'PDF', d:'Portable Document Format'},{t:'JPEG', d:'JPEG Image Format'},{t:'PNG', d:'PNG Image Format'}].map((f)=> (
            <div key={f.t} className="flex items-center gap-3 p-3 rounded-xl border border-ink-100">
              <div className="h-10 w-10 rounded-lg grid place-items-center bg-primary-50 text-primary-700">{f.t.slice(0,1)}</div>
              <div>
                <div className="font-medium">{f.t}</div>
                <div className="text-xs text-ink-500">{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="font-medium mb-1">Upload Files</div>
        <p className="text-sm text-ink-500 mb-4">Drag and drop files or click to browse. Maximum file size: 10MB per file.</p>
        <UploadDropzone onFiles={handleFiles} />
      </div>

      {!!files.length && (
        <div className="card p-6">
          <div className="font-medium mb-1">Selected Files ({files.length})</div>
          <p className="text-sm text-ink-500 mb-4">Review your files before uploading</p>
          <div className="space-y-3">
            {files.map((f, i)=> (
              <div key={i} className="flex items-center justify-between p-3 border border-ink-100 rounded-xl">
                <div>
                  <div className="font-medium text-ink-900">{f.name}</div>
                  <div className="text-xs text-ink-500">{(f.size/1024).toFixed(2)} KB</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge badge-info">Ready</span>
                  <button aria-label="Remove file" className="text-ink-500 hover:text-danger" onClick={()=> setFiles(files.filter((_,idx)=> idx!==i))}><FiTrash2/></button>
                </div>
              </div>
            ))}
          </div>

          {!uploading && (
            <div className="flex items-center justify-end mt-4">
              <button className="btn btn-primary" onClick={startUpload}><FiUploadCloud className="mr-2"/> Upload Files ({files.length})</button>
            </div>
          )}

          {uploading && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="text-ink-600">Uploading {files.length} file(s)</div>
                <div className="text-ink-700 font-medium">{progress | 0}%</div>
              </div>
              <ProgressBar value={progress} />
            </div>
          )}
        </div>
      )}

      <div className="bg-primary-50 text-ink-800 border border-primary-200 rounded-2xl p-4">
        <div className="font-medium">HIPAA Compliance Notice</div>
        <div className="text-sm text-ink-600">All uploaded documents are encrypted in transit and at rest. Access is logged and monitored for compliance with healthcare data protection regulations.</div>
      </div>
    </div>
  )
}

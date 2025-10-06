import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadDropzone from '../components/UploadDropzone'
import ProgressBar from '../components/ProgressBar'
import { FiTrash2, FiUploadCloud } from 'react-icons/fi'

const statusLabel = {
  pending: 'Ready',
  requesting: 'Preparing',
  uploading: 'Uploading',
  uploaded: 'Uploaded',
  error: 'Error',
}

const statusBadge = {
  pending: 'badge-info',
  requesting: 'badge-info',
  uploading: 'badge-info',
  uploaded: 'badge-success',
  error: 'badge-danger',
}

export default function Upload(){
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const filesRef = useRef(files)

  useEffect(()=>{ filesRef.current = files }, [files])

  function handleFiles(list){
    if(!list?.length) return
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      const additions = Array.from(list)
        .filter(file => !existing.has(file.name))
        .map(file => ({
          file,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          status: 'pending',
          progress: 0,
          url: null,
          key: null,
          error: null,
        }))
      return [...prev, ...additions]
    })
  }

  function removeFile(index){
    setFiles(prev => prev.filter((_, idx) => idx !== index))
  }

  function updateFile(index, patch){
    setFiles(prev => prev.map((item, idx) => idx === index ? { ...item, ...patch } : item))
  }

  async function uploadFile(item, index){
    try {
      updateFile(index, { status: 'requesting', error: null })
      const response = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: item.name, fileType: item.type || 'application/octet-stream' }),
      })

      let payload = {}
      try {
        payload = await response.json()
      } catch (err) {
        if (!response.ok) throw new Error('Failed to obtain upload URL')
      }

      if(!response.ok){
        throw new Error(payload?.error || 'Failed to obtain upload URL')
      }

      const { uploadUrl, fileUrl, key } = payload
      if(!uploadUrl || !fileUrl){
        throw new Error('Upload service returned an invalid response')
      }

      await uploadToS3(uploadUrl, item.file, index, item.type)
      updateFile(index, { status: 'uploaded', progress: 100, url: fileUrl, key })
      return { name: item.name, size: item.size, type: item.type, url: fileUrl, key }
    } catch (err) {
      const message = err?.message || 'Upload failed'
      updateFile(index, { status: 'error', progress: 0, error: message })
      throw err
    }
  }

  function uploadToS3(url, file, index, mimeType){
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', url)
      xhr.setRequestHeader('Content-Type', mimeType || 'application/octet-stream')
      xhr.upload.onprogress = event => {
        if(!event.lengthComputable) return
        const pct = Math.round((event.loaded / event.total) * 100)
        updateFile(index, { status: 'uploading', progress: pct })
      }
      xhr.onload = () => {
        if(xhr.status >= 200 && xhr.status < 300){
          resolve()
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      }
      xhr.onerror = () => reject(new Error('Network error during upload'))
      xhr.send(file)
    })
  }

  async function startUpload(){
    if(!files.length) return
    setError(null)
    setUploading(true)
    const queue = filesRef.current
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.status !== 'uploaded')
    const uploadedMeta = []

    try {
      for (const { index } of queue){
        const current = filesRef.current[index]
        if(!current) continue
        const meta = await uploadFile(current, index)
        if(meta) uploadedMeta.push(meta)
      }

      if(!uploadedMeta.length){
        throw new Error('No files were uploaded successfully')
      }

      setUploading(false)
      navigate('/processing', { state: { files: uploadedMeta } })
    } catch (err) {
      setUploading(false)
      setError(err?.message || 'Unable to upload files')
    }
  }

  const overallProgress = files.length ? Math.round(
    files.reduce((sum, file) => sum + (file.status === 'uploaded' ? 100 : file.progress || 0), 0) / files.length
  ) : 0

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
        {error && <div className="mt-4 text-sm text-danger">{error}</div>}
      </div>

      {!!files.length && (
        <div className="card p-6">
          <div className="font-medium mb-1">Selected Files ({files.length})</div>
          <p className="text-sm text-ink-500 mb-4">Review your files before uploading</p>
          <div className="space-y-3">
            {files.map((f, i)=> (
              <div key={i} className="p-3 border border-ink-100 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-ink-900">{f.name}</div>
                    <div className="text-xs text-ink-500">{(f.size/1024).toFixed(2)} KB</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${statusBadge[f.status] || 'badge-info'}`}>{statusLabel[f.status] || 'Status'}</span>
                    <button
                      aria-label="Remove file"
                      className="text-ink-500 hover:text-danger disabled:opacity-50"
                      onClick={()=> removeFile(i)}
                      disabled={uploading && (f.status === 'uploading' || f.status === 'requesting')}
                    >
                      <FiTrash2/>
                    </button>
                  </div>
                </div>
                {(f.status === 'uploading' || f.status === 'uploaded') && (
                  <div className="mt-3">
                    <ProgressBar value={f.status === 'uploaded' ? 100 : f.progress} size="sm" />
                  </div>
                )}
                {f.status === 'error' && f.error && (
                  <div className="mt-2 text-xs text-danger">{f.error}</div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            {uploading && (
              <div className="text-sm text-ink-600">Uploading {files.filter(f=>f.status==='uploaded').length}/{files.length} file(s)</div>
            )}
            <div className="flex items-center gap-4 ml-auto">
              {uploading && (
                <div className="w-48">
                  <ProgressBar value={overallProgress} />
                </div>
              )}
              <button className="btn btn-primary" onClick={startUpload} disabled={uploading}>
                <FiUploadCloud className="mr-2"/> {uploading ? 'Uploading...' : `Upload Files (${files.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-primary-50 text-ink-800 border border-primary-200 rounded-2xl p-4">
        <div className="font-medium">HIPAA Compliance Notice</div>
        <div className="text-sm text-ink-600">All uploaded documents are encrypted in transit and at rest. Access is logged and monitored for compliance with healthcare data protection regulations.</div>
      </div>
    </div>
  )
}

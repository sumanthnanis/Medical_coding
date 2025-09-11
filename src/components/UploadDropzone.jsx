import { useState, useRef } from 'react'
import { FiUploadCloud } from 'react-icons/fi'

export default function UploadDropzone({ onFiles }){
  const [drag, setDrag] = useState(false)
  const inputRef = useRef()
  function handle(e){
    e.preventDefault()
    e.stopPropagation()
  }
  function onDrop(e){
    handle(e)
    const files = Array.from(e.dataTransfer?.files || [])
    onFiles?.(files)
    setDrag(false)
  }
  return (
    <div
      onDragEnter={()=>setDrag(true)}
      onDragOver={handle}
      onDragLeave={()=>setDrag(false)}
      onDrop={onDrop}
      className={`border-2 border-dashed rounded-xl p-8 grid place-items-center text-center transition-colors ${drag? 'border-primary-400 bg-primary-50/40' : 'border-slate-300 bg-white'}`}
    >
      <input ref={inputRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" multiple onChange={(e)=>onFiles?.(Array.from(e.target.files||[]))}/>
      <FiUploadCloud className="h-8 w-8 text-primary-600 mb-2"/>
      <p className="font-medium">Drag & Drop files here</p>
      <p className="text-sm text-slate-600">or</p>
      <button type="button" className="btn btn-primary mt-2" onClick={()=>inputRef.current?.click()}>Browse files</button>
      <p className="text-xs text-slate-500 mt-2">Supported: PDF, JPEG, PNG</p>
    </div>
  )
}


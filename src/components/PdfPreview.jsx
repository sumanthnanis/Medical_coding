import { useMemo } from 'react'

export default function PdfPreview({ file, url, height=600 }){
  const src = useMemo(() => {
    if(url) return url
    if(file) return URL.createObjectURL(file)
    return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  }, [file, url])
  return (
    <div className="w-full">
      <iframe title="PDF Preview" src={src} className="w-full rounded-lg border border-ink-200" style={{ height }} />
    </div>
  )
}


import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { SelectField } from '@/components/Field'
import { Alert } from '@/components/feedback'
// Import both the OCR runner and the field extractor
import { runOCR, extractOcrFields } from '@/utils/ocr' 

export default function DocumentUploader({ applicationId, orgId, onUploaded }: { applicationId: string, orgId: string, onUploaded: () => void }) {
  const [category, setCategory] = useState('government_id')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Please select a file to upload.')
      return
    }

    try {
      setUploading(true)
      setError(null)
      setOcrProgress(0)

      // 1. Run the local OCR extraction and parse fields
      let extractedText = ''
      let parsedData: { suggested_expiry: string | null; suggested_name: string | null } = { 
        suggested_expiry: null, 
        suggested_name: null 
      }

      try {
        const ocrResult = await runOCR(file, (progress) => {
          setOcrProgress(progress)
        })
        extractedText = ocrResult.text
        parsedData = extractOcrFields(extractedText) // Extract name & expiry
      } catch (ocrErr: any) {
        console.warn('OCR processing failed or skipped:', ocrErr)
        extractedText = 'OCR Extraction failed or file unreadable.'
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${applicationId}/${crypto.randomUUID()}.${fileExt}`

      // 2. Upload file to Supabase storage bucket 'documents'
      const { error: storageError } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (storageError) throw storageError

      // 3. Insert record into application_documents table WITH mime_type, size_bytes, OCR text, and parsed fields
      const { error: dbError } = await supabase
        .from('application_documents')
        .insert({
          org_id: orgId,
          application_id: applicationId,
          category,
          storage_path: fileName,
          original_filename: file.name,
          mime_type: file.type,
          size_bytes: file.size, // 👈 Added size_bytes to satisfy the not-null constraint
          ocr_extracted_text: extractedText,
          suggested_name: parsedData.suggested_name,
          suggested_expiry: parsedData.suggested_expiry,
          review_status: 'pending'
        })

      if (dbError) throw dbError

      setSuccess(true)
      setFile(null)
      setOcrProgress(0)
      onUploaded()
    } catch (err: any) {
      setError(err.message || 'Failed to upload document.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-bold text-navy-900">Upload Required Document</h3>
      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">Document uploaded and processed successfully!</Alert>}

      <SelectField 
        label="Document Type" 
        value={category} 
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="government_id">Government Issued ID (National ID, Driver's License, International Passport)</option>
        <option value="proof_of_address">Proof of Address (Utility Bill)</option>
        <option value="bank_statement">Bank Statement (Last 3-6 Months)</option>
        <option value="payslip">Payslip / Income Proof</option>
        <option value="other">Other Supporting Document</option>
      </SelectField>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Select File (PDF, JPG, PNG)</label>
        <input 
          type="file" 
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
        />
      </div>

      {/* Progress Indicator for OCR Processing */}
      {uploading && ocrProgress > 0 && ocrProgress < 100 && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-medium text-emerald-700">
            <span>Scanning document (OCR)...</span>
            <span>{ocrProgress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300 ease-out"
              style={{ width: `${ocrProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" loading={uploading} className="text-xs">
          {uploading ? 'Processing...' : 'Upload Document'}
        </Button>
      </div>
    </form>
  )
}
import Tesseract from 'tesseract.js'
import * as pdfjsLib from 'pdfjs-dist'

// Initialize the PDF.js worker from a public CDN to avoid complex local bundler configurations
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

const MAX_PDF_PAGES = 3

/**
 * Pre-processes an image file via Canvas to improve OCR accuracy (greyscale + contrast stretch).
 */
async function preprocessImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Failed to get canvas context'))
      
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      
      // Convert to greyscale and increase contrast
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
        const contrast = avg < 128 ? avg * 0.8 : Math.min(255, avg * 1.2)
        data[i] = contrast     // R
        data[i + 1] = contrast // G
        data[i + 2] = contrast // B
      }
      
      ctx.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.onerror = () => reject(new Error('Failed to load image for processing'))
    img.src = url
  })
}

/**
 * Converts the first few pages of a PDF into high-res images for Tesseract.
 */
async function extractImagesFromPdf(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const numPages = Math.min(pdf.numPages, MAX_PDF_PAGES)
  const images: string[] = []

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 2.0 }) // Scale up for better OCR resolution
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) continue
    
    canvas.width = viewport.width
    canvas.height = viewport.height
    
    await page.render({ canvasContext: ctx, viewport, canvas }).promise
    images.push(canvas.toDataURL('image/jpeg', 0.9))
  }
  
  return images
}

export async function runOCR(file: File, onProgress?: (progress: number) => void): Promise<{ text: string; confidence: number }> {
  try {
    let imagesToProcess: string[] = []

    if (file.type === 'application/pdf') {
      imagesToProcess = await extractImagesFromPdf(file)
    } else if (file.type.startsWith('image/')) {
      const processed = await preprocessImage(file)
      imagesToProcess = [processed]
    } else {
      throw new Error('Unsupported file type for OCR.')
    }

    if (imagesToProcess.length === 0) {
      throw new Error('No readable content extracted from file.')
    }

    let fullText = ''
    let totalConfidence = 0

    // Initialize Tesseract worker
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m: any) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100))
        }
      }
    })

    for (const image of imagesToProcess) {
      const { data } = await worker.recognize(image)
      fullText += data.text + '\n\n'
      totalConfidence += data.confidence
    }

    await worker.terminate()

    return {
      text: fullText.trim(),
      confidence: totalConfidence / imagesToProcess.length
    }
  } catch (error: any) {
    console.error('OCR Error:', error)
    throw new Error(error.message || 'Failed to process document.')
  }
}
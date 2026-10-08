import fs from 'fs'
import path from 'path'
import mammoth from 'mammoth'

const docsDir = 'C:\\Users\\lenovo\\Downloads\\docs\\docs'

async function inspectAll() {
  const files = fs.readdirSync(docsDir).filter((f) => f.endsWith('.docx'))
  console.log(`Found ${files.length} docx files in ${docsDir}:\n`)

  for (const file of files) {
    const filePath = path.join(docsDir, file)
    const result = await mammoth.extractRawText({ path: filePath })
    const text = result.value.trim()
    const htmlResult = await mammoth.convertToHtml({ path: filePath })
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)

    console.log(`========================================`)
    console.log(`FILE: ${file}`)
    console.log(`Total non-empty paragraphs: ${lines.length}`)
    console.log(`First line: ${lines[0]}`)
    console.log(`Second line: ${lines[1] || ''}`)
    console.log(`Sample content (first 300 chars):`)
    console.log(text.substring(0, 300) + '...')
    console.log(`========================================\n`)
  }
}

inspectAll().catch(console.error)

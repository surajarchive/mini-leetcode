import express from 'express'
import evaluateCode, { type Submission } from './test'

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.post('/api/evaluate', async (req, res) => {
  const submission: Submission = req.body
  try {
    const result = await evaluateCode(submission)
    if (!result) {
      return res.status(500).json({ error: 'Evaluation failed' })
    }
    return res.json(result)
  } catch (err: any) {
    console.error('Evaluation error:', err)
    return res.status(500).json({ error: err.message })
  }
})

const PORT = 4000
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})

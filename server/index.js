import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

const app = express()
app.use(cors())
app.use(express.json({ limit: '25mb' }))

const {
  AWS_REGION,
  S3_BUCKET,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  PORT = 5000,
  DYNAMO_TABLE,
} = process.env

if (!AWS_REGION || !S3_BUCKET) {
  console.warn('Missing AWS_REGION or S3_BUCKET. Please configure your .env file.')
}

const awsCredentials = AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY ? {
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
} : undefined

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: awsCredentials,
})

const dynamoClient = DYNAMO_TABLE ? DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: AWS_REGION, credentials: awsCredentials }),
  {
    marshallOptions: { removeUndefinedValues: true },
  }
) : null

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/upload-url', async (req, res) => {
  const { fileName, fileType } = req.body || {}
  if (!fileName || !fileType) {
    return res.status(400).json({ error: 'fileName and fileType are required' })
  }

  try {
    const safeName = fileName.replace(/[^a-zA-Z0-9.-_]/g, '_')
    const key = `uploads/${Date.now()}-${safeName}`

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: fileType,
    })

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 })
    const fileUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`

    res.json({ uploadUrl, fileUrl, key })
  } catch (error) {
    console.error('Error creating presigned URL', error)
    res.status(500).json({ error: 'Failed to create upload URL' })
  }
})

app.get('/api/documents', async (req, res) => {
  if (!dynamoClient || !DYNAMO_TABLE) {
    return res.status(500).json({ error: 'DynamoDB is not configured' })
  }

  const { id, key } = req.query
  if (!id && !key) {
    return res.status(400).json({ error: 'id or key query parameter is required' })
  }

  try {
    let item = null

    if (id) {
      const response = await dynamoClient.send(new GetCommand({
        TableName: DYNAMO_TABLE,
        Key: { DocumentId: id },
      }))
      item = response.Item || null
    } else if (key) {
      const normalized = normalizeS3Identifier(String(key))
      const scan = await dynamoClient.send(new ScanCommand({
        TableName: DYNAMO_TABLE,
        FilterExpression: 'contains(#file, :value)',
        ExpressionAttributeNames: { '#file': 'S3File' },
        ExpressionAttributeValues: { ':value': normalized },
        Limit: 25,
      }))
      item = scan.Items && scan.Items.length ? scan.Items[0] : null
    }

    if (!item) {
      return res.status(404).json({ error: 'Document not found' })
    }

    res.json({ document: item })
  } catch (error) {
    console.error('Error retrieving document from DynamoDB', error)
    res.status(500).json({ error: 'Failed to retrieve document' })
  }
})

app.listen(PORT, () => {
  console.log(`Upload service running on port ${PORT}`)
})

function normalizeS3Identifier(input = '') {
  if (!input) return ''

  let value = input
  try {
    value = decodeURIComponent(value)
  } catch (err) {
    // ignore malformed URI sequences
  }

  if (value.startsWith('s3://')) return value
  const trimmed = value.replace(/^\/+/, '')
  if (!trimmed) return ''
  if (trimmed.startsWith(`${S3_BUCKET}/`)) {
    return `s3://${trimmed}`
  }
  return `s3://${S3_BUCKET}/${trimmed}`
}


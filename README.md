# Medical Coding UI

This project includes a React-based front end and a Node.js upload service that generates presigned URLs for Amazon S3 and reads extraction results from DynamoDB. Uploaded documents are streamed straight into your `medical-coding-files` bucket in `us-east-1`, and the Results view surfaces ICD entities stored by the downstream AWS pipeline.

## Environment Setup

1. Duplicate `.env.example` to `.env` in the repository root.
2. Fill in your AWS credentials and resources:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION` (defaults to `us-east-1`)
   - `S3_BUCKET` (defaults to `medical-coding-files`)
   - `DYNAMO_TABLE` (defaults to `MedicalDocuments`)
   - `PORT` (optional, defaults to `5000`)

> **Where to change bucket/region/table:** only update the entries inside `.env`. The backend reads configuration exclusively from those variables, so no code changes are required when you point to another bucket, region, or DynamoDB table.

Ensure the IAM principal you use has:
- `s3:PutObject` (and any necessary ACL permissions) on the S3 bucket
- `dynamodb:GetItem` and `dynamodb:Scan` on the medical documents table

## Install Dependencies

```bash
npm install
npm install --prefix server
```

## Running Locally

1. Start the upload/results service:
   ```bash
   npm run server:dev
   ```
   This runs `server/index.js` with nodemon on port `5000` and exposes:
   - `POST /api/upload-url` for presigned uploads
   - `GET /api/documents?id=...` or `GET /api/documents?key=...` to read DynamoDB entries

2. In a separate terminal, start the React dev server:
   ```bash
   npm run dev
   ```

Vite proxies any `/api/*` calls to the Node service, so the front end can reach the backend during development.

## Upload & Results Flow

1. The Upload page requests a presigned S3 URL for each file, streams the file directly to S3 with live progress, and forwards the uploaded file metadata to the Processing view.
2. The Processing screen polls DynamoDB using the uploaded S3 key until your Lambda/Comprehend pipeline writes a `MedicalDocuments` item. Once found, the structured record is passed to the Results page.
3. The Results page renders actual Comprehend Medical `ICDEntities` (code, description, confidence, and source text). CPT slots remain available for manual entry if your pipeline does not populate them.

Any errors surfaced by S3, the upload API, or DynamoDB are shown inline so you can retry.

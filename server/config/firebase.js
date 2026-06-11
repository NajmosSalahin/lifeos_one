import { initializeApp, applicationDefault, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync, existsSync } from 'fs'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../../.env') })

let app
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH

if (serviceAccountPath && existsSync(resolve(__dirname, '../../', serviceAccountPath))) {
  const serviceAccount = JSON.parse(readFileSync(resolve(__dirname, '../../', serviceAccountPath), 'utf8'))
  app = initializeApp({ credential: cert(serviceAccount) })
} else {
  app = initializeApp({ credential: applicationDefault() })
}

export const adminAuth = getAuth(app)
export const adminDb = getFirestore(app)

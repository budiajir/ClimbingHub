import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { headers } from 'next/headers'
import { account, db, isDatabaseConfigured, session, user, verification } from '@/lib/db'

function createAuth() {
  const secret =
    process.env.BETTER_AUTH_SECRET ||
    'jalur-local-dev-secret-minimum-32-characters'

  const trustedOrigins = Array.from(
    new Set(
      [
        'https://www.jalur.world',
        'https://jalur.world',
        'https://climbinghub.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.BETTER_AUTH_URL,
        process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
          : undefined,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
      ].filter((url): url is string => Boolean(url))
    )
  )

  return betterAuth({
    baseURL: {
      allowedHosts: [
        'jalur.world',
        'www.jalur.world',
        '*.jalur.world',
        'climbinghub.vercel.app',
        '*.vercel.app',
        'localhost:3000',
        'localhost:3001',
      ],
      fallback: 'https://www.jalur.world',
    },
    secret,
    trustedOrigins,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user,
        session,
        account,
        verification,
      },
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      minPasswordLength: 6,
    },
    user: {
      additionalFields: {
        role: {
          type: 'string',
          required: false,
          defaultValue: 'climber',
          input: true,
        },
        handle: {
          type: 'string',
          required: false,
          input: true,
        },
        gradeMax: {
          type: 'string',
          required: false,
          input: true,
        },
        ascentsCount: {
          type: 'number',
          required: false,
          defaultValue: 0,
          input: false,
        },
        hometown: {
          type: 'string',
          required: false,
          input: true,
        },
        countryOfOrigin: {
          type: 'string',
          required: false,
          input: true,
        },
      },
    },
    plugins: [nextCookies()],
  })
}

export type Auth = ReturnType<typeof createAuth>

let cachedAuth: Auth | null = null

export function getAuth(): Auth {
  if (!cachedAuth) {
    cachedAuth = createAuth()
  }
  return cachedAuth
}

export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    const instance = getAuth()
    const value = Reflect.get(instance, prop, instance)
    return typeof value === 'function' ? value.bind(instance) : value
  },
})

export async function getServerSession() {
  if (!isDatabaseConfigured()) return null
  try {
    return await getAuth().api.getSession({
      headers: await headers(),
    })
  } catch {
    return null
  }
}

import { config } from 'dotenv'
import { z } from 'zod'

// verificação se o ambiente é teste ou production
if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

// cria um esquema ZOD para validar as variáveis de ambiente
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
})

// realiza a verificação das variáveis de ambiente
const _env = envSchema.safeParse(process.env)

// se a verificação falhar, retorna erro
if (_env.success === false) {
  console.error('Invalid environment variables!', _env.error.format())

  throw new Error('Invalid environment variables!')
}

export const env = _env.data

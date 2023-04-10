import fastify from 'fastify'
import { transactionRoutes } from './routes/transactions'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)

// o segundo parâmetro é um prefixo. Sempre cairá na rota /transactions/<rota>
app.register(transactionRoutes, {
  prefix: 'transactions',
})

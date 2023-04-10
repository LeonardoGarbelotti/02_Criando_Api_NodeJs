import {
  it,
  test,
  beforeAll,
  afterAll,
  describe,
  expect,
  beforeEach,
} from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Transaction Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  // execSync é usado para executar comendos no terminal dentro da aplicação node
  // antes de CADA teste, vai zerar o banco de dados
  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  // Testar se o usuário consegue criar uma nova transação
  test('user can create a new transaction', async () => {
    // fazer a chamada HTTP p/ criar nova transação
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'NewTransaction',
        amount: 5000,
        type: 'credit',
      })
      .expect(201)
  })

  it('should be able to list all transactions', async () => {
    // cria uma transação no banco de dados
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'NewTransaction',
        amount: 5000,
        type: 'credit',
      })

    // cria uma variável para armazenar o valor do cookie
    const cookies = createTransactionResponse.get('Set-Cookie')

    // realiza e testa a listagem de transações
    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    // testa se os valores recebidos no body da listagem estão de acordo
    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'NewTransaction',
        amount: 5000,
      }),
    ])
  })

  it('should be able to get a specific transaction', async () => {
    // cria uma transação no banco de dados
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'NewTransaction',
        amount: 5000,
        type: 'credit',
      })

    // cria uma variável para armazenar o valor do cookie
    const cookies = createTransactionResponse.get('Set-Cookie')

    // realiza e testa a listagem de transações
    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    // armazena o ID da primeira transação
    const transactionId = listTransactionsResponse.body.transactions[0].id

    // testa a rota passando o ID como parâmetro
    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)

    // testa se os valores recebidos no body da listagem estão de acordo
    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'NewTransaction',
        amount: 5000,
      }),
    )
  })

  it('should be able to get the summary', async () => {
    // cria uma transação no banco de dados
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Credit Transaction',
        amount: 5000,
        type: 'credit',
      })

    // cria uma variável para armazenar o valor do cookie
    const cookies = createTransactionResponse.get('Set-Cookie')

    // cria uma outra transação
    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Debit Transaction',
        amount: 2000,
        type: 'debit',
      })

    // realiza e testa a listagem de transações
    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    // testa se os valores recebidos no body da listagem estão de acordo
    expect(summaryResponse.body.summary).toEqual({
      amount: 3000,
    })
  })
})

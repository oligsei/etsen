const got = require('got')

const { SOURCE_BASE_URL, SOURCE_SESSION_KEY } = process.env

const source = got.extend({ baseUrl: SOURCE_BASE_URL })

function * getBalanceFields (html) {
  const rowMatcher = new RegExp(/<th>(.*):<\/th><td>(-?\d+,\d.) .*<\/td>/, 'gm')

  do {
    const match = rowMatcher.exec(html)

    if (match === null) {
      return
    }

    const [, field, raw] = match
    const value = parseFloat(raw.split(',').join('.'))

    yield [
      field,
      value === 0 ? 0 : value // remove signed zero
    ]
  } while (true)
}

async function readBalance (clientId, sessionId) {
  const options = {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Cookie': `${SOURCE_SESSION_KEY}=${sessionId}`
    }
  }

  const response = await source.post(`/neste-card-extranet/balance-details/${clientId}`, options)
  const [, { output: html }] = JSON.parse(response.body)

  return [...getBalanceFields(html)]
}

module.exports = {
  readBalance
}
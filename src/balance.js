const got = require('got')

const { SOURCE_BASE_URL, SOURCE_SESSION_KEY } = process.env

const source = got.extend({ baseUrl: SOURCE_BASE_URL })

function * getBalanceFields (html) {
  const rowMatcher = new RegExp(/<th>(.*):<\/th><td>(-?\d+,\d.) .*<\/td>/, 'gm')
  let match = rowMatcher.exec(html)

  while (match !== null) {
    const field = match[1]
    const value = parseFloat(match[2].split(',').join('.'))

    yield [
      field,
      value === 0 ? 0 : value // remove signed zero
    ]

    match = rowMatcher.exec(html)
  }
}

async function readBalance (clientId, sessionId) {
  const options = {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Cookie': `${SOURCE_SESSION_KEY}=${sessionId}`
    }
  }

  try {
    const response = await source.post(`/neste-card-extranet/balance-details/${clientId}`, options)
    const [, { output: html }] = JSON.parse(response.body)

    return [...getBalanceFields(html)]
  } catch (error) {
    console.error('not ok', error)
  }

  return []
}

module.exports = {
  readBalance
}
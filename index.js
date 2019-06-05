const { getSessionId } = require('./src/session')
const { readBalance } = require('./src/balance')

const { SOURCE_BALANCE_ID, SOURCE_CLIENT_USERNAME, SOURCE_CLIENT_PASSWORD } = process.env

async function main ({ clientId: balanceId, username, password }) {
  // fixme: it takes forever to retrieve sessionId, so we need to cache it :(

  const sessionId = await getSessionId(username, password)
  const balance = await readBalance(balanceId, sessionId)

  console.table(balance)
}

main({
  balanceId: SOURCE_BALANCE_ID,
  username: SOURCE_CLIENT_USERNAME,
  password: SOURCE_CLIENT_PASSWORD
})

const got = require('got')
const { CookieJar } = require('tough-cookie')

const { SOURCE_BASE_URL, SOURCE_SESSION_KEY } = process.env

const source = got.extend({ baseUrl: SOURCE_BASE_URL })

async function getOAuthCode (url, cookieJar, { username, password }) {
  try {
    await got.post(
      url.replace('view', 'submit'),
      {
        cookieJar,
        body: `username=${username}&password=${password}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
  } catch (error) {
    if (error.statusCode !== 302) {
      // rethrow everything except `Found`
      throw error
    }
  }

  const codeMatcher = new RegExp(/<input type="hidden" name="code" value="(.*)"/, 'm')
  const { body } = await got.get(url, { cookieJar })

  const [, code] = codeMatcher.exec(body)

  return code
}

async function getSessionId (username, password) {
  const cookieJar = new CookieJar()

  const { url } = await source.get('/login_neste?dest=self-service', { cookieJar })

  const code = await getOAuthCode(url, cookieJar, { username, password })

  await source.get(`/oauth/authorized2/2?code=${code}`, { cookieJar })

  const [{ value: sessionId }] = cookieJar.getCookiesSync(SOURCE_BASE_URL, SOURCE_SESSION_KEY)

  return sessionId
}

module.exports = {
  getSessionId
}

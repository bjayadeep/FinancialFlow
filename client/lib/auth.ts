const accessTokenKey = "financeflow_access_token"
const refreshTokenKey = "financeflow_refresh_token"

const isBrowser = () => typeof window !== "undefined"

export const saveTokens = (accessToken: string, refreshToken: string) => {
  if (!isBrowser()) {
    return
  }

  localStorage.setItem(accessTokenKey, accessToken)
  localStorage.setItem(refreshTokenKey, refreshToken)
}

export const getAccessToken = (): string | null => {
  if (!isBrowser()) {
    return null
  }

  return localStorage.getItem(accessTokenKey)
}

export const getRefreshToken = (): string | null => {
  if (!isBrowser()) {
    return null
  }

  return localStorage.getItem(refreshTokenKey)
}

export const saveAccessToken = (accessToken: string) => {
  if (!isBrowser()) {
    return
  }

  localStorage.setItem(accessTokenKey, accessToken)
}

export const clearTokens = () => {
  if (!isBrowser()) {
    return
  }

  localStorage.removeItem(accessTokenKey)
  localStorage.removeItem(refreshTokenKey)
}

export const isLoggedIn = () => Boolean(getAccessToken())

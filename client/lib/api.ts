import { clearTokens, getAccessToken, getRefreshToken, saveAccessToken } from "@/lib/auth"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

type RequestBody = unknown

interface ApiErrorResponse {
  error?: string
}

interface RefreshTokenResponse {
  data: {
    accessToken: string
  }
}

const redirectToLogin = () => {
  if (typeof window !== "undefined") {
    clearTokens()
    window.location.href = "/login"
  }
}

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    return null
  }

  try {
    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      return null
    }

    const responseBody = (await response.json()) as RefreshTokenResponse
    saveAccessToken(responseBody.data.accessToken)

    return responseBody.data.accessToken
  } catch {
    return null
  }
}

const request = async <T>(
  path: string,
  options: RequestInit = {},
  hasRetried = false,
): Promise<T> => {
  const token = getAccessToken()
  const headers = new Headers(options.headers)
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData

  if (!headers.has("Content-Type") && options.body && !isFormData) {
    headers.set("Content-Type", "application/json")
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    if (!hasRetried && path !== "/api/auth/refresh") {
      const newAccessToken = await refreshAccessToken()

      if (newAccessToken) {
        return request<T>(
          path,
          {
            ...options,
            headers: {
              ...Object.fromEntries(headers.entries()),
              Authorization: `Bearer ${newAccessToken}`,
            },
          },
          true,
        )
      }
    }

    redirectToLogin()
    throw new Error("Your session has expired")
  }

  if (!response.ok) {
    let errorMessage = "Something went wrong"

    try {
      const errorBody = (await response.json()) as ApiErrorResponse
      errorMessage = errorBody.error || errorMessage
    } catch {
      errorMessage = response.statusText || errorMessage
    }

    throw new Error(errorMessage)
  }

  return (await response.json()) as T
}

export const get = <T>(path: string) => request<T>(path)

export const post = <T>(path: string, body: RequestBody) =>
  request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  })

export const postForm = <T>(path: string, body: FormData) =>
  request<T>(path, {
    method: "POST",
    body,
  })

export const put = <T>(path: string, body: RequestBody) =>
  request<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
  })

export const del = <T>(path: string) =>
  request<T>(path, {
    method: "DELETE",
  })

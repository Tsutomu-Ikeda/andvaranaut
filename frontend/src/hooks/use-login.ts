import { useEffect, useRef, useState } from "react"

export const useLogin = () => {
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const isInitialized = useRef(false)
  // localStorageからstateを取得する。デフォルト値はランダムな10文字の文字列
  const state = localStorage.getItem("state") || Math.random().toString(36).slice(-10)

  const refreshToken = async () => {
    try {
      setIsAuthLoading(true)

      const accessToken = await fetch("/api/authenticate", { method: 'post' }).then((resp) => {
        if (!resp.ok) throw new Error(resp.statusText)
        const accessToken = resp.json().then((data) => data.access_token)

        if (!accessToken) throw new Error("No access token")

        return accessToken
      })

      localStorage.removeItem("state")

      setToken(accessToken)
      setIsAuthenticated(true)
    } finally {
      setIsAuthLoading(false)
    }
  }


  useEffect(() => {
    if (isInitialized.current) return

    isInitialized.current = true

    localStorage.setItem("state", state)

    if (window.location.pathname == "/login") {
      try {
        const code = new URLSearchParams(window.location.search.slice(1)).get('code');
        if (code) {
          (async () => {
            const accessToken = await fetch(`/api/authenticate?${new URLSearchParams({ code, state })}`, { method: 'post' }).then((resp) => {
              if (!resp.ok) throw new Error(resp.statusText)
              const accessToken = resp.json().then((data) => data.access_token)

              if (!accessToken) throw new Error("No access token")

              return accessToken
            })

            setToken(accessToken)
            setIsAuthenticated(true)
            setTimeout(() => {
              window.location.replace("/")
            });
          })()
        }
      } finally {
        setIsAuthLoading(false)
      }
    } else {
      refreshToken()
    }
  })

  return { isAuthLoading, isAuthenticated, token, refreshToken, state }
}

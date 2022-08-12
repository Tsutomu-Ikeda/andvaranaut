import { useEffect, useState } from "react"

export const useLogin = () => {
  const [token, setToken] = useState<string>(localStorage.getItem("token") ?? '')
  useEffect(() => {
    if (window.location.pathname == "/login") {
      const token = new URLSearchParams(window.location.hash.slice(1)).get('id_token');
      if (token) {
        localStorage.setItem("token", token)
        setToken(token)
      }
      setTimeout(() => {
        window.location.replace("/")
      });
    }
  })

  return { token }
}

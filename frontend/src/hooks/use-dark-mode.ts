import { useEffect, useState } from "react"

export const useDarkMode = () => {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const update = () => { setDark(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) }
    update();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener("change", update)
    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener("change", update)
    }
  });

  return { dark }
}

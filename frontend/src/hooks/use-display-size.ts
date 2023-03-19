import { useEffect, useState } from "react"

export const useDisplaySize = () => {
  const mediaQuery = '(min-width: 880px)'
  const [displaySize, setDisplaySize] = useState<"pc" | "sp">("pc");

  useEffect(() => {
    const update = () => { setDisplaySize(window.matchMedia && window.matchMedia(mediaQuery).matches ? "pc" : 'sp') }
    update();
    window.matchMedia(mediaQuery).addEventListener("change", update)
    return () => {
      window.matchMedia(mediaQuery).removeEventListener("change", update)
    }
  });

  return { displaySize }
}

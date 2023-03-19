import { useEffect, useState } from "react"

export const useDisplaySize = () => {
  const mediaQuery = "(min-width: 880px)"
  const getDisplaySize = () => window.matchMedia && window.matchMedia(mediaQuery).matches ? "pc" : "sp"
  const [displaySize, setDisplaySize] = useState<"pc" | "sp">(getDisplaySize());

  useEffect(() => {
    const update = () => { setDisplaySize(getDisplaySize()) }
    update();
    window.matchMedia(mediaQuery).addEventListener("change", update)
    return () => {
      window.matchMedia(mediaQuery).removeEventListener("change", update)
    }
  });

  return { displaySize }
}

"use client"

import { useEffect, useRef, useCallback } from "react"
import { toast } from "sonner"

// Make the interface generic
interface AutosaveOptions<T> {
  key: string
  data: T
  delay?: number
  enabled?: boolean
  onSave?: () => void
  onError?: (error: Error) => void
}

// Make the function generic
export function useAutosave<T>({
  key,
  data,
  delay = 2000,
  enabled = true,
  onSave,
  onError
}: AutosaveOptions<T>) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = useRef<string>("")

  const saveData = useCallback(async () => {
    try {
      const serializedData = JSON.stringify(data)

      // Only save if data has actually changed
      if (serializedData === lastSavedRef.current) {
        return
      }

      localStorage.setItem(key, serializedData)
      localStorage.setItem(`${key}_timestamp`, Date.now().toString())
      lastSavedRef.current = serializedData

      onSave?.()

      // Show subtle save indicator
      toast.success("Data saved automatically", {
        duration: 1500,
        position: "bottom-right",
      })
    } catch (error) {
      console.error("Autosave failed:", error)
      onError?.(error as Error)
      toast.error("Failed to save data automatically")
    }
  }, [key, data, onSave, onError])

  useEffect(() => {
    if (!enabled || !data) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for autosave
    timeoutRef.current = setTimeout(saveData, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, delay, enabled, saveData])

  // Manual save function
  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    saveData()
  }, [saveData])

  return { forceSave }
}
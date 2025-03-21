import { useEffect, useState } from "react";
import { loadPyodide as lp } from "../pyodide";

export type LoadPyodide = typeof lp;
export type PyodideAPI = Awaited<ReturnType<LoadPyodide>>;

declare global {
  interface Window {
    loadPyodide: typeof lp;
  }
}

export async function loadPyodide() {
  if (window.loadPyodide) {
    return await window.loadPyodide();
  }

  return new Promise<PyodideAPI>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.4/full/pyodide.js";
    script.onload = async () => {
      const instance = window.loadPyodide();
      resolve(instance);
    };
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
}

export const usePyodide = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pyodide, setPyodide] = useState<PyodideAPI | null>(null);

  useEffect(() => {
    setIsLoading(true);
    loadPyodide()
      .then((instance) => {
        setPyodide(instance);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, []);

  return { isLoading, error, pyodide };
};

// this hook load pyodide after the loadpyodide function is called
export const useLoadPyodide = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const _loadPyodide = async () => {
    setIsLoading(true);
    try {
      const instance = await loadPyodide();
      setIsLoading(false);
      return instance;
    } catch (err) {
      const error = err as Error;

      if ("message" in error) {
        setError(error.message);
      } else {
        setError("An error occurred while loading Pyodide.");
      }

      setIsLoading(false);
      return null;
    }
  };

  return { isLoading, error, loadPyodide: _loadPyodide };
};

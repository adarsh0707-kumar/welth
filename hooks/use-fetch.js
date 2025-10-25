import { toast } from "sonner"

const { useState } = require("react");

/**
 * Custom React hook for fetching data asynchronously with built-in loading and error handling.
 *
 * @template T
 * @param {(...args: any[]) => Promise<T>} cb - An asynchronous callback function that returns a promise.
 *
 * @returns {Object} An object containing the following properties:
 * @returns {T | undefined} return.data - The data returned from the asynchronous function once resolved.
 * @returns {boolean | null} return.loading - Boolean indicating if the request is in progress (`true`) or finished (`false`), initially `null`.
 * @returns {Error | null} return.error - Error object if the request fails, otherwise `null`.
 * @returns {(...args: any[]) => Promise<void>} return.fn - Function to call the asynchronous callback with optional arguments.
 *
 * @example
 * const { data, loading, error, fn } = useFetch(fetchUser);
 * 
 * useEffect(() => {
 *   fn(userId);
 * }, [userId]);
 *
 * @remarks
 * - Automatically manages `loading` and `error` state.
 * - Displays a toast notification using `sonner` if the async function throws an error.
 * - Can handle any number of arguments for the callback function.
 */

const useFetch = (cb) => {
  const [data, setData] = useState(undefined)
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)

  const fn = async (...args) => {
    setLoading(true)
    setError(null)

    try {
      const response = await cb(...args);
      setData(response)
      setError(null)
    }
    catch (err) {
      setError(err)
      toast.error(err.message)
    }
    finally {
      setLoading(false)
    }
  }

  return {data,loading,error,fn}
}

export default useFetch;

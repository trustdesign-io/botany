/**
 * Generic server action response type.
 * Use this for any server action that returns data or an error.
 */
export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

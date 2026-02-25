import type { Resolver } from "react-hook-form";
import * as yup from "yup";

/**
 * Custom yup resolver for react-hook-form (no @hookform/resolvers dependency).
 */
export function yupResolver<T extends yup.AnyObjectSchema>(
  schema: T
): Resolver<yup.InferType<T>> {
  return async (values) => {
    try {
      const validated = await schema.validate(values, { abortEarly: false });
      return { values: validated as yup.InferType<T>, errors: {} };
    } catch (err) {
      if (err instanceof yup.ValidationError && err.inner) {
        const errors: Record<string, { type: string; message: string }> = {};
        err.inner.forEach((e) => {
          if (e.path) {
            errors[e.path] = { type: "validation", message: e.message };
          }
        });
        return { values: {} as yup.InferType<T>, errors };
      }
      throw err;
    }
  };
}

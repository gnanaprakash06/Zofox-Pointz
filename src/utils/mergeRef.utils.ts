import { Ref, RefCallback, RefObject } from "react";

export const mergeRefs = <T = unknown>(
  ...refs: Array<RefObject<T> | Ref<T> | null | undefined>
): RefCallback<T> => {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null && ref.current !== undefined) {
        (ref as RefObject<T | null>).current = value;
      }
    });
  };
};

import { IField } from "../interfaces";
import { field } from "./field";

/**
 *
 */
export const date = (options: Partial<IField> = {}): PropertyDecorator => {
  return (target: object, propertyKey: string) => {
    return field({
      format: "date-time",
      type: Date,
      // SAME AS -> transform: (date) => new Date(date),
      ...options,
    })(target, propertyKey);
  };
};

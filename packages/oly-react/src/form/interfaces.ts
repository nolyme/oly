import { Class } from "oly";
import { IJsonSchema } from "oly-json";
import { Form } from "./Form";

/**
 * Define initial state of a form model.
 */
export interface IFormBuilderCreateOptions<T extends object> {

  // TODO: readonly cleanEmptyObject = [{}, null, undefined]

  /**
   * Definition with embedded json schema (@field)
   */
  type: Class<T>;

  /**
   * Initial value
   */
  value?: T;

  /**
   * Notify when form is mutate.
   */
  onChange?: (form: Form<T>) => any;
}

export interface IFormOptions<T extends object> {

  /**
   * Notify when form is mutate.
   */
  onChange?: (form: Form<T>) => any;

  /**
   * Validator function
   */
  validate: (value: any) => IFormError[] | undefined;

  /**
   * JsonSchema form Definition
   */
  schema: IJsonSchema;

  /**
   * Initial value
   */
  initial: T;
}

/**
 * Define current state of a form model.
 */
export interface IFormState<T extends object> extends IFormOptions<T> {

  /**
   * Current value
   */
  value: T;

  /**
   * Check if value !== initial.
   */
  dirty: boolean;

  /**
   * Flatten list of all errors.
   * - "id" is required
   * - "location.longitude" is required
   *
   * Null is no error.
   */
  errors: IFormError[] | undefined;
}

/**
 * Define an error item.
 */
export interface IFormError {

  /**
   * Error message of one field.
   */
  message: string;

  /**
   * Which field is on error.
   */
  field: string;

  /**
   * Kind of error. (required, minlength, pattern, ...)
   */
  type: string;
}

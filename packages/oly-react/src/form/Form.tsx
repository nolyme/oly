import { IJsonSchema } from "oly-json";
import { IFormError, IFormOptions, IFormState } from "./interfaces";

/**
 * Form model.
 * Keep the current value and function utilities.
 *
 * THIS IS NOT AN INJECTABLE! Use FormBuilder to create a new instance without pain.
 *
 * There is no embedded validator for now.
 */
export class Form<T extends object = any> {

  protected state: IFormState<T>;

  public constructor(options: IFormOptions<T>) {
    this.state = {
      ...options,
      value: options.initial,
      initial: JSON.parse(JSON.stringify(options.initial)),
      nasty: false,
      errors: options.validate(options.initial),
    };
  }

  /**
   * Get if form is currently valid.
   */
  public get valid(): boolean {
    return !this.state.errors;
  }

  /**
   * Get current value of the form.
   */
  public get value(): T {
    return this.state.value;
  }

  /**
   * Get the initial value of the form.
   */
  public get initial(): T {
    return this.state.initial;
  }

  /**
   * Get list of current errors. Return NOTHING if there is no error.
   */
  public get errors(): IFormError[] | undefined {
    return this.state.errors;
  }

  /**
   * Get if current value is not the initial value. Comparison is based on values, not refs.
   */
  public get nasty(): boolean {
    return this.state.nasty;
  }

  /**
   * Form getter. Field can be nested.
   * Return undefined if not is not defined (normal!)
   *
   * ```ts
   * form.get("my.deepest.nodes[0].id")
   * ```
   */
  public get<V = any>(field: string): V | undefined {

    // check if state is empty (initialized only)
    if (this.state.value == null) {
      return;
    }

    const paths: string[] = this.createPaths(field);
    const node: string = paths[paths.length - 1];
    const parents: string[] = paths.slice(0, paths.length - 1);

    let cursor = this.state.value;
    for (const path of parents) {
      if (cursor[path] == null) {
        return;
      }
      cursor = cursor[path];
    }

    if (!cursor || cursor[node] == null) {
      return;
    }

    return cursor[node];
  }

  /**
   * Form setter. With JsonPath like functionalities.
   * Trigger a state mutation.
   *
   * ```ts
   * form.set("location.longitude", 10);
   * ```
   *
   * Extract value from event.
   *
   * @param {string} field
   * @param ev                Event or value
   */
  public set(field: string | T, ev?: any) {

    if (typeof field === "string") {
      const paths = this.createPaths(field);
      const node = paths[paths.length - 1];
      const parents = paths.slice(0, paths.length - 1);
      const value = JSON.parse(JSON.stringify(this.state.value || {}));

      let cursor = value;
      for (const path of parents) {
        cursor[path] = cursor[path] || {};
        cursor = cursor[path];
      }

      cursor[node] = ev && ev.target ? ev.target.value : ev;

      return this.commit(value);

    } else if (typeof field === "object") {

      return this.commit(field);
    }

    return null;
  }

  /**
   * JsonSchema getter.
   *
   * @param {string} field
   * @param {boolean} parent      Get the parent instead. Useful to access local prop like `required`.
   */
  public schema(field: string, parent: boolean = false): IJsonSchema | null {

    const paths = this.createPaths(field);
    const node = paths[paths.length - 1];
    const parents = paths.slice(0, paths.length - 1);

    let schema = this.state.schema;

    for (const path of parents) {
      if (!isNaN(path as any) && schema.items) {
        schema = schema.items;
      } else {
        schema = schema.properties![path];
      }
    }

    if (parent) {
      return schema;
    }

    if (schema) {
      if (!isNaN(node as any) && schema.items) {
        return schema.items;
      } else if (schema.properties) {
        return schema.properties[node];
      }
    }

    return null;
  }

  /**
   * IsRequired getter.
   * Check if the given field is mandatory.
   *
   * @param {string} field
   * @returns {string[]|boolean}
   */
  public required(field: string): boolean {

    const schema = this.schema(field, true);

    return !!schema && !!schema.required && schema.required.indexOf(field) > -1;
  }

  /**
   * Error getter.
   * Get the error message of the given field. return nothing if no error.
   *
   * @param {string} field
   */
  public error(field: string): string | undefined {

    if (!this.state.errors) {
      return;
    }

    const error = this.state.errors.filter((e) => e.field === field)[0];
    if (!error) {
      return;
    }

    return error.message;
  }

  /**
   * It's like #errors, but returns ALL errors of the parent AND child elements.
   *
   * @param {string} field
   */
  public allErrors(field: string): string[] {

    if (!this.state.errors) {
      return [];
    }

    return this.state.errors
      .filter((e) => e.field.indexOf(field) === 0)
      .map((e) => e.message);
  }

  /**
   * Reset form.
   * Commit the initial value.
   * You can also specify a new initial value.
   */
  public reset(newValue?: any): void {
    this.state.initial = typeof newValue === "undefined"
      ? this.state.initial
      : newValue;

    this.commit(this.state.initial);
  }

  /**
   * Update the state a new state with the new given value.
   * Commit ALWAYS create a new state, even if old and new value are the same.
   *
   * @param value
   * @returns {any}
   */
  public commit(value: any): any {

    const newValue = this.clone(this.removeEmptyFields(value));

    this.state = {
      ...this.state,
      value: newValue,
      nasty: JSON.stringify(this.state.initial) !== JSON.stringify(newValue),
      errors: this.state.validate(newValue),
    };

    if (typeof this.state.onChange === "function") {
      this.state.onChange(this);
    }
  }

  /**
   * Deep clone object.
   */
  protected clone(obj: T): T {

    if (typeof obj === "object") {
      return JSON.parse(JSON.stringify(obj));
    }

    return obj;
  }

  /**
   * Clean up object.
   * This is called on each #set().
   * With this function, we don't need to manually erase key/empty data.
   *
   * @param target
   */
  protected removeEmptyFields(target: any): any {

    // accept only objects/arrays
    if (typeof target !== "object" || !target) {
      return target;
    }

    // take array here
    if (Array.isArray(target)) {
      return target.map((item) => this.removeEmptyFields(item));
    }

    const keys = Object.keys(target);
    for (const key of keys) {
      target[key] = this.removeEmptyFields(target[key]);
      if (typeof target[key] === "undefined") {
        delete target[key];
      }
    }

    return Object.keys(target).length > 0
      ? target
      : undefined; // remove even the root element
  }

  /**
   * Naive basic path parser.
   *
   * a.b[0].c => "a", "b", "0", "c"
   *
   * @param {string} field
   * @returns {string[]}
   */
  protected createPaths(field: string): string[] {
    return field
      .split(/[\[\.]/)
      .map((c) => c.replace(/\]/, ""))
      .filter((c) => c != null && c !== "");
  }
}

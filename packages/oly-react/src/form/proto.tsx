import { Class, inject } from "oly-core";
import { Json } from "oly-json";
import * as React from "react";

/**
 * TODO:
 * - async
 * - custom validators
 */

export interface IFormError {
  message: string;
  field: string;
  type: string;
}

export interface IFormModelOptions<T> {
  type: Class<T>;
  value: T;
  onChange: (value: T) => any;
  onValidate: (value: T) => any[] | null;
}

export class FormModel<T> {

  public nasty: boolean = false;

  public errors: IFormError[] | null;

  public value: T;

  constructor(public options: IFormModelOptions<T>) {
    this.value = {
      ...this.options.value as any,
    };
    this.check();
  }

  public set(path: string, ev: any) {
    if (ev && ev.target && ev.target.value != null) {
      this.value[path] = ev.target.value || "";
    } else {
      this.value[path] = ev || "";
    }
    this.check();
    this.options.onChange(this.value);
    this.nasty = true;
  }

  public error(field: string) {
    if (!this.nasty) {
      return null;
    }
    if (!this.errors) {
      return null;
    }
    const dd = this.errors.filter((e) => e.field === field)[0];
    if (!dd) {
      return null;
    }
    return dd.message;
  }

  reset() {
    this.value = {
      ...this.options.value as any,
    };
    this.check();
    this.options.onChange(this.value);
    this.nasty = false;
  }

  check() {
    this.errors = this.options.onValidate(this.value);
  }

  get valid() {
    return !this.errors;
  }
}

export class FormBuilder {
  @inject json: Json;

  create<T>(options: { type: Class<T>, value: T, onChange: Function }): FormModel<T> {
    return new FormModel<T>({
      type: options.type,
      value: options.value,
      onChange: (value) => options.onChange(value),
      onValidate: (value) => {
        try {
          this.json.validate(options.type, value as any);
        } catch (e) {
          return e.errors.map((e: any) => ({
            type: e.keyword,
            field: e.dataPath.replace(".", ""),
            message: e.message,
          }));
        }
      },
    });
  }
}

import { Class, inject } from "oly-core";
import { Json } from "oly-json";
import { Form } from "./Form";
import { IFormBuilderCreateOptions, IFormError } from "./interfaces";

/**
 * FormBuilder is a tool to create Form with ease.
 * This is not mandatory as you respect the interface.
 */
export class FormBuilder<T extends object = any> {

  /**
   * Parse, Validate and extract JsonSchema.
   */
  @inject
  private json: Json;

  /**
   * Form factory, create a From with just a Type (@field).
   * JsonSchema will be extracted form metadata.
   */
  public create(options: IFormBuilderCreateOptions<T>): Form<T> {
    return new Form({
      onChange: options.onChange,
      validate: this.validateFactory(options.type),
      schema: this.json.schema(options.type),
      initial: typeof options.value === "undefined" ? {} as T : options.value,
    });
  }

  /**
   * Validate json without throwing exceptions.
   */
  protected validateFactory(type: Class) {
    return (value: any): IFormError[] | undefined => {
      try {
        this.json.validate(type, value);
      } catch (e) {
        if (e && Array.isArray(e.errors)) {
          return e.errors.map(this.mapError);
        }
        throw e;
      }
    };
  }

  /**
   * Map error to our interfaces.
   */
  protected mapError(e: any) {

    let field;

    if (e.params && e.params.missingProperty) {
      field = e.params.missingProperty;
      if (e.dataPath) {
        field = e.dataPath.replace(/^\./, "") + "." + field;
      }
    } else {
      field = e.dataPath.replace(".", "");
    }

    return {
      type: e.keyword,
      field,
      message: e.message.replace(
        // #cosmetic
        /should have required property '\w+'/,
        "should be defined",
      ),
    };
  }
}

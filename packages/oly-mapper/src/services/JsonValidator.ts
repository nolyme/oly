import * as Ajv from "ajv";
import { ValidateFunction } from "ajv";
import { IClass, inject, state } from "oly-core";
import { JsonSchemaReader } from "./JsonSchemaReader";

export class JsonValidator {

  @state()
  public ajv: Ajv.Ajv = this.createAjv();

  @state()
  protected cache: Array<[IClass, ValidateFunction]> = [];

  @inject(JsonSchemaReader)
  protected schemaReader: JsonSchemaReader;

  /**
   * Valid object based on definition.
   *
   * @param definition      Class definition
   * @param source          Json object data
   */
  public validateClass<T>(definition: IClass, source: T): T {

    const validate = this.getValidationFunction(definition);
    const valid = validate(source);

    if (!valid) {
      this.throwValidationError(validate);
    }

    return source;
  }

  /**
   * Find/Create validate function based on class definition.
   *
   * @param definition    Class definition
   * @return              Validate function
   */
  public getValidationFunction(definition: IClass): ValidateFunction {
    const func = this.cache.filter((pair) => pair[0] === definition)[0];
    if (!!func) {
      return func[1];
    }
    const schema = this.schemaReader.extractSchema(definition);
    const validate = this.ajv.compile(schema);
    this.cache.push([definition, validate]);
    return validate;
  }

  /**
   * Ajv factory.
   */
  protected createAjv(): Ajv.Ajv {
    return new Ajv({
      useDefaults: true,
    });
  }

  /**
   * Poop exception on validator error.
   *
   * @param validate
   */
  protected throwValidationError(validate: Ajv.ValidateFunction): any {
    const error: any = new Error(`Validation has failed (${this.ajv.errorsText(validate.errors)})`);
    error.status = 400;
    error.details = validate.errors;
    throw error;
  }
}

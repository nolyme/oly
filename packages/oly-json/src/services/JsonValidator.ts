import Ajv from "ajv";
import { ValidateFunction } from "ajv";
import { inject, state } from "oly";
import { ValidationException } from "../exceptions/ValidationException";
import { IField } from "../interfaces";
import { JsonSchemaReader } from "./JsonSchemaReader";

export class JsonValidator {

  @state
  public ajv: Ajv = new Ajv({
    useDefaults: true,
  });

  @state
  protected cache: [Function, ValidateFunction][] = [];

  @inject
  protected readonly schemaReader: JsonSchemaReader;

  /**
   * Valid object based on definition.
   *
   * @param definition      Class definition
   * @param source          Json object data
   */
  public validateClass<T>(definition: Function, source: T): T {

    const target = JSON.parse(JSON.stringify(source));
    const validate = this.getValidationFunction(definition);
    const valid = validate(target);

    if (!valid) {
      throw new ValidationException(this.ajv.errorsText(validate.errors as any), validate.errors || []);
    }

    return target;
  }

  /**
   * Validate a field.
   *
   * @param field     Field
   * @param source    Value
   */
  public validateField<T>(field: IField, source: T): T {

    const validate = this.ajv.compile(this.schemaReader.extractProperty(field));
    const valid = validate(source);

    if (!valid) {
      throw new ValidationException(this.ajv.errorsText(validate.errors as any), validate.errors || []);
    }

    return source;
  }

  /**
   * Find/Create validate function based on class definition.
   *
   * @param definition    Class definition
   * @return              Validate function
   */
  public getValidationFunction(definition: Function): ValidateFunction {

    const func = this.cache.filter((pair) => pair[0] === definition)[0];
    if (!!func) {
      return func[1];
    }

    // ajv already cache validators but we cache also JsonSchema
    const schema = this.schemaReader.extractSchema(definition);
    const validate = this.ajv.compile(schema);
    this.cache.push([definition, validate]);

    return validate;
  }
}

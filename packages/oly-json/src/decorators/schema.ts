import { Class, IDecorator, Meta } from "oly";
import { olyMapperKeys } from "../constants/keys";
import { IJsonSchema, ISchemaMetadata } from "../interfaces";
import { field } from "./field";

export class SchemaDecorator implements IDecorator {

  public constructor(private options: IJsonSchema | ((before: IJsonSchema) => IJsonSchema)) {
  }

  public asClass(target: Class): void {
    const meta = Meta.of({key: olyMapperKeys.schema, target}).get<ISchemaMetadata>();
    const fields = Meta.of({key: olyMapperKeys.fields, target}).get<ISchemaMetadata>();
    const transforms = ((meta && meta.target) && meta.target.transforms) || [];
    transforms.push(this.options);
    Meta.of({key: olyMapperKeys.schema, target}).set({transforms});

    //
    const types = Meta.designParamTypes(target, "$constructor");
    const names = Meta.getParamNames(target.prototype.constructor);
    for (let i = 0; i < types.length; i++) {
      if (!fields || !fields.properties[names[i]]) {
        field({type: types[i]})(target.prototype, names[i]);
      }
    }
  }
}

/**
 * Sometimes @field is not enough. <br/> @schema overrides or replaces the generated schema of a class.
 *
 * ```ts
 * &shy;@schema({
 *   name: "Toto"
 * })
 * class A {
 * }
 *
 * &shy;@schema(s => ({
 *   ...s,
 *   description: "test"
 * }))
 * class B {
 * }
 * ```
 */
export const schema = Meta.decoratorWithOptions<IJsonSchema | ((before: IJsonSchema) => IJsonSchema)>(SchemaDecorator);

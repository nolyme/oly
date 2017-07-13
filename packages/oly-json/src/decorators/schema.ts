import { IDecorator, Meta } from "oly-core";
import { olyMapperKeys } from "../constants/keys";
import { IJsonSchema, ISchemaMetadata } from "../interfaces";

export class SchemaDecorator implements IDecorator {

  public constructor(private options: IJsonSchema | ((before: IJsonSchema) => IJsonSchema)) {
  }

  public asClass(target: object): void {
    const meta = Meta.of({key: olyMapperKeys.schema, target}).get<ISchemaMetadata>();
    const transforms = ((meta && meta.target) && meta.target.transforms) || [];
    transforms.push(this.options);
    Meta.of({key: olyMapperKeys.schema, target}).set({transforms});
  }
}

/**
 *
 */
export const schema = Meta.decoratorWithOptions<IJsonSchema | ((before: IJsonSchema) => IJsonSchema)>(SchemaDecorator);
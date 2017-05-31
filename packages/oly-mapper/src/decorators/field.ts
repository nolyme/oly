import { IDecorator, Meta } from "oly-core";
import { olyMapperKeys } from "../constants/keys";
import { IField, IType } from "../interfaces";

export class FieldDecorator implements IDecorator {

  private options: Partial<IField>;

  public constructor(options: Partial<IField> | IType = {}) {
    this.options = typeof options === "function" ? {type: options} : options;
  }

  public asProperty(target: object, propertyKey: string): void {
    Meta.of({key: olyMapperKeys.fields, target, propertyKey}).set({
      name: this.options.name || propertyKey,
      required: this.options.required !== false,
      type: this.options.type || Meta.designType(target, propertyKey),
      ...this.options,
    });
  }
}

export const field = Meta.decorator<Partial<IField> | IType>(FieldDecorator);

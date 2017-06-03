import { array } from "../src/decorators/array";
import { date } from "../src/decorators/date";
import { field } from "../src/decorators/field";

export enum Status {
  ENABLED,
  DISABLED,
}

export class Address {

  @field({
    trim: false,
    upper: true,
  })
  street: string;

  @field({
    of: String,
    type: Array,
  })
  details: string[];
}

export class Person {
  @field({
    trim: true,
    upper: true,
  }) name: string;

  @date() birthdate: Date;

  @field({
    map: (value: any) => new Date(value),
  }) createdAt: Date;

  @field() size: number;

  @field() verified: boolean;

  @field() status: number;

  @array({
    of: Address,
  })
  addresses: Address[];
}

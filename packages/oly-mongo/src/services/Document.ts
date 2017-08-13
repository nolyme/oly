import { field } from "oly-json";

export class Document {

  @field({required: false})
  public _id: string;

  @field({required: false})
  public _v: number;

  public get id() {
    return this._id;
  }
}

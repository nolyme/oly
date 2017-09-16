import { field } from "oly-json";
import { IDocument } from "../interfaces";

export class Document implements IDocument {

  @field({required: false})
  public _id: string;

  @field({required: false})
  public _v: number;
}

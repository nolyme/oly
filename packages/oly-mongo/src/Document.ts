import { field } from "oly-json";
import { IDocument } from "./interfaces";

/**
 * Basic root document.
 * it's not required, you can create you own root document as you respect the IDocument interface.
 */
export abstract class Document implements IDocument {

  @field({required: false})
  public _id?: string; // tslint:disable-line

  public get id() {
    return this._id;
  }
}

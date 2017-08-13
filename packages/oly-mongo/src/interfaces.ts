import { ObjectID } from "bson";
import { IMetadata } from "oly-core";

export interface IDocument {
  _id?: string;
  _v?: number;
}

export interface IObjectDocument {
  _id?: ObjectID;
  _v?: number;
}

export interface IIndexProperty {
  unique: boolean;
}

export interface IIndexesMetadata extends IMetadata {
  properties: {
    [key: string]: IIndexProperty;
  };
}

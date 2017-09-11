import { ObjectID } from "bson";
import { IMetadata } from "oly";
import { Cursor } from "mongodb";

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
  text?: boolean;
}

export interface IIndexesMetadata extends IMetadata {
  properties: {
    [key: string]: IIndexProperty;
  };
}

export type CursorTransform = (cursor: Cursor) => Cursor;

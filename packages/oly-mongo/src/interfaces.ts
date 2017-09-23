import { ObjectID } from "bson";
import { AggregationCursor, Cursor } from "mongodb";
import { IMetadata } from "oly";

export interface IDocument {
  _id?: string;
  _v?: number;

  beforeInsert?(): Promise<void> | void;

  beforeUpdate?(): Promise<void> | void;
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
export type AggregationCursorTransform = (cursor: AggregationCursor) => AggregationCursor;

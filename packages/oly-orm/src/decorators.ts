import {
  AfterInsert,
  AfterLoad,
  AfterRemove,
  AfterUpdate,
  BeforeInsert,
  BeforeRemove,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DiscriminatorColumn,
  EmbeddableEntity,
  Embedded,
  Entity,
  EventSubscriber,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  ObjectIdColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  RelationCount,
  UpdateDateColumn,
  VersionColumn,
} from "typeorm";

export const id = PrimaryGeneratedColumn;
export const column = Column;
export const createDateColumn = CreateDateColumn;
export const discriminatorColumn = DiscriminatorColumn;
export const primaryGeneratedColumn = PrimaryGeneratedColumn;
export const primaryColumn = PrimaryColumn;
export const updateDateColumn = UpdateDateColumn;
export const versionColumn = VersionColumn;
export const objectIdColumn = ObjectIdColumn;
export const afterInsert = AfterInsert;
export const afterLoad = AfterLoad;
export const afterRemove = AfterRemove;
export const afterUpdate = AfterUpdate;
export const beforeInsert = BeforeInsert;
export const beforeRemove = BeforeRemove;
export const beforeUpdate = BeforeUpdate;
export const eventSubscriber = EventSubscriber;
export const joinColumn = JoinColumn;
export const joinTable = JoinTable;
export const manyToMany = ManyToMany;
export const manyToOne = ManyToOne;
export const oneToMany = OneToMany;
export const oneToOne = OneToOne;
export const relationCount = RelationCount;
export const index = Index;
export const embedded = Embedded;

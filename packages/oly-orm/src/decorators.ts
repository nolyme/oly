import {
  AfterLoad,
  BeforeInsert,
  Column,
  CreateDateColumn,
  EmbeddableEntity,
  Embedded,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export const primaryGeneratedColumn = PrimaryGeneratedColumn;
export const id = PrimaryGeneratedColumn;
export const column = Column;
export const entity = Entity;
export const table = Entity;
export const manyToMany = ManyToMany;
export const manyToOne = ManyToOne;
export const oneToOne = OneToOne;
export const oneToMany = OneToMany;
export const joinColumn = JoinColumn;
export const join = JoinColumn;
export const joinTable = JoinTable;
export const createDateColumn = CreateDateColumn;
export const updateDateColumn = UpdateDateColumn;
export const beforeInsert = BeforeInsert;
export const afterLoad = AfterLoad;
export const index = Index;
export const embeddableEntity = EmbeddableEntity;
export const embedded = Embedded;

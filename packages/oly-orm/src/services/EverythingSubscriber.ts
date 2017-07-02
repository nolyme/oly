import { Class, inject, Kernel, Meta } from "oly-core";
import { IFieldsMetadata, Json, olyMapperKeys } from "oly-json";
import { EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent } from "typeorm";

export class EverythingSubscriber implements EntitySubscriberInterface<any> {

  @inject
  protected kernel: Kernel;

  @inject
  protected json: Json;

  public async beforeInsert(event: InsertEvent<any>) {
    this.build(event.entity);
    await this.trigger("onBeforeInsert", event.entity);
  }

  public async beforeUpdate(event: UpdateEvent<any>) {
    this.build(event.entity);
    await this.trigger("onBeforeUpdate", event.entity);
  }

  public async beforeRemove(event: RemoveEvent<any>) {
    await this.trigger("onBeforeRemove", event.entity);
  }

  public async afterInsert(event: InsertEvent<any>) {
    await this.trigger("onAfterInsert", event.entity);
  }

  public async afterUpdate(event: UpdateEvent<any>) {
    await this.trigger("onAfterUpdate", event.entity);
  }

  public async afterRemove(event: RemoveEvent<any>) {
    await this.trigger("onAfterRemove", event.entity);
  }

  public async afterLoad(entity: any) {
    // this.build(entity);
    await this.trigger("onAfterLoad", entity);
  }

  /**
   * Forward event only on Repositories.
   *
   * @param {string} type
   * @param {Function} entity
   */
  protected async trigger(type: string, entity?: Function): Promise<any> {
    if (entity && entity.constructor) {
      for (const declaration of this.kernel["declarations"]) {
        if (declaration.instance && declaration.instance.entityType === entity.constructor) {
          return await declaration.instance[type](entity);
        }
      }
    }
  }

  /**
   * Check only if @field.
   */
  protected build(entity: object) {
    const meta = Meta
      .of({key: olyMapperKeys.fields, target: entity.constructor})
      .get<IFieldsMetadata>();
    if (meta) {
      this.json.build(entity.constructor as Class, entity);
    }
  }
}

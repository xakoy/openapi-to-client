
export interface Schema {
    discriminator: SchemaDiscriminator
}

export enum SchemaDiscriminator {
    Ref = 'SchemaRef',
    Object = 'SchemaObject',
    Array = 'SchemaArray'
}

export class SchemaArray implements Schema {
    discriminator = SchemaDiscriminator.Array;
    items: Schema

    constructor({items = <Schema>undefined}){
        this.items = items;
    }
}

export class SchemaRef implements Schema {
    key: string;
    discriminator = SchemaDiscriminator.Ref
    constructor({key = ''}){
        this.key = key;
    }
}

export class SchemaObject implements Schema {
    properties: SchemaProperty[];
    discriminator = SchemaDiscriminator.Object
}

export interface SchemaProperty {
    name: string;
    type: string;
}
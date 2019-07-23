import { Type }  from './type';

export class Component {
    name: string;
    title: string;

    properties: Property[];
}

export class Property {
    name: string;
    type: Type;
    isRequire: boolean;
}
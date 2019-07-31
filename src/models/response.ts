import { Schema } from './schema';

export class Response {
    status: number;
    description: string;
    content?: ResponseContent;
}

export interface ResponseContent {
    type: string;
    // componentKey: string;
    schema: Schema;
}

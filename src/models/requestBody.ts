import { Schema } from "./schema";

export class RequestBody {
    description: string;
    content?: RequestBodyContent;

    contentType: string;
    componentKey: string;
}

export interface RequestBodyContent {
    type: string;
    // componentKey: string;
    schema: Schema;
}

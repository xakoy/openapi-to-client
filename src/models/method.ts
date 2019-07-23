import { Response } from "./response";
import { Parameter } from "./parameter";
import { RequestBody } from './requestBody';

export class Method {
    method: string;
    parameters: Parameter[];
    responses: Response[];
    requestBody: RequestBody;

    operationId: string;
    xOperationName: string;
    xControllerName: string;
    tags: string[];
}
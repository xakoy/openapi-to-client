export type ParameterIn = "path" | "query";
export type ParameterType = "number" | "string" | "object";

export class Parameter {
    name: string;
    type: string;
    isRequired: boolean;
    in: ParameterIn;
}
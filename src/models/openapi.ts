import { Api } from "./api";
import { Component } from "./component";

export class Openapi {
    version: string;
    apis: Api[];

    components: Component[];
}
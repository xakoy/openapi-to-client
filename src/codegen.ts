import { Openapi } from "./models/openapi";
import { join } from 'path'

import apiRender from './template/api';
import componentRender from "./template/model";
import { camelCase } from "lodash";
import { format } from "prettier";

export function gen(openapi: Openapi): {
    apis: { name: string, content: string}[],
    models: { name: string, content: string}[],
} {

    // artTemplate.defaults.imports.filter = function(value) {
    //     return value.filter(item => item.)
    // }


    const result:any = {}

    result.models = openapi.components.map(item => {
        return {
            name: item.name,
            content: beautifyTsCode(componentRender(item))
        } 
    });

    result.apis = openapi.apis.map((item, index) => {
       return {
           name: camelCase(item.methodes[0].xControllerName.replace('Controller','')),
           content: beautifyTsCode(apiRender(item))
       }
    });

    return result;
}

function beautifyTsCode(code: string) {
    return format(code, { parser: "typescript", tabWidth: 4 })
}
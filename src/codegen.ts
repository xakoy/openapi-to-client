import { Openapi } from "./models/openapi";
import { join } from 'path'

import apiRender, { controllerRender } from './template/api';
import componentRender from "./template/model";
import { camelCase } from "lodash";
import { format } from "prettier";
import { Controller, ControllerMethod } from './models/controller'

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

    let controllers: Controller[] = []

    openapi.apis.forEach(a => {
        a.methodes.forEach(m => {
            let controller = controllers.find(c => c.name === m.xControllerName);
            
            const cMethod: ControllerMethod = {
                ...m,
                path: a.path
            }

            if(!controller) {
                controller = new Controller()
                controller.name = m.xControllerName;
                controller.methodes = [];
                controllers.push(controller);
            }

            controller.methodes.push(cMethod);
        })
    })

    result.apis = controllers.map((item, index) => {
        return {
            content: beautifyTsCode(controllerRender(item)),
            name: camelCase(item.name.replace('Controller','')),
        }
    });

    // result.apis = openapi.apis.map((item, index) => {
    //    return {
    //        name: camelCase(item.methodes[0].xControllerName.replace('Controller','')),
    //        content: beautifyTsCode(apiRender(item))
    //    }
    // });

    return result;
}

function beautifyTsCode(code: string) {
    return format(code, { parser: "typescript", tabWidth: 4 })
}
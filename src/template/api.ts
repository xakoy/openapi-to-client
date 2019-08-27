import { Api } from "../models/api";
import { Method } from "../models/method";
import { SchemaObject, SchemaProperty, SchemaRef, SchemaDiscriminator, SchemaArray, Schema  } from "../models/schema";
import { union } from "lodash";
import { Controller } from "../models/controller";

const methodKeywords: any = {
    'delete': 'remove'
};

function getMethodName(name: string) {
    const value = methodKeywords[name];
    return value || name;
}

function generatorResponseType(schema: Schema) {
    const result = {
        type: <string>'',
        componentKeys: <string[]>[]
    };

    switch (schema.discriminator) {
        case SchemaDiscriminator.Ref:
            const responseComponentKey = (schema as SchemaRef).key.substring('#/components/schemas/'.length);
            result.componentKeys.push(responseComponentKey);
            result.type = responseComponentKey;
            break;
        case SchemaDiscriminator.Object:
            result.type =`{ ${(schema as SchemaObject).properties.map(generatorRequestSchemaObject).join(',')}}`;
            break;
        case SchemaDiscriminator.Array:
            const arrayResult = generatorResponseType((schema as SchemaArray).items);
            result.componentKeys.push(...arrayResult.componentKeys);
            result.type = `${arrayResult.type}[]`
            break;
        default:
            // throw new Error(`没有实现 Schema Type, ${schema.discriminator}`)
            result.type = 'any';
            break;
    }

    return result;
}

function generatorRequestSchemaObject(prop: SchemaProperty){
    let type = ''

    switch(prop.type){
        case 'object':
            type = 'any'
            break;
        case 'array':
            type = 'any[]'
            break;
        default:
            type = prop.type
            break;
    }
    return `${prop.name}: ${type}`
}

function generator(method: Method, apiPath: string) {
    let importComponents: string[] = []
    const inPathParameters = method.parameters? method.parameters.filter(p => p.in === 'path'): []
    let componentKey = method.requestBody ? method.requestBody.componentKey: null;
    if(componentKey) {
        componentKey = componentKey.substring('#/components/schemas/'.length)
    }

    if(componentKey){
        importComponents.push(componentKey)
    }

    let requestBodyType = method.requestBody ? generatorResponseType(method.requestBody.content.schema) : undefined;

    if(requestBodyType){
        importComponents.push(...requestBodyType.componentKeys);
    }

    const response = method.responses[0];
    let responseResultType = response.content ? generatorResponseType(response.content.schema) : undefined;
    if(responseResultType){
        importComponents.push(...responseResultType.componentKeys);
    }

    let content = `
export async function ${getMethodName(method.xOperationName)}(
    ${inPathParameters.map(p => {
        return `${p.name}: ${p.type},`
    })}
    ${!requestBodyType ? '': `data: ${requestBodyType.type}`}
) {
    const url = ${inPathParameters.length == 0? `'${apiPath}'`: `formatUrl('${apiPath}', {${inPathParameters.map(p => p.name).join(', ')}})`};

    return request<${responseResultType?responseResultType.type: 'any'}>(url, {
        method: '${method.method}',
        ${!requestBodyType? '' : 'data: data'}
    })
}

`

    return {
        content,
        importComponents,
        xControllerName: method.xControllerName
    }
}


export default function(data: Api): string {

    let methods = data.methodes.map(m => generator(m, data.path));
    const methodConents = methods.map(m => m.content).reduce((prev, current) => {
        return prev + current
    },'')

    let components = <string[]>[];
    methods.map(m => m.importComponents).filter(m => m.length > 0).forEach(m => components.push(...m));
    const dd = union(components)

    const importComponents = union(dd).join(', ')
                                    
    let content = `
${importComponents?`import { ${importComponents} } from './model';\r\n`: ''}import { formatUrl, request } from './base';

${methodConents}
`;

    return content;
}


export function controllerRender(data: Controller): string {
    let methods = data.methodes.map(m => generator(m, m.path));
    const methodConents = methods.map(m => m.content).reduce((prev, current) => {
        return prev + current
    },'')

    let components = <string[]>[];
    methods.map(m => m.importComponents).filter(m => m.length > 0).forEach(m => components.push(...m));
    const dd = union(components)

    const importComponents = union(dd).join(', ')
                                    
    let content = `
${importComponents?`import { ${importComponents} } from './model';\r\n`: ''}import { formatUrl, request } from './base';

${methodConents}
`;

    return content;
}
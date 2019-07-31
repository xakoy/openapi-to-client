import { Openapi } from "./models/openapi";
import { Component, Property } from "./models/component";
import { Api } from "./models/api";
import { Method } from "./models/method";
import { Parameter } from "./models/parameter";
import { RequestBody, RequestBodyContent } from "./models/requestBody";
import { SchemaRef, SchemaObject, SchemaProperty, SchemaArray, Schema } from "./models/schema";
import { Response, ResponseContent } from "./models/response";

export function parse(obj: any): Openapi {

    const { paths }: { paths: JSON} = obj

    const openapi =  new Openapi();

    openapi.version = obj.openapi;
    openapi.components = parseComponents(obj.components.schemas);
    openapi.apis = parseApis.call(openapi, paths);

    return openapi;
}

function parseApis(this: Openapi, apiObj: any): Api[] {
    return Object.keys(apiObj).map(key => {
        return parseApi.call(this, key, apiObj[key]);
    })
}

function parseApi(this: Openapi, name: string, obj: any): Api {
    const api = new Api();

    api.path = name;
    api.methodes = Object.keys(obj).map(key => {
        return parseMethod.call(this, key, obj[key]);
    })


    return api;
}

function parseMethod(this: Openapi, name: string, obj: any) : Method {
    const { parameters, requestBody, responses } = obj;

    const method = new Method();

    method.method = name;
    method.operationId = obj.operationId;
    method.xControllerName = obj['x-controller-name'];
    method.xOperationName = obj["x-operation-name"];
    method.tags = obj["tags"];

    method.parameters = parameters && parameters.map(parseMethodParameter);
    method.requestBody = parseMethodRequestBody.call(this, requestBody);
    method.responses = parseMethodResponses(responses);

    return method;
}

function parseMethodResponses(responses: any): Response[] {
    return Object.keys(responses).map((key) => {
        const rp = responses[key];
        const { description, content } = rp;

        const response: Response = {
            status: Number(key),
            description: description
        };

        if(content) {
            const keys = Object.keys(content);
            const contentType = keys[0];
            const contentValue = content[contentType];

            response.content = <ResponseContent>{
                type: contentType,
                schema: parseSchema(contentValue.schema)
            };
        }

        return response;
    })

}

function parseSchema(obj: any): Schema {
    const { $ref, type } = obj

    if($ref) {
        return new SchemaRef({ key: $ref})
    }

    switch(type) {
        case "object":
            return parseSchemaObject(obj)
            break;
        case "array":
            return new SchemaArray({ items: parseSchema(obj.items)})
            break;
        default:
            throw new Error('未识别的Schema类型，请添加类型解析')
    }
}

function parseSchemaObject(obj: any) : SchemaObject {
    const { properties } = obj

    const schema = new SchemaObject();

    schema.properties = Object.keys(properties).map(key => {
        const value = properties[key];

        return <SchemaProperty>{
            name: key,
            type: value.type
        }
    })

    return schema;
}

function parseMethodRequestBody(this: Openapi, requestBodyObj: any): RequestBody {
    if(requestBodyObj == undefined) {
        return null;
    }
    const { content,description } = requestBodyObj;
    
    const body = new RequestBody();
    body.description = description
    // body.contentType = contentType;
    // body.componentKey = content[contentType].schema.$ref;

    if(content) {
        const keys = Object.keys(content);
        const contentType = keys[0];
        const contentValue = content[contentType];

        body.content = <RequestBodyContent>{
            type: contentType,
            schema: parseSchema(contentValue.schema)
        };
    }

    return body;
}

function parseMethodParameter(parameterObj: any): Parameter {
    const parameter = new Parameter();

    parameter.type = parameterObj.schema.type;
    parameter.in = parameterObj.in;
    parameter.isRequired = parameterObj.required;
    parameter.name = parameterObj.name;

    return parameter;
}

function parseComponents(componentsObj: any): Component[] {
    if(componentsObj == undefined) {
        return []
    }

    return Object.keys(componentsObj).map(key => {
        return parseComponent(key, componentsObj[key])
    })
}

function parseComponent(name: string, obj: any): Component {
    const component = new Component();

    const { properties = {}, required = [] }: { properties: any, required: string[]} = obj;
    component.name = name;
    component.properties = Object.keys(properties).map(key => {
        const property = properties[key]
        const { type } = property;

        const proerty = new Property();

        switch(type){
            case undefined:
                const { $ref: typeRef } = property;
                proerty.type = typeRef.substring('#/components/schemas/'.length)
                break;
            case 'array':
                const { items } = property
                const { $ref: itemsTypeRef } = items;
                proerty.type = `${itemsTypeRef.substring('#/components/schemas/'.length)}[]` as any;

                break;
            default:
                proerty.type = type;
                break;
        }

        proerty.name = key;
        proerty.isRequire = required.some(item => item === key);

        return proerty;
    })
    
    return component;
}
import { Component } from "../models/component";

export default function(data: Component): string {

    let properties = data.properties.map(p => {
        return `${p.name}${p.isRequire?'':'?'}: ${p.type};`;
    }).join(`
    `);

   let content = `
export interface ${data.name} {
    ${properties}
}

`

    return content;
}
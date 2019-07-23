import * as openapi from './openapi.json';
import { parse  } from './src/parse';
import { gen } from "./src/codegen";
import { writeFileSync } from "fs";
import { join } from "path";
import { get } from "request";

function writeFile(path: string, content: string) {
    writeFileSync(path, content)
}

export async function render({ outputDir, openapiJson, openapiUrl }: {
    outputDir: string,
    openapiJson?: any,
    openapiUrl?: string
}) {

    if(!openapiJson){
        openapiJson = await getOpenapiJsonFormUrl(openapiUrl);
    }

    const config = parse(openapiJson);

    const code = gen(config);

    const modelContent = code.models.map(m => m.content).join('');
    writeFile(join(outputDir, `/model.ts`), modelContent);
    
    code.apis.forEach(item => {
        writeFile(join(outputDir, `/${item.name}Service.ts`), item.content)
    });
}

function getOpenapiJsonFormUrl(url: string){
    return new Promise((resolve, reject) => {
        get(url, (error, response, body) => {
            if(error){
                reject(error)
            }else{
                resolve(JSON.parse(body))
            }
        })
    })
}

// render({ outputDir: join(__dirname, 'out'), openapiJson: openapi})
// render({ outputDir: join(__dirname, 'out'), openapiUrl: 'http://localhost:3000/openapi.json'})
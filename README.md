根据openapi.json 生成 typescript 客户端

# install
``` 
npm install openapi-to-client
```

# use

By local file :
``` js

import * as openapi from './openapi.json';

const {render} = require('openapi-to-client')
render({
    outputDir: __dirname + '/out',
    openapiJson: openapi
})
// 将生成文件到/out目录下

```

OR 

By remote url :
``` js
const {render} = require('openapi-to-client')
render({
    outputDir: __dirname + '/out',
    openapiUrl: 'http://localhost:3000/openapi.json'
})
// 将生成文件到/out目录下

```
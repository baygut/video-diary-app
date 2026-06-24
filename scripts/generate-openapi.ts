import { writeFileSync } from 'fs';
import { join } from 'path';

import { generateOpenApiSpec } from '../src/api/openapi';

const spec = generateOpenApiSpec();
const output = join(process.cwd(), 'openapi.json');
writeFileSync(output, JSON.stringify(spec, null, 2));
console.log(`OpenAPI spec written to ${output}`);

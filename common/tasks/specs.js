import {createResolve} from './helpers.js';
const {root, base, resolve} = createResolve(new URL('../', import.meta.url));

console.log({root, base, resolve});

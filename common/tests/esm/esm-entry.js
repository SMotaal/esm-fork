import export_default from './export-default.js';

console.log('\n[%o]\n', import.meta.url, {export_default});

export default import.meta.url;

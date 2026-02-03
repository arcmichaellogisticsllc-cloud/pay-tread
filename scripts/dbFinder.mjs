import prismaLib from '../lib/prisma.js';
// Note: lib/prisma is CJS TS file; to import in ESM we'll import default from compiled client

(async function(){
  const prisma = (await import('../lib/prisma')).default || (await import('../lib/prisma')).prisma;
  const id = process.env.LOAD_ID || process.argv[2] || 'b823211f-cade-4f1c-80aa-ce73464d9657';
  console.log('Looking up', id);
  try{
    const byId = await prisma.load.findUnique({ where: { id } }).catch(()=>null);
    const byExt = await prisma.load.findUnique({ where: { externalRef: id } }).catch(()=>null);
    console.log('byId:', JSON.stringify(byId, null, 2));
    console.log('byExternalRef:', JSON.stringify(byExt, null, 2));
    process.exit(0);
  } catch(e){ console.error(e); process.exit(2); }
})();

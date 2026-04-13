async function main() {
  try {
    const res = await fetch('https://qsmwlrywrjuudfjooqsz.supabase.co/rest/v1/', {
      headers: {
        'apikey': 'sb_publishable_vYf9ol32uaxQuoZM3BMR4w_n1T02vTp',
        'Accept': 'application/json'
      }
    });
    
    console.log('Status:', res.status);
    const text = await res.text();
    
    if (text.length > 30000) {
      // Save to file and show structure
      const spec = JSON.parse(text);
      const defs = spec.definitions || {};
      const paths = spec.paths || {};
      
      // Print table schemas
      for (const [name, def] of Object.entries(defs)) {
        console.log(`\n=== ${name} ===`);
        const props = def.properties || {};
        for (const [col, info] of Object.entries(props)) {
          console.log(`  ${col}: ${info.format || info.type || 'unknown'}`);
        }
      }
      
      // Print RPC functions
      const rpcs = Object.keys(paths).filter(p => p.includes('rpc'));
      console.log('\n=== RPCs ===');
      for (const r of rpcs) {
        console.log(r);
        const body = paths[r]?.post?.parameters?.[0]?.schema;
        if (body?.properties) {
          for (const [p, info] of Object.entries(body.properties)) {
            console.log(`  param: ${p} (${info.format || info.type})`);
          }
        }
      }
    } else {
      console.log('Response:', text.substring(0, 3000));
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main();

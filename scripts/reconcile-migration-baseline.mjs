import fs from 'node:fs';import assert from 'node:assert/strict';
process.loadEnvFile('.env.local');
const ref=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0];
if(!process.env.SUPABASE_PERSONAL_ACCESS_TOKEN)throw Error('Management token required; never pass it on the command line.');
const archive='supabase/history/pre-baseline-20261102',allowed=JSON.parse(fs.readFileSync(archive+'/manifest.json','utf8')).map(row=>row.file.split('_')[0]);
const names=fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort();assert.equal(names.length,2);
const quote=text=>"'"+text.replaceAll("'","''")+"'";
async function query(sql,readOnly=false){const response=await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`,{method:'POST',headers:{Authorization:'Bearer '+process.env.SUPABASE_PERSONAL_ACCESS_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({query:sql,read_only:readOnly}),signal:AbortSignal.timeout(60000)});if(!response.ok)throw Error('Database operation rejected ('+response.status+'); no credential or response body logged.');return response.json();}
const history=await query('select version,name,statements from supabase_migrations.schema_migrations order by version',true),versions=history.map(row=>row.version);
if(versions.join(',')===names.map(n=>n.split('_')[0]).join(',')){console.log('Baseline history already reconciled; no changes.');process.exit(0);}
assert(versions.length&&versions.every(v=>allowed.includes(v)),'Unknown history entry; inspect before proceeding.');
assert(versions.includes('20261101030000'),'Current video migration must be applied first.');
const tables=['categories','menu_items','events','articles','staff_members','media_assets','reservations','audit_log','video_settings','seating_settings'];
const countsSql='select '+tables.map(t=>`(select count(*) from public.${t}) as ${t}`).join(',');
const before=await query(countsSql,true);
const hardening=`REVOKE TRUNCATE,REFERENCES,TRIGGER ON ${tables.map(t=>'public.'+t).join(',')} FROM anon,authenticated; REVOKE INSERT,UPDATE,DELETE ON ${tables.map(t=>'public.'+t).join(',')} FROM anon;`;
const contracts=fs.readdirSync('supabase/tests').filter(f=>f.endsWith('.sql')).sort();
for(const file of contracts)await query('BEGIN;'+hardening+fs.readFileSync('supabase/tests/'+file,'utf8')+'ROLLBACK;');
console.log('Project '+ref+': known legacy history; all '+contracts.length+' live contracts passed with fixtures rolled back.');
if(!process.argv.includes('--apply')){console.log('Dry run only. Use --apply to update grants/history; baseline DDL and initialization will NOT be executed.');process.exit(0);}
fs.mkdirSync('.agent',{recursive:true});fs.writeFileSync('.agent/baseline-history-backup.json',JSON.stringify({project:ref,history},null,2),{mode:0o600});
const expected=versions.map(quote).join(',');
let sql=`BEGIN;LOCK TABLE supabase_migrations.schema_migrations IN ACCESS EXCLUSIVE MODE;DO $$ BEGIN IF (select string_agg(version,',' order by version) from supabase_migrations.schema_migrations)<>${quote(versions.join(','))} THEN RAISE EXCEPTION 'Migration history changed; abort';END IF;END $$;`+hardening;
sql+=`DELETE FROM supabase_migrations.schema_migrations WHERE version IN (${expected});`;
for(const file of names){const version=file.split('_')[0],name=file.slice(version.length+1,-4);sql+=`INSERT INTO supabase_migrations.schema_migrations(version,name,statements) VALUES(${quote(version)},${quote(name)},array[${quote(fs.readFileSync('supabase/migrations/'+file,'utf8'))}]);`;}
await query(sql+'COMMIT;');assert.deepEqual(await query(countsSql,true),before,'Unexpected application row count change; investigate.');
console.log('Baseline history reconciled; excess grants removed; all application row counts unchanged. Legacy history backed up in ignored .agent directory.');

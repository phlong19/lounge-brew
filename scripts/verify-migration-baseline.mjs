import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
const root=process.cwd(),host=process.env.PGHOST??'127.0.0.1';
if(!['127.0.0.1','localhost','::1'].includes(host))throw Error('Baseline verification is restricted to a disposable local PostgreSQL cluster.');
const env={...process.env,PGHOST:host};delete env.PGHOSTADDR;delete env.PGSERVICE;delete env.PGSERVICEFILE;
const tool=name=>process.env.PG_BIN?path.join(process.env.PG_BIN,name):name;
const run=(name,args,input)=>execFileSync(tool(name),args,{env,encoding:'utf8',input,stdio:['pipe','pipe','pipe']});
const sql=(db,text)=>run('psql',['-X','-v','ON_ERROR_STOP=1','-q','-d',db],text);
const suffix=`${process.pid}_${Date.now()}`,legacy=`lounge_legacy_${suffix}`,fresh=`lounge_baseline_${suffix}`,made=[];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const hardening='REVOKE TRUNCATE,REFERENCES,TRIGGER ON ALL TABLES IN SCHEMA public FROM anon,authenticated; REVOKE INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public FROM anon;';
const dump=db=>run('pg_dump',['--schema-only','--no-owner','--schema=public','--schema=private',db]).replace(/^\\(?:un)?restrict .*\n/gm,'').replace(/^-- Dumped (?:from|by).*\n/gm,'').replace(/\n{3,}/g,'\n\n').trim();
try{
 sql('postgres',`DO $$ BEGIN IF NOT EXISTS(select 1 from pg_roles where rolname='anon') THEN CREATE ROLE anon;END IF;IF NOT EXISTS(select 1 from pg_roles where rolname='authenticated') THEN CREATE ROLE authenticated;END IF;IF NOT EXISTS(select 1 from pg_roles where rolname='service_role') THEN CREATE ROLE service_role BYPASSRLS;END IF;END $$;`);
 for(const db of [legacy,fresh]){run('createdb',[db]);made.push(db);sql(db,read('supabase/tests/fixtures/platform.sql'));}
 const archive='supabase/history/pre-baseline-20261102';for(const file of fs.readdirSync(archive).filter(f=>f.endsWith('.sql')).sort())sql(legacy,read(archive+'/'+file).trimStart().toLowerCase().startsWith('begin;')?read(archive+'/'+file):'BEGIN;'+read(archive+'/'+file)+'COMMIT;');sql(legacy,hardening);
 const files=['20261102010000_app_baseline.sql','20261102010100_app_initialization.sql'];
 for(const file of files)sql(fresh,read('supabase/migrations/'+file));sql(fresh,read('supabase/migrations/'+files[1]));
 assert.equal(dump(fresh),dump(legacy),'Fresh baseline differs from historical final schema plus privilege hardening.');
 for(const file of fs.readdirSync('supabase/tests').filter(f=>f.endsWith('.sql')).sort()){sql(fresh,'BEGIN;\n'+read('supabase/tests/'+file)+'\nROLLBACK;');console.log('Passed '+file);}
 console.log('Baseline matches historical schema; initialization is repeatable; all database contracts passed.');
}catch(error){console.error(error.stderr?.toString()||error.message);process.exitCode=1;}finally{for(const db of made.reverse())run('dropdb',['--if-exists',db]);}

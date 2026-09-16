import {readFileSync,readdirSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url),sqlite=new DatabaseSync(':memory:');
sqlite.exec('PRAGMA foreign_keys=ON');
for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync('drizzle/'+f,'utf8'));
class Statement{constructor(sql,args=[]){this.sql=sql;this.args=args}bind(...args){return new Statement(this.sql,args)}async first(){return sqlite.prepare(this.sql).get(...this.args)||null}async all(){return {results:sqlite.prepare(this.sql).all(...this.args),success:true}}async run(){const r=sqlite.prepare(this.sql).run(...this.args);return {success:true,meta:{changes:Number(r.changes)}}}}
const binding={prepare(sql){return new Statement(sql)},async batch(statements){sqlite.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());sqlite.exec('COMMIT');return out}catch(e){sqlite.exec('ROLLBACK');throw e}}};
globalThis.testEnv={DB:binding,AURA_OWNER_EMAIL:'owner@example.test'};globalThis.testUser=null;
function compiled(file,replace={}){let src=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;for(const [a,b] of Object.entries(replace))src=src.replace(a,b);return 'data:text/javascript;base64,'+Buffer.from(src).toString('base64')}
const domain=compiled('lib/domain.ts');
const server=compiled('lib/server.ts',{'import { env } from "cloudflare:workers";':'const env=globalThis.testEnv;',"import { env } from 'cloudflare:workers';":'const env=globalThis.testEnv;',"import { getChatGPTUser } from '@/app/chatgpt-auth';":'const getChatGPTUser=async()=>globalThis.testUser;',"from './domain'":"from '"+domain+"'"});
const routeUrl=compiled('app/api/wash/route.ts',{"from 'zod'":"from '"+pathToFileURL(require.resolve('zod')).href+"'","from '@/lib/server'":"from '"+server+"'","from '@/lib/domain'":"from '"+domain+"'"});
const route=await import(routeUrl);let checks=0;
function as(id,role='customer'){globalThis.testUser=id?{userId:id,email:role==='owner'?'owner@example.test':id+'@example.test',displayName:id,fullName:id}:null}
async function call(action,data,expected=200,origin='https://aura.test'){const res=await route.POST(new Request('https://aura.test/api/wash',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({action,...data})}));const out=await res.json();assert.equal(res.status,expected,action+': '+JSON.stringify(out));checks++;return out}
async function get(q,expected=200){const res=await route.GET(new Request('https://aura.test/api/wash?'+q));const out=await res.json();assert.equal(res.status,expected,q+': '+JSON.stringify(out));checks++;return out}
const day=new Date(Date.now()+2*86400000).toISOString().slice(0,10),slot=new Date(day+'T11:00:00+03:00').toISOString();
const booking=(id=crypto.randomUUID(),time=slot)=>({id,service:'signature',slot:time,customer:'Тестовый клиент',phone:'+7 999 123-45-67',car:'Test Car',plate:'ТЕСТ 01',consent:true});
as(null);await get('view=public');await get('view=orders',401);await call('book',{data:booking()},401);
as('alice');await get('view=orders&all=1',403);await call('settings',{data:{}},403);await call('staff',{data:{}},403);await call('book',{data:booking()},403,'https://evil.test');await call('book',{data:{...booking(),phone:'          '}},400);await call('book',{data:{...booking(),total:1}},400);
const id=crypto.randomUUID();await call('book',{data:booking(id)},201);await call('book',{data:booking(id)},200);assert.equal(sqlite.prepare('SELECT count(*) n FROM orders').get().n,1);checks++;
const aliceOrder=(await get('view=order&id='+id)).order;assert.equal(aliceOrder.total,1900);assert.equal(sqlite.prepare('SELECT count(*) n FROM reservations WHERE orderId=?').get(id).n,4);checks+=2;
as('bob');await get('view=order&id='+id,403);assert.equal((await get('view=orders')).orders.length,0);checks++;await call('cancel',{id},403);await call('status',{id,status:'accepted',data:{intake:'OK',mileage:'10'}},403);
const id2=crypto.randomUUID();await call('book',{data:booking(id2)},201);as('carol');await call('book',{data:booking()},409);await call('book',{data:booking(crypto.randomUUID(),new Date(day+'T11:30:00+03:00').toISOString())},409);
as('owner','owner');await call('staff',{data:{name:'Employee',email:'worker@example.test',role:'employee'}});await call('staff',{data:{name:'Manager',email:'manager@example.test',role:'manager'}});as('carol');const later=crypto.randomUUID();await call('book',{data:booking(later,new Date(day+'T16:00:00+03:00').toISOString())},201);as('worker');await get('view=orders&all=1');await call('staff',{data:{}},403);await call('settings',{data:{}},403);await call('status',{id,status:'ready'},409);await call('status',{id,status:'accepted',data:{intake:'',mileage:'10'}},400);await call('status',{id,status:'accepted',data:{intake:'Ключи получены, повреждений нет',mileage:'12000'}});await call('status',{id,status:'washing'});await call('status',{id:later,status:'accepted',data:{intake:'Ключи приняты',mileage:'100'}},409);await call('propose',{id,data:{total:2400,note:'Защитное покрытие'}},403);
as('manager');await call('propose',{id,data:{total:2400,note:'Защитное покрытие'}});await call('status',{id,status:'quality'});await call('status',{id,status:'ready'},409);as('bob');await call('approve_price',{id},403);as('alice');await call('approve_price',{id});assert.equal((await get('view=order&id='+id)).order.total,2400);checks++;await call('review',{id,data:{rating:5,body:'Хорошая мойка автомобиля'}},409);
as('worker');await call('status',{id,status:'ready'});await call('status',{id,status:'delivered'},409);await call('paid',{id});await call('paid',{id},409);await call('status',{id,status:'delivered'});assert.equal(sqlite.prepare('SELECT count(*) n FROM reservations WHERE orderId=?').get(id).n,0);checks++;
as('alice');await call('review',{id,data:{rating:5,body:'Хорошая мойка автомобиля'}});await call('review',{id,data:{rating:4,body:'Повторный отзыв запрещён'}},409);assert.equal((await get('view=public')).reviews.length,0);checks++;
as('owner','owner');const rr=await get('view=reviews');await call('moderate',{data:{id:rr.reviews[0].id,approved:true}});assert.equal((await get('view=public')).reviews.length,1);checks++;
const defaults=(await get('view=public')).settings;await call('settings',{data:{...defaults,telegram:'javascript:alert(1)'}},400);await call('settings',{data:{...defaults,telegram:'https://t.me.evil.test/foo'}},400);await call('settings',{data:{...defaults,prices:[1000,2000,5000],telegram:'https://t.me/example'}});assert.equal((await get('view=order&id='+id)).order.total,2400);checks++;
as('bob');await call('cancel',{id:id2});as('carol');await call('book',{data:booking()},201);
as('owner','owner');await call('staff',{data:{name:'Employee',email:'worker@example.test',role:'remove'}});as('worker');await get('view=orders&all=1',403);
const audit=sqlite.prepare('SELECT count(*) n FROM events WHERE orderId=?').get(id).n;assert.ok(audit>=9);checks++;
const queryPlan=sqlite.prepare('EXPLAIN QUERY PLAN SELECT * FROM orders WHERE userId = ?').all('alice');assert.ok(queryPlan.some(p=>String(p.detail).includes('orders_user')));checks++;
console.log('PASS — '+checks+' assertions: authorization, IDOR, CSRF, input validation, pricing, atomic reservations, workflow, approvals, payment, reviews and role revocation.');
sqlite.close();

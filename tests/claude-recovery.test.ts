import test from "node:test";
import assert from "node:assert/strict";
import { extractClaudeMenu, parseMenuImage } from "../lib/claude-menu.ts";
import { DomainError } from "../lib/domain.ts";

const image=parseMenuImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==");
const item={nameKo:"타코야키",nameEn:"Takoyaki",price:null,descriptionKo:"",descriptionEn:""};
const complete={stop_reason:"end_turn",content:[{type:"text",text:JSON.stringify({imageType:"food",items:[item]})}]};
const partial={stop_reason:"max_tokens",content:[{type:"text",text:'{"imageType":"food","items":[{'}]};
const fail=(code:string)=>(error:unknown)=>error instanceof DomainError && error.code===code;

test("truncated JSON retries once with no up-front thinking and a larger output budget",async()=>{
 const requests: {body:Record<string,any>;signal:AbortSignal|null|undefined}[]=[];let reservations=0;
 const send=(async(_url,init)=>{
  requests.push({body:JSON.parse(String(init?.body)),signal:init?.signal});
  return Response.json(requests.length===1?partial:complete);
 }) as typeof fetch;
 const result=await extractClaudeMenu(image,"test-key",undefined,send,async()=>{reservations++;});
 assert.deepEqual(result,{imageType:"food",items:[item]});assert.equal(requests.length,2);assert.equal(reservations,1);
 assert.deepEqual(requests[0].body.thinking,{type:"between_tools"});
 assert.equal(requests[0].body.max_tokens,8192);assert.equal(requests[1].body.max_tokens,12288);
 assert.equal(requests[0].signal,requests[1].signal,"Both attempts share one deadline");
 assert.equal(requests[1].body.messages.length,1,"Partial output must not be appended or published");
});

test("a second truncated response stops instead of looping or returning partial menus",async()=>{
 let calls=0;const send=(async()=>{calls++;return Response.json(partial);}) as typeof fetch;
 await assert.rejects(extractClaudeMenu(image,"test-key",undefined,send),fail("AI_INCOMPLETE"));assert.equal(calls,2);
});

test("daily budget exhaustion prevents the paid retry",async()=>{
 let calls=0;const send=(async()=>{calls++;return Response.json(partial);}) as typeof fetch;
 await assert.rejects(extractClaudeMenu(image,"test-key",undefined,send,async()=>{throw new DomainError("AI_DEMO_LIMIT",429);}),fail("AI_DEMO_LIMIT"));assert.equal(calls,1);
});

test("authentication errors and refusals are not retried",async()=>{
 for(const [status,data,code] of [[401,{},"AI_AUTH_ERROR"],[200,{stop_reason:"refusal",content:[]},"AI_REFUSED"]] as const){
  let calls=0;const send=(async()=>{calls++;return Response.json(data,{status});}) as typeof fetch;
  await assert.rejects(extractClaudeMenu(image,"test-key",undefined,send),fail(code));assert.equal(calls,1);
 }
});

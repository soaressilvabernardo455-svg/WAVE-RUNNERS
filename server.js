import express from 'express';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { randomUUID } from 'node:crypto';

const app=express();
const server=createServer(app);
const wss=new WebSocketServer({server,path:'/ws'});
const PORT=process.env.PORT||3000;
app.use(express.static('public',{extensions:['html']}));
app.get('/health',(_req,res)=>res.json({ok:true,game:'Wave Runner',players:[...rooms.values()].reduce((n,r)=>n+r.size,0)}));
const rooms=new Map();
function send(ws,data){if(ws.readyState===1)ws.send(JSON.stringify(data));}
function broadcast(room,data,except=null){for(const p of room.values())if(p.ws!==except)send(p.ws,data);}
wss.on('connection',ws=>{
 const id=randomUUID();let roomName=null;let player=null;
 send(ws,{type:'hello',id});
 ws.on('message',raw=>{
  let msg;try{msg=JSON.parse(raw.toString())}catch{return}
  if(msg.type==='join'){
   roomName=String(msg.room||'ocean-open').slice(0,32);
   if(!rooms.has(roomName))rooms.set(roomName,new Map());
   const room=rooms.get(roomName);
   if(room.size>=3){send(ws,{type:'room-full'});ws.close(1000,'room full');return;}
   player={id,ws,x:0,y:0,z:3,distance:0,coins:0,updated:Date.now()};room.set(id,player);
   send(ws,{type:'welcome',id,room:roomName,players:room.size});
   broadcast(room,{type:'joined',id,players:room.size},ws);
   broadcast(room,{type:'snapshot',players:[...room.values()].map(({id,x,y,z,distance,coins})=>({id,x,y,z,distance,coins}))});
   return;
  }
  if(msg.type==='ping'){send(ws,{type:'pong',sentAt:msg.sentAt});return;}
  if(msg.type==='state'&&player){
   player.x=Number.isFinite(msg.x)?Math.max(-9,Math.min(9,msg.x)):player.x;
   player.y=Number.isFinite(msg.y)?Math.max(0,Math.min(8,msg.y)):0;
   player.z=Number.isFinite(msg.z)?Math.max(-20,Math.min(20,msg.z)):3;
   player.distance=Number.isFinite(msg.distance)?Math.max(0,msg.distance):player.distance;
   player.coins=Number.isFinite(msg.coins)?Math.max(0,Math.min(100000,msg.coins)):player.coins;
   player.updated=Date.now();
  }
 });
 ws.on('close',()=>{
  if(!roomName)return;const room=rooms.get(roomName);if(!room)return;
  room.delete(id);broadcast(room,{type:'left',id,players:room.size});
  broadcast(room,{type:'snapshot',players:[...room.values()].map(({id,x,y,z,distance,coins})=>({id,x,y,z,distance,coins}))});
  if(!room.size)rooms.delete(roomName);
 });
});
setInterval(()=>{
 for(const room of rooms.values()){
  const now=Date.now();for(const [id,p] of room)if(now-p.updated>15000&&p.ws.readyState!==1)room.delete(id);
  broadcast(room,{type:'snapshot',players:[...room.values()].map(({id,x,y,z,distance,coins})=>({id,x,y,z,distance,coins}))});
 }
},100);
server.listen(PORT,'0.0.0.0',()=>console.log('Wave Runner listening on '+PORT));

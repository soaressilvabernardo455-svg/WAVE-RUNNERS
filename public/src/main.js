import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const root = document.getElementById('game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x70cde9);
scene.fog = new THREE.Fog(0x78cde1, 65, 245);
const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 5.8, 12);
const renderer = new THREE.WebGLRenderer({antialias: true, powerPreference: 'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
root.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdaf8ff, 0x14516c, 2.0));
const sun = new THREE.DirectionalLight(0xfff0d4, 2.6);
sun.position.set(-18, 30, 15); sun.castShadow = true; sun.shadow.mapSize.set(1024,1024);
sun.shadow.camera.left=-35; sun.shadow.camera.right=35; sun.shadow.camera.top=35; sun.shadow.camera.bottom=-35;
scene.add(sun);
const fill = new THREE.DirectionalLight(0x36bdf3, 1.1); fill.position.set(18,10,-35); scene.add(fill);

const mat = (color, roughness=.55, metalness=0) => new THREE.MeshStandardMaterial({color, roughness, metalness});
const oceanMat = new THREE.MeshStandardMaterial({color:0x087fa9, roughness:.27, metalness:.22, transparent:true, opacity:.96});
const oceanGeo = new THREE.PlaneGeometry(420, 520, 110, 130);
oceanGeo.rotateX(-Math.PI/2);
const ocean = new THREE.Mesh(oceanGeo, oceanMat); ocean.position.y=-.25; ocean.receiveShadow=true; scene.add(ocean);
const oceanBase = oceanGeo.attributes.position.array.slice();
const foamMat = new THREE.MeshBasicMaterial({color:0xb9f8ff, transparent:true, opacity:.28, side:THREE.DoubleSide});
const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(7,48), new THREE.MeshBasicMaterial({color:0xffe5a3, transparent:true, opacity:.18}));
sunDisc.position.set(-32,30,-95); sunDisc.lookAt(camera.position); scene.add(sunDisc);

function makeIsland(x,z,s=1){
 const g=new THREE.Group();
 const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(12*s,2),mat(0x477c63)); rock.scale.set(1.7,.85,1.15); rock.position.y=-2.2; rock.castShadow=true; g.add(rock);
 const sand=new THREE.Mesh(new THREE.CylinderGeometry(13*s,16*s,2*s,12),mat(0xe9d29a)); sand.position.y=-1.1; g.add(sand);
 for(let i=0;i<13;i++){const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.13*s,.2*s,2.6*s,6),mat(0x80583a));const leaf=new THREE.Mesh(new THREE.ConeGeometry(1.35*s,3.5*s,7),mat(i%2?0x19845f:0x2b9b68));const a=i*2.4;trunk.position.set(Math.cos(a)*8*s,1.3*s,Math.sin(a)*7*s);leaf.position.set(trunk.position.x,3*s,trunk.position.z);leaf.rotation.z=(Math.random()-.5)*.3;g.add(trunk,leaf);}
 g.position.set(x,-1.2,z); scene.add(g); return g;
}
makeIsland(-48,-62,1.5); makeIsland(54,-128,1.9); makeIsland(-68,-220,1.7);
for(let i=0;i<9;i++){const cloud=new THREE.Group();for(let j=0;j<5;j++){const puff=new THREE.Mesh(new THREE.SphereGeometry(2.5+Math.random()*2,12,9),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.7}));puff.position.set(j*2.7,Math.random()*1.5,0);cloud.add(puff);}cloud.position.set((i%2?1:-1)*(35+Math.random()*60),25+Math.random()*13,-35-i*34);scene.add(cloud);}

function makeBoard(color=0xff713d){
 const group=new THREE.Group();
 const board=new THREE.Mesh(new THREE.CapsuleGeometry(.62,.18,.6,10),mat(color,.27,.18)); board.scale.set(.72,.18,2.1); board.rotation.x=Math.PI/2; board.position.y=.34; board.castShadow=true; group.add(board);
 const stripe=new THREE.Mesh(new THREE.BoxGeometry(.23,.035,2.6),mat(0xffe7a0,.35)); stripe.position.set(0,.49,0); group.add(stripe);
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.34,.75,5,9),mat(0x173b63)); body.position.y=1.23; body.castShadow=true; group.add(body);
 const shirt=new THREE.Mesh(new THREE.CapsuleGeometry(.37,.44,5,9),mat(0xffc23d)); shirt.position.y=1.45; group.add(shirt);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.3,18,14),mat(0x9b5e3e)); head.position.y=2.12; head.castShadow=true; group.add(head);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.31,16,10,0,Math.PI*2,0,Math.PI*.55),mat(0x29212a)); hair.position.y=2.23; group.add(hair);
 const armMat=mat(0x9b5e3e);
 for(const side of [-1,1]){const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.105,.48,4,7),armMat);arm.position.set(side*.43,1.47,-.02);arm.rotation.z=side*.55;group.add(arm);const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.42,4,7),mat(0x193a58));leg.position.set(side*.17,.78,.1);leg.rotation.x=-.15;group.add(leg);}
 const fin=new THREE.Mesh(new THREE.ConeGeometry(.16,.45,7),mat(0x183d5b));fin.position.set(0,.05,1.9);fin.rotation.x=Math.PI;group.add(fin);
 return group;
}
const player=makeBoard(); scene.add(player); player.position.set(0,0,3);
const remotePlayers=new Map();
const bottleMat=mat(0x38d9ff,.18,.3);
function makeBottle(){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.CylinderGeometry(.22,.27,.78,12),bottleMat);b.position.y=.45;g.add(b);const neck=new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,.18,10),mat(0xe9fbff,.2));neck.position.y=.91;g.add(neck);const cap=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.12,10),mat(0x167db7));cap.position.y=1.06;g.add(cap);const glow=new THREE.Mesh(new THREE.TorusGeometry(.34,.035,6,20),new THREE.MeshBasicMaterial({color:0x7af0ff}));glow.rotation.x=Math.PI/2;glow.position.y=.15;g.add(glow);return g;}
function makeBoat(jet=false){
 const g=new THREE.Group();const hull=new THREE.Mesh(new THREE.CapsuleGeometry(.75,2.5,4,10),mat(jet?0xff5a4f:0xf1f4ed,.3,.2));hull.scale.set(.72,.48,1);hull.rotation.x=Math.PI/2;hull.position.y=.25;hull.castShadow=true;g.add(hull);
 const deck=new THREE.Mesh(new THREE.BoxGeometry(1.05,.25,2.4),mat(jet?0x202c44:0x1a718b,.32));deck.position.y=.53;g.add(deck);
 if(jet){const seat=new THREE.Mesh(new THREE.BoxGeometry(.55,.45,.75),mat(0x202b3d));seat.position.set(0,.83,-.12);g.add(seat);const handle=new THREE.Mesh(new THREE.TorusGeometry(.28,.055,7,16),mat(0x252c3a));handle.position.set(0,.94,-.82);g.add(handle);const nozzle=new THREE.Mesh(new THREE.CylinderGeometry(.2,.3,.6,10),mat(0x687d8a,.25,.4));nozzle.rotation.x=Math.PI/2;nozzle.position.z=1.3;nozzle.position.y=.25;g.add(nozzle);}
 else{const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.45,.85,1.25),mat(0xf7f5e9,.28));cabin.position.set(0,.92,-.1);g.add(cabin);const windshield=new THREE.Mesh(new THREE.BoxGeometry(1.15,.42,.04),new THREE.MeshStandardMaterial({color:0x6ad5ed,metalness:.2,roughness:.1}));windshield.position.set(0,1.05,-.75);g.add(windshield);const roof=new THREE.Mesh(new THREE.BoxGeometry(1.7,.12,1.5),mat(0xffbd53));roof.position.y=1.39;g.add(roof);}
 return g;
}
const items=[], obstacles=[], coins=[];
function addBottle(x,z){const b=makeBottle();b.position.set(x,.15,z);scene.add(b);items.push({mesh:b,type:'bottle',z,x});}
function addCoin(x,z){const c=new THREE.Mesh(new THREE.TorusGeometry(.35,.11,8,18),mat(0xffd34e,.24,.65));c.position.set(x,1,z);c.rotation.y=Math.PI/2;scene.add(c);coins.push({mesh:c,z,x});}
function addObstacle(jet,z,x){const m=makeBoat(jet);m.position.set(x,0,z);scene.add(m);obstacles.push({mesh:m,z,x,jet,phase:Math.random()*8,baseX:x});}
for(let i=0;i<36;i++){const z=-24-i*13;const lane=[-5,0,5][Math.floor(Math.random()*3)];if(i%4===0)addBottle(lane,z);else if(i%4===1)addCoin(lane,z);else addObstacle(i%3!==0,z,lane);}
for(let i=0;i<24;i++){addCoin([-5,0,5][i%3],-35-i*11);}

const state={x:0,z:3,vy:0,jump:false,slide:0,speed:22,distance:0,coins:0,bottles:0,turbo:0,turboTime:0,alive:true,elapsed:0};
const keys={};let last=performance.now(),frames=0,fpsTime=0,fps=60,network=null,playerId=null,sendClock=0,pingClock=0,lastPing=0,remotes=[];
const ui={ping:document.getElementById('ping'),fps:document.getElementById('fps'),speed:document.getElementById('speed'),distance:document.getElementById('distance'),coins:document.getElementById('coins'),bottles:document.getElementById('bottle-count'),cells:[...document.querySelectorAll('.turbo-cells i')],turbo:document.getElementById('turbo-button'),toast:document.getElementById('toast'),net:document.getElementById('net-status')};
function toast(t){ui.toast.textContent=t;ui.toast.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>ui.toast.classList.remove('show'),1500);}
function jump(){if(!state.jump&&state.alive){state.vy=8.2;state.jump=true;}}
function slide(){state.slide=.65;}
function turbo(){if(state.bottles>=5&&state.turboTime<=0){state.bottles=0;state.turboTime=3.2;state.speed=37;toast('TURBO ATIVADO!');}}
addEventListener('keydown',e=>{keys[e.code]=true;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code))e.preventDefault();if(e.code==='Space'||e.code==='ArrowUp')jump();if(e.code==='ArrowDown'||e.code==='KeyS')slide();if(e.code==='ShiftLeft'||e.code==='ShiftRight')turbo();});
addEventListener('keyup',e=>keys[e.code]=false);
function bind(id,fn){const el=document.getElementById(id);el.addEventListener('pointerdown',e=>{e.preventDefault();fn();});}
bind('left',()=>keys.ArrowLeft=true);bind('right',()=>keys.ArrowRight=true);bind('jump',jump);bind('slide',slide);bind('turbo-button',turbo);
for(const id of ['left','right']){const el=document.getElementById(id);['pointerup','pointerleave','pointercancel'].forEach(ev=>el.addEventListener(ev,()=>keys[id==='left'?'ArrowLeft':'ArrowRight']=false));}
document.getElementById('restart').onclick=()=>location.reload();

function addRemote(id){if(remotePlayers.has(id))return;const m=makeBoard(0x38c9e8);m.scale.setScalar(.92);scene.add(m);remotePlayers.set(id,{mesh:m,target:new THREE.Vector3(),x:0,z:3});}
function connect(){const proto=location.protocol==='https:'?'wss':'ws';try{network=new WebSocket(proto+'://'+location.host+'/ws');network.onopen=()=>{network.send(JSON.stringify({type:'join',room:'ocean-open'}));ui.net.textContent='CONECTADO';document.querySelector('.status-dot').style.background='#52f4ae';};network.onmessage=e=>{let d;try{d=JSON.parse(e.data)}catch{return}if(d.type==='welcome'){playerId=d.id;return;}if(d.type==='pong'){ui.ping.textContent=Math.max(0,Math.round(performance.now()-d.sentAt))+' ms';return;}if(d.type==='snapshot'){const ids=new Set();d.players.forEach(p=>{if(p.id===playerId)return;ids.add(p.id);addRemote(p.id);const r=remotePlayers.get(p.id);r.target.set(p.x,p.y||0,p.z);});for(const [id,r] of remotePlayers)if(!ids.has(id)){scene.remove(r.mesh);remotePlayers.delete(id);}return;}};network.onclose=()=>{ui.net.textContent='RECONETANDO';document.querySelector('.status-dot').style.background='#ffc65c';setTimeout(connect,3000);};network.onerror=()=>network.close();}catch{}}
connect();

function updateOcean(t){const a=oceanGeo.attributes.position;for(let i=0;i<a.count;i++){const x=oceanBase[i*3],z=oceanBase[i*3+2];a.array[i*3+1]=Math.sin(x*.055+t*1.2)*.22+Math.sin(z*.075-t*1.6)*.17+Math.sin((x+z)*.025+t*.7)*.12;}a.needsUpdate=true;oceanGeo.computeVertexNormals();}
function update(dt,t){if(!state.alive)return;state.elapsed+=dt;const steer=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0);state.x=THREE.MathUtils.clamp(state.x+steer*10*dt,-7.2,7.2);state.distance+=state.speed*dt;state.z=3;state.vy-=19*dt;player.position.y=Math.max(0,player.position.y+state.vy*dt);if(player.position.y<=0){player.position.y=0;state.vy=0;state.jump=false;}state.slide=Math.max(0,state.slide-dt);player.position.x=THREE.MathUtils.damp(player.position.x,state.x,12,dt);player.rotation.z=THREE.MathUtils.damp(player.rotation.z,-steer*.18,7,dt);player.rotation.x=THREE.MathUtils.damp(player.rotation.x,Math.sin(t*8)*.025,3,dt);player.scale.y=state.slide>0?.72:1;player.position.y+=Math.sin(t*5)*.045;
 const boosted=state.turboTime>0;if(boosted){state.turboTime-=dt;state.speed=37; if(Math.random()<.7){const splash=new THREE.Mesh(new THREE.SphereGeometry(.16+Math.random()*.2,6,5),new THREE.MeshBasicMaterial({color:0x8cefff,transparent:true,opacity:.7}));splash.position.set(player.position.x+(Math.random()-.5)*1.3,.3,player.position.z+2+Math.random()*1.5);scene.add(splash);setTimeout(()=>{scene.remove(splash);splash.geometry.dispose();splash.material.dispose();},400);}}else state.speed=THREE.MathUtils.damp(state.speed,22,1.5,dt);
 const travel=state.speed*dt;for(const group of [items,coins,obstacles])for(const o of group){o.z+=travel;o.mesh.position.z=o.z;if(o.type==='bottle'){o.mesh.rotation.y+=dt*1.8;o.mesh.position.y=.22+Math.sin(t*3+o.z)*.13;}if(o.mesh.rotation)o.mesh.rotation.y+=dt*.7;if(o.jet){o.mesh.position.x=o.baseX+Math.sin(t*1.4+o.phase)*2.2;o.mesh.rotation.y=Math.sin(t+o.phase)*.18;}
 const dx=Math.abs(o.mesh.position.x-player.position.x), dz=Math.abs(o.z-player.position.z);
 if(group===items&&dz<1.6&&dx<1.45){o.z=999;o.mesh.visible=false;state.bottles=Math.min(5,state.bottles+1);toast('GARRAFA PRESSURIZADA +1');}
 if(group===coins&&dz<1.5&&dx<1.3){o.z=999;o.mesh.visible=false;state.coins++;}
 if(group===obstacles&&dz<1.6&&dx<1.45&&player.position.y<1.25&&state.slide<=0&&!boosted){state.speed=Math.max(10,state.speed*.65);toast('CUIDADO! OBSTÁCULO');o.z=999;o.mesh.visible=false;}
 if(o.z>15){o.z=-420-Math.random()*120;o.mesh.visible=true;o.x=[-5,0,5][Math.floor(Math.random()*3)];o.mesh.position.x=o.x;if(o.baseX!==undefined)o.baseX=o.x;}
 }
 ui.speed.textContent=Math.round(state.speed*3.6);ui.distance.textContent=Math.floor(state.distance)+' m';ui.coins.textContent=String(state.coins).padStart(3,'0');ui.bottles.textContent=state.bottles+' / 5';ui.cells.forEach((c,i)=>c.classList.toggle('filled',i<state.bottles));ui.turbo.classList.toggle('ready',state.bottles>=5);document.getElementById('race-progress').style.width=(state.distance%1200/12)+'%';
 camera.position.x=THREE.MathUtils.damp(camera.position.x,player.position.x*.42,3,dt);camera.position.y=THREE.MathUtils.damp(camera.position.y,5.8+player.position.y*.18,3,dt);camera.lookAt(player.position.x*.45,1.3,-8);
 for(const r of remotePlayers.values()){r.mesh.position.lerp(r.target,.12);r.mesh.lookAt(r.mesh.position.x,1,r.mesh.position.z-4);}
 if(network&&network.readyState===1){sendClock+=dt;pingClock+=dt;if(sendClock>.08){sendClock=0;network.send(JSON.stringify({type:'state',x:player.position.x,y:player.position.y,z:player.position.z,distance:state.distance,coins:state.coins}));}if(pingClock>2){pingClock=0;network.send(JSON.stringify({type:'ping',sentAt:performance.now()}));}}
}
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.04,(now-last)/1000);last=now;frames++;fpsTime+=dt;if(fpsTime>=.6){fps=Math.round(frames/fpsTime);ui.fps.textContent=fps;frames=0;fpsTime=0;}updateOcean(now*.001);update(dt,now*.001);renderer.render(scene,camera);}
requestAnimationFrame(loop);
setTimeout(()=>{const l=document.getElementById('loading');l.style.opacity=0;setTimeout(()=>l.remove(),650);toast('BOA ONDA! COLETE 5 GARRAFAS PARA O TURBO');},1000);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));});

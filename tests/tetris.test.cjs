const test=require('node:test'),assert=require('node:assert/strict');
const {Game}=require('../tetris.js');
test('seven-bag contains all seven pieces before repeating',()=>{
  const game=new Game(10,20,()=>0.5);const pieces=[game.piece.name,game.next];
  while(pieces.length<7)pieces.push(game.take());assert.equal(new Set(pieces).size,7);
});
test('movement stops at walls and paused actions do not change board',()=>{
  const g=new Game(10,20);for(let i=0;i<20;i++)g.move(-1);assert.equal(g.piece.x,0);
  const before=JSON.stringify(g);g.paused=true;g.move(1);g.rotate();g.hardDrop();g.tick(1000);
  g.paused=false;assert.equal(JSON.stringify(g),before);
});
test('hard drop fills missing cells and clears a line with score',()=>{
  const g=new Game(10,8);g.board[7]=[1,1,1,0,0,0,0,1,1,1];
  g.piece={name:'I',shape:[[1,1,1,1]],x:3,y:0};g.hardDrop();
  assert.equal(g.lines,1);assert.equal(g.score,114);assert.ok(g.board.every(row=>row.every(v=>v===0)));
});
test('rotation kicks away from right wall without crossing bounds',()=>{
  const g=new Game(10,20);g.piece={name:'I',shape:[[1],[1],[1],[1]],x:9,y:0};
  assert.equal(g.rotate(),false);g.piece.x=8;assert.equal(g.rotate(),true);assert.equal(g.piece.x,6);
});
test('blocked spawn ends game and tall and short scenes remain playable',()=>{
  for(const height of [8,18,24]){const g=new Game(10,height);g.board[0].fill(1);g.spawn();assert.equal(g.over,true);}
});
test('four simultaneous lines clear together and increase the level',()=>{
  const g=new Game(10,20);g.lines=9;
  for(let r=16;r<20;r++){g.board[r].fill(1);g.board[r][4]=0;}
  g.piece={name:'I',shape:[[1],[1],[1],[1]],x:4,y:16};g.lock();
  assert.equal(g.lines,13);assert.equal(g.level,2);assert.equal(g.score,800);
  assert.ok(g.board.every(row=>row.every(v=>v===0)));
});

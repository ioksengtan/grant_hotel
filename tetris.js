(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.WindowTetris=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  var SHAPES={I:[[1,1,1,1]],O:[[1,1],[1,1]],T:[[0,1,0],[1,1,1]],S:[[0,1,1],[1,1,0]],Z:[[1,1,0],[0,1,1]],J:[[1,0,0],[1,1,1]],L:[[0,0,1],[1,1,1]]};
  function Game(width,height,random){
    this.width=width;this.height=height;this.random=random||Math.random;
    this.board=Array.from({length:height},function(){return Array(width).fill(0)});
    this.bag=[];this.score=0;this.lines=0;this.level=1;this.paused=false;this.over=false;this.elapsed=0;
    this.next=this.take();this.spawn();
  }
  Game.prototype.take=function(){
    if(!this.bag.length){
      this.bag=Object.keys(SHAPES);
      for(var i=this.bag.length-1;i>0;i--){var j=Math.floor(this.random()*(i+1)),v=this.bag[i];this.bag[i]=this.bag[j];this.bag[j]=v;}
    }
    return this.bag.pop();
  };
  Game.prototype.spawn=function(){
    var name=this.next;this.next=this.take();
    var shape=SHAPES[name].map(function(row){return row.slice()});
    this.piece={name:name,shape:shape,x:Math.floor((this.width-shape[0].length)/2),y:0};
    this.elapsed=0;if(!this.fits(shape,this.piece.x,this.piece.y))this.over=true;
  };
  Game.prototype.fits=function(shape,x,y){
    for(var r=0;r<shape.length;r++)for(var c=0;c<shape[r].length;c++)if(shape[r][c]){
      var xx=x+c,yy=y+r;
      if(xx<0||xx>=this.width||yy>=this.height||(yy>=0&&this.board[yy][xx]))return false;
    }
    return true;
  };
  Game.prototype.move=function(dx){
    if(this.paused||this.over)return false;
    var p=this.piece;if(!this.fits(p.shape,p.x+dx,p.y))return false;p.x+=dx;return true;
  };
  Game.prototype.rotate=function(){
    if(this.paused||this.over)return false;
    var p=this.piece,s=p.shape;
    var turned=Array.from({length:s[0].length},function(_,r){return s.map(function(row){return row[r]}).reverse()});
    var offsets=[0,-1,1,-2,2];
    for(var i=0;i<offsets.length;i++)if(this.fits(turned,p.x+offsets[i],p.y)){
      p.shape=turned;p.x+=offsets[i];return true;
    }
    return false;
  };
  Game.prototype.lock=function(){
    var p=this.piece;
    for(var r=0;r<p.shape.length;r++)for(var c=0;c<p.shape[r].length;c++)if(p.shape[r][c]){
      if(p.y+r<0){this.over=true;return;}this.board[p.y+r][p.x+c]=1;
    }
    var remaining=this.board.filter(function(row){return row.some(function(v){return !v})});
    var cleared=this.height-remaining.length;
    while(remaining.length<this.height)remaining.unshift(Array(this.width).fill(0));
    this.board=remaining;this.score+=[0,100,300,500,800][cleared]*this.level;
    this.lines+=cleared;this.level=1+Math.floor(this.lines/10);this.spawn();
  };
  Game.prototype.drop=function(manual){
    if(this.paused||this.over)return false;
    var p=this.piece;if(this.fits(p.shape,p.x,p.y+1)){p.y++;if(manual)this.score++;return true;}
    this.lock();return false;
  };
  Game.prototype.hardDrop=function(){
    if(this.paused||this.over)return;
    var p=this.piece;while(this.fits(p.shape,p.x,p.y+1)){p.y++;this.score+=2;}this.lock();
  };
  Game.prototype.ghostY=function(){var p=this.piece,y=p.y;while(this.fits(p.shape,p.x,y+1))y++;return y;};
  Game.prototype.tick=function(ms){
    if(this.paused||this.over)return;
    this.elapsed+=ms;var interval=Math.max(100,850-(this.level-1)*65);
    if(this.elapsed>=interval){this.elapsed%=interval;this.drop(false);}
  };
  return {Game:Game,shapes:SHAPES};
});



let sizes=[1,1,1,1,1,1]
let sizes_ratio=[0.8,1,1.2,1.4,1.6,1.8]
const diff=[[6,7],[4,-7],[-15,7],[-17,-7]]
const COLOR_LIST=['blue','red','green','yellow']
const PROJ_DIFF=[-2,4,2,-4]
const BOARD_MARGIN=200
let Map=null
let coordinates=null
let finishPos=null
let muststop=null
let respawn=null

let horizontal_map=true
let boardwidth=0
let boardheight=0
let boardScale=0
$(document).ready(function(e){  

    $(".zoomin").click(function(){
    scaleBoard(Math.min(sizes.length-1,scene.cursize+=1))
  })

  $(".zoomout").click(function(){
    scaleBoard(Math.max(0,scene.cursize-=1))
  })
})  

function scaleBoard(size){
  scene.cursize=size
  // scene.canvas.setZoom(sizes[scene.cursize])
  // scene.canvas.setWidth((winwidth+(BOARD_MARGIN/2))*(1/boardScale)*sizes[scene.cursize])
  // if(horizontal_map){
  //   scene.canvas.setHeight((winheight+(BOARD_MARGIN/2))*(1/boardScale)*sizes[scene.cursize]) 

  // }
  // else{
  //   scene.canvas.setHeight((winheight+(BOARD_MARGIN))*(1/boardScale)*sizes[scene.cursize]) 
  // }
  scene.canvas.setZoom(sizes_ratio[scene.cursize]*boardScale)
  if(horizontal_map){
    scene.canvas.setWidth((winwidth)*sizes_ratio[scene.cursize])

    scene.canvas.setHeight((winheight+(BOARD_MARGIN/2))*sizes_ratio[scene.cursize]) 

  }
  else{
    scene.canvas.setWidth((winwidth+(BOARD_MARGIN/2))*sizes_ratio[scene.cursize])

    scene.canvas.setHeight((winheight+(BOARD_MARGIN))*sizes_ratio[scene.cursize]) 
  }
}



function requestMap(){
  console.log('request map, rname:'+rname)
  $.ajax({
    url:"http://jyj.ganpandirect.co.kr/getmap ",
    type:"POST",

    data:{
      rname: rname,
    },
    success:function(data) {
      try{
      
        Map=JSON.parse(data)
      }
      catch(e)
      {
        console.log("Invaild map format!")
      }
    
      coordinates=Map.coordinates         //2d array of each position on board
      finishPos=Map.finish           //finish position
      muststop=Map.muststop
      respawn=Map.respawn
      //$(".progress-bar").animate({width:"100%"},1700,boardReady)
      
      setTimeout(boardReady,1700)
      scene.drawboard()
      if(Map.mapname==='casino'){
        $("#storetoken").show()
        $("#storelife").show()
      }
    
   },
   error:function(){
    console.log("error");
   }

  });

    }

class PassProjectile{
  /**
   * 
   * @param {*} pos 위치
   * @param {*} type 종류
   * @param {*} tile 타일 오브젝트
   * @param {*} icon 아이콘 오브젝트
   * @param {*} id UPID
   */
  constructor(pos,type,tile,icon,id){
    this.pos=pos
    this.type=type
    this.tile=tile
    this.UPID=id
    this.icon=icon
  }
  show(){
      scene.canvas.bringToFront(this.tile)
      scene.canvas.bringToFront(this.icon)
      this.tile.set({
        left:coordinates[this.pos].x+BOARD_MARGIN
        ,top:coordinates[this.pos].y+BOARD_MARGIN
        ,visible:true
        ,evented:true
      })
      this.icon.set({
        left:coordinates[this.pos].x+BOARD_MARGIN
        ,top:coordinates[this.pos].y+25+BOARD_MARGIN
        ,visible:true
        ,evented:true
      })      
      scene.canvas.renderAll()
    }

    remove(){
      this.tile.set({visible:false,evented:false})
      this.icon.set({visible:false,evented:false})
      scene.canvas.renderAll()
    }
}

class ActiveProjectile{
  /**
   * @param {*} scope int[] 범위
   * @param {*} scopeTiles 타일 오브젝트들
   * @param {*} id UPID
   */
  constructor(scope,scopeTiles,id,owner,icon){
    this.scope=scope
    this.scopeTiles=scopeTiles
    this.UPID=id
    this.icon=icon
    this.owner=owner
  }

  show(){
    scene.canvas.bringToFront(this.scopeTiles[0])
    scene.canvas.bringToFront(this.icon)
    for(let i=0;i<this.scope.length;++i){
      this.scopeTiles[i].set({
        left:coordinates[this.scope[i]].x+BOARD_MARGIN+PROJ_DIFF[this.owner]
        ,top:coordinates[this.scope[i]].y+BOARD_MARGIN+PROJ_DIFF[this.owner]
        ,visible:true
        ,evented:true
      })
      

    }
    this.icon.set({
      left:coordinates[this.scope[0]].x+BOARD_MARGIN+PROJ_DIFF[this.owner]
      ,top:coordinates[this.scope[0]].y+25+BOARD_MARGIN+PROJ_DIFF[this.owner]
      ,visible:true
      ,evented:true
    })
    scene.canvas.renderAll()

  }

  remove(){
    for(let i of this.scopeTiles)
     {
       i.set({visible:false,evented:false})
       
     }
     this.icon.set({visible:false,evented:false})
      scene.canvas.renderAll()
    }
}







class Scene{
  constructor(){
    this.canvas=null
    this.cursize=1     //줌 얼마나 했는지
    this.dmgindicator=[]    
    this.moneyindicator=[]
    this.effectindicator=[]
    this.activetiles=[]      //선택가능한 타일 저장
    this.playerimgs=[]      
    this.targetimgs=[]
    this.boom=[]            //터지는효과
    this.nametexts=[]       
    this.tiles=[]           //모든타일 저장
    this.shadow=null          //화면어둡게할때 사용
    this.line=null          //스킬사용시 선
    this.heal=null        //힐 효과
    this.tooltip=null     //장애물 설명 툴팁
    this.tileselectimg=null       //타일 선택시 뜨는 효과
    this.arrow=null         //현재 턴 플레이어 표시
    this.activeProjectileList=[]
    this.effectlist=[]       //이펙트이미지 리스트
  }

  placeProj(proj){

    let newProj=new ActiveProjectile(
      proj.scope,
      this.createProjScopeTiles(proj.scope.length,COLOR_LIST[proj.owner]),
      proj.UPID,
      proj.owner,
      this.createProjIcon(proj.type)
    )

    this.activeProjectileList.push(newProj)
    newProj.show()
  }

  placePassProj(proj){
    let color='red'
    if(proj.type==='submarine'){
      color='skyblue'
    }
    let newProj=new PassProjectile(
      proj.pos,
      proj.type,      
      this.createProjScopeTiles(1,color)[0],
      this.createProjIcon(proj.type),
      proj.UPID
    )

    this.activeProjectileList.push(newProj)
    newProj.show()

  }


//delete projectile by upid
  destroyProj(UPID){
    try{
      let toDestroy=this.activeProjectileList.find((proj)=>proj.UPID===UPID)
      toDestroy.remove()
      this.activeProjectileList=this.activeProjectileList.filter((proj)=>proj.UPID!==UPID)
    }
    catch(e){
      console.log(e)
    }
    
  }

  createProjScopeTiles(size,color)
  {
    let imglist=[]
    let tileImage=[]
    switch(color){
      case 'red':
        tileImage=document.getElementById("select_red")
        break;
      case 'blue':
        tileImage=document.getElementById("select_blue")
        break;
      case 'green':
        tileImage=document.getElementById("select_green")
        break;
      case 'yellow':
        tileImage=document.getElementById("select_yellow")
        break;
      case 'skyblue':
        tileImage=document.getElementById("select_skyblue")
        break;

    
    }
    
    for(let i=0;i<size;++i)
    {
      let l=new fabric.Image(tileImage,{
          left:0,top:0,
          lockMovementX: true, lockMovementY: true,visible:false,
          hasControls: false, hasBorders:false,
          lockScalingX: true, lockScalingY:true,lockRotation: true,
          originX: 'center',
          originY: 'center',
          objectCaching: false
        })
        
        imglist.push(l)
        this.canvas.add(l)
    }
    return imglist
  }
  createProjIcon(type){
    console.log('projicon'+type)
    let icon=null
    switch(type){
      case 'submarine':
        icon=document.getElementById("submarineimg")
        break
      case 'reaper_w':
        icon=document.getElementById("proj_reaper_w")
        break
      case 'ghost_r':
        icon=document.getElementById("proj_ghost_r")
        break
      case 'sniper_w':
        icon=document.getElementById("proj_sniper_w")
        break
      case 'magician_r':
        icon=document.getElementById("proj_magician_r")
        break
    }

    let l=new fabric.Image(icon,{
      left:0,top:0,
      lockMovementX: true, lockMovementY: true,visible:false,
      hasControls: false, hasBorders:false,
      lockScalingX: true, lockScalingY:true,lockRotation: true,
      originX: 'center',
      originY: 'center',
      objectCaching: false
    })
    l.scale(0.8)
    return l


  }

  playersToFront()
  {
    for(let p of this.playerimgs)
    {
      p.bringToFront()
    }
    this.canvas.renderAll()
  }

  drawboard()
  { 
    this.canvas=new fabric.Canvas("board",{renderOnAddRemove:false})
    this.canvas.preserveObjectStacking = true;

    this.canvas.selection=false
      let boardimg=document.getElementById("boardimg")
      if(Map.mapname === 'ocean'){
        boardimg=document.getElementById("ocean_boardimg")
      }
      if(Map.mapname === 'casino'){
        boardimg=document.getElementById("casino_boardimg")
      }

      this.canvas.setBackgroundImage(new fabric.Image(boardimg,{
        //  scaleX:scale,scaleY:scale,
          left:0,top:0,
          lockMovementX: true, lockMovementY: true,
          hasControls: false,
          lockScalingX: true, lockScalingY:true,lockRotation: true,
          hoverCursor: "pointer",
          objectCaching: false
        }))
      boardwidth=boardimg.naturalWidth
      boardheight=boardimg.naturalHeight

      let win_ratio=winwidth/winheight
      let board_ratio=(boardwidth-BOARD_MARGIN)/(boardheight-BOARD_MARGIN)

      let scale=1
      scale = winwidth/(boardwidth-BOARD_MARGIN)
      
      boardScale=scale
      sizes[0]=boardScale-(boardScale*0.2)

      for(let i=1;i<6;++i){
        sizes[i]=boardScale+((i-1)*boardScale*0.2)
      }
      //casino map
      if(win_ratio>=board_ratio){
        //scale = winheight/(boardheight-BOARD_MARGIN)
        winheight=boardheight*boardScale
        console.log('height')
        this.canvas.setWidth(winwidth+BOARD_MARGIN/2)
        this.canvas.setHeight(winheight+BOARD_MARGIN)
        $("#canvas-container").css("width", winwidth)
        $("#canvas-container").css("height", winheight)
        horizontal_map=false
      }
      //other map
      else{
        winwidth=boardwidth*boardScale
        this.canvas.setWidth(winwidth)
        this.canvas.setHeight(winheight+BOARD_MARGIN/2)
        $("#canvas-container").css("width", winwidth-BOARD_MARGIN/2)
        $("#canvas-container").css("height", winheight)
        $("#boardside").css("width", winwidth-BOARD_MARGIN)
        horizontal_map=true
      }
      this.canvas.setZoom(boardScale)
      board_container.scrollTo(BOARD_MARGIN*boardScale,BOARD_MARGIN*boardScale)
      let obsimg=document.getElementById('obstacles')
      let tile_img=document.getElementById('tiles')
      if(Map.mapname === 'ocean'){
        tile_img=document.getElementById('tiles_ocean')
      }
      if(Map.mapname === 'casino'){
        tile_img=document.getElementById('tiles_casino')    
      }

      
      for(let i=0;i<coordinates.length;++i)
      {
        this.drawWay(i,obsimg,tile_img)
      }

      //갈림길
      // if(way2!==null){
      //   for(let i=0;i<way2.length;++i)
      //   {
      //     this.drawWay(i,false)
      //   }
      // }
      this.shadow=new fabric.Rect({
        left:0,top:0,width:2500,height:2500,
        lockMovementX: true, lockMovementY: true,visible:false,
        hasControls: false,hasBorders:false,evented:false,
        lockScalingX: true, lockScalingY:true,lockRotation: true,
        opacity:0.4
    })
       this.canvas.add(this.shadow)
       this.shadow.bringForward()
       this.showObjects()
  }
/**
 * 
 * @param {*} i 칸 번호
 * @param {*} isMain 메인 길인지 갈림길인지
 */
  drawWay(i,obsimg,tileimg){

    let obs_id=0
    
    obs_id=coordinates[i].obs

  //  let index=num;
    if(obs_id===-1||obs_id===0){
      
      this.tiles.push(null)
      return
    }         //-1,0

    // let img=this.obsimglist.item(index)

    let o=new fabric.Image(obsimg,{
      originX: 'center',
      originY: 'center',         
      width:50,height:50,
      cropX: 50* obs_id,
      cropY:0,
      objectCaching: false
    })

    //마법의성, 눈덩이, 흡혈귀, 카지노,빙산, 어뢰는 확대
    if(!(obs_id===12 || obs_id===16 || obs_id===17 || obs_id===38 || 
      obs_id===46 || obs_id===58)){
      o.scale(0.6)
    }
    else{
      o.scale(0.8)
    }

    let tile_id=chooseTile(i)
   
    let t=new fabric.Image(tileimg,{
      originX: 'center',
      originY: 'center',
      width:55,height:55,
      cropX: 55* tile_id,
      cropY:0,
      objectCaching: false
    })
    
    let group=new fabric.Group([t,o],{evented:false,
    })
    this.lockFabricObject(group)
    this.canvas.add(group)
    
    this.tiles.push(group)
    
    group.sendToBack()
  }

  showObjects()
  {

    //화살표 ================================
    let arrow=new fabric.Image(document.getElementById('arrow'),{
      evented:false,opacity:0,left:0,top:0,scaleX:0.5,scaleY:0.5,
      objectCaching: false
    })
    this.lockFabricObject(arrow)
    this.canvas.add(arrow)
    this.arrow=arrow
    //공격선=================================================================


      //console.log("tilelength"+this.tiles.length)
      let line=new fabric.Line([0,0,300,300],{
        evented:false,originX:"left",fill:"red",stroke: 'red',
        strokeWidth: 4,opacity:0,
        objectCaching: false
    })

    this.lockFabricObject(line)
    this.canvas.add(line)
    this.line=line
    //장애물 툴팁=================================================================

    let tooltip=new fabric.Text("",{
      fontSize: 20,fill:'white',
      textBackgroundColor:'black',
      opacity:1,
      evented:false,
      strokeWidth:1,
      top:0,left:0,
      fontFamily:'Do Hyeon'
  })
  this.lockFabricObject(tooltip)
  this.canvas.add(tooltip)
  this.tooltip=tooltip
    //힐=================================================================

    let healimg=document.getElementById('healimg')
    let heal=new fabric.Image(healimg,{
      evented:false,opacity:0,left:0,top:0,
      objectCaching: false
  })

    this.lockFabricObject(heal)
    this.canvas.add(heal)
    this.heal=heal    
    //이펙트들=================================================================
    //이펙트 리스트
    for(let i=0;i<15;++i){
      let img=new fabric.Image(document.getElementById("effect"+String(i+1)),{
        evented:false,opacity:0,left:0,top:0,
        objectCaching: false
    })
    this.lockFabricObject(img)
    this.canvas.add(img)
    this.effectlist.push(img)

    }


    //타일선택=================================================================


    this.tileselectimg=new fabric.Image(document.getElementById('tileselectimg'),{
      evented:false,opacity:0,left:0,top:0,
      objectCaching: false
  })

    this.lockFabricObject(this.tileselectimg)
    this.canvas.add(this.tileselectimg)
      for(let i=0;i<this.tiles.length;++i)
      {
        if(this.tiles[i]===null) {continue}
        this.tiles[i].set({top:(coordinates[i].y+BOARD_MARGIN),left:(coordinates[i].x+BOARD_MARGIN)})        
      }
     

      this.canvas.renderAll()

     //플레이어=================================================================

      for(let i=0;i<game.S;++i)
      {
        let img= document.getElementById("playerimg"+(game.player_champlist[i]+1))


        let p=new fabric.Image(img,{
            left:(coordinates[0].x+diff[i][0]+BOARD_MARGIN)
            ,top:(coordinates[0].y+diff[i][1]+BOARD_MARGIN)
            ,evented:false,
            objectCaching: false
        })
        this.lockFabricObject(p)
        this.canvas.add(p.scale(0.35))
        p.bringToFront();
        this.playerimgs.push(p)
    //터지는효과=================================================================

      img=document.getElementById('boom')
      let e=new fabric.Image(img,{
          evented:false,top:10,left:10,opacity:0
      })
      this.lockFabricObject(e)
      this.canvas.add(e.scale(0.8))
      e.bringToFront();
      this.boom.push(e)
    //플레이어이름=================================================================

      let name=new fabric.Text("",{
        fontSize: 20,fill:'white',
        opacity:1,
        evented:false,
        stroke: 'black',
        strokeWidth:1,
        top:0,left:0,
        fontFamily:'Do Hyeon'
    })
    this.lockFabricObject(name)
    this.canvas.add(name)
    name.bringToFront();
    this.nametexts.push(name)
      
      //타겟선택=================================================================

    
      let target=new fabric.Image(document.getElementById("targetimg"),
        {opacity:0,
          width:128,height:128,
          visible:false,
          hoverCursor: "pointer",
          objectCaching: false
        })
        this.lockFabricObject(target)


        this.canvas.add(target.scale(0.4))
        this.targetimgs.push(target)
        target.bringToFront();
  //데미지=================================================================

        let d = new fabric.Text("", {
        fontSize: 40,fill:'#D81B60',
        opacity:1,fontWeight: 'bold',
        width:500,height:500,
        evented:false,
        top:100,left:100,
        fontFamily:'Do Hyeon'
        });
        this.lockFabricObject(d)
        this.canvas.add(d)
        d.bringToFront();
        this.dmgindicator.push(d)

  //돈=================================================================

        let m = new fabric.Text("", {
        fontSize: 40,fill:'orange',
        opacity:1,fontWeight: 'bold',
        width:500,height:500,
        evented:false,
        top:100,left:100,
        fontFamily:'Do Hyeon'
        });
        this.lockFabricObject(m)
        this.canvas.add(m)
        m.bringToFront();
        this.moneyindicator.push(m)

      }
    //이펙트=================================================================

      for(let i=0;i<3;++i)
      {
          let e = new fabric.Text("", {
          fontSize: 50,fill:'purple',
          opacity:1,fontWeight: 'bold',
          width:500,height:500,evented:false,
          top:100,left:100,
          fontFamily:'Do Hyeon'
          });
          this.lockFabricObject(e)
          this.canvas.add(e)
          this.canvas.moveTo(e, 1);
          this.effectindicator.push(e)
      }


  }

  showProjectileRange(size)
  {
    let projrange=[]
    for(let i=0;i<size;++i)
    {
      let l=new fabric.Image(document.getElementById("tileselect"),{
          left:0,top:0,
          lockMovementX: true, lockMovementY: true,visible:false,
          hasControls: false,hasBorders:false,
          lockScalingX: true, lockScalingY:true,lockRotation: true,
          originX: 'center',
          originY: 'center',
          objectCaching: false
        })
        projrange.push(l)
        this.canvas.add(l)
    }
    return projrange
  }
  lockFabricObject(obj){
    obj.set({lockMovementX: true, lockMovementY: true,
    hasControls: false,hasBorders:false,
    lockScalingX: true, lockScalingY:true,lockRotation: true,
    originX: 'center',
    originY: 'center'})
  }



  /**
   * 
   * @param {*} actualdice 주사위 숫자
   * @param {*} count 현재까지 이동한 칸수
   * @param {*} pos 움직이기 전 위치
   * @param {*} turn 플레이어 턴
   */
  moveBackward(actualdice,count,pos,turn){
    //뒤로가는 주사위 and 플레이어가 시작점이 아닐경우
    

    if(count > -1 * actualdice){
      moveComplete(false)
      let ui=game.turn2ui(turn)
      this.nametexts[turn].set("text",$(names[ui]).html())
      this.updateNameText(turn)      
      return;
    }
    let x=coordinates[pos-count].x+diff[turn][0]+BOARD_MARGIN
    let y=coordinates[pos-count].y+diff[turn][1]+BOARD_MARGIN

    this.playerimgs[turn].animate('left', (x), {
      onChange: this.canvas.renderAll.bind(this.canvas),
      duration: 100,
      easing: fabric.util.ease.easeOutCubic
    });
    this.playerimgs[turn].animate('top',(y),{
      onChange: this.canvas.renderAll.bind(this.canvas),
      duration: 100,
      easing: fabric.util.ease.easeOutCubic
    });
    let time=100
    if(game.simulation){
      time=20
    }
    setTimeout(function(){this.movePlayer(actualdice,count+1,pos,turn)}.bind(this),time)

  }

  moveForward(actualdice,count,pos,turn){
 // if((pos+count)>finishPos){
    //   moveComplete(true)
    //   return;
    // }

   

    if(count>actualdice){
      moveComplete(false)
      let ui=game.turn2ui(turn)
      this.nametexts[turn].set("text",$(names[ui]).html())
      this.updateNameText(turn)

      return;
    }
    let x=coordinates[pos+count].x+diff[turn][0]+BOARD_MARGIN
    let y=coordinates[pos+count].y+diff[turn][1]+BOARD_MARGIN

    this.playerimgs[turn].animate('left', (x), {
      onChange: this.canvas.renderAll.bind(this.canvas),
      duration: 100,
      easing: fabric.util.ease.easeOutCubic
    });
    this.playerimgs[turn].animate('top',(y),{
      onChange: this.canvas.renderAll.bind(this.canvas),
      duration: 100,
      easing: fabric.util.ease.easeOutCubic
    });
    let time=100
    if(game.simulation){
      time=20
    }
    setTimeout(function(){this.movePlayer(actualdice,count+1,pos,turn)}.bind(this),time)
  }
  /**
   * 
   * @param {*} actualdice 주사위 숫자
   * @param {*} count 현재까지 이동한 칸수
   * @param {*} pos 움직이기 전 위치
   * @param {*} turn 플레이어 턴
   */
  movePlayer(actualdice,count,pos,turn)
  {
    this.arrow.set({opacity:0})
    this.arrow.bringToFront()
    if(actualdice===0){
      moveComplete(false)
      return;
    }
    this.nametexts[turn].set("text",'')

    if(actualdice<0){
      
      if(-1 *actualdice > pos ){ actualdice = -1 * pos}
      this.moveBackward(actualdice,count,pos,turn)
      return
    }

    this.moveForward(actualdice,count,pos,turn)
    let p=scene.getTilePos(pos+actualdice) 
    if(game.ismyturn){
      moveBoard(p,3)
    }

  }



  tpPlayer(target,pos)
  {
    this.playerimgs[target].set({opacity:1})
    let x=coordinates[pos].x+BOARD_MARGIN
    let y=coordinates[pos].y+BOARD_MARGIN
    this.playerimgs[target].set({left:(x+diff[target][0]),top:0})
    
    game.player_locations[target]=pos
    let time=800
    if(game.simulation){
      time=200
    }
    this.playerimgs[target].animate('top',(y+diff[target][1]),{
      onChange: this.canvas.renderAll.bind(this.canvas),
      duration: time,
      easing: fabric.util.ease.easeOutBounce
    });
    if(target===game.myturn){
      setTimeout(moveBoardInstant({x:x,y:y},2),time-100)
    }

  }
  levitatePlayer(target)
  {
    let time=500
      if(game.simulation){
        time=100
      }
    let thisimg=this.playerimgs[target]
    thisimg.animate('top',0,{
      onChange: this.canvas.renderAll.bind(this.canvas),
      duration: time,
      easing: fabric.util.ease.easeInCubic
    });
    
    
      setTimeout(function(){thisimg.set({opacity:0})}.bind(this),time)
    }

    showEffect(target,type,change){
      
      let pos=this.getPlayerPos(target)
      let scale=1
      switch(type){
        //평타
        case 'hit':
          
          this.defaultEffect(target,change)
          android_playsound('hit')
          break;
        //점화
        case 'fire':
          scale=1
          this.effectlist[0].set({opacity:0.7,left:pos.x,top:pos.y,scaleX:scale,scaleY:scale}).bringToFront()
          this.effectlist[0].animate('opacity',0,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 1200,
            easing: fabric.util.ease.easeOutCubic
          });
          break;
           //폭발
        case 'explode':
          android_playsound('largeexplode')
        scale=1.8
        if(change<-50){scale=4}

        this.effectlist[3].set({opacity:0.9,left:pos.x,top:pos.y-20,scaleX:scale,scaleY:scale}).bringToFront()
        this.effectlist[3].animate('opacity',0,{
          onChange: this.canvas.renderAll.bind(this.canvas),
          duration: 1700,
          easing: fabric.util.ease.easeOutCubic
        });
        this.effectlist[3].animate('scaleX',scale+3,{
          onChange: this.canvas.renderAll.bind(this.canvas),
          duration: 1700,
          easing: fabric.util.ease.easeOutCubic
        });
        this.effectlist[3].animate('scaleY',scale+3,{
          onChange: this.canvas.renderAll.bind(this.canvas),
          duration: 1700,
          easing: fabric.util.ease.easeOutCubic
        });
          break;
           //칼
        case 'knife':
          android_playsound('slash')
          console.log('knife')
          scale=1.8
          this.effectlist[2].set({opacity:0.7,left:pos.x,top:pos.y,scaleX:scale,scaleY:scale}).bringToFront()
          this.effectlist[2].animate('opacity',0,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 2000,
            easing: fabric.util.ease.easeInCubic
          });
          break;
           //방어막 깨질때
        case 'shield':
          android_playsound('glassbreak')
          scale=1.8
          this.effectlist[11].set({opacity:0.7,left:pos.x,top:pos.y,scaleX:scale,scaleY:scale}).bringToFront()
          this.effectlist[11].animate('opacity',0,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 2000,
            easing: fabric.util.ease.easeInCubic
          });
          break;
           //쓰나미
        case 'wave':
          android_playsound('wave')
          this.defaultEffect(target,change)
          break;
          //이펙트만(노데미지)
        case 'nodmg_hit':
          this.defaultEffect(target,change)

          break;
          //번개
        case 'lightning':
          android_playsound('lightning')
          android_playsound('hit')
          this.defaultEffect(target,change)
          break;
        case 'elephant_q':
          android_playsound('stab')
          this.defaultEffect(target,change)
          scale=1.0
          this.effectlist[1].set({opacity:0.9,left:pos.x-20,top:pos.y,scaleX:scale,scaleY:scale,angle:0}).bringToFront()
          this.effectlist[1].animate('opacity',0,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 1000,
            easing: fabric.util.ease.easeInCubic
          });
          this.effectlist[1].animate('angle',-90,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 200,
            easing: fabric.util.ease.easeInCubic
          });
          break;
          case 'elephant_r':
            android_playsound('2r')
            scale=1.5
            this.effectlist[13].set({opacity:0.9,left:pos.x,top:pos.y-50,scaleX:scale,scaleY:0.5,angle:0}).bringToFront()
            this.effectlist[13].animate('opacity',0,{
              onChange: this.canvas.renderAll.bind(this.canvas),
              duration: 1000,
              easing: fabric.util.ease.easeInCubic
            });
            this.effectlist[13].animate('scaleY',scale+5,{
              onChange: this.canvas.renderAll.bind(this.canvas),
              duration: 700,
              easing: fabric.util.ease.easeOutCubic
            });
            this.effectlist[14].set({opacity:0.9,left:pos.x,top:pos.y,scaleX:scale,scaleY:scale,angle:0}).bringToFront()
            this.effectlist[14].animate('opacity',0,{
              onChange: this.canvas.renderAll.bind(this.canvas),
              duration: 3000,
              easing: fabric.util.ease.easeInCubic
            });

          break
        case 'reaper_q':
          android_playsound('stab')
          this.defaultEffect(target,change)
          scale=1.5
          this.effectlist[7].set({opacity:0.9,left:pos.x-20,top:pos.y-50,scaleX:scale,scaleY:scale,angle:0}).bringToFront()
          this.effectlist[7].animate('opacity',0,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 1500,
            easing: fabric.util.ease.easeInCubic
          });
          this.effectlist[7].animate('angle',90,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 300,
            easing: fabric.util.ease.easeInCubic
          });
          break;
        case 'reaper_r':
          android_playsound('1r')
          this.defaultEffect(target,change)
          scale=1.2
          this.effectlist[10].set({opacity:1,left:pos.x,top:pos.y-300,scaleX:scale,scaleY:scale}).bringToFront()
          this.effectlist[10].animate('opacity',0,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 3000,
            easing: fabric.util.ease.easeInCubic
          });
          this.effectlist[10].animate('top',pos.y,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 500,
            easing: fabric.util.ease.easeInCubic
          });
          break;
        case 'ghost_q':
          this.defaultEffect(target,change)
          android_playsound('hit')
          scale=1.5
          this.effectlist[8].set({opacity:0.8,left:pos.x,top:pos.y,scaleX:scale,scaleY:scale,angle:0}).bringToFront()
          this.effectlist[8].animate('opacity',0,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 1500,
            easing: fabric.util.ease.easeInCubic
          });
      
          break;
        case 'ghost_r':
          android_playsound('3r')
          this.defaultEffect(target,change)
          scale=2
          this.effectlist[9].set({opacity:0.7,left:pos.x,top:pos.y,scaleX:scale,scaleY:scale,angle:0}).bringToFront()
          this.effectlist[9].animate('opacity',0,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 1500,
            easing: fabric.util.ease.easeInCubic
          });
          break;
        case 'dinosaur_q':
          this.defaultEffect(target,change)
          android_playsound('hit')
          scale=1.6
          this.effectlist[6].set({opacity:0.7,left:pos.x,top:pos.y,scaleX:scale,scaleY:scale}).bringToFront()
          this.effectlist[6].animate('opacity',0,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 2000,
            easing: fabric.util.ease.easeInCubic
          });
          break;
        case 'dinosaur_r':
          android_playsound('4r')
          scale=2
          this.effectlist[0].set({opacity:0.9,left:pos.x,top:pos.y+20,scaleX:scale,scaleY:scale,originY: 'bottom'}).bringToFront()
          this.effectlist[0].animate('opacity',0,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 2700,
            easing: fabric.util.ease.easeInCubic
          });
     
          this.effectlist[0].animate('scaleY',scale+3,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 1100,
            easing: fabric.util.ease.easeInCubic
          });
          break;
        case 'sniper_q':
          android_playsound('gun')
          this.defaultEffect(target,change)

          scale=1.4

          this.effectlist[12].set({opacity:0.9,left:pos.x+30,top:pos.y+30,scaleX:scale,scaleY:scale}).bringToFront()
          this.effectlist[12].animate('opacity',0,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 400,
            easing: fabric.util.ease.easeInCubic
          });
          this.effectlist[12].animate('scaleX',scale+1.7,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 200,
            easing: fabric.util.ease.easeOutCubic
          });
          this.effectlist[12].animate('scaleY',scale+1.7,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 200,
            easing: fabric.util.ease.easeOutCubic
          });
          break;
        case 'sniper_r':
          android_playsound('5r')
          this.defaultEffect(target,change)
          scale=3

          this.effectlist[12].set({opacity:0.9,left:pos.x+30,top:pos.y+30,scaleX:scale,scaleY:scale}).bringToFront()
          this.effectlist[12].animate('opacity',0,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 400,
            easing: fabric.util.ease.easeInCubic
          });
          this.effectlist[12].animate('scaleX',scale+2.7,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 200,
            easing: fabric.util.ease.easeOutCubic
          });
          this.effectlist[12].animate('scaleY',scale+2.7,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 200,
            easing: fabric.util.ease.easeOutCubic
          });

          scale=1.8
        if(change<-50){scale=4}

        this.effectlist[3].set({opacity:0.9,left:pos.x,top:pos.y-20,scaleX:scale,scaleY:scale}).bringToFront()
        this.effectlist[3].animate('opacity',0,{
          onChange: this.canvas.renderAll.bind(this.canvas),
          duration: 1700,
          easing: fabric.util.ease.easeOutCubic
        });
        this.effectlist[3].animate('scaleX',scale+3,{
          onChange: this.canvas.renderAll.bind(this.canvas),
          duration: 1700,
          easing: fabric.util.ease.easeOutCubic
        });
        this.effectlist[3].animate('scaleY',scale+3,{
          onChange: this.canvas.renderAll.bind(this.canvas),
          duration: 1700,
          easing: fabric.util.ease.easeOutCubic
        });
          break;
        case 'magician_q':
          this.defaultEffect(target,change)
          android_playsound('hit')
          scale=1.5
          this.effectlist[5].set({opacity:0.8,left:pos.x,top:pos.y,scaleX:scale,scaleY:scale}).bringToFront()
          this.effectlist[5].animate('opacity',0,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 1600,
            easing: fabric.util.ease.easeInCubic
          });
          break;
        case 'magician_r':
          android_playsound('6r')
          this.defaultEffect(target,change)
          scale=2.5
          this.effectlist[4].set({opacity:0.8,left:pos.x,top:pos.y,scaleX:scale,scaleY:scale}).bringToFront()
          this.effectlist[4].animate('opacity',0,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 2700,
            easing: fabric.util.ease.easeInCubic
          });
          break;


      }
    }

    defaultEffect(target,change){
      
      let pos=this.getPlayerPos(target)
      
      let scale=0.8
      if(change<-50){scale=1.8}
      if(change<-200){scale=2.8}

      this.boom[target].set({opacity:0.7,left:pos.x,top:pos.y,scaleX:scale,scaleY:scale}).bringToFront()
      this.boom[target].animate('opacity',0,{
        onChange: this.canvas.renderAll.bind(this.canvas),
        duration: 700,
        easing: fabric.util.ease.easeOutCubic
      });
      this.boom[target].animate('scaleX',scale+0.7,{
        onChange: this.canvas.renderAll.bind(this.canvas),
        duration: 700,
        easing: fabric.util.ease.easeOutCubic
      });
      this.boom[target].animate('scaleY',scale+0.7,{
        onChange: this.canvas.renderAll.bind(this.canvas),
        duration: 700,
        easing: fabric.util.ease.easeOutCubic
      });

    }


    animateHP(target,hp,maxhp,change,skillfrom,type)
    {
        console.log('animateHP'+change)
        
        if(skillfrom>0){
         
          let pos1=this.getPlayerPos(target)
          let pos2=this.getPlayerPos(skillfrom-1)
          
          this.line.set({opacity:1,x1:pos1.x,y1:pos1.y,x2:pos2.x,y2:pos2.y}).bringToFront()
          setTimeout(()=>this.line.set({opacity:0}),400)
          this.canvas.renderAll()

          if(skillfrom-1===game.myturn && !game.simulation){
            let win=document.getElementById('canvas-container')
            setTimeout(()=>win.scrollBy(30,0),50)
            setTimeout(()=>win.scrollBy(-30,0),100)
            // setTimeout(()=>win.scrollBy(15,0),100)
            // setTimeout(()=>win.scrollBy(-15,0),150)
          }
          if(target===game.myturn){
            $(".red").css("opacity","100%")
            $(".red").animate({
              opacity:0
            },300)
          }
        }


        let ui=game.turn2ui(target)
        if(ui===0){
          $(hpframe[ui]).animate({
            "width":String(maxhp)+"px"
          },300)
  
          $(hpspan[ui]).animate({
            "width":String(hp)+"px"
          },300)
        }
        else{
          $(hpframe[ui]).animate({
            "width":String(0.3*maxhp+4)+"px"
          },300)
  
          $(hpspan[ui]).animate({
            "width":String(0.3*hp)+"px"
          },300)
        }


        if(maxhp>=600 && ui===0){
          $(hpframe[ui]).css({
            "transform":"scale(0.5,1)"
          })
        }
        else if(maxhp>=600){
          $(hpframe[ui]).css({
            "transform":"scale(0.7,1)"
          })
        }
        


        let name=$(names[ui]).html().split(" ")[0]
        $(names[ui]).html(name+" "+String(hp)+"/"+String(maxhp))

        this.nametexts[ui].set("text",$(names[ui]).html())


        if(type==='noeffect'){return}
        let pos=this.getPlayerPos(target)
        if(change<0 ||  type==='nodmg_hit' ||  type==='shield'){
          console.log('showEffect'+type)
          this.showEffect(target,type,change)
         // playHitSound('hit')
         
        }
        else if(type==='heal'){
          android_playsound('heal')
          let sc=1
          if(change>100){sc=2.5}
          this.heal.set({opacity:1,left:pos.x,top:pos.y-40 * sc,scaleY:sc}).bringToFront()
          this.heal.animate('opacity',0,{
            onChange: this.canvas.renderAll.bind(this.canvas),
            duration: 4000,
            easing: fabric.util.ease.easeOutCubic
          });
        }
        
      
        if(change >=0 && change<=10){
          return
        }

        let x=pos.x + (Math.random() * 20)
        let y=pos.y +( Math.random() * 20)
      this.dmgindicator[target].set({top:y,left:x,opacity:1}).bringToFront()
      if(change<0){
        this.dmgindicator[target].set({fill:'#E11900 '})
        this.dmgindicator[target].set('text',String(change))
        if(change>-50){
          this.dmgindicator[target].set('fontSize',50)
        }
        else if(change>-300)
        {
          this.dmgindicator[target].set('fontSize',60)
        }
        else
        {
          this.dmgindicator[target].set('fontSize',85)
        }
      }
      else
      {
        this.dmgindicator[target].set('fill','green')
        this.dmgindicator[target].set('text',('+'+String(change)))
        this.dmgindicator[target].set('fontSize',50)
        if(change>150){
          this.dmgindicator[target].set('fontSize',80)
        }
      }
      let time=3000
      if(game.simulation){
        time=1000
      }
      this.dmgindicator[target].animate('opacity',0,{
        onChange: this.canvas.renderAll.bind(this.canvas),
        duration: time,
        easing: fabric.util.ease.easeOutCubic
      });
      this.dmgindicator[target].animate('top',(y-50),{
        onChange: this.canvas.renderAll.bind(this.canvas),
        duration: time,
        easing: fabric.util.ease.easeOutCubic
      });
    }
    indicateMoney(target,money){
      if(money<10 && money>=0){
        return
      }

      if(money>10){
        android_playsound('gold') 
      }
      

      let pos=this.getPlayerPos(target)
      let x=pos.x
      let y=pos.y
      this.moneyindicator[target].set({top:(y),left:x,opacity:1}).bringToFront()
      this.moneyindicator[target].set('fontSize',40)
      if(money<0)
      {
        this.moneyindicator[target].set({fill:'#7E00BF'})
        this.moneyindicator[target].set('text',(String(money)+"$"))
        console.log(money+"money")
      }
      else
      {
        this.moneyindicator[target].set('fill','orange')
        this.moneyindicator[target].set('text',('+'+String(money)+"$"))
        if(money>=70)
        {
          this.moneyindicator[target].set('fontSize',50)
        }
        if(money>150)
        {
          this.moneyindicator[target].set('fontSize',70)
        }
        if(money>1000)
        {
          this.moneyindicator[target].set('fontSize',130)
        }
      }
      let time=3000
      if(game.simulation){
        time=1000
      }
      this.moneyindicator[target].animate('opacity',0,{
        onChange: this.canvas.renderAll.bind(this.canvas),
        duration: time,
        easing: fabric.util.ease.easeOutCubic
      });
      this.moneyindicator[target].animate('top',(y-50),{
        onChange: this.canvas.renderAll.bind(this.canvas),
        duration: time,
        easing: fabric.util.ease.easeOutCubic
      });

    }
    

    indicateEffect(target,effect,num)
    {
      if(num===-1){return}
      if(!num){num=0}
      let e=""
      switch(effect)
      {
        case 0:
          e="Slow!"
          this.effectindicator[num].set({fill:'blue'})
        break;
        case 1:
          e="Speed!"
          this.effectindicator[num].set({fill:'blue'})
        break;
        case 2:
          e="Stun!"
          this.effectindicator[num].set({fill:'purple'})
        break;
        case 3:
          e="Silent!"
          this.effectindicator[num].set({fill:'purple'})
        break;
        case 4:
          e="Shield!"
          this.effectindicator[num].set({fill:'green'})
        break;
        case 5:
          e="Poison!"
          this.effectindicator[num].set({fill:'green'})
        break;
        case 6:
          e="Radiation!"
          this.effectindicator[num].set({fill:'green'})
        break;
        case 7:
          e="Annuity!"
          this.effectindicator[num].set({fill:'green'})
        break;
        case 8:
          e="Slaved!"
          this.effectindicator[num].set({fill:'red'})
        break;
        case 11:
          e="Blind!"
          this.effectindicator[num].set({fill:'purple'})
        break;
        case 12:
          e="Ignite!"
          this.effectindicator[num].set({fill:'orange'})
        break;
        case 13:
          e="Invisible!"
          this.effectindicator[num].set({fill:'green'})
        break;
        case 14:
          e="Private Loan!"
          this.effectindicator[num].set({fill:'purple'})
        break;
        case 15:
          e="Annuity Lottery!"
          this.effectindicator[num].set({fill:'green'})
        break;
        case 16:
          e="Cursed!"
          this.effectindicator[num].set({fill:'red'})
        break;

      }

      let pos=this.getPlayerPos(target)
      let x=pos.x
      let y=pos.y
      let time=3000
      if(game.simulation){
        time=1000
      }
      this.effectindicator[num].set({top:(y-50-(num*50)),left:(x-50),opacity:1}).bringToFront()
      this.effectindicator[num].set('text',e)

      this.effectindicator[num].animate('opacity',0,{
        onChange: this.canvas.renderAll.bind(this.canvas),
        duration: time,
        easing: fabric.util.ease.easeOutCubic
      });
      this.effectindicator[num].animate('top','-=50',{
        onChange: this.canvas.renderAll.bind(this.canvas),
        duration: time,
        easing: fabric.util.ease.easeOutCubic
      });
    }

    showTarget(targets,godhand)
    {
      prepareSelection()

      if(godhand){
        $("#godhandcancel").show()
      }
      else{
         $("#skillcancel").show()
      }
     
      this.canvas.discardActiveObject()
      for(let tr of targets)
      {
        let pos=this.getPlayerPos(tr)
        let x=pos.x
        let y=pos.y
        let tL= () => targetSelected(tr,godhand)
        this.targetimgs[tr].on('selected',tL);
        this.targetimgs[tr].set({left:(x),top:y,opacity:1,scaleY:3.3,visible:true})
        this.targetimgs[tr].bringToFront()
        this.targetimgs[tr].animate('scaleY',0.4,{
          onChange: this.canvas.renderAll.bind(this.canvas),
          duration: 500,
          easing: fabric.util.ease.easeOutBounce
        });
      }
    }
    resetTarget()
    {
      for(let t of this.targetimgs)
      {
        t.set({hasBorders:false,visible:false} )
        t.off()
        t.animate('scaleY',0.4,{
          onChange: this.canvas.renderAll.bind(this.canvas),
          duration: 100,
          easing: fabric.util.ease.easeOutCubic
        });

      }
      hideSkillCancel()
    }
    showTooltip(index){
      let i=Map.coordinates[index].obs
      let desc=obstacleList.obstacles[i].desc
      let pos=this.getTilePos(index)

      this.tooltip.set({text:desc,opacity:1,top:pos.y+30,left:pos.x})
      this.tooltip.bringToFront()      

    }
    showSelectedTile(index){
      let pos=this.getTilePos(index)
      this.tileselectimg.set({left:pos.x,top:pos.y-10,opacity:1}).bringToFront()
      this.canvas.renderAll()      
    }
    
    
    
    liftTile(index,type)
    {
      
      if(this.tiles[index]===null||index>=this.tiles.length||index<0) {return}
      this.activetiles.push(index)

      if(type==='godhand' || type==='submarine'){
          let select=function(){
          $("#confirm_tileselection").off()
          this.tooltip.set({opacity:0})
          this.showTooltip(index)
          this.showSelectedTile(index)

          $("#confirm_tileselection").click(function(){
            this.onTileClick(index,type)

          }.bind(this))

        }.bind(this)

        this.tiles[index].on('selected',select)

      }
      else{
        let select=function(){
          $("#confirm_tileselection").off()
          

          this.showSelectedTile(index)
          $("#confirm_tileselection").click(function(){
            this.onTileClick(index,type)

          }.bind(this))

        }.bind(this)
        this.tiles[index].on('selected',select)
      }
      


      

      this.tiles[index].set({hoverCursor:"pointer",evented:true})

      this.tiles[index].bringToFront()

      this.tiles[index].animate('top','-=10',{
        onChange: this.canvas.renderAll.bind(this.canvas),
        duration: 500,
        easing: fabric.util.ease.easeOutCubic
      });
    }

    tileReset()
    {
      $("#cancel_tileselection").hide()
      $("#confirm_tileselection").hide()
      $("#cancel_tileselection").off()
      $("#confirm_tileselection").off()
      this.tileselectimg.set({x:0,y:0,opacity:0})

      this.canvas.discardActiveObject()
      this.playersToFront()
      for(let t of this.activetiles)
      {
        this.tiles[t].off()
        this.tiles[t].sendToBack()
        this.tiles[t].set({hoverCursor:"defalut",evented:false,scaleX:1,scaleY:1})
        
        this.tiles[t].animate('top','+=10',{
          onChange: this.canvas.renderAll.bind(this.canvas),
          duration: 1000,
          easing: fabric.util.ease.easeOutCubic
        });
      }
      this.shadow.set({visible:false})
      this.tooltip.set({opacity:0})

      this.shadow.sendToBack()
      this.canvas.renderAll()
      this.activetiles=[]
    }

    onTileClick(index,type){
      this.tileSelected(index,type)
    }
    tileSelected(index,type)
    {
      if(this.tiles[index]===null||index>=this.tiles.length||index<0) {return}

      
      this.tileReset()
      if(type==='godhand'){
        this.teleportPlayer(game.godhandtarget,index)
        this.tooltip.set({opacity:0})
        let godhand_info={
          complete:true,
          target:game.godhandtarget,
          location:index,
          type:'godhand'
        }
        console.log("godhand location selected"+godhand_info)
        game.godhandtarget=-1

        sendGodHandInfo(godhand_info)
      }
      else if(type==='skill'){
        sendTileLocation(index)
      }
      else if(type==='submarine'){
        this.tooltip.set({opacity:0})
        sendSubmarineDest(index)
      }
      $("#largetext").html("")
      this.canvas.renderAll()

    }


    teleportPlayer(target,pos){
      this.levitatePlayer(target)
      let time=700
      if(game.simulation){
        time=50
      }
      console.log("tp")
      setTimeout(()=>scene.tpPlayer(target,pos),time)
      setTimeout(()=>this.updateNameText(target),1000)
      }

    hidePlayer(target,pos){
      console.log("hide"+pos)
      this.playerimgs[target].set({visible:false,top:coordinates[pos].y+BOARD_MARGIN,left:coordinates[pos].x+BOARD_MARGIN})
      this.nametexts[target].set("stroke","red")
      this.canvas.renderAll()
    }

    showPlayer(target){
      this.playerimgs[target].set({visible:true})
      this.nametexts[target].set("stroke","black")
      this.updateNameText(target)

      this.canvas.renderAll()
    }
    updateNameText(turn){
      let pos=this.getPlayerPos(turn)
      console.log(pos)
      this.nametexts[turn].set({top:pos.y-30,left:pos.x})
    }
    
    showArrow(turn){
      let pos=this.getPlayerPos(turn)
      console.log(pos)
      this.arrow.set({top:pos.y-70,left:pos.x,opacity:1})
      this.canvas.renderAll()
    }


    getPlayerPos(target){
      return {x:this.playerimgs[target].get('left'),y:this.playerimgs[target].get('top')}
    }
    getTilePos(tile){
   
      return {x:Map.coordinates[tile].x+BOARD_MARGIN,y:Map.coordinates[tile].y+BOARD_MARGIN}
    }
}







function chooseTile(index)
{
  let tile=0
  if(Map.mapname==='default'){
    if(index>0&&index<16)
    {
      tile=index%2
    }
    else if(index>16&&index<38)
    {
      tile=2+(index%3)
    }
    else if(index>38&&index<54)
    {
      tile=5+(index%2)
    }
    else if(index>=54&&index<72)
    {
      tile=7
    }
    else if(index>72)
    {
      tile=8+(index%2)
    }
  }
  else if(Map.mapname==='ocean'){
    if(index > 0 && index < 15){
      tile= 1+ index %2
    }
    else if(index > 15 && index < 36){
      tile=7
    }
    else if(index > 36 && index < 72){
      tile=3
    }
    else if(index > 72 && index < 90){
      if(index % 2 ===0){
        tile=4
      }
      else{
        tile=9
      }
    }
    else if(index > 90){
      tile=5
    }
  }
  else if(Map.mapname==='casino'){
    if(index > 0 && index < 20){
      tile= 2+ index %2
    }
    else if(index > 20 && index < 48){
      tile=2+ (2 * (index %2))
    }
    else if(index > 48 && index < 106){
      tile=6+ index %2
    }    
    else if(index ===106){
      tile=2
    }
    else if(index ===107){
      tile=4
    }
  }
  


  return tile
}



//미구현 게임기능
function alarm(text)
{

}


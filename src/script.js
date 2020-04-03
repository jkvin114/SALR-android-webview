let hpframe=null;
let hpspan=null
let otherui=null
let otherchar=null
let names=null
let skillbtns=null
let statusbtn=null
let quitbtn=null
let charimgs=null
let scene=null
let game=null
let ItemList=null

let obs_hidden=false
let chat_hidden=false
let nextTurnBtnShown=false
let skillBtnShown=false
let roullete=null
let effects=[]
let obstacleList=null
let winheight=0
let winwidth=0
let boardcontainer_hammerjs=null

const EFFECT_DESC=["[Slowness] next dice -2","[Speed] next dice +2","[Stun] can`t throw dice","[Silent] Can`t use skill","[Shield] ignore one skill or obstacle"
,"[Poison] -30 HP for every turn","[Radiation] Damage x2","[Annuity] +20$ for every turn","[Slavery] -80HP for every turn, die if you reach the end"
,"next dice goes back","next dice x2","[Blind] Can`t use basic attack","[Ignite] -15HP for every player`s turn","[Invisibility] Ignore every attack and obstacle"
,"[Debt] Can`t earn money and sell tokens","[Lottery annuity] +50$, +1 token for every turn","[Curse] get worst result for next dice"
]

let board_container=null
class Game{
  constructor(){
    this.simulation=false
    this.skillstatus=null     //쿨타임, 침묵 등 스킬관련 정보 저장
    this.turnsInUI=[];  //turn 으로  ui 위치 찾을때 사용
    this.thisturn=0     //현재 턴
    this.thisui=0       //현제 턴의 ui
    this.ismyturn=false //자신의 턴인지
    this.S=0       //total number of player
    this.myturn=Number(sessionStorage.turn)     //내 턴
    this.rname=Number(sessionStorage.roomName)  //방제
    this.dicecount=0        //주사위 에니메이션 횟수
    this.godhandtarget=-1   //신의손 대상 저장용
    this.player_locations=[0,0,0,0]  //플레이어 위치 저장용
    this.player_champlist=[-1,-1,-1,-1]  //플레이어 캐릭터 저장용
    this.dice_clicked=false         //주사위 클릭했지
    this.myStoreData={token:0,item:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],life:0}
    this.priceMultiplier=1      //상점 계수 저장
    this.roullete_result=4  ;     //룰렛결과 저장
    this.skill_description=[]     //스킬설명 저장
    this.effect_status=[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]    //이펙트 활성화여부
    this.myStat={
      "level":1,
      "AD":10,
      "AP":0,
      "AR":0,
      "MR":0,
      "regen":0,
      "absorb":0
    }
    this.onMainWay=true      //메인 길에 있는지
    this.diceControl=false     //주컨 사용가능여부
  }
  turn2ui(turn){
    return this.turnsInUI[turn]
  }
  updateTurn(t){
    this.thisturn=t
    this.thisui=this.turn2ui(t)
    this.ismyturn=(t===this.myturn)

  }
}
function requestItemList(){
  let itemrequest=new XMLHttpRequest();
  itemrequest.open('GET',"http://jyj.ganpandirect.co.kr/getitem",true)
  itemrequest.onload=function(){
    try{
      ItemList=JSON.parse(itemrequest.responseText)
    }
    catch(e)
    {
      console.log("Invaild item json format!")
    }

  }
  itemrequest.send()
}

function requestObstacles(){
  
  let request=new XMLHttpRequest();
  request.open('GET',"http://jyj.ganpandirect.co.kr/getobs",true)
  request.onload=function(){
    
    try{
      obstacleList=JSON.parse(request.responseText)
      }
    catch(e)
    {
      console.log("Invaild obstacle json format!")
    }
    return

    let text=""
    for(let i=0;i<obstacleList.obstacles.length;++i){
      console.log("dd")
       
         text += ('<div class=obs_icon title="'+obstacleList.obstacles[i].desc +'">'
         +'<img src="img/obstacles.png" style="margin-left: '+(-1 * i * 50)+'px;"/></div>'
         +'<div class=obs_name>'+obstacleList.obstacles[i].name+'</div>')

     
    }
    $("#obslist div").append(text)
    $(".obs_icon").css({"margin":"5px","overflow":"hidden","width":"50px",
    "height":"50px","display": "inline-block","border":"black solid 1px","border-radius": "5px"}) 

    $(".obs_name").css({"margin":"5px","overflow":"hidden","width":"70px","height":"50px","display": "inline-block"})   
  }
  request.send()
}
function backBtnPressed(){
  if(isStoreOpen){
    closeStore()
  }
}




$(document).ready(function(e){
  hpframe=$(".hpframe").toArray()
  hpspan=$(".hp").toArray()
  otherui=$(".otherui_new").toArray()
  otherchar=$(".otherchar").toArray()
  charimgs=$(".char").toArray()
  names=$(".hpi").toArray()
  skillbtns=$(".skillbtn").toArray()
  statusbtn=$(".status").toArray()
  quitbtn=$("#quit")
  effects=$(".effect").toArray()
  game=new Game()
  scene=new Scene()
  board_container=document.getElementById('canvas-container')
  let _boardside=document.getElementById('boardside')
  // winwidth=window.outerWidth-5
  // winheight=window.outerHeight-5
  winwidth=window.innerWidth-5
  winheight=window.innerHeight-5
  $("#nextturn").css("top",winheight-100)

  let dcbtn_pos = $("#dicecontrolbtn").offset();
  $("#dicecontrolcool").offset({
    top: dcbtn_pos.top+22,
    left: dcbtn_pos.left+45
  });
  $(".dc").hide()
  console.log(dcbtn_pos)


  window.onbeforeunload=function(){
    resetGame()
  }

  $("#largetext").html("Connecting with server...")
  //test===========================================


  //===========================================
  // boardcontainer_hammerjs=new Hammer.Manager(_boardside)
  // boardcontainer_hammerjs.add(new Hammer.Pinch())

  // boardcontainer_hammerjs.on('pinchin',function(){
  //   scaleBoard(Math.max(0,scene.cursize-=1))
  // })
  // boardcontainer_hammerjs.on('pinchout',function(){
  //   scaleBoard(Math.min(sizes.length-1,scene.cursize+=1))

  // })

  _boardside.addEventListener("touchstart", function(click_pos){    
    let origX = click_pos.changedTouches[0].pageX+board_container.scrollLeft;
    let origY = click_pos.changedTouches[0].pageY+board_container.scrollTop;
    _boardside.addEventListener("touchmove", function(coord){
        let curX = coord.changedTouches[0].pageX+board_container.scrollLeft;
		    let diffX = (origX - curX);

		    let curY = coord.changedTouches[0].pageY+board_container.scrollTop;
		    let diffY = (origY - curY);

		    board_container.scrollBy(diffX,diffY);
    }, false);

  }, false);
  _boardside.addEventListener("touchend", function(){
    _boardside.off('touchmove')
  }, false);
  _boardside.addEventListener("touchcancel", function(){
    _boardside.off('touchmove')
  }, false);

  console.log(winwidth)
  

  // $("#board").css("width", winwidth-10)
  // $("#board").css("height", winheight-10)
  //테스트용===========================================================
  //requestMap()
  /*
  let cv=new fabric.Canvas("board")
  scene.canvas=cv
  cv.setBackgroundImage(new fabric.Image(boardimg,{
    scaleX:scale,scaleY:scale,
    left:0,top:0,
    lockMovementX: true, lockMovementY: true,
    hasControls: false,
    lockScalingX: true, lockScalingY:true,lockRotation: true,
    hoverCursor: "pointer",
    objectCaching: false
  }))
  cv.renderAll()
  scene.canvas.setWidth(winwidth)
  //scene.canvas.setHeight(boardheight)
  scene.canvas.setHeight(winheight)
  */
  //============================================================

  requestItemList()
  requestObstacles()

  $('[data-toggle="tooltip"]').tooltip();

  $("#largedicebtn").bind("click",function (){
    if(!game.dice_clicked){
      pressDice(-1)
     // document.getElementById('sound_dice').play()
    }
    game.dice_clicked=true
  })

  $("#dicecontrolbtn").click(function(){
    if(!game.diceControl){return}
    game.dice_clicked=true
    $(".dc").hide()
    $("#diceselection").show()
    $("#diceselection").animate({"right":"30px"},300)

  })
  $(".diceselection").click(function(){

    $("#diceselection").animate({"right":"-300px"},300)
    setTimeout(()=>$("#diceselection").hide(),400)
    console.log("dc"+Number($(this).val()))
    pressDice(Number($(this).val()))
  })


  $("#nextturn").click(function(){
    hideSkillBtn()
    goNextTurn()
  })

  $("#skillcancel").click(function(){
    $("#largetext").html("")
    scene.resetTarget()
    endSelection()
    showSkillBtn(game.skillstatus)
  })
  $("#projectilecancel").click(function(){
    $("#largetext").html("")
    scene.tileReset()
    endSelection()
    showSkillBtn(game.skillstatus)
  })

  $("#godhandcancel").click(function(){
    $("#largetext").html("")
    scene.resetTarget()
    $("#godhandcancel").hide()
    endSelection()
    sendGodHandInfo({complete:false,type:"godhand"})
  })
  // $(".infobtn").popover()
  // $('.popover-dismiss').popover({
  //   trigger: 'focus'
  // })

  $(".skillbtn").click(function(){
    let val=$(this).val()
    hideSkillBtn()
    getSkill(val)
  })
  quitbtn.click(function(){
    let result=confirm("Are you sure you want to quit?")
    if(result){
      resetGame()
      window.location.href='file:///android_asset/html/index.html'
    }
    
    
  })

  $("#reload").click(function(){
    if(nextTurnBtnShown || skillBtnShown){
      return;
    }
    reloadGame(Number(sessionStorage.turn))
    console.log("reload")
  })

  $("#hide").click(function(){
    if(chat_hidden){
      $("#chat").css({"height":"150px","width":"200px","border":"none"})
      chat_hidden=false
    }
    else{
      $("#chat").css({"height":"50px","width":"100px","border":"2px solid black"})

      chat_hidden=true
    }
    $("#writemessage").toggle()
  })

  dragElement(document.getElementById('movechat'))

  $("#hideobs").click(function(){
    if(obs_hidden){
      $("#obslist").css("height","350px")
      obs_hidden=false
    }
    else{
      $("#obslist").css("height","50px")
      obs_hidden=true
    }
  })
  $("#writemessage").click(function(){

      $("#chat_enter").show()
      $("#text").focus()
  })

  $("#show_stat").click(function(){

    $(".stat_toast .toast-body").html("Level : "+game.myStat.level+" <br>"+
    "Attack power : "+game.myStat.AD+" <br>"+
    "Magic power : "+game.myStat.AP+" <br>"+
    "Attack resistance : "+game.myStat.AR+" <br>"+
    "Magic resistance : "+game.myStat.MR+" <br>"+
    "HP regeneration : "+game.myStat.regen+" <br>")

    $('.stat_toast').toast({delay: 2000});
    $('.stat_toast').toast('show');
  })


  $("#show_items").click(function(){
    let text="<img class=toast_img src='img/life.png'> x"+(game.myStoreData.life+1)+" <br> "
  
    if(Map.mapname==='casino'){
      text+=("<img class=toast_img src='img/token.png'> x"+game.myStoreData.token+"<br>")
    }
    
    $("#itemtoast_etc").html(text)
    $(".toast_img").css({"width":"20px","height":"20px"})

   


    $('.item_toast').toast({delay: 6000});
    $('.item_toast').toast('show');
  })


  $('.roullete_end').click(function(){
    setTimeout(roulleteEnd,6000)
  })

  $(".start").click(function(){
    $(this).hide()
    startSimulation()
  })
  $(".toggle_otherui").click(function(){
    $("#otherui_container").toggle()
    $("#show_otherui").toggle()
  })
  $("#sendmessage").click(sendMessage)
  changeItemToast()

})
function dragElement(element){
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  let chat=document.getElementById('chat')
  let btn=$("#movechat")
  element.addEventListener('touchstart',function(coord) {
    coord=coord||window.event

    coord.preventDefault()
    // get the mouse cursor position at startup:
    pos3 = coord.changedTouches[0].pageX
    pos4 = coord.changedTouches[0].pageY


    element.addEventListener('touchend',function(){
      // stop moving when mouse button is released:
      element.off('touchend')
      element.off('touchmove')
      element.off('cancel')

    }) 
    element.addEventListener('touchcancel',function(){
      // stop moving when mouse button is released:
      element.off('touchend')
      element.off('touchmove')
      element.off('cancel')

    })
    // call a function whenever the cursor moves:
    element.addEventListener('touchmove',function(coord){
      coord=coord||window.event
      coord.preventDefault()
      
      // calculate the new cursor position:
      pos1 = pos3 - coord.changedTouches[0].pageX
      pos2 = pos4 - coord.changedTouches[0].pageY
      pos3 =coord.changedTouches[0].pageX
      pos4 = coord.changedTouches[0].pageY

      let marginY=chat_hidden?60:150
      let marginX=chat_hidden?100:230

      // set the element's new position:
      chat.style.top = Math.max(30,Math.min(chat.offsetTop - pos2,winheight-marginY)) + "px";
      chat.style.left =  Math.max(30,Math.min(chat.offsetLeft - pos1,winwidth-230)) + "px";
    })
  })

} 

function changeItemToast(){
  let text=""
  let totalcount=0
    for(let i=0;i<game.myStoreData.item.length;++i){
      

      for(let j=0;j<game.myStoreData.item[i];++j){
        text+= ("<div class=toast_itemimg><img src='img/items.png' style='margin-left: "+(-1 * i * 100)+"px'; > </div>")
        totalcount+=1
        if(totalcount%4===0){
          text+=("<br>")
        }
      }      
    }
    for(let i=totalcount;i<6;++i){
      text+= ("<div class=toast_itemimg><img src='img/emptyslot.png'> </div>")
    }
    $("#itemtoast_item").html(text)

    $(".toast_itemimg").css({
      "margin":"-30px",        
      "overflow":"hidden",
      "width":"100px",
      "height":"100px",
      "display": "inline-block",
      "transform":"scale(0.4)"
      })
}
function hideChat(){
  $("#chat").css({"height":"50px","width":"100px","border":"2px solid black"})

    chat_hidden=true
    
  $("#writemessage").hide()
}
function playHitSound(sound){
  if(!sound){return}
  switch(sound){
    case 'hit':
      android_playsound(sound)
        // switch(soundstack){
        //   case 1:
        //     setTimeout(()=>android_playsound(sound),60)
        //     setTimeout(()=>soundstack-=1,120)
        //     soundstack+=1
        //   break;
        //   case 2:
        //     setTimeout(()=>android_playsound(sound),200)
        //     setTimeout(()=>soundstack-=1,300)
        //   break;
        //   case 0:
        //     android_playsound(sound)
        //     soundstack+=1
        // }
      break
      case 'yangyi_r':
        //document.getElementById('sound_yangyi_r').play()
      break
      case 'creed_r':
       // document.getElementById('sound_creed_r').play()
      break
      case 'knife':
      //  document.getElementById('sound_obs').play()
      break;
      case 'heal':
        android_playsound(sound)
      break;
      case 'explode':
        android_playsound('largeexplode')
      break;
  }
  
}


function android_toast(msg){
  try{
    android.toast(msg)
  }
  catch(e){
    //console.log(e)
  }
  return

}
function android_playsound(sound){
  try{
    android.playSound(sound)
  }
  catch(e){
    //console.log(e)
  }
}
function sendMessage(){
  let msg=$("#text").val()
  $("#chat_enter").hide()
  if(msg===""){return}
  //sendMessageToServer(msg,game.thisturn)
  $("#text").val("")
  let data={
    msg:msg,
    turn:game.myturn,
    rname:rname
  }
  let posting=$.post('http://jyj.ganpandirect.co.kr/chat',data)
  posting.done(function(){})
}

function receiveMessage(msg){ 

  $("#chat_text").append("<p>"+msg+"</p>")
  $("#chat_text").scrollTop(900000);
}
function initUI(setting){
  console.log('initui')
  game.skill_description=setting[game.myturn].description
  game.S=setting.length    //total number of player
  if(game.S>2){
    $(otherui[1]).show()
  }
  if(game.S>3){
    $(otherui[2]).show()
  }
  


  let othercount=1
  console.log("simulation"+setting[0].simulation)
  if(setting[0].simulation){
    game.turnsInUI=[0,1,2,3]
    game.simulation=true

    for(let i=0;i<game.S;++i){
      $(names[i]).html(setting[i].name+" "
      +setting[i].HP+"/"+setting[i].MaxHP)
     
    }
  }
  else{
    for(let i=0;i<game.S;++i)
    {
      if(setting[i].turn===game.myturn)
      {
        $(names[0]).html(setting[i].name+" "
          +setting[i].HP+"/"+setting[i].MaxHP)
  
        if(setting[0].team===0)
        {
          $(names[0]).css("background","#ff7f7f")
        }
        else if(setting[i].team===1)
        {
          $(names[0]).css("background","#77a9f9")
        }
        game.turnsInUI.push(0)
      }
      else
      {
        $(names[othercount]).html(setting[i].name)
        if(setting[othercount].team===0)
        {
          $(names[othercount]).css("background","#ff7f7f")
        }
        else if(setting[i].team===1)
        {
          $(names[othercount]).css("background","#77a9f9")
        }
        game.turnsInUI.push(othercount)
        othercount+=1
      }
  
    }
  
  }
  for(let i=0;i<game.S;++i){
    game.player_champlist[i]=setting[i].champ
    $(charimgs[game.turn2ui(i)]).css('background-color',COLOR_LIST[i])
    switch(setting[i].champ){
      case 0:
        $(charimgs[game.turn2ui(i)]).attr("src",'img/character/reaper.png')
        break;
      case 1:
        $(charimgs[game.turn2ui(i)]).attr("src",'img/character/elephant.png')
        break;
      case 2:
        $(charimgs[game.turn2ui(i)]).attr("src",'img/character/ghost.png')
        break;
      case 3:
        $(charimgs[game.turn2ui(i)]).attr("src",'img/character/dinosaur.png')
        break;
      case 4:
        $(charimgs[game.turn2ui(i)]).attr("src",'img/character/sniper.png')
        break;
      case 5:
        $(charimgs[game.turn2ui(i)]).attr("src",'img/character/magician.png')
        break;
    }
  }
  for(let i=0;i<game.S;++i)
  {
    let j=game.turnsInUI[i]
    if(i===0){
      $(hpframe[j]).css("width",String(setting[i].MaxHP)+"px")
      $(hpspan[j]).css("width",String(setting[i].HP)+"px")
    }
    else{
      $(hpframe[j]).css("width",String(setting[i].MaxHP*0.3+4)+"px")
      $(hpspan[j]).css("width",String(setting[i].HP*0.3)+"px")
    }
  }
  game.thisui=game.turnsInUI[0]
  console.log('initui')
  $("#largetext").html("Loading the map....")

  requestMap()
  for(let j=0;j<3;++j){
    $(skillbtns[j]).css({"background":"url(img/skill/"+(game.player_champlist[game.myturn]+1)+"-"+(j+1)+".jpg)","background-size": "100%","border":"3px solid rgb(122, 235, 255);"})
  }


}


function boardReady(){
  setTimeout(()=>$(".progress").hide(),500)
  if(!game.simulation){
    $("#largetext").html("")
    setupComplete()
    console.log('simu'+game.simulation)

  }
  $(".start").show()

}

  function targetSelected(target,godhand)
  {
    scene.resetTarget()
    if(godhand){
      showRangeTiles(game.player_locations[target],10,0,'godhand')
      game.godhandtarget=target
      $("#godhandcancel").hide()
    }
    else{
      sendTarget(target)
    }

  }




  //t:{turn:number,stun:boolean}
  function nextTurn(t)
  {
    console.log("room name:"+rname)
    game.updateTurn(t.turn)

    hideSkillBtn()

    highlightUI(t.turn)
    showDiceBtn(t)


  }
  function highlightUI(t)
  {
    
    for(let i=0;i<game.S;++i)
    {
      if(i===game.thisui)
      {
        $(otherchar[i-1]).css("border","2px solid red")
      }
      else {
        $(otherchar[i-1]).css("border","1px solid black")
      }

    }
  }

  //turn:number,stun:boolean
  function showDiceBtn(t)
  {
    
    console.log("show dice btn of")
    console.log(t.turn)
    scene.showArrow(t.turn)
    game.dice_clicked=false
    
    if(t.stun)
    {
      manageStun()
    }
    else if(game.ismyturn)
    {
      $("#arrow").show()
      if(t.adice>0){
        $("#largetext").html("Additional dice:"+String(t.adice))
      }
      $("#largedicebtn").attr("src","img/dice/roll6.png");
      $("#largedicebtn").show()
      console.log("dc"+t.dc)
      if(game.myStat.level<Map.dc_limit_level){
        game.diceControl=t.dc
        $(".dc").show()
        if(!t.dc){
          $("#dicecontrolbtn").css({"filter":"grayscale(100%)"})
        }
        else{
          $("#dicecontrolbtn").css({"filter":"grayscale(0%)"})
          
        }
        console.log(t)
        $("#dicecontrolcool").html(String(t.dc_cool))
      }
    

    }
    else{
      $("#smalldicebtn").attr("src","img/dice/roll6.png");
      $("#smalldicebtn").show()
    }

  }
  function manageStun()
  {

    if(game.ismyturn)
    {
      $("#largedicebtn").attr("src","img/dice/stun.png");
      game.dice_clicked=false
      $("#largedicebtn").show()
    }

    let time=300
    let time2=300
    if(game.simulation){
      time=0
      time2=200
    }
    setTimeout(function(){
      $("#largedicebtn").hide()
      if(game.myturn===0){

        checkObstacle()

        setTimeout(function(){
          obsComplete()
        },time2)
      }

    },time)
  }

  function rollDice(dice)
  {
    $(".dc").hide()
    $("#arrow").hide()

    $("#largetext").html("")

    console.log("roll dice")
    if(game.ismyturn){
      $(".storebtn").hide()
      scene.shadow.set({visible:false})
      scene.shadow.sendToBack()
    }
    if(dice==='stun'){return;}

    game.dicecount=0
    if(game.simulation){
      scene.movePlayer(dice.actualdice,1,dice.currpos,dice.turn)
    }
    else{
      diceAnimation(dice)
      android_playsound('dice')
    }
    if(dice.dcused){
      $("#largetext").html("Dice Control!")
    }
    
  }

function diceAnimation(dice){
    //animate dice 10 times
    if(game.dicecount>10) {
      afterDice(dice)
      return;
    }
    game.dicecount+=1
    let d=Math.floor(Math.random()*10)+1
    rollingDice(d)
    setTimeout(()=>diceAnimation(dice),60)
}
function rollingDice(dice){
  let rot=Math.floor(Math.random()*36)
  if(game.ismyturn){
    $("#largedicebtn").attr("src","img/dice/roll"+String(dice)+".png");
    $("#largedicebtn").css({"transform":"rotation("+(rot*10)+"deg)","transform":"translate(0px,"+(-15*game.dicecount)+"px)"})
  }
  else{
    $("#smalldicebtn").attr("src","img/dice/roll"+String(dice)+".png");
    $("#smalldicebtn").css({"transform":"rotation("+(rot*10)+"deg)","transform":"translate(0px,"+(-10*game.dicecount)+"px)"})
  }
}

function setDice(dice){
  let rot=Math.floor(Math.random()*36)

  if(game.ismyturn){
    $("#largedicebtn").attr("src","img/dice/d"+String(dice)+".png");
    $("#largedicebtn").css({"transform":"rotation("+(rot*10)+"deg)","transform":"translate(0px,-150px)"})

  }
  else{
    $("#smalldicebtn").attr("src","img/dice/d"+String(dice)+".png");
    $("#smalldicebtn").css({"transform":"rotation("+(rot*10)+"deg)","transform":"translate(0px,-100px)"})
  }
}
/**
 *  pos 가 가운데로 오게 보드 스크롤 이동
 * @param {} pos 
 */
function moveBoard(pos,scale){
  
  scaleBoard(scale+1)
  let x=(pos.x-BOARD_MARGIN)-((boardwidth-BOARD_MARGIN)/2/sizes_ratio[scale])+BOARD_MARGIN  
  let y=(pos.y-BOARD_MARGIN)-((boardheight-BOARD_MARGIN)/2/sizes_ratio[scale])+BOARD_MARGIN

  $("#canvas-container").stop()

  setTimeout(()=>$("#canvas-container").animate({scrollTop:y,scrollLeft:x},400),100)
} 

/**
 *  pos 가 가운데로 오게 즉시 보드 스크롤 이동
 * @param {} pos 
 */
function moveBoardInstant(pos,scale){
  $("#canvas-container").stop()
  
  let x=(pos.x-BOARD_MARGIN)-((boardwidth-BOARD_MARGIN)/2/sizes_ratio[scale])+BOARD_MARGIN
  let y=(pos.y-BOARD_MARGIN)-((boardheight-BOARD_MARGIN)/2/sizes_ratio[scale])+BOARD_MARGIN

  console.log("x"+Math.floor(x)+"  y"+Math.floor(y))
  board_container.scrollTo(x,y)
  setTimeout(()=>scaleBoard(scale+1),100)
}
function afterDice(dice)
{
    setDice(dice.dice)
    game.player_locations[dice.turn]= dice.currpos+dice.actualdice
    console.log('after dice thrown')    
    setTimeout(()=>scene.movePlayer(dice.actualdice,1,dice.currpos,dice.turn),500)
}
function moveComplete(end)
{
  $(".dicebtn").css("transform","translate(0px,0px)")
  //if(end){return}
  

  $(".dicebtn").hide()
  $("#largetext").html("")
  console.log('move complete')

  if(game.myturn===0){
    checkObstacle()
    console.log('checkobstacle')
    setTimeout(function(){
      obsComplete()
    },500)
  }
}



function showSkillBtn(status)
{
  console.log("show skill btn turn:"+status.turn)
  if(status.turn!==game.myturn){
    let t=game.turn2ui(status.turn)-1
    $(statusbtn[t]).html("Choosing skill....")
    return;
  }
  game.skillstatus=status
  nextTurnBtnShown=true
  skillBtnShown=true
  $("#nextturn").show()
  $(".skillbtn").attr("disabled",false)
  $("#nextturn").attr("disabled",false)
//  if(skillcount===4 || players[thisturn].effects[3]>0)
  if(status.silent>0)
  {       //silent or used skill 4 times
    $(".noskill").show()
  }
  else {
   // $(".storebtn").hide()
    $(".skillbtn").show()
    for(let i=0;i<3;++i)
    {
      console.log(status.cooltime)
      //$(skillbtns[i]).prop('title',skill[i]+": "+game.skill_description[i]+"\n쿨타임 "+status.cooltime[i]+"턴 남음")
     // $(skillbtns[i]).css({"border": "none"})
      $(skillbtns[i]).css({"filter": "grayscale(0%)"})
        if(status.cooltime[i]===0)
        {
          $(skillbtns[i]).html('&nbsp;')
          if(status.duration[i]>0){
            $(skillbtns[i]).css({"border": "3px solid red"})            
          }
          else{
            $(skillbtns[i]).css({"border": "3px solid rgb(122, 235, 255)"})
          }
          
        }
        else 
        {
          if(status.duration[i]>0){
            $(skillbtns[i]).css({"border": "3px solid red"})
            
          }
          else{
            $(skillbtns[i]).css({"border": "3px solid rgb(122, 235, 255)"})
            $(skillbtns[i]).css({"filter": "grayscale(90%)"})
            $(skillbtns[i]).html(String(status.cooltime[i]))
          }
          

        }
      }
    if(status.level<3)
    {
      $(skillbtns[2]).css({"filter": "grayscale(90%)"})
      if(status.level<2)
      {
        $(skillbtns[1]).css({"filter": "grayscale(90%)"})
      }

    }
  }
}

function hideSkillBtn()
{
  $(".status").html("")
  $(".skillbtn").hide()
  $("#nextturn").hide()
  $(".noskill").hide()
  nextTurnBtnShown=false
  skillBtnShown=false
}
function hideSkillCancel(){
  $("#skillcancel").hide()
  $("#godhandcancel").hide()
}
function disableAllSkillBtn()
{
  $(".skillbtns button").attr("disabled",true)
  $("#nextturn").attr("disabled",true)

}

function giveEffect(e){
  if(!game.effect_status[e]){
    $("#effects").append('<a style="background:url(\'img/effects.png\') -'+String(20*e)
    +'px 0" class=effect data-toggle="tooltip" title="'+EFFECT_DESC[e]+'" id="e'+String(e)+'"></a>')
    game.effect_status[e]=true
  }
  $('[data-toggle="tooltip"]').tooltip();
 
}

function removeEffect(e){
  if(game.effect_status[e]){
    $("#e"+String(e)).remove()
    game.effect_status[e]=false

  }
}

function setStoreData(data,priceMultiplier){
  tokenprice=-1 //이번턴에 상점갈때 최초 1회만 토큰가격 설정되도록
  game.myStoreData=data
  game.priceMultiplier=priceMultiplier
}
function onTileSelectionCancel(type){
  if(type==='godhand'){
    sendGodHandInfo({complete:false,type:"godhand"})
  }
  if(type==='skill')
  {
    showSkillBtn(game.skillstatus)

  }
  $("#largetext").html("")
  scene.tileReset()
  endSelection()
}
/**
 * 타겟 혹은 타일 선택 준비시 호출
 */
function prepareSelection(){
  moveBoardInstant(scene.getPlayerPos(game.myturn) ,1)
  hideChat()
  disableAllSkillBtn()
  $(".mystatus").hide()
}
/**
 * 타겟 또는 타일 선택 완료시ㅣ 호출
 */
function endSelection(){
  $(".mystatus").show()

}



function showRangeTiles(pos,range,size,type)
{
  
  if(type==='godhand'){
    $("#cancel_tileselection").show()
    $("#largetext").html("God`s hand \n Choose a square you want to \nmove the player to")
  }
  else if(type==='skill'){
    prepareSelection()
    $("#cancel_tileselection").show()
    $("#largetext").html("Choose a square to place the projectile \n size:"+size)
  }
  else if(type==='submarine'){
    prepareSelection()
    $("#largetext").html("Submarine \n Choose a square you want to move to")
  }
  $("#cancel_tileselection").click(()=>onTileSelectionCancel(type))
  $("#confirm_tileselection").show()

  scene.canvas.bringToFront(scene.shadow)
  scene.canvas.discardActiveObject()
  scene.shadow.set({visible:true})
  let start=Math.floor(pos-(range/2))
  let end=Math.floor(pos+(range/2+1))
  if(!game.onMainWay){
    start=Math.max(start,Map.way2_range.way_start+1)
    end=Math.min(end,Map.way2_range.way_end)
  }
  for(let i=start;i<end;++i)
  {
    scene.liftTile(i,type)
  }
  scene.playersToFront()

}
function playerDie(turn,spawnPos,storeData,skillfrom)
{

  if(skillfrom<=0){
    //document.getElementById('sound_execute').play()
  }else{
    //document.getElementById('sound_kill').play()
  }

  scene.hidePlayer(turn,spawnPos)
  if(turn===game.myturn){
    $("#largetext").html("You Died!")
    scene.canvas.bringToFront(scene.shadow)
    scene.canvas.discardActiveObject()
    scene.shadow.set({visible:true})
  }
  if(skillfrom-1===game.myturn){
    $("#largetext").html("You Slayed an Enemy!<br>One more dice!")
  }

  //죽어서 상점에 간 경우
  if(turn===game.myturn && storeData!==null){
    setStoreData(storeData,1)
    $(".storebtn").show()
  }
  $(".effect").hide()
 // $(ui[game.turn2ui(turn)]).css({"background-color":"gray"})
}


function playerRespawn(turn)
{
  scene.showPlayer(turn)
  $("#largetext").html("")
  
 // $(ui[game.turn2ui(turn)]).css({"background-color":"white"})
}

//주사위를 굴려 상점에 간 경우
function arriveStore(turn,storeData,street_vendor){
  if(turn===game.myturn){
    let priceMultiplier=1
    if(street_vendor){
      priceMultiplier=1.2
    }
    console.log(storeData)
    setStoreData(storeData,priceMultiplier)
    $(".storebtn").show()
  }
}
function updateMoney(val){
  if(val.turn===game.myturn){
    $("#money").html(val.result+"$")
  }
  
}
function indicateResult(winner){
  $("#overlay").show()

  if(game.myturn===winner){
    $(".victory").show()

  }
  else{
    $(".defeat").show()
  }



  setTimeout(function(){
    window.onbeforeunload=()=>{}
    window.location.href="statpage.html"
  },7000)
}


 //미구현
function endgame(){
  hideSkillBtn()
  $("#largedicebtn").hide()
}


function gameOver(){
  endgame()
  

}

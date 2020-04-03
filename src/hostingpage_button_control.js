//플레이어 1명일시 못시작하게
let switch_player=$(".toplayer").toArray()
let switch_ai=$(".toai").toArray()
let playercard=$(".connected").toArray()
let waitingcard=$(".waiting").toArray()
let playerkick=$(".kick_player").toArray()
let aicard=$(".aicard").toArray()
let addai=$(".addai").toArray()
let mapbtn=$(".mapbtn").toArray()
let aichamp=$(".aichamp").toArray()
sessionStorage.turn=0
sessionStorage.aiturn=[]
sessionStorage.status=null
let aiturn=[]
let champlist=[0,0,0,0]
let map=0
let myturn=-1
let PNUM=1
let CNUM=0
let activeplayer=1
let playerlist=makePlayerList()
let selectedmenu=0
let aichampshown=false
let quitted=false
let ready=false
let card=[]
if(sessionStorage.host==='simulation'){
  playerlist[0].type='player_connected'
}

function makePlayerList(){
  let p=[]
  for(let i=0;i<4;++i){
    p.push({
      type:'none',
      name:(i+1)+'P',
      team:'none',
      champ:0,
      ready:false
    })
  }
  p[0].type='player_connected'
  p[0].ready=true
  return p
}

$(document).ready(function(){
  window.onbeforeunload=function(){
    resetGame()
    quitted=true
    return 'leave game'
  }

  console.log(sessionStorage.host)
  
  $("#Hostingpage").hide()
  if(sessionStorage.host==='true'){
    playerlist[0].name=sessionStorage.nickName
    myturn=0
    $(".me p").html(sessionStorage.nickName)
    $("#rname").html("Room name: "+sessionStorage.roomName)
  }
  
  if(sessionStorage.host==='false'){
    $("#Hostingpage").hide()
    $(".aichamp").hide()
    $("#room").show()
    $(".toplayer").hide()
    $(".toai").hide()
    $(".addai").hide()
    $(".kick_player").hide()
    $(".kick").hide()
    $(".mapbtn").hide()
    $("#individual").hide()
    $("#map_choice a").hide()
    $(mapbtn[0]).show()
    let request=new XMLHttpRequest();
    request.open('GET',"http://jyj.ganpandirect.co.kr/getrooms")
    
    request.onload=function(){

      let roomList=request.responseText
      roomList=roomList.split("||")
      if(!request.responseText){
        alert("There are no rooms to enter")
        window.location.href="file:///android_asset/html/index.html"
      }
      else{
        let text=""
        for(let r of roomList){
          if(r!==""){
            text+='<button class="room">'+r+'</button>'
          }
        }
        $("#roombtn").append(text)
        $(".room").css({ 
              "width":"80%",
              "color":"white",
              "background-color": "#a200ff",
              "cursor":"pointer",
              "text-align":"center",
              "padding":" 10px 5px",
              "font-size": "20px",
              "margin": "10px",
              "border":"none",
              "vertical-align": "middle",
              'font-family': 'Do Hyeon'
        })
        $(".room").click(function(){
          register($(this).html(),sessionStorage.nickName)
          $("#room").hide()
          $("#rname").html("Room name: "+$(this).html())
        })
      }
  }
  request.send()
  }

  if(sessionStorage.host==='simulation'){
    $("#rname").html("시뮬레이션")
    $("#simulation_input").show()
    $(".champbtn").hide()
    $(".toplayer").hide()
    $("#instant").show()
  }
  $("#quitbtn").click(function(){
    //resetGame()
    window.location.href='index.html'      
  })
  $("#readybtn").click(function(){
    
    if(ready){
      $(this).css("background-color","darkgrey")
    }
    else{
      $(this).css("background-color","#ff5656")
    }
    ready=!ready
    sendReady(ready)
  })

$(".addai").click(function(){
  sessionStorage.status="hosting"
  let v=Number($(this).val())
  addAI(v)

  if(PNUM+CNUM===4){
    $("#team").attr("disabled",false)
  }
})
$(".kick").click(function(){
  let v=Number($(this).val())
  
  removeAI(v)
  $("#team").attr("disabled",true)
  //setType('none',v)
})

$(".kick_player").click(function(){
  let v=Number($(this).val())
  kickPlayer(v)
  PNUM-=1
  setType('none',v)
  console.log('kick'+v)
  $("#team").attr("disabled",true)
  $(playerkick[v-1]).hide()
  
})

$(".champbtn_new").click(function(){
  let champ=Number($(this).attr('value'))
  changeChamp(Number(sessionStorage.turn),champ)
 // champlist[0]=champ
  console.log(champ)
  $(".champbtn_new").css({"filter":"brightness(100%)","border":"2px solid black"})
  $(this).css({"filter":"brightness(200%)","border":"2px solid white"})
})

$(".mapbtn").click(function(){
  $(".mapbtn").css("border"," rgb(247, 197, 70) solid 3px")
  $(this).css("border"," red solid 3px")
  map=Number($(this).attr('value'))
  setMap(map)
})
$("#individual").attr('disabled', true);
$("#individual").click(function(){
  

    // champlist.map(function(a){
    //   return !a ? 0:a
    //   })
  if(PNUM+CNUM<2 || playerlist.some((c)=>c.type==="player")){
    alert("Please check players")
  }else if(!checkReady()){
    return
  }
  else{
    window.onbeforeunload=function(){}
    submitTeamSelection(false)
  }
})
$("#instant").click(function(){
  let num=Number($('#num').val())
  if(!num){num=0}
  num+=1

    // champlist.map(function(a){
    //   return !a ? 0:a
    //   })
  if(PNUM+CNUM<2 || playerlist.some((c)=>c.type==="player")){
    alert("Please check players")
  }
  else{
    window.onbeforeunload=function(){}
    submitTeamSelection(true,num)
    }
  })

  $(".aichamp").click(function(){
    let turn=Number($(this).attr('value'))
    let pos=$(this).offset()
    
    $(".champmenu").css({top:pos.top+42,left:pos.left}).show()
    console.log('show')
    selectedmenu=turn
    setTimeout(()=>aichampshown=true,100)
    
  })

  $(".champmenu a").click(function(){
    let champ=Number($(this).attr('value'))
    //champlist[selectedmenu]=champ
    changeChamp(selectedmenu,champ)

    $(".champmenu").hide()
    switch(champ){
      case 0:
        $(aichamp[selectedmenu-1]).attr("src",'img/character/reaper.png')
        break;
      case 1:
        $(aichamp[selectedmenu-1]).attr("src",'img/character/elephant.png')
        break;
      case 2:
        $(aichamp[selectedmenu-1]).attr("src",'img/character/ghost.png')
        break;
      case 3:
        $(aichamp[selectedmenu-1]).attr("src",'img/character/dinosaur.png')
        break;
      case 4:
        $(aichamp[selectedmenu-1]).attr("src",'img/character/sniper.png')
        break;
      case 5:
        $(aichamp[selectedmenu-1]).attr("src",'img/character/magician.png')
        break;
    }
    aichampshown=false
    selectedmenu=0

  })

  $(document).click(function(){
    if(aichampshown){
      selectedmenu=0
      aichampshown=false
      $(".champmenu").hide()

    }
   

  })

  $(".toplayer").click(function(){
    //removeAI(i+1)
    CNUM-=1
    setType('player',$(this).attr('value'))

    $("#team").attr("disabled",true)
  })

  $(".toai").click(function(){
      
    addAI($(this).attr('value'))
  })

  // for(let i=0;i<switch_player.length;++i)
  // {
  //   $(switch_player[i]).click(function(){
  //     removeAI(i+1)
  //     setType('player',i+1)

  //     $("#team").attr("disabled",true)
  //   })
  // }
  // for(let i=0;i<switch_ai.length;++i)
  // {
  //   $(switch_ai[i]).click(function(){
      
  //     addAI(i+1)
  //   })
  // }
})


// 게스트 표시(방장만)
// function showGuest(turn){

//   if(sessionStorage.turn==="0"){
//     addplayer(turn)
//     $(playerkick[turn-1]).show()
//   }
  
// }
// function addplayer(i){
//   PNUM+=1
//   setType('player_connected',i)

//   if(PNUM+CNUM===4){
//     $("#team").attr("disabled",false)
//   }
// }
/**
 * 방장전용
 * 모든플레이어 레디했는지 체크
 */
function checkReady(){
  for(let i=0;i<4;++i){
    if(playerlist[i].type==='player_connected' && !playerlist[i].ready){
      alert((i+1)+"P is not ready")
      return false
    }
  }
  return true
}
function receiveMap(map){
  if(myturn!==0){
    $(".mapbtn").hide()
    $(mapbtn[Number(map)]).show()
  }
  
}
function receiveReady(turn,ready){
  console.log(turn+"ready"+ready)
  playerlist[turn].ready=ready
}
function updatePlayerList(players,turnchange){
  if(quitted){
    window.onbeforeunload=()=>{}
  window.location.href="index.html"
  }
  if(!players){
    return
  }
  if(turnchange && turnchange.indexOf(myturn) !== myturn){
    sessionStorage.turn=turnchange.indexOf(myturn)
    myturn=turnchange.indexOf(myturn)
  }

  //턴 바뀌면 자신의 턴 바꾸기 (3번째 이후일때만)
 // setTurn(tempcard.indexOf(myturn))
  /*
  if(myturn>=2){

  let tempcard=[-1,-1,-1,-1]
    console.log(playerlist)
    console.log(players)
  for(let i=0;i<4;++i){
    if(playerlist[i].type!=='none'){
      tempcard[i]=i
    }
  }
  tempcard.sort(function(a,b){
    if(a===-1){return 1}
    if(b===-1){return -1}
    return 0
  })
  console.log('tempcard'+tempcard)
    setTurn(tempcard.indexOf(myturn))
  }

*/
  playerlist=players

  PNUM=playerlist.reduce(function(num,val){
    if(val.type==='player_connected'){num +=1}
    return num
  },0)

  //card=cards
  console.log(playerlist)
  $(".kick_player").hide()
  for(let i=0;i<playerlist.length;++i)
  {
    $(aicard[i]).hide()
    $(waitingcard[i]).hide()
    $(playercard[i]).hide()
    $(addai[i]).hide()
    
    //console.log(names)
    switch(playerlist[i].type)
    {
      case "sim_ai":
        $(playercard[i]).show()
      break;
      case "player_connected":
        $(playercard[i]).show()
        $(playercard[i]).children('p').html(playerlist[i].name)
        if(i>0 && myturn===0){$(playerkick[i-1]).show()}
      break;
      case "player":
        $(waitingcard[i]).show()
      break;
      case "ai":
        $(aicard[i]).show()
      break;
      case "none":
        if(sessionStorage.host==='true'||sessionStorage.host==='simulation' )
          {$(addai[i]).show()}
      break;
    }
  }

}
function addAI(turn){
  setType('ai',turn)
  CNUM+=1
 // aiturn.push(turn)
//  sessionStorage.aiturn=aiturn
}
function removeAI(turn){
  CNUM-=1
  setType('none',turn)
  //aiturn.splice(aiturn.indexOf(turn),1)
 // sessionStorage.aiturn=aiturn
}
function setTurn(turn)
{
  myturn=turn
  if(myturn===0){return}
  console.log("myturn"+turn)
  
  sessionStorage.turn=myturn
  card[turn]='player_connected'
  $(playercard[turn]).css("border","7px solid blue")
  sendPlayerList(playerlist)

}


function setType(type,turn){
  playerlist[turn].type=type
  console.log("setType"+playerlist[turn])
  updatePlayerList(playerlist)
  sendPlayerList(playerlist)
}
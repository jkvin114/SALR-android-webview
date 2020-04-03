
var redcheckbox=null
var bluecheckbox=null
var container=null
var names=null
var myturn=Number(sessionStorage.turn)
var aiturn=sessionStorage.aiturn
var check_status=[null,null,null,null]

$(document).ready(function(){

  redcheckbox=$(".selectred").toArray()
  bluecheckbox=$(".selectblue").toArray()
  container=$(".choice").toArray()
  names=$(".name").toArray()

  $(container[myturn]).css("border","3px solid blue")
  if(aiturn.length!==0) {setAI(aiturn)}


  //방장이 아닐경우 컴퓨터의 체크박스는 수정 불가
  for (let i=0;i<4;++i)
  {
    if (i!==myturn && aiturn.indexOf(i)===-1)
    {
      $(redcheckbox[i]).attr("disabled",true)
      $(bluecheckbox[i]).attr("disabled",true)
    }
  }


  $(".selectred").on('click',function(){
    check_status[$(this).val()]=0
    setCheckBox(check_status)
  })
  $(".selectblue").on('click',function(){
    check_status[$(this).val()]=1
    setCheckBox(check_status)
  })

  $("#submit").click(function(){
    if(myturn===0){
      if(check_status.some((c)=>c===null))
      {alert("Every player must select teams!!")}
      else if(check_status.every((c)=>c===0) || check_status.every((c)=>c===1))
      {alert("You must divide teams!!")}
      else{submitTeamSelection()}

    }
  })

})



//서버에서 체크상태 받아옴
function getCheckBox(check)
{
  check_status=check
  for(let i=0;i<check.length;++i)
  {
    if(check[i]===0){
      $(redcheckbox[i]).prop('checked',true)
    }
    else if(check[i]===1){
      $(bluecheckbox[i]).prop('checked',true)
    }
  }
}

function setAiTeamselection(aiturn){}
// {
//   let n=0
//   for(let i of aiturn)
//   {
//     n+=1
//     //$(names[i]).html("Computer "+n)
//   }
// }
function startGame()
{
  window.location.href='/gamepage.html'
}

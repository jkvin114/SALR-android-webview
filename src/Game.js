//const player=require("./Player.js")
const swordsman=require("./Swordsman.js")
const silver=require("./Silver.js")
const timo=require("./Timo.js")
class Game
{
  constructor(isteam)
  {
    this.players=[]
    this.clients=[]
    this.totalturn=0;
    this.isTeam=isteam
    this.PNUM=0
    this.CNUM=0
    this.totalnum=0
    this.thisturn=0
    this.skilldmg=-1
    this.skillcount=0
    this.godhandtarget=-1
    this.clientsReady=0
    this.pendingObs=false
    this.roullete_result=-1

    this.nextUPID=1
    this.activeProjectileList=[]


  }

  //client:Socket(),team:number,char:int,name:str
  addPlayer(client,team,char,name)
  {

    console.log("add player "+char+"  "+name)
    let p=null
    char=Number(char)
    switch(char){
      case 0:
        p=new swordsman(this.totalnum,team,false,char,name)
      break;
      case 1:
        p=new silver(this.totalnum,team,false,char,name)
      break;
      case 2:
        p=new timo(this.totalnum,team,false,char,name)
      break;
      default:
        p=new swordsman(this.totalnum,team,false,char,name)
    }

     
    this.players.push(p)
    this.PNUM+=1
    this.totalnum+=1
    this.clients.push(client)
  }

  //team:number,char:str,name:str
  addAI(team,char,name)
  {
    this.players.push(new swordsman(this.totalnum,team,true,char,name))
    this.CNUM+=1
    this.totalnum+=1
    this.clients.push("ai")
  }

  //()=>{turn:number,stun:boolean}
  firstTurn(){
    for(let p of this.players){
      p.players=this.players
    }

    let p=this.players[0]

           //if this is first turn ever
    this.clientsReady+=1
    if(this.clientsReady!==this.PNUM){
      return false;
    }
    return {
      turn:p.turn,
      stun:p.stun,
      ai:p.AI
    }
  }

  nextTurn()
  {
    for(let p of this.players){
      console.log(p.name+"\n")
      console.log("공격력:"+p.AD+"  주문력:"+p.AP+ "   방어력:"+p.AR+"    마법저항력:"+p.MR
      +"   체력재생:"+p.regen +"\n" )
    }

    let p=this.players[this.thisturn]

    p.coolDownOnTurnEnd()

    
    this.thisturn+=1
    this.totalturn+=1
    this.thisturn%=this.totalnum

    p=this.players[this.thisturn]
    
    p.invulnerable=false
    if(p.dead)
    {
        p.respawn()
    }

    console.log("stun"+p.stun)
    return {
      turn:p.turn,
      stun:p.stun,
      ai:p.AI
    }
  }

  //()=> {dice:number,actualdice:number,currpos:number,turn:number}
  rollDice()
  {
    
    let p=this.players[this.thisturn]
    if(p.stun){return 'stun'}
    let d=Math.floor(Math.random()*6)+1
    //let d=3
    let dice=d
    if(p.effects[0]>0) {dice-=2}
    if(p.effects[1]>0) {dice+=2}
    dice=p.checkMuststop(dice)
    let currpos=p.pos;
    p.move(dice)
    

    console.log("dice:"+ dice+"  "+d)
    return {
      dice:d,
      actualdice:dice,
      currpos:currpos,
      turn:this.thisturn
    }
  }
  checkObstacle()
  {

    let p=this.players[this.thisturn]

    p.coolDownBeforeObs()

    let result=p.obstacle()
    if(result==='store'){
      p.lvlup()
    }
    let t=this.thisturn
    if(result==='finish'){

      this.players.sort(function(a,b){
        if(b.turn===t){
          return 1000
        }
        else{
          if(b.kill === a.kill){
            return a.death-b.death
          }
          else{
            return b.kill - a.kill
          }          
        }
      })

      return 'finish'
    }
    p.coolDownAfterObstacle()

    return result
  }

  processGodhand(godhand_info){
    let p=this.players[godhand_info.target]
    p.goto(godhand_info.location,false)    
  }

  //()=>{turn:number,silent:number,cooltime:number[],duration:number[]}
  skillCheck(){
    let p=this.players[this.thisturn]
    return this.getSkillStatus()

  }

  initSkill(skill){
    let p=this.players[this.thisturn]
    if(p.level<2 && skill==="2"){
      return "notlearned"
    }
    if(p.level<3 && skill==="3"){
      return "notlearned"
    }
    let skilldmg=p.initSkill(Number(skill))  //-1 when can`t use skill, 0 when it`s not attack skill
    if(skilldmg===-1){return 'nocool'}

    if(skilldmg===0){return 'non-target'}

    //마법의성
    if(p.adamage===30){
      skilldmg.range *=3
    }

    if(skilldmg.isprojectile){
      this.skilldmg=skilldmg
      return {
        type:"projectile",
        pos:p.pos,
        range:skilldmg.range
      }
    }
    let targets=p.getAvailableTarget(skilldmg.range,skilldmg.skill)

    if(targets==='notarget'){
      return 'notarget'
    }

    this.skilldmg=skilldmg
    return {
      type:"targeting",
      targets:targets
    }
  }

  useSkill(target){
    let p=this.players[this.thisturn]
    this.skilldmg.onSkillUse(target)

    p.hitOneTarget(target,this.skilldmg)
    return this.getSkillStatus()
  }

  getSkillStatus(){
    let p=this.players[this.thisturn]
    return {
      turn:this.thisturn,
      silent:p.effects[3],
      cooltime:p.cooltime,
      duration:p.duration,
      level:p.level
    }
  }

  getUPID(){
    let id="P"+String(this.nextUPID)
    this.nextUPID+=1
    return id
  }

  placeProj(location){
    let p=this.players[this.thisturn]
    let id=this.getUPID()
    let proj=this.skilldmg.proj

    if(this.skilldmg.isprojectile){

      proj.placeProj(location,id)
      this.skilldmg.onPlace()
      this.activeProjectileList.push(proj)
    }

    return {
      scope:proj.scope,
      UPID:id,
      type:null
    }

  }


  getGodHandTarget(){
    return this.players[this.thisturn].getAvailableTarget(1000,0)
  }

/**
 * 사형재판, 카지노 실행
 */
  roulleteComplete(){
    console.log("roullete"+this.pendingObs)
    
    let p=this.players[this.thisturn]
    //사형재판
    if(this.pendingObs===37){
      p.trial(this.roullete_result)
    }
    //카지노
    else if(this.pendingObs===38){
      p.casino(this.roullete_result)
    }

    this.pendingObs=0;
    this.roullete_result=-1

  }
/**
 * 납치범 실행
 * @param boolean 납치범 결과 result 
 */
  kidnap(result){
    if(result){
      this.players[this.thisturn].giveEffect('stun',2,1)
    }
    else{
      this.players[this.thisturn].giveEffect('slow',4,1)
    }
    this.pendingObs=0;
  }

  getStoreData(turn){
    let p=this.players[turn]
    return p.getStoreData()
  }

  getStat(){
      let data={
        players:[]
      }

      for(let p of this.players){
        data.players.push({
          name:p.name,
          champ:p.champ,
          stats:p.stats,
          kda:[p.kill,p.death,p.assist],
          items:p.item
        })
      }

      return data
      
  }


}

module.exports=Game

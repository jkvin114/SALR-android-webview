
let moneyspend=0
let tokenbought=0
let tokenprice=-1
let tokencount=0
let lifecount=0
let recommended=null
let isStoreOpen=false
const STAT_NAME={
    'AD':'Attack Power',
    'AP':'Magic Power',
    'arP':'Attack Penetration',
    'AR':'Attack Resistance',
    'HP':'Maximum HP',
    'regen':'HP regeneration per turn',
    'MR':'Magic Resistance',
    'absorb':'Heal on Basic attack',
    'skillDmgReduction':'Skill Damage Reduction',
    'adStat':'Adaptative Stat',
    'addMdmg':'Additional magic damage<br> for skill/basicattack',
    'attackRange':'Basic Attack Range'
}
$(document).ready(function(){
    $(".storebtn").click(function(){
        console.log("open store")
        openStore()
        isStoreOpen=true
        $("#store").show(500,"swing")
        //$(".overlay").show(0)
        $("#storecontent").html(game.myStoreData.money)
      })
      $("#store_title").click(storehome)
      
      $("#storeclose").click(function(){
            closeStore()
        })

    $("#token_buy_range").on('input', function(){
	    updateVal(this.value);
    })
})
function closeStore(){
    $("#tokentotal").html("Buy 0 tokens, price: 0$")
    isStoreOpen=false
    if(moneyspend!==0){
        sendStoreData(game.myStoreData,moneyspend,tokenbought,lifecount)
    }
    tokenbought=0

    moneyspend=0
    $("#store").hide(500,"swing")
    //$(".overlay").hide()
}
function sellToken(token){
    $("#selltokenbtn").off()

    $("#selltokenclose").off()
    
    $("#sell_token h6").html("Tokens have:"+token)

    let price=getTokenSellPrice()
    tokencount=token
    $("#sell_token h5").html("Token sell price: "+price+"$")
    $("#token_sell_range").on('input', function(){	
        tokencount=Math.floor(token * (this.value/100))
        $("#token_sell_total").html("Sell "+tokencount+"tokens, " +(tokencount*price)+"$")
    })

    $("#selltokenbtn").click(function(){
        $("#sell_token").hide(500,"swing")
        sellTokenComplete(tokencount,tokencount*price)
        $("#token_sell_total").html("Sell 0 tokens, 0$")
        android_playsound('store')
        tokencount=0
    })
    $("#selltokenclose").click(function(){

        $("#sell_token").hide(500,"swing")
        sellTokenComplete(0,0)
        tokencount=0
    })


}
/**
 * 10:10%
 * 20 35%
 * 30 25%
 * 40 10%
 * 50 10%
 * 60 5%
 * 70 2%
 * 80 2%
 * 100 1%
 */
function getTokenSellPrice(){
    let r=Math.random()
    let price=100
    if(r<0.1){
        price=10
    }
    else if(r<0.45){
        price=20
    }
    else if(r<0.7){
        price=30
    }
    else if(r<0.8){
        price=40
    }
    else if(r<0.9){
        price=50
    }
    else if(r<0.95){
        price=60
    }
    else if(r<0.97){
        price=70
    }
    else if(r<0.99){
        price=80
    }
    return price
}


    
function updateVal(val){

    tokencount=Math.floor((game.myStoreData.money/tokenprice) * (val/100))
    $("#tokentotal").html("Buy "+tokencount+"tokens, price: " +(tokencount*tokenprice)+"$")
}

/**
 * 1 2%
 * 5 3%
 * 10 15%
 * 15 40%
 * 20 40%
 */
function setTokenPrice(){
    if(tokenprice>0){return}
    let r=Math.random()
    tokenprice=20
    if(r<0.02){
        tokenprice=1
    }
    else if(r<0.05){
        tokenprice=5
    }
    else if(r<0.20){
        tokenprice=10
    }
    else if(r<0.6){
        tokenprice=15
    }
    tokenprice =Math.floor(tokenprice * game.priceMultiplier) 
    
}
function setItemList(){
    let i=0
    $("#item_list").html("")
    for(let item of ItemList.items){

      $("#item_list").append("<p style='color:white;' class='store_item' onclick='selectItem("+i+")'>"
             +item.name+"</p>")
      ++i
    }
  
    $(".store_item").css({
      "font-size": "15px",
      "font-family": 'Do Hyeon',
      "width":"100%",
      "margin":"0",
      "padding":"2px",
      "cursor":"pointer"    
    })

    $(".store_item").hover(function(){
      $(this).css("background","darkblue")
    },function(){
      $(this).css("background","rgb(30, 31, 44)")
    })
    console.log('setitemlist')
}
function openStore(){
    recommended=game.myStoreData.recommendeditem //추천 아이템 리스트
    setTokenPrice()
    storehome()
    setItemList()

    updateItemList()
    tokencount=Math.floor((game.myStoreData.money/tokenprice))
    if(tokencount<=0){
        $("#buytoken").off()
    }

}
function storehome(){
    setItemList()

    $("#gold").html(game.myStoreData.money+" $")

    $(".recommenditem").remove()
    for(let i of recommended){
        $("#recommended").append("<div class='recommenditem' onclick=selectItem("+(i-1)
        +")><img src='img/items.png' style='margin-left: "+(-1 *(i-1) * 100)+"px'; ></div>")
    }

    $(".recommenditem").css({
        "cursor":"pointer",
        "margin-left":"-30px",        
        "overflow":"hidden",
        "width":"100px",
        "height":"100px",
        "display": "inline-block",
        "transform":"scale(0.6)"
        })

    $("#buy").off()
    $("#buylife").off()
    $('#store_home').show()
    $('#item_description').hide()
    $("#tokenprice").html("Current price: "+tokenprice+"$")
    $("#tokenamt").html("Current tokens have:"+game.myStoreData.token)
    $("#buytoken").html("Purchase token").css("background","#f4d142")
    if(game.myStoreData.money < tokenprice){
        $("#buytoken").html("Purchase token").css("background","gray")
    }
    $("#buytoken").click(function(){
        android_playsound('store')
        game.myStoreData.money-=tokencount* tokenprice
        game.myStoreData.token+=tokencount
        moneyspend+=tokencount* tokenprice
        tokenbought+=tokencount
        tokencount=0
        $("#token_buy_range").val(0)
        storehome()
    })

    if(tokencount<=0){
        $("#buytoken").off()
        $("#buytoken").html("")
    }
    let lifeprice=Math.pow(2,game.myStoreData.lifeBought)*200
    $("#buylife").html("Price :"+lifeprice+"$").css("background","#f4d142")
    if(game.myStoreData.money < lifeprice){
        $("#buylife").html("Price :"+lifeprice+"$").css("background","gray")
    }
    $("#buylife").click(function(){
        if(game.myStoreData.money > lifeprice){
            game.myStoreData.lifeBought+=1
            android_playsound('store')
            game.myStoreData.money-=lifeprice
            moneyspend+=lifeprice
            lifecount+=1
            storehome()
        }        
    })


    // let text=""
    // for(let i=0;i<29;++i){
    //     text += ('<div class=itemimgs> <img src="img/items.png" style="margin-left: '+(-1 * i * 100)+'px;"/></div>')
    // }
    // $("#itemimgs").html(text)

    // $(".itemimgs").css({"margin":"5px","overflow":"hidden","width":"100px",
    // "height":"100px","display": "inline-block","border":"black solid 1px","border-radius": "5px"}) 




}

function changeCurrItem(){
    let text=""
    let totalcount=0
      for(let i=0;i<game.myStoreData.item.length;++i){
        
  
        for(let j=0;j<game.myStoreData.item[i];++j){
          text+= ("<div class=store_curritemimg value="+String(i)+"><img src='img/items.png' style='margin-left: "+(-1 * i * 100)+"px'; > </div>")
          totalcount+=1
        }
        
      }
      for(let i=totalcount;i<6;++i){
        text+= ("<div class=store_curritemimg value=-1><img src='img/emptyslot.png'> </div>")
      }
      $("#curr_item").html(text)
  
      $(".store_curritemimg").css({
        "margin":"-30px",        
        "overflow":"hidden",
        "width":"100px",
        "height":"100px",
        "display": "inline-block",
        "transform":"scale(0.4)",
        "cursor":"pointer"
        }).click(function(){
            let pos=$(this).offset()
            let item_id=Number($(this).attr('value'))
            if(item_id===-1){return}
            let price=Math.floor(ItemList.items[item_id].price/2.5)
            $("#sellitembtn").off()
            $("#sellitembtn").click(function(){
                sell(price,item_id)
                android_playsound('store')
                $('.sell_toast').toast('hide');
                $("#buy").off()
                storehome()
            })
            $(".sell_toast").css({left:pos.left,top:pos.top})
            $(".sell_toast a").html(ItemList.items[item_id].name+ '<br> price:'+price+'$')
            $('.sell_toast').toast({delay: 9000});
            $('.sell_toast').toast('show');

        })

  }
  function sell(price,item_id){
      console.log('sell'+item_id)
    game.myStoreData.money+=price
    moneyspend-=price
    game.myStoreData.item[item_id]-=1

    updateItemList()
  }
  

function updateItemList(){
    $("#gold").html(game.myStoreData.money+"$")
    $(".store_item").remove()
    $("#item_list").append("<p style='color:white;' class='store_item' onclick=storehome()>Store home</p>")
    changeCurrItem()
    setItemList()
    return
    
}


function selectItem(item_id)
{
    $('#store_home').hide()
    $('#item_description').show()
    updateItemList()
    $(".parent").remove()
    $(".children").remove()
    $("#item_detail h5").html("")
    $("#buy").off()
    let thisitem=ItemList.items[item_id]
    $("#item_description h1").html(thisitem.name)


    $(".itemimg").html("<img src='img/items.png' style='margin-left: "+(-1 *(item_id) * 100)+"px'; >")
    $(".itemimg").css({
        "width":"100px",
        "height":"100px"
    })

    let ability=""
    for(let a of thisitem.ability){
        let ab=STAT_NAME[a.type]+ ' +'+a.value 
        if(a.type==="addMdmg"||a.type==="skillDmgReduction"){
        ab+="%"
        }
        ability+=ab
        ability+='<br>'
        $("#item_detail h5").html("")
        if(a.type==="skillDmgReduction"){
            $("#item_detail h5").html("Skill damage reduction applies up to 75%")
        }
        if(a.type==="attackRange"){
            $("#item_detail h5").html("Attack range increase applies up to 5")
        }
        if(a.type==="regen"){
            $("#item_detail h5").html("Regeneration per turn applies up to 30")
        }
        if(a.type==="adStat"){
            $("#item_detail h5").append("Adaptative Stat will be applied to <br> higher stat between attack and magic power")
        }
        

    }
    let temp_itemlist=Array.from(game.myStoreData.item)
   

    let actual_price=Math.floor((thisitem.price-calcDiscount(item_id,temp_itemlist))*game.priceMultiplier)
    $("#item_detail p").html(ability)

    console.log('update')
    if(game.myStoreData.money>=actual_price && !isItemLimitExceeded(temp_itemlist) && checkStoreLevel(thisitem)){
        console.log('updatebtn')
        $("#buy").html(actual_price+" $").css("background","#f4d142")
        $("#buy").click(function(){
            android_playsound('store')
            console.log("bought"+item_id)
            game.myStoreData.money-=actual_price
            moneyspend+=actual_price
            game.myStoreData.item=temp_itemlist
            game.myStoreData.item[item_id]+=1
            selectItem(item_id)
        })
    }
    else{
        console.log('updatebtn')
        $("#buy").html(actual_price+" $").css("background","gray")
    }
    let temp=Array.from(game.myStoreData.item)
    let childtext=""
    for(let p of thisitem.children){
        //let child=ItemList.items[p-1]
        let c=""
        if(!canbuy(p-1)){
            c="cannotbuy"
        }
        if(temp[p-1]>0){
            c+=" have"
            temp[p-1]-=1
        }
        // childtext+=("<div class='children "+c+"' onclick=selectItem("+(p-1)+")><img src='img/items.png' style='margin-left: "
        // +(-1 * (p-1) * 100)+"px'; > </div>")
        childtext+=("<a class='children "+c+"' onclick=selectItem("+(p-1)+") style='background:url(\"img/items.png\") -"+String((p-1) * 100)+"px 0'>")
        
       // $("#loweritem").append("<button class='children "+c+"' onclick=selectItem("+(p-1)+")>"+child.name+"   </button>")
    }
    $("#loweritem").append(childtext)
    $(".children").css({
    "box-sizing": "border-box",
    "cursor":"pointer",
    "border":"2px solid black",
    "margin":"-30px",        
    "overflow":"hidden",
    "width":"100px",
    "height":"100px",
    "display": "inline-block",
    "transform":"scale(0.35)"
    })
   
    
 
    let parenttext=""
    c=""
    for(let p of thisitem.parents){
        if(!canbuy(p-1)){
            c="cannotbuy"
        }
        parenttext+=("<div class='parent "+c+"' onclick=selectItem("+(p-1)+")><img src='img/items.png' style='margin-left: "
        +(-1 * (p-1) * 100)+"px'; > </div>")
    }
    $("#upperitem").append(parenttext)

    $(".parent").css({
        "cursor":"pointer",
        "border":"2px solid black",
        "margin":"-35px",        
        "overflow":"hidden",
        "width":"100px",
        "height":"100px",
        "display": "inline-block",
        "transform":"scale(0.35)"
    })

    $(".cannotbuy").css({
        "filter": "grayscale(90%)"
    })
    $(".have").css({
        "border":"7px solid green"
    })

}
function canbuy(item_id){
    let thisitem=ItemList.items[item_id]
    let temp_itemlist=Array.from(game.myStoreData.item) 

    let actual_price=Math.floor((thisitem.price-calcDiscount(item_id,temp_itemlist))*game.priceMultiplier)
    return game.myStoreData.money>=actual_price && !isItemLimitExceeded(temp_itemlist) && checkStoreLevel(thisitem)
}
/**
 * 첫번째 상점에선 2등급이상아이템 구입불가
 * @param {} item 
 */
function checkStoreLevel(item){
    if(game.myStat.level<=2 && item.itemlevel>=2){
        return false
    }
    return true
}

function isItemLimitExceeded(temp_itemlist){
    let count=temp_itemlist.reduce((total,curr)=> total+curr,0)

    return count+1 > game.myStoreData.itemLimit
  }

//tobuy:number    temp_itemlist:[]   
function calcDiscount(tobuy,temp_itemlist){
    let thisitem=ItemList.items[tobuy]

    if(thisitem.children.length===0){
        return 0
    }
    let discount=0
    //c:number   start with 1
    for(let c of thisitem.children){
        if(temp_itemlist[c-1]===0){
            discount+=calcDiscount(c-1,temp_itemlist)
        }
        else{
            discount+=ItemList.items[c-1].price
            temp_itemlist[c-1]-=1
        }
    }

    return discount

}


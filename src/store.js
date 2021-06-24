let moneyspend = 0
let tokenbought = 0
let tokenprice = -1
let tokencount = 0
let lifecount = 0
let recommended = null
let isStoreOpen = false
const STAT_NAME_ENG = {
	AD: "Attack Power",
	AP: "Magic Power",
	arP: "Attack Penetration",
	AR: "Attack Resistance",
	HP: "Maximum HP",
	regen: "HP regeneration per turn",
	MR: "Magic Resistance",
	absorb: "Heal on Every attack",
	skillDmgReduction: "Skill Damage Reduction",
	adStat: "Adaptative Stat",
	addMdmg: "Additional magic damage<br> when attack",
	attackRange: "Basic Attack Range",
	obsR: "Obstacle damage reduction",
	ultHaste: "Ultimate cooltime reduction",
	moveSpeed: "Movement speed(additional dice)",
}

const STAT_NAME = {
	AD: "공격력",
	AP: "주문력",
	arP: "물리 관통력",
	MP: "마법 관통력",
	AR: "방어력",
	HP: "체력",
	regen: "턴당 체력재생",
	MR: "마법 저항력",
	absorb: "모든피해 흡혈",
	skillDmgReduction: "스킬 데미지감소",
	adStat: "적응형 능력치",
	addMdmg: "공격시 최대체력비례 추가 마법피해",
	attackRange: "기본공격 사거리",
	obsR: "장애물 저항",
	ultHaste: "궁극기 가속",
	moveSpeed: "이동 속도(=추가 주사위)",
}
$(document).ready(function () {
	$(".storebtn").click(function () {
		console.log("open store")
		openStore()
		isStoreOpen = true
		$("#store").show(500, "swing")
		//$(".overlay").show(0)
		$("#storecontent").html(game.myStoreData.money)
	})
	$("#store_title").click(storehome)

	$("#storeclose").click(function () {
		closeStore()
	})

	$("#token_buy_range").on("input", function () {
		updateVal(this.value)
	})
})
function closeStore() {
	$("#tokentotal").html("Buy 0 coins, price: 0$")
	isStoreOpen = false
	if (moneyspend !== 0) {
		sendStoreData(game.myStoreData, moneyspend, tokenbought, lifecount)
	}
	tokenbought = 0

	moneyspend = 0
	$("#store").hide(500, "swing")
	//$(".overlay").hide()
}
function sellToken(token) {
	$("#selltokenbtn").off()
	$("#sellalltokenbtn").off()

	$("#selltokenclose").off()

	$("#sell_token h6").html("Coins have:" + token)

	let price = getTokenSellPrice()
	tokencount = token
	$("#sell_token h5").html("Coin sell price: " + price + "$")
	$("#token_sell_range").on("input", function () {
		tokencount = Math.floor(token * (this.value / 100))
		$("#token_sell_total").html(
			"Sell " + tokencount + "Coins, " + tokencount * price + "$"
		)
	})

	$("#selltokenbtn").click(function () {
		$("#sell_token").hide(500, "swing")
		sellTokenComplete(tokencount, tokencount * price)
		if (tokencount < 1) return
		$("#token_sell_total").html("Sell 0 Coins, 0$")
		android_playsound("store")
		tokencount = 0
	})

	$("#sellalltokenbtn").click(function () {
		$("#sell_token").hide(500, "swing")
		sellTokenComplete(token, token * price)
		if (tokencount < 1) return
		$("#token_sell_total").html("Sell 0 Coin, 0$")
		android_playsound("store")
		tokencount = 0
	})
	$("#selltokenclose").click(function () {
		$("#sell_token").hide(500, "swing")
		sellTokenComplete(0, 0)
		tokencount = 0
	})
}
/**
 * 5:3%
 * 10:10%
 * 20 35%
 * 30 30%
 * 40 10%
 * 50 5%
 * 60 5%
 * 70 2%
 * 80 2%
 * 100 1%
 */
function getTokenSellPrice() {
	let r = Math.random()
	let price = 100
	if (r < 0.03) {
		price = 5
	}
	if (r < 0.1) {
		price = 10
	} else if (r < 0.45) {
		price = 20
	} else if (r < 0.75) {
		price = 30
	} else if (r < 0.85) {
		price = 40
	} else if (r < 0.9) {
		price = 50
	} else if (r < 0.95) {
		price = 60
	} else if (r < 0.97) {
		price = 70
	} else if (r < 0.99) {
		price = 80
	}
	return price
}

function updateVal(val) {
	tokencount = Math.floor((game.myStoreData.money / tokenprice) * (val / 100))
	$("#tokentotal").html(
		"Buy " + tokencount + "Coins, price: " + tokencount * tokenprice + "$"
	)
}

/**
 * 1 1%
 * 5 4%
 * 10 5%
 * 20 45%
 * 25 25%
 * 30 20%
 */
function setTokenPrice() {
	if (tokenprice > 0) {
		return
	}
	let r = Math.random()
	tokenprice = 30
	if (r < 0.01) {
		tokenprice = 1
	} else if (r < 0.05) {
		tokenprice = 5
	} else if (r < 0.1) {
		tokenprice = 10
	} else if (r < 0.55) {
		tokenprice = 20
	} else if (r < 0.8) {
		tokenprice = 25
	}
	tokenprice = Math.floor(tokenprice * game.priceMultiplier)
}
function setItemList() {
	let i = 0
	$("#item_list").html("")
	for (let item of ItemList.items) {
		$("#item_list").append(
			"<p style='color:white;' class='store_item' onclick='selectItem(" +
				i +
				")'>" +
				chooseLang(item.name, item.kor_name) +
				"</p>"
		)
		++i
	}

	$(".store_item").css({
		"font-size": "15px",
		"font-family": "Do Hyeon",
		width: "100%",
		margin: "0",
		padding: "2px",
		cursor: "pointer",
	})

	$(".store_item").hover(
		function () {
			$(this).css("background", "darkblue")
		},
		function () {
			$(this).css("background", "rgb(30, 31, 44)")
		}
	)
	console.log("setitemlist")
}
function openStore() {
	recommended = game.myStoreData.recommendeditem //추천 아이템 리스트
	setTokenPrice()
	storehome()
	setItemList()

	updateItemList()
	tokencount = Math.floor(game.myStoreData.money / tokenprice)
	if (tokencount <= 0) {
		$("#buytoken").off()
	}
}
function storehome() {
	setItemList()

	$("#gold").html(game.myStoreData.money + " $")

	$(".recommenditem").remove()
	for (let i of recommended) {
		$("#recommended").append(
			"<div class='recommenditem' onclick=selectItem(" +
				(i - 1) +
				")><img src='img/items.png' style='margin-left: " +
				-1 * (i - 1) * 100 +
				"px'; ></div>"
		)
	}

	$(".recommenditem").css({
		cursor: "pointer",
		"margin-left": "-30px",
		overflow: "hidden",
		width: "100px",
		height: "100px",
		display: "inline-block",
		transform: "scale(0.6)",
	})

	$("#buy").off()
	$("#buylife").off()
	$("#store_home").show()
	$("#item_description").hide()
	$("#tokenprice").html("Current price: " + tokenprice + "$")
	$("#tokenamt").html("Current Coins have:" + game.myStoreData.token)
	$("#buytoken").html("Purchase Coin").css("background", "#f4d142")
	// if(game.myStoreData.money < tokenprice){
	//     $("#buytoken").html("Purchase Coin").css("background","gray")
	// }
	$("#buytoken").click(function () {
		if (tokencount < 1) return
		android_playsound("store")
		game.myStoreData.money -= tokencount * tokenprice
		game.myStoreData.token += tokencount
		moneyspend += tokencount * tokenprice
		tokenbought += tokencount
		tokencount = 0
		$("#token_buy_range").val(0)
		storehome()
	})

	// if(tokencount<=0){
	//     $("#buytoken").off()
	//     // $("#buytoken").html("")
	// }
	let lifeprice = Math.pow(2, game.myStoreData.lifeBought) * 200
	$("#buylife")
		.html("Price :" + lifeprice + "$")
		.css("background", "#f4d142")
	if (game.myStoreData.money < lifeprice) {
		$("#buylife")
			.html("Price :" + lifeprice + "$")
			.css("background", "gray")
	}
	$("#buylife").click(function () {
		if (game.myStoreData.money > lifeprice) {
			game.myStoreData.lifeBought += 1
			android_playsound("store")
			game.myStoreData.money -= lifeprice
			moneyspend += lifeprice
			lifecount += 1
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

function changeCurrItem() {
	let text = ""
	let totalcount = 0
	for (let i = 0; i < game.myStoreData.item.length; ++i) {
		for (let j = 0; j < game.myStoreData.item[i]; ++j) {
			text +=
				"<div class=store_curritemimg value=" +
				String(i) +
				"><img src='img/items.png' style='margin-left: " +
				-1 * i * 100 +
				"px'; > </div>"
			totalcount += 1
		}
	}
	for (let i = totalcount; i < 6; ++i) {
		text +=
			"<div class=store_curritemimg value=-1><img src='img/emptyslot.png'> </div>"
	}
	$("#curr_item").html(text)

	$(".store_curritemimg")
		.css({
			margin: "-30px",
			overflow: "hidden",
			width: "100px",
			height: "100px",
			display: "inline-block",
			transform: "scale(0.4)",
			cursor: "pointer",
		})
		.click(function () {
			let pos = $(this).offset()
			let item_id = Number($(this).attr("value"))
			if (item_id === -1) {
				return
			}
			let price = Math.floor(ItemList.items[item_id].price / 2.5)
			$("#sellitembtn").off()
			$("#sellitembtn").click(function () {
				sell(price, item_id)
				android_playsound("store")
				$(".sell_toast").toast("hide")
				$("#buy").off()
				storehome()
			})
			$(".sell_toast").css({ left: pos.left, top: pos.top })
			$(".sell_toast a").html(
				ItemList.items[item_id].name + "<br> price:" + price + "$"
			)
			$(".sell_toast").toast({ delay: 5000 })
			$(".sell_toast").toast("show")
		})
}
function sell(price, item_id) {
	console.log("sell" + item_id)
	game.myStoreData.money += price
	moneyspend -= price
	game.myStoreData.item[item_id] -= 1

	updateItemList()
}

function updateItemList() {
	$("#gold").html(game.myStoreData.money + "$")
	$(".store_item").remove()
	$("#item_list").append(
		"<p style='color:white;' class='store_item' onclick=storehome()>Store home</p>"
	)
	changeCurrItem()
	setItemList()
	return
}

function selectItem(item_id) {
	extendTimeout()
	$("#store_home").hide()
	$("#item_description").show()
	updateItemList()
	$(".parent").remove()
	$(".children").remove()
	$("#item_detail h5").html("")
	$("#buy").off()
	let thisitem = ItemList.items[item_id]
	$("#item_description h1").html(chooseLang(thisitem.name, thisitem.kor_name))

	$(".itemimg").html(
		"<img src='img/items.png' style='margin-left: " +
			-1 * item_id * 100 +
			"px'; >"
	)
	$(".itemimg").css({
		width: "100px",
		height: "100px",
	})

	let ability = ""
	for (let a of thisitem.ability) {
		let ab = ""
		if (LANG === "kor") {
			ab = STAT_NAME[a.type] + " +" + a.value
		} else {
			ab = STAT_NAME_ENG[a.type] + " +" + a.value
		}
		if (
			a.type === "addMdmg" ||
			a.type === "skillDmgReduction" ||
			a.type === "absorb" ||
			a.type === "obsR"
		) {
			ab += "%"
		}
		ability += ab
		ability += "<br>"
		$("#item_detail h5").html("")
		if (a.type === "skillDmgReduction") {
			$("#item_detail h5").html(
				chooseLang(
					"Skill damage reduction applies up to 75%",
					"스킬데미지감소는 75%까지만 적용"
				)
			)
		}
		if (a.type === "attackRange") {
			$("#item_detail h5").html(
				chooseLang(
					"Attack range increase applies up to 5",
					"기본공격 사거리는 5까지만 증가"
				)
			)
		}
		if (a.type === "regen") {
			$("#item_detail h5").html(
				chooseLang(
					"Regeneration per turn applies up to 30",
					"턴당 체력재생은 30까지만 적용"
				)
			)
		}
		if (a.type === "ultHaste") {
			$("#item_detail h5").html(
				chooseLang(
					"ultimate Haste applies up to 3 turns",
					"궁극기 가속은 3턴까지만 적용"
				)
			)
		}
		if (a.type === "moveSpeed") {
			$("#item_detail h5").html(
				chooseLang(
					"movement speed applies up to 2",
					"이동속도 증가는 2까지만 적용"
				)
			)
		}
		if (a.type === "adStat") {
			// $("#item_detail h5").append(
			//   "Adaptative Stat will be applied to <br> higher stat between attack and magic power"
			// )
		}
	}
	if (thisitem.unique_effect != null) {
		$("#item_detail h5").append(
			"<br>[" +
				chooseLang("unique passive", "고유지속효과") +
				"]:" +
				chooseLang(thisitem.unique_effect, thisitem.unique_effect_kor)
		)
	}
	let temp_itemlist = Array.from(game.myStoreData.item)

	let actual_price = Math.floor(
		(thisitem.price - calcDiscount(item_id, temp_itemlist)) *
			game.priceMultiplier
	)
	$("#item_detail p").html(ability)

	console.log("update")
	if (
		game.myStoreData.money >= actual_price &&
		!isItemLimitExceeded(temp_itemlist) &&
		checkStoreLevel(thisitem)
	) {
		console.log("updatebtn")
		$("#buy")
			.html(actual_price + " $")
			.css("background", "#f4d142")
		$("#buy").click(function () {
			android_playsound("store")
			console.log("bought" + item_id)
			game.myStoreData.money -= actual_price
			moneyspend += actual_price
			game.myStoreData.item = temp_itemlist
			game.myStoreData.item[item_id] += 1
			selectItem(item_id)
		})
	} else {
		console.log("updatebtn")
		$("#buy")
			.html(actual_price + " $")
			.css("background", "gray")
	}
	let temp = Array.from(game.myStoreData.item)
	let childtext = ""
	for (let p of thisitem.children) {
		//let child=ItemList.items[p-1]
		let c = ""
		if (!canbuy(p - 1)) {
			c = "cannotbuy"
		}
		if (temp[p - 1] > 0) {
			c += " have"
			temp[p - 1] -= 1
		}
		// childtext+=("<div class='children "+c+"' onclick=selectItem("+(p-1)+")><img src='img/items.png' style='margin-left: "
		// +(-1 * (p-1) * 100)+"px'; > </div>")
		childtext +=
			"<a class='children " +
			c +
			"' onclick=selectItem(" +
			(p - 1) +
			') style=\'background:url("img/items.png") -' +
			String((p - 1) * 100) +
			"px 0'>"

		// $("#loweritem").append("<button class='children "+c+"' onclick=selectItem("+(p-1)+")>"+child.name+"   </button>")
	}
	$("#loweritem").append(childtext)
	$(".children").css({
		"box-sizing": "border-box",
		cursor: "pointer",
		border: "2px solid black",
		margin: "-30px",
		overflow: "hidden",
		width: "100px",
		height: "100px",
		display: "inline-block",
		transform: "scale(0.35)",
	})

	let parenttext = ""
	c = ""
	for (let p of thisitem.parents) {
		if (!canbuy(p - 1)) {
			c = "cannotbuy"
		}
		parenttext +=
			"<div class='parent " +
			c +
			"' onclick=selectItem(" +
			(p - 1) +
			")><img src='img/items.png' style='margin-left: " +
			-1 * (p - 1) * 100 +
			"px'; > </div>"
	}
	$("#upperitem").append(parenttext)

	$(".parent").css({
		cursor: "pointer",
		border: "2px solid black",
		margin: "-35px",
		overflow: "hidden",
		width: "100px",
		height: "100px",
		display: "inline-block",
		transform: "scale(0.35)",
	})

	$(".cannotbuy").css({
		filter: "grayscale(90%)",
	})
	$(".have").css({
		border: "7px solid green",
	})
}
function canbuy(item_id) {
	let thisitem = ItemList.items[item_id]
	let temp_itemlist = Array.from(game.myStoreData.item)

	let actual_price = Math.floor(
		(thisitem.price - calcDiscount(item_id, temp_itemlist)) *
			game.priceMultiplier
	)
	return (
		game.myStoreData.money >= actual_price &&
		!isItemLimitExceeded(temp_itemlist) &&
		checkStoreLevel(thisitem)
	)
}
/**
 * 첫번째 상점에선 2등급이상아이템 구입불가
 * @param {} item
 */
function checkStoreLevel(item) {
	if (game.myStat.level <= 2 && item.itemlevel >= 2) {
		return false
	}
	return true
}

function isItemLimitExceeded(temp_itemlist) {
	let count = temp_itemlist.reduce((total, curr) => total + curr, 0)

	return count + 1 > game.myStoreData.itemLimit
}

//tobuy:number    temp_itemlist:[]
function calcDiscount(tobuy, temp_itemlist) {
	let thisitem = ItemList.items[tobuy]

	if (thisitem.children.length === 0) {
		return 0
	}
	let discount = 0
	//c:number   start with 1
	for (let c of thisitem.children) {
		if (temp_itemlist[c - 1] === 0) {
			discount += calcDiscount(c - 1, temp_itemlist)
		} else {
			discount += ItemList.items[c - 1].price
			temp_itemlist[c - 1] -= 1
		}
	}

	return discount
}

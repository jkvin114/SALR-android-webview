const ip = "http://" + sessionStorage.ip_address
const socket = io(ip)
let rname = sessionStorage.roomName
socket_connected = false
socket.on("connect", function () {
	socket_connected = true
	if (sessionStorage.turn === "0" && sessionStorage.host === "true") {
		console.log("create")
		$("#Hostingpage").show()
		makeroom(sessionStorage.roomName, sessionStorage.nickName, false)
	}
	if (sessionStorage.host === "simulation") {
		console.log("create simulation")
		$("#Hostingpage").show()
		makeroom(sessionStorage.roomName, "host", true)
	}
	$("#individual").attr("disabled", false)
	$("#connection").html("Connected!")
	// //두번쩨접속, 방장 아닐시 컴퓨터 턴 가져옴
	// if(sessionStorage.status==='hosting'){
	//   sessionStorage.status='selection'
	//   if(sessionStorage.turn!==0){socket.emit('requestAIturn',rname)}
	// }
})
socket.on("player_select", function () {
	$("#Mainpage").fadeIn(1000)
	$("#Firstpage").hide()
})
function resetGame() {
	if (sessionStorage.host === "true" || sessionStorage.host === "simulation") {
		socket.emit("resetGame", rname) //alert(sessionStorage.host)
	} else {
		console.log(playerlist)
		playerlist[myturn].type = "none"
		sendPlayerList(playerlist)
	}
}
function makeroom(rname, nname, isSimulation) {
	console.log(nname)
	socket.emit("create_room", rname, nname, isSimulation)
}

function register(rname, name) {
	socket.emit("register", rname)
}
function sendPlayerList(list) {
	console.log("sendplayerlist")
	socket.emit("playerlistupdate", rname, list)
}
function kickPlayer(turn) {
	socket.emit("kick", rname, Number(turn))
}

// function setAI(aiturn)
// {
//   socket.emit('setai',rname,aiturn)
// }

function requestNames() {
	socket.emit("requestNames", rname)
}
function showTeamToGuest() {
	socket.emit("showTeamToGuest", rname)
}
function sendCheckBoxToServer(check_status) {
	console.log("checkboc" + check_status)
	socket.emit("setcheckbox", rname, check_status)
}
function changeChamp(turn, champ) {
	socket.emit("change_champ", rname, turn, champ)
}
function setMap(map) {
	socket.emit("change_map", rname, map)
}
function sendReady(ready) {
	socket.emit("change_ready", rname, myturn, ready)
}
function submitTeamSelection(instant, num) {
	window.onbeforeunload = () => {}

	socket.emit("gameready", rname, instant, num)
	if (instant) {
		window.location.href = "instant.html"
	} else if (playerlist[0].type === "sim_ai") {
		window.location.href = "simulation_page.html"
	} else {
		window.location.href = "gamepage.html"
	}
}
socket.on("gamepage", () => {
	window.onbeforeunload = function () {}
	window.location.href = "gamepage.html"
})
socket.on("showTeamToGuest", () => {
	showTeamPage(true)
})
//for teamselection
socket.on("requestNames", (names) => {
	setNickNames(names)
})
socket.on("create_room", function (roomName) {
	sessionStorage.roomName = roomName
	console.log(sessionStorage.roomName)
})
/**
 * 방장전용
 * 방이름 존재시 호출
 */
socket.on("room_name_exist", function (roomName) {
	window.alert("That room name already exists")
	window.onbeforeunload = () => {}

	window.location.href = "index.html"
})
/**
 * 게스트전용
 * 방에 참가 완료시 호출
 */
socket.on("join_room", function (r) {
	$(".champchoice").show()
	sessionStorage.roomName = r
	rname = r
	let nname = sessionStorage.nickName
	socket.emit("requestcard", r, nname)
	//$(".mainbtn").show()
	$("#renew").hide()
	$("#roombtn").hide()

	//다음 클라이언트에 연결시 감지할 수 있게함
	sessionStorage.status = "hosting"
})

socket.on("sendcheckbox", function (check_status) {
	setCheckBox(check_status)
})
// socket.on('showguest',(guestnum)=>{
//   showGuest(guestnum)
//   console.log(guestnum)
// })
/**
 * 게스트 전용
 * 방장이 킥할시 호출
 */
socket.on("kicked", function (turn) {
	console.log("kick" + myturn + turn)

	if (myturn === turn) {
		sessionStorage.status = null
		alert("You have been kicked!")
		window.onbeforeunload = () => {}
		window.location.href = "hostingpage_host.html"
	}
})

socket.on("playerupdate", (playerlist, tc) => updatePlayerList(playerlist, tc))

/**
 * 게스트 전용
 * requestcard 완료시 호출
 */
socket.on("registercomplete", (turn, playerlist) => {
	console.log("registercomplete" + turn)
	$("#Hostingpage").fadeIn(300)
	$("#readybtn").show()
	sessionStorage.turn = turn
	updatePlayerList(playerlist)
	setTurn(turn)
	//updateCard(cards)
})
// socket.on('setai',(aiturn)=>setAiTeamselection(aiturn))
socket.on("change_map", (map) => receiveMap(map))

socket.on("change_ready", (turn, ready) => receiveReady(turn, ready))
/**
 * 방장이 방 없에면 호출
 */
socket.on("quit", function () {
	window.onbeforeunload = () => {}
	window.location.href = "index.html"
})
socket.on("room_full", function () {
	alert("The room is full!")
	window.onbeforeunload = () => {}
	window.location.href = "hostingpage_host.html"
})

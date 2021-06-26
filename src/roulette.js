const CASINO = 1
const TRIAL = 2
const casinocolor = [
	"#f5dd42",
	"#f5b642",
	"#f5dd42",
	"#f5b642",
	"#f5dd42",
	"#f5b642",
]
const trialcolor = ["#fbc", "#f88", "#fbc", "#f88", "#fbc", "#f88"]
const casinolabel = [
	"+100$",
	"Money doubles",
	"Speed for 2 turns",
	"HP halves",
	"Money halves",
	"Stun, HP-50",
]
const casinolabel_kor = [
	"+100$",
	"재산 2배",
	"신속 2턴",
	"체력 -50%",
	"재살 절반몰수",
	"속박, 체력-50",
]
const triallabel = [
	"-100$",
	"Slavery",
	"Move to nearest player",
	"Death!",
	"Stun, HP-50",
	"50% chance of death \nfor every player",
]
const triallabel_kor = [
	"-100$",
	"노예계약",
	"가장 가까운 플레이어에게 이동",
	"사형",
	"속박, 체력 -50%",
	"모든플레이어 각각 <br>50%로 사망",
]

const slices = 6
const sliceDeg = 360 / slices
let deg = rand(0, 360)
let speed = 0
const slowDown = 0.989
let ctx = document.getElementById("roullete").getContext("2d")
const width = document.getElementById("roullete").width // size
const center = width / 2 // center
let isStopped = false
let rouletteType = 0
let framecount = 0
function rand(min, max) {
	return Math.random() * (max - min) + min
}

function deg2rad(deg) {
	return (deg * Math.PI) / 180
}

function drawSlice(deg, color) {
	ctx.beginPath()
	ctx.fillStyle = color
	ctx.moveTo(center, center)
	ctx.arc(center, center, width / 2, deg2rad(deg), deg2rad(deg + sliceDeg))
	ctx.lineTo(center, center)
	ctx.fill()
}

function drawText(deg, text) {
	ctx.save()
	ctx.translate(center, center)
	ctx.rotate(deg2rad(deg))
	ctx.textAlign = "right"
	ctx.fillStyle = "#000"
	if (text.length > 15) {
		ctx.font = "bold 7px Do Hyeon"
	} else {
		ctx.font = "bold 12px Do Hyeon"
	}
	ctx.fillText(text, 130, 10)
	ctx.restore()
}

function drawImg() {
	ctx.clearRect(0, 0, width, width)
	for (let i = 0; i < slices; i++) {
		if (rouletteType === CASINO) {
			drawSlice(deg, casinocolor[i])
			drawText(
				deg + sliceDeg / 2,
				chooseLang(casinolabel[i], casinolabel_kor[i])
			)
		} else if ((rouletteType = TRIAL)) {
			drawSlice(deg, trialcolor[i])
			drawText(deg + sliceDeg / 2, chooseLang(triallabel[i], triallabel_kor[i]))
		}
		deg += sliceDeg
	}
}

function anim() {
	deg += speed
	deg %= 360
	framecount += 1
	// Increment speed
	if (!isStopped && speed < 4.7) {
		speed = speed + 1 * 0.1
	}
	if (speed > 4.5) {
		isStopped = true
	}
	// Decrement Speed
	if (isStopped) {
		speed = speed > 0.2 ? (speed *= slowDown) : 0
	}
	// Stopped!
	if (!speed) {
		indicateRoulleteResult()
		setTimeout(roulleteEnd, 1500)
	}

	drawImg()
	if (speed > 0) {
		window.requestAnimationFrame(anim)
	}
}

function indicateRoulleteResult() {
	if (rouletteType === CASINO) {
		android_toast(
			chooseLang(
				casinolabel[game.roullete_result],
				casinolabel_kor[game.roullete_result]
			)
		)
	} else if (rouletteType === TRIAL) {
		android_toast(
			chooseLang(
				triallabel[game.roullete_result],
				triallabel_kor[game.roullete_result]
			)
		)
	}
}

function randomObs(iscasino) {
	if (iscasino) {
		rouletteType = CASINO
	} else {
		rouletteType = TRIAL
	}
	console.log(game.roullete_result)
	$("#casino").show()
	$(".overlay").show()
	let r = 1
	console.log("roullete", game.roullete_result)
	deg = Math.abs(game.roullete_result - 6) * 60 + Math.random() * 15 + 95
	drawImg()

	if (game.ismyturn) {
		$("#casinobtn").show()
	} else {
		$("#casinobtn").hide()
	}
	// $("#casinobtn").show()
}

/**
 * 룰렛 돌리면 호출
 */
function calculatePrize() {
	android_playsound("roullete")
	$("#casinobtn").hide()
	//let stopAt = (game.roullete_result -1) * 60 + (Math.random() * 20);
	if (game.ismyturn) {
		turnRoullete() //다른플레이어에게 전송
	}
	anim()
	// setTimeout(()=>{isStopped=true},2000)
}

function roulleteEnd() {
	$("#casino").hide()
	$(".overlay").hide()
	if (game.ismyturn) {
		roulleteComplete()
	}
	isStopped = false
	speed = 0
}

// Usual pointer drawing code.

function playRoulleteSound() {
	return
	let audio = document.getElementById("sound_tick")
	audio.pause()
	audio.currentTime = 0 // Play the sound.
	audio.play()
}

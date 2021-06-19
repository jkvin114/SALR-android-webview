const ip = "http://" + sessionStorage.ip_address
let socket = io(ip)
const rname = sessionStorage.roomName
socket.on("connect", function () {
  console.log("game")
  requestsetting()
  $("#largetext").html("Requesting Game info...")
})
function requestsetting() {
  socket.emit("requestsetting", rname)
}
function startSimulation() {
  socket.emit("startGame", rname)
}
function setupComplete() {
  socket.emit("startGame", rname)
}
function pressDice(dicenum) {
  socket.emit("pressdice", rname, dicenum)
}
function checkObstacle() {
  socket.emit("checkobstacle", rname)
}
function obsComplete() {
  socket.emit("obscomplete", rname)
}
function goNextTurn() {
  socket.emit("gonextturn", rname)
}

function getSkill(s) {
  socket.emit("getskill", rname, s)
}
function sendTarget(t) {
  console.log("target " + t)
  endSelection()
  socket.emit("sendtarget", rname, t)
}
function sendTileLocation(location) {
  endSelection()
  socket.emit("sendProjectileLocation", rname, location)
}
function resetGame() {
  scene = null
  game = null
  socket.emit("resetGame", rname)
}
function sendGodHandInfo(info) {
  endSelection()
  socket.emit("obstacle_selection_complete", rname, info)
}

function sendStoreData(storedata, moneyspend, tokenbought, life) {
  socket.emit("sendStoreData", rname, {
    storedata: storedata,
    moneyspend: moneyspend,
    turn: game.myturn,
    tokenbought: tokenbought,
    life: life,
  })
}
function sendMessageToServer(msg, who) {
  socket.emit("sendMessage", rname, {
    msg: msg,
    turn: who,
  })
}
function sendSubmarineDest(pos, complete) {
  $(".mystatus").show()
  socket.emit("action_selection_complete", rname, {
    type: "submarine",
    pos: pos,
    complete: complete,
  })
}

function reloadGame(turn) {
  socket.emit("reload_game", rname, turn)
}
function turnRoullete() {
  socket.emit("turn_roullete", rname)
}

function roulleteComplete() {
  if (game.ismyturn) {
    socket.emit("obstacle_selection_complete", rname, { type: "roullete" })
  }
}
function selectionComplete(type, name, result) {
  if (type === "action") {
    if (name === "ask_way2") {
      socket.emit("action_selection_complete", rname, {
        type: "ask_way2",
        result: !result,
      })
    }
  } else if (type === "obs") {
    if (name === "kidnap") {
      socket.emit("obstacle_selection_complete", rname, {
        type: "kidnap",
        result: result,
      })
    } else if (name === "threaten") {
      socket.emit("obstacle_selection_complete", rname, {
        type: "threaten",
        result: result,
      })
    }
  }
}

function sellTokenComplete(token, money) {
  console.log("selltoken")
  if (game.ismyturn) {
    socket.emit("obstacle_selection_complete", rname, {
      type: "sell_token",
      money: money,
      token: token,
    })
  }
}
function extendTimeout() {
  socket.emit("extend_timeout", rname, game.myturn)
}

socket.on("initialsetting", function (setting) {
  initUI(setting)
})

socket.on("nextturn", function (t) {
  if (t == null) return
  nextTurn(t)
})
socket.on("rolldice", function (dice) {
  if (dice == null) return
  rollDice(dice)
})
socket.on("changehp", function (val) {
  if (val == null) return

  scene.animateHP(
    val.turn,
    val.currhp,
    val.currmaxhp,
    val.hp,
    val.skillfrom,
    val.type
  )
})

socket.on("changemoney", function (val) {
  if (val == null) return

  updateMoney(val)

  if (val.amt !== 0) {
    scene.indicateMoney(val.turn, val.amt)
  }
})
socket.on("effect", function (val) {
  if (val == null) return

  if (val.turn === game.myturn) {
    giveEffect(val.effect, val.turn)
  }
  scene.indicateEffect(val.turn, val.effect, val.num)
})
socket.on("showeffect", function (turn, type) {
  if (turn == null) return
  console.log("showeffect" + type)
  scene.showEffect(turn, type)
})

socket.on("teleport", function (val) {
  if (val == null) return

  // scene.levitatePlayer(val.turn)
  // setTimeout(()=>scene.tpPlayer(val.turn,val.pos),700)
  scene.teleportPlayer(val.turn, val.pos)
})
socket.on("can_use_skill", function (status) {
  if (!game.ismyturn || status == null) {
    return
  }
  showSkillBtn(status)
})
socket.on("targets", function (result) {
  if (result == null) return

  if (result === "nocool") {
    android_toast("cooltime not returned")
    showSkillBtn(game.skillstatus)
  } else if (result.type === "non-target") {
    //alert("used skill")
    showSkillBtn(result.skillstatus)
  } else if (result === "notarget") {
    android_toast("no targets in range!")
    showSkillBtn(game.skillstatus)
  } else if (result === "notlearned") {
    android_toast("You did not learned skill yet!")
    showSkillBtn(game.skillstatus)
  } else if (result.type === "targeting") {
    scene.showTarget(result.targets, false)
  } else if (result.type === "projectile") {
    showRangeTiles(result.pos, result.range, result.size, "skill")
  }
})
socket.on("skillused", function (status) {
  if (status == null) return
  showSkillBtn(status)
})

socket.on("placeProjectile", function (proj) {
  if (proj == null) return
  console.log(proj.UPID)
  scene.placeProj(proj)
})

socket.on("place_passproj", function (type, pos, UPID) {
  if (type == null) return
  scene.placePassProj({
    type: type,
    pos: pos,
    UPID: UPID,
  })
})
socket.on("removeProj", function (UPID) {
  if (UPID == null) return
  scene.destroyProj(UPID)
})
socket.on("godhand_target", function (targets) {
  if (game.ismyturn || !targets) {
    $("#largetext").html("God`s hand \n Choose a player to move")
    scene.showTarget(targets, true)
  }
})

socket.on("die", function (info) {
  if (info == null) return
  playerDie(
    info.target,
    info.location,
    info.storeData,
    info.skillfrom,
    info.isShutDown,
    info.killerMultiKillCount
  )
})

socket.on("respawn", function (who, respawnPos) {
  if (who == null) return
  playerRespawn(who, respawnPos)
})
socket.on("arrive_store", function (info) {
  if (info == null) return
  arriveStore(info.who, info.storeData, info.street_vendor)
})

socket.on("receive_message", function (msg) {
  if (msg == null) return
  receiveMessage(msg)
})
socket.on("reload_response", function (stun) {
  // $(dicebtn[0]).show()
})

socket.on("trial", function (num) {
  if (num == null) return
  game.roullete_result = num
  randomObs(false)
})
socket.on("casino", function (num) {
  if (num == null) return
  game.roullete_result = num
  randomObs(true)
})

socket.on("kidnap", function () {
  if (!game.ismyturn) {
    return
  }
  showSelection("obs", "kidnap")
})

socket.on("threaten", function () {
  if (!game.ismyturn) {
    return
  }
  showSelection("obs", "threaten")
})
socket.on("sell_token", function (token) {
  if (!game.ismyturn || token == null) {
    return
  }
  if (token > 0) {
    $("#sell_token").show(500, "swing")
    sellToken(token)
  } else {
    sellTokenComplete(0, 0)
  }
})

socket.on("ask_way2", function () {
  if (!game.ismyturn) {
    return
  }
  showSelection("action", "ask_way2")
})
socket.on("use_submarine", function (pos) {
  if (!game.ismyturn || pos == null) {
    return
  }
  showRangeTiles(pos, 16, 0, "submarine")
})

socket.on("turn_roullete", function () {
  if (!game.ismyturn) {
    calculatePrize()
  }
})
socket.on("change", function (type, turn, amt) {
  if (type == null) return

  if (type === "kda") {
    changeKda(turn, amt)
  }
  if (type === "removeEffect") {
    removeEffect(amt, turn)
  }

  if (game.myturn !== turn) {
    return
  }

  switch (type) {
    case "stat":
      game.myStat = amt
      break
    case "way":
      game.onMainWay = amt
      break
    case "token":
      game.myStoreData.token = amt
      break
    case "life":
      game.myStoreData.life = amt
      break
    case "item":
      game.myStoreData.item = amt
      console.log(amt)
      changeItemToast()
      break
  }
})
socket.on("update_skill_info", function (turn, info) {
  if (game.myturn !== turn || turn == null) {
    return
  }
  updateSkillInfo(info)
})
socket.on("start_timeout_countdown", function (turn, time) {
  if (game.myturn !== turn || turn == null) {
    return
  }
  timeoutStart(time)
})
socket.on("stop_timeout_countdown", function (turn) {
  if (game.myturn !== turn || turn == null) {
    return
  }
  timeoutStop()
})

socket.on("force_nextturn", function (turn) {
  if (game.myturn !== turn || turn == null) {
    return
  }
  console.log("forcenextturn")
  hideEveryWindow()
  timeoutStop()
})

socket.on("quit", function () {
  if (game.myturn === turn) {
    return
  }
  window.onbeforeunload = () => {}
  alert("someone left the game!")
  window.location.href = "index.html"
})
socket.on("gameover", function (winner) {
  indicateResult(winner)
  socket = null
})

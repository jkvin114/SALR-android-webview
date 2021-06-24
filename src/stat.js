const ip = "http://" + sessionStorage.ip_address
let table = []
// let d={
//     players:[
//         {
//             name:"3P",
//             champ:"creed",
//             stats:[1,2,3,4,5,6,7],
//             kda:[1,2,3]
//         },
//         {
//             name:"1P",
//             champ:"silver",
//             stats:[7,2,53,6,1,6,1],
//             kda:[1,2,3]
//         },
//         {
//             name:"2P",
//             champ:"timo",
//             stats:[9,8,7,6,5,4,3],
//             kda:[1,2,3]
//         }
//     ]
// }

let damagetakenC_graph = []
let damagetakenO_graph = []
let damagedealt_graph = []
let heal_graph = []
let gold_graph = []
let kda_graph = []
let damageabsorbed_graph = []

let itemLists = []
let playerNameLists = []
window.onbeforeunload = function () {
  quit()
}

$(document).ready(function () {
  itemLists = $(".itemlist").toArray()
  playerNameLists = $(".playername").toArray()

  let posting = $.post(ip + "/stat", { rname: sessionStorage.roomName })

  posting.done((data) => showStat(data))

  $("#quit").click(function () {
    quit()
  })

  var holder = document.getElementById("holder")

  holder.ondragover = function () {
    this.className = "hover"
    return false
  }
  holder.ondragend = function () {
    this.className = ""
    return false
  }
  holder.ondrop = function (e) {
    this.className = ""
    e.preventDefault()

    var file = e.dataTransfer.files[0],
      reader = new FileReader()
    reader.onload = function (event) {
      console.log(event.target)
      try {
        showStat(event.target.result)
      } catch (e) {
        console.log(e)
        alert("invaild file!")
      }
    }
    console.log(file)
    reader.readAsText(file)

    return false
  }
})

function quit() {
  let quit = $.post(ip + "/reset_game", { rname: sessionStorage.roomName })
  quit.done(function () {
    window.location.href = "index.html"
  })
}

function setItem(num, list, names) {
  let str = ""
  for (let i = 0; i < list.length; ++i) {
    if (list[i] > 0) {
      str += names[i] + "x" + list[i] + "    "
    }
  }
  $(".itemlist").append(num + 1 + "P Items have: " + str + "<br>")
}

function setItemList(turn, item) {
  console.log(turn)
  let text = ""
  let totalcount = 0
  for (let i = 0; i < item.length; ++i) {
    for (let j = 0; j < item[i]; ++j) {
      text +=
        "<div class=toast_itemimg><img src='img/items.png' style='margin-left: " +
        -1 * i * 100 +
        "px'; > </div>"
      totalcount += 1
    }
  }
  for (let i = totalcount; i < 6; ++i) {
    text += "<div class=toast_itemimg><img src='img/emptyslot.png'> </div>"
  }
  $(itemLists[turn]).html(text)

  $(".toast_itemimg").css({
    margin: "-30px",
    width: "100px",
    overflow: "hidden",
    height: "100px",
    display: "inline-block",
    transform: "scale(0.4)",
  })
}

function showStat(data) {
  data = JSON.parse(data)
  if (!data.multiple) {
    damagetakenC_graph = []
    damagetakenO_graph = []
    damagedealt_graph = []
    heal_graph = []
    gold_graph = []
    kda_graph = []
    damageabsorbed_graph = []
    $(table[3]).show()
    $(table[4]).show()
    table = $(".divTableRow").toArray()

    $("p").html("Game Stats  <br>Total turn:" + data.totalturn)

    if (data.players.length < 4) {
      $(table[4]).hide()
    }
    if (data.players.length < 3) {
      $(table[3]).hide()
    }

    if (data.players[0].team !== null && data.players[0].team === 1) {
      $("#resulttext").html("Blue Team Victory!")
    } else if (data.players[0].team !== null && data.players[0].team === 0) {
      $("#resulttext").html("Red Team Victory!")
    } else {
      $("#resulttext").html("")
    }

    let dataList = $(".divTableCell").toArray()

    for (let i = 0, k = 0; i < data.players.length; ++i, k += 5) {
      let p = data.players[i]
      setItemList(i, p.items)
      if (p.team != null && p.team === 0)
        $(playerNameLists[i]).css("background", "rgba(255, 127, 127,1)")
      else if (p.team != null && p.team === 1)
        $(playerNameLists[i]).css("background", "rgba(119, 169, 249,1)")
      else {
        $(playerNameLists[i]).css("background", "none")
      }

      $(dataList[k + 1]).html(p.name)
      $(dataList[k + 2]).html(p.champ)
      $(dataList[k + 3]).html(p.kda[0] + "/" + p.kda[1] + "/" + p.kda[2])
      kda_graph.push({
        category: p.name,
        Kill: p.kda[0],
        Death: p.kda[1],
        Assist: p.kda[2],
      })
      for (let j = 0; j < p.stats.length; ++j) {
        //$(dataList[k + j + 4]).html(p.stats[j])

        let graphData = {
          category: p.name,
          "column-2": p.stats[j],
        }
        switch (j) {
          case 0:
            damagetakenC_graph.push(graphData)
            break
          case 1:
            damagetakenO_graph.push(graphData)
            break
          case 2:
            damagedealt_graph.push(graphData)
            break
          case 3:
            heal_graph.push(graphData)
            break
          case 4:
            gold_graph.push(graphData)
            break
          case 7:
            damageabsorbed_graph.push(graphData)
            break
        }
      }
    }

    $(".itemlist").css("font-size", "20px")
  } //시뮬레이션일 경우만
  else {
    let champnames = data.champnames
    let wins = [0, 0, 0, 0]
    let kdas = [
      { kill: 0, death: 0, assist: 0 },
      { kill: 0, death: 0, assist: 0 },
      { kill: 0, death: 0, assist: 0 },
      { kill: 0, death: 0, assist: 0 },
    ]
    let dealamt = [0, 0, 0, 0]
    let str = ""

    let totalturn = 0
    for (let s of data.stat) {
      totalturn += s.totalturn
      for (let i = 0; i < s.players.length; ++i) {
        if (i === 0) {
          wins[s.players[i].turn] += 1
        }
        dealamt[s.players[i].turn] += s.players[i].stats[2]
        for (let j = 0; j < 3; ++j) {
          if (j === 0) {
            kdas[s.players[i].turn].kill += s.players[i].kda[j]
          }
          if (j === 1) {
            kdas[s.players[i].turn].death += s.players[i].kda[j]
          }
          if (j === 2) {
            kdas[s.players[i].turn].assist += s.players[i].kda[j]
          }
        }
      }
    }
    kdas.map(function (k) {
      k.kill /= data.stat.length
      k.death /= data.stat.length
      k.assist /= data.stat.length
    })
    dealamt.map((d) => (d /= data.stat.length))

    for (let i = 0; i < data.stat[0].players.length; ++i) {
      str +=
        i +
        "턴 (" +
        champnames[data.champlist[i]] +
        ") 1위 횟수:" +
        wins[i] +
        "<br> 평균 kda: <br> 킬:" +
        kdas[i].kill +
        "<br>데스" +
        kdas[i].death +
        "<br>어시스트" +
        kdas[i].assist +
        "<br>" +
        "평균 딜량: " +
        dealamt[i] +
        "<br>------------------------------<br>"
    }

    totalturn /= data.stat.length

    $(".itemlist").html("평균 턴 수:" + totalturn + "<br>" + str)
    $(".itemlist").css("font-size", "50px")
  }

  AmCharts.makeChart("chartdiv", {
    type: "serial",
    categoryField: "category",
    columnWidth: 0,
    color: "white",
    maxSelectedSeries: 4,
    rotate: true,
    colors: [1],
    startDuration: 0,
    fontSize: 13,
    handDrawScatter: 0,
    theme: "default",
    categoryAxis: {
      gridPosition: "start",
      gridCount: 4,
    },
    trendLines: [],
    graphs: [
      {
        fillAlphas: 1,
        fillColors: "#E9BDFF",
        fixedColumnWidth: 10,
        id: "AmGraph-2",
        labelOffset: 7,
        labelPosition: "right",
        labelText: "[[value]]",
        showBalloon: false,
        tabIndex: 0,
        title: "",
        type: "column",
        valueField: "column-2",
      },
    ],
    guides: [],
    valueAxes: [
      {
        id: "ValueAxis-1",
        position: "right",
        stackType: "regular",
        gridColor: "#767676",
        gridCount: 4,
        gridThickness: 0,
        ignoreAxisWidth: true,
        color: "white",
        title: "",
      },
    ],
    allLabels: [],
    balloon: {},
    legend: {
      color: "white",
      enabled: true,
      useGraphSettings: true,
    },
    titles: [
      {
        id: "Title-1",
        size: 25,
        text: "Damage Dealt",
        color: "beige",
      },
    ],
    dataProvider: damagedealt_graph,
  })

  AmCharts.makeChart("chartdiv1", {
    type: "serial",
    categoryField: "category",
    columnWidth: 0,
    maxSelectedSeries: 4,
    rotate: true,
    color: "white",
    colors: [1],
    startDuration: 0,
    fontSize: 13,
    fontColor: "white",
    handDrawScatter: 0,
    theme: "default",
    categoryAxis: {
      gridPosition: "start",
      gridCount: 4,
    },
    trendLines: [],
    graphs: [
      {
        fillAlphas: 1,
        fillColors: "#ff8282",
        fixedColumnWidth: 10,
        id: "AmGraph-2",
        labelOffset: 7,
        labelPosition: "right",
        labelText: "[[value]]",
        showBalloon: false,
        tabIndex: 0,
        title: "",
        type: "column",
        valueField: "column-2",
      },
    ],
    guides: [],
    valueAxes: [
      {
        id: "ValueAxis-1",
        position: "right",
        stackType: "regular",
        gridColor: "#767676",
        gridCount: 4,
        gridThickness: 0,
        ignoreAxisWidth: true,
        color: "white",
        title: "",
      },
    ],
    allLabels: [],
    balloon: {},
    legend: {
      color: "white",
      enabled: true,
      useGraphSettings: true,
    },
    titles: [
      {
        id: "Title-1",
        size: 25,
        text: "Damage from Players",
        color: "beige",
      },
    ],
    dataProvider: damagetakenC_graph,
  })

  AmCharts.makeChart("chartdiv2", {
    type: "serial",
    categoryField: "category",
    columnWidth: 0,
    maxSelectedSeries: 4,
    rotate: true,
    color: "white",
    colors: [1],
    startDuration: 0,
    fontSize: 13,
    handDrawScatter: 0,
    theme: "default",
    categoryAxis: {
      gridPosition: "start",
      gridCount: 4,
    },
    trendLines: [],
    graphs: [
      {
        fillAlphas: 1,
        fillColors: "#ff8282",
        fixedColumnWidth: 10,
        id: "AmGraph-2",
        labelOffset: 7,
        labelPosition: "right",
        labelText: "[[value]]",
        showBalloon: false,
        tabIndex: 0,
        title: "",
        type: "column",
        valueField: "column-2",
      },
    ],
    guides: [],
    valueAxes: [
      {
        id: "ValueAxis-1",
        position: "right",
        stackType: "regular",
        gridColor: "#767676",
        gridCount: 4,
        gridThickness: 0,
        ignoreAxisWidth: true,
        color: "white",
        title: "",
      },
    ],
    allLabels: [],
    balloon: {},
    legend: {
      color: "white",
      useGraphSettings: true,
    },
    titles: [
      {
        id: "Title-1",
        size: 25,
        text: "Damage from Obstacles",
        color: "beige",
      },
    ],
    dataProvider: damagetakenO_graph,
  })
  AmCharts.makeChart("chartdiv3", {
    type: "serial",
    categoryField: "category",
    columnWidth: 0,
    maxSelectedSeries: 4,
    rotate: true,
    color: "white",
    colors: [1],
    startDuration: 0,
    fontSize: 13,
    handDrawScatter: 0,
    theme: "default",
    categoryAxis: {
      gridPosition: "start",
      gridCount: 4,
    },
    trendLines: [],
    graphs: [
      {
        fillAlphas: 1,
        fillColors: "#9effa5",
        fixedColumnWidth: 10,
        id: "AmGraph-2",
        labelOffset: 7,
        labelPosition: "right",
        labelText: "[[value]]",
        showBalloon: false,
        tabIndex: 0,
        title: "",
        type: "column",
        valueField: "column-2",
      },
    ],
    guides: [],
    valueAxes: [
      {
        id: "ValueAxis-1",
        position: "right",
        stackType: "regular",
        gridColor: "#767676",
        gridCount: 4,
        gridThickness: 0,
        ignoreAxisWidth: true,
        color: "white",
        title: "",
      },
    ],
    allLabels: [],
    balloon: {},
    legend: {
      color: "white",
      enabled: true,
      useGraphSettings: true,
    },
    titles: [
      {
        id: "Title-1",
        size: 25,
        text: "Heal Amount",
        color: "beige",
      },
    ],
    dataProvider: heal_graph,
  })
  AmCharts.makeChart("chartdiv4", {
    type: "serial",
    categoryField: "category",
    columnWidth: 0,
    maxSelectedSeries: 4,
    rotate: true,
    color: "white",
    colors: [1],
    startDuration: 0,
    fontSize: 13,
    handDrawScatter: 0,
    theme: "default",
    categoryAxis: {
      gridPosition: "start",
      gridCount: 4,
    },
    trendLines: [],
    graphs: [
      {
        fillAlphas: 1,
        fillColors: "#ffd754",
        fixedColumnWidth: 10,
        id: "AmGraph-2",
        labelOffset: 7,
        labelPosition: "right",
        labelText: "[[value]]",
        showBalloon: false,
        tabIndex: 0,
        title: "",
        type: "column",
        valueField: "column-2",
      },
    ],
    guides: [],
    valueAxes: [
      {
        id: "ValueAxis-1",
        position: "right",
        stackType: "regular",
        gridColor: "#767676",
        gridCount: 4,
        gridThickness: 0,
        ignoreAxisWidth: true,
        color: "white",
        title: "",
      },
    ],
    allLabels: [],
    balloon: {},
    legend: {
      color: "white",
      enabled: true,
      useGraphSettings: true,
    },
    titles: [
      {
        id: "Title-1",
        size: 25,
        text: "Money Obtained",
        color: "beige",
      },
    ],
    dataProvider: gold_graph,
  })

  AmCharts.makeChart("kda_chart", {
    type: "serial",
    categoryField: "category",
    color: "white",
    startDuration: 0,
    categoryAxis: {
      gridPosition: "start",
    },
    trendLines: [],
    graphs: [
      {
        balloonText: "[[title]] of [[category]]:[[value]]",
        bulletAlpha: 0,
        columnWidth: 0.84,
        fillAlphas: 1,
        fillColors: "#FFD800",
        id: "AmGraph-1",
        labelAnchor: "middle",
        labelPosition: "inside",
        labelText: "[[value]]",
        lineAlpha: 0,
        lineThickness: 0,
        showAllValueLabels: true,
        showBalloon: false,
        title: "Kill",
        color: "beige",
        type: "column",
        valueField: "Kill",
      },
      {
        balloonText: "[[title]] of [[category]]:[[value]]",
        fillAlphas: 1,
        fillColors: "#FF6D6D",
        id: "AmGraph-2",
        labelPosition: "inside",
        labelText: "[[value]]",
        showAllValueLabels: true,
        showBalloon: false,
        title: "Death",
        type: "column",
        valueField: "Death",
        color: "beige",
      },
      {
        columnWidth: 0.84,
        fillAlphas: 1,
        gapPeriod: 2,
        id: "AmGraph-3",
        labelPosition: "inside",
        labelText: "[[value]]",
        maxBulletSize: 48,
        showAllValueLabels: true,
        showBalloon: false,
        tabIndex: 0,
        title: "Assist",
        type: "column",
        valueField: "Assist",
        color: "beige",
      },
    ],
    guides: [],
    valueAxes: [
      {
        id: "ValueAxis-1",
        gridThickness: 0,
        title: "",
        color: "white",
      },
    ],
    allLabels: [],
    balloon: {},
    legend: {
      color: "white",
      enabled: true,
      useGraphSettings: true,
    },
    titles: [
      {
        id: "Title-1",
        size: 15,
        text: "Kill/Death/Assist",
        color: "beige",
      },
    ],
    dataProvider: kda_graph,
  })
  AmCharts.makeChart("chartdiv5", {
    type: "serial",
    categoryField: "category",
    columnWidth: 0,
    maxSelectedSeries: 4,
    rotate: true,
    color: "white",
    colors: [1],
    startDuration: 0,
    fontSize: 13,
    handDrawScatter: 0,
    theme: "default",
    categoryAxis: {
      gridPosition: "start",
      gridCount: 4,
    },
    trendLines: [],
    graphs: [
      {
        fillAlphas: 1,
        fillColors: "#696969",
        fixedColumnWidth: 10,
        id: "AmGraph-2",
        labelOffset: 7,
        labelPosition: "right",
        labelText: "[[value]]",
        showBalloon: false,
        tabIndex: 0,
        title: "",
        type: "column",
        valueField: "column-2",
      },
    ],
    guides: [],
    valueAxes: [
      {
        id: "ValueAxis-1",
        position: "right",
        stackType: "regular",
        gridColor: "#767676",
        gridCount: 4,
        gridThickness: 0,
        ignoreAxisWidth: true,
        color: "white",
        title: "",
      },
    ],
    allLabels: [],
    balloon: {},
    legend: {
      color: "white",
      enabled: true,
      useGraphSettings: true,
    },
    titles: [
      {
        id: "Title-1",
        size: 25,
        text: "Damage Absorbed",
        color: "beige",
      },
    ],
    dataProvider: damageabsorbed_graph,
  })
}

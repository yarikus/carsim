"use strict"

var music = document.getElementById("music")
var canvas = document.getElementById("tela")
canvas.addEventListener("click", onClick)
var ctx = canvas.getContext("2d")

const WORLD_SCALE = 2.4
const TRACK_PADDING = 24
const START_SEGMENT_INDEX = 0

const car = {
    width: 58,
    height: 30,
    xPosition: 0,
    yPosition: 0,
    velocity: 0,
    displayVelocity: 0,
    forceFoward: 0,
    forceBackward: 0,
    facingAngle: 0,
    isOnRoad: true
}

const baseForce = 0.06
const baseTurningSpeed = 3.4
const baseRoadAttrition = 0.99
const baseDirtAttrition = 0.94

const maxSpeedFront = 7.5
const maxSpeedBack = -3

const debugMode = false
var musicOn = true

var keyArray = []
var roadArray = []
var turnArray = []

const baseRoadSegments = [
    {x: 240, y: 85, w: 560, h: 60},
    {x: 800, y: 145, w: 60, h: 150},
    {x: 860, y: 295, w: 150, h: 60},
    {x: 1010, y: 355, w: 60, h: 200},
    {x: 400, y: 555, w: 610, h: 60},
    {x: 340, y: 455, w: 60, h: 100},
    {x: 240, y: 395, w: 100, h: 60},
    {x: 180, y: 145, w: 60, h: 250}
]

resizeCanvas()
initializeTrack()

window.addEventListener("resize", resizeCanvas)
requestAnimationFrame(draw)

function draw() {
    musicControl()
    processKeys()
    checkCollision()
    moveCar()

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawEnvironment()

    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(car.facingAngle * Math.PI / 180)
    drawCar()
    ctx.restore()

    drawHud()
    requestAnimationFrame(draw)
}

function initializeTrack() {
    roadArray = baseRoadSegments.map(function(segment) {
        return {
            x: segment.x * WORLD_SCALE,
            y: segment.y * WORLD_SCALE,
            w: segment.w * WORLD_SCALE,
            h: segment.h * WORLD_SCALE
        }
    })

    turnArray = [
        {x: roadArray[1].x, y: roadArray[0].y},
        {x: roadArray[1].x, y: roadArray[2].y},
        {x: roadArray[3].x, y: roadArray[2].y},
        {x: roadArray[3].x, y: roadArray[4].y},
        {x: roadArray[5].x, y: roadArray[4].y},
        {x: roadArray[5].x, y: roadArray[6].y},
        {x: roadArray[7].x, y: roadArray[6].y},
        {x: roadArray[7].x, y: roadArray[0].y}
    ].map(function(turn) {
        return {
            x: turn.x,
            y: turn.y,
            size: 60 * WORLD_SCALE
        }
    })

    car.xPosition = roadArray[START_SEGMENT_INDEX].x + roadArray[START_SEGMENT_INDEX].w * 0.45
    car.yPosition = roadArray[START_SEGMENT_INDEX].y + roadArray[START_SEGMENT_INDEX].h / 2 - car.height / 2
}

function checkCollision() {
    var i

    for (i = 0; i < turnArray.length; i++) {
        if (RectsColliding(turnArray[i].x, turnArray[i].y, turnArray[i].size, turnArray[i].size)) {
            car.isOnRoad = true
            return
        }
    }

    for (i = 0; i < roadArray.length; i++) {
        if (RectsColliding(
            roadArray[i].x - TRACK_PADDING,
            roadArray[i].y - TRACK_PADDING,
            roadArray[i].w + TRACK_PADDING * 2,
            roadArray[i].h + TRACK_PADDING * 2
        )) {
            car.isOnRoad = true
            return
        }
    }

    car.isOnRoad = false
}

function RectsColliding(x, y, w, h) {
    return !(car.xPosition > x + w || car.xPosition + car.width + 8 < x || car.yPosition > y + h || car.yPosition + car.height + 12 < y)
}

function drawEnvironment() {
    var cameraX = car.xPosition + car.width / 2
    var cameraY = car.yPosition + car.height / 2

    ctx.save()
    ctx.translate(canvas.width / 2 - cameraX, canvas.height / 2 - cameraY)
    drawGrass(cameraX, cameraY)
    drawRoads()
    ctx.restore()
}

function drawGrass(cameraX, cameraY) {
    var tileSize = 160
    var startX = Math.floor((cameraX - canvas.width) / tileSize) * tileSize
    var endX = Math.ceil((cameraX + canvas.width) / tileSize) * tileSize
    var startY = Math.floor((cameraY - canvas.height) / tileSize) * tileSize
    var endY = Math.ceil((cameraY + canvas.height) / tileSize) * tileSize
    var x
    var y

    for (x = startX; x <= endX; x += tileSize) {
        for (y = startY; y <= endY; y += tileSize) {
            ctx.fillStyle = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0
                ? "rgb(75, 122, 56)"
                : "rgb(68, 114, 50)"
            ctx.fillRect(x, y, tileSize, tileSize)
        }
    }
}

function drawRoads() {
    var i

    for (i = 0; i < roadArray.length; i++) {
        ctx.fillStyle = "rgb(88, 82, 70)"
        ctx.fillRect(
            roadArray[i].x - TRACK_PADDING,
            roadArray[i].y - TRACK_PADDING,
            roadArray[i].w + TRACK_PADDING * 2,
            roadArray[i].h + TRACK_PADDING * 2
        )

        ctx.fillStyle = "rgb(43, 43, 43)"
        ctx.fillRect(roadArray[i].x, roadArray[i].y, roadArray[i].w, roadArray[i].h)
    }

    drawTurn(turnArray[0].x, turnArray[0].y, roadArray[2].x, roadArray[1].y, roadArray[1].x, roadArray[1].y)
    drawTurn(turnArray[1].x, turnArray[1].y, roadArray[2].x, roadArray[2].y, roadArray[2].x, roadArray[3].y)
    drawTurn(turnArray[2].x, turnArray[2].y, roadArray[3].x, roadArray[3].y, roadArray[3].x + roadArray[3].w, roadArray[3].y)
    drawTurn(roadArray[3].x + roadArray[3].w, roadArray[4].y, turnArray[3].x, turnArray[3].y, roadArray[3].x, roadArray[4].y + roadArray[4].h)
    drawTurn(roadArray[4].x, roadArray[4].y + roadArray[4].h, roadArray[4].x, roadArray[4].y, turnArray[4].x, turnArray[4].y)
    drawTurn(roadArray[4].x, roadArray[5].y, roadArray[5].x, roadArray[5].y, turnArray[5].x, roadArray[6].y)
    drawTurn(roadArray[6].x, roadArray[5].y, roadArray[6].x, roadArray[6].y, roadArray[7].x, roadArray[6].y)
    drawTurn(roadArray[7].x, roadArray[7].y, roadArray[0].x, roadArray[7].y, roadArray[0].x, roadArray[0].y)

    drawLaneMarkings()
    drawStartLine()
}

function drawTurn(x1, y1, x2, y2, x3, y3) {
    ctx.fillStyle = "rgb(43, 43, 43)"
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x3, y3)
    ctx.fill()
}

function drawLaneMarkings() {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"
    ctx.lineWidth = 8
    ctx.setLineDash([36, 28])

    ctx.beginPath()
    ctx.moveTo(roadArray[0].x + 80, roadArray[0].y + roadArray[0].h / 2)
    ctx.lineTo(roadArray[0].x + roadArray[0].w - 70, roadArray[0].y + roadArray[0].h / 2)
    ctx.lineTo(roadArray[1].x + roadArray[1].w / 2, roadArray[1].y + 60)
    ctx.lineTo(roadArray[2].x + 60, roadArray[2].y + roadArray[2].h / 2)
    ctx.lineTo(roadArray[3].x + roadArray[3].w / 2, roadArray[3].y + 60)
    ctx.lineTo(roadArray[4].x + roadArray[4].w - 70, roadArray[4].y + roadArray[4].h / 2)
    ctx.lineTo(roadArray[5].x + roadArray[5].w / 2, roadArray[5].y + 20)
    ctx.lineTo(roadArray[6].x + 36, roadArray[6].y + roadArray[6].h / 2)
    ctx.lineTo(roadArray[7].x + roadArray[7].w / 2, roadArray[7].y + 60)
    ctx.lineTo(roadArray[0].x + 70, roadArray[0].y + roadArray[0].h / 2)
    ctx.stroke()

    ctx.setLineDash([])
}

function drawStartLine() {
    var lineX = roadArray[0].x + roadArray[0].w * 0.55

    ctx.fillStyle = "rgb(240, 240, 240)"
    ctx.fillRect(lineX, roadArray[0].y - 28, 18, roadArray[0].h + 56)
    ctx.fillRect(lineX + 34, roadArray[0].y - 28, 18, roadArray[0].h + 56)
}

function drawCar() {
    if (debugMode) {
        ctx.strokeStyle = "rgb(255, 0, 0)"
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(60, 0)
        ctx.stroke()
    }

    ctx.fillStyle = "rgb(204, 204, 204)"
    ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height)

    ctx.fillStyle = "rgb(140, 140, 140)"
    ctx.fillRect(car.width / 4.5, -car.height / 2.6, car.height / 1.8, car.height / 1.3)
    ctx.fillRect(car.width / 8, -car.height / 1.5, car.width / 20, car.width / 10)
    ctx.fillRect(car.width / 8, car.height / 2.1, car.width / 20, car.width / 10)

    ctx.fillStyle = "rgb(0, 0, 0)"
    ctx.fillRect(-car.width / 18, -car.height / 3.5, car.height / 1.8, car.height / 1.7)
    ctx.fillRect(-car.width / 2.5, -car.height / 3.6, car.height / 5, car.height / 1.7)
    ctx.fillRect(-car.width / 6, -car.height / 2.2, car.width / 4, car.height / 10)
    ctx.fillRect(-car.width / 6, car.height / 2.8, car.width / 4, car.height / 10)
    ctx.fillRect(-car.width / 3, -car.height / 2.2, car.width / 8, car.height / 10)
    ctx.fillRect(-car.width / 3, car.height / 2.8, car.width / 8, car.height / 10)

    ctx.fillStyle = "rgb(255, 204, 0)"
    ctx.fillRect(car.width / 2.15, -car.height / 2, car.width / 30, car.width / 20)
    ctx.fillRect(car.width / 2.15, car.height / 2.5, car.width / 30, car.width / 20)
    ctx.fillRect(-car.width / 2, -car.height / 2, car.width / 30, car.width / 20)
    ctx.fillRect(-car.width / 2, car.height / 2.5, car.width / 30, car.width / 20)

    ctx.fillStyle = "rgb(255, 255, 255)"
    ctx.fillRect(car.width / 2.3, -car.height / 2.6, car.width / 15, car.width / 10)
    ctx.fillRect(car.width / 2.3, car.height / 5.5, car.width / 15, car.width / 10)

    ctx.fillStyle = "rgb(255, 0, 0)"
    ctx.fillRect(-car.width / 2, -car.height / 2.6, car.width / 30, car.width / 10)
    ctx.fillRect(-car.width / 2, car.height / 5.6, car.width / 30, car.width / 10)
}

function moveCar() {
    if (car.velocity !== 0) {
        if (car.isOnRoad) {
            car.forceFoward *= baseRoadAttrition
            car.forceBackward *= baseRoadAttrition
        } else {
            car.forceFoward *= baseDirtAttrition
            car.forceBackward *= baseDirtAttrition
        }
    }

    car.velocity = Number((car.forceFoward - car.forceBackward).toFixed(3))
    car.xPosition += car.velocity * Math.cos(car.facingAngle * Math.PI / 180)
    car.yPosition += car.velocity * Math.sin(car.facingAngle * Math.PI / 180)
    car.displayVelocity = Math.abs(Math.round(car.velocity * 15))
}

function processKeys() {
    if (keyArray["ArrowRight"] && car.velocity !== 0) {
        car.facingAngle += baseTurningSpeed
    }

    if (keyArray["ArrowLeft"] && car.velocity !== 0) {
        car.facingAngle -= baseTurningSpeed
        music.muted = false
    }

    if (keyArray["ArrowUp"] && car.velocity < maxSpeedFront) {
        car.forceFoward += baseForce
        music.muted = false
    }

    if (keyArray["ArrowDown"] && car.velocity > maxSpeedBack) {
        car.forceBackward += baseForce
        music.muted = false
    }
}

function musicControl() {
    if (!music.muted) {
        if (musicOn) {
            music.play()
        } else {
            music.pause()
        }
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
}

function drawHud() {
    ctx.save()
    ctx.fillStyle = "rgba(10, 10, 10, 0.55)"
    ctx.fillRect(24, canvas.height - 116, 230, 82)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)"
    ctx.strokeRect(24, canvas.height - 116, 230, 82)

    ctx.fillStyle = "rgba(255, 255, 255, 0.75)"
    ctx.font = "18px Arial"
    ctx.fillText("SPEED", 46, canvas.height - 84)

    ctx.fillStyle = car.isOnRoad ? "rgb(255, 255, 255)" : "rgb(255, 197, 96)"
    ctx.font = "bold 36px Arial"
    ctx.fillText(car.displayVelocity + " km/h", 44, canvas.height - 46)

    if (!car.isOnRoad) {
        ctx.font = "16px Arial"
        ctx.fillText("OFF ROAD", 140, canvas.height - 84)
    }
    ctx.restore()
}

function onClick() {
    music.muted = false
}

document.onclick = function() {
    music.muted = false
}

document.onkeydown = function(evt) {
    keyArray[evt.key] = true
    music.muted = false
}

document.onkeyup = function(evt) {
    keyArray[evt.key] = false
}

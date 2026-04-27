"use strict"

var music = document.getElementById("music")
var canvas = document.getElementById("tela")
canvas.addEventListener("click", onClick)
var ctx = canvas.getContext("2d")

const SURFACE_FRICTION = 0.99

const car = {
    width: 58,
    height: 30,
    xPosition: 0,
    yPosition: 0,
    velocity: 0,
    displayVelocity: 0,
    forceFoward: 0,
    forceBackward: 0,
    facingAngle: 0
}

const baseForce = 0.06
const baseTurningSpeed = 3.4
const maxSpeedFront = 7.5
const maxSpeedBack = -3

const debugMode = false
var musicOn = true

var keyArray = []

resizeCanvas()
initializeWorld()

window.addEventListener("resize", resizeCanvas)
requestAnimationFrame(draw)

function draw() {
    musicControl()
    processKeys()
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

function initializeWorld() {
    car.xPosition = -car.width / 2
    car.yPosition = -car.height / 2
}

function drawEnvironment() {
    var cameraX = car.xPosition + car.width / 2
    var cameraY = car.yPosition + car.height / 2

    ctx.save()
    ctx.translate(canvas.width / 2 - cameraX, canvas.height / 2 - cameraY)
    drawSurface(cameraX, cameraY)
    ctx.restore()
}

function drawSurface(cameraX, cameraY) {
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
                ? "rgb(78, 120, 62)"
                : "rgb(71, 111, 56)"
            ctx.fillRect(x, y, tileSize, tileSize)
        }
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"
    ctx.lineWidth = 2

    for (x = startX; x <= endX; x += tileSize) {
        ctx.beginPath()
        ctx.moveTo(x, startY)
        ctx.lineTo(x, endY)
        ctx.stroke()
    }

    for (y = startY; y <= endY; y += tileSize) {
        ctx.beginPath()
        ctx.moveTo(startX, y)
        ctx.lineTo(endX, y)
        ctx.stroke()
    }
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
        car.forceFoward *= SURFACE_FRICTION
        car.forceBackward *= SURFACE_FRICTION
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

    ctx.fillStyle = "rgb(255, 255, 255)"
    ctx.font = "bold 36px Arial"
    ctx.fillText(car.displayVelocity + " km/h", 44, canvas.height - 46)
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

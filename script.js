"use strict"

var music = document.getElementById("music")
var canvas = document.getElementById("tela")
var musicToggle = document.getElementById("musicToggle")
canvas.addEventListener("click", onClick)
musicToggle.addEventListener("click", toggleMusic)
var ctx = canvas.getContext("2d")

const SURFACE_FRICTION = 0.99

const car = {
    width: 84,
    height: 44,
    xPosition: 0,
    yPosition: 0,
    velocity: 0,
    displayVelocity: 0,
    forceFoward: 0,
    forceBackward: 0,
    facingAngle: 0,
    steeringAngle: 0
}

const baseForce = 0.06
const baseTurningSpeed = 3.4
const maxSpeedFront = 7.5
const maxSpeedBack = -3
const maxSteeringAngle = 28
const steeringReturnSpeed = 2.2

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

    var bodyWidth = car.width * 0.72
    var bodyHeight = car.height * 0.72
    var cabinWidth = car.width * 0.34
    var cabinHeight = car.height * 0.48
    var wheelWidth = car.width * 0.14
    var wheelHeight = car.height * 0.26
    var wheelOffsetX = car.width * 0.23
    var wheelOffsetY = car.height * 0.41
    var frontWheelAngle = car.steeringAngle * Math.PI / 180

    drawShadow(bodyWidth, bodyHeight)
    drawWheel(-wheelOffsetX, -wheelOffsetY, wheelWidth, wheelHeight, 0)
    drawWheel(wheelOffsetX, -wheelOffsetY, wheelWidth, wheelHeight, frontWheelAngle)
    drawWheel(-wheelOffsetX, wheelOffsetY, wheelWidth, wheelHeight, 0)
    drawWheel(wheelOffsetX, wheelOffsetY, wheelWidth, wheelHeight, frontWheelAngle)

    ctx.fillStyle = "rgb(150, 155, 160)"
    roundRect(-bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight, 12)
    ctx.fill()

    ctx.fillStyle = "rgb(92, 99, 106)"
    roundRect(-car.width * 0.08, -bodyHeight / 2, car.width * 0.44, bodyHeight, 12)
    ctx.fill()

    ctx.fillStyle = "rgb(68, 74, 80)"
    roundRect(car.width * 0.12, -bodyHeight * 0.4, car.width * 0.15, bodyHeight * 0.8, 10)
    ctx.fill()

    ctx.fillStyle = "rgb(42, 47, 53)"
    roundRect(-cabinWidth / 2, -cabinHeight / 2, cabinWidth, cabinHeight, 10)
    ctx.fill()

    ctx.fillStyle = "rgba(170, 192, 210, 0.72)"
    roundRect(-cabinWidth * 0.08, -cabinHeight * 0.34, cabinWidth * 0.42, cabinHeight * 0.68, 6)
    ctx.fill()
    roundRect(-cabinWidth * 0.48, -cabinHeight * 0.34, cabinWidth * 0.22, cabinHeight * 0.68, 5)
    ctx.fill()

    ctx.fillStyle = "rgb(36, 39, 42)"
    roundRect(-car.width * 0.04, -bodyHeight * 0.52, car.width * 0.045, bodyHeight * 1.04, 4)
    ctx.fill()

    ctx.fillStyle = "rgb(236, 238, 214)"
    roundRect(car.width * 0.34, -bodyHeight * 0.34, car.width * 0.06, car.height * 0.12, 4)
    ctx.fill()
    roundRect(car.width * 0.34, bodyHeight * 0.22, car.width * 0.06, car.height * 0.12, 4)
    ctx.fill()

    ctx.fillStyle = "rgb(184, 42, 42)"
    roundRect(-car.width * 0.4, -bodyHeight * 0.34, car.width * 0.05, car.height * 0.12, 4)
    ctx.fill()
    roundRect(-car.width * 0.4, bodyHeight * 0.22, car.width * 0.05, car.height * 0.12, 4)
    ctx.fill()
}

function drawShadow(bodyWidth, bodyHeight) {
    ctx.save()
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
    roundRect(-bodyWidth * 0.52, -bodyHeight * 0.62, bodyWidth * 1.04, bodyHeight * 1.24, 14)
    ctx.fill()
    ctx.restore()
}

function drawWheel(centerX, centerY, width, height, angle) {
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(angle)
    ctx.fillStyle = "rgb(18, 18, 18)"
    roundRect(-width / 2, -height / 2, width, height, 4)
    ctx.fill()

    ctx.fillStyle = "rgb(116, 118, 120)"
    roundRect(-width * 0.2, -height * 0.34, width * 0.4, height * 0.68, 3)
    ctx.fill()
    ctx.restore()
}

function roundRect(x, y, width, height, radius) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
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
    var steeringInput = 0

    if (keyArray["ArrowRight"] && car.velocity !== 0) {
        car.facingAngle += baseTurningSpeed
        steeringInput = 1
    }

    if (keyArray["ArrowLeft"] && car.velocity !== 0) {
        car.facingAngle -= baseTurningSpeed
        steeringInput = -1
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

    updateSteeringAngle(steeringInput)
}

function updateSteeringAngle(steeringInput) {
    if (steeringInput !== 0) {
        car.steeringAngle += steeringInput * steeringReturnSpeed * 2.3
        car.steeringAngle = Math.max(-maxSteeringAngle, Math.min(maxSteeringAngle, car.steeringAngle))
        return
    }

    if (car.steeringAngle > 0) {
        car.steeringAngle = Math.max(0, car.steeringAngle - steeringReturnSpeed)
    } else if (car.steeringAngle < 0) {
        car.steeringAngle = Math.min(0, car.steeringAngle + steeringReturnSpeed)
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

function toggleMusic(evt) {
    evt.stopPropagation()
    musicOn = !musicOn
    updateMusicButton()

    if (musicOn) {
        music.muted = false
        music.play()
    } else {
        music.pause()
    }
}

function updateMusicButton() {
    musicToggle.classList.toggle("is-paused", !musicOn)
    musicToggle.setAttribute("aria-label", musicOn ? "Pause music" : "Play music")
    musicToggle.setAttribute("title", musicOn ? "Pause music" : "Play music")
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

updateMusicButton()

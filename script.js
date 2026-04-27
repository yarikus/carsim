"use strict"

var music = document.getElementById("music")
var canvas = document.getElementById("tela")
var musicToggle = document.getElementById("musicToggle")
var ctx = canvas.getContext("2d")

var state = window.CarSimPhysics.createState()

canvas.addEventListener("click", onCanvasClick)
window.addEventListener("resize", onResize)
document.onkeydown = onKeyDown
document.onkeyup = onKeyUp
document.onclick = onDocumentClick

window.CarSimPhysics.initializeWorld(state)
window.CarSimEnvironment.resizeCanvas(canvas)
window.CarSimUI.initializeControls(state)
window.CarSimUI.initializeMusicButton(state, music, musicToggle)

requestAnimationFrame(draw)

function draw() {
    window.CarSimUI.musicControl(state, music)
    window.CarSimPhysics.processKeys(state, music)
    window.CarSimPhysics.moveCar(state)

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    window.CarSimEnvironment.drawEnvironment(ctx, canvas, state)

    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(state.car.facingAngle * Math.PI / 180)
    window.CarSimUI.drawCar(ctx, state)
    ctx.restore()

    window.CarSimUI.drawHud(ctx, canvas, state.car)
    requestAnimationFrame(draw)
}

function onResize() {
    window.CarSimEnvironment.resizeCanvas(canvas)
}

function onCanvasClick() {
    music.muted = false
}

function onDocumentClick() {
    music.muted = false
}

function onKeyDown(evt) {
    state.keyArray[evt.key] = true
    music.muted = false
}

function onKeyUp(evt) {
    state.keyArray[evt.key] = false
}

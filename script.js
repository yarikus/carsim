"use strict"

var music = document.getElementById("music")
var canvas = document.getElementById("tela")
var ctx = canvas.getContext("2d")
var lastFrameTime = null

var state = window.CarSimPhysics.createState()

canvas.addEventListener("click", onCanvasClick)
window.addEventListener("resize", onResize)
document.onkeydown = onKeyDown
document.onkeyup = onKeyUp
document.onclick = onDocumentClick

window.CarSimPhysics.initializeWorld(state)
window.CarSimEnvironment.resizeCanvas(canvas)
window.CarSimUI.initializeControls(state)
window.CarSimUI.initializeClockPanel()
window.CarSimUI.initializeTelemetryPanel()
window.CarSimMusicPlayer.initialize(state, music)

requestAnimationFrame(draw)

function draw(timestamp) {
    var carCenter
    var trailerOffsetX
    var trailerOffsetY
    var spawnedVehicleOffsetX
    var spawnedVehicleOffsetY
    var deltaSeconds = 0
    var i

    if (lastFrameTime !== null) {
        deltaSeconds = (timestamp - lastFrameTime) / 1000
    }

    lastFrameTime = timestamp

    window.CarSimMusicPlayer.musicControl(state, music)
    window.CarSimPhysics.processKeys(state, music)
    window.CarSimPhysics.moveCar(state)
    window.CarSimPhysics.updateGameTime(state, deltaSeconds)

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    window.CarSimEnvironment.drawEnvironment(ctx, canvas, state)

    carCenter = window.CarSimPhysics.getCarCenter(state.car)

    for (i = 0; i < state.spawnedVehicles.length; i++) {
        spawnedVehicleOffsetX = state.spawnedVehicles[i].xPosition + state.spawnedVehicles[i].width / 2 - carCenter.x
        spawnedVehicleOffsetY = state.spawnedVehicles[i].yPosition + state.spawnedVehicles[i].height / 2 - carCenter.y

        ctx.save()
        ctx.translate(canvas.width / 2 + spawnedVehicleOffsetX, canvas.height / 2 + spawnedVehicleOffsetY)
        ctx.rotate(state.spawnedVehicles[i].facingAngle * Math.PI / 180)
        window.CarSimUI.drawSpawnedVehicle(ctx, state.spawnedVehicles[i], state)
        ctx.restore()
    }

    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(state.car.facingAngle * Math.PI / 180)
    window.CarSimUI.drawCar(ctx, state)
    ctx.restore()

    trailerOffsetX = state.trailer.xPosition - carCenter.x
    trailerOffsetY = state.trailer.yPosition - carCenter.y

    ctx.save()
    ctx.translate(canvas.width / 2 + trailerOffsetX, canvas.height / 2 + trailerOffsetY)
    ctx.rotate(state.trailer.facingAngle * Math.PI / 180)
    window.CarSimUI.drawTrailer(ctx, state)
    ctx.restore()

    window.CarSimUI.drawHud(ctx, canvas, state.car)
    window.CarSimUI.updateClockPanel(state)
    window.CarSimUI.updateTelemetryPanel(state)
    window.CarSimUI.updateTrailerAttachButton(state)
    requestAnimationFrame(draw)
}

function onResize() {
    window.CarSimEnvironment.resizeCanvas(canvas)
}

function onCanvasClick() {
    window.CarSimMusicPlayer.activateFromInteraction(state, music)
}

function onDocumentClick() {
    window.CarSimMusicPlayer.activateFromInteraction(state, music)
}

function onKeyDown(evt) {
    state.keyArray[evt.key] = true
    state.keyArray[evt.code] = true
    window.CarSimMusicPlayer.activateFromInteraction(state, music)
}

function onKeyUp(evt) {
    state.keyArray[evt.key] = false
    state.keyArray[evt.code] = false
}

"use strict"

window.CarSimUI = (function() {
    var debugMode = false

    function initializeControls(state) {
        var configControls = document.querySelectorAll("[data-config]")
        var i

        for (i = 0; i < configControls.length; i++) {
            configControls[i].addEventListener("input", function(evt) {
                var control = evt.target
                var configKey = control.dataset.config
                state.physicsConfig[configKey] = Number(control.value)
                syncControlValue(control)
            })
            syncControlValue(configControls[i])
        }
    }

    function initializeMusicButton(state, music, musicToggle) {
        musicToggle.addEventListener("click", function(evt) {
            evt.stopPropagation()
            state.musicOn = !state.musicOn
            updateMusicButton(state, musicToggle)

            if (state.musicOn) {
                music.muted = false
                music.play()
            } else {
                music.pause()
            }
        })

        updateMusicButton(state, musicToggle)
    }

    function updateMusicButton(state, musicToggle) {
        musicToggle.classList.toggle("is-paused", !state.musicOn)
        musicToggle.setAttribute("aria-label", state.musicOn ? "Pause music" : "Play music")
        musicToggle.setAttribute("title", state.musicOn ? "Pause music" : "Play music")
    }

    function musicControl(state, music) {
        if (!music.muted) {
            if (state.musicOn) {
                music.play()
            } else {
                music.pause()
            }
        }
    }

    function drawHud(ctx, canvas, car) {
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

    function drawCar(ctx, car) {
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

        drawShadow(ctx, bodyWidth, bodyHeight)
        drawWheel(ctx, -wheelOffsetX, -wheelOffsetY, wheelWidth, wheelHeight, 0)
        drawWheel(ctx, wheelOffsetX, -wheelOffsetY, wheelWidth, wheelHeight, frontWheelAngle)
        drawWheel(ctx, -wheelOffsetX, wheelOffsetY, wheelWidth, wheelHeight, 0)
        drawWheel(ctx, wheelOffsetX, wheelOffsetY, wheelWidth, wheelHeight, frontWheelAngle)

        ctx.fillStyle = "rgb(150, 155, 160)"
        roundRect(ctx, -bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight, 12)
        ctx.fill()

        ctx.fillStyle = "rgb(92, 99, 106)"
        roundRect(ctx, -car.width * 0.08, -bodyHeight / 2, car.width * 0.44, bodyHeight, 12)
        ctx.fill()

        ctx.fillStyle = "rgb(68, 74, 80)"
        roundRect(ctx, car.width * 0.12, -bodyHeight * 0.4, car.width * 0.15, bodyHeight * 0.8, 10)
        ctx.fill()

        ctx.fillStyle = "rgb(42, 47, 53)"
        roundRect(ctx, -cabinWidth / 2, -cabinHeight / 2, cabinWidth, cabinHeight, 10)
        ctx.fill()

        ctx.fillStyle = "rgba(170, 192, 210, 0.72)"
        roundRect(ctx, -cabinWidth * 0.08, -cabinHeight * 0.34, cabinWidth * 0.42, cabinHeight * 0.68, 6)
        ctx.fill()
        roundRect(ctx, -cabinWidth * 0.48, -cabinHeight * 0.34, cabinWidth * 0.22, cabinHeight * 0.68, 5)
        ctx.fill()

        ctx.fillStyle = "rgb(36, 39, 42)"
        roundRect(ctx, -car.width * 0.04, -bodyHeight * 0.52, car.width * 0.045, bodyHeight * 1.04, 4)
        ctx.fill()

        ctx.fillStyle = "rgb(236, 238, 214)"
        roundRect(ctx, car.width * 0.34, -bodyHeight * 0.34, car.width * 0.06, car.height * 0.12, 4)
        ctx.fill()
        roundRect(ctx, car.width * 0.34, bodyHeight * 0.22, car.width * 0.06, car.height * 0.12, 4)
        ctx.fill()

        ctx.fillStyle = "rgb(184, 42, 42)"
        roundRect(ctx, -car.width * 0.4, -bodyHeight * 0.34, car.width * 0.05, car.height * 0.12, 4)
        ctx.fill()
        roundRect(ctx, -car.width * 0.4, bodyHeight * 0.22, car.width * 0.05, car.height * 0.12, 4)
        ctx.fill()
    }

    function drawShadow(ctx, bodyWidth, bodyHeight) {
        ctx.save()
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
        roundRect(ctx, -bodyWidth * 0.52, -bodyHeight * 0.62, bodyWidth * 1.04, bodyHeight * 1.24, 14)
        ctx.fill()
        ctx.restore()
    }

    function drawWheel(ctx, centerX, centerY, width, height, angle) {
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(angle)
        ctx.fillStyle = "rgb(18, 18, 18)"
        roundRect(ctx, -width / 2, -height / 2, width, height, 4)
        ctx.fill()

        ctx.fillStyle = "rgb(116, 118, 120)"
        roundRect(ctx, -width * 0.2, -height * 0.34, width * 0.4, height * 0.68, 3)
        ctx.fill()
        ctx.restore()
    }

    function roundRect(ctx, x, y, width, height, radius) {
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

    function syncControlValue(control) {
        var valueLabel = document.querySelector('[data-value-for="' + control.id + '"]')

        if (!valueLabel) {
            return
        }

        valueLabel.textContent = formatControlValue(control.value)
    }

    function formatControlValue(value) {
        var numericValue = Number(value)

        if (Math.abs(numericValue) >= 10 || Number.isInteger(numericValue)) {
            return String(numericValue)
        }

        if (Math.abs(numericValue) >= 1) {
            return numericValue.toFixed(1)
        }

        return numericValue.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")
    }

    return {
        initializeControls: initializeControls,
        initializeMusicButton: initializeMusicButton,
        musicControl: musicControl,
        drawHud: drawHud,
        drawCar: drawCar
    }
})()

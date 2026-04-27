"use strict"

window.CarSimUI = (function() {
    function initializeControls(state) {
        var configControls = document.querySelectorAll("[data-config]")
        var debugToggle = document.getElementById("modelDebugToggle")
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

        if (debugToggle) {
            debugToggle.checked = state.modelDebugWheelsOnly
            debugToggle.addEventListener("change", function(evt) {
                state.modelDebugWheelsOnly = evt.target.checked
            })
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

    function drawCar(ctx, state) {
        window.CarSimVehicleAppearance.drawCar(ctx, state.car, {
            wheelsOnly: state.modelDebugWheelsOnly
        })
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

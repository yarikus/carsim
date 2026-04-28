"use strict"

window.CarSimUI = (function() {
    var telemetryGrid = null
    var clockValue = null
    var timeOfDayValue = null
    var parkedVehicleWheels = {
        frontLeft: { steeringAngle: 0, spinAngle: 0 },
        frontRight: { steeringAngle: 0, spinAngle: 0 },
        rearLeft: { steeringAngle: 0, spinAngle: 0 },
        rearRight: { steeringAngle: 0, spinAngle: 0 }
    }

    function initializeControls(state) {
        var configControls = document.querySelectorAll("[data-config]")
        var shadowToggle = document.getElementById("showShadowsToggle")
        var wheelToggle = document.getElementById("showWheelsToggle")
        var debugToggle = document.getElementById("modelDebugToggle")
        var wheelTrailToggle = document.getElementById("wheelTrailsToggle")
        var hitboxToggle = document.getElementById("hitboxDebugToggle")
        var telemetryToggle = document.getElementById("telemetryDebugToggle")
        var radiusToggle = document.getElementById("vehicleRadiusDebugToggle")
        var spawnVehicleButton = document.getElementById("spawnVehicleButton")
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

        if (shadowToggle) {
            shadowToggle.checked = state.graphicsShowShadows
            shadowToggle.addEventListener("change", function(evt) {
                state.graphicsShowShadows = evt.target.checked
            })
        }

        if (wheelToggle) {
            wheelToggle.checked = state.graphicsShowWheels
            wheelToggle.addEventListener("change", function(evt) {
                state.graphicsShowWheels = evt.target.checked
            })
        }

        if (debugToggle) {
            debugToggle.checked = state.modelDebugWheelsOnly
            debugToggle.addEventListener("change", function(evt) {
                state.modelDebugWheelsOnly = evt.target.checked
            })
        }

        if (wheelTrailToggle) {
            wheelTrailToggle.checked = state.debugWheelTrails
            wheelTrailToggle.addEventListener("change", function(evt) {
                state.debugWheelTrails = evt.target.checked
                if (!state.debugWheelTrails) {
                    window.CarSimPhysics.clearWheelTrails(state)
                }
            })
        }

        if (hitboxToggle) {
            hitboxToggle.checked = state.debugShowHitboxes
            hitboxToggle.addEventListener("change", function(evt) {
                state.debugShowHitboxes = evt.target.checked
            })
        }

        if (telemetryToggle) {
            telemetryToggle.checked = state.debugShowTelemetry
            telemetryToggle.addEventListener("change", function(evt) {
                state.debugShowTelemetry = evt.target.checked
                syncTelemetryVisibility(state)
            })
        }

        if (radiusToggle) {
            radiusToggle.checked = state.debugShowVehicleRadius
            radiusToggle.addEventListener("change", function(evt) {
                state.debugShowVehicleRadius = evt.target.checked
            })
        }

        if (spawnVehicleButton) {
            spawnVehicleButton.addEventListener("click", function() {
                window.CarSimPhysics.spawnRandomVehicle(state)
            })
        }

        initializeDetachTrailerToggle(state)
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

    function initializeTelemetryPanel() {
        telemetryGrid = document.getElementById("telemetryGrid")
        syncTelemetryVisibility({ debugShowTelemetry: true })
    }

    function initializeClockPanel() {
        clockValue = document.getElementById("clockValue")
        timeOfDayValue = document.getElementById("timeOfDayValue")
    }

    function updateClockPanel(state) {
        var totalSeconds
        var hours
        var minutes

        if (!clockValue) {
            return
        }

        totalSeconds = Math.floor(state.gameTimeSeconds)
        hours = Math.floor(totalSeconds / 3600) % 24
        minutes = Math.floor((totalSeconds % 3600) / 60)
        clockValue.textContent = padTimeValue(hours) + ":" + padTimeValue(minutes)

        if (timeOfDayValue) {
            timeOfDayValue.textContent = window.CarSimPhysics.getTimeOfDay(state)
        }
    }

    function updateTelemetryPanel(state) {
        var rows

        if (!telemetryGrid || !state.debugShowTelemetry) {
            return
        }

        rows = [
            { label: "Speed", value: formatTelemetryValue(state.car.displayVelocity, " km/h") },
            { label: "Velocity", value: formatTelemetryNumber(state.car.velocity) },
            { label: "Forward force", value: formatTelemetryNumber(state.car.forceFoward) },
            { label: "Reverse force", value: formatTelemetryNumber(state.car.forceBackward) },
            { label: "Steering", value: formatTelemetryValue(state.car.steeringAngle, " deg") },
            { label: "Steer limit", value: formatTelemetryValue(state.physicsConfig.maxSteeringAngle, " deg") },
            { label: "Acceleration", value: formatTelemetryNumber(state.physicsConfig.baseForce) },
            { label: "Turn speed", value: formatTelemetryNumber(state.physicsConfig.baseTurningSpeed) },
            { label: "Friction", value: formatTelemetryNumber(state.physicsConfig.surfaceFriction) },
            { label: "Max forward", value: formatTelemetryNumber(state.physicsConfig.maxSpeedFront) },
            { label: "Max reverse", value: formatTelemetryNumber(state.physicsConfig.maxSpeedBack) },
            { label: "Trailer", value: state.debugDetachTrailer ? "Detached" : "Hitched" },
            { label: "Nearby swap", value: state.debugShowVehicleRadius ? "Enter to switch" : "Hidden" }
        ]

        telemetryGrid.innerHTML = rows.map(function(row) {
            return '<span class="telemetry-label">' + row.label + '</span><span class="telemetry-value">' + row.value + '</span>'
        }).join("")
    }

    function drawCar(ctx, state) {
        window.CarSimVehicleAppearance.drawCar(ctx, state.car, state.wheels, {
            wheelsOnly: state.modelDebugWheelsOnly,
            showShadows: state.graphicsShowShadows,
            showWheels: state.graphicsShowWheels || state.modelDebugWheelsOnly,
            accentColor: state.car.accentColor
        })
    }

    function drawTrailer(ctx, state) {
        window.CarSimTrailerAppearance.drawTrailer(ctx, state.trailer, {
            wheelsOnly: state.modelDebugWheelsOnly,
            showShadows: state.graphicsShowShadows,
            showWheels: state.graphicsShowWheels || state.modelDebugWheelsOnly
        })
    }

    function drawSpawnedVehicle(ctx, vehicle, state) {
        window.CarSimVehicleAppearance.drawCar(ctx, vehicle, parkedVehicleWheels, {
            wheelsOnly: state.modelDebugWheelsOnly,
            showShadows: state.graphicsShowShadows,
            showWheels: state.graphicsShowWheels || state.modelDebugWheelsOnly,
            accentColor: vehicle.accentColor
        })
    }

    function initializeDetachTrailerToggle(state) {
        var detachTrailerToggle = document.getElementById("detachTrailerToggle")

        if (!detachTrailerToggle) {
            return
        }

        detachTrailerToggle.checked = state.debugDetachTrailer
        detachTrailerToggle.addEventListener("change", function(evt) {
            state.debugDetachTrailer = evt.target.checked
            if (state.debugDetachTrailer) {
                window.CarSimPhysics.releaseTrailerFromHitch(state)
            } else {
                window.CarSimPhysics.resetTrailerToHitch(state)
            }
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

    function formatTelemetryValue(value, suffix) {
        return formatTelemetryNumber(value) + suffix
    }

    function formatTelemetryNumber(value) {
        var numericValue = Number(value)

        if (Math.abs(numericValue) >= 100) {
            return numericValue.toFixed(0)
        }

        if (Math.abs(numericValue) >= 10) {
            return numericValue.toFixed(1)
        }

        if (Math.abs(numericValue) >= 1) {
            return numericValue.toFixed(2)
        }

        return numericValue.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")
    }

    function syncTelemetryVisibility(state) {
        var telemetryPanel = document.getElementById("telemetryPanel")

        if (!telemetryPanel) {
            return
        }

        telemetryPanel.style.display = state.debugShowTelemetry ? "block" : "none"
    }

    function padTimeValue(value) {
        return value < 10 ? "0" + value : String(value)
    }

    return {
        initializeControls: initializeControls,
        initializeClockPanel: initializeClockPanel,
        initializeTelemetryPanel: initializeTelemetryPanel,
        initializeMusicButton: initializeMusicButton,
        musicControl: musicControl,
        updateClockPanel: updateClockPanel,
        updateTelemetryPanel: updateTelemetryPanel,
        drawHud: drawHud,
        drawCar: drawCar,
        drawTrailer: drawTrailer,
        drawSpawnedVehicle: drawSpawnedVehicle
    }
})()

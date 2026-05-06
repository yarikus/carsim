"use strict"

window.CarSimUI = (function() {
    var telemetryGrid = null
    var clockValue = null
    var timeOfDayValue = null
    var pauseMenuOverlay = null
    var pauseMenuOptions = []
    var parkedVehicleWheels = {
        frontLeft: { steeringAngle: 0, spinAngle: 0 },
        frontRight: { steeringAngle: 0, spinAngle: 0 },
        rearLeft: { steeringAngle: 0, spinAngle: 0 },
        rearRight: { steeringAngle: 0, spinAngle: 0 }
    }

    function initializeControls(state) {
        var configControls = document.querySelectorAll("[data-config]")
        var cameraZoomControl = document.getElementById("cameraZoomControl")
        var cameraZoomValue = document.getElementById("cameraZoomValue")
        var shadowToggle = document.getElementById("showShadowsToggle")
        var wheelToggle = document.getElementById("showWheelsToggle")
        var debugToggle = document.getElementById("modelDebugToggle")
        var wheelTrailToggle = document.getElementById("wheelTrailsToggle")
        var hitboxToggle = document.getElementById("hitboxDebugToggle")
        var telemetryToggle = document.getElementById("telemetryDebugToggle")
        var radiusToggle = document.getElementById("vehicleRadiusDebugToggle")
        var attachRadiusToggle = document.getElementById("attachRadiusDebugToggle")
        var calibrationGridToggle = document.getElementById("calibrationGridToggle")
        var ppmControl = document.getElementById("ppmControl")
        var ppmValue = document.getElementById("ppmValue")
        var objectDimensionsToggle = document.getElementById("objectDimensionsToggle")
        var trailerAttachButton = document.getElementById("toggleTrailerAttachButton")
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

        if (cameraZoomControl) {
            cameraZoomControl.value = String(state.cameraZoom)
            syncCameraZoomValue(state.cameraZoom, cameraZoomValue)
            cameraZoomControl.addEventListener("input", function(evt) {
                state.cameraZoom = Number(evt.target.value)
                syncCameraZoomValue(state.cameraZoom, cameraZoomValue)
            })
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

        if (attachRadiusToggle) {
            attachRadiusToggle.checked = state.debugShowAttachRadius
            attachRadiusToggle.addEventListener("change", function(evt) {
                state.debugShowAttachRadius = evt.target.checked
            })
        }

        if (calibrationGridToggle) {
            calibrationGridToggle.checked = state.debugShowCalibrationGrid
            calibrationGridToggle.addEventListener("change", function(evt) {
                state.debugShowCalibrationGrid = evt.target.checked
            })
        }

        if (ppmControl) {
            ppmControl.value = String(state.pixelsPerMeter)
            syncPpmValue(state.pixelsPerMeter, ppmValue)
            ppmControl.addEventListener("input", function(evt) {
                state.pixelsPerMeter = Number(evt.target.value)
                syncPpmValue(state.pixelsPerMeter, ppmValue)
            })
        }

        if (objectDimensionsToggle) {
            objectDimensionsToggle.checked = state.debugShowObjectDimensions
            objectDimensionsToggle.addEventListener("change", function(evt) {
                state.debugShowObjectDimensions = evt.target.checked
            })
        }

        if (trailerAttachButton) {
            trailerAttachButton.addEventListener("click", function() {
                window.CarSimPhysics.toggleTrailerAttachment(state)
                updateTrailerAttachButton(state)
            })
            updateTrailerAttachButton(state)
        }

        if (spawnVehicleButton) {
            spawnVehicleButton.addEventListener("click", function() {
                window.CarSimPhysics.spawnRandomVehicle(state)
            })
        }

    }

    function initializePauseMenu(state) {
        pauseMenuOverlay = document.getElementById("pauseMenuOverlay")
        pauseMenuOptions = Array.prototype.slice.call(document.querySelectorAll("[data-pause-action]"))

        pauseMenuOptions.forEach(function(option, index) {
            option.addEventListener("mousemove", function() {
                if (!state.gameMenuOpen) {
                    return
                }

                setPauseMenuSelection(state, index)
            })

            option.addEventListener("click", function() {
                if (!state.gameMenuOpen) {
                    return
                }

                setPauseMenuSelection(state, index)
                activatePauseMenuSelection(state)
            })
        })

        syncPauseMenu(state)
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
            { label: "Mass", value: formatTelemetryValue(state.car.mass, " kg") },
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
            { label: "Wall strength", value: formatTelemetryNumber(state.world.wall.structuralStrength) },
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
            accentColor: state.car.accentColor,
            definition: state.car.vehicleDefinition
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
            accentColor: vehicle.accentColor,
            definition: vehicle.vehicleDefinition
        })
    }

    function updateTrailerAttachButton(state) {
        var trailerAttachButton = document.getElementById("toggleTrailerAttachButton")
        var canAttach

        if (!trailerAttachButton) {
            return
        }

        canAttach = window.CarSimPhysics.canAttachTrailer(state)

        if (state.debugDetachTrailer) {
            trailerAttachButton.textContent = canAttach ? "Attach trailer" : "Attach trailer (out of range)"
            trailerAttachButton.disabled = !canAttach
            trailerAttachButton.style.opacity = canAttach ? "1" : "0.55"
            return
        }

        trailerAttachButton.textContent = "Detach trailer"
        trailerAttachButton.disabled = false
        trailerAttachButton.style.opacity = "1"
    }

    function togglePauseMenu(state) {
        setPauseMenuOpen(state, !state.gameMenuOpen)
        return state.gameMenuOpen
    }

    function setPauseMenuOpen(state, isOpen) {
        state.gameMenuOpen = Boolean(isOpen)

        if (state.gameMenuOpen) {
            state.pauseMenuSelection = 0
        }

        syncPauseMenu(state)
    }

    function handlePauseMenuKey(state, evt) {
        if (!state.gameMenuOpen) {
            return false
        }

        if (matchesAnyKey(evt, ["ArrowUp", "KeyW", "w", "W"])) {
            evt.preventDefault()
            movePauseMenuSelection(state, -1)
            return true
        }

        if (matchesAnyKey(evt, ["ArrowDown", "KeyS", "s", "S"])) {
            evt.preventDefault()
            movePauseMenuSelection(state, 1)
            return true
        }

        if (matchesAnyKey(evt, ["Enter", "NumpadEnter", " ", "Space"])) {
            evt.preventDefault()
            activatePauseMenuSelection(state)
            return true
        }

        return false
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

    function syncCameraZoomValue(value, valueElement) {
        if (!valueElement) {
            return
        }

        valueElement.textContent = value.toFixed(2) + "x"
    }

    function syncPpmValue(value, valueElement) {
        if (!valueElement) {
            return
        }

        valueElement.textContent = String(Math.round(value))
    }

    function syncPauseMenu(state) {
        var simShell = document.querySelector(".sim-shell")

        if (!pauseMenuOverlay) {
            return
        }

        pauseMenuOverlay.classList.toggle("is-visible", state.gameMenuOpen)
        pauseMenuOverlay.setAttribute("aria-hidden", state.gameMenuOpen ? "false" : "true")

        if (simShell) {
            simShell.classList.toggle("is-menu-open", state.gameMenuOpen)
        }

        syncPauseMenuSelection(state)
    }

    function exitGame() {
        window.close()

        if (window.history.length > 1) {
            window.history.back()
            return
        }

        window.location.replace("about:blank")
    }

    function setPauseMenuSelection(state, nextIndex) {
        var optionCount = pauseMenuOptions.length

        if (!optionCount) {
            state.pauseMenuSelection = 0
            return
        }

        state.pauseMenuSelection = normalizePauseMenuIndex(nextIndex, optionCount)
        syncPauseMenuSelection(state)
    }

    function movePauseMenuSelection(state, direction) {
        setPauseMenuSelection(state, state.pauseMenuSelection + direction)
    }

    function activatePauseMenuSelection(state) {
        var activeOption = pauseMenuOptions[state.pauseMenuSelection]
        var action

        if (!activeOption) {
            return
        }

        action = activeOption.dataset.pauseAction

        if (action === "continue") {
            setPauseMenuOpen(state, false)
            return
        }

        if (action === "exit") {
            exitGame()
        }
    }

    function syncPauseMenuSelection(state) {
        var selectedIndex = normalizePauseMenuIndex(state.pauseMenuSelection, pauseMenuOptions.length)

        pauseMenuOptions.forEach(function(option, index) {
            var isActive = state.gameMenuOpen && index === selectedIndex

            option.classList.toggle("is-active", isActive)
            option.setAttribute("aria-selected", isActive ? "true" : "false")
        })
    }

    function normalizePauseMenuIndex(index, optionCount) {
        if (!optionCount) {
            return 0
        }

        return (index % optionCount + optionCount) % optionCount
    }

    function matchesAnyKey(evt, keys) {
        return keys.indexOf(evt.key) !== -1 || keys.indexOf(evt.code) !== -1
    }

    function padTimeValue(value) {
        return value < 10 ? "0" + value : String(value)
    }

    return {
        initializeControls: initializeControls,
        initializeClockPanel: initializeClockPanel,
        initializeTelemetryPanel: initializeTelemetryPanel,
        initializePauseMenu: initializePauseMenu,
        updateClockPanel: updateClockPanel,
        updateTelemetryPanel: updateTelemetryPanel,
        updateTrailerAttachButton: updateTrailerAttachButton,
        handlePauseMenuKey: handlePauseMenuKey,
        togglePauseMenu: togglePauseMenu,
        setPauseMenuOpen: setPauseMenuOpen,
        drawHud: drawHud,
        drawCar: drawCar,
        drawTrailer: drawTrailer,
        drawSpawnedVehicle: drawSpawnedVehicle
    }
})()

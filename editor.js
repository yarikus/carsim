"use strict";

(function() {
    var previewCanvas = document.getElementById("previewCanvas")
    var previewCtx = previewCanvas.getContext("2d")
    var lastFrameTime = null
    var currentDefinitionId = null
    var currentDefinitionBuiltIn = false
    var previewState = createPreviewState(window.CarSimVehicleDefinitions.getPreferredDefinition())
    var formIds = [
        "vehicleName",
        "vehicleType",
        "vehicleForm",
        "accentColor",
        "bodyColor",
        "trimColor",
        "glassColor",
        "vehicleWidth",
        "vehicleHeight",
        "hoodRatio",
        "cabRatio",
        "sleeperRatio",
        "frameRatio",
        "wheelBase",
        "hitchOffset",
        "frontTrack",
        "rearTrack",
        "vehicleMass",
        "vehicleStrength"
    ]
    var formElements = {}

    initialize()
    requestAnimationFrame(draw)

    function initialize() {
        var i
        var preferredDefinition = window.CarSimVehicleDefinitions.getPreferredDefinition()

        for (i = 0; i < formIds.length; i++) {
            formElements[formIds[i]] = document.getElementById(formIds[i])
            formElements[formIds[i]].addEventListener("input", onFormChanged)
        }

        document.getElementById("definitionSelect").addEventListener("change", onDefinitionSelected)
        document.getElementById("newPresetButton").addEventListener("click", createNewPreset)
        document.getElementById("savePresetButton").addEventListener("click", savePreset)
        document.getElementById("deletePresetButton").addEventListener("click", deletePreset)
        document.getElementById("useInSimButton").addEventListener("click", useInSimulator)
        window.addEventListener("resize", resizeCanvas)
        document.addEventListener("keydown", onKeyDown)
        document.addEventListener("keyup", onKeyUp)

        resizeCanvas()
        populateDefinitionSelect()
        loadDefinitionIntoForm(preferredDefinition, window.CarSimVehicleDefinitions.isBuiltInDefinitionId(preferredDefinition.id))
    }

    function createPreviewState(definition) {
        return {
            definition: definition,
            car: window.CarSimVehicleDefinitions.applyDefinitionToVehicleState({
                xPosition: 0,
                yPosition: 0,
                velocity: 0,
                displayVelocity: 0,
                forceFoward: 0,
                forceBackward: 0,
                facingAngle: 0,
                steeringAngle: 0
            }, definition),
            wheels: {
                frontLeft: { steeringAngle: 0, spinAngle: 0 },
                frontRight: { steeringAngle: 0, spinAngle: 0 },
                rearLeft: { steeringAngle: 0, spinAngle: 0 },
                rearRight: { steeringAngle: 0, spinAngle: 0 }
            },
            keyArray: {}
        }
    }

    function populateDefinitionSelect() {
        var select = document.getElementById("definitionSelect")
        var definitions = window.CarSimVehicleDefinitions.loadDefinitions()
        var options = []
        var selectedId
        var i
        var isBuiltIn

        if (!definitions || definitions.length === 0) {
            definitions = window.CarSimVehicleDefinitions.getBuiltInDefinitions()
        }

        for (i = 0; i < definitions.length; i++) {
            isBuiltIn = window.CarSimVehicleDefinitions.isBuiltInDefinitionId(definitions[i].id)
            options.push('<option value="' + definitions[i].id + '">' + definitions[i].name + (isBuiltIn ? " • built-in" : " • custom") + "</option>")
        }

        select.innerHTML = options.join("")
        selectedId = currentDefinitionId || window.CarSimVehicleDefinitions.getPreferredDefinition().id

        if (!definitions.some(function(definition) { return definition.id === selectedId })) {
            selectedId = definitions[0].id
        }

        select.value = selectedId
    }

    function onDefinitionSelected(evt) {
        var definition = window.CarSimVehicleDefinitions.getDefinitionById(evt.target.value)
        loadDefinitionIntoForm(definition, window.CarSimVehicleDefinitions.isBuiltInDefinitionId(definition.id))
    }

    function loadDefinitionIntoForm(definition, isBuiltIn) {
        currentDefinitionId = definition.id
        currentDefinitionBuiltIn = isBuiltIn
        formElements.vehicleName.value = definition.name
        formElements.vehicleType.value = definition.type
        formElements.vehicleForm.value = definition.form
        formElements.accentColor.value = toHex(definition.colors.accent)
        formElements.bodyColor.value = toHex(definition.colors.body)
        formElements.trimColor.value = toHex(definition.colors.trim)
        formElements.glassColor.value = toHex(definition.colors.glass)
        formElements.vehicleWidth.value = definition.geometry.width
        formElements.vehicleHeight.value = definition.geometry.height
        formElements.hoodRatio.value = definition.geometry.hoodRatio
        formElements.cabRatio.value = definition.geometry.cabRatio
        formElements.sleeperRatio.value = definition.geometry.sleeperRatio
        formElements.frameRatio.value = definition.geometry.frameRatio
        formElements.wheelBase.value = definition.physics.wheelBase
        formElements.hitchOffset.value = definition.physics.hitchOffset
        formElements.frontTrack.value = definition.physics.frontTrack
        formElements.rearTrack.value = definition.physics.rearTrack
        formElements.vehicleMass.value = definition.physics.mass
        formElements.vehicleStrength.value = definition.physics.structuralStrength
        previewState = createPreviewState(definition)
        syncPreviewMeta()
        updateDeleteButton()
        document.getElementById("definitionSelect").value = definition.id
        setStatus((isBuiltIn ? "Loaded built-in preset: " : "Loaded custom preset: ") + definition.name)
    }

    function onFormChanged() {
        var definition = readDefinitionFromForm()
        applyFormTemplate(definition)
        syncGeometryFields(definition)
        previewState = createPreviewState(definition)
        syncPreviewMeta()
    }

    function readDefinitionFromForm() {
        var rawDefinition = {
            id: currentDefinitionBuiltIn ? null : currentDefinitionId,
            name: formElements.vehicleName.value,
            type: formElements.vehicleType.value,
            form: formElements.vehicleForm.value,
            colors: {
                accent: formElements.accentColor.value,
                body: formElements.bodyColor.value,
                trim: formElements.trimColor.value,
                glass: toRgba(formElements.glassColor.value, 0.74),
                wheel: "rgb(18, 18, 18)",
                shadow: "rgba(0, 0, 0, 0.22)"
            },
            geometry: {
                width: formElements.vehicleWidth.value,
                height: formElements.vehicleHeight.value,
                hoodRatio: formElements.hoodRatio.value,
                cabRatio: formElements.cabRatio.value,
                sleeperRatio: formElements.sleeperRatio.value,
                frameRatio: formElements.frameRatio.value,
                bodyHeightRatio: 0.72,
                hoodHeightRatio: 0.5,
                sleeperHeightRatio: 0.66,
                dualWheelGapRatio: 0.09
            },
            physics: {
                mass: formElements.vehicleMass.value,
                structuralStrength: formElements.vehicleStrength.value,
                wheelBase: formElements.wheelBase.value,
                frontTrack: formElements.frontTrack.value,
                rearTrack: formElements.rearTrack.value,
                hitchOffset: formElements.hitchOffset.value
            }
        }

        return window.CarSimVehicleDefinitions.normalizeDefinition(rawDefinition)
    }

    function applyFormTemplate(definition) {
        if (definition.form === "cabover") {
            definition.geometry.hoodRatio = 0.08
            definition.geometry.cabRatio = Math.max(definition.geometry.cabRatio, 0.3)
        } else if (definition.form === "short-nose") {
            definition.geometry.hoodRatio = Math.min(definition.geometry.hoodRatio, 0.2)
            definition.geometry.cabRatio = Math.max(definition.geometry.cabRatio, 0.22)
        } else {
            definition.geometry.hoodRatio = Math.max(definition.geometry.hoodRatio, 0.22)
        }
    }

    function syncGeometryFields(definition) {
        formElements.hoodRatio.value = definition.geometry.hoodRatio
        formElements.cabRatio.value = definition.geometry.cabRatio
        formElements.sleeperRatio.value = definition.geometry.sleeperRatio
        formElements.frameRatio.value = definition.geometry.frameRatio
    }

    function createNewPreset() {
        loadDefinitionIntoForm(window.CarSimVehicleDefinitions.getBuiltInDefinitions()[0], true)
        formElements.vehicleName.value = "New Custom Vehicle"
        currentDefinitionId = null
        currentDefinitionBuiltIn = false
        onFormChanged()
        setStatus("New custom preset ready.")
    }

    function savePreset() {
        var definition = readDefinitionFromForm()

        if (currentDefinitionBuiltIn || !currentDefinitionId) {
            definition.id = null
        }

        definition = window.CarSimVehicleDefinitions.saveDefinition(definition)
        currentDefinitionId = definition.id
        currentDefinitionBuiltIn = false
        populateDefinitionSelect()
        loadDefinitionIntoForm(definition, false)
        setStatus("Preset saved: " + definition.name)
    }

    function deletePreset() {
        if (currentDefinitionBuiltIn || !currentDefinitionId) {
            return
        }

        window.CarSimVehicleDefinitions.deleteDefinition(currentDefinitionId)
        createNewPreset()
        populateDefinitionSelect()
        setStatus("Custom preset deleted.")
    }

    function useInSimulator() {
        var definition = readDefinitionFromForm()

        if (currentDefinitionBuiltIn || !currentDefinitionId) {
            definition = window.CarSimVehicleDefinitions.saveDefinition(definition)
            currentDefinitionId = definition.id
            currentDefinitionBuiltIn = false
            populateDefinitionSelect()
        }

        window.CarSimVehicleDefinitions.setPreferredDefinitionId(currentDefinitionId)
        setStatus("Preset selected for main simulator: " + formElements.vehicleName.value)
    }

    function updateDeleteButton() {
        document.getElementById("deletePresetButton").disabled = currentDefinitionBuiltIn || !currentDefinitionId
    }

    function setStatus(message) {
        var status = document.getElementById("editorStatus")

        if (!status) {
            return
        }

        status.textContent = message
    }

    function resizeCanvas() {
        previewCanvas.width = previewCanvas.clientWidth
        previewCanvas.height = window.innerHeight
    }

    function draw(timestamp) {
        var deltaSeconds = 0

        if (lastFrameTime !== null) {
            deltaSeconds = (timestamp - lastFrameTime) / 1000
        }

        lastFrameTime = timestamp
        updatePreviewPhysics(deltaSeconds)
        renderPreview()
        requestAnimationFrame(draw)
    }

    function updatePreviewPhysics(deltaSeconds) {
        var car = previewState.car
        var wheels = previewState.wheels
        var moveRight = keyPressed(["ArrowRight", "KeyD"])
        var moveLeft = keyPressed(["ArrowLeft", "KeyA"])
        var moveForward = keyPressed(["ArrowUp", "KeyW"])
        var moveBackward = keyPressed(["ArrowDown", "KeyS"])
        var steeringInput = 0
        var steeringRadians

        if (moveRight) {
            steeringInput = 1
        }

        if (moveLeft) {
            steeringInput = -1
        }

        if (moveForward && car.velocity < 8) {
            car.forceFoward += 0.05
        }

        if (moveBackward && car.velocity > -3.4) {
            car.forceBackward += 0.05
        }

        if (car.velocity !== 0) {
            car.forceFoward *= 0.988
            car.forceBackward *= 0.988
        }

        if (steeringInput !== 0) {
            car.steeringAngle += steeringInput * 0.8
            car.steeringAngle = Math.max(-30, Math.min(30, car.steeringAngle))
        } else if (car.steeringAngle > 0) {
            car.steeringAngle = Math.max(0, car.steeringAngle - 2)
        } else if (car.steeringAngle < 0) {
            car.steeringAngle = Math.min(0, car.steeringAngle + 2)
        }

        updatePreviewWheelAngles()

        car.velocity = car.forceFoward - car.forceBackward
        steeringRadians = ((wheels.frontLeft.steeringAngle + wheels.frontRight.steeringAngle) * 0.5) * Math.PI / 180

        if (Math.abs(car.velocity) > 0.001 && Math.abs(steeringRadians) > 0.0001) {
            car.facingAngle += (car.velocity / Math.max(1, car.wheelBase)) * Math.tan(steeringRadians) * 180 / Math.PI * deltaSeconds * 60
        }

        car.xPosition += car.velocity * Math.cos(car.facingAngle * Math.PI / 180) * deltaSeconds * 60
        car.yPosition += car.velocity * Math.sin(car.facingAngle * Math.PI / 180) * deltaSeconds * 60
        car.displayVelocity = Math.abs(Math.round(car.velocity * 15))
        updatePreviewWheelSpin()
    }

    function updatePreviewWheelAngles() {
        var car = previewState.car
        var wheels = previewState.wheels
        var steeringRadians = car.steeringAngle * Math.PI / 180
        var turnRadius
        var innerAngle
        var outerAngle

        if (Math.abs(car.steeringAngle) < 0.001) {
            wheels.frontLeft.steeringAngle = 0
            wheels.frontRight.steeringAngle = 0
            return
        }

        turnRadius = Math.abs(car.wheelBase / Math.tan(steeringRadians))
        innerAngle = Math.atan(car.wheelBase / Math.max(1, turnRadius - car.frontTrack / 2)) * 180 / Math.PI
        outerAngle = Math.atan(car.wheelBase / Math.max(1, turnRadius + car.frontTrack / 2)) * 180 / Math.PI

        if (car.steeringAngle < 0) {
            wheels.frontLeft.steeringAngle = -innerAngle
            wheels.frontRight.steeringAngle = -outerAngle
        } else {
            wheels.frontLeft.steeringAngle = outerAngle
            wheels.frontRight.steeringAngle = innerAngle
        }
    }

    function updatePreviewWheelSpin() {
        var spinStep = previewState.car.velocity * 0.18

        previewState.wheels.frontLeft.spinAngle += spinStep
        previewState.wheels.frontRight.spinAngle += spinStep
        previewState.wheels.rearLeft.spinAngle += spinStep
        previewState.wheels.rearRight.spinAngle += spinStep
    }

    function renderPreview() {
        var carCenterX = previewState.car.xPosition + previewState.car.width / 2
        var carCenterY = previewState.car.yPosition + previewState.car.height / 2

        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height)
        previewCtx.save()
        previewCtx.translate(previewCanvas.width / 2 - carCenterX, previewCanvas.height / 2 - carCenterY)
        drawTestPad(previewCtx, carCenterX, carCenterY)
        previewCtx.restore()

        previewCtx.save()
        previewCtx.translate(previewCanvas.width / 2, previewCanvas.height / 2)
        previewCtx.rotate(previewState.car.facingAngle * Math.PI / 180)
        window.CarSimVehicleAppearance.drawCar(previewCtx, previewState.car, previewState.wheels, {
            showShadows: true,
            showWheels: true,
            definition: previewState.definition,
            accentColor: previewState.definition.colors.accent
        })
        previewCtx.restore()
    }

    function drawTestPad(ctx, cameraX, cameraY) {
        var tileSize = 160
        var startX = Math.floor((cameraX - previewCanvas.width) / tileSize) * tileSize
        var endX = Math.ceil((cameraX + previewCanvas.width) / tileSize) * tileSize
        var startY = Math.floor((cameraY - previewCanvas.height) / tileSize) * tileSize
        var endY = Math.ceil((cameraY + previewCanvas.height) / tileSize) * tileSize
        var x
        var y

        for (x = startX; x <= endX; x += tileSize) {
            for (y = startY; y <= endY; y += tileSize) {
                ctx.fillStyle = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0
                    ? "rgb(72, 112, 56)"
                    : "rgb(64, 101, 49)"
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

    function syncPreviewMeta() {
        document.getElementById("previewName").textContent = previewState.definition.name
        document.getElementById("previewMeta").textContent =
            "Mass " + previewState.definition.physics.mass + " kg • Strength " + previewState.definition.physics.structuralStrength
    }

    function keyPressed(keys) {
        var i

        for (i = 0; i < keys.length; i++) {
            if (previewState.keyArray[keys[i]]) {
                return true
            }
        }

        return false
    }

    function onKeyDown(evt) {
        previewState.keyArray[evt.code] = true
    }

    function onKeyUp(evt) {
        previewState.keyArray[evt.code] = false
    }

    function toHex(color) {
        if (String(color).charAt(0) === "#") {
            return String(color)
        }

        var match = String(color).match(/\d+/g)

        if (!match || match.length < 3) {
            return "#ffffff"
        }

        return "#" + [0, 1, 2].map(function(index) {
            return Number(match[index]).toString(16).padStart(2, "0")
        }).join("")
    }

    function toRgba(hexColor, alpha) {
        var safeHex = hexColor.replace("#", "")
        var red = parseInt(safeHex.slice(0, 2), 16)
        var green = parseInt(safeHex.slice(2, 4), 16)
        var blue = parseInt(safeHex.slice(4, 6), 16)

        return "rgba(" + red + ", " + green + ", " + blue + ", " + alpha + ")"
    }
})()

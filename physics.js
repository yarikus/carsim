"use strict"

window.CarSimPhysics = (function() {
    var steeringReturnSpeed = 2.2
    var steeringResponse = 0.22
    var maxArticulationAngle = 78

    function createState() {
        return {
            car: {
                width: 156,
                height: 58,
                xPosition: 0,
                yPosition: 0,
                velocity: 0,
                displayVelocity: 0,
                forceFoward: 0,
                forceBackward: 0,
                facingAngle: 0,
                steeringAngle: 0,
                wheelBase: 96,
                frontTrack: 44,
                rearTrack: 44,
                hitchOffset: -36
            },
            trailer: {
                width: 352,
                height: 58,
                xPosition: 0,
                yPosition: 0,
                facingAngle: 0,
                kingpinOffset: 0,
                axleOffset: -224,
                wheelTrack: 44
            },
            wheels: {
                frontLeft: createWheelState(),
                frontRight: createWheelState(),
                rearLeft: createWheelState(),
                rearRight: createWheelState()
            },
            physicsConfig: {
                baseForce: 0.06,
                baseTurningSpeed: 3.4,
                surfaceFriction: 0.99,
                maxSpeedFront: 7.5,
                maxSpeedBack: -3,
                maxSteeringAngle: 28
            },
            modelDebugWheelsOnly: false,
            debugWheelTrails: false,
            debugShowHitboxes: false,
            debugDetachTrailer: false,
            wheelTrails: {
                frontLeft: [],
                frontRight: [],
                rearLeft: [],
                rearRight: []
            },
            keyArray: [],
            musicOn: true
        }
    }

    function createWheelState() {
        return {
            steeringAngle: 0,
            spinAngle: 0
        }
    }

    function initializeWorld(state) {
        state.car.xPosition = -state.car.width / 2
        state.car.yPosition = -state.car.height / 2
        resetTrailerToHitch(state)
    }

    function moveCar(state) {
        var car = state.car
        var wheels = state.wheels
        var physicsConfig = state.physicsConfig
        var steeringAverageRadians
        var previousCarState
        var previousTrailerState

        if (car.velocity !== 0) {
            car.forceFoward *= physicsConfig.surfaceFriction
            car.forceBackward *= physicsConfig.surfaceFriction
        }

        previousCarState = captureBodyState(car)
        previousTrailerState = captureBodyState(state.trailer)
        car.velocity = Number((car.forceFoward - car.forceBackward).toFixed(3))
        steeringAverageRadians = ((wheels.frontLeft.steeringAngle + wheels.frontRight.steeringAngle) * 0.5) * Math.PI / 180

        if (Math.abs(car.velocity) > 0.001 && Math.abs(steeringAverageRadians) > 0.0001) {
            car.facingAngle += (car.velocity / car.wheelBase) * Math.tan(steeringAverageRadians) * 180 / Math.PI
        }

        car.xPosition += car.velocity * Math.cos(car.facingAngle * Math.PI / 180)
        car.yPosition += car.velocity * Math.sin(car.facingAngle * Math.PI / 180)
        car.displayVelocity = Math.abs(Math.round(car.velocity * 15))

        updateTrailer(state)
        resolveTrailerCollision(state, previousCarState, previousTrailerState)
        updateWheelSpin(state)
        updateWheelTrails(state)
    }

    function processKeys(state, music) {
        var steeringInput = 0
        var car = state.car
        var physicsConfig = state.physicsConfig
        var keyArray = state.keyArray

        if (keyArray["ArrowRight"] && car.velocity !== 0) {
            steeringInput = 1
        }

        if (keyArray["ArrowLeft"] && car.velocity !== 0) {
            steeringInput = -1
            music.muted = false
        }

        if (keyArray["ArrowUp"] && car.velocity < physicsConfig.maxSpeedFront) {
            car.forceFoward += physicsConfig.baseForce
            music.muted = false
        }

        if (keyArray["ArrowDown"] && car.velocity > physicsConfig.maxSpeedBack) {
            car.forceBackward += physicsConfig.baseForce
            music.muted = false
        }

        updateSteeringAngle(car, physicsConfig, steeringInput)
        updateWheelAngles(state)
    }

    function updateSteeringAngle(car, physicsConfig, steeringInput) {
        if (steeringInput !== 0) {
            car.steeringAngle += steeringInput * physicsConfig.baseTurningSpeed * steeringResponse
            car.steeringAngle = Math.max(-physicsConfig.maxSteeringAngle, Math.min(physicsConfig.maxSteeringAngle, car.steeringAngle))
            return
        }

        if (car.steeringAngle > 0) {
            car.steeringAngle = Math.max(0, car.steeringAngle - steeringReturnSpeed)
        } else if (car.steeringAngle < 0) {
            car.steeringAngle = Math.min(0, car.steeringAngle + steeringReturnSpeed)
        }
    }

    function updateWheelAngles(state) {
        var car = state.car
        var wheels = state.wheels
        var steeringRadians = car.steeringAngle * Math.PI / 180
        var turnRadius
        var innerAngle
        var outerAngle
        var leftTurn = car.steeringAngle < 0

        if (Math.abs(car.steeringAngle) < 0.001) {
            wheels.frontLeft.steeringAngle = 0
            wheels.frontRight.steeringAngle = 0
            wheels.rearLeft.steeringAngle = 0
            wheels.rearRight.steeringAngle = 0
            return
        }

        turnRadius = Math.abs(car.wheelBase / Math.tan(steeringRadians))
        innerAngle = Math.atan(car.wheelBase / Math.max(1, turnRadius - car.frontTrack / 2)) * 180 / Math.PI
        outerAngle = Math.atan(car.wheelBase / Math.max(1, turnRadius + car.frontTrack / 2)) * 180 / Math.PI

        if (leftTurn) {
            wheels.frontLeft.steeringAngle = -innerAngle
            wheels.frontRight.steeringAngle = -outerAngle
        } else {
            wheels.frontLeft.steeringAngle = outerAngle
            wheels.frontRight.steeringAngle = innerAngle
        }

        wheels.rearLeft.steeringAngle = 0
        wheels.rearRight.steeringAngle = 0
    }

    function updateWheelSpin(state) {
        var velocity = state.car.velocity
        var spinStep = velocity * 0.18
        var wheelKeys = ["frontLeft", "frontRight", "rearLeft", "rearRight"]
        var i

        for (i = 0; i < wheelKeys.length; i++) {
            state.wheels[wheelKeys[i]].spinAngle += spinStep
        }
    }

    function updateTrailer(state) {
        var trailer = state.trailer
        var hitchPosition
        var axlePosition
        var directionFromAxleToKingpin

        if (state.debugDetachTrailer) {
            return
        }

        hitchPosition = getCarHitchPosition(state.car)
        axlePosition = getTrailerAxlePosition(trailer)
        directionFromAxleToKingpin = Math.atan2(hitchPosition.y - axlePosition.y, hitchPosition.x - axlePosition.x)

        trailer.facingAngle = clampArticulationAngle(state.car.facingAngle, directionFromAxleToKingpin * 180 / Math.PI)
        trailer.xPosition = hitchPosition.x
        trailer.yPosition = hitchPosition.y
    }

    function resolveTrailerCollision(state, previousCarState, previousTrailerState) {
        if (!state.debugDetachTrailer) {
            return
        }

        if (!bodiesColliding(getCarCollisionBox(state.car), getTrailerCollisionBox(state.trailer))) {
            return
        }

        restoreBodyState(state.car, previousCarState)
        restoreBodyState(state.trailer, previousTrailerState)
        state.car.velocity = 0
        state.car.forceFoward = 0
        state.car.forceBackward = 0
        state.car.displayVelocity = 0
    }

    function resetTrailerToHitch(state) {
        var hitchPosition = getCarHitchPosition(state.car)
        var trailer = state.trailer

        trailer.facingAngle = state.car.facingAngle
        trailer.xPosition = hitchPosition.x
        trailer.yPosition = hitchPosition.y
    }

    function releaseTrailerFromHitch(state) {
        var trailer = state.trailer
        var angle = trailer.facingAngle * Math.PI / 180
        var releaseDistance = Math.max(72, trailer.width * 0.22)

        trailer.xPosition -= Math.cos(angle) * releaseDistance
        trailer.yPosition -= Math.sin(angle) * releaseDistance
    }

    function getCarCenter(car) {
        return {
            x: car.xPosition + car.width / 2,
            y: car.yPosition + car.height / 2
        }
    }

    function getCarHitchPosition(car) {
        var center = getCarCenter(car)
        var angle = car.facingAngle * Math.PI / 180

        return {
            x: center.x + Math.cos(angle) * car.hitchOffset,
            y: center.y + Math.sin(angle) * car.hitchOffset
        }
    }

    function getTrailerAxlePosition(trailer) {
        var angle = trailer.facingAngle * Math.PI / 180

        return {
            x: trailer.xPosition + Math.cos(angle) * trailer.axleOffset,
            y: trailer.yPosition + Math.sin(angle) * trailer.axleOffset
        }
    }

    function clampArticulationAngle(tractorAngle, trailerAngle) {
        var delta = normalizeAngleDegrees(trailerAngle - tractorAngle)
        var clampedDelta = Math.max(-maxArticulationAngle, Math.min(maxArticulationAngle, delta))

        return normalizeAngleDegrees(tractorAngle + clampedDelta)
    }

    function normalizeAngleDegrees(angle) {
        var normalized = angle

        while (normalized > 180) {
            normalized -= 360
        }

        while (normalized < -180) {
            normalized += 360
        }

        return normalized
    }

    function getCarCollisionBox(car) {
        return {
            centerX: car.xPosition + car.width / 2 + Math.cos(car.facingAngle * Math.PI / 180) * (car.width * 0.06),
            centerY: car.yPosition + car.height / 2 + Math.sin(car.facingAngle * Math.PI / 180) * (car.width * 0.06),
            width: car.width * 0.72,
            height: car.height * 0.68,
            angle: car.facingAngle * Math.PI / 180
        }
    }

    function getTrailerCollisionBox(trailer) {
        var bodyLength = trailer.width * 0.84
        var localCenterX = -bodyLength * 0.5 + trailer.width * 0.12
        var angle = trailer.facingAngle * Math.PI / 180

        return {
            centerX: trailer.xPosition + Math.cos(angle) * localCenterX,
            centerY: trailer.yPosition + Math.sin(angle) * localCenterX,
            width: bodyLength,
            height: trailer.height * 0.82,
            angle: angle
        }
    }

    function bodiesColliding(a, b) {
        var polygons = [getOrientedBoxVertices(a), getOrientedBoxVertices(b)]
        var axes = getPolygonAxes(polygons[0]).concat(getPolygonAxes(polygons[1]))
        var i

        for (i = 0; i < axes.length; i++) {
            if (!projectionsOverlap(projectPolygon(polygons[0], axes[i]), projectPolygon(polygons[1], axes[i]))) {
                return false
            }
        }

        return true
    }

    function getOrientedBoxVertices(box) {
        var halfWidth = box.width / 2
        var halfHeight = box.height / 2
        var cosAngle = Math.cos(box.angle)
        var sinAngle = Math.sin(box.angle)

        return [
            rotatePoint(box.centerX, box.centerY, -halfWidth, -halfHeight, cosAngle, sinAngle),
            rotatePoint(box.centerX, box.centerY, halfWidth, -halfHeight, cosAngle, sinAngle),
            rotatePoint(box.centerX, box.centerY, halfWidth, halfHeight, cosAngle, sinAngle),
            rotatePoint(box.centerX, box.centerY, -halfWidth, halfHeight, cosAngle, sinAngle)
        ]
    }

    function rotatePoint(centerX, centerY, localX, localY, cosAngle, sinAngle) {
        return {
            x: centerX + localX * cosAngle - localY * sinAngle,
            y: centerY + localX * sinAngle + localY * cosAngle
        }
    }

    function getPolygonAxes(vertices) {
        var axes = []
        var i
        var nextIndex
        var edgeX
        var edgeY
        var length

        for (i = 0; i < vertices.length; i++) {
            nextIndex = (i + 1) % vertices.length
            edgeX = vertices[nextIndex].x - vertices[i].x
            edgeY = vertices[nextIndex].y - vertices[i].y
            length = Math.hypot(edgeX, edgeY)

            axes.push({
                x: -edgeY / length,
                y: edgeX / length
            })
        }

        return axes
    }

    function projectPolygon(vertices, axis) {
        var projection = vertices[0].x * axis.x + vertices[0].y * axis.y
        var min = projection
        var max = projection
        var i

        for (i = 1; i < vertices.length; i++) {
            projection = vertices[i].x * axis.x + vertices[i].y * axis.y
            min = Math.min(min, projection)
            max = Math.max(max, projection)
        }

        return {
            min: min,
            max: max
        }
    }

    function projectionsOverlap(a, b) {
        return a.max >= b.min && b.max >= a.min
    }

    function captureBodyState(body) {
        return {
            xPosition: body.xPosition,
            yPosition: body.yPosition,
            facingAngle: body.facingAngle
        }
    }

    function restoreBodyState(body, snapshot) {
        body.xPosition = snapshot.xPosition
        body.yPosition = snapshot.yPosition
        body.facingAngle = snapshot.facingAngle
    }

    function updateWheelTrails(state) {
        var wheelPositions
        var wheelKeys
        var i
        var key

        if (!state.debugWheelTrails) {
            return
        }

        if (Math.abs(state.car.velocity) < 0.05) {
            return
        }

        wheelPositions = getWheelWorldPositions(state)
        wheelKeys = Object.keys(wheelPositions)

        for (i = 0; i < wheelKeys.length; i++) {
            key = wheelKeys[i]
            state.wheelTrails[key].push({
                x: wheelPositions[key].x,
                y: wheelPositions[key].y
            })

            if (state.wheelTrails[key].length > 180) {
                state.wheelTrails[key].shift()
            }
        }
    }

    function getWheelWorldPositions(state) {
        var car = state.car
        var centerX = car.xPosition + car.width / 2
        var centerY = car.yPosition + car.height / 2
        var angle = car.facingAngle * Math.PI / 180
        var cosAngle = Math.cos(angle)
        var sinAngle = Math.sin(angle)
        var steerAxleX = car.width * 0.34
        var rearAxleFront = -car.width * 0.17
        var rearAxleBack = rearAxleFront - car.width * 0.12
        var rearAxleCenter = (rearAxleFront + rearAxleBack) / 2
        var outerWheelY = car.height * 0.42

        return {
            frontLeft: projectWheel(centerX, centerY, cosAngle, sinAngle, steerAxleX, -outerWheelY),
            frontRight: projectWheel(centerX, centerY, cosAngle, sinAngle, steerAxleX, outerWheelY),
            rearLeft: projectWheel(centerX, centerY, cosAngle, sinAngle, rearAxleCenter, -outerWheelY),
            rearRight: projectWheel(centerX, centerY, cosAngle, sinAngle, rearAxleCenter, outerWheelY)
        }
    }

    function projectWheel(centerX, centerY, cosAngle, sinAngle, localX, localY) {
        return {
            x: centerX + localX * cosAngle - localY * sinAngle,
            y: centerY + localX * sinAngle + localY * cosAngle
        }
    }

    function clearWheelTrails(state) {
        state.wheelTrails.frontLeft = []
        state.wheelTrails.frontRight = []
        state.wheelTrails.rearLeft = []
        state.wheelTrails.rearRight = []
    }

    function getDebugHitboxes(state) {
        return [
            {
                label: "Tractor",
                strokeStyle: "rgba(87, 214, 255, 0.95)",
                fillStyle: "rgba(87, 214, 255, 0.12)",
                box: getCarCollisionBox(state.car)
            },
            {
                label: "Trailer",
                strokeStyle: "rgba(255, 176, 64, 0.95)",
                fillStyle: "rgba(255, 176, 64, 0.12)",
                box: getTrailerCollisionBox(state.trailer)
            }
        ]
    }

    return {
        createState: createState,
        initializeWorld: initializeWorld,
        moveCar: moveCar,
        processKeys: processKeys,
        clearWheelTrails: clearWheelTrails,
        getDebugHitboxes: getDebugHitboxes,
        resetTrailerToHitch: resetTrailerToHitch,
        releaseTrailerFromHitch: releaseTrailerFromHitch,
        getCarCenter: getCarCenter
    }
})()

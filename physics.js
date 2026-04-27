"use strict"

window.CarSimPhysics = (function() {
    var steeringReturnSpeed = 2.2
    var steeringResponse = 0.22

    function createState() {
        return {
            car: {
                width: 148,
                height: 56,
                xPosition: 0,
                yPosition: 0,
                velocity: 0,
                displayVelocity: 0,
                forceFoward: 0,
                forceBackward: 0,
                facingAngle: 0,
                steeringAngle: 0,
                wheelBase: 92,
                frontTrack: 42,
                rearTrack: 42
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
    }

    function moveCar(state) {
        var car = state.car
        var wheels = state.wheels
        var physicsConfig = state.physicsConfig
        var steeringAverageRadians

        if (car.velocity !== 0) {
            car.forceFoward *= physicsConfig.surfaceFriction
            car.forceBackward *= physicsConfig.surfaceFriction
        }

        car.velocity = Number((car.forceFoward - car.forceBackward).toFixed(3))
        steeringAverageRadians = ((wheels.frontLeft.steeringAngle + wheels.frontRight.steeringAngle) * 0.5) * Math.PI / 180

        if (Math.abs(car.velocity) > 0.001 && Math.abs(steeringAverageRadians) > 0.0001) {
            car.facingAngle += (car.velocity / car.wheelBase) * Math.tan(steeringAverageRadians) * 180 / Math.PI
        }

        car.xPosition += car.velocity * Math.cos(car.facingAngle * Math.PI / 180)
        car.yPosition += car.velocity * Math.sin(car.facingAngle * Math.PI / 180)
        car.displayVelocity = Math.abs(Math.round(car.velocity * 15))

        updateWheelSpin(state)
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

    return {
        createState: createState,
        initializeWorld: initializeWorld,
        moveCar: moveCar,
        processKeys: processKeys
    }
})()

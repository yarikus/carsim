"use strict"

window.CarSimPhysics = (function() {
    var steeringReturnSpeed = 2.2

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
                steeringAngle: 0
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

    function initializeWorld(state) {
        state.car.xPosition = -state.car.width / 2
        state.car.yPosition = -state.car.height / 2
    }

    function moveCar(state) {
        var car = state.car
        var physicsConfig = state.physicsConfig

        if (car.velocity !== 0) {
            car.forceFoward *= physicsConfig.surfaceFriction
            car.forceBackward *= physicsConfig.surfaceFriction
        }

        car.velocity = Number((car.forceFoward - car.forceBackward).toFixed(3))
        car.xPosition += car.velocity * Math.cos(car.facingAngle * Math.PI / 180)
        car.yPosition += car.velocity * Math.sin(car.facingAngle * Math.PI / 180)
        car.displayVelocity = Math.abs(Math.round(car.velocity * 15))
    }

    function processKeys(state, music) {
        var steeringInput = 0
        var car = state.car
        var physicsConfig = state.physicsConfig
        var keyArray = state.keyArray

        if (keyArray["ArrowRight"] && car.velocity !== 0) {
            car.facingAngle += physicsConfig.baseTurningSpeed
            steeringInput = 1
        }

        if (keyArray["ArrowLeft"] && car.velocity !== 0) {
            car.facingAngle -= physicsConfig.baseTurningSpeed
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
    }

    function updateSteeringAngle(car, physicsConfig, steeringInput) {
        if (steeringInput !== 0) {
            car.steeringAngle += steeringInput * steeringReturnSpeed * 2.3
            car.steeringAngle = Math.max(-physicsConfig.maxSteeringAngle, Math.min(physicsConfig.maxSteeringAngle, car.steeringAngle))
            return
        }

        if (car.steeringAngle > 0) {
            car.steeringAngle = Math.max(0, car.steeringAngle - steeringReturnSpeed)
        } else if (car.steeringAngle < 0) {
            car.steeringAngle = Math.min(0, car.steeringAngle + steeringReturnSpeed)
        }
    }

    return {
        createState: createState,
        initializeWorld: initializeWorld,
        moveCar: moveCar,
        processKeys: processKeys
    }
})()

"use strict"

window.CarSimVehicleAppearance = (function() {
    var debugMode = false

    function drawCar(ctx, car, wheels, options) {
        var wheelsOnly = options && options.wheelsOnly

        if (debugMode) {
            ctx.strokeStyle = "rgb(255, 0, 0)"
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(60, 0)
            ctx.stroke()
        }

        var sleeperLength = car.width * 0.22
        var cabLength = car.width * 0.18
        var hoodLength = car.width * 0.26
        var frameLength = car.width * 0.28
        var bodyHeight = car.height * 0.72
        var hoodHeight = car.height * 0.5
        var sleeperHeight = car.height * 0.66
        var rearAxleFront = -car.width * 0.17
        var rearAxleBack = rearAxleFront - car.width * 0.12
        var steerAxleX = car.width * 0.34
        var outerWheelY = car.height * 0.42
        var wheelWidth = car.width * 0.115
        var wheelHeight = car.height * 0.18
        var dualWheelGap = car.height * 0.09
        var sleeperStart = -car.width * 0.16
        var cabStart = sleeperStart + sleeperLength * 0.72
        var hoodStart = cabStart + cabLength * 0.58
        var stackX = sleeperStart - car.width * 0.01

        drawTruckShadow(ctx, car)

        drawRearDualWheelSet(ctx, rearAxleBack, -outerWheelY, wheelWidth, wheelHeight, dualWheelGap, wheels.rearLeft)
        drawRearDualWheelSet(ctx, rearAxleBack, outerWheelY, wheelWidth, wheelHeight, dualWheelGap, wheels.rearRight)
        drawRearDualWheelSet(ctx, rearAxleFront, -outerWheelY, wheelWidth, wheelHeight, dualWheelGap, wheels.rearLeft)
        drawRearDualWheelSet(ctx, rearAxleFront, outerWheelY, wheelWidth, wheelHeight, dualWheelGap, wheels.rearRight)
        drawWheel(ctx, steerAxleX, -outerWheelY, wheelWidth, wheelHeight, wheels.frontLeft)
        drawWheel(ctx, steerAxleX, outerWheelY, wheelWidth, wheelHeight, wheels.frontRight)

        if (wheelsOnly) {
            return
        }

        ctx.fillStyle = "rgb(74, 80, 86)"
        roundRect(ctx, -car.width * 0.34, -car.height * 0.12, frameLength, car.height * 0.24, 6)
        ctx.fill()

        ctx.fillStyle = "rgb(170, 28, 28)"
        roundRect(ctx, sleeperStart, -sleeperHeight / 2, sleeperLength, sleeperHeight, 11)
        ctx.fill()
        roundRect(ctx, cabStart, -bodyHeight / 2, cabLength, bodyHeight, 11)
        ctx.fill()

        ctx.fillStyle = "rgb(185, 189, 194)"
        roundRect(ctx, hoodStart, -hoodHeight / 2, hoodLength, hoodHeight, 10)
        ctx.fill()

        ctx.fillStyle = "rgb(125, 130, 136)"
        roundRect(ctx, hoodStart + hoodLength * 0.62, -hoodHeight * 0.4, hoodLength * 0.2, hoodHeight * 0.8, 8)
        ctx.fill()

        ctx.fillStyle = "rgb(42, 47, 53)"
        roundRect(ctx, sleeperStart + car.width * 0.025, -sleeperHeight * 0.42, sleeperLength * 0.34, sleeperHeight * 0.84, 7)
        ctx.fill()
        roundRect(ctx, cabStart + car.width * 0.015, -bodyHeight * 0.4, cabLength * 0.44, bodyHeight * 0.8, 7)
        ctx.fill()

        ctx.fillStyle = "rgba(163, 188, 206, 0.74)"
        roundRect(ctx, cabStart + cabLength * 0.1, -bodyHeight * 0.32, cabLength * 0.26, bodyHeight * 0.64, 6)
        ctx.fill()
        roundRect(ctx, sleeperStart + sleeperLength * 0.18, -sleeperHeight * 0.22, sleeperLength * 0.16, sleeperHeight * 0.44, 5)
        ctx.fill()

        ctx.fillStyle = "rgb(28, 30, 33)"
        roundRect(ctx, hoodStart - car.width * 0.01, -car.height * 0.46, car.width * 0.02, car.height * 0.92, 5)
        ctx.fill()

        ctx.fillStyle = "rgb(198, 202, 206)"
        roundRect(ctx, stackX, -car.height * 0.47, car.width * 0.03, car.height * 0.22, 4)
        ctx.fill()
        roundRect(ctx, stackX, car.height * 0.25, car.width * 0.03, car.height * 0.22, 4)
        ctx.fill()

        ctx.fillStyle = "rgb(144, 148, 152)"
        roundRect(ctx, sleeperStart + car.width * 0.01, -car.height * 0.46, car.width * 0.08, car.height * 0.12, 5)
        ctx.fill()
        roundRect(ctx, sleeperStart + car.width * 0.01, car.height * 0.34, car.width * 0.08, car.height * 0.12, 5)
        ctx.fill()

        ctx.fillStyle = "rgb(236, 238, 214)"
        roundRect(ctx, hoodStart + hoodLength * 0.85, -hoodHeight * 0.35, car.width * 0.04, car.height * 0.12, 4)
        ctx.fill()
        roundRect(ctx, hoodStart + hoodLength * 0.85, hoodHeight * 0.23, car.width * 0.04, car.height * 0.12, 4)
        ctx.fill()

        ctx.fillStyle = "rgb(184, 42, 42)"
        roundRect(ctx, -car.width * 0.38, -car.height * 0.22, car.width * 0.04, car.height * 0.12, 4)
        ctx.fill()
        roundRect(ctx, -car.width * 0.38, car.height * 0.1, car.width * 0.04, car.height * 0.12, 4)
        ctx.fill()

        ctx.fillStyle = "rgb(92, 96, 100)"
        roundRect(ctx, -car.width * 0.24, -car.height * 0.17, car.width * 0.12, car.height * 0.34, 5)
        ctx.fill()

        drawKingpinPlate(ctx, car)
    }

    function drawTruckShadow(ctx, car) {
        ctx.save()
        ctx.fillStyle = "rgba(0, 0, 0, 0.22)"
        roundRect(ctx, -car.width * 0.4, -car.height * 0.42, car.width * 0.86, car.height * 0.84, 14)
        ctx.fill()
        ctx.restore()
    }

    function drawRearDualWheelSet(ctx, centerX, centerY, width, height, gap, wheelState) {
        drawWheel(ctx, centerX - gap * 0.5, centerY, width, height, wheelState)
        drawWheel(ctx, centerX + gap * 0.5, centerY, width, height, wheelState)
    }

    function drawWheel(ctx, centerX, centerY, width, height, wheelState) {
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate((wheelState.steeringAngle || 0) * Math.PI / 180)
        ctx.fillStyle = "rgb(18, 18, 18)"
        roundRect(ctx, -width / 2, -height / 2, width, height, 4)
        ctx.fill()

        ctx.fillStyle = "rgb(128, 132, 136)"
        roundRect(ctx, -width * 0.16, -height * 0.34, width * 0.32, height * 0.68, 3)
        ctx.fill()

        drawWheelSpinIndicator(ctx, width, height, wheelState.spinAngle || 0)
        ctx.restore()
    }

    function drawWheelSpinIndicator(ctx, width, height, spinAngle) {
        ctx.save()
        ctx.rotate(spinAngle)
        ctx.strokeStyle = "rgba(225, 225, 225, 0.75)"
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(0, -height * 0.32)
        ctx.lineTo(0, height * 0.32)
        ctx.stroke()
        ctx.restore()
    }

    function drawKingpinPlate(ctx, car) {
        var kingpinX = car.hitchOffset
        var plateWidth = car.width * 0.12
        var plateHeight = car.height * 0.46
        var kingpinRadius = car.height * 0.08
        var plateX = kingpinX - plateWidth * 0.55

        ctx.fillStyle = "rgb(74, 78, 84)"
        roundRect(ctx, plateX, -plateHeight / 2, plateWidth, plateHeight, 6)
        ctx.fill()

        ctx.fillStyle = "rgb(160, 255, 60)"
        ctx.beginPath()
        ctx.arc(kingpinX, 0, kingpinRadius, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = "rgb(255, 48, 48)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(kingpinX, 0, kingpinRadius + 1.5, 0, Math.PI * 2)
        ctx.stroke()

        ctx.strokeStyle = "rgb(255, 48, 48)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(kingpinX - kingpinRadius * 0.9, 0)
        ctx.lineTo(kingpinX + kingpinRadius * 0.9, 0)
        ctx.moveTo(kingpinX, -kingpinRadius * 0.9)
        ctx.lineTo(kingpinX, kingpinRadius * 0.9)
        ctx.stroke()
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

    return {
        drawCar: drawCar
    }
})()

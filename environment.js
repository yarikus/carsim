"use strict"

window.CarSimEnvironment = (function() {
    function resizeCanvas(canvas) {
        canvas.width = canvas.clientWidth
        canvas.height = window.innerHeight
    }

    function applyCameraTransform(ctx, canvas, state) {
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.scale(state.cameraZoom, state.cameraZoom)
        ctx.translate(-canvas.width / 2, -canvas.height / 2)
    }

    function drawEnvironment(ctx, canvas, state) {
        var car = state.car
        var cameraX = car.xPosition + car.width / 2
        var cameraY = car.yPosition + car.height / 2

        ctx.save()
        ctx.translate(canvas.width / 2 - cameraX, canvas.height / 2 - cameraY)
        drawSurface(ctx, canvas, cameraX, cameraY)
        drawCalibrationGrid(ctx, canvas, state, cameraX, cameraY)
        drawWall(ctx, state.world.wall)
        drawWheelTrails(ctx, state)
        drawDebugHitboxes(ctx, state)
        drawObjectDimensions(ctx, state)
        drawVehicleRadiusDebug(ctx, state)
        drawAttachRadiusDebug(ctx, state)
        ctx.restore()
    }

    function drawCalibrationGrid(ctx, canvas, state, cameraX, cameraY) {
        var pixelsPerMeter
        var fineStep
        var majorStep
        var startX
        var endX
        var startY
        var endY
        var x
        var y

        if (!state.debugShowCalibrationGrid) {
            return
        }

        pixelsPerMeter = Math.max(1, state.pixelsPerMeter)
        fineStep = pixelsPerMeter
        majorStep = pixelsPerMeter * 5
        startX = Math.floor((cameraX - canvas.width) / fineStep) * fineStep
        endX = Math.ceil((cameraX + canvas.width) / fineStep) * fineStep
        startY = Math.floor((cameraY - canvas.height) / fineStep) * fineStep
        endY = Math.ceil((cameraY + canvas.height) / fineStep) * fineStep

        ctx.save()

        for (x = startX; x <= endX; x += fineStep) {
            if (Math.round(x / fineStep) % 5 === 0) {
                ctx.strokeStyle = "rgba(255, 255, 255, 0.18)"
                ctx.lineWidth = 1.6
            } else {
                ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
                ctx.lineWidth = 1
            }

            ctx.beginPath()
            ctx.moveTo(x, startY)
            ctx.lineTo(x, endY)
            ctx.stroke()
        }

        for (y = startY; y <= endY; y += fineStep) {
            if (Math.round(y / fineStep) % 5 === 0) {
                ctx.strokeStyle = "rgba(255, 255, 255, 0.18)"
                ctx.lineWidth = 1.6
            } else {
                ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
                ctx.lineWidth = 1
            }

            ctx.beginPath()
            ctx.moveTo(startX, y)
            ctx.lineTo(endX, y)
            ctx.stroke()
        }

        drawCalibrationLabels(ctx, startX, startY, endX, endY, majorStep, pixelsPerMeter)
        ctx.restore()
    }

    function drawCalibrationLabels(ctx, startX, startY, endX, endY, majorStep, pixelsPerMeter) {
        var x
        var y
        var meterValue

        ctx.fillStyle = "rgba(255, 255, 255, 0.42)"
        ctx.font = "12px Arial"

        for (x = Math.ceil(startX / majorStep) * majorStep; x <= endX; x += majorStep) {
            meterValue = Math.round(x / pixelsPerMeter)
            ctx.fillText(meterValue + " m", x + 6, startY + 16)
        }

        for (y = Math.ceil(startY / majorStep) * majorStep; y <= endY; y += majorStep) {
            meterValue = Math.round(y / pixelsPerMeter)
            ctx.fillText(meterValue + " m", startX + 6, y - 6)
        }
    }

    function drawSurface(ctx, canvas, cameraX, cameraY) {
        var tileSize = 160
        var startX = Math.floor((cameraX - canvas.width) / tileSize) * tileSize
        var endX = Math.ceil((cameraX + canvas.width) / tileSize) * tileSize
        var startY = Math.floor((cameraY - canvas.height) / tileSize) * tileSize
        var endY = Math.ceil((cameraY + canvas.height) / tileSize) * tileSize
        var x
        var y

        for (x = startX; x <= endX; x += tileSize) {
            for (y = startY; y <= endY; y += tileSize) {
                ctx.fillStyle = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0
                    ? "rgb(78, 120, 62)"
                    : "rgb(71, 111, 56)"
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

    function drawWheelTrails(ctx, state) {
        var trailKeys
        var i

        if (!state.debugWheelTrails) {
            return
        }

        trailKeys = [
            { key: "frontLeft", color: "rgba(245, 245, 245, 0.42)" },
            { key: "frontRight", color: "rgba(245, 245, 245, 0.42)" },
            { key: "rearLeft", color: "rgba(25, 25, 25, 0.42)" },
            { key: "rearRight", color: "rgba(25, 25, 25, 0.42)" }
        ]

        for (i = 0; i < trailKeys.length; i++) {
            drawTrailPath(ctx, state.wheelTrails[trailKeys[i].key], trailKeys[i].color)
        }
    }

    function drawTrailPath(ctx, points, strokeStyle) {
        var i

        if (!points || points.length < 2) {
            return
        }

        ctx.save()
        ctx.strokeStyle = strokeStyle
        ctx.lineWidth = 3
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)

        for (i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y)
        }

        ctx.stroke()
        ctx.restore()
    }

    function drawWall(ctx, wall) {
        ctx.save()
        ctx.translate(wall.xPosition + wall.width / 2, wall.yPosition + wall.height / 2)
        ctx.rotate(wall.facingAngle * Math.PI / 180)

        ctx.fillStyle = "rgb(132, 136, 142)"
        ctx.fillRect(-wall.width / 2, -wall.height / 2, wall.width, wall.height)

        ctx.fillStyle = "rgb(110, 114, 120)"
        ctx.fillRect(-wall.width / 2, -wall.height / 2, wall.width, wall.height * 0.18)

        ctx.strokeStyle = "rgba(255, 255, 255, 0.22)"
        ctx.lineWidth = 2
        ctx.strokeRect(-wall.width / 2, -wall.height / 2, wall.width, wall.height)

        drawWallSegments(ctx, wall)
        ctx.restore()
    }

    function drawWallSegments(ctx, wall) {
        var segmentWidth = 40
        var startX = -wall.width / 2 + segmentWidth
        var x

        ctx.strokeStyle = "rgba(255, 255, 255, 0.16)"
        ctx.lineWidth = 1.5

        for (x = startX; x < wall.width / 2; x += segmentWidth) {
            ctx.beginPath()
            ctx.moveTo(x, -wall.height / 2)
            ctx.lineTo(x, wall.height / 2)
            ctx.stroke()
        }
    }

    function drawDebugHitboxes(ctx, state) {
        var hitboxes
        var i

        if (!state.debugShowHitboxes) {
            return
        }

        hitboxes = window.CarSimPhysics.getDebugHitboxes(state)

        for (i = 0; i < hitboxes.length; i++) {
            drawOrientedHitbox(ctx, hitboxes[i])
        }
    }

    function drawVehicleRadiusDebug(ctx, state) {
        var radiusDebug

        if (!state.debugShowVehicleRadius) {
            return
        }

        radiusDebug = window.CarSimPhysics.getVehicleRadiusDebug(state)

        ctx.save()
        ctx.strokeStyle = "rgba(120, 220, 255, 0.9)"
        ctx.fillStyle = "rgba(120, 220, 255, 0.08)"
        ctx.lineWidth = 2
        ctx.setLineDash([12, 8])
        ctx.beginPath()
        ctx.arc(radiusDebug.centerX, radiusDebug.centerY, radiusDebug.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.setLineDash([])

        ctx.fillStyle = "rgba(120, 220, 255, 0.95)"
        ctx.beginPath()
        ctx.arc(radiusDebug.centerX, radiusDebug.centerY, 4, 0, Math.PI * 2)
        ctx.fill()

        if (radiusDebug.targetCenter) {
            ctx.strokeStyle = "rgba(164, 255, 110, 0.95)"
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.moveTo(radiusDebug.centerX, radiusDebug.centerY)
            ctx.lineTo(radiusDebug.targetCenter.x, radiusDebug.targetCenter.y)
            ctx.stroke()

            ctx.fillStyle = "rgba(164, 255, 110, 0.95)"
            ctx.beginPath()
            ctx.arc(radiusDebug.targetCenter.x, radiusDebug.targetCenter.y, 5, 0, Math.PI * 2)
            ctx.fill()
        }

        ctx.restore()
    }

    function drawAttachRadiusDebug(ctx, state) {
        var attachDebug

        if (!state.debugShowAttachRadius) {
            return
        }

        attachDebug = window.CarSimPhysics.getAttachRadiusDebug(state)

        ctx.save()
        ctx.strokeStyle = attachDebug.canAttach ? "rgba(160, 255, 90, 0.95)" : "rgba(255, 214, 84, 0.95)"
        ctx.fillStyle = attachDebug.canAttach ? "rgba(160, 255, 90, 0.08)" : "rgba(255, 214, 84, 0.08)"
        ctx.lineWidth = 2
        ctx.setLineDash([10, 8])
        ctx.beginPath()
        ctx.arc(attachDebug.centerX, attachDebug.centerY, attachDebug.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.setLineDash([])

        ctx.fillStyle = attachDebug.canAttach ? "rgba(160, 255, 90, 0.95)" : "rgba(255, 214, 84, 0.95)"
        ctx.beginPath()
        ctx.arc(attachDebug.centerX, attachDebug.centerY, 4, 0, Math.PI * 2)
        ctx.fill()

        if (attachDebug.trailerX !== null && attachDebug.trailerY !== null) {
            ctx.strokeStyle = attachDebug.canAttach ? "rgba(160, 255, 90, 0.9)" : "rgba(255, 214, 84, 0.9)"
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.moveTo(attachDebug.centerX, attachDebug.centerY)
            ctx.lineTo(attachDebug.trailerX, attachDebug.trailerY)
            ctx.stroke()

            ctx.beginPath()
            ctx.arc(attachDebug.trailerX, attachDebug.trailerY, 5, 0, Math.PI * 2)
            ctx.fill()
        }

        ctx.restore()
    }

    function drawObjectDimensions(ctx, state) {
        var ppm
        var i

        if (!state.debugShowObjectDimensions) {
            return
        }

        ppm = Math.max(1, state.pixelsPerMeter)

        drawDimensionLabel(
            ctx,
            state.car.xPosition + state.car.width / 2,
            state.car.yPosition - 22,
            "Tractor",
            state.car.width,
            state.car.height,
            ppm,
            "rgba(87, 214, 255, 0.92)"
        )

        drawDimensionLabel(
            ctx,
            state.trailer.xPosition + Math.cos(state.trailer.facingAngle * Math.PI / 180) * (-state.trailer.width * 0.28),
            state.trailer.yPosition + Math.sin(state.trailer.facingAngle * Math.PI / 180) * (-state.trailer.width * 0.28) - 18,
            "Trailer",
            state.trailer.width,
            state.trailer.height,
            ppm,
            "rgba(255, 176, 64, 0.94)"
        )

        drawDimensionLabel(
            ctx,
            state.world.wall.xPosition + state.world.wall.width / 2,
            state.world.wall.yPosition - 18,
            "Wall",
            state.world.wall.width,
            state.world.wall.height,
            ppm,
            "rgba(255, 84, 84, 0.94)"
        )

        for (i = 0; i < state.spawnedVehicles.length; i++) {
            drawDimensionLabel(
                ctx,
                state.spawnedVehicles[i].xPosition + state.spawnedVehicles[i].width / 2,
                state.spawnedVehicles[i].yPosition - 18,
                "Vehicle " + (i + 1),
                state.spawnedVehicles[i].width,
                state.spawnedVehicles[i].height,
                ppm,
                "rgba(158, 255, 96, 0.94)"
            )
        }
    }

    function drawDimensionLabel(ctx, x, y, label, widthPixels, heightPixels, ppm, accentColor) {
        var widthMeters = (widthPixels / ppm).toFixed(2)
        var heightMeters = (heightPixels / ppm).toFixed(2)
        var text = label + "  " + widthMeters + "m x " + heightMeters + "m"
        var textWidth

        ctx.save()
        ctx.font = "12px Arial"
        textWidth = ctx.measureText(text).width
        ctx.fillStyle = "rgba(7, 10, 12, 0.72)"
        ctx.fillRect(x - textWidth / 2 - 8, y - 14, textWidth + 16, 20)
        ctx.strokeStyle = accentColor
        ctx.lineWidth = 1.2
        ctx.strokeRect(x - textWidth / 2 - 8, y - 14, textWidth + 16, 20)
        ctx.fillStyle = accentColor
        ctx.fillText(text, x - textWidth / 2, y)
        ctx.restore()
    }

    function drawOrientedHitbox(ctx, hitboxEntry) {
        var vertices = getOrientedBoxVertices(hitboxEntry.box)

        ctx.save()
        ctx.fillStyle = hitboxEntry.fillStyle
        ctx.strokeStyle = hitboxEntry.strokeStyle
        ctx.lineWidth = 2
        ctx.setLineDash([10, 6])
        ctx.beginPath()
        ctx.moveTo(vertices[0].x, vertices[0].y)
        ctx.lineTo(vertices[1].x, vertices[1].y)
        ctx.lineTo(vertices[2].x, vertices[2].y)
        ctx.lineTo(vertices[3].x, vertices[3].y)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        ctx.setLineDash([])

        ctx.fillStyle = hitboxEntry.strokeStyle
        ctx.beginPath()
        ctx.arc(hitboxEntry.box.centerX, hitboxEntry.box.centerY, 3.5, 0, Math.PI * 2)
        ctx.fill()

        ctx.font = "12px Arial"
        ctx.fillText(hitboxEntry.label, hitboxEntry.box.centerX + 8, hitboxEntry.box.centerY - 8)
        ctx.restore()
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

    return {
        resizeCanvas: resizeCanvas,
        applyCameraTransform: applyCameraTransform,
        drawEnvironment: drawEnvironment
    }
})()

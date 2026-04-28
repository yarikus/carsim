"use strict"

window.CarSimEnvironment = (function() {
    function resizeCanvas(canvas) {
        canvas.width = canvas.clientWidth
        canvas.height = window.innerHeight
    }

    function drawEnvironment(ctx, canvas, state) {
        var car = state.car
        var cameraX = car.xPosition + car.width / 2
        var cameraY = car.yPosition + car.height / 2

        ctx.save()
        ctx.translate(canvas.width / 2 - cameraX, canvas.height / 2 - cameraY)
        drawSurface(ctx, canvas, cameraX, cameraY)
        drawWheelTrails(ctx, state)
        drawDebugHitboxes(ctx, state)
        drawVehicleRadiusDebug(ctx, state)
        drawAttachRadiusDebug(ctx, state)
        ctx.restore()
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
            ctx.beginPath()
            ctx.arc(attachDebug.trailerX, attachDebug.trailerY, 5, 0, Math.PI * 2)
            ctx.fill()
        }

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
        drawEnvironment: drawEnvironment
    }
})()

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

    return {
        resizeCanvas: resizeCanvas,
        drawEnvironment: drawEnvironment
    }
})()

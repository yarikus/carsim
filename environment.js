"use strict"

window.CarSimEnvironment = (function() {
    function resizeCanvas(canvas) {
        canvas.width = canvas.clientWidth
        canvas.height = window.innerHeight
    }

    function drawEnvironment(ctx, canvas, car) {
        var cameraX = car.xPosition + car.width / 2
        var cameraY = car.yPosition + car.height / 2

        ctx.save()
        ctx.translate(canvas.width / 2 - cameraX, canvas.height / 2 - cameraY)
        drawSurface(ctx, canvas, cameraX, cameraY)
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

    return {
        resizeCanvas: resizeCanvas,
        drawEnvironment: drawEnvironment
    }
})()

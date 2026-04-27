"use strict"

window.CarSimTrailerAppearance = (function() {
    function drawTrailer(ctx, trailer, options) {
        var wheelsOnly = options && options.wheelsOnly
        var boxLength = trailer.width * 0.8
        var bodyHeight = trailer.height * 0.88
        var kingpinSection = trailer.width * 0.16
        var wheelWidth = trailer.width * 0.08
        var wheelHeight = trailer.height * 0.18
        var wheelY = trailer.wheelTrack * 0.5
        var axleX = trailer.axleOffset
        var frontOverhang = trailer.width * 0.18
        var bodyStartX = -boxLength
        var bodyWidth = boxLength + frontOverhang
        var bodyFrontX = bodyStartX + bodyWidth
        var tailLightX = bodyStartX + trailer.width * 0.03

        ctx.save()
        ctx.fillStyle = "rgba(0, 0, 0, 0.18)"
        roundRect(ctx, bodyStartX - trailer.width * 0.04, -trailer.height * 0.46, bodyWidth + trailer.width * 0.08, trailer.height * 0.92, 12)
        ctx.fill()
        ctx.restore()

        drawPassiveWheel(ctx, axleX, -wheelY, wheelWidth, wheelHeight)
        drawPassiveWheel(ctx, axleX, wheelY, wheelWidth, wheelHeight)
        drawPassiveWheel(ctx, axleX - trailer.width * 0.1, -wheelY, wheelWidth, wheelHeight)
        drawPassiveWheel(ctx, axleX - trailer.width * 0.1, wheelY, wheelWidth, wheelHeight)

        if (wheelsOnly) {
            return
        }

        ctx.fillStyle = "rgb(196, 198, 202)"
        roundRect(ctx, bodyStartX, -bodyHeight / 2, bodyWidth, bodyHeight, 10)
        ctx.fill()

        ctx.fillStyle = "rgb(160, 165, 170)"
        roundRect(ctx, -kingpinSection * 0.92, -trailer.height * 0.16, kingpinSection, trailer.height * 0.32, 5)
        ctx.fill()

        drawTrailerKingpin(ctx, trailer)

        ctx.fillStyle = "rgb(88, 94, 100)"
        roundRect(ctx, bodyStartX + trailer.width * 0.04, -bodyHeight * 0.38, bodyWidth * 0.9, bodyHeight * 0.12, 5)
        ctx.fill()

        ctx.fillStyle = "rgb(154, 159, 164)"
        roundRect(ctx, bodyFrontX - trailer.width * 0.08, -bodyHeight * 0.3, trailer.width * 0.08, bodyHeight * 0.6, 5)
        ctx.fill()

        ctx.fillStyle = "rgb(184, 42, 42)"
        roundRect(ctx, tailLightX, -trailer.height * 0.2, trailer.width * 0.03, trailer.height * 0.12, 3)
        ctx.fill()
        roundRect(ctx, tailLightX, trailer.height * 0.08, trailer.width * 0.03, trailer.height * 0.12, 3)
        ctx.fill()
    }

    function drawPassiveWheel(ctx, centerX, centerY, width, height) {
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.fillStyle = "rgb(18, 18, 18)"
        roundRect(ctx, -width / 2, -height / 2, width, height, 4)
        ctx.fill()

        ctx.fillStyle = "rgb(128, 132, 136)"
        roundRect(ctx, -width * 0.16, -height * 0.34, width * 0.32, height * 0.68, 3)
        ctx.fill()
        ctx.restore()
    }

    function drawTrailerKingpin(ctx, trailer) {
        var kingpinRadius = trailer.height * 0.1
        var kingpinX = 0

        ctx.fillStyle = "rgb(160, 255, 60)"
        ctx.beginPath()
        ctx.arc(kingpinX, 0, kingpinRadius, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = "rgb(255, 48, 48)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(kingpinX, 0, kingpinRadius + 1.5, 0, Math.PI * 2)
        ctx.stroke()

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
        drawTrailer: drawTrailer
    }
})()

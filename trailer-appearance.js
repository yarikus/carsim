"use strict"

window.CarSimTrailerAppearance = (function() {
    function drawTrailer(ctx, trailer) {
        var boxLength = trailer.width * 0.82
        var bodyHeight = trailer.height * 0.86
        var kingpinSection = trailer.width * 0.18
        var wheelWidth = trailer.width * 0.08
        var wheelHeight = trailer.height * 0.18
        var wheelY = trailer.wheelTrack * 0.5
        var axleX = trailer.axleOffset

        ctx.save()
        ctx.fillStyle = "rgba(0, 0, 0, 0.18)"
        roundRect(ctx, -trailer.width * 0.44, -trailer.height * 0.46, trailer.width * 0.88, trailer.height * 0.92, 12)
        ctx.fill()
        ctx.restore()

        drawPassiveWheel(ctx, axleX, -wheelY, wheelWidth, wheelHeight)
        drawPassiveWheel(ctx, axleX, wheelY, wheelWidth, wheelHeight)
        drawPassiveWheel(ctx, axleX - trailer.width * 0.1, -wheelY, wheelWidth, wheelHeight)
        drawPassiveWheel(ctx, axleX - trailer.width * 0.1, wheelY, wheelWidth, wheelHeight)

        ctx.fillStyle = "rgb(196, 198, 202)"
        roundRect(ctx, -trailer.width * 0.1, -bodyHeight / 2, boxLength, bodyHeight, 10)
        ctx.fill()

        ctx.fillStyle = "rgb(160, 165, 170)"
        roundRect(ctx, -trailer.width * 0.34, -trailer.height * 0.14, kingpinSection, trailer.height * 0.28, 5)
        ctx.fill()

        ctx.fillStyle = "rgb(88, 94, 100)"
        roundRect(ctx, -trailer.width * 0.06, -bodyHeight * 0.38, boxLength * 0.9, bodyHeight * 0.12, 5)
        ctx.fill()

        ctx.fillStyle = "rgb(184, 42, 42)"
        roundRect(ctx, trailer.width * 0.32, -trailer.height * 0.2, trailer.width * 0.03, trailer.height * 0.12, 3)
        ctx.fill()
        roundRect(ctx, trailer.width * 0.32, trailer.height * 0.08, trailer.width * 0.03, trailer.height * 0.12, 3)
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

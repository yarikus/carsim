"use strict"

const http = require("http")
const fs = require("fs")
const path = require("path")
const { URL } = require("url")

const host = "127.0.0.1"
const port = Number(process.env.PORT) || 4173
const rootDir = __dirname

const mimeTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".mp3": "audio/mpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".webp": "image/webp"
}

const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, `http://${host}:${port}`)
    const requestedPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname
    const safePath = path.normalize(decodeURIComponent(requestedPath)).replace(/^(\.\.[/\\])+/, "")
    const filePath = path.join(rootDir, safePath)

    if (!filePath.startsWith(rootDir)) {
        writeError(response, 403, "Forbidden")
        return
    }

    fs.stat(filePath, (statError, stats) => {
        if (statError) {
            writeError(response, 404, "Not found")
            return
        }

        if (stats.isDirectory()) {
            serveFile(path.join(filePath, "index.html"), response)
            return
        }

        serveFile(filePath, response)
    })
})

server.listen(port, host, () => {
    console.log(`CarSim server running at http://${host}:${port}/`)
    console.log(`Editor available at http://${host}:${port}/editor.html`)
})

function serveFile(filePath, response) {
    const extension = path.extname(filePath).toLowerCase()
    const contentType = mimeTypes[extension] || "application/octet-stream"

    fs.readFile(filePath, (readError, contents) => {
        if (readError) {
            writeError(response, 500, "Internal server error")
            return
        }

        response.writeHead(200, {
            "Cache-Control": "no-store",
            "Content-Type": contentType
        })
        response.end(contents)
    })
}

function writeError(response, statusCode, message) {
    response.writeHead(statusCode, {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8"
    })
    response.end(message)
}

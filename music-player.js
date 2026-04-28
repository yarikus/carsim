"use strict"

window.CarSimMusicPlayer = (function() {
    function initialize(state, music) {
        var musicToggle = document.getElementById("musicToggle")
        var musicSeek = document.getElementById("musicSeek")
        var musicVolume = document.getElementById("musicVolume")

        if (!music || !musicToggle || !musicSeek || !musicVolume) {
            return
        }

        music.volume = Number(musicVolume.value) / 100
        updateVolumeUi(music.volume)

        musicToggle.addEventListener("click", function(evt) {
            evt.stopPropagation()
            state.musicOn = !state.musicOn
            syncPlaybackState(state, music)
            updatePlayerUi(state, music)
        })

        musicSeek.addEventListener("input", function() {
            var duration = Number.isFinite(music.duration) ? music.duration : 0

            if (duration <= 0) {
                return
            }

            music.currentTime = duration * (Number(musicSeek.value) / 100)
            updatePlayerUi(state, music)
        })

        musicVolume.addEventListener("input", function() {
            music.volume = Number(musicVolume.value) / 100
            updateVolumeUi(music.volume)
        })

        music.addEventListener("loadedmetadata", function() {
            updatePlayerUi(state, music)
        })

        music.addEventListener("timeupdate", function() {
            updatePlayerUi(state, music)
        })

        updatePlayerUi(state, music)
    }

    function syncPlaybackState(state, music) {
        if (state.musicOn) {
            music.muted = false
            music.play()
            return
        }

        music.pause()
    }

    function musicControl(state, music) {
        if (!music.muted && state.musicOn && music.paused) {
            music.play()
        }

        if (!state.musicOn && !music.paused) {
            music.pause()
        }
    }

    function updatePlayerUi(state, music) {
        var musicToggle = document.getElementById("musicToggle")
        var musicSeek = document.getElementById("musicSeek")
        var currentTimeLabel = document.getElementById("musicCurrentTime")
        var durationLabel = document.getElementById("musicDuration")
        var duration = Number.isFinite(music.duration) ? music.duration : 0
        var currentTime = Number.isFinite(music.currentTime) ? music.currentTime : 0
        var progress = duration > 0 ? (currentTime / duration) * 100 : 0

        if (musicToggle) {
            musicToggle.classList.toggle("is-paused", !state.musicOn)
            musicToggle.setAttribute("aria-label", state.musicOn ? "Pause music" : "Play music")
            musicToggle.setAttribute("title", state.musicOn ? "Pause music" : "Play music")
        }

        if (musicSeek) {
            musicSeek.value = String(progress)
            musicSeek.style.setProperty("--music-progress", progress.toFixed(2) + "%")
        }

        if (currentTimeLabel) {
            currentTimeLabel.textContent = formatTime(currentTime)
        }

        if (durationLabel) {
            durationLabel.textContent = formatTime(duration)
        }

        updateVolumeUi(music.volume)
    }

    function updateVolumeUi(volume) {
        var musicVolume = document.getElementById("musicVolume")
        var musicVolumeValue = document.getElementById("musicVolumeValue")
        var percent = Math.round((Number(volume) || 0) * 100)

        if (musicVolume) {
            musicVolume.value = String(percent)
            musicVolume.style.setProperty("--music-volume", percent + "%")
        }

        if (musicVolumeValue) {
            musicVolumeValue.textContent = percent + "%"
        }
    }

    function formatTime(totalSeconds) {
        var safeSeconds = Math.max(0, Math.floor(totalSeconds || 0))
        var minutes = Math.floor(safeSeconds / 60)
        var seconds = safeSeconds % 60

        return padTime(minutes) + ":" + padTime(seconds)
    }

    function padTime(value) {
        return value < 10 ? "0" + value : String(value)
    }

    return {
        initialize: initialize,
        musicControl: musicControl,
        updatePlayerUi: updatePlayerUi
    }
})()

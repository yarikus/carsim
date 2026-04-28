"use strict"

window.CarSimMusicPlayer = (function() {
    var storageKey = "carsim.musicPlayerState"
    var pendingUserActivation = false

    function initialize(state, music) {
        var musicToggle = document.getElementById("musicToggle")
        var musicSeek = document.getElementById("musicSeek")
        var musicVolume = document.getElementById("musicVolume")
        var savedState

        if (!music || !musicToggle || !musicSeek || !musicVolume) {
            return
        }

        savedState = loadSavedState()
        applySavedState(state, music, savedState)
        updateVolumeUi(music.volume)
        updatePlayerUi(state, music)

        musicToggle.addEventListener("click", function(evt) {
            evt.stopPropagation()
            state.musicOn = !state.musicOn
            syncPlaybackState(state, music)
            updatePlayerUi(state, music)
            saveState(state, music)
        })

        musicSeek.addEventListener("input", function() {
            var duration = Number.isFinite(music.duration) ? music.duration : 0

            if (duration <= 0) {
                return
            }

            music.currentTime = duration * (Number(musicSeek.value) / 100)
            updatePlayerUi(state, music)
            saveState(state, music)
        })

        musicVolume.addEventListener("input", function() {
            music.volume = Number(musicVolume.value) / 100
            updateVolumeUi(music.volume)
            saveState(state, music)
        })

        music.addEventListener("loadedmetadata", function() {
            restorePlaybackPosition(music, savedState)
            updatePlayerUi(state, music)
            if (state.musicOn) {
                resumePlayback(music)
            }
        })

        music.addEventListener("timeupdate", function() {
            updatePlayerUi(state, music)
            saveState(state, music)
        })

        window.addEventListener("beforeunload", function() {
            saveState(state, music)
        })
    }

    function syncPlaybackState(state, music) {
        if (state.musicOn) {
            resumePlayback(music)
            return
        }

        pendingUserActivation = false
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

    function activateFromInteraction(state, music) {
        if (!music) {
            return
        }

        if (!state.musicOn) {
            return
        }

        if (pendingUserActivation || music.paused) {
            pendingUserActivation = false
            resumePlayback(music)
        }
    }

    function resumePlayback(music) {
        var playPromise

        music.muted = false
        playPromise = music.play()

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function() {
                pendingUserActivation = true
            })
        }
    }

    function loadSavedState() {
        var rawValue

        try {
            rawValue = window.localStorage.getItem(storageKey)
            return rawValue ? JSON.parse(rawValue) : null
        } catch (error) {
            return null
        }
    }

    function saveState(state, music) {
        var payload

        try {
            payload = {
                musicOn: state.musicOn,
                volume: Number.isFinite(music.volume) ? music.volume : 0.65,
                currentTime: Number.isFinite(music.currentTime) ? music.currentTime : 0
            }
            window.localStorage.setItem(storageKey, JSON.stringify(payload))
        } catch (error) {
        }
    }

    function applySavedState(state, music, savedState) {
        var initialVolume = 0.65

        if (savedState && typeof savedState.musicOn === "boolean") {
            state.musicOn = savedState.musicOn
        }

        if (savedState && Number.isFinite(savedState.volume)) {
            initialVolume = clamp(savedState.volume, 0, 1)
        }

        music.volume = initialVolume
        music.muted = false
        pendingUserActivation = !!state.musicOn
    }

    function restorePlaybackPosition(music, savedState) {
        var duration = Number.isFinite(music.duration) ? music.duration : 0
        var savedTime = savedState && Number.isFinite(savedState.currentTime) ? savedState.currentTime : 0

        if (duration <= 0) {
            return
        }

        music.currentTime = clamp(savedTime, 0, duration)
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

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value))
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
        activateFromInteraction: activateFromInteraction,
        initialize: initialize,
        musicControl: musicControl,
        updatePlayerUi: updatePlayerUi
    }
})()

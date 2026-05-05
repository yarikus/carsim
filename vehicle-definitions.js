"use strict"

window.CarSimVehicleDefinitions = (function() {
    var storageKey = "carsim.vehicleDefinitions"
    var preferredStorageKey = "carsim.preferredVehicleDefinitionId"
    var memoryStorage = {}
    var builtInDefinitions = [
        {
            id: "p379_bobtail",
            name: "Peterbilt 379 Bobtail",
            type: "semi",
            form: "long-nose",
            colors: {
                accent: "rgb(170, 28, 28)",
                body: "rgb(185, 189, 194)",
                trim: "rgb(198, 202, 206)",
                glass: "rgba(163, 188, 206, 0.74)",
                wheel: "rgb(18, 18, 18)",
                shadow: "rgba(0, 0, 0, 0.22)"
            },
            geometry: {
                width: 156,
                height: 58,
                sleeperRatio: 0.22,
                cabRatio: 0.18,
                hoodRatio: 0.26,
                frameRatio: 0.28,
                bodyHeightRatio: 0.72,
                hoodHeightRatio: 0.5,
                sleeperHeightRatio: 0.66,
                dualWheelGapRatio: 0.09
            },
            physics: {
                mass: 7200,
                structuralStrength: 8200,
                wheelBase: 96,
                frontTrack: 44,
                rearTrack: 44,
                hitchOffset: -36
            }
        },
        {
            id: "fleet_daycab",
            name: "Fleet Day Cab",
            type: "semi",
            form: "short-nose",
            colors: {
                accent: "rgb(26, 92, 168)",
                body: "rgb(176, 182, 188)",
                trim: "rgb(205, 209, 214)",
                glass: "rgba(163, 188, 206, 0.76)",
                wheel: "rgb(18, 18, 18)",
                shadow: "rgba(0, 0, 0, 0.2)"
            },
            geometry: {
                width: 146,
                height: 56,
                sleeperRatio: 0.13,
                cabRatio: 0.24,
                hoodRatio: 0.2,
                frameRatio: 0.3,
                bodyHeightRatio: 0.74,
                hoodHeightRatio: 0.48,
                sleeperHeightRatio: 0.58,
                dualWheelGapRatio: 0.085
            },
            physics: {
                mass: 6500,
                structuralStrength: 7000,
                wheelBase: 88,
                frontTrack: 42,
                rearTrack: 42,
                hitchOffset: -31
            }
        },
        {
            id: "cabover_test",
            name: "Cabover Prototype",
            type: "truck",
            form: "cabover",
            colors: {
                accent: "rgb(208, 118, 24)",
                body: "rgb(186, 189, 193)",
                trim: "rgb(214, 216, 220)",
                glass: "rgba(168, 194, 214, 0.78)",
                wheel: "rgb(18, 18, 18)",
                shadow: "rgba(0, 0, 0, 0.2)"
            },
            geometry: {
                width: 138,
                height: 60,
                sleeperRatio: 0.16,
                cabRatio: 0.34,
                hoodRatio: 0.08,
                frameRatio: 0.26,
                bodyHeightRatio: 0.82,
                hoodHeightRatio: 0.42,
                sleeperHeightRatio: 0.76,
                dualWheelGapRatio: 0.08
            },
            physics: {
                mass: 6800,
                structuralStrength: 7600,
                wheelBase: 82,
                frontTrack: 42,
                rearTrack: 42,
                hitchOffset: -28
            }
        }
    ]

    function clone(value) {
        return JSON.parse(JSON.stringify(value))
    }

    function getBuiltInDefinitions() {
        return clone(builtInDefinitions)
    }

    function loadCustomDefinitions() {
        var rawValue

        try {
            rawValue = getStoredValue(storageKey)
            return rawValue ? JSON.parse(rawValue) : []
        } catch (error) {
            return []
        }
    }

    function loadDefinitions() {
        var customDefinitions = loadCustomDefinitions()
        var definitions = getBuiltInDefinitions().concat(Array.isArray(customDefinitions) ? customDefinitions : [])

        if (definitions.length === 0) {
            return getBuiltInDefinitions()
        }

        return definitions.map(function(definition) {
            return normalizeDefinition(definition)
        })
    }

    function getDefinitionById(definitionId) {
        var definitions = loadDefinitions()
        var i

        for (i = 0; i < definitions.length; i++) {
            if (definitions[i].id === definitionId) {
                return clone(definitions[i])
            }
        }

        return clone(builtInDefinitions[0])
    }

    function getPreferredDefinition() {
        var preferredId

        try {
            preferredId = getStoredValue(preferredStorageKey)
        } catch (error) {
            preferredId = null
        }

        return preferredId ? getDefinitionById(preferredId) : clone(builtInDefinitions[0])
    }

    function saveDefinition(definition) {
        var customDefinitions = loadCustomDefinitions()
        var normalizedDefinition = normalizeDefinition(definition)
        var replaced = false
        var i

        for (i = 0; i < customDefinitions.length; i++) {
            if (customDefinitions[i].id === normalizedDefinition.id) {
                customDefinitions[i] = normalizedDefinition
                replaced = true
                break
            }
        }

        if (!replaced) {
            customDefinitions.push(normalizedDefinition)
        }

        try {
            setStoredValue(storageKey, JSON.stringify(customDefinitions))
        } catch (error) {
        }

        setPreferredDefinitionId(normalizedDefinition.id)
        return normalizedDefinition
    }

    function deleteDefinition(definitionId) {
        var customDefinitions = loadCustomDefinitions().filter(function(definition) {
            return definition.id !== definitionId
        })

        try {
            setStoredValue(storageKey, JSON.stringify(customDefinitions))
        } catch (error) {
        }
    }

    function setPreferredDefinitionId(definitionId) {
        try {
            setStoredValue(preferredStorageKey, definitionId)
        } catch (error) {
        }
    }

    function getStoredValue(key) {
        if (!canUseLocalStorage()) {
            return Object.prototype.hasOwnProperty.call(memoryStorage, key) ? memoryStorage[key] : null
        }

        return window.localStorage.getItem(key)
    }

    function setStoredValue(key, value) {
        if (!canUseLocalStorage()) {
            memoryStorage[key] = value
            return
        }

        window.localStorage.setItem(key, value)
    }

    function canUseLocalStorage() {
        return window.location.protocol !== "file:"
    }

    function normalizeDefinition(definition) {
        var normalized = clone(definition)

        normalized.id = normalized.id || createIdFromName(normalized.name || "custom-vehicle")
        normalized.name = normalized.name || "Custom Vehicle"
        normalized.type = normalized.type || "semi"
        normalized.form = normalized.form || "long-nose"
        normalized.colors = normalized.colors || {}
        normalized.geometry = normalized.geometry || {}
        normalized.physics = normalized.physics || {}

        normalized.colors.accent = normalized.colors.accent || "rgb(170, 28, 28)"
        normalized.colors.body = normalized.colors.body || "rgb(185, 189, 194)"
        normalized.colors.trim = normalized.colors.trim || "rgb(198, 202, 206)"
        normalized.colors.glass = normalized.colors.glass || "rgba(163, 188, 206, 0.74)"
        normalized.colors.wheel = normalized.colors.wheel || "rgb(18, 18, 18)"
        normalized.colors.shadow = normalized.colors.shadow || "rgba(0, 0, 0, 0.22)"

        normalized.geometry.width = toNumber(normalized.geometry.width, 156)
        normalized.geometry.height = toNumber(normalized.geometry.height, 58)
        normalized.geometry.sleeperRatio = toNumber(normalized.geometry.sleeperRatio, 0.22)
        normalized.geometry.cabRatio = toNumber(normalized.geometry.cabRatio, 0.18)
        normalized.geometry.hoodRatio = toNumber(normalized.geometry.hoodRatio, 0.26)
        normalized.geometry.frameRatio = toNumber(normalized.geometry.frameRatio, 0.28)
        normalized.geometry.bodyHeightRatio = toNumber(normalized.geometry.bodyHeightRatio, 0.72)
        normalized.geometry.hoodHeightRatio = toNumber(normalized.geometry.hoodHeightRatio, 0.5)
        normalized.geometry.sleeperHeightRatio = toNumber(normalized.geometry.sleeperHeightRatio, 0.66)
        normalized.geometry.dualWheelGapRatio = toNumber(normalized.geometry.dualWheelGapRatio, 0.09)

        normalized.physics.mass = toNumber(normalized.physics.mass, 7200)
        normalized.physics.structuralStrength = toNumber(normalized.physics.structuralStrength, 8200)
        normalized.physics.wheelBase = toNumber(normalized.physics.wheelBase, 96)
        normalized.physics.frontTrack = toNumber(normalized.physics.frontTrack, 44)
        normalized.physics.rearTrack = toNumber(normalized.physics.rearTrack, 44)
        normalized.physics.hitchOffset = toNumber(normalized.physics.hitchOffset, -36)
        return normalized
    }

    function applyDefinitionToVehicleState(vehicle, definition, accentOverride) {
        var normalizedDefinition = normalizeDefinition(definition)

        vehicle.vehicleDefinitionId = normalizedDefinition.id
        vehicle.vehicleDefinition = normalizedDefinition
        vehicle.vehicleName = normalizedDefinition.name
        vehicle.width = normalizedDefinition.geometry.width
        vehicle.height = normalizedDefinition.geometry.height
        vehicle.wheelBase = normalizedDefinition.physics.wheelBase
        vehicle.frontTrack = normalizedDefinition.physics.frontTrack
        vehicle.rearTrack = normalizedDefinition.physics.rearTrack
        vehicle.hitchOffset = normalizedDefinition.physics.hitchOffset
        vehicle.mass = normalizedDefinition.physics.mass
        vehicle.structuralStrength = normalizedDefinition.physics.structuralStrength
        vehicle.accentColor = accentOverride || normalizedDefinition.colors.accent
        return vehicle
    }

    function createIdFromName(name) {
        return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + "-" + Date.now()
    }

    function toNumber(value, fallback) {
        var numericValue = Number(value)
        return Number.isFinite(numericValue) ? numericValue : fallback
    }

    return {
        applyDefinitionToVehicleState: applyDefinitionToVehicleState,
        clone: clone,
        deleteDefinition: deleteDefinition,
        getBuiltInDefinitions: getBuiltInDefinitions,
        isBuiltInDefinitionId: function(definitionId) {
            return builtInDefinitions.some(function(definition) {
                return definition.id === definitionId
            })
        },
        getDefinitionById: getDefinitionById,
        getPreferredDefinition: getPreferredDefinition,
        loadDefinitions: loadDefinitions,
        normalizeDefinition: normalizeDefinition,
        saveDefinition: saveDefinition,
        setPreferredDefinitionId: setPreferredDefinitionId
    }
})()

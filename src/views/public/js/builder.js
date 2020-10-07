function create() {
    const res = {}
    const settings = document.querySelectorAll('[setting]')

    function add(obj, addTo, part) {
        const prop = part || obj.getAttribute('setting')
        if (prop.includes('.')) {
            const split = prop.split('.')
            const piece = split.shift()
            if (!addTo[piece]) addTo[piece] = {}
            add(obj, addTo[piece], split.join('.'))
        } else {
            let setTo
            switch (obj.getAttribute('typed')) {
                case 'boolean':
                    setTo = obj.checked
                    break
                case 'list':
                    setTo = obj.value === 'null' ? null : obj.value
                    break
                case 'tagArray':
                    if (!obj.value) setTo = []
                    else setTo = JSON.parse(obj.value).map(x => x.id || x.value)
                    break
                case 'time':
                    if (obj.value === '') setTo = null
                    else setTo = obj.value * 1000
                    break
                case 'message':
                    if (obj.value === 'Off') setTo = false
                    else if (obj.value === 'Default') setTo = null
                    else setTo = obj.value
                    break
                case 'typeNum':
                    setTo = Number(obj.value)
                    break
                case 'none':
                    if (obj.value === '') setTo = null
                    else setTo = obj.value
                    break
                default:
                    setTo = obj.value
                    break
            }
            addTo[prop] = setTo
        }
    }

    settings.forEach(elm => add(elm, res))
    return res
}

function insert(obj) {
    const res = {}

    function generatePiece(toObj, key, working) {
        const val = key ? toObj[key] : toObj
        if (!val || val.constructor !== Object) {
            res[`${working ? `${working}.` : ''}${key}`] = val
        } else {
            Object.keys(val).forEach(x => generatePiece(val, x, `${working ? `${working}.` : ''}${key}`))
        }
    }

    generatePiece(obj, '')
    for (const key in res) {
        const elm = document.querySelector(`[setting=${key}]`.replace(/\./, '\\.'))
        if (!elm) {
            // console.log(`${key} : ${res[key]}`)
            continue
        }
        switch (elm.getAttribute('typed')) {
            case 'boolean':
                elm.checked = res[key]
                break
            case 'list':
                elm.value = res[key] ? res[key] : 'null'
                break
            case 'tagArray':
                const tag = window.tags.get(key)
                tag.removeAllTags()
                if (tag.settings.whitelist.length > 0) {
                    tag.settings.whitelist.filter(x => res[key].includes(x.id)).forEach(x => tag.addTags(x.value))
                    if (window.addMissingTags) res[key].filter(x => !tag.settings.whitelist.some(b => b.id === x)).forEach(x => tag.addTags(x))
                } else {
                    res[key].forEach(x => tag.addTags(x))
                }
                break
            case 'time':
                elm.value = res[key] / 1000
                break
            case 'message':
                if (res[key] === false) elm.value = 'Off'
                else if (res[key] === null) elm.value = 'Default'
                else elm.value = res[key]
                break
            case 'typeNum':
                elm.value = String(res[key])
                break
            default:
                elm.value = res[key]
                break
        }
        elm.dispatchEvent(new Event('change'))
    }
}

function notify(res, type) {
    if (document.getElementsByClassName('notification display')[0]) return
    const elem = document.getElementById('notification')
    if (!elem) return

    elem.className = `notification display ${type}`

    elem.style.display = 'block'

    elem.innerHTML = res

    setTimeout(() => {
        elem.className = `notification hide`
    }, 3000)
}

function post(location) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', location ? `${window.location.href}${location}` : window.location.href)
    xhr.onload = function () {
        const location = xhr.getResponseHeader('location')
        const response = JSON.parse(xhr.response)
        if (xhr.status === 200 && location) {
            localStorage.setItem('message', response.message)
            return window.location = location
        }
        if (response.error) return notify('Error: ' + response.error)
        insert(response)
        notify(response.message, 'error')
    }
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify(create()))
}

document.onkeydown = function (e) {
    if (e.key === 'Enter' && document.querySelectorAll('[loc]').length < 2 && document.querySelectorAll('[setting]').length > 0) {
        e.preventDefault()
        post()
    }
}
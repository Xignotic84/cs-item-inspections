window.onload = function () {
    Array.from(document.getElementsByTagName('button'))?.forEach(btn => {
        if (btn.getAttribute('exclude')) return

        btn.addEventListener('click', function () {
            post(this.getAttribute('loc'))
        })
    })

    const localItem = localStorage.getItem('message')
    if (localItem) {
        notify(localItem, 'success')
        localStorage.setItem('message', '')
    }
}

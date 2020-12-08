window.onload = function () {

    Array.from(document.getElementsByTagName('button'))?.forEach(btn => {
        btn.addEventListener('click', function () {
            console.log(true)
            post(this.getAttribute('loc'))
        })
    })

    const localItem = localStorage.getItem('message')
    if (localItem) {
        notify(localItem, 'success')
        localStorage.setItem('message', '')
    }
}

window.onload = function () {
    document.getElementById('test').addEventListener('click', function () {
        const elem = document.getElementById('quiz')
        if (elem) {
            const questionLabel = document.createElement('label')
            const titleLabel = document.createElement('label')

            const input = document.createElement('input')
            const title = document.createElement('input')
            setAttributes(input, {setting: 'questions', typed: 'array'})
            setAttributes(title, {setting: 'titles', typed: 'array'})
            questionLabel.append(input)
            titleLabel.append(title)
            elem.append(titleLabel)
            elem.append(questionLabel)


        }
    })
}

function setAttributes(element, attributes) {
    for(const key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
}
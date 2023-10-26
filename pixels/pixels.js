const secondsPerDay = 60 * 60 * 24
const millisecondsPerDay = 1000 * secondsPerDay

const SHORT_TICK_START_RADIUS = 0.405
const LONG_TICK_START_RADIUS = 0.349
const TICK_END_RADIUS = 0.4618
const SECOND_HANDLE_START_RADIUS = -0.06
const SECOND_HANDLE_END_RADIUS = 0.375
const MINUTE_HANDLE_START_RADIUS = -0.06
const MINUTE_HANDLE_END_RADIUS = 0.375
const HOUR_HANDLE_START_RADIUS = -0.06
const HOUR_HANDLE_END_RADIUS = 0.27

class Pixels extends HTMLElement {
    #canvas
    #lastWidth
    #lastHeight

    connectedCallback() {
        this.#canvas = document.createElement('canvas')
        this.#canvas.id = 'face-canvas'
        this.appendChild(this.#canvas)
        this.refreshCanvas()
        requestAnimationFrame(() => this.refreshCanvas())
        window.onresize = () => this.refreshCanvas()
    }

    refreshCanvas() {
        let width = Math.round(this.#canvas.offsetWidth * window.devicePixelRatio)
        let height = Math.round(this.#canvas.offsetHeight * window.devicePixelRatio)
        if (this.#canvas.width !== width || this.#canvas.height !== height) {
            this.#canvas.width = width
            this.#canvas.height = height
        }
        this.draw()
    }

    draw() {
        let context = this.#canvas.getContext('2d')
        let width = this.#canvas.width
        let height = this.#canvas.height
        let sameSize = (width === this.#lastWidth && height === this.#lastHeight)
        this.#lastWidth = width
        this.#lastHeight = height
        const pixelSize = 5
        let w = div(width, pixelSize)
        let h = div(height, pixelSize)
        let centerX = width / 2
        let centerY = height / 2

        if (!sameSize) {
            context.clearRect(0, 0, width, height)
            drawContent()
        }

        function drawContent() {
            let r = 250
            let rawOffset = 0
            for (let i = 0; true; ++i) {
                rawOffset += 2 * i
                let offset = div(rawOffset, 3 * r / 2)
                plot(div(w, 2) + i, div(h, 2) - r + offset)
                plot(div(w, 2) - i, div(h, 2) - r + offset)
                plot(div(w, 2) + i, div(h, 2) + r - offset)
                plot(div(w, 2) - i, div(h, 2) + r - offset)
                plot(div(w, 2) + r - offset, div(h, 2) + i)
                plot(div(w, 2) + r - offset, div(h, 2) - i)
                plot(div(w, 2) - r + offset, div(h, 2) + i)
                plot(div(w, 2) - r + offset, div(h, 2) - i)
                if (i + offset >= r) {
                    break
                }
            }
        }

        function div(a, b) {
            return Math.trunc(a / b)
        }

        function plot(x, y) {
            x = Math.trunc(x)
            y = Math.trunc(y)
            console.log(x, y)
            if (x > 0 && y > 0 && x < w && y < h) {
                context.fillStyle = 'brown'
                context.fillRect(
                    centerX - pixelSize * w / 2 + pixelSize * x,
                    centerY - pixelSize * h / 2 + pixelSize * y,
                    pixelSize,
                    pixelSize)
            }
        }
    }
}

customElements.define("at-yeoman-horizon", Pixels)

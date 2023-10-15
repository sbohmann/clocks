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

class Clock extends HTMLElement {
    #faceCanvas;
    #handsCanvas;
    #animationFrameRequested = false;
    #lastWidth
    #lastHeight

    connectedCallback() {
        this.#faceCanvas = document.createElement('canvas')
        this.#faceCanvas.id = 'face-canvas'
        this.appendChild(this.#faceCanvas)
        this.#handsCanvas = document.createElement('canvas')
        this.#handsCanvas.id = 'hands-canvas'
        this.appendChild(this.#handsCanvas)
        this.requestRefresh()
        window.onresize = () => this.requestRefresh()
    }

    requestRefresh() {
        if (!this.#animationFrameRequested) {
            requestAnimationFrame(() => {
                this.refreshCanvas()
            })
        }
    }

    refreshCanvas() {
        this.#animationFrameRequested = false
        let width = this.#handsCanvas.offsetWidth * window.devicePixelRatio
        let height = this.#handsCanvas.offsetHeight * window.devicePixelRatio
        if (this.#handsCanvas.width !== width || this.#handsCanvas.height !== height) {
            this.#handsCanvas.width = width
            this.#handsCanvas.height = height
        }
        if (this.#faceCanvas.width !== width || this.#faceCanvas.height !== height) {
            this.#faceCanvas.width = width
            this.#faceCanvas.height = height
        }
        this.drawClock()
        this.requestRefresh()
    }

    drawClock() {
        let faceContext = this.#faceCanvas.getContext('2d')
        let handsContext = this.#handsCanvas.getContext('2d')
        let width = this.#handsCanvas.width
        let height = this.#handsCanvas.height
        let sameSize = (width === this.#lastWidth && height === this.#lastHeight)
        this.#lastWidth = width
        this.#lastHeight = height
        let size = Math.min(width, height)
        let centerX = width / 2
        let centerY = height / 2

        let currentDate = new Date()
        let localTimestamp = currentDate.getTime() -
            currentDate.getTimezoneOffset() * 60_000
        let millisecondOfDay = localTimestamp % millisecondsPerDay

        if (!sameSize) {
            drawFace()
        }

        handsContext.clearRect(0, 0, width, height)
        drawHourHand()
        drawMinuteHand()
        drawSecondHand()

        function drawFace() {
            faceContext.clearRect(0, 0, width, height)
            faceContext.strokeStyle = 'black'
            faceContext.lineWidth = size / 2700 * 2
            faceContext.fillStyle = 'white'
            faceContext.beginPath()
            faceContext.ellipse(width / 2, height / 2, size / 2 * 0.98, size / 2 * 0.98, 0, 0, 360)
            faceContext.stroke()
            faceContext.fill()
            let numberOfTicks = 5 * 12;
            for (let n = 0; n < numberOfTicks; ++n) {
                let tickIsLong = (n % 5 === 0)
                faceContext.strokeStyle = tickIsLong
                    ? '#DBBA73'
                    : '#1A1266'
                faceContext.lineWidth = tickIsLong
                    ? size / 2700 * 42
                    : size / 2700 * 27
                drawRadialLineForPartOfCircle(
                    n / numberOfTicks,
                    tickIsLong
                        ? LONG_TICK_START_RADIUS
                        : SHORT_TICK_START_RADIUS,
                    TICK_END_RADIUS,
                    faceContext)
            }
        }

        function drawHourHand() {
            let hourOfHalfDay = millisecondOfDay / 1000 / 60 / 60 / 12
            handsContext.strokeStyle = '#1A1266'
            handsContext.lineWidth = size / 2700 * 27
            drawRadialLineForPartOfCircle(
                hourOfHalfDay % 12,
                HOUR_HANDLE_START_RADIUS,
                HOUR_HANDLE_END_RADIUS)
        }

        function drawMinuteHand() {
            let minuteOfHour = millisecondOfDay / 1000 / 60 / 60
            handsContext.strokeStyle = '#1A1266'
            handsContext.lineWidth = size / 2700 * 27
            drawRadialLineForPartOfCircle(
                minuteOfHour % 60,
                MINUTE_HANDLE_START_RADIUS,
                MINUTE_HANDLE_END_RADIUS)
        }

        function drawSecondHand() {
            let secondOfMinute = millisecondOfDay / 1000 / 60
            handsContext.strokeStyle = '#D30449'
            handsContext.lineWidth = size / 2700 * 15
            drawRadialLineForPartOfCircle(
                secondOfMinute % 60,
                SECOND_HANDLE_START_RADIUS,
                SECOND_HANDLE_END_RADIUS)
        }

        function drawRadialLineForPartOfCircle(partOfCircle, startRadius, endRadius, context = handsContext) {
            let angle = angleForPartOfCircle(partOfCircle)
            // normalized direction
            let [nx, ny] = directionForAngle(angle)
            let startDistance = startRadius * size
            let endDistance = endRadius * size
            context.beginPath()
            context.moveTo(centerX + nx * startDistance, centerY + ny * startDistance)
            context.lineTo(centerX + nx * endDistance, centerY + ny * endDistance)
            context.stroke()
        }

        function angleForPartOfCircle(part) {
            return part * 2 * Math.PI
        }

        function directionForAngle(angle) {
            return [Math.sin(angle), -Math.cos(angle)]
        }
    }
}

customElements.define("at-yeoman-clock", Clock)

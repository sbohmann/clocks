const secondsPerDay = 60 * 60 * 24
const millisecondsPerDay = 1000 * secondsPerDay

const SHORT_TICK_START_RADIUS = 0.42
const LONG_TICK_START_RADIUS = 0.39
const TICK_END_RADIUS = 0.45
const SECOND_HANDLE_START_RADIUS = -0.07
const SECOND_HANDLE_END_RADIUS = 0.37
const MINUTE_HANDLE_START_RADIUS = -0.07
const MINUTE_HANDLE_END_RADIUS = 0.37
const HOUR_HANDLE_START_RADIUS = -0.07
const HOUR_HANDLE_END_RADIUS = 0.27

class Clock extends HTMLElement {
    #canvas;

    connectedCallback() {
        this.#canvas = document.createElement('canvas')
        this.#canvas.onresize = (...size) => {
            console.log(size)
        }
        // this.#canvas.width = size * window.devicePixelRatio
        // this.#canvas.height = size * window.devicePixelRatio
        this.appendChild(this.#canvas)

        // this.refreshCanvas()
        window.onresize = () => this.refreshCanvas()
        setInterval(() => this.refreshCanvas(), 10) // TODO adapting interval
    }

    refreshCanvas() {
        let width = this.#canvas.offsetWidth * window.devicePixelRatio;
        let height = this.#canvas.offsetHeight * window.devicePixelRatio;
        if (this.#canvas.width !== width || this.#canvas.height !== height) {
            this.#canvas.width = width
            this.#canvas.height = height
        }
        this.drawClock()
    }

    drawClock() {
        let context = this.#canvas.getContext('2d')
        // TODO hires displays
        let width = this.#canvas.width
        let height = this.#canvas.height
        let size = Math.min(width, height)
        let centerX = width / 2
        let centerY = height / 2

        let millisecondTimestamp = Date.now()
        let millisecondOfDay = millisecondTimestamp % millisecondsPerDay

        context.clearRect(0, 0, width, height)
        drawRim()
        drawHourHand()
        drawMinuteHand()
        drawSecondHand()

        function drawRim() {
            context.strokeStyle = 'black'
            context.lineWidth = window.devicePixelRatio
            let numberOfTicks = 5 * 12;
            for (let n = 0; n < numberOfTicks; ++n) {
                let tickIsLong = (n % 5 === 0)
                drawRadialLineForPartOfCircle(
                    n / numberOfTicks,
                    tickIsLong
                        ? LONG_TICK_START_RADIUS
                        : SHORT_TICK_START_RADIUS,
                    TICK_END_RADIUS)
            }
        }

        function drawHourHand() {
            let hourOfHalfDay = millisecondOfDay / 1000 / 60 / 60 / 12
            context.strokeStyle = 'black'
            context.lineWidth = 3 * window.devicePixelRatio
            drawRadialLineForPartOfCircle(
                hourOfHalfDay % 12,
                HOUR_HANDLE_START_RADIUS,
                HOUR_HANDLE_END_RADIUS)
        }

        function drawMinuteHand() {
            let minuteOfHour = millisecondOfDay / 1000 / 60 / 60
            context.strokeStyle = 'black'
            context.lineWidth = 3 * window.devicePixelRatio
            drawRadialLineForPartOfCircle(
                minuteOfHour % 60,
                MINUTE_HANDLE_START_RADIUS,
                MINUTE_HANDLE_END_RADIUS)
        }

        function drawSecondHand() {
            let secondOfMinute = millisecondOfDay / 1000 / 60
            context.strokeStyle = 'red'
            context.lineWidth = window.devicePixelRatio
            drawRadialLineForPartOfCircle(
                secondOfMinute % 60,
                SECOND_HANDLE_START_RADIUS,
                SECOND_HANDLE_END_RADIUS)
        }

        function drawRadialLineForPartOfCircle(partOfCircle, startRadius, endRadius) {
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
            return [
                Math.sin(angle),
                -Math.cos(angle)
            ]
        }
    }
}

customElements.define(
    "at-yeoman-clock",
    Clock)

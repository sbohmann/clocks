const secondsPerDay = 60 * 60 * 24
const millisecondsPerDay = 1000 * secondsPerDay

const SHORT_TICK_START_RADIUS = 0.405
const LONG_TICK_START_RADIUS = 0.349
const TICK_END_RADIUS = 0.4618
const SECOND_HANDLE_START_RADIUS = -0.07
const SECOND_HANDLE_END_RADIUS = 0.375
const MINUTE_HANDLE_START_RADIUS = -0.07
const MINUTE_HANDLE_END_RADIUS = 0.375
const HOUR_HANDLE_START_RADIUS = -0.07
const HOUR_HANDLE_END_RADIUS = 0.27

class Clock extends HTMLElement {
    #canvas;
    #animationFrameRequested = false;

    connectedCallback() {
        this.#canvas = document.createElement('canvas')
        this.appendChild(this.#canvas)
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
        let width = this.#canvas.offsetWidth * window.devicePixelRatio
        let height = this.#canvas.offsetHeight * window.devicePixelRatio
        if (this.#canvas.width !== width || this.#canvas.height !== height) {
            this.#canvas.width = width
            this.#canvas.height = height
        }
        this.drawClock()
        this.requestRefresh()
    }

    drawClock() {
        let context = this.#canvas.getContext('2d')
        let width = this.#canvas.width
        let height = this.#canvas.height
        let size = Math.min(width, height)
        let centerX = width / 2
        let centerY = height / 2

        let currentDate = new Date()
        let localTimestamp = currentDate.getTime() -
            currentDate.getTimezoneOffset() * 60_000
        let millisecondOfDay = localTimestamp % millisecondsPerDay

        context.clearRect(0, 0, width, height)
        drawRim()
        drawHourHand()
        drawMinuteHand()
        drawSecondHand()

        function drawRim() {
            context.strokeStyle = 'black'
            context.lineWidth = size / 2700 * 2
            context.fillStyle = 'white'
            context.beginPath()
            context.ellipse(width / 2, height / 2, size / 2 * 0.98, size / 2 * 0.98, 0, 0, 360)
            context.stroke()
            context.fill()
            let numberOfTicks = 5 * 12;
            for (let n = 0; n < numberOfTicks; ++n) {
                let tickIsLong = (n % 5 === 0)
                context.strokeStyle = tickIsLong
                    ? '#DBBA73'
                    : '#1A1266'
                context.lineWidth = tickIsLong
                    ? size / 2700 * 42
                    : size / 2700 * 25
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
            context.strokeStyle = '#1A1266'
            context.lineWidth = size / 2700 * 25
            drawRadialLineForPartOfCircle(
                hourOfHalfDay % 12,
                HOUR_HANDLE_START_RADIUS,
                HOUR_HANDLE_END_RADIUS)
        }

        function drawMinuteHand() {
            let minuteOfHour = millisecondOfDay / 1000 / 60 / 60
            context.strokeStyle = '#1A1266'
            context.lineWidth = size / 2700 * 25
            drawRadialLineForPartOfCircle(
                minuteOfHour % 60,
                MINUTE_HANDLE_START_RADIUS,
                MINUTE_HANDLE_END_RADIUS)
        }

        function drawSecondHand() {
            let secondOfMinute = millisecondOfDay / 1000 / 60
            context.strokeStyle = '#D30449'
            context.lineWidth = size / 2700 * 15
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
            return [Math.sin(angle), -Math.cos(angle)]
        }
    }
}

customElements.define("at-yeoman-clock", Clock)

enum Curve {
    Linear,
    Sin,
    Circle,
    Cos
}


function progress(value: number, from: number, to: number, curve: Curve = Curve.Cos) {
    let progr = (value - from) / (to - from)
    switch (curve) {
        case Curve.Linear:
            return progr
        case Curve.Sin:
            return Math.sin(progr * Math.PI / 2)
        case Curve.Circle:
            return Math.sqrt(1 - (1 - progr) ** 2)
        case Curve.Cos:
            return -Math.cos(progr * Math.PI) / 2 + 1/2
    }
}

function progressPinValue(pin: AnalogPin, from: number, to: number, curve: Curve = Curve.Cos, interval: number = 1000, steps: number = 10 ) {
    for ( let i = 0; i < steps; i++) {
        //pin.analogWrite( from + progress(i, 0, steps, curve) * (to - from) )
        pins.analogWritePin(pin, from + progress(i, 0, steps-1, curve) * (to - from) )
        serial.writeValue("x", from + progress(i, 0, steps-1, curve) * (to - from))
        basic.pause(interval / steps)
    }
}

enum Foot {
    LeftFoot,
    RightFoot
}

enum MoveArt {
    MoveForward,
    MoveBackward,
    Stop,
    Relax
}

const FootPin = {
    LeftFoot: {
        PWM: AnalogPin.P1,
        IN1: DigitalPin.P12,
        IN2: DigitalPin.P13
    },
    RightFoot: {
        PWM: AnalogPin.P2,
        IN1: DigitalPin.P15,
        IN2: DigitalPin.P16
    }
}

const TrigPin = DigitalPin.P20
const EchoPin = DigitalPin.P19
const MinDist = 10
const MaxDist = 50

let doDiscover = false
function discover() {
    while ( doDiscover ) {
        let dist
        music.tonePlayable(Note.C, 100)
        do {
            dist = sonar.ping(TrigPin, EchoPin, PingUnit.Centimeters)
            console.logValue("dist", dist)
            if (dist == 0)
                dist = MaxDist
            led.plotBarGraph(MaxDist - dist, MaxDist)
            if (dist < MinDist) {
                music.play(
                    music.builtInPlayableMelody(Melodies.Funk),
                    music.PlaybackMode.InBackground
                )
                glideBackward()
                basic.pause(1000)
                turnLeft()
                basic.pause(1000)
                stopRoboter()
                basic.pause(1000)
            }
        } while (dist < MinDist && doDiscover);
        if ( doDiscover) {
            leftStepForward()
            pause(200)
        }
        if (doDiscover) {
            rightStepForward()
            pause(200)
        }
    }
}

function moveRoboter(foot: Foot, art: MoveArt) {

}

let power = 800

function leftStepForward() {
    pins.digitalWritePin(FootPin.LeftFoot.IN1, 0)
    pins.digitalWritePin(FootPin.LeftFoot.IN2, 1)
    pins.analogWritePin(FootPin.LeftFoot.PWM, power)
    pause(200)
    pins.digitalWritePin(FootPin.LeftFoot.IN2, 0)
}

function rightStepForward() {
    pins.digitalWritePin(FootPin.RightFoot.IN1, 0)
    pins.digitalWritePin(FootPin.RightFoot.IN2, 1)
    pins.analogWritePin(FootPin.RightFoot.PWM, power)
    pause(200)
    pins.digitalWritePin(FootPin.RightFoot.IN2, 0)
}

function leftStepBackward() {
    pins.digitalWritePin(FootPin.LeftFoot.IN1, 1)
    pins.digitalWritePin(FootPin.LeftFoot.IN2, 0)
    pins.analogWritePin(FootPin.LeftFoot.PWM, power)
    pause(200)
    pins.digitalWritePin(FootPin.LeftFoot.IN1, 0)
}

function rightStepBackward() {
    pins.digitalWritePin(FootPin.RightFoot.IN1, 1)
    pins.digitalWritePin(FootPin.RightFoot.IN2, 0)
    pins.analogWritePin(FootPin.RightFoot.PWM, power)
    pause(200)
    pins.digitalWritePin(FootPin.RightFoot.IN1, 0)
}

function glideForward() {
    pins.digitalWritePin(FootPin.LeftFoot.IN1, 0)
    pins.digitalWritePin(FootPin.LeftFoot.IN2, 1)
    pins.digitalWritePin(FootPin.RightFoot.IN1, 0)
    pins.digitalWritePin(FootPin.RightFoot.IN2, 1)
    pins.analogWritePin(FootPin.LeftFoot.PWM, power)
    pins.analogWritePin(FootPin.RightFoot.PWM, power)
}

function glideBackward() {
    pins.digitalWritePin(FootPin.LeftFoot.IN1, 1)
    pins.digitalWritePin(FootPin.LeftFoot.IN2, 0)
    pins.digitalWritePin(FootPin.RightFoot.IN1, 1)
    pins.digitalWritePin(FootPin.RightFoot.IN2, 0)
    pins.analogWritePin(FootPin.LeftFoot.PWM, power)
    pins.analogWritePin(FootPin.RightFoot.PWM, power)
}

function turnLeft() {
    pins.digitalWritePin(FootPin.LeftFoot.IN1, 1)
    pins.digitalWritePin(FootPin.LeftFoot.IN2, 0)
    pins.digitalWritePin(FootPin.RightFoot.IN1, 0)
    pins.digitalWritePin(FootPin.RightFoot.IN2, 1)
    pins.analogWritePin(FootPin.LeftFoot.PWM, power * 0.75)
    pins.analogWritePin(FootPin.RightFoot.PWM, power)
}

function turnRight() {
    pins.digitalWritePin(FootPin.LeftFoot.IN1, 0)
    pins.digitalWritePin(FootPin.LeftFoot.IN2, 1)
    pins.digitalWritePin(FootPin.RightFoot.IN1, 1)
    pins.digitalWritePin(FootPin.RightFoot.IN2, 0)
    pins.analogWritePin(FootPin.LeftFoot.PWM, power)
    pins.analogWritePin(FootPin.RightFoot.PWM, power * 0.75)
}

function stopRoboter() {
    pins.analogWritePin(FootPin.LeftFoot.PWM, 0)
    pins.analogWritePin(FootPin.RightFoot.PWM, 0)
    pins.digitalWritePin(FootPin.LeftFoot.IN1, 0)
    pins.digitalWritePin(FootPin.RightFoot.IN1, 0)
    pins.digitalWritePin(FootPin.LeftFoot.IN2, 0)
    pins.digitalWritePin(FootPin.RightFoot.IN2, 0)
}

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    doDiscover = false
})

input.onLogoEvent(TouchButtonEvent.LongPressed, function () {
    doDiscover = true
    discover()
})

input.onButtonPressed(Button.A, function () {
    turnLeft()
})

input.onButtonPressed(Button.B, function () {
    turnRight()
})

pins.digitalWritePin(DigitalPin.P14, 1)

basic.showString("R")
led.setBrightness(32)

led.enable(false)
bluetooth.startUartService()

console.log("Started")
music.setBuiltInSpeakerEnabled(false)
music.play(
    music.builtInPlayableMelody(Melodies.Ode),
    music.PlaybackMode.InBackground
)


bluetooth.onBluetoothConnected(function(){
    console.log("BT Connected")
})

bluetooth.onUartDataReceived("#", function () {
    let data = bluetooth.uartReadUntil("#")
    console.logValue("BT", data)
    switch(data) {
        case "s":
            stopRoboter()
            doDiscover = false
            break
        case "f":
            doDiscover = false
            glideForward()
            break
        case "b":
            doDiscover = false
            glideBackward()
            break
        case "l":
            doDiscover = false

            turnLeft()
            break
        case "r":
            doDiscover = false

            turnRight()
            break
        case "Z":
            doDiscover = false
            break
        case "A":
            doDiscover = true
            discover()
            break
    }
})


basic.forever(function () {
    pins.digitalWritePin(DigitalPin.P9, 1)
    pins.digitalWritePin(DigitalPin.P10, 1)
    basic.pause(1000)
    pins.digitalWritePin(DigitalPin.P9, 0)
    pins.digitalWritePin(DigitalPin.P10, 0)
    basic.pause(10000)
    pins.digitalWritePin(DigitalPin.P9, 1)
    pins.digitalWritePin(DigitalPin.P10, 1)
    basic.pause(500)
    pins.digitalWritePin(DigitalPin.P9, 0)
    pins.digitalWritePin(DigitalPin.P10, 0)
    basic.pause(10000)
    pins.digitalWritePin(DigitalPin.P9, 0)
    pins.digitalWritePin(DigitalPin.P10, 1)
    basic.pause(500)
    pins.digitalWritePin(DigitalPin.P9, 1)
    pins.digitalWritePin(DigitalPin.P10, 0)
    basic.pause(500)
})

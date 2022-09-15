# SPDX-FileCopyrightText: 2021 ladyada for Adafruit Industries
# SPDX-License-Identifier: MIT

# This example uses an Adafruit Stepper and DC Motor FeatherWing to run a DC Motor.
#   https://www.adafruit.com/product/2927

import time

from board import SCL, SDA
import busio

# Import the PCA9685 module. Available in the bundle and here:
#   https://github.com/adafruit/Adafruit_CircuitPython_PCA9685
from adafruit_pca9685 import PCA9685

from adafruit_motor import motor

i2c = busio.I2C(SCL, SDA)

# Create a simple PCA9685 class instance for the Motor FeatherWing's default address.
pca = PCA9685(i2c, address=0x40)
pca.frequency = 60

def createMotor(ch1, ch2):
    
    m = motor.DCMotor(pca.channels[ch1], pca.channels[ch2])
    m.decay_mode = (
        motor.FAST_DECAY
    )  # Set motor to active braking mode to improve performance
    
    return m

motor1 = createMotor(0,1)
motor2 = createMotor(2,3)
motor3 = createMotor(4,5)
motor4 = createMotor(6,7)

print("Forwards slow")
motor4.throttle = 0.5
motor3.throttle = 0.5
motor2.throttle = 0.5
motor1.throttle = 0.5
print("throttle:", motor4.throttle)
time.sleep(1)

print("Forwards")
motor4.throttle = 1
motor3.throttle = 1
motor2.throttle = 1
motor1.throttle = 1
print("throttle:", motor4.throttle)
time.sleep(1)

print("Backwards")
motor4.throttle = -1
motor3.throttle = -1
motor2.throttle = -1
motor1.throttle = -1
print("throttle:", motor4.throttle)
time.sleep(1)

print("Backwards slow")
motor4.throttle = -0.5
motor3.throttle = -0.5
motor2.throttle = -0.5
motor1.throttle = -0.5
print("throttle:", motor4.throttle)
time.sleep(1)

print("Stop")
motor4.throttle = 0
motor3.throttle = 0
motor2.throttle = 0
motor1.throttle = 0
print("throttle:", motor4.throttle)
time.sleep(1)

print("Spin freely")
motor4.throttle = None
motor3.throttle = None
motor2.throttle = None
motor1.throttle = None
print("throttle:", motor4.throttle)

pca.deinit()
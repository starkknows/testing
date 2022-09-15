import time
from board import SCL, SDA
import busio

# Import the PCA9685 module. Available in the bundle and here:
#   https://github.com/adafruit/Adafruit_CircuitPython_PCA9685
from adafruit_pca9685 import PCA9685
from adafruit_motor import motor

class Motor:
    def __init__(self):
        self.i2c = busio.I2C(SCL, SDA)
        self.pca = PCA9685(self.i2c, address=0x40)
        self.pca.frequency = 50
        self.initMotors()

    def createMotor(self,ch1, ch2):
        m = motor.DCMotor(self.pca.channels[ch1], self.pca.channels[ch2])
        m.decay_mode = (
            motor.FAST_DECAY
        )  # Set motor to active braking mode to improve performance
        
        return m

    def initMotors(self):
        self.rearRight = self.createMotor(0,1)
        self.frontRight = self.createMotor(2,3)
        self.rearLeft = self.createMotor(4,5)
        self.frontLeft = self.createMotor(6,7)
    
    #motor speed range limit
    def setRange(self,i):
        if i > 1:
            return 1
        elif i < -1:
            return 0
        return self.correctRange(i)
    
    #flip this to change forward and backward
    def correctRange(self,i):
        return i
        
    def driveForward(self,speed):
        self.setAllMotors(speed,speed,speed,speed)
    def driveBackward(self,speed):
        self.setAllMotors(-speed,-speed,-speed,-speed)
    def rotateLeft(self,speed):
        self.setAllMotors(-speed,speed,-speed,speed)
    def rotateRight(self,speed):
        self.setAllMotors(speed,-speed,speed,-speed)
        
    def strafeRight(self,speed):
        self.setAllMotors(speed,-speed,-speed,speed)
    def strafeLeft(self,speed):
        self.setAllMotors(-speed,speed,speed,-speed)
        
    def stop(self):
        self.setAllMotors(0,0,0,0)
        
    def setAllMotors(self,fL,fR,rL,rR):
        self.frontLeft.throttle = self.setRange(fL)
        self.frontRight.throttle = self.setRange(fR)
        self.rearLeft.throttle = self.setRange(rL)
        self.rearRight.throttle = self.setRange(rR)
        
    def testFrontLeft(self):
        self.setAllMotors(1,0,0,0)
        time.sleep(1)
        self.stop()
    def testFrontRight(self):
        self.setAllMotors(0,1,0,0)
        time.sleep(1)
        self.stop()
    def testRearLeft(self):
        self.setAllMotors(0,0,1,0)
        time.sleep(1)
        self.stop()
    def testRearRight(self):
        self.setAllMotors(0,0,0,1)
        time.sleep(1)
        self.stop()
    def testAllMotors(self):
        self.testFrontLeft()
        self.testFrontRight()
        self.testRearLeft()
        self.testRearRight()
    def testDriveSystem(self,speed=1,delay=1):
        self.driveForward(speed)
        time.sleep(delay)
        self.driveBackward(speed)
        time.sleep(delay)
        self.rotateLeft(speed)
        time.sleep(delay)
        self.rotateRight(speed)
        time.sleep(delay)
        self.strafeLeft(speed)
        time.sleep(delay)
        self.strafeRight(speed)
        time.sleep(delay)
        self.stop()

    def __del__(self):
        self.pca.deinit()





import machine

# Create I2C object
i2c = machine.I2C(0, scl=machine.Pin(1), sda=machine.Pin(0), freq=400000)

# Print out any addresses found
devices = i2c.scan()

if devices:
    for d in devices:
        print(hex(d))
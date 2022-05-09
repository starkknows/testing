# def findSmallest():
#     smallest = 2520
#     done = False
#     while not done:
#         maxN = 0
#         for i in range(11,20):
#             this = smallest % i
#             maxN = max(maxN, this)
#         smallest += maxN
#         if (maxN == 0):
#             done = True
        
#     return smallest

# x = findSmallest()
# print(x)

def testNumber(num):
    for i in range(11, 20):
        if (num/i) % 1 != 0:
            return False
    return True


def getSmallest():
    x = 20
    while x < 2000000000:
        result = testNumber(x)
        if result == True:
            return x
        x+=1
    return x

x = getSmallest()
print(x)
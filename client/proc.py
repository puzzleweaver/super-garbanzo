tin = open("dict.txt", "r")
tout = open("myfile.txt","w") 

words = tin.readlines()

for word in words:
    wor = word[:-1]
    if wor.isalpha() and wor.islower():
        tout.write(word)
tout.close() #to change file access modes 
tin.close()

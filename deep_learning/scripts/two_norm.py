'''
This script calculates mean of two norms of the dataset's various stems. It is useful to calculate the parameter alpha used in loss functions
VocalLoss and InstrumentLoss. 

'''


import os
import numpy as np

PATH = "./Spectrograms/train"
VOCAL_ONLY = False

two_norms = {}

if VOCAL_ONLY:
 stems = ['vocals', 'accompaniment']
else:
   stems = ['vocals', 'drum', 'other', 'guitar']

for each in stems:
   two_norms[each] = 0

def calculate_2norm(data):
    return np.linalg.norm(data)


for i in os.listdir(PATH):
    print(f"Calculating for file {i}.npz... \n")
    data = np.load(os.path.join(PATH, i))
    
    
    for each in stems:
       two_norms[each] += calculate_2norm(data[each])
       print(f"{each} done. \n")
    print(f"\n\n\n")
   
    
    

for each in stems:
   print(f"\n{each}'s mean of two norm: {two_norms[each]/len(os.listdir(PATH))}")



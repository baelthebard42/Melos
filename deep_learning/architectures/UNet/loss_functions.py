import torch.nn as nn
import torch

def L1( input, target):

    if (input.shape != target.shape):
        raise ValueError(f"Shapes of target and predicted target don't match \n\n Should be: {target.shape} but is {input.shape}")
    
    
    return torch.mean(torch.abs(input-target))

class VocalLoss(nn.Module):

    def __init__(self, alpha):
        super(VocalLoss, self).__init__()
        self.alpha = alpha

    def forward(self, vocal, cVocal, acc, cAcc):
        loss = self.alpha*L1(vocal, cVocal) + (1-self.alpha)*L1(acc, cAcc)
        return loss
    

class InstrumentLoss(nn.Module):

    def __init__(self, alpha1, alpha2, alpha3, alpha4):
        super(InstrumentLoss, self).__init__()
        
        if (alpha1+alpha2+alpha3+alpha4 != 1):
            raise ValueError("Sum of the alpha parameters must be 1")
        
        self.alpha1=alpha1
        self.alpha2=alpha2
        self.alpha3=alpha3
        self.alpha4=alpha4
         
    def forward(self, vocal, cVocal, drum, cDrum, guitar, cGuitar, other, cOther):
        loss = self.alpha1*L1(vocal, cVocal) + self.alpha2*L1(drum, cDrum) + self.alpha3*L1(guitar, cGuitar) + self.alpha4*L1(other, cOther)
        return loss





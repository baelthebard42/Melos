import torch
import torch.nn as nn
import torchvision.transforms.functional as TF
import numpy as np

class DoubleConv(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size=3):
        super(DoubleConv, self).__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_channels=in_channels, out_channels=out_channels, kernel_size=kernel_size, stride=1, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(in_channels=out_channels, out_channels=out_channels, kernel_size=kernel_size, stride=1, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        return self.conv(x)

class DoubleDeConv(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size=3):
        super(DoubleDeConv, self).__init__()
        self.DoubleDeConv = nn.Sequential(
            nn.ConvTranspose2d(in_channels=in_channels, out_channels=out_channels, kernel_size=kernel_size, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(in_channels=out_channels, out_channels=out_channels, kernel_size=kernel_size, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )
    
    def forward(self, x):
        return self.DoubleDeConv(x)

class UpSampling(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size=5, stride=2, padding=2):
        super(UpSampling, self).__init__()
        self.upsample= nn.Sequential(
            nn.ConvTranspose2d(in_channels=in_channels, out_channels=out_channels, kernel_size=kernel_size, stride=stride, padding=padding ),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Dropout2d(p=0.4)
        )
    
    def forward(self, x):
        return self.upsample(x)
        

class SpectrogramUNet(nn.Module):

    def __init__(self, in_channel = 1, out_channel = 4, features = [32, 64, 128, 256, 512]):
      super().__init__()

      self.downward = nn.ModuleList() # contractive path
      self.upward = nn.ModuleList() # expansive path
      self.pool = nn.MaxPool2d(kernel_size=2, stride=2)
      
      
      # adding the components of contractive path
      for feature in features:
        self.downward.append(DoubleConv(in_channels=in_channel, out_channels=feature))
        in_channel = feature
      
      # adding the components of expansive path
      for feature in reversed(features[:-1]):
          self.upward.append(UpSampling(in_channels=in_channel, out_channels=feature))
          self.upward.append(DoubleDeConv(in_channels=feature*2, out_channels=feature))
          in_channel=feature
    
      self.final_conv = nn.Conv2d(in_channels=in_channel, out_channels=out_channel, kernel_size=1)
    

    def forward(self, x):

        concat_list = []
        
        # propagation along the contractive path
        for i, down in enumerate(self.downward):
            x = down(x)

            if i < len(self.downward)-1:
             concat_list.append(x)
             x = self.pool(x)
        
        concat_list = concat_list[::-1]
        
        # propagation along expansive path
        for i in range(0, len(self.upward), 2):
            x = self.upward[i](x)
            req_concat_value = concat_list[i//2]

            if x.shape != req_concat_value.shape:
                x = TF.resize(x, size= req_concat_value.shape[2:])
            
            concattted = torch.concat((x, req_concat_value), dim=1) # along channel dimension
            x = self.upward[i+1](concattted)
        
        return self.final_conv(x)






        
      

          

       
       
       
       
    
      

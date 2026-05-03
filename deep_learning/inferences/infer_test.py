"""
This section is used to make inference (separate sources) using the trained models. It assumes that the input data is in an npz file with mix, accompaniment, drum, bass
and other components. Each of these components should contain data of shape (1, 1025, 173) ---> (channel, freq_bins, time frames)
"""


import torch, torchaudio
from torchaudio.transforms import GriffinLim
import numpy as np
import os
from architectures.UNet.UNet import SpectrogramUNet
import torch.nn.functional as F
from ..utils import spec_to_audio, infer



SAMPLING_RATE = 44100
BASE_DIR = "./Spectrograms"

 
if __name__=="__main__":
 
 model = SpectrogramUNet(in_channel=1, out_channel=2)
 model.load_state_dict(torch.load('./models/vocal-accompaniment-separation/voicemodelp2.pth', weights_only=True))
 model.eval()
 
 spectrogram = np.load(BASE_DIR+"/test/810.npz")
 mix = torch.from_numpy(spectrogram['mix'])


 actual_vocal_part = torch.from_numpy(spectrogram['vocals'])
 actual_acc_part = torch.from_numpy(spectrogram['accompaniment'])
 phase = torch.from_numpy(spectrogram['phase_mix'])
 spec_to_audio(spectrogram=mix, phase=phase, name="mix")
 spec_to_audio(spectrogram=actual_vocal_part, phase=phase, name="vocal")
 spec_to_audio(spectrogram=actual_acc_part, phase=phase, name="acc")

 inferred_vocal, inferred_acc = infer(model=model, mix_spectrogram=mix.unsqueeze(0))
 spec_to_audio(1.5*abs(inferred_vocal), phase=phase, name="ivocal")
 spec_to_audio(abs(inferred_acc), phase=phase, name="iacc")

 

 





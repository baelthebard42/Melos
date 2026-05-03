import torch, torchaudio
import os
from deep_learning.architectures.UNet.UNet import SpectrogramUNet




def to_mono(signal):
  if signal.shape[0]>1:
    signal = torch.mean(signal, dim=0, keepdim=True)
  return signal



def audio_to_spectrogram(waveform, window_size, hop_length):
  waveform = to_mono(waveform)
  to_spectrogram  = torchaudio.transforms.Spectrogram(n_fft=window_size, hop_length=hop_length, power=None)
  stft = to_spectrogram(waveform)
  magnitude = torch.abs(stft)
  phase = torch.angle(stft)
  return magnitude, phase



def cut_out_waveform(waveform, sample_step):
  if waveform.shape[1]<sample_step:
    return None
  if waveform.shape[1] % sample_step != 0:
    waveform = waveform[:, :int(waveform.shape[1]/sample_step)*sample_step]
  result = []
  for i in range(0, waveform.shape[1], sample_step):
    tukra = waveform[:, i:i+sample_step]
    result.append(tukra)
  return result


def infer(model, mix_spectrogram, out_channels=2):
   # print(mix_spectrogram.shape)
    with torch.no_grad():
        output = model(mix_spectrogram).squeeze(0)
      #  print(output.shape)
        rv = [output[i, :, :] for i in range(out_channels)]
       # print(len(rv))
        return rv




def spec_to_audio(spectrogram, phase,  n_fft, hop_length, save=False, name="out" ):
 
 stft_comp = spectrogram*torch.exp(1j*phase)
 #print(spectrogram.dim())
 if (spectrogram.dim()==2):
  spectrogram=spectrogram.unsqueeze(0)
 audio = torch.istft(
        stft_comp, 
        n_fft=n_fft, 
        hop_length=hop_length, 
        normalized=False, 
        return_complex=False,
        
    )
 audio = audio.to(dtype=torch.float32)

 if save:
   torchaudio.save(f"./{name}.wav", audio,  sample_rate=44100)
 return audio





def process_audio(waveform, model_path, samp_rate, samples_step, window_size, hop_length, mode="vocal", save=False, output_dir="./output"):
    os.makedirs(output_dir, exist_ok=True)
    print(waveform[0].shape)
    if mode == "vocal":
        out_channels = 2
        sources = ["vocals", "accompaniment"]
    elif mode == "multi":
        out_channels = 4
        sources = ["vocals", "drums", "guitar", "other"]
    else:
        raise ValueError("Invalid mode. Choose either 'vocal' or 'multi'.")

    model = SpectrogramUNet(in_channel=1, out_channel=out_channels)
    model.load_state_dict(torch.load(model_path, map_location=torch.device("cpu")))
    model.eval()

    segments = cut_out_waveform(waveform, samples_step)
    if not segments:
        print("No valid segments to process.")
        return

    reconstructed_sources = {source: [] for source in sources}

    for idx, segment in enumerate(segments):
        print(f"Processing segment {idx + 1}/{len(segments)}..")
        magnitude, phase = audio_to_spectrogram(segment, window_size, hop_length)
        magnitude = magnitude.unsqueeze(0)  

        inferred_sources = infer(model, mix_spectrogram=magnitude, out_channels=out_channels)
        for i, source in enumerate(sources):
            reconstructed_sources[source].append((abs(inferred_sources[i]), phase))
    
    separated_list = []
    
    for name, parts in reconstructed_sources.items():
        combined_audio = []
        for magnitude, phase in parts:
            audio_segment = spec_to_audio(magnitude, phase, n_fft=window_size, hop_length=hop_length)
            combined_audio.append(audio_segment)

        final_audio = torch.cat(combined_audio, dim=-1)

        if save:
            torchaudio.save(os.path.join(output_dir, f"{name}.wav"), to_mono(final_audio), samp_rate)
            
        
        separated_list.append(final_audio)
    
    return separated_list

        
    

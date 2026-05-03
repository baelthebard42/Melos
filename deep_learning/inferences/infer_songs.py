import math, torchaudio
from deep_learning.utils import process_audio
from argparse import ArgumentParser
import os
from datetime import datetime


def create_new_dir(inference_type:str, output_dir:str, root_path: str) -> str:
    """
    Creates a new directory inside root_path using current timestamp
    and returns the full path.
    """

    dir_name =  output_dir + "__" + inference_type
    full_path = os.path.join(root_path, dir_name)
    os.makedirs(full_path, exist_ok=True)
    return full_path



def parse_args(args=None):
    argparser = ArgumentParser('Perform inferences on songs')
    argparser.add_argument("--infer_type", dest="infer_type", type=str, choices=["vocal", "multi"], required=True, help="choose inference type, vocal or multi")
    argparser.add_argument("--audio-path", dest="audio_path", type=str, required=True, help="path of the audio to separate")
    argparser.add_argument("--output-path", dest="output_path", type=str, required=True, help="saving directory")
    return argparser.parse_args(args=args)



if __name__ == "__main__":

    args = parse_args()
    saving_dir = create_new_dir(inference_type=args.infer_type, output_dir =args.output_path, root_path=".")
    waveform, sr =torchaudio.load(args.audio_path)
    process_audio(
        waveform=waveform,
        model_path="deep_learning/models/multisepmodelp1.pth" if args.infer_type=="multi" else "deep_learning/models/voicemodelp2.pth",
        mode=args.infer_type,
        save=True,
        output_dir=saving_dir,
        hop_length=512,
        window_size=2048,
        samp_rate=sr,
        samples_step=88200
    )

    print(f"Output files saved inside {saving_dir}")

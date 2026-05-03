🎵 Melos — Music Source Separation

> Separate any song into its individual components — vocals, drums, guitar, and more — powered by deep learning.

---

## Table of Contents

- [Introduction](#introduction)
- [Sample Outputs](#sample-outputs)
  - [Basanta — Vocal & Accompaniment Separation](#basanta--vocal--accompaniment-separation)
  - [Riptide — Multi-Instrument Separation](#riptide--multi-instrument-separation)
- [Usage](#usage)
  - [CLI Inference](#1-cli-inference)
  - [FastAPI Web Server](#2-fastapi-web-server)
  - [Web UI](#3-web-ui)
- [Model, Dataset & Training](#model-dataset--training)
- [Performance](#performance)
- [Citation & License](#citation--license)

---

## Introduction

**Melos** is a tool that takes any song and breaks it apart into its individual pieces — the singing voice, the guitar, the drums, and everything else. 

Specifically, Melos can perform two types of splits:

- **Vocal / Accompaniment Split** — Separates the singer's voice from all the background instruments combined.
- **Multi-Instrument Split** — Goes deeper, splitting the song into four separate tracks: vocals, drums, guitar, and "other" (everything else like bass, synths, etc.).

**How does it work (simply put)?** Music is made up of sound waves. Melos converts those waves into a kind of "visual fingerprint" of the song (called a spectrogram — basically a picture of all the frequencies in the music over time). A deep learning model then looks at that picture and learns to draw separate pictures for each instrument. Those pictures are then converted back into actual audio. The result is each instrument, isolated and playable on its own.

**What can you use this for?**
- 🎤 Karaoke — remove the vocals from any song
- 🎸 Practice — isolate just the guitar or drums to learn along
- 🎛️ Remixing — extract stems for music production
- 🔬 Research — study individual elements of a recording

---

## Sample Outputs

### Basanta — Vocal & Accompaniment Separation

This section demonstrates the **Vocal/Accompaniment model** applied to *Basanta* by JPTRockerz.

| Track | Description | Player |
|---|---|---|
| 🎵 Original Song| Full mixed |[basantaa.mp3](https://github.com/user-attachments/files/27319284/basantaa.mp3)|
| 🎤 Vocals | Isolated singing voice |[vocals.wav](https://github.com/user-attachments/files/27319288/vocals.wav)|
| 🎼 Accompaniment | All instruments, no vocals |[accompaniment.wav](https://github.com/user-attachments/files/27319301/accompaniment.wav) |




---

### Riptide — Multi-Instrument Separation

This section demonstrates the **Multi-Instrument model** applied to *Riptide* by Vance Joy.

| Track | Description | Player |
|---|---|---|
| 🎵 Original Song| Full mixed |[riptide.mp3](https://github.com/user-attachments/files/27319317/riptide.mp3)|
| 🎤 Vocals | Isolated vocals |[vocals.wav](https://github.com/user-attachments/files/27319319/vocals.wav) |
| 🥁 Drums | Isolated drum track |[drums.wav](https://github.com/user-attachments/files/27319323/drums.wav) |
| 🎸 Guitar | Isolated guitar track | [guitar.wav](https://github.com/user-attachments/files/27319322/guitar.wav) |
| 🎹 Other | Remaining instruments (bass, synths, etc.) |[other.wav](https://github.com/user-attachments/files/27319320/other.wav)|


---

## Usage

### 1. CLI Inference

The simplest way to run Melos — directly from your terminal.

**Step 1: Clone the repository**

```bash
git clone https://github.com/aarbid29/Melos.git
cd Melos
```

**Step 2: Set up a virtual environment and install dependencies**

```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

**Step 3: Ensure model weights are present**

Make sure the trained model weight files are placed inside the `deep_learning/models/` directory:

```
deep_learning/
└── models/
    ├── voicemodelp2.pth       ← Vocal/Accompaniment model
    └── multisepmodelp1.pth    ← Multi-Instrument model
```

**Step 4: Run inference**

```bash
py -m deep_learning.inferences.infer_songs \
  --infer_type <multi or vocal> \
  --audio-path <path to your audio file> \
  --output-path <directory to save output files>
```

**Examples:**

```bash
# Vocal/Accompaniment separation
py -m deep_learning.inferences.infer_songs --infer_type vocal --audio-path songs/riptide.mp3 --output-path results/riptide/

# Multi-instrument separation
py -m deep_learning.inferences.infer_songs --infer_type multi --audio-path songs/basanta.mp3 --output-path results/basanta/
```

The separated `.wav` files will be saved to the specified output directory.

| `--infer_type` | Output Files |
|---|---|
| `vocal` | `vocals.wav`, `accompaniment.wav` |
| `multi` | `vocals.wav`, `drums.wav`, `guitar.wav`, `other.wav` |

---

### 2. FastAPI Web Server

Melos exposes a REST API via FastAPI, allowing you to integrate source separation into your own apps or workflows.

**Start the server:**

```bash
py -m deep_learning.server.server
```

This starts a Uvicorn server, by default at `http://localhost:8000`.

---

#### Endpoints

---

##### `POST /separate/{mode}`

Separates an uploaded audio file into its components and returns them as a ZIP file.

| Parameter | Type | Values | Description |
|---|---|---|---|
| `mode` (path) | `string` | `vocal`, `multi` | Separation mode |
| `file` (form-data) | `UploadFile` | Any audio file | The song to separate |

**`vocal` mode** — Returns a ZIP containing:
- `vocals.wav`
- `accompaniment.wav`

**`multi` mode** — Returns a ZIP containing:
- `vocals.wav`
- `drums.wav`
- `guitar.wav`
- `other.wav`

**Example (curl):**
```bash
curl -X POST "http://localhost:8000/separate/multi" \
  -F "file=@/path/to/song.mp3" \
  --output separated.zip
```

---

##### `POST /karaoke-split/{mode}`

Separates an audio file and returns a **single mixed-down WAV** with specific instruments removed or isolated — perfect for karaoke-style use.

| `mode` | What you get |
|---|---|
| `vocals-removed` | Everything except vocals (background only) |
| `drums-removed` | Everything except drums |
| `guitar-removed` | Everything except guitar |
| `guitar-only` | Only the guitar track |

| Parameter | Type | Description |
|---|---|---|
| `mode` (path) | `string` | One of the modes above |
| `track` (form-data) | `UploadFile` | The song to process |

**Returns:** A single `karaoke_track.wav` file (audio/wav).

**Example (curl):**
```bash
curl -X POST "http://localhost:8000/karaoke-split/vocals-removed" \
  -F "track=@/path/to/song.mp3" \
  --output karaoke_track.wav
```

---

##### `POST /karaoke-merge`

Merges two audio tracks into one — useful for combining your recorded vocals with a karaoke backing track.

| Parameter | Type | Description |
|---|---|---|
| `track1` (form-data) | `UploadFile` | First audio track (e.g., instrumental) |
| `track2` (form-data) | `UploadFile` | Second audio track (e.g., your vocals) |

**Returns:** A single merged `karaoke_output.wav` file (audio/wav). Both tracks are trimmed to the shorter length before mixing.

**Example (curl):**
```bash
curl -X POST "http://localhost:8000/karaoke-merge" \
  -F "track1=@instrumental.wav" \
  -F "track2=@my_vocals.wav" \
  --output karaoke_output.wav
```

---

### 3. Web UI

Melos comes with a web-based interface built with **Next.js**.

> ⚠️ **The Python FastAPI server must be running** before you start the UI, as the interface communicates with it to perform inference.

```bash
# Navigate to the app directory
cd app

# Install dependencies
npm i

# Start the development server
npm run dev
```

The UI will be available at `http://localhost:3000`.

> **Note:** The UI currently has some known issues and is being actively improved in future updates.

**UI Screenshots:**

| Main Interface | Separation Results |
|---|---|

<img width="1208" height="724" alt="1" src="https://github.com/user-attachments/assets/01b4203f-7747-4b77-ba22-0e3643117ddd" />
<img width="1209" height="750" alt="2" src="https://github.com/user-attachments/assets/d30ecd45-2314-4444-8fe1-dd1c73b9af7b" />



| Karaoke Interface | Karaoke Recording |
|---|---|
<img width="1209" height="750" alt="3" src="https://github.com/user-attachments/assets/41732b42-55f9-4c2f-bce1-6d2f7050b016" />
<img width="1209" height="750" alt="4" src="https://github.com/user-attachments/assets/9800b458-aaf3-4867-babe-935b816fd229" />



---

## Model, Dataset & Training

### Architecture

Melos uses a **U-Net** architecture — a neural network originally designed for medical image segmentation, here repurposed to work on audio spectrograms.

The model takes a spectrogram (a 2D visual representation of a song's frequencies over time) as input, and outputs separate spectrograms for each instrument. These predicted spectrograms are then converted back to audio using the original phase information from the input.

**Model structure:**

| Component | Details |
|---|---|
| Input | Mono spectrogram — shape `(1, 1025, 173)` representing a 2-second audio segment |
| Encoder | 5-level contracting path using Conv2D + MaxPool layers; feature map sizes: `[32, 64, 128, 256, 512]` |
| Decoder | 5-level expanding path using transposed convolutions + upsampling |
| Skip Connections | Encoder feature maps are concatenated to corresponding decoder layers to preserve fine detail |
| Output (vocal model) | 2 channels: `vocals`, `accompaniment` |
| Output (multi model) | 4 channels: `vocals`, `drums`, `guitar`, `other` |

### Dataset

- **Base dataset:** [DSD100](https://sigsep.github.io/datasets/dsd100.html) — 150 songs with pre-separated stems
- **Additional data:** 100 songs scraped and curated manually, bringing the total to **250 songs**
- **Total data points:** 24,359 (each = a 2-second spectrogram segment)
  - Training: 22,201 samples
  - Testing/Validation: 2,158 samples
- **Sampling rate:** 44,100 Hz
- **STFT parameters:** Window size 2048, Hop length 512, 1025 frequency bins, 173 time frames per segment

### Training

| Setting | Vocal/Acc Model | Multi-Instrument Model |
|---|---|---|
| Output channels | 2 | 4 |
| Epochs | 50 | 50 |
| Batch size | 8 | 8 |
| Learning rate | 1×10⁻⁴ | 1×10⁻⁴ |
| Weight decay | 1×10⁻⁶ | 1×10⁻⁶ |
| GPU used | NVIDIA RTX 3060H | NVIDIA RTX 4090 |
| Training time | ~2 days | ~5.5 hours |

A **custom weighted L1 loss** function was used to account for the loudness imbalance between instruments — ensuring quieter instruments like guitar are learned as well as louder ones like drums.

### Model Weights

✅ **The trained model weights are open and free to use.** Place the `.pth` files in `deep_learning/models/` as described in the [Usage](#usage) section.

---

## Performance

Model quality is measured using **Signal-to-Distortion Ratio (SDR, in dB)** — a standard metric for source separation. Higher values are better; scores above **5 dB** are generally considered good.

### Vocal / Accompaniment Model

| Model | Vocal SDR (dB) | Accompaniment SDR (dB) |
|---|---|---|
| **Melos (Ours)** | **4.61** | **7.41** |
| MMDenseLSTM (2019) | 4.30 | 7.30 |
| Wave-U-Net (2018) | 4.50 | 7.20 |
| DeepConvSep (2017) | 3.80 | 6.50 |
| Spleeter 2-stem (2019) | 5.20 | 10.80 |

### Multi-Instrument Model

| Model | Vocals (dB) | Drums (dB) | Guitar (dB) | Other (dB) |
|---|---|---|---|---|
| **Melos (Ours)** | **6.81** | **7.23** | **7.80** | **8.06** |
| MMDenseLSTM (2019) | 6.00 | 6.50 | 6.70 | 6.80 |
| Open-Unmix / UMX (2019) | 6.30 | 6.80 | 7.10 | 7.30 |
| Demucs v1 (2019) | 7.00 | 7.50 | 8.00 | 8.50 |

Melos performs competitively against established models from 2017–2019, and exceeds several of them on multi-instrument separation — especially considering it was trained on a relatively modest dataset of 250 songs.

---

## Citation & License

The U-Net architecture concept for music source separation is inspired by:

> Jansson, A., et al. *"Singing Voice Separation with Deep U-Net Convolutional Networks."* ISMIR, 2017.  
> And related work in the **Spectrograms Channels UNet** paper used as a methodological reference.

**This implementation, training pipeline, dataset curation, and deployment were entirely developed by:**

- Aarbid Bhattarai (PUL078BCT002)  
- Anjal Adhikari (PUL078BCT012)  

*Department of Electronics & Computer Engineering, Pulchowk Campus, IOE, Tribhuvan University.*

---

This project is **open source**. You are free to use, modify, build upon, and redistribute this code and the model weights for research, education, or personal projects. Contributions, pull requests, and feedback are welcome!

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from utils import process_audio
from io import BytesIO
import torchaudio, torch
import math, os
import uvicorn
import zipfile

MODEL_PATH_BASE = "./models" 

VOICE_MODEL = 'voicemodelp2.pth'
INSTRUMENT_MODEL = 'multisepmodelp1.pth'


SAMPLING_RATE = 44100
WINDOW_SIZE = 2048
HOP_LENGTH = 512
FREQ_BINS = 1025
T_FRAMES = 173

CUT_DURATION = math.ceil((HOP_LENGTH*(T_FRAMES-1))/SAMPLING_RATE)
SAMPLES_STEP = CUT_DURATION*SAMPLING_RATE


server = FastAPI()

order_mapping = {
   'vocal': {
       0 : 'vocals',
       1 : 'accompaniment'
   },

   'multi':{
      0:'vocals',
      1:'drums',
      2:'guitar',
      3:'other'
   }
   
}

KARAOKE_MODES = {
   'vocals-removed': [1, 2, 3],
   'drums-removed':[ 2, 3],
   'guitar-removed':[ 1, 3],
   'guitar-only':[2]

}



@server.post("/separate/{mode}")
async def separateV(mode: str,file: UploadFile = File(...) ):

    if mode not in [i for i in order_mapping.keys()] :
       return JSONResponse(
            status_code=400,
            content={"error": "mode should be vocal or multi"}
        )

    model_path = os.path.join(MODEL_PATH_BASE, VOICE_MODEL if mode=="vocal" else INSTRUMENT_MODEL)

    try:
        
        audio_bytes = await file.read()
        waveform, sr = torchaudio.load(BytesIO(audio_bytes))

        separated = process_audio(waveform, model_path, SAMPLING_RATE, SAMPLES_STEP
                                  , WINDOW_SIZE, HOP_LENGTH, mode=mode)
        
        zip_buffer = BytesIO()

        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
         for idx, audio in enumerate(separated):
            audio_buffer = BytesIO()
            torchaudio.save(audio_buffer, audio, SAMPLING_RATE, format="wav")
            audio_buffer.seek(0)

            #response[vocal_only_mapping[idx]] = StreamingResponse(audio_buffer, media_type="audio/wav")
            print(f"doing for {order_mapping[mode][idx]}")
            zip_file.writestr(f"{order_mapping[mode][idx]}.wav", audio_buffer.read())
        
        zip_buffer.seek(0)
        return StreamingResponse(zip_buffer, media_type="application/zip")
    
    except Exception as e:
        return {"error": f"Error : {str(e)}"}
    
@server.post("/karaoke-split/{mode}")
async def karaoke_split(mode: str, track:UploadFile=File(...)):
   
    if mode not in KARAOKE_MODES:
      return JSONResponse(status_code=400, content={"error": f"Mode should be one of:  {', '.join(KARAOKE_MODES.keys())}"})   
   
    model_path = os.path.join(MODEL_PATH_BASE, INSTRUMENT_MODEL)

   
      
    audio_bytes = await track.read()
    waveform, sr = torchaudio.load(BytesIO(audio_bytes))
    separated = process_audio(waveform, model_path, SAMPLING_RATE, SAMPLES_STEP
                                , WINDOW_SIZE, HOP_LENGTH, mode='multi')
    waveform_list = []

    for idx, each in enumerate(separated):
        buffer = BytesIO()
        torchaudio.save(buffer, each, SAMPLING_RATE, format="wav")
        buffer.seek(0)
        waveform, sr= torchaudio.load(buffer)
        waveform_list.append(waveform)

    
  
    for idx, i in enumerate(KARAOKE_MODES[mode]):
        final_result = waveform_list[i] if idx==0 else final_result+waveform_list[i]

    torchaudio.save("./resulting_track.wav", final_result, sr, format="wav")
    final_out_buffer = BytesIO()
    torchaudio.save(final_out_buffer, final_result, sr, format="wav")
    final_out_buffer.seek(0)

    return StreamingResponse(final_out_buffer, media_type="audio/wav", headers={
        "Content-Disposition": 'attachment; filename="karaoke_track.wav"'
    })
   
@server.post("/karaoke-merge")
async def karaoke_merge( track1:UploadFile=File(...), track2:UploadFile=File(...)):
   
   audio_bytes1 = await track1.read()
   audio_bytes2 = await track2.read()
   waveform1, sr = torchaudio.load(BytesIO(audio_bytes1))
   waveform2, sr = torchaudio.load(BytesIO(audio_bytes2))

   min_len = min(waveform1.shape[1], waveform2.shape[1])
   waveform1 = waveform1[:, :min_len]
   waveform2 = waveform2[:, :min_len]

   merged_waveform = waveform1+waveform2

   out_buffer = BytesIO()
   torchaudio.save(out_buffer, merged_waveform, sr, format="wav")
   out_buffer.seek(0)
   return StreamingResponse(out_buffer, media_type="audio/wav", headers={
        "Content-Disposition": 'attachment; filename="karaoke_output.wav"'
    })
 
   

         
         

      

if __name__ == "__main__":
    uvicorn.run(server, host="0.0.0.0", port=8000)
        


        

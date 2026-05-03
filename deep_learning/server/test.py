import requests
import zipfile
import os
from io import BytesIO

url = "http://localhost:8000/separate/multi"
file_path = "./inferences/scale.wav"
output_dir = "separated_output"


with open(file_path, "rb") as f:
    files = {"file": ("scale.wav", f, "audio/wav")}
    response = requests.post(url, files=files)


if response.status_code == 200:
    os.makedirs(output_dir, exist_ok=True)

  
    zip_buffer = BytesIO(response.content)
    with zipfile.ZipFile(zip_buffer, "r") as zip_ref:
        zip_ref.extractall(output_dir)

    print(f" Extracted separated audio files to '{output_dir}'")
    print("Files:", os.listdir(output_dir))
else:
    try:
        print(f" Error {response.status_code}: {response.json()}")
    except Exception:
        print(f"Error {response.status_code}: {response.text}")

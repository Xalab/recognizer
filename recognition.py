from vosk import Model, KaldiRecognizer
import argparse
import queue
import sys
import sounddevice as sd
import requests
import os
from datetime import datetime
import json


model_path = current_dir = os.path.dirname(sys.executable) + "\\vosk-model-ru-0.42"
url = 'http://localhost:6000/newRec'
q = queue.Queue()
def int_or_str(text):
    """Helper function for argument parsing."""
    try:
        return int(text)
    except ValueError:
        return text


def callback(indata, frames, time, status):
    """This is called (from a separate thread) for each audio block."""
    if status:
        print(status, file=sys.stderr)
    q.put(bytes(indata))


parser = argparse.ArgumentParser(add_help=False)

parser.add_argument("-l", "--list-devices", action="store_true", help="show list of audio devices and exit")

args, remaining = parser.parse_known_args()

if args.list_devices:
    print(sd.query_devices())
    parser.exit(0)

parser = argparse.ArgumentParser(
    description=__doc__,
    formatter_class=argparse.RawDescriptionHelpFormatter,
    parents=[parser])

parser.add_argument("-f", "--filename", type=str, metavar="FILENAME", help="audio file to store recording to")
parser.add_argument("-d", "--device", type=int_or_str, help="input device (numeric ID or substring)")
parser.add_argument("-r", "--samplerate", type=int, help="sampling rate")
parser.add_argument("-m", "--model", type=str, help="language model; paste path here")
parser.add_argument("-o", "--output", type=str, metavar="OUTPUT", help="path to save recognized text")


args = parser.parse_args(remaining)

def send_to_server(text, file_path=None):
    data = {'text': text.strip()}
    headers = {'Content-Type': 'application/json; charset=utf-8'}
    try:
        requests.post(url, json=data, headers=headers)
    except Exception as e:
        print("Connection error, cannot send message to bot")
    if file_path:
        timestamp = datetime.now().strftime('%H:%M:%S %d.%m.%Y')
        result_text = json.loads(text)['text']
        if result_text != "":
            formatted_text = f"{timestamp} --> {result_text.strip()}"
            save_to_file(formatted_text, file_path)

def save_to_file(text, file_path):
    with open(file_path, "a", encoding="utf-8") as f:
        f.write(text + "\n")

samplerate = sd.query_devices(args.device, "input")["default_samplerate"]
blocksize = int(samplerate/10)

try:
    if args.samplerate is None:
        device_info = sd.query_devices(args.device, "input")
        # soundfile expects an int, sounddevice provides a float:
        args.samplerate = int(device_info["default_samplerate"])

    if args.model:
        model = Model(args.model)
    else:
        print("Error. No model")
        model = Model("C:\\sas")

    if args.filename:
        dump_fn = open(args.filename, "wb")
    else:
        dump_fn = None

    with sd.RawInputStream(samplerate=args.samplerate, blocksize = 8000, device=args.device, dtype="int16", channels=1, callback=callback):
        print("#" * 80)
        print("Press Ctrl+C to stop the recording")
        print("#" * 80)

        rec = KaldiRecognizer(model, args.samplerate)
        while True:
            data = q.get()
            if rec.AcceptWaveform(data):
                text = rec.Result()
                send_to_server(text, args.output)
                print(text)
            else:
                partial_result = rec.PartialResult()
                print(partial_result)
            if dump_fn is not None:
                dump_fn.write(data)

except KeyboardInterrupt:
    print("\nDone")
    parser.exit(0)
except Exception as e:
    parser.exit(type(e).__name__ + ": " + str(e))


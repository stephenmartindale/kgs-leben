/// <reference path="ControllerBase.ts" />

namespace Controllers {
    export abstract class SoundController extends ControllerBase<Application> {
        protected _codec: Utils.AudioCodecInfo;

        constructor(parent: Application, codec: Utils.AudioCodecInfo) {
            super(parent);
            this._codec = codec;
            $sounds = this;
        }

        protected bufferSounds(): void {
            this.bufferSound('stone');
            this.bufferSound('pass');
        }

        protected abstract bufferSound(name: string): void;

        public abstract play(name: string): void;

        public static initialise(application: Application): SoundController {
            if (!Utils.isFunction(Audio)) return new NullSoundController(application, "audio objects not supported");

            let audio: HTMLAudioElement = new Audio();
            if (!audio.canPlayType) return new NullSoundController(application, "unable to test audio codecs");

            let codec: Utils.AudioCodecInfo;
            for (let j = 0; j < Utils.AudioCodecs.length; ++j) {
                let support: string = audio.canPlayType(Utils.AudioCodecs[j].type);

                if (support == 'maybe') {
                    codec = Utils.AudioCodecs[j];
                }
                else if (support == 'probably') {
                    codec = Utils.AudioCodecs[j];
                    break;
                }
            }

            if (codec == null) return new NullSoundController(application, "no supported audio formats");

            let context: AudioContext = WebAudioSoundController.createAudioContext();
            if (context) return new WebAudioSoundController(application, codec, context);
            else return new ElementSoundController(application, codec);
        }

        protected getSoundURI(name: string): string {
            return "sounds/" + name + this._codec.extension;
        }
    }

    class WebAudioSoundController extends SoundController {
        private _context: AudioContext;
        private _soundBank: { [name: string]: AudioBuffer };

        constructor(parent: Application, codec: Utils.AudioCodecInfo, context: AudioContext) {
            super(parent, codec);
            Utils.log(Utils.LogSeverity.Debug, "Sound Controller: Web Audio API (" + codec.name + ")");

            this._context = context;
            this._soundBank = {};
            this.bufferSounds();
        }

        public static createAudioContext(): AudioContext {
            if ((<any>window).AudioContext) return new AudioContext();
            else if ((<any>window).webkitAudioContext) return new webkitAudioContext();
            else return null;
        }

        protected bufferSound(name: string) {
            this._soundBank[name] = null;

            var xhr = new XMLHttpRequest();
            xhr.open('GET', this.getSoundURI(name), true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = (event: Event) => this.onRequestLoad(name, xhr, event);
            xhr.onerror = (event: ErrorEvent) => this.onRequestError(name, xhr);
            xhr.send();
        }

        private onRequestLoad(name: string, xhr: XMLHttpRequest, event: Event) {
            if (xhr.status == 200)
                this._context.decodeAudioData(xhr.response, (decodedData: AudioBuffer) => this.onAudioDecoded(name, decodedData), (error: DOMException) => this.onAudioDecodeError(name, error));
            else
                this.onRequestError(name, xhr);
        }

        private onRequestError(name: string, xhr: XMLHttpRequest) {
            delete this._soundBank[name];
            Utils.log(Utils.LogSeverity.Error, "Sound Controller: failed to GET sound '" + name + "' (" + xhr.statusText + ")");
        }

        private onAudioDecoded(name: string, decodedData: AudioBuffer) {
            this._soundBank[name] = decodedData;
        }

        private onAudioDecodeError(name: string, error: DOMException) {
            delete this._soundBank[name];
            Utils.log(Utils.LogSeverity.Error, "Sound Controller: failed to decode sound '" + name + "'");
        }

        public play(name: string) {
            let buffer: AudioBuffer = this._soundBank[name];
            if (buffer === undefined) Utils.log(Utils.LogSeverity.Warning, "Sound Controller: '" + name + "' not found in sound bank");
            else if (buffer == null) Utils.log(Utils.LogSeverity.Warning, "Sound Controller: '" + name + "' not buffered");
            else {
                let source = this._context.createBufferSource();
                source.buffer = buffer;
                source.connect(this._context.destination);
                source.start(0);
            }
        }
    }

    class ElementSoundController extends SoundController {
        private _soundBank: { [name: string]: HTMLAudioElement };

        constructor(parent: Application, codec: Utils.AudioCodecInfo) {
            super(parent, codec);
            Utils.log(Utils.LogSeverity.Debug, "Sound Controller: HTML 5 Audio (" + codec.name + ")");

            this._soundBank = {};
            this.bufferSounds();
        }

        protected bufferSound(name: string) {
            this._soundBank[name] = new Audio(this.getSoundURI(name));
        }

        public play(name: string) {
            if (name in this._soundBank) {
                this._soundBank[name].play();
            }
            else Utils.log(Utils.LogSeverity.Warning, "Sound Controller: '" + name + "' not found in sound bank");
        }
    }

    class NullSoundController extends SoundController {
        constructor(parent: Application, warning: string) {
            super(parent, null);
            Utils.log(Utils.LogSeverity.Warning, "Sound Controller not initialised: " + warning);
        }

        protected bufferSound(name: string): void {};
        public play(name: string): void { }
    }
}

declare var $sounds: Controllers.SoundController;

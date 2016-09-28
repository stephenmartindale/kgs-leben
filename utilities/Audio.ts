namespace Utils {
    export interface AudioCodecInfo {
        name: string;
        type: string;
        extension: string;
    }

    export const AudioCodecs: AudioCodecInfo[] = [
        {
            name: 'Ogg Vorbis Audio',
            type: 'audio/ogg; codecs="vorbis"',
            extension: '.ogg'
        },
        {
            name: 'MP4 AAC Audio',
            type: 'audio/mp4; codecs="mp4a.40.5"',
            extension: '.m4a'
        }
    ];
}

namespace KGS {
    export namespace Constants {
        export const DefaultKomi: number = 6.5;
        export const HandicapKomi: number = 0.5;

        export const DefaultMainTime: number = 1800;
        export const DefaultJapaneseByoYomi: number = 30;
        export const DefaultJapanesePeriods: number = 5;
        export const DefaultCanadianByoYomi: number = 600;
        export const DefaultCanadianStones: number = 25;

        export const AvatarURIPrefix: string = "http://goserver.gokgs.com/avatars/";
        export const AvatarURISuffix: string = ".jpg";

        export namespace TimeSystems {
            export const None: string = "none";
            export const Absolute: string = "absolute";
            export const Japanese: string = "byo_yomi";
            export const Canadian: string = "canadian";
        }
    }
}

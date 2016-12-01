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

        export const RatingShodan: number = 3000;
        export const Rating9Dan: number = 3899;
        export const RatingNull: number = 0x7fff;

        export namespace TimeSystems {
            export const None: string = "none";
            export const Absolute: string = "absolute";
            export const Japanese: string = "byo_yomi";
            export const Canadian: string = "canadian";
        }

        export namespace RegularExpressions {
            export const Name: RegExp = /[A-Za-z][A-Za-z0-9]{0,9}/;
            export const Rank: RegExp = /((\d+)\s*([kKdD])[yYuUaAnN]*)?\s*(\??)/;
        }
    }
}

namespace KGS {
    export namespace SGF {
        export interface Property {
            name: string
        }
        export interface TextProperty extends Property {
            text: string
        }
        export interface ColourProperty extends Property {
            color: "white" | "black"
        }
        export interface LocationProperty extends KGS.Location, Property {
        }
        export interface LocationLocationProperty extends Property {
            loc: KGS.Coordinates,
            loc2: KGS.Coordinates
        }
        export interface IntProperty extends Property {
            int: number
        }
        export interface FloatProperty extends Property {
            float: number
        }

        export const _RULES: string = "RULES";
        export interface RULES extends Property, KGS.GameRules {}

        export const _GAMENAME: string = "GAMENAME";
        export interface GAMENAME extends TextProperty {}
        export const _DATE: string = "DATE";
        export interface DATE extends TextProperty {}
        export const _COPYRIGHT: string = "COPYRIGHT";
        export interface COPYRIGHT extends TextProperty {}
        export const _GAMECOMMENT: string = "GAMECOMMENT";
        export interface GAMECOMMENT extends TextProperty {}
        export const _EVENT: string = "EVENT";
        export interface EVENT extends TextProperty {}
        export const _ROUND: string = "ROUND";
        export interface ROUND extends TextProperty {}
        export const _PLACE: string = "PLACE";
        export interface PLACE extends TextProperty {}
        export const _ANNOTATOR: string = "ANNOTATOR";
        export interface ANNOTATOR extends TextProperty {}
        export const _SOURCE: string = "SOURCE";
        export interface SOURCE extends TextProperty {}
        export const _TRANSCRIBER: string = "TRANSCRIBER";
        export interface TRANSCRIBER extends TextProperty {}
        export const _COMMENT: string = "COMMENT";
        export interface COMMENT extends TextProperty {}
        export const _RESULT: string = "RESULT";
        export interface RESULT extends TextProperty {}
        export const _UNKNOWN: string = "UNKNOWN";
        export interface UNKNOWN extends TextProperty {}

        export const _SETWHOSEMOVE: string = "SETWHOSEMOVE";
        export interface SETWHOSEMOVE extends ColourProperty {}
        export const _MOVENUMBER: string = "MOVENUMBER";
        export interface MOVENUMBER extends IntProperty {}
        export const _MOVENAME: string = "MOVENAME";
        export interface MOVENAME extends TextProperty {}

        export const _CIRCLE: string = "CIRCLE";
        export interface CIRCLE extends LocationProperty {}
        export const _TRIANGLE: string = "TRIANGLE";
        export interface TRIANGLE extends LocationProperty {}
        export const _SQUARE: string = "SQUARE";
        export interface SQUARE extends LocationProperty {}
        export const _CROSS: string = "CROSS";
        export interface CROSS extends LocationProperty {}
        export const _DEAD: string = "DEAD";
        export interface DEAD extends LocationProperty {}
        export const _PHANTOMCLEAR: string = "PHANTOMCLEAR";
        export interface PHANTOMCLEAR extends LocationProperty {}
        export const _ARROW: string = "ARROW";
        export interface ARROW extends LocationLocationProperty {}
        export const _LINE: string = "LINE";
        export interface LINE extends LocationLocationProperty {}

        export const _LABEL: string = "LABEL";
        export interface LABEL extends LocationProperty, TextProperty {}

        export const _PLAYERNAME: string = "PLAYERNAME";
        export interface PLAYERNAME extends ColourProperty, TextProperty {}
        export const _PLAYERTEAM: string = "PLAYERTEAM";
        export interface PLAYERTEAM extends ColourProperty, TextProperty {}

        export const _MOVE: string = "MOVE";
        export interface MOVE extends ColourProperty, LocationProperty {}
        export const _ADDSTONE: string = "ADDSTONE";
        export interface ADDSTONE extends ColourProperty, LocationProperty {}
        export const _TERRITORY: string = "TERRITORY";
        export interface TERRITORY extends ColourProperty, LocationProperty {}

        export const _TIMELEFT: string = "TIMELEFT";
        export interface TIMELEFT extends ColourProperty, FloatProperty {}

        export const _DONESCORING: string = "DONESCORING";
        export interface DONESCORING extends Property {
            white: boolean;
            black: boolean;
        }

        export interface NodeEvent {
            type: string,
            nodeId: number
        }

        export const _PROP_ADDED: string = "PROP_ADDED";
        export interface PROP_ADDED extends NodeEvent {
            prop: Property
        }
        export const _PROP_REMOVED: string = "PROP_REMOVED";
        export interface PROP_REMOVED extends NodeEvent {
            prop: Property
        }
        export const _PROP_CHANGED: string = "PROP_CHANGED";
        export interface PROP_CHANGED extends NodeEvent {
            prop: Property
        }

        export const _PROP_GROUP_ADDED: string = "PROP_GROUP_ADDED";
        export interface PROP_GROUP_ADDED extends NodeEvent {
            props: Property[]
        }
        export const _PROP_GROUP_REMOVED: string = "PROP_GROUP_REMOVED";
        export interface PROP_GROUP_REMOVED extends NodeEvent {
            props: Property[]
        }

        export const _CHILD_ADDED: string = "CHILD_ADDED";
        export interface CHILD_ADDED extends NodeEvent {
            childNodeId: number;    // Node identifier of the child to add to the parent
            position?: number;      // Index into the child-list of the parent to which the child should be added. 0 (default) is the first index in the list - insert, not append.
        }
        export const _CHILDREN_REORDERED: string = "CHILDREN_REORDERED";
        export interface CHILDREN_REORDERED extends NodeEvent {
            children: number[]      // An array of node IDs, indicating the children of this node in their new ordering.
        }

        export const _ACTIVATED: string = "ACTIVATED";
        export interface ACTIVATED extends NodeEvent {
            prevNodeId?: number     // The Node Id of the node that is being deactivated
        }
    }
}

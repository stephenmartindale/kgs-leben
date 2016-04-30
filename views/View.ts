namespace Views {
    export interface View<RootElement extends HTMLElement> {
        attach(parent: HTMLElement): void;
        activate(): void;
        deactivate(): void;
    }
}

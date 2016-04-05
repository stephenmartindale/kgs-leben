namespace Models {
    export interface ContextDescriptor extends KeyedObject {
        key: number;
        name: string;
        contextClass?: ContextClass;
    }
}

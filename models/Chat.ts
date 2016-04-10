namespace Models {
    export interface Chat {
        sender: string,
        text: string,
        importance: Models.ChatImportance,
        received: Date
    }
}

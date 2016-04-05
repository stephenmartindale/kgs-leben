namespace Framework {
    export function registerComponents(templates: HTMLCollection) {
        let doc = document as Document & HTMLDocumentWithPolyfills;
        if (!doc.registerElement) throw "Web Components not available: document.registerElement() not found";

        if (!Views) throw "Web Components not available: Views namespace not found";

        for (let j = 0; j < templates.length; ++j) {
            let t: HTMLTemplateElement = <HTMLTemplateElement>templates[j];
            let tagName = t.getAttribute("data-component-tag");
            let prototypeName = t.getAttribute("data-component-prototype");
            let extendTagName = t.getAttribute("data-component-extends");

            if ((tagName) && (prototypeName)) {
                let view = (<any>Views)[prototypeName] as Function & { _template: HTMLTemplateElement };
                if ((view) && (view.prototype)) {
                    view._template = t;
                    doc.registerElement(tagName, {
                        prototype: view.prototype,
                        extends: (extendTagName)? extendTagName : undefined
                    });

                    if (extendTagName)
                        Framework.log(LogSeverity.Success, "Web Components: registered tag <" + extendTagName + " is=\"" + tagName + "\">: Views." + prototypeName);
                    else
                        Framework.log(LogSeverity.Success, "Web Components: registered tag <" + tagName + ">: Views." + prototypeName);
                }
                else if (view) Framework.log(LogSeverity.Error, "Web Components: failed to register tag <" + tagName + ">: Views." + prototypeName + " does not appear to be an object constructor");
                else Framework.log(LogSeverity.Error, "Web Components: failed to register tag <" + tagName + ">: Views." + prototypeName + " not found");
            }
            else if (tagName) Framework.log(LogSeverity.Error, "Web Components: failed to register tag <" + tagName + ">: component class not specified");
            else if (prototypeName) Framework.log(LogSeverity.Error, "Web Components: failed to register tag for " + prototypeName + ": tag name not specified");
            else Framework.log(LogSeverity.Error, "Web Components: failed to register component - tag name and component class not specified");
        }
    }

    export function createElement(tagName: string, customElement: string): HTMLElement {
        return (document as Document & HTMLDocumentWithPolyfills).createElement(tagName, customElement);
    }
}

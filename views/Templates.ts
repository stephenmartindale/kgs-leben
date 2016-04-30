namespace Views {
    export namespace Templates {
        let _templates: { [view: string]: Element };

        function initialiseSuccess(data: any, textStatus: string, jqXHR: JQueryXHR, callback: Function) {
            let templates: { [view: string]: Element } = {};
            let jquery = $(data);
            for (let i = 0; i < jquery.length; ++i) {
                let template = jquery[i];
                if ((template) && (template.getAttribute) && (template.getAttribute('data-view'))) {
                    templates[template.getAttribute('data-view')] = template;
                }
            }

            _templates = templates;
            callback();
        }

        function initialiseError(jqXHR: JQueryXHR, textStatus: string, errorThrown?: string) {
            Utils.log(Utils.LogSeverity.Error, "Failed to initialise template framework", textStatus, errorThrown);
        }

        export function initialise(url: string, callback: Function) {
            if (_templates) return;

            $.ajax({
                type: 'GET',
                url: url,
                success: (data, textStatus, jqXHR) => initialiseSuccess(data, textStatus, jqXHR, callback),
                error: initialiseError
            });
        }

        export function cloneTemplate(view: string): Node {
            if (!_templates) throw "Template framework not initialised";

            let template = _templates[view];
            if (!template) throw "Template not found: " + view;

            return template.firstElementChild.cloneNode(true);
        }
    }
}

namespace Views {
    export class LightboxContainer extends HTMLElement {
        static _template: HTMLTemplateElement;

        private _lightbox: HTMLDivElement;
        private _lightboxContainer: HTMLDivElement;

        createdCallback() {
            let children = $(this).children().detach();
            this.appendChild(LightboxContainer._template.content.cloneNode(true));

            this._lightbox = this.querySelector('.lightbox') as HTMLDivElement;
            this._lightboxContainer = this._lightbox.querySelector('.lightbox-container') as HTMLDivElement;

            $(this._lightboxContainer).append(children);
        }

        attachedCallback() {
        }
        detachedCallback() {
        }
        attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        }

        private transitionAddClass(element: HTMLElement, className: string): JQueryPromise<boolean> {
            var deferred: JQueryDeferred<boolean> = $.Deferred<boolean>();
            var target = $(element);

            if (target.hasClass(className)) deferred.resolve(false);
            target.on("transitionend", function(event: JQueryEventObject) {
                $(this).off(event);
                deferred.resolve(true);
            });

            target.addClass(className);
            return deferred.promise();
        }

        private transitionRemoveClass(element: HTMLElement, className: string): JQueryPromise<boolean> {
            var deferred: JQueryDeferred<boolean> = $.Deferred<boolean>();
            var target = $(element);

            if (!target.hasClass(className)) deferred.resolve(false);
            target.on("transitionend", function(event: JQueryEventObject) {
                $(this).off(event);
                deferred.resolve(true);
            });

            target.removeClass(className);
            return deferred.promise();
        }

        public hideLightbox(): JQueryPromise<boolean> {
            return this.transitionAddClass(this._lightbox, 'hidden');
        }

        public showLightbox(): JQueryPromise<boolean> {
            return this.transitionRemoveClass(this._lightbox, 'hidden');
        }
    }
}

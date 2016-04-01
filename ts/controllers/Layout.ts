namespace Controllers {
    export class Layout {
        private _lightbox: HTMLDivElement;

        constructor() {
            this._lightbox = <HTMLDivElement>document.getElementById("lightbox");
        }

        private static transitionAddClass(element: HTMLElement, className: string): JQueryPromise<boolean> {
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

        private static transitionRemoveClass(element: HTMLElement, className: string): JQueryPromise<boolean> {
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
            return Layout.transitionAddClass(this._lightbox, 'hidden');
        }

        public showLightbox(): JQueryPromise<boolean> {
            return Layout.transitionRemoveClass(this._lightbox, 'hidden');
        }
    }
}

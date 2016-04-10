namespace Views {
    export class LightboxContainer extends HTMLElement {
        static _template: HTMLTemplateElement;

        private _lightboxContainer: HTMLDivElement;

        createdCallback() {
            let children = $(this).children().detach();
            this.appendChild(LightboxContainer._template.content.cloneNode(true));
            this._lightboxContainer = this.firstElementChild as HTMLDivElement;
            $(this._lightboxContainer).append(children);
        }

        public static showLightbox(view: HTMLElement) {
            let lightbox = document.createElement('lightbox-container') as LightboxContainer;
            lightbox.className = 'hidden';
            lightbox._lightboxContainer.appendChild(view);

            document.body.appendChild(lightbox);

            window.setTimeout(() => $(lightbox).removeClass('hidden'), 20);
        }

        public static hideLightbox(view: HTMLElement) {
            let lightbox = $(view).closest('lightbox-container');
            lightbox.one('transitionend', () => lightbox.remove());
            lightbox.addClass('hidden');
        }
    }
}

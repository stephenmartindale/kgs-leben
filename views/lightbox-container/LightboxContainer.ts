namespace Views {
    export class LightboxContainer {
        private _lightbox: HTMLDivElement;
        private _lightboxContainer: HTMLDivElement;
        private _view: Views.View<any>;

        constructor(view: Views.View<any>) {
            this._lightbox = document.createElement('div');
            this._lightbox.className = 'lightbox';

            this._lightboxContainer = document.createElement('div');
            this._lightboxContainer.className = 'lightbox-container';
            this._lightbox.appendChild(this._lightboxContainer);

            this._view = view;
            this._view.attach(this._lightboxContainer);
        }

        public static showLightbox(view: Views.View<any>, suppressTransitions?: boolean): LightboxContainer {
            let lightbox = new LightboxContainer(view);

            if (!suppressTransitions) {
                lightbox._lightbox.classList.add('hidden');
            }

            document.body.appendChild(lightbox._lightbox);

            if (!suppressTransitions) {
                window.setTimeout(() => {
                    lightbox._lightbox.classList.remove('hidden');
                    lightbox._view.activate();
                }, 20);
            }
            else {
                lightbox._view.activate();
            }

            return lightbox;
        }

        public hideLightbox() {
            this._view.deactivate();

            let lightbox = $(this._lightbox);
            lightbox.one('transitionend', () => lightbox.remove());
            lightbox.addClass('hidden');
        }
    }
}

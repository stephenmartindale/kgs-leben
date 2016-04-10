namespace Controllers {
    export abstract class ControllerBase<ParentType extends ControllerBase<any>> {
        protected application: Controllers.Application;
        protected client: KGS.JSONClient;
        protected database: KGS.Database;

        protected parent: ParentType;
        protected children: ControllerBase<any>[];

        constructor(parent: ParentType) {
            this.attachParent(parent);
            this.children = [];
        }

        protected attachParent(parent: ParentType) {
            if (this.parent) {
                this.detachParent();
            }

            this.parent = parent;
            if (this.parent) this.parent.children.push(this);

            this.resolveApplication();
        }
        protected resolveApplication() {
            this.application = (this.parent)? this.parent.application : null;
            this.client = (this.application)? this.application.client : null;
            this.database = (this.client)? this.client.database : null;
        }

        protected detachChildren() {
            for (let c = (this.children.length - 1); c >= 0; --c) {
                this.children[c].detach();
            }
        }
        protected detachParent() {
            if (this.parent) {
                for (let c = (this.parent.children.length - 1); c >= 0; --c) {
                    if (this === this.parent.children[c]) {
                        this.parent.children.splice(c, 1);
                        break;
                    }
                }
            }

            this.parent = null;
            this.resolveApplication();
        }
        public detach() {
            this.detachChildren();
            this.detachParent();
        }

        protected logout(message?: string) {
            for (let c = 0; c < this.children.length; ++c) {
                this.children[c].logout(message);
            }
        }

        protected digest(digest: KGS.DataDigest) {
            for (let c = 0; c < this.children.length; ++c) {
                this.children[c].digest(digest);
            }
        }
    }
}

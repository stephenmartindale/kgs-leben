declare namespace KGS {
    namespace Upstream {

        interface Message {
            type: string
        }

        interface LOGIN extends Message {
            name: string,
            password: string,
            locale: string
        }

    }
}

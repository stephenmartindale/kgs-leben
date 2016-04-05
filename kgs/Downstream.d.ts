declare namespace KGS {
    namespace Downstream {

        interface Message {
            type: string
        }

        interface Response {
            messages: Downstream.Message[]
        }

        interface LOGIN_SUCCESS extends Message {
        }

        interface LOGIN_FAILED_BAD_PASSWORD extends Message {
        }

        interface LOGIN_FAILED_NO_SUCH_USER extends Message {
        }

    }
}

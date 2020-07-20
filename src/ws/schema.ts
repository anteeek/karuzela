import * as yup from "yup";

const schema = {
    websocketEvent: yup.object({
        type: yup.string().defined(),
        data: yup.object().defined()
    }).defined()
}

export type TWebsocketEvent = yup.InferType<typeof schema.websocketEvent>;

export default schema;
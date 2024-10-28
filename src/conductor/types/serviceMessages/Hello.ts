import Constant from "../../../common/Constant";
import IServiceMessage from "../IServiceMessage";
import ServiceMessageType from "../ServiceMessageType";

export default class Hello implements IServiceMessage {
    type = ServiceMessageType.HELLO;
    data = { version: Constant.API_VERSION };
}

import { Method } from "./method";

export class Controller {
    name: string;
    methodes: ControllerMethod[]
}

export class ControllerMethod extends Method {
    path: string;
}

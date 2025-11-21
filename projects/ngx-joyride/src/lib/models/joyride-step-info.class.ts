import { StepActionType } from "../services/joyride-steps-container.service";

export class JoyrideStepInfo {
    number = 0;
    name = '';
    route = '';
    actionType: StepActionType = StepActionType.NEXT;
}

import { ViewContainerRef, TemplateRef, EventEmitter } from '@angular/core';
import { JoyrideStepComponent } from '../components/step/joyride-step.component';
import { ReplaySubject } from 'rxjs';

export class JoyrideStep {
    constructor() {
        this.title = new ReplaySubject<string>();
        this.text = new ReplaySubject<string>();
    }
    name = '';
    route = '';
    position = '';
    title: ReplaySubject<string>;
    text: ReplaySubject<string>;
    stepContent?: TemplateRef<any>;
    stepContentParams?: object;
    nextClicked?: EventEmitter<any>;
    prevCliked?: EventEmitter<any>;
    tourDone?: EventEmitter<any>;
    transformCssStyle = '';
    isElementOrAncestorFixed = false;
    targetViewContainer!: ViewContainerRef;
    stepInstance!: JoyrideStepComponent;
}

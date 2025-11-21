import { Injectable, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { DomRefService } from './dom.service';
import { isPlatformBrowser } from "@angular/common";

export interface IDocumentService {
    getElementFixedTop(elementRef: ElementRef): number;

    getElementFixedLeft(elementRef: ElementRef): number;

    getElementAbsoluteTop(elementRef: ElementRef): number;

    getElementAbsoluteLeft(elementRef: ElementRef): number;

    setDocumentHeight(): void;

    getDocumentHeight(): number;
    isParentScrollable(elementRef: ElementRef): boolean;
    isElementBeyondOthers(
        elementRef: ElementRef,
        isElementFixed: boolean,
        keywordToDiscard: string
    ): number;
    scrollToTheTop(elementRef: ElementRef): void;
    scrollToTheBottom(elementRef: ElementRef): void;
}

@Injectable()
export class DocumentService implements IDocumentService {
    private documentHeight = 0;

    constructor(private readonly DOMService: DomRefService, @Inject(PLATFORM_ID) platformId: Object) {
        if (!isPlatformBrowser(platformId)) {
            return;
        }
        this.setDocumentHeight();
        var doc = DOMService.getNativeDocument();
        if (doc && !doc.elementsFromPoint) {
            // IE 11 - Edge browsers
            doc.elementsFromPoint = this.elementsFromPoint.bind(this);
        }
    }

    getElementFixedTop(elementRef: ElementRef): number {
        return elementRef.nativeElement.getBoundingClientRect().top;
    }

    getElementFixedLeft(elementRef: ElementRef): number {
        return elementRef.nativeElement.getBoundingClientRect().left;
    }

    getElementAbsoluteTop(elementRef: ElementRef): number {
        const scrollOffsets = this.getScrollOffsets();
        return (
            elementRef.nativeElement.getBoundingClientRect().top +
            scrollOffsets.y
        );
    }

    getElementAbsoluteLeft(elementRef: ElementRef): number {
        const scrollOffsets = this.getScrollOffsets();
        return (
            elementRef.nativeElement.getBoundingClientRect().left +
            scrollOffsets.x
        );
    }

    setDocumentHeight(): void {
        this.documentHeight = this.calculateDocumentHeight();
    }

    getDocumentHeight(): number {
        return this.documentHeight;
    }

    isParentScrollable(elementRef: ElementRef): boolean {
        return (
            this.getFirstScrollableParent(elementRef.nativeElement) !==
            this.DOMService.getNativeDocument().body
        );
    }

    isElementBeyondOthers(
        elementRef: ElementRef,
        isElementFixed: boolean,
        keywordToDiscard: string
    ): number {
        const x1 = isElementFixed
            ? this.getElementFixedLeft(elementRef)
            : this.getElementAbsoluteLeft(elementRef);
        const y1 = isElementFixed
            ? this.getElementFixedTop(elementRef)
            : this.getElementAbsoluteTop(elementRef);
        const x2 =
            x1 + elementRef.nativeElement.getBoundingClientRect().width - 1;
        const y2 =
            y1 + elementRef.nativeElement.getBoundingClientRect().height - 1;

        const elements1 = this.DOMService.getNativeDocument().elementsFromPoint(
            x1,
            y1
        );
        const elements2 = this.DOMService.getNativeDocument().elementsFromPoint(
            x2,
            y2
        );

        if (elements1.length === 0 && elements2.length === 0) return 1;
        if (
            this.getFirstElementWithoutKeyword(elements1, keywordToDiscard) !==
                elementRef.nativeElement ||
            this.getFirstElementWithoutKeyword(elements2, keywordToDiscard) !==
                elementRef.nativeElement
        ) {
            return 2;
        }
        return 3;
    }

    scrollIntoView(elementRef: ElementRef, isElementFixed: boolean): void {
        const firstScrollableParent = this.getFirstScrollableParent(
            elementRef.nativeElement
        );
        const top = isElementFixed
            ? this.getElementFixedTop(elementRef)
            : this.getElementAbsoluteTop(elementRef);
        if (
            firstScrollableParent !== this.DOMService.getNativeDocument().body
        ) {
            if (firstScrollableParent.scrollTo) {
                firstScrollableParent.scrollTo(0, top - 150);
            } else {
                // IE 11 - Edge browsers
                firstScrollableParent.scrollTop = top - 150;
            }
        } else {
            this.DOMService.getNativeWindow().scrollTo(0, top - 150);
        }
    }

    scrollToTheTop(elementRef: ElementRef): void {
        const firstScrollableParent = this.getFirstScrollableParent(
            elementRef.nativeElement
        );
        if (
            firstScrollableParent !== this.DOMService.getNativeDocument().body
        ) {
            if (firstScrollableParent.scrollTo) {
                firstScrollableParent.scrollTo(0, 0);
            } else {
                // IE 11 - Edge browsers
                firstScrollableParent.scrollTop = 0;
            }
        } else {
            this.DOMService.getNativeWindow().scrollTo(0, 0);
        }
    }

    scrollToTheBottom(elementRef: ElementRef): void {
        const firstScrollableParent = this.getFirstScrollableParent(
            elementRef.nativeElement
        );
        if (
            firstScrollableParent !== this.DOMService.getNativeDocument().body
        ) {
            if (firstScrollableParent.scrollTo) {
                firstScrollableParent.scrollTo(
                    0,
                    this.DOMService.getNativeDocument().body.scrollHeight
                );
            } else {
                // IE 11 - Edge browsers
                firstScrollableParent.scrollTop =
                    firstScrollableParent.scrollHeight -
                    firstScrollableParent.clientHeight;
            }
        } else {
            this.DOMService.getNativeWindow().scrollTo(
                0,
                this.DOMService.getNativeDocument().body.scrollHeight
            );
        }
    }

    private getFirstScrollableParent(node: any) {
        const regex = /(auto|scroll|overlay)/;

        const style = (node: any, prop: any) =>
            this.DOMService.getNativeWindow()
                .getComputedStyle(node, null)
                .getPropertyValue(prop);

        const scroll = (node: any) =>
            regex.test(
                style(node, 'overflow') +
                    style(node, 'overflow-y') +
                    style(node, 'overflow-x')
            );

        const scrollparent = (node: any): any => {
            return !node || node === this.DOMService.getNativeDocument().body
                ? this.DOMService.getNativeDocument().body
                : scroll(node)
                ? node
                : scrollparent(node.parentNode);
        };

        return scrollparent(node);
    }

    private calculateDocumentHeight() {
        const documentRef = this.DOMService.getNativeDocument();
        return Math.max(
            documentRef.body.scrollHeight,
            documentRef.documentElement.scrollHeight,
            documentRef.body.offsetHeight,
            documentRef.documentElement.offsetHeight,
            documentRef.body.clientHeight,
            documentRef.documentElement.clientHeight
        );
    }

    private getScrollOffsets(): { x: number; y: number } {
        const winReference = this.DOMService.getNativeWindow();
        const docReference = this.DOMService.getNativeDocument();

        // This works for all browsers except IE versions 8 and before
        if (winReference.pageXOffset != null)
            return { x: winReference.pageXOffset, y: winReference.pageYOffset };

        // For IE (or any browser) in Standards mode
        if (docReference.compatMode == 'CSS1Compat')
            return {
                x: docReference.documentElement.scrollLeft,
                y: docReference.documentElement.scrollTop
            };

        // For browsers in Quirks mode
        return {
            x: docReference.body.scrollLeft,
            y: docReference.body.scrollTop
        };
    }

    private elementsFromPoint(x: number, y: number): HTMLElement[] {
        const parents: HTMLElement[] = [];
        let parent: HTMLElement | null = null;
        do {
            const elem = this.DOMService.getNativeDocument().elementFromPoint(
                x,
                y
            ) as HTMLElement | null;
            if (elem && parent !== elem) {
                parent = elem;
                parents.push(parent);
                parent.style.pointerEvents = 'none';
            } else {
                parent = null;
            }
        } while (parent);
        parents.forEach(collectedParent => {
            collectedParent.style.pointerEvents = 'all';
        });
        return parents;
    }

    private getFirstElementWithoutKeyword(
        elements: Element[],
        keyword: string
    ): Element {
        while (
            elements[0] &&
            elements[0].classList.toString().includes(keyword)
        ) {
            elements.shift();
        }
        return elements[0];
    }
}

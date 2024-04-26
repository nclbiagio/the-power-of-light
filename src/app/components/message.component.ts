import {
   AfterContentInit,
   AfterViewInit,
   ChangeDetectionStrategy,
   Component,
   DestroyRef,
   ElementRef,
   OnInit,
   Signal,
   WritableSignal,
   inject,
   signal,
   viewChild,
} from '@angular/core';
import { MessageService } from '../../game/services/message.service';
import { AsyncPipe, NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, fromEvent } from 'rxjs';
import { NgOptimizedImage } from '@angular/common';

@Component({
   selector: 'app-message',
   standalone: true,
   imports: [AsyncPipe, NgClass, NgOptimizedImage],
   template: `
      <div class="flex flex-col justify-center items-center h-full">
         @if (image()) {
            <img ngSrc="{{ image() }}" class="msg-img" width="500" height="400" priority />
         }
         <div class="flex flex-row-reverse w-full">
            @if (!textCompleted()) {
               <button
                  (click)="this.goToEndOfMessage()"
                  [ngClass]="{ 'hover:bg-sky-600/80': !textCompleted(), disabled: textCompleted() }"
                  class="msg-btn-xl focus-ring relative flex items-center justify-center rounded-2xl px-5 py-2.5 bg-sky-600 text-white"
                  type="button"
                  [disabled]="textCompleted()"
               >
                  Complete Message!
               </button>
            }
         </div>
         <div #textElement [style]="canvasWidth()" class="text-container text-animation"></div>
         <button
            (click)="this.messageOnCloseCallback()"
            [ngClass]="{ 'hover:bg-sky-600/80': textCompleted(), disabled: !textCompleted() }"
            class="msg-btn focus-ring relative flex items-center justify-center rounded-2xl px-5 py-2.5 bg-sky-600 text-white"
            type="button"
            [disabled]="!textCompleted()"
         >
            Continue
         </button>
      </div>
   `,
   styles: [
      `
         .text-container {
            display: flex;
            align-items: center;
            padding: 20px;
            border-radius: 4px;
            background-color: #b2bfbade;
            z-index: 9999;
            line-height: 20px;
            white-space: pre-line;
            font-size: 12px;
         }
         .msg-btn {
            width: 150px;
            z-index: 9999;
            margin: 20px;
         }
         .msg-btn-xl {
            width: 200px;
            z-index: 9999;
            margin: 20px;
         }
         .msg-img {
            max-width: 100%;
            margin-bottom: 20px;
         }
         .msg-btn.disabled,
         .msg-btn-xl.disabled {
            opacity: 0.4;
         }
         @media only screen and (max-width: 500px) {
            .text-container {
               padding: 2px;
               line-height: 18px;
               font-size: 10px;
            }
            .msg-img {
               max-width: 100%;
               margin-bottom: 4px;
            }
            .msg-btn-xl {
               font-size: 10px;
               width: 120px;
            }
         }
      `,
   ],
   changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageComponent implements OnInit, AfterContentInit {
   private destroyRef = inject(DestroyRef);

   #messageService = MessageService.getInstance();

   canvasWidth = signal('width: 0;');
   textElement: Signal<ElementRef> = viewChild.required('textElement');

   text = '';
   textCompleted = signal(false);
   image: WritableSignal<string | null> = signal(null);

   msgEnd = false;

   constructor() {
      this.#messageService.messageChanged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((newMessageChange) => {
         if (newMessageChange) {
            if (this.textElement()) {
               this.msgEnd = false;
               this.textElement().nativeElement.textContent = '';
            }
            this.image.set(this.messageImage);
            this.startTypingMessage();
            this.messageService.messageIsSet();
         }
      });
      fromEvent(window, 'resize')
         .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
         .subscribe(() => {
            this.calculateCanvasWidth();
         });
   }

   ngOnInit(): void {}

   get messageService() {
      return this.#messageService;
   }

   get isMessageAvailable() {
      return this.#messageService.isMessageAvailable && this.#messageService.isMessageAvailable.id;
   }

   get messageRows() {
      return (this.#messageService.isMessageAvailable && this.#messageService.isMessageAvailable.rows) || [];
   }

   get messageImage() {
      return (this.#messageService.isMessageAvailable && this.#messageService.isMessageAvailable.image) || null;
   }

   get messageOnCloseCallback() {
      const fallback = () => {
         console.error('message component onCloseCallback not provided!');
      };
      return (this.#messageService.isMessageAvailable && this.#messageService.isMessageAvailable.onCloseCallback) || fallback;
   }

   goToEndOfMessage() {
      this.msgEnd = true;
   }

   generateText() {
      let generatedText = '';
      if (this.messageRows.length > 0) {
         this.messageRows.map((sentence) => {
            generatedText = `${generatedText}${sentence}\r\n`;
         });
      }
      return generatedText;
   }

   calculateCanvasWidth() {
      const canvasWidth = document.querySelector<HTMLCanvasElement>('#game canvas')?.offsetWidth;
      if (canvasWidth) {
         this.canvasWidth.set(`width: ${canvasWidth - 20}px;`);
      }
   }

   ngAfterContentInit() {
      this.calculateCanvasWidth();
      this.image.set(this.messageImage);
      this.startTypingMessage();
   }

   startTypingMessage() {
      this.textCompleted.set(false);
      this.text = this.generateText();
      this.textTypingEffect(this.textElement(), this.text);
   }

   textTypingEffect(element: ElementRef | null, text: string, i = 0) {
      if (!this.msgEnd) {
         if (element && element.nativeElement) {
            element.nativeElement.textContent = element.nativeElement?.textContent + text[i];
         }
         if (i === text.length - 1) {
            this.textCompleted.set(true);
            return;
         }
         setTimeout(() => {
            this.textTypingEffect(element, text, i + 1);
         }, 30);
      } else {
         if (element && element.nativeElement) {
            element.nativeElement.textContent = '';
            element.nativeElement.textContent = text;
            this.textCompleted.set(true);
         }
      }
   }
}

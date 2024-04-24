import { BehaviorSubject } from 'rxjs';

export interface Message {
   id: string;
   rows: string[];
   onCloseCallback: (data?: any) => void;
   image?: string;
}
export class MessageService {
   private static _instance: MessageService;
   #messages: Message[] = [];
   #message: Message | null = null;
   #showMessage$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
   #messageChanged$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

   constructor() {}

   static getInstance(): MessageService {
      if (this._instance) {
         return this._instance;
      }

      this._instance = new MessageService();
      return this._instance;
   }

   get messagesList() {
      return this.#messages;
   }

   get isMessageAvailable() {
      return this.#message;
   }

   get showMessage$() {
      return this.#showMessage$;
   }

   get messageChanged$() {
      return this.#messageChanged$;
   }

   addMessage(message: Message) {
      this.#messages.push(message);
   }

   addMessagesList(messageList: Message[]) {
      this.#messages = [...messageList];
   }

   setNewMessageById(id: string) {
      const msg = this.#messages.find((msg) => msg.id === id);
      if (msg) {
         this.#message = msg;
         return true;
      }
      return false;
   }

   openMessage(id: string) {
      const result = this.setNewMessageById(id);
      if (result) {
         this.#showMessage$.next(true);
      }
   }

   closeMessage() {
      this.#showMessage$.next(false);
      this.#message = null;
   }

   setMessage(id: string) {
      const result = this.setNewMessageById(id);
      if (result) {
         this.#messageChanged$.next(true);
      }
   }

   messageIsSet() {
      this.#messageChanged$.next(false);
   }
}

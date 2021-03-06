namespace SPECTOR.EmbeddedFrontend {
    export abstract class BaseNoneGenericComponent {
        private readonly dummyElement: Element;
        
        constructor(protected readonly eventConstructor: EventConstructor, protected readonly logger: ILogger) {
            this.dummyElement = document.createElement("div");
        }

        public abstract render(state: any, stateId: number): Element;

        protected createFromHtml(html: string): Element {
            this.dummyElement.innerHTML = html;
            return this.dummyElement.firstElementChild;
        }

        // THX to http://2ality.com/2015/01/template-strings-html.html
        protected htmlTemplate(literalSections:TemplateStringsArray, ...substs:any[]) {
            // Use raw literal sections: we don’t want
            // backslashes (\n etc.) to be interpreted
            let raw = literalSections.raw;

            let result = '';

            substs.forEach((subst, i) => {
                // Retrieve the literal section preceding
                // the current substitution
                let lit = raw[i];

                // In the example, map() returns an array:
                // If substitution is an array (and not a string),
                // we turn it into a string
                if (Array.isArray(subst)) {
                    subst = subst.join('');
                }

                // If the substitution is preceded by a dollar sign,
                // we escape special characters in it
                if (lit && lit.length > 0 && lit[lit.length - 1] === '$') {
                    subst = this.htmlEscape(subst);
                    lit = lit.slice(0, -1);
                }
                result += lit;
                result += subst;
            });
            // Take care of last literal section
            // (Never fails, because an empty template string
            // produces one literal section, an empty string)
            result += raw[raw.length-1]; // (A)

            return result;
        }

        // THX to http://2ality.com/2015/01/template-strings-html.html
        private htmlEscape(str: string): string {
            return str.replace(/&/g, '&amp;') // first!
                    .replace(/>/g, '&gt;')
                    .replace(/</g, '&lt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;')
                    .replace(/`/g, '&#96;');
        }
    }

    export interface IStateEventArgs<T> {
        sender: Element,
        stateId: number,
        state: T,
    }

    export type IStateEvent<T> = IEvent<IStateEventArgs<T>>;

    export abstract class BaseComponent<T> extends BaseNoneGenericComponent {        
        private readonly events: { [eventName: string]: IStateEvent<T> }

        constructor(eventConstructor: EventConstructor, logger: ILogger) {
            super(eventConstructor, logger);
            this.events = {};
        }

        public abstract render(state: T, stateId: number): Element;

        protected renderElementFromTemplate(template: string, state: T, stateId: number): Element {
            const element = this.createFromHtml(template);
            this.bindCommands(element, state, stateId);
            return element;
        }

        protected bindCommands(domNode: Element, state: T, stateId: number): void {
            const commandName = domNode.getAttribute("commandname");
            if (commandName) {
                this.bindCommand(domNode, state, stateId);
            }
            
            const commandContainers = domNode.querySelectorAll("[commandName]");
            for (let i = 0; i < commandContainers.length; i++) {
                const commandContainer = commandContainers[i];
                this.bindCommand(commandContainer, state, stateId);
            }
        }

        protected bindCommand(commandContainer: Element, state: T, stateId: number): void {
            const commandName = commandContainer.getAttribute("commandname");
            let commandEventBinding = commandContainer.getAttribute("commandeventbinding") || "";
            if (commandEventBinding.length === 0) {
                commandEventBinding = "click";
            }
            const commandCapture = commandContainer.getAttribute("usecapture") === "true";

            this.createEvent(commandName);
            this.mapEventListener(commandContainer, commandEventBinding, commandName, state, stateId, commandCapture);
        }

        protected mapEventListener(domElement: Element, domEvent: string, eventName: string, state: T, stateId: number, commandCapture = false, stopPropagation = false) {
            const self = this;
            if (stopPropagation) {
                domElement.addEventListener(domEvent, 
                    function(this:Element, e: Event) { 
                        e.stopPropagation();
                        e.preventDefault();
                        self.triggerEvent(eventName, this, state, stateId); 
                    }, 
                    commandCapture)
            }
            else {
                domElement.addEventListener(domEvent, 
                    function(this:Element) {
                        self.triggerEvent(eventName, this, state, stateId); 
                    }, 
                    commandCapture)
            }
        }

        protected createEvent(commandName: string): IStateEvent<T> {
            if (!this.events[commandName]) {
                const event = new this.eventConstructor<IStateEventArgs<T>>();
                this.events[commandName] = event; 
            }
            
            return this.events[commandName];
        }

        protected triggerEvent(commandName: string, element: Element, state: T, stateId: number) {
            this.events[commandName].trigger({
                sender: element,
                stateId: stateId, 
                state: state
            });
        }

        public addEventListener(command: string, callback: (stateEventArgs: IStateEventArgs<T>) => void, context: any = null): number {
            if (this.events[command]) {
                return this.events[command].add(callback, context);
            }
            return -1;
        }

        public removeEventListener(command: string, listenerId: number): void {
            if (this.events[command]) {
                this.events[command].remove(listenerId);
            }
        }
    }
}
import { BaseEventService, CommandService, EventModel, Internal, Last, Singleton } from '@abstractflo/atlas-shared'
import { emit, emitServer, offServer, onceServer, onServer } from 'alt-client'
import { KeyEventService } from './key-event.service'

@Singleton
export class EventService extends BaseEventService {
  /**
   * Contains the off event methods
   *
   * @type {Map<string, any>}
   * @private
   */
  protected offServerEventsMap: Map<string, CallableFunction[]> = new Map<string, CallableFunction[]>()

  /**
   * Contains all key event keys
   *
   * @type {string[]}
   * @private
   */
  private keyEvents: string[] = [Internal.Events_Key_Down, Internal.Events_Key_Up]

  constructor(protected readonly commandService: CommandService, private readonly keyEventService: KeyEventService) {
    super(commandService)
  }

  /**
   * Emit event to server
   *
   * @param {string} name
   * @param args
   */
  public emitServer(name: string, ...args: any[]): void {
    emitServer(name, ...args)
  }

  /**
   * Unsubscribe from server event
   *
   * @param {string} name
   * @param {(...args: any[]) => void} listener
   */
  public offServer(eventName: string): void
  public offServer(eventName: string, listener: (...args: any[]) => void): void
  public offServer(eventName: string, listener?: (...args: any[]) => void): void {
    listener ? offServer(eventName, listener) : this.processOffEvent(eventName, this.offServerEventsMap)
  }

  /**
   * Receive event from server
   *
   * @param {string} name
   * @param {(...args: any[]) => void} listener
   */
  public onServer(eventName: string, listener: (...args: any[]) => void): void
  public onServer(eventName: string, listener: (...args: any[]) => void, resetable: boolean): void
  public onServer(eventName: string, listener: (...args: any[]) => void, resetable?: boolean) {
    onServer(eventName, listener)

    if (resetable) {
      this.registerAnonymusOffEvents(this.offServer, eventName, listener)
    }
  }

  /**
   * Receive once event from server
   *
   * @param {string} name
   * @param {(...args: any[]) => void} listener
   */
  public onceServer(name: string, listener: (...args: any[]) => void): void {
    onceServer(name, listener)
  }

  /**
   * Receive gui event
   *
   * @param {string} eventName
   * @param {(...args: any[]) => void} listener
   */
  public onGui(eventName: string, listener: (...args: any[]) => void): void {
    emit(Internal.Webview_Gui_On, eventName, listener)
  }

  /**
   * Override startEventListener
   *
   * @protected
   */
  @Last
  protected async start(): Promise<void> {
    await super.listenToEvents()
    await this.resolveAndLoadEvents(this.keyEvents, 'KeyEvents', this.listenToKeyEvents.bind(this))
  }

  /**
   * Start the key event resolver
   *
   * @param {EventModel[]} events
   * @private
   */
  private listenToKeyEvents(events: EventModel[]): void {
    const eventType = events[0].type
    this.keyEventService.setupKeys(events)

    this.on(eventType, (key: number) => {
      this.keyEventService.run(key, eventType)
    })
  }
}

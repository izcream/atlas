import { Singleton } from '../decorators/framework-di.decorator'
import { EventModel } from '../models/event.model'
import { app } from '../di-container'
import { constructor } from '../interfaces/constructor.interface'

@Singleton
export class CommandService {
  /**
   * Commands pool
   *
   * @type {Map<string, EventModel>}
   * @private
   */
  private commands: Map<string, EventModel> = new Map<string, EventModel>()
  /**
   * Command prefix
   *
   * @type {string}
   * @private
   */
  private prefix: string = '/'

  /**
   * Setup commands
   *
   * @param {EventModel[]} events
   */
  public setupCommands(events: EventModel[]): void {
    events.forEach((event: EventModel) => this.add(event))
  }

  /**
   * Setup the prefix for commands
   *
   * @param {string} prefix
   */
  public setPrefix(prefix: string): void {
    this.prefix = prefix
  }

  /**
   * Search for command and process if exists
   *
   * @param {string} cmd
   * @param args
   */
  public run(cmd: string, ...args: any[]): void {
    const command = cmd.slice(this.prefix.length)
    const commandEntry = this.commands.get(command)

    if (!cmd.startsWith(this.prefix) || !commandEntry) return

    const instances = app.resolveAll<constructor<any>>(commandEntry.targetName)

    instances.forEach(async (instance) => {
      const instanceMethod = instance[commandEntry.methodName]

      if (!instanceMethod) return

      const method = instanceMethod.bind(instance, ...args)
      await method()
    })
  }

  /**
   * Add new command to pool if not exists
   *
   * @param {EventModel} event
   * @private
   */
  private add(event: EventModel): void {
    if (this.commands.has(event.eventName)) return

    this.commands.set(event.eventName, event)
  }
}

import { RunningTimerInterface } from '../interfaces/running-timer.interface'
import { UtilsService } from './utils.service'
import { Last } from '../decorators/loader.decorator'
import { TimerModel } from '../models/timer.model'
import { getFrameworkMetaData } from '../decorators/helpers'
import { constructor } from '../interfaces/constructor.interface'
import { Internal } from '../internal'
import { app } from '../di-container'
import { Singleton } from '../decorators/framework-di.decorator'

@Singleton
export class TimerManagerService {
  /**
   * Contains all timers
   *
   * @type {Map<string, RunningTimerInterface>}
   * @protected
   */
  protected runningTimers: Map<string, RunningTimerInterface> = new Map<string, RunningTimerInterface>()

  /**
   * Register and resolve reflection data
   *
   * @return {Promise<void>}
   */
  @Last
  public async load(): Promise<void> {
    const timerCount = await this.registerAndResolveTimers()

    if (timerCount > 0) {
      UtilsService.logRegisteredHandlers('TimerManagerService', timerCount)
      UtilsService.logLoaded('TimerManagerService')
    }
  }

  /**
   * Clear specific timer by name
   *
   * @param {string} timerName
   */
  public clearRunningTimer(timerName: string): void {
    const runningTimer = this.runningTimers.get(timerName)

    if (!runningTimer) return

    this.clearTimer(runningTimer)
    this.runningTimers.delete(timerName)
  }

  /**
   * Clear all running timers and empty the map
   *
   */
  public clearAllRunningTimers(): void {
    const runningTimers = Array.from(this.runningTimers.values())

    runningTimers.forEach((runningTimer: RunningTimerInterface) => this.clearTimer(runningTimer))
    this.runningTimers.clear()
  }

  /**
   * Create new Interval and insert to map
   *
   * @param {string} timerName
   * @param {Function} callback
   * @param {number} interval
   * @return {TimerManagerService}
   */
  public createInterval(timerName: string, callback: CallableFunction, interval: number): TimerManagerService | void {
    if (this.runningTimers.get(timerName)) {
      UtilsService.logError(`There is a timer with name ${timerName} already registered`)
      return
    }

    const identifier = UtilsService.setInterval(() => callback(this), interval)

    this.runningTimers.set(timerName, { type: 'interval', identifier })
    return this
  }

  /**
   * Create new everyTick and insert to map
   *
   * @param {string} timerName
   * @param {Function} callback
   * @return {TimerManagerService}
   */
  public createEveryTick(timerName: string, callback: CallableFunction): TimerManagerService | void {
    if (this.runningTimers.get(timerName)) {
      UtilsService.logError(`There is a timer with name ${timerName} already registered`)
      return
    }

    const identifier = UtilsService.everyTick(() => callback(this))

    this.runningTimers.set(timerName, { type: 'everyTick', identifier })
    return this
  }

  /**
   * Create new every tick and insert to map
   *
   * @param {string} timerName
   * @param {Function} callback
   * @return {TimerManagerService}
   */
  public createNextTick(timerName: string, callback: CallableFunction): TimerManagerService | void {
    if (this.runningTimers.get(timerName)) {
      UtilsService.logError(`There is a timer with name ${timerName} already registered`)
      return
    }

    const identifier = UtilsService.nextTick(() => callback(this))

    this.runningTimers.set(timerName, { type: 'nextTick', identifier })
    return this
  }

  /**
   * Create new timeout and register inside map
   *
   * @param {string} timerName
   * @param {Function} callback
   * @param {number} duration
   * @return {TimerManagerService}
   */
  public createTimeout(timerName: string, callback: CallableFunction, duration: number): TimerManagerService | void {
    if (this.runningTimers.get(timerName)) {
      UtilsService.logError(`There is a timer with name ${timerName} already registered`)
      return
    }

    const identifier = UtilsService.setTimeout(() => callback(this), duration)

    this.runningTimers.set(timerName, { type: 'timeout', identifier })
    return this
  }

  /**
   * Clear timer based on type
   *
   * @param {RunningTimerInterface} runningTimer
   * @private
   */
  private clearTimer(runningTimer: RunningTimerInterface) {
    switch (runningTimer.type) {
      case 'nextTick':
        UtilsService.clearNextTick(runningTimer.identifier)
        break
      case 'everyTick':
        UtilsService.clearEveryTick(runningTimer.identifier)
        break
      case 'interval':
        UtilsService.clearInterval(runningTimer.identifier)
        break
      case 'timeout':
        UtilsService.clearTimeout(runningTimer.identifier)
        break
    }
  }

  /**
   * Create new timer based on type
   *
   * @param {TimerModel} timer
   * @param {Function} callback
   * @private
   */
  private startTimer(timer: TimerModel, callback: CallableFunction) {
    switch (timer.type) {
      case 'timeout':
        this.createTimeout(timer.identifier, callback, timer.duration)
        break
      case 'interval':
        this.createInterval(timer.identifier, callback, timer.duration)
        break
      case 'nextTick':
        this.createNextTick(timer.identifier, callback)
        break
      case 'everyTick':
        this.createEveryTick(timer.identifier, callback)
        break
    }
  }

  /**
   * Register and resolve all reflection timers
   *
   * @private
   */
  private registerAndResolveTimers(): Promise<number> {
    let timerCount = 0
    const timers = getFrameworkMetaData<TimerModel[]>(Internal.Timer_Manager, this, [])

    return new Promise((resolve) => {
      timers.forEach((timer: TimerModel) => {
        const instances = app.resolveAll<constructor<any>>(timer.targetName)

        instances.forEach((instance: constructor<any>) => {
          const instanceMethod = instance[timer.methodName]

          if (!instanceMethod) return

          const method = instanceMethod.bind(instance)
          this.startTimer(timer, method)
          timerCount++
        })
      })

      return resolve(timerCount)
    })
  }
}

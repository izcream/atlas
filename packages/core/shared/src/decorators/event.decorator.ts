import { getFrameworkMetaData, registerDescriptor } from './helpers'
import { EventModel } from '../models/event.model'
import { EventServiceInterface } from '../interfaces/event-service.interface'
import { BaseEventService } from '../services/base-event.service'
import { app } from '../di-container'
import { Internal } from '../internal'
import { IClientEvent } from 'alt-client'
import { IServerEvent } from 'alt-server'
/**
 * Register @On decorator
 *
 * @param {string} name
 * @return {MethodDecorator}
 * @constructor
 */
function On<K extends keyof IClientEvent>(name: K): MethodDecorator
function On<K extends keyof IServerEvent>(name: K): MethodDecorator
function On(name: string): MethodDecorator
function On(resetable: boolean): MethodDecorator
function On(name: string, resetable: boolean): MethodDecorator
function On(name?: string, resetable?: boolean): MethodDecorator
function On(name?: string | boolean, resetable?: boolean): MethodDecorator {
  return function (target: Record<string, unknown>, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const eventName = (typeof name !== 'boolean' && name) || propertyKey

    setEventServiceReflectMetaData(Internal.Events_On, {
      type: 'on',
      eventName,
      resetable: typeof name !== 'boolean' ? resetable : name,
      methodName: propertyKey,
      targetName: target.constructor.name,
      validateOptions: {
        name: eventName
      }
    })

    return registerDescriptor(descriptor)
  }
}

/**
 * Register @Once decorator
 *
 * @param {string} name
 * @return {MethodDecorator}
 * @constructor
 */
export const Once = (name?: string): MethodDecorator => {
  return function (target: Record<string, unknown>, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const eventName = name || propertyKey

    setEventServiceReflectMetaData(Internal.Events_Once, {
      type: 'once',
      eventName,
      methodName: propertyKey,
      targetName: target.constructor.name
    })

    return registerDescriptor(descriptor)
  }
}

/**
 * Register decorated method for off handler
 *
 * @param {string} name
 * @return {MethodDecorator}
 * @constructor
 */
export const Off = (name?: string): MethodDecorator => {
  return function (target: Record<string, unknown>, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const eventName = name || propertyKey

    setEventServiceReflectMetaData(Internal.Events_Off, {
      type: 'off',
      eventName,
      methodName: propertyKey,
      targetName: target.constructor.name
    })

    return registerDescriptor(descriptor)
  }
}

/**
 * Register new console command
 *
 * @param {string} name
 * @return {MethodDecorator}
 * @constructor
 */
export const Cmd = (name?: string): MethodDecorator => {
  return function (target: Record<string, unknown>, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const commandName = name || propertyKey
    const events = getFrameworkMetaData<EventModel[]>(Internal.Events_Console_Command, eventServiceTarget())
    const alreadyExists = events.find((event: EventModel) => event.eventName === commandName)

    if (!alreadyExists) {
      setEventServiceReflectMetaData(Internal.Events_Console_Command, {
        type: 'consoleCommand',
        eventName: commandName,
        methodName: propertyKey,
        targetName: target.constructor.name,
        validateOptions: {
          name: commandName
        }
      })
    }

    return registerDescriptor(descriptor)
  }
}

/**
 * Setup metaData
 *
 * @param {string} key
 * @param {Partial<EventModel>} data
 */
export function setEventServiceReflectMetaData(key: string, data: Partial<EventModel>): void {
  const target = eventServiceTarget()
  const events = getFrameworkMetaData<EventModel[]>(key, target)
  const eventModel = new EventModel().cast(data)

  events.push(eventModel)

  Reflect.defineMetadata<EventModel[]>(key, events, target)
}

/**
 * Return the EventService
 *
 * @return {EventServiceInterface}
 */
export function eventServiceTarget(): EventServiceInterface {
  return app.resolve<EventServiceInterface>(BaseEventService)
}

export { On }

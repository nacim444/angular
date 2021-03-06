/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {PRIMITIVE, ServiceMessageBrokerFactory} from '@angular/platform-browser';

const ECHO_CHANNEL = 'ECHO';

@Component({selector: 'app', template: '<h1>WebWorker MessageBroker Test</h1>'})
export class App {
  constructor(private _serviceBrokerFactory: ServiceMessageBrokerFactory) {
    var broker = _serviceBrokerFactory.createMessageBroker(ECHO_CHANNEL, false);
    broker.registerMethod('echo', [PRIMITIVE], this._echo, PRIMITIVE);
  }

  private _echo(val: string) {
    return new Promise((res, rej) => {
      try {
        res(val);
      } catch (e) {
        rej(e);
      }
    });
  }
}

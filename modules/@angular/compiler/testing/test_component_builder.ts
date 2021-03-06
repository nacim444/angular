/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationEntryMetadata, Compiler, ComponentFactory, Inject, Injectable, Injector, NgZone, Type} from '@angular/core';
import {ComponentFixture, ComponentFixtureNoNgZone, TestBed} from '@angular/core/testing';

import {ViewMetadata} from '../core_private';
import {TestComponentBuilder} from '../core_private_testing';
// export {ViewMetadata} from '../core_private';

import {DirectiveResolver} from '../index';
import {MapWrapper} from '../src/facade/collection';
import {isPresent} from '../src/facade/lang';



/**
 * A TestComponentBuilder that allows overriding based on the compiler.
 *
 * @deprecated Use `TestBed.configureTestModule` / `TestBed.override...` / `TestBed.createComponent`
 * instead.
*/
@Injectable()
export class OverridingTestComponentBuilder extends TestComponentBuilder {
  /** @internal */
  private _bindingsOverrides = new Map<Type<any>, any[]>();
  /** @internal */
  private _directiveOverrides = new Map<Type<any>, Map<Type<any>, Type<any>>>();
  /** @internal */
  private _templateOverrides = new Map<Type<any>, string>();
  /** @internal */
  private _animationOverrides = new Map<Type<any>, AnimationEntryMetadata[]>();
  /** @internal */
  private _viewBindingsOverrides = new Map<Type<any>, any[]>();
  /** @internal */
  private _viewOverrides = new Map<Type<any>, ViewMetadata>();

  constructor(@Inject(TestBed) injector: Injector) { super(injector); }

  /** @internal */
  _clone(): OverridingTestComponentBuilder {
    let clone = new OverridingTestComponentBuilder(this._injector);
    clone._viewOverrides = MapWrapper.clone(this._viewOverrides);
    clone._directiveOverrides = MapWrapper.clone(this._directiveOverrides);
    clone._templateOverrides = MapWrapper.clone(this._templateOverrides);
    clone._bindingsOverrides = MapWrapper.clone(this._bindingsOverrides);
    clone._viewBindingsOverrides = MapWrapper.clone(this._viewBindingsOverrides);
    return clone;
  }

  overrideTemplate(componentType: Type<any>, template: string): OverridingTestComponentBuilder {
    let clone = this._clone();
    clone._templateOverrides.set(componentType, template);
    return clone;
  }

  overrideAnimations(componentType: Type<any>, animations: AnimationEntryMetadata[]):
      TestComponentBuilder {
    var clone = this._clone();
    clone._animationOverrides.set(componentType, animations);
    return clone;
  }

  overrideView(componentType: Type<any>, view: ViewMetadata): OverridingTestComponentBuilder {
    let clone = this._clone();
    clone._viewOverrides.set(componentType, view);
    return clone;
  }

  overrideDirective(componentType: Type<any>, from: Type<any>, to: Type<any>):
      OverridingTestComponentBuilder {
    let clone = this._clone();
    let overridesForComponent = clone._directiveOverrides.get(componentType);
    if (!isPresent(overridesForComponent)) {
      clone._directiveOverrides.set(componentType, new Map<Type<any>, Type<any>>());
      overridesForComponent = clone._directiveOverrides.get(componentType);
    }
    overridesForComponent.set(from, to);
    return clone;
  }

  overrideProviders(type: Type<any>, providers: any[]): OverridingTestComponentBuilder {
    let clone = this._clone();
    clone._bindingsOverrides.set(type, providers);
    return clone;
  }

  overrideViewProviders(type: Type<any>, providers: any[]): OverridingTestComponentBuilder {
    let clone = this._clone();
    clone._viewBindingsOverrides.set(type, providers);
    return clone;
  }

  createAsync<T>(rootComponentType: Type<T>): Promise<ComponentFixture<T>> {
    this._applyMetadataOverrides();
    return super.createAsync(rootComponentType);
  }

  createSync<T>(rootComponentType: Type<T>): ComponentFixture<T> {
    this._applyMetadataOverrides();
    return super.createSync(rootComponentType);
  }

  private _applyMetadataOverrides() {
    let mockDirectiveResolver = this._injector.get(DirectiveResolver);
    this._viewOverrides.forEach((view, type) => { mockDirectiveResolver.setView(type, view); });
    this._templateOverrides.forEach(
        (template, type) => mockDirectiveResolver.setInlineTemplate(type, template));
    this._animationOverrides.forEach(
        (animationsEntry, type) => mockDirectiveResolver.setAnimations(type, animationsEntry));
    this._directiveOverrides.forEach((overrides, component) => {
      overrides.forEach(
          (to, from) => { mockDirectiveResolver.overrideViewDirective(component, from, to); });
    });
    this._bindingsOverrides.forEach(
        (bindings, type) => mockDirectiveResolver.setProvidersOverride(type, bindings));
    this._viewBindingsOverrides.forEach(
        (bindings, type) => mockDirectiveResolver.setViewProvidersOverride(type, bindings));
  }
}

/**
 * @license Angular v6.0.9
 * (c) 2010-2018 Google, Inc. https://angular.io/
 * License: MIT
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core')) :
    typeof define === 'function' && define.amd ? define('@angular/core/testing', ['exports', '@angular/core'], factory) :
    (factory((global.ng = global.ng || {}, global.ng.core = global.ng.core || {}, global.ng.core.testing = {}),global.ng.core));
}(this, (function (exports,core) { 'use strict';

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var _global = (typeof window === 'undefined' ? global : window);
    /**
     * Wraps a test function in an asynchronous test zone. The test will automatically
     * complete when all asynchronous calls within this zone are done. Can be used
     * to wrap an {@link inject} call.
     *
     * Example:
     *
     * ```
     * it('...', async(inject([AClass], (object) => {
     *   object.doSomething.then(() => {
     *     expect(...);
     *   })
     * });
     * ```
     *
     *
     */
    function asyncFallback(fn) {
        // If we're running using the Jasmine test framework, adapt to call the 'done'
        // function when asynchronous activity is finished.
        if (_global.jasmine) {
            // Not using an arrow function to preserve context passed from call site
            return function (done) {
                if (!done) {
                    // if we run beforeEach in @angular/core/testing/testing_internal then we get no done
                    // fake it here and assume sync.
                    done = function () { };
                    done.fail = function (e) { throw e; };
                }
                runInTestZone(fn, this, done, function (err) {
                    if (typeof err === 'string') {
                        return done.fail(new Error(err));
                    }
                    else {
                        done.fail(err);
                    }
                });
            };
        }
        // Otherwise, return a promise which will resolve when asynchronous activity
        // is finished. This will be correctly consumed by the Mocha framework with
        // it('...', async(myFn)); or can be used in a custom framework.
        // Not using an arrow function to preserve context passed from call site
        return function () {
            var _this = this;
            return new Promise(function (finishCallback, failCallback) {
                runInTestZone(fn, _this, finishCallback, failCallback);
            });
        };
    }
    function runInTestZone(fn, context, finishCallback, failCallback) {
        var currentZone = Zone.current;
        var AsyncTestZoneSpec = Zone['AsyncTestZoneSpec'];
        if (AsyncTestZoneSpec === undefined) {
            throw new Error('AsyncTestZoneSpec is needed for the async() test helper but could not be found. ' +
                'Please make sure that your environment includes zone.js/dist/async-test.js');
        }
        var ProxyZoneSpec = Zone['ProxyZoneSpec'];
        if (ProxyZoneSpec === undefined) {
            throw new Error('ProxyZoneSpec is needed for the async() test helper but could not be found. ' +
                'Please make sure that your environment includes zone.js/dist/proxy.js');
        }
        var proxyZoneSpec = ProxyZoneSpec.get();
        ProxyZoneSpec.assertPresent();
        // We need to create the AsyncTestZoneSpec outside the ProxyZone.
        // If we do it in ProxyZone then we will get to infinite recursion.
        var proxyZone = Zone.current.getZoneWith('ProxyZoneSpec');
        var previousDelegate = proxyZoneSpec.getDelegate();
        proxyZone.parent.run(function () {
            var testZoneSpec = new AsyncTestZoneSpec(function () {
                // Need to restore the original zone.
                currentZone.run(function () {
                    if (proxyZoneSpec.getDelegate() == testZoneSpec) {
                        // Only reset the zone spec if it's sill this one. Otherwise, assume it's OK.
                        proxyZoneSpec.setDelegate(previousDelegate);
                    }
                    finishCallback();
                });
            }, function (error) {
                // Need to restore the original zone.
                currentZone.run(function () {
                    if (proxyZoneSpec.getDelegate() == testZoneSpec) {
                        // Only reset the zone spec if it's sill this one. Otherwise, assume it's OK.
                        proxyZoneSpec.setDelegate(previousDelegate);
                    }
                    failCallback(error);
                });
            }, 'test');
            proxyZoneSpec.setDelegate(testZoneSpec);
        });
        return Zone.current.runGuarded(fn, context);
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Wraps a test function in an asynchronous test zone. The test will automatically
     * complete when all asynchronous calls within this zone are done. Can be used
     * to wrap an {@link inject} call.
     *
     * Example:
     *
     * ```
     * it('...', async(inject([AClass], (object) => {
     *   object.doSomething.then(() => {
     *     expect(...);
     *   })
     * });
     * ```
     *
     *
     */
    function async(fn) {
        var _Zone = typeof Zone !== 'undefined' ? Zone : null;
        if (!_Zone) {
            return function () {
                return Promise.reject('Zone is needed for the async() test helper but could not be found. ' +
                    'Please make sure that your environment includes zone.js/dist/zone.js');
            };
        }
        var asyncTest = _Zone && _Zone[_Zone.__symbol__('asyncTest')];
        if (typeof asyncTest === 'function') {
            return asyncTest(fn);
        }
        // not using new version of zone.js
        // TODO @JiaLiPassion, remove this after all library updated to
        // newest version of zone.js(0.8.25)
        return asyncFallback(fn);
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Fixture for debugging and testing a component.
     *
     *
     */
    var ComponentFixture = /** @class */ (function () {
        function ComponentFixture(componentRef, ngZone, _autoDetect) {
            var _this = this;
            this.componentRef = componentRef;
            this.ngZone = ngZone;
            this._autoDetect = _autoDetect;
            this._isStable = true;
            this._isDestroyed = false;
            this._resolve = null;
            this._promise = null;
            this._onUnstableSubscription = null;
            this._onStableSubscription = null;
            this._onMicrotaskEmptySubscription = null;
            this._onErrorSubscription = null;
            this.changeDetectorRef = componentRef.changeDetectorRef;
            this.elementRef = componentRef.location;
            this.debugElement = core.getDebugNode(this.elementRef.nativeElement);
            this.componentInstance = componentRef.instance;
            this.nativeElement = this.elementRef.nativeElement;
            this.componentRef = componentRef;
            this.ngZone = ngZone;
            if (ngZone) {
                // Create subscriptions outside the NgZone so that the callbacks run oustide
                // of NgZone.
                ngZone.runOutsideAngular(function () {
                    _this._onUnstableSubscription =
                        ngZone.onUnstable.subscribe({ next: function () { _this._isStable = false; } });
                    _this._onMicrotaskEmptySubscription = ngZone.onMicrotaskEmpty.subscribe({
                        next: function () {
                            if (_this._autoDetect) {
                                // Do a change detection run with checkNoChanges set to true to check
                                // there are no changes on the second run.
                                _this.detectChanges(true);
                            }
                        }
                    });
                    _this._onStableSubscription = ngZone.onStable.subscribe({
                        next: function () {
                            _this._isStable = true;
                            // Check whether there is a pending whenStable() completer to resolve.
                            if (_this._promise !== null) {
                                // If so check whether there are no pending macrotasks before resolving.
                                // Do this check in the next tick so that ngZone gets a chance to update the state of
                                // pending macrotasks.
                                scheduleMicroTask(function () {
                                    if (!ngZone.hasPendingMacrotasks) {
                                        if (_this._promise !== null) {
                                            _this._resolve(true);
                                            _this._resolve = null;
                                            _this._promise = null;
                                        }
                                    }
                                });
                            }
                        }
                    });
                    _this._onErrorSubscription =
                        ngZone.onError.subscribe({ next: function (error) { throw error; } });
                });
            }
        }
        ComponentFixture.prototype._tick = function (checkNoChanges) {
            this.changeDetectorRef.detectChanges();
            if (checkNoChanges) {
                this.checkNoChanges();
            }
        };
        /**
         * Trigger a change detection cycle for the component.
         */
        ComponentFixture.prototype.detectChanges = function (checkNoChanges) {
            var _this = this;
            if (checkNoChanges === void 0) { checkNoChanges = true; }
            if (this.ngZone != null) {
                // Run the change detection inside the NgZone so that any async tasks as part of the change
                // detection are captured by the zone and can be waited for in isStable.
                this.ngZone.run(function () { _this._tick(checkNoChanges); });
            }
            else {
                // Running without zone. Just do the change detection.
                this._tick(checkNoChanges);
            }
        };
        /**
         * Do a change detection run to make sure there were no changes.
         */
        ComponentFixture.prototype.checkNoChanges = function () { this.changeDetectorRef.checkNoChanges(); };
        /**
         * Set whether the fixture should autodetect changes.
         *
         * Also runs detectChanges once so that any existing change is detected.
         */
        ComponentFixture.prototype.autoDetectChanges = function (autoDetect) {
            if (autoDetect === void 0) { autoDetect = true; }
            if (this.ngZone == null) {
                throw new Error('Cannot call autoDetectChanges when ComponentFixtureNoNgZone is set');
            }
            this._autoDetect = autoDetect;
            this.detectChanges();
        };
        /**
         * Return whether the fixture is currently stable or has async tasks that have not been completed
         * yet.
         */
        ComponentFixture.prototype.isStable = function () { return this._isStable && !this.ngZone.hasPendingMacrotasks; };
        /**
         * Get a promise that resolves when the fixture is stable.
         *
         * This can be used to resume testing after events have triggered asynchronous activity or
         * asynchronous change detection.
         */
        ComponentFixture.prototype.whenStable = function () {
            var _this = this;
            if (this.isStable()) {
                return Promise.resolve(false);
            }
            else if (this._promise !== null) {
                return this._promise;
            }
            else {
                this._promise = new Promise(function (res) { _this._resolve = res; });
                return this._promise;
            }
        };
        ComponentFixture.prototype._getRenderer = function () {
            if (this._renderer === undefined) {
                this._renderer = this.componentRef.injector.get(core.RendererFactory2, null);
            }
            return this._renderer;
        };
        /**
          * Get a promise that resolves when the ui state is stable following animations.
          */
        ComponentFixture.prototype.whenRenderingDone = function () {
            var renderer = this._getRenderer();
            if (renderer && renderer.whenRenderingDone) {
                return renderer.whenRenderingDone();
            }
            return this.whenStable();
        };
        /**
         * Trigger component destruction.
         */
        ComponentFixture.prototype.destroy = function () {
            if (!this._isDestroyed) {
                this.componentRef.destroy();
                if (this._onUnstableSubscription != null) {
                    this._onUnstableSubscription.unsubscribe();
                    this._onUnstableSubscription = null;
                }
                if (this._onStableSubscription != null) {
                    this._onStableSubscription.unsubscribe();
                    this._onStableSubscription = null;
                }
                if (this._onMicrotaskEmptySubscription != null) {
                    this._onMicrotaskEmptySubscription.unsubscribe();
                    this._onMicrotaskEmptySubscription = null;
                }
                if (this._onErrorSubscription != null) {
                    this._onErrorSubscription.unsubscribe();
                    this._onErrorSubscription = null;
                }
                this._isDestroyed = true;
            }
        };
        return ComponentFixture;
    }());
    function scheduleMicroTask(fn) {
        Zone.current.scheduleMicroTask('scheduleMicrotask', fn);
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * fakeAsync has been moved to zone.js
     * this file is for fallback in case old version of zone.js is used
     */
    var _Zone = typeof Zone !== 'undefined' ? Zone : null;
    var FakeAsyncTestZoneSpec = _Zone && _Zone['FakeAsyncTestZoneSpec'];
    var ProxyZoneSpec = _Zone && _Zone['ProxyZoneSpec'];
    var _fakeAsyncTestZoneSpec = null;
    /**
     * Clears out the shared fake async zone for a test.
     * To be called in a global `beforeEach`.
     *
     * @experimental
     */
    function resetFakeAsyncZoneFallback() {
        _fakeAsyncTestZoneSpec = null;
        // in node.js testing we may not have ProxyZoneSpec in which case there is nothing to reset.
        ProxyZoneSpec && ProxyZoneSpec.assertPresent().resetDelegate();
    }
    var _inFakeAsyncCall = false;
    /**
     * Wraps a function to be executed in the fakeAsync zone:
     * - microtasks are manually executed by calling `flushMicrotasks()`,
     * - timers are synchronous, `tick()` simulates the asynchronous passage of time.
     *
     * If there are any pending timers at the end of the function, an exception will be thrown.
     *
     * Can be used to wrap inject() calls.
     *
     * @usageNotes
     * ### Example
     *
     * {@example core/testing/ts/fake_async.ts region='basic'}
     *
     * @param fn
     * @returns The function wrapped to be executed in the fakeAsync zone
     *
     * @experimental
     */
    function fakeAsyncFallback(fn) {
        // Not using an arrow function to preserve context passed from call site
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var proxyZoneSpec = ProxyZoneSpec.assertPresent();
            if (_inFakeAsyncCall) {
                throw new Error('fakeAsync() calls can not be nested');
            }
            _inFakeAsyncCall = true;
            try {
                if (!_fakeAsyncTestZoneSpec) {
                    if (proxyZoneSpec.getDelegate() instanceof FakeAsyncTestZoneSpec) {
                        throw new Error('fakeAsync() calls can not be nested');
                    }
                    _fakeAsyncTestZoneSpec = new FakeAsyncTestZoneSpec();
                }
                var res = void 0;
                var lastProxyZoneSpec = proxyZoneSpec.getDelegate();
                proxyZoneSpec.setDelegate(_fakeAsyncTestZoneSpec);
                try {
                    res = fn.apply(this, args);
                    flushMicrotasksFallback();
                }
                finally {
                    proxyZoneSpec.setDelegate(lastProxyZoneSpec);
                }
                if (_fakeAsyncTestZoneSpec.pendingPeriodicTimers.length > 0) {
                    throw new Error(_fakeAsyncTestZoneSpec.pendingPeriodicTimers.length + " " +
                        "periodic timer(s) still in the queue.");
                }
                if (_fakeAsyncTestZoneSpec.pendingTimers.length > 0) {
                    throw new Error(_fakeAsyncTestZoneSpec.pendingTimers.length + " timer(s) still in the queue.");
                }
                return res;
            }
            finally {
                _inFakeAsyncCall = false;
                resetFakeAsyncZoneFallback();
            }
        };
    }
    function _getFakeAsyncZoneSpec() {
        if (_fakeAsyncTestZoneSpec == null) {
            throw new Error('The code should be running in the fakeAsync zone to call this function');
        }
        return _fakeAsyncTestZoneSpec;
    }
    /**
     * Simulates the asynchronous passage of time for the timers in the fakeAsync zone.
     *
     * The microtasks queue is drained at the very start of this function and after any timer callback
     * has been executed.
     *
     * @usageNotes
     * ### Example
     *
     * {@example core/testing/ts/fake_async.ts region='basic'}
     *
     * @experimental
     */
    function tickFallback(millis) {
        if (millis === void 0) { millis = 0; }
        _getFakeAsyncZoneSpec().tick(millis);
    }
    /**
     * Simulates the asynchronous passage of time for the timers in the fakeAsync zone by
     * draining the macrotask queue until it is empty. The returned value is the milliseconds
     * of time that would have been elapsed.
     *
     * @param maxTurns
     * @returns The simulated time elapsed, in millis.
     *
     * @experimental
     */
    function flushFallback(maxTurns) {
        return _getFakeAsyncZoneSpec().flush(maxTurns);
    }
    /**
     * Discard all remaining periodic tasks.
     *
     * @experimental
     */
    function discardPeriodicTasksFallback() {
        var zoneSpec = _getFakeAsyncZoneSpec();
        var pendingTimers = zoneSpec.pendingPeriodicTimers;
        zoneSpec.pendingPeriodicTimers.length = 0;
    }
    /**
     * Flush any pending microtasks.
     *
     * @experimental
     */
    function flushMicrotasksFallback() {
        _getFakeAsyncZoneSpec().flushMicrotasks();
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var _Zone$1 = typeof Zone !== 'undefined' ? Zone : null;
    var fakeAsyncTestModule = _Zone$1 && _Zone$1[_Zone$1.__symbol__('fakeAsyncTest')];
    /**
     * Clears out the shared fake async zone for a test.
     * To be called in a global `beforeEach`.
     *
     * @experimental
     */
    function resetFakeAsyncZone() {
        if (fakeAsyncTestModule) {
            return fakeAsyncTestModule.resetFakeAsyncZone();
        }
        else {
            return resetFakeAsyncZoneFallback();
        }
    }
    /**
     * Wraps a function to be executed in the fakeAsync zone:
     * - microtasks are manually executed by calling `flushMicrotasks()`,
     * - timers are synchronous, `tick()` simulates the asynchronous passage of time.
     *
     * If there are any pending timers at the end of the function, an exception will be thrown.
     *
     * Can be used to wrap inject() calls.
     *
     * @usageNotes
     * ### Example
     *
     * {@example core/testing/ts/fake_async.ts region='basic'}
     *
     * @param fn
     * @returns The function wrapped to be executed in the fakeAsync zone
     *
     * @experimental
     */
    function fakeAsync(fn) {
        if (fakeAsyncTestModule) {
            return fakeAsyncTestModule.fakeAsync(fn);
        }
        else {
            return fakeAsyncFallback(fn);
        }
    }
    /**
     * Simulates the asynchronous passage of time for the timers in the fakeAsync zone.
     *
     * The microtasks queue is drained at the very start of this function and after any timer callback
     * has been executed.
     *
     * @usageNotes
     * ### Example
     *
     * {@example core/testing/ts/fake_async.ts region='basic'}
     *
     * @experimental
     */
    function tick(millis) {
        if (millis === void 0) { millis = 0; }
        if (fakeAsyncTestModule) {
            return fakeAsyncTestModule.tick(millis);
        }
        else {
            return tickFallback(millis);
        }
    }
    /**
     * Simulates the asynchronous passage of time for the timers in the fakeAsync zone by
     * draining the macrotask queue until it is empty. The returned value is the milliseconds
     * of time that would have been elapsed.
     *
     * @param maxTurns
     * @returns The simulated time elapsed, in millis.
     *
     * @experimental
     */
    function flush(maxTurns) {
        if (fakeAsyncTestModule) {
            return fakeAsyncTestModule.flush(maxTurns);
        }
        else {
            return flushFallback(maxTurns);
        }
    }
    /**
     * Discard all remaining periodic tasks.
     *
     * @experimental
     */
    function discardPeriodicTasks() {
        if (fakeAsyncTestModule) {
            return fakeAsyncTestModule.discardPeriodicTasks();
        }
        else {
            discardPeriodicTasksFallback();
        }
    }
    /**
     * Flush any pending microtasks.
     *
     * @experimental
     */
    function flushMicrotasks() {
        if (fakeAsyncTestModule) {
            return fakeAsyncTestModule.flushMicrotasks();
        }
        else {
            return flushMicrotasksFallback();
        }
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    function __values(o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Injectable completer that allows signaling completion of an asynchronous test. Used internally.
     */
    var AsyncTestCompleter = /** @class */ (function () {
        function AsyncTestCompleter() {
            var _this = this;
            this._promise = new Promise(function (res, rej) {
                _this._resolve = res;
                _this._reject = rej;
            });
        }
        AsyncTestCompleter.prototype.done = function (value) { this._resolve(value); };
        AsyncTestCompleter.prototype.fail = function (error, stackTrace) { this._reject(error); };
        Object.defineProperty(AsyncTestCompleter.prototype, "promise", {
            get: function () { return this._promise; },
            enumerable: true,
            configurable: true
        });
        return AsyncTestCompleter;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    function unimplemented() {
        throw Error('unimplemented');
    }
    /**
     * Special interface to the compiler only used by testing
     *
     * @experimental
     */
    var TestingCompiler = /** @class */ (function (_super) {
        __extends(TestingCompiler, _super);
        function TestingCompiler() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(TestingCompiler.prototype, "injector", {
            get: function () { throw unimplemented(); },
            enumerable: true,
            configurable: true
        });
        TestingCompiler.prototype.overrideModule = function (module, overrides) {
            throw unimplemented();
        };
        TestingCompiler.prototype.overrideDirective = function (directive, overrides) {
            throw unimplemented();
        };
        TestingCompiler.prototype.overrideComponent = function (component, overrides) {
            throw unimplemented();
        };
        TestingCompiler.prototype.overridePipe = function (directive, overrides) {
            throw unimplemented();
        };
        /**
         * Allows to pass the compile summary from AOT compilation to the JIT compiler,
         * so that it can use the code generated by AOT.
         */
        TestingCompiler.prototype.loadAotSummaries = function (summaries) { throw unimplemented(); };
        /**
         * Gets the component factory for the given component.
         * This assumes that the component has been compiled before calling this call using
         * `compileModuleAndAllComponents*`.
         */
        TestingCompiler.prototype.getComponentFactory = function (component) { throw unimplemented(); };
        /**
         * Returns the component type that is stored in the given error.
         * This can be used for errors created by compileModule...
         */
        TestingCompiler.prototype.getComponentFromError = function (error) { throw unimplemented(); };
        TestingCompiler.decorators = [
            { type: core.Injectable }
        ];
        return TestingCompiler;
    }(core.Compiler));
    /**
     * A factory for creating a Compiler
     *
     * @experimental
     */
    var TestingCompilerFactory = /** @class */ (function () {
        function TestingCompilerFactory() {
        }
        return TestingCompilerFactory;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var UNDEFINED = new Object();
    /**
     * An abstract class for inserting the root test component element in a platform independent way.
     *
     * @experimental
     */
    var TestComponentRenderer = /** @class */ (function () {
        function TestComponentRenderer() {
        }
        TestComponentRenderer.prototype.insertRootElement = function (rootElementId) { };
        return TestComponentRenderer;
    }());
    var _nextRootElementId = 0;
    /**
     * @experimental
     */
    var ComponentFixtureAutoDetect = new core.InjectionToken('ComponentFixtureAutoDetect');
    /**
     * @experimental
     */
    var ComponentFixtureNoNgZone = new core.InjectionToken('ComponentFixtureNoNgZone');
    /**
     * @description
     * Configures and initializes environment for unit testing and provides methods for
     * creating components and services in unit tests.
     *
     * TestBed is the primary api for writing unit tests for Angular applications and libraries.
     *
     *
     */
    var TestBed = /** @class */ (function () {
        function TestBed() {
            this._instantiated = false;
            this._compiler = null;
            this._moduleRef = null;
            this._moduleFactory = null;
            this._compilerOptions = [];
            this._moduleOverrides = [];
            this._componentOverrides = [];
            this._directiveOverrides = [];
            this._pipeOverrides = [];
            this._providers = [];
            this._declarations = [];
            this._imports = [];
            this._schemas = [];
            this._activeFixtures = [];
            this._testEnvAotSummaries = function () { return []; };
            this._aotSummaries = [];
            this._templateOverrides = [];
            this._isRoot = true;
            this._rootProviderOverrides = [];
            this.platform = null;
            this.ngModule = null;
        }
        /**
         * Initialize the environment for testing with a compiler factory, a PlatformRef, and an
         * angular module. These are common to every test in the suite.
         *
         * This may only be called once, to set up the common providers for the current test
         * suite on the current platform. If you absolutely need to change the providers,
         * first use `resetTestEnvironment`.
         *
         * Test modules and platforms for individual platforms are available from
         * '@angular/<platform_name>/testing'.
         *
         * @experimental
         */
        TestBed.initTestEnvironment = function (ngModule, platform, aotSummaries) {
            var testBed = getTestBed();
            testBed.initTestEnvironment(ngModule, platform, aotSummaries);
            return testBed;
        };
        /**
         * Reset the providers for the test injector.
         *
         * @experimental
         */
        TestBed.resetTestEnvironment = function () { getTestBed().resetTestEnvironment(); };
        TestBed.resetTestingModule = function () {
            getTestBed().resetTestingModule();
            return TestBed;
        };
        /**
         * Allows overriding default compiler providers and settings
         * which are defined in test_injector.js
         */
        TestBed.configureCompiler = function (config) {
            getTestBed().configureCompiler(config);
            return TestBed;
        };
        /**
         * Allows overriding default providers, directives, pipes, modules of the test injector,
         * which are defined in test_injector.js
         */
        TestBed.configureTestingModule = function (moduleDef) {
            getTestBed().configureTestingModule(moduleDef);
            return TestBed;
        };
        /**
         * Compile components with a `templateUrl` for the test's NgModule.
         * It is necessary to call this function
         * as fetching urls is asynchronous.
         */
        TestBed.compileComponents = function () { return getTestBed().compileComponents(); };
        TestBed.overrideModule = function (ngModule, override) {
            getTestBed().overrideModule(ngModule, override);
            return TestBed;
        };
        TestBed.overrideComponent = function (component, override) {
            getTestBed().overrideComponent(component, override);
            return TestBed;
        };
        TestBed.overrideDirective = function (directive, override) {
            getTestBed().overrideDirective(directive, override);
            return TestBed;
        };
        TestBed.overridePipe = function (pipe, override) {
            getTestBed().overridePipe(pipe, override);
            return TestBed;
        };
        TestBed.overrideTemplate = function (component, template) {
            getTestBed().overrideComponent(component, { set: { template: template, templateUrl: null } });
            return TestBed;
        };
        /**
         * Overrides the template of the given component, compiling the template
         * in the context of the TestingModule.
         *
         * Note: This works for JIT and AOTed components as well.
         */
        TestBed.overrideTemplateUsingTestingModule = function (component, template) {
            getTestBed().overrideTemplateUsingTestingModule(component, template);
            return TestBed;
        };
        TestBed.overrideProvider = function (token, provider) {
            getTestBed().overrideProvider(token, provider);
            return TestBed;
        };
        TestBed.deprecatedOverrideProvider = function (token, provider) {
            getTestBed().deprecatedOverrideProvider(token, provider);
            return TestBed;
        };
        TestBed.get = function (token, notFoundValue) {
            if (notFoundValue === void 0) { notFoundValue = core.Injector.THROW_IF_NOT_FOUND; }
            return getTestBed().get(token, notFoundValue);
        };
        TestBed.createComponent = function (component) {
            return getTestBed().createComponent(component);
        };
        /**
         * Initialize the environment for testing with a compiler factory, a PlatformRef, and an
         * angular module. These are common to every test in the suite.
         *
         * This may only be called once, to set up the common providers for the current test
         * suite on the current platform. If you absolutely need to change the providers,
         * first use `resetTestEnvironment`.
         *
         * Test modules and platforms for individual platforms are available from
         * '@angular/<platform_name>/testing'.
         *
         * @experimental
         */
        TestBed.prototype.initTestEnvironment = function (ngModule, platform, aotSummaries) {
            if (this.platform || this.ngModule) {
                throw new Error('Cannot set base providers because it has already been called');
            }
            this.platform = platform;
            this.ngModule = ngModule;
            if (aotSummaries) {
                this._testEnvAotSummaries = aotSummaries;
            }
        };
        /**
         * Reset the providers for the test injector.
         *
         * @experimental
         */
        TestBed.prototype.resetTestEnvironment = function () {
            this.resetTestingModule();
            this.platform = null;
            this.ngModule = null;
            this._testEnvAotSummaries = function () { return []; };
        };
        TestBed.prototype.resetTestingModule = function () {
            core.ɵclearOverrides();
            this._aotSummaries = [];
            this._templateOverrides = [];
            this._compiler = null;
            this._moduleOverrides = [];
            this._componentOverrides = [];
            this._directiveOverrides = [];
            this._pipeOverrides = [];
            this._isRoot = true;
            this._rootProviderOverrides = [];
            this._moduleRef = null;
            this._moduleFactory = null;
            this._compilerOptions = [];
            this._providers = [];
            this._declarations = [];
            this._imports = [];
            this._schemas = [];
            this._instantiated = false;
            this._activeFixtures.forEach(function (fixture) {
                try {
                    fixture.destroy();
                }
                catch (e) {
                    console.error('Error during cleanup of component', {
                        component: fixture.componentInstance,
                        stacktrace: e,
                    });
                }
            });
            this._activeFixtures = [];
        };
        TestBed.prototype.configureCompiler = function (config) {
            this._assertNotInstantiated('TestBed.configureCompiler', 'configure the compiler');
            this._compilerOptions.push(config);
        };
        TestBed.prototype.configureTestingModule = function (moduleDef) {
            this._assertNotInstantiated('TestBed.configureTestingModule', 'configure the test module');
            if (moduleDef.providers) {
                (_a = this._providers).push.apply(_a, __spread(moduleDef.providers));
            }
            if (moduleDef.declarations) {
                (_b = this._declarations).push.apply(_b, __spread(moduleDef.declarations));
            }
            if (moduleDef.imports) {
                (_c = this._imports).push.apply(_c, __spread(moduleDef.imports));
            }
            if (moduleDef.schemas) {
                (_d = this._schemas).push.apply(_d, __spread(moduleDef.schemas));
            }
            if (moduleDef.aotSummaries) {
                this._aotSummaries.push(moduleDef.aotSummaries);
            }
            var _a, _b, _c, _d;
        };
        TestBed.prototype.compileComponents = function () {
            var _this = this;
            if (this._moduleFactory || this._instantiated) {
                return Promise.resolve(null);
            }
            var moduleType = this._createCompilerAndModule();
            return this._compiler.compileModuleAndAllComponentsAsync(moduleType)
                .then(function (moduleAndComponentFactories) {
                _this._moduleFactory = moduleAndComponentFactories.ngModuleFactory;
            });
        };
        TestBed.prototype._initIfNeeded = function () {
            if (this._instantiated) {
                return;
            }
            if (!this._moduleFactory) {
                try {
                    var moduleType = this._createCompilerAndModule();
                    this._moduleFactory =
                        this._compiler.compileModuleAndAllComponentsSync(moduleType).ngModuleFactory;
                }
                catch (e) {
                    var errorCompType = this._compiler.getComponentFromError(e);
                    if (errorCompType) {
                        throw new Error("This test module uses the component " + core.ɵstringify(errorCompType) + " which is using a \"templateUrl\" or \"styleUrls\", but they were never compiled. " +
                            "Please call \"TestBed.compileComponents\" before your test.");
                    }
                    else {
                        throw e;
                    }
                }
            }
            try {
                for (var _a = __values(this._templateOverrides), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var _c = _b.value, component = _c.component, templateOf = _c.templateOf;
                    var compFactory = this._compiler.getComponentFactory(templateOf);
                    core.ɵoverrideComponentView(component, compFactory);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var ngZone = new core.NgZone({ enableLongStackTrace: true });
            var providers = [{ provide: core.NgZone, useValue: ngZone }];
            var ngZoneInjector = core.Injector.create({
                providers: providers,
                parent: this.platform.injector,
                name: this._moduleFactory.moduleType.name
            });
            this._moduleRef = this._moduleFactory.create(ngZoneInjector);
            // ApplicationInitStatus.runInitializers() is marked @internal to core. So casting to any
            // before accessing it.
            this._moduleRef.injector.get(core.ApplicationInitStatus).runInitializers();
            this._instantiated = true;
            var e_1, _d;
        };
        TestBed.prototype._createCompilerAndModule = function () {
            var _this = this;
            var providers = this._providers.concat([{ provide: TestBed, useValue: this }]);
            var declarations = __spread(this._declarations, this._templateOverrides.map(function (entry) { return entry.templateOf; }));
            var rootScopeImports = [];
            var rootProviderOverrides = this._rootProviderOverrides;
            if (this._isRoot) {
                var RootScopeModule = /** @class */ (function () {
                    function RootScopeModule() {
                    }
                    RootScopeModule.decorators = [
                        { type: core.NgModule, args: [{
                                    providers: __spread(rootProviderOverrides),
                                },] },
                    ];
                    return RootScopeModule;
                }());
                rootScopeImports.push(RootScopeModule);
            }
            providers.push({ provide: core.ɵAPP_ROOT, useValue: this._isRoot });
            var imports = [rootScopeImports, this.ngModule, this._imports];
            var schemas = this._schemas;
            var DynamicTestModule = /** @class */ (function () {
                function DynamicTestModule() {
                }
                DynamicTestModule.decorators = [
                    { type: core.NgModule, args: [{ providers: providers, declarations: declarations, imports: imports, schemas: schemas },] },
                ];
                return DynamicTestModule;
            }());
            var compilerFactory = this.platform.injector.get(TestingCompilerFactory);
            this._compiler = compilerFactory.createTestingCompiler(this._compilerOptions);
            try {
                for (var _a = __values(__spread([this._testEnvAotSummaries], this._aotSummaries)), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var summary = _b.value;
                    this._compiler.loadAotSummaries(summary);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_2) throw e_2.error; }
            }
            this._moduleOverrides.forEach(function (entry) { return _this._compiler.overrideModule(entry[0], entry[1]); });
            this._componentOverrides.forEach(function (entry) { return _this._compiler.overrideComponent(entry[0], entry[1]); });
            this._directiveOverrides.forEach(function (entry) { return _this._compiler.overrideDirective(entry[0], entry[1]); });
            this._pipeOverrides.forEach(function (entry) { return _this._compiler.overridePipe(entry[0], entry[1]); });
            return DynamicTestModule;
            var e_2, _c;
        };
        TestBed.prototype._assertNotInstantiated = function (methodName, methodDescription) {
            if (this._instantiated) {
                throw new Error("Cannot " + methodDescription + " when the test module has already been instantiated. " +
                    ("Make sure you are not using `inject` before `" + methodName + "`."));
            }
        };
        TestBed.prototype.get = function (token, notFoundValue) {
            if (notFoundValue === void 0) { notFoundValue = core.Injector.THROW_IF_NOT_FOUND; }
            this._initIfNeeded();
            if (token === TestBed) {
                return this;
            }
            // Tests can inject things from the ng module and from the compiler,
            // but the ng module can't inject things from the compiler and vice versa.
            var result = this._moduleRef.injector.get(token, UNDEFINED);
            return result === UNDEFINED ? this._compiler.injector.get(token, notFoundValue) : result;
        };
        TestBed.prototype.execute = function (tokens, fn, context) {
            var _this = this;
            this._initIfNeeded();
            var params = tokens.map(function (t) { return _this.get(t); });
            return fn.apply(context, params);
        };
        TestBed.prototype.overrideModule = function (ngModule, override) {
            this._assertNotInstantiated('overrideModule', 'override module metadata');
            this._moduleOverrides.push([ngModule, override]);
        };
        TestBed.prototype.overrideComponent = function (component, override) {
            this._assertNotInstantiated('overrideComponent', 'override component metadata');
            this._componentOverrides.push([component, override]);
        };
        TestBed.prototype.overrideDirective = function (directive, override) {
            this._assertNotInstantiated('overrideDirective', 'override directive metadata');
            this._directiveOverrides.push([directive, override]);
        };
        TestBed.prototype.overridePipe = function (pipe, override) {
            this._assertNotInstantiated('overridePipe', 'override pipe metadata');
            this._pipeOverrides.push([pipe, override]);
        };
        TestBed.prototype.overrideProvider = function (token, provider) {
            this.overrideProviderImpl(token, provider);
        };
        TestBed.prototype.deprecatedOverrideProvider = function (token, provider) {
            this.overrideProviderImpl(token, provider, /* deprecated */ true);
        };
        TestBed.prototype.overrideProviderImpl = function (token, provider, deprecated) {
            if (deprecated === void 0) { deprecated = false; }
            if (typeof token !== 'string' && token.ngInjectableDef &&
                token.ngInjectableDef.providedIn === 'root') {
                if (provider.useFactory) {
                    this._rootProviderOverrides.push({ provide: token, useFactory: provider.useFactory, deps: provider.deps || [] });
                }
                else {
                    this._rootProviderOverrides.push({ provide: token, useValue: provider.useValue });
                }
            }
            var flags = 0;
            var value;
            if (provider.useFactory) {
                flags |= 1024 /* TypeFactoryProvider */;
                value = provider.useFactory;
            }
            else {
                flags |= 256 /* TypeValueProvider */;
                value = provider.useValue;
            }
            var deps = (provider.deps || []).map(function (dep) {
                var depFlags = 0 /* None */;
                var depToken;
                if (Array.isArray(dep)) {
                    dep.forEach(function (entry) {
                        if (entry instanceof core.Optional) {
                            depFlags |= 2 /* Optional */;
                        }
                        else if (entry instanceof core.SkipSelf) {
                            depFlags |= 1 /* SkipSelf */;
                        }
                        else {
                            depToken = entry;
                        }
                    });
                }
                else {
                    depToken = dep;
                }
                return [depFlags, depToken];
            });
            core.ɵoverrideProvider({ token: token, flags: flags, deps: deps, value: value, deprecatedBehavior: deprecated });
        };
        TestBed.prototype.overrideTemplateUsingTestingModule = function (component, template) {
            this._assertNotInstantiated('overrideTemplateUsingTestingModule', 'override template');
            var OverrideComponent = /** @class */ (function () {
                function OverrideComponent() {
                }
                OverrideComponent.decorators = [
                    { type: core.Component, args: [{ selector: 'empty', template: template },] },
                ];
                return OverrideComponent;
            }());
            this._templateOverrides.push({ component: component, templateOf: OverrideComponent });
        };
        TestBed.prototype.createComponent = function (component) {
            var _this = this;
            this._initIfNeeded();
            var componentFactory = this._compiler.getComponentFactory(component);
            if (!componentFactory) {
                throw new Error("Cannot create the component " + core.ɵstringify(component) + " as it was not imported into the testing module!");
            }
            var noNgZone = this.get(ComponentFixtureNoNgZone, false);
            var autoDetect = this.get(ComponentFixtureAutoDetect, false);
            var ngZone = noNgZone ? null : this.get(core.NgZone, null);
            var testComponentRenderer = this.get(TestComponentRenderer);
            var rootElId = "root" + _nextRootElementId++;
            testComponentRenderer.insertRootElement(rootElId);
            var initComponent = function () {
                var componentRef = componentFactory.create(core.Injector.NULL, [], "#" + rootElId, _this._moduleRef);
                return new ComponentFixture(componentRef, ngZone, autoDetect);
            };
            var fixture = !ngZone ? initComponent() : ngZone.run(initComponent);
            this._activeFixtures.push(fixture);
            return fixture;
        };
        return TestBed;
    }());
    var _testBed = null;
    /**
     * @experimental
     */
    function getTestBed() {
        return _testBed = _testBed || new TestBed();
    }
    /**
     * Allows injecting dependencies in `beforeEach()` and `it()`.
     *
     * Example:
     *
     * ```
     * beforeEach(inject([Dependency, AClass], (dep, object) => {
     *   // some code that uses `dep` and `object`
     *   // ...
     * }));
     *
     * it('...', inject([AClass], (object) => {
     *   object.doSomething();
     *   expect(...);
     * })
     * ```
     *
     * Notes:
     * - inject is currently a function because of some Traceur limitation the syntax should
     * eventually
     *   becomes `it('...', @Inject (object: AClass, async: AsyncTestCompleter) => { ... });`
     *
     *
     */
    function inject(tokens, fn) {
        var testBed = getTestBed();
        if (tokens.indexOf(AsyncTestCompleter) >= 0) {
            // Not using an arrow function to preserve context passed from call site
            return function () {
                var _this = this;
                // Return an async test method that returns a Promise if AsyncTestCompleter is one of
                // the injected tokens.
                return testBed.compileComponents().then(function () {
                    var completer = testBed.get(AsyncTestCompleter);
                    testBed.execute(tokens, fn, _this);
                    return completer.promise;
                });
            };
        }
        else {
            // Not using an arrow function to preserve context passed from call site
            return function () { return testBed.execute(tokens, fn, this); };
        }
    }
    /**
     * @experimental
     */
    var InjectSetupWrapper = /** @class */ (function () {
        function InjectSetupWrapper(_moduleDef) {
            this._moduleDef = _moduleDef;
        }
        InjectSetupWrapper.prototype._addModule = function () {
            var moduleDef = this._moduleDef();
            if (moduleDef) {
                getTestBed().configureTestingModule(moduleDef);
            }
        };
        InjectSetupWrapper.prototype.inject = function (tokens, fn) {
            var self = this;
            // Not using an arrow function to preserve context passed from call site
            return function () {
                self._addModule();
                return inject(tokens, fn).call(this);
            };
        };
        return InjectSetupWrapper;
    }());
    function withModule(moduleDef, fn) {
        if (fn) {
            // Not using an arrow function to preserve context passed from call site
            return function () {
                var testBed = getTestBed();
                if (moduleDef) {
                    testBed.configureTestingModule(moduleDef);
                }
                return fn.apply(this);
            };
        }
        return new InjectSetupWrapper(function () { return moduleDef; });
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var _global$1 = (typeof window === 'undefined' ? global : window);
    // Reset the test providers and the fake async zone before each test.
    if (_global$1.beforeEach) {
        _global$1.beforeEach(function () {
            TestBed.resetTestingModule();
            resetFakeAsyncZone();
        });
    }
    // TODO(juliemr): remove this, only used because we need to export something to have compilation
    // work.
    var __core_private_testing_placeholder__ = '';

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
    * Wraps a function in a new function which sets up document and HTML for running a test.
    *
    * This function is intended to wrap an existing testing function. The wrapper
    * adds HTML to the `body` element of the `document` and subsequently tears it down.
    *
    * This function is intended to be used with `async await` and `Promise`s. If the wrapped
    * function returns a promise (or is `async`) then the teardown is delayed until that `Promise`
    * is resolved.
    *
    * On `node` this function detects if `document` is present and if not it will create one by
    * loading `domino` and installing it.
    *
    * Example:
    *
    * ```
    * describe('something', () => {
    *   it('should do something', withBody('<my-app></my-app>', async () => {
    *     const myApp = renderComponent(MyApp);
    *     await whenRendered(myApp);
    *     expect(getRenderedText(myApp)).toEqual('Hello World!');
    *   }));
    * });
    * ```
    *
    * @param html HTML which should be inserted into `body` of the `document`.
    * @param blockFn function to wrap. The function can return promise or be `async`.
    * @experimental
    */
    function withBody(html, blockFn) {
        return function (done) {
            ensureDocument();
            if (typeof blockFn === 'function') {
                document.body.innerHTML = html;
                // TODO(i): I'm not sure why a cast is required here but otherwise I get
                //   TS2349: Cannot invoke an expression whose type lacks a call signature. Type 'never' has
                //   no compatible call signatures.
                var blockReturn = blockFn();
                if (blockReturn instanceof Promise) {
                    blockReturn = blockReturn.then(done, done.fail);
                }
                else {
                    done();
                }
            }
        };
    }
    var savedDocument = undefined;
    var savedRequestAnimationFrame = undefined;
    var savedNode = undefined;
    var requestAnimationFrameCount = 0;
    var ɵ0 = function (domino) {
        if (typeof global == 'object' && global.process && typeof require == 'function') {
            try {
                return require(domino);
            }
            catch (e) {
                // It is possible that we don't have domino available in which case just give up.
            }
        }
        // Seems like we don't have domino, give up.
        return null;
    };
    /**
     * System.js uses regexp to look for `require` statements. `domino` has to be
     * extracted into a constant so that the regexp in the System.js does not match
     * and does not try to load domino in the browser.
     */
    var domino = (ɵ0)('domino');
    /**
     * Ensure that global has `Document` if we are in node.js
     * @experimental
     */
    function ensureDocument() {
        if (domino) {
            // we are in node.js.
            var window_1 = domino.createWindow('', 'http://localhost');
            savedDocument = global.document;
            global.window = window_1;
            global.document = window_1.document;
            // Trick to avoid Event patching from
            // https://github.com/angular/angular/blob/7cf5e95ac9f0f2648beebf0d5bd9056b79946970/packages/platform-browser/src/dom/events/dom_events.ts#L112-L132
            // It fails with Domino with TypeError: Cannot assign to read only property
            // 'stopImmediatePropagation' of object '#<Event>'
            global.Event = null;
            savedNode = global.Node;
            global.Node = domino.impl.Node;
            savedRequestAnimationFrame = global.requestAnimationFrame;
            global.requestAnimationFrame = function (cb) {
                setImmediate(cb);
                return requestAnimationFrameCount++;
            };
        }
    }
    /**
     * Restore the state of `Document` between tests.
     * @experimental
     */
    function cleanupDocument() {
        if (savedDocument) {
            global.document = savedDocument;
            global.window = undefined;
            savedDocument = undefined;
        }
        if (savedNode) {
            global.Node = savedNode;
            savedNode = undefined;
        }
        if (savedRequestAnimationFrame) {
            global.requestAnimationFrame = savedRequestAnimationFrame;
            savedRequestAnimationFrame = undefined;
        }
    }
    if (typeof beforeEach == 'function')
        beforeEach(ensureDocument);
    if (typeof afterEach == 'function')
        beforeEach(cleanupDocument);

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    // This file only reexports content of the `src` folder. Keep it that way.

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.async = async;
    exports.ComponentFixture = ComponentFixture;
    exports.resetFakeAsyncZone = resetFakeAsyncZone;
    exports.fakeAsync = fakeAsync;
    exports.tick = tick;
    exports.flush = flush;
    exports.discardPeriodicTasks = discardPeriodicTasks;
    exports.flushMicrotasks = flushMicrotasks;
    exports.TestComponentRenderer = TestComponentRenderer;
    exports.ComponentFixtureAutoDetect = ComponentFixtureAutoDetect;
    exports.ComponentFixtureNoNgZone = ComponentFixtureNoNgZone;
    exports.TestBed = TestBed;
    exports.getTestBed = getTestBed;
    exports.inject = inject;
    exports.InjectSetupWrapper = InjectSetupWrapper;
    exports.withModule = withModule;
    exports.__core_private_testing_placeholder__ = __core_private_testing_placeholder__;
    exports.ɵTestingCompiler = TestingCompiler;
    exports.ɵTestingCompilerFactory = TestingCompilerFactory;
    exports.withBody = withBody;
    exports.ensureDocument = ensureDocument;
    exports.cleanupDocument = cleanupDocument;
    exports.ɵ0 = ɵ0;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=core-testing.umd.js.map

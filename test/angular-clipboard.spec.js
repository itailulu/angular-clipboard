describe('angular-clipboard', function () {
    var elm, scope;

    beforeEach(angular.mock.module('angular-clipboard'));

    beforeEach(angular.mock.inject(function ($rootScope, $compile) {
        scope = $rootScope;
        elm = $compile('<button clipboard supported="supported" text="textToCopy" on-copied="success(text)" on-error="fail(err)">Copy</button>')(scope);

        scope.supported = undefined;
        scope.textToCopy = 'Copy me!';
        scope.copied = false;
        scope.success = function (text) {
            //console.log("scope.success called: ", text);
            scope.copied = true;
        };
        scope.fail = function (err) {
            //console.log(err);
        };
        scope.$digest();

        spyOn(scope, 'success').and.callThrough();
        spyOn(scope, 'fail');
    }));

    it('should invoke success callback after successful execCommand', function () {
        spyOn(document, 'execCommand').and.returnValue(true);
        elm.triggerHandler('click');
        expect(scope.success).toHaveBeenCalled();
    });

    it('should invoke fail callback on error in execCommand', function () {
        spyOn(document, 'execCommand').and.returnValue(false);
        elm.triggerHandler('click');
        expect(scope.fail).toHaveBeenCalledWith('failure copy');
    });

    it('should invoke fail callback on invalid child element', function () {
        spyOn(document.body, 'appendChild').and.throwError('fake');
        elm.triggerHandler('click');
        expect(scope.fail).toHaveBeenCalled();
    });

    it('should be caught by angular\'s digest cycle', function () {
        spyOn(document, 'execCommand').and.returnValue(true);
        elm.triggerHandler('click');
        expect(scope.copied).toEqual(true);
    });

    it('should export/return angular module', function () {
        expect(window.angularClipboard).toBeDefined();
        expect(window.angularClipboard.name).toEqual('angular-clipboard');
    });

    it('should feature detect and set supported', function () {
        expect(scope.supported).toEqual(true);
    });

});

describe('with provider', function() {

    var $compile, $rootScope, element, flag;

    /*
    this.options = {
        onCopiedDefaultCallback: false,
        onErrorDefaultCallback: false
    };
    this.configure = function (options) {
        angular.extend(this.options, options);
    };
    */


    describe('set with default callbacks', function() {

        beforeEach(module('angular-clipboard', function (angularClipboardProvider) {

            flag = false;

            function onCopied(text) {
                flag = text;
                //console.log("default onCopied called: ", text);
            }

            function onError(err) {
                flag = err;
            }

            angularClipboardProvider.configure({
                onCopiedDefaultCallback: onCopied,
                onErrorDefaultCallback: onError
            });

        }));

        beforeEach(inject(function (_$compile_, _$rootScope_) {
            $compile = _$compile_;
            $rootScope = _$rootScope_;

            $rootScope.textToCopy = 'Copy me!';

            $rootScope.success = function() {
                flag = 'override copied';
            }

            $rootScope.fail = function(err) {
                flag = 'override fail';
            }

        }));

        describe('and no callbacks in attributes', function() {

            beforeEach(function() {
                element = $compile('<button clipboard text="textToCopy">Copy</button>')($rootScope);
                $rootScope.$digest();
            });

            it('should call the default on-copied', function () {
                spyOn(document, 'execCommand').and.returnValue(true);
                element.triggerHandler('click');
                expect(flag).toBe($rootScope.textToCopy);
            });

            it('should call the default on-error', function () {
                spyOn(document, 'execCommand').and.returnValue(false);
                element.triggerHandler('click');
                expect(flag).toBe('failure copy');
            });
        });

        describe('but with callbacks in attributes', function() {

            beforeEach(function() {
                element = $compile('<button clipboard text="textToCopy" on-copied="success()" on-error="fail(err)">Copy</button>')($rootScope);
                $rootScope.$digest();
            });

            it('should override the default success callback', function() {
                spyOn(document, 'execCommand').and.returnValue(true);
                element.triggerHandler('click');
                expect(flag).toBe('override copied');

            })
            it('should override the default error callback', function() {
                spyOn(document, 'execCommand').and.returnValue(false);
                element.triggerHandler('click');
                expect(flag).toBe('override fail');

            })
        });

    });





});

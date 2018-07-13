"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var DuplicatedDefaultError = /** @class */ (function (_super) {
    __extends(DuplicatedDefaultError, _super);
    function DuplicatedDefaultError(message) {
        var _this = _super.call(this) || this;
        _this.message = message;
        return _this;
    }
    return DuplicatedDefaultError;
}(Error));
exports.DuplicatedDefaultError = DuplicatedDefaultError;

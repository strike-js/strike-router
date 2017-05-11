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
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
/**
 * A route that can be used to provide authentication mechanism.
 */
var AuthRoute = (function (_super) {
    __extends(AuthRoute, _super);
    function AuthRoute(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {};
        return _this;
    }
    AuthRoute.prototype.render = function () {
        return null;
    };
    return AuthRoute;
}(React.Component));
exports.AuthRoute = AuthRoute;
var Route = (function (_super) {
    __extends(Route, _super);
    function Route(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {};
        return _this;
    }
    Route.prototype.render = function () {
        return null;
    };
    return Route;
}(React.Component));
exports.Route = Route;
var IndexRoute = (function (_super) {
    __extends(IndexRoute, _super);
    function IndexRoute(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {};
        return _this;
    }
    IndexRoute.prototype.render = function () {
        return null;
    };
    return IndexRoute;
}(React.Component));
exports.IndexRoute = IndexRoute;
var NotFoundRoute = (function (_super) {
    __extends(NotFoundRoute, _super);
    function NotFoundRoute(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {};
        return _this;
    }
    NotFoundRoute.prototype.render = function () {
        return null;
    };
    return NotFoundRoute;
}(React.Component));
exports.NotFoundRoute = NotFoundRoute;
var Redirect = (function (_super) {
    __extends(Redirect, _super);
    function Redirect(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {};
        return _this;
    }
    Redirect.prototype.render = function () {
        return null;
    };
    return Redirect;
}(React.Component));
exports.Redirect = Redirect;

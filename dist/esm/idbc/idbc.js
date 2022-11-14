function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { getRandomString } from "./utils";
import { KEY_PATH } from "./consts";

/**
 * A class of indexedDB wrapper.
 */
export var Idb = /*#__PURE__*/function () {
  function Idb(_dbName, _dbVersion, storeOptions) {
    var _this = this;

    _classCallCheck(this, Idb);

    _defineProperty(this, "dbName", void 0);

    _defineProperty(this, "dbVersion", void 0);

    _defineProperty(this, "storeOptions", void 0);

    _defineProperty(this, "db", void 0);

    _defineProperty(this, "callbacksOfReady", []);

    _defineProperty(this, "handleReady", function () {
      while (_this.callbacksOfReady.length) {
        var fn = _this.callbacksOfReady.shift();

        fn();
      }
    });

    _defineProperty(this, "open", function () {
      return new Promise(function (resolve, reject) {
        var dbName = _this.dbName,
            dbVersion = _this.dbVersion;
        var request = window.indexedDB.open(dbName, dbVersion);

        request.onsuccess = function (event) {
          _this.db = request.result;
          resolve(event);
        };

        request.onupgradeneeded = function () {
          _this.db = request.result;

          _this.storeOptions.forEach(function (_ref) {
            var storeName = _ref.storeName,
                indexes = _ref.indexes,
                keyPath = _ref.keyPath;

            if (!_this.db.objectStoreNames.contains(storeName)) {
              var store = _this.db.createObjectStore(storeName, {
                keyPath: keyPath || KEY_PATH
              });

              indexes === null || indexes === void 0 ? void 0 : indexes.forEach(function (_ref2) {
                var name = _ref2.name;
                store.createIndex(name, name, {
                  unique: false
                });
              });
            }
          });
        };

        request.onerror = reject;
      });
    });

    this.dbName = _dbName;
    this.storeOptions = storeOptions;
    this.dbVersion = _dbVersion;
    this.open().then(this.handleReady);
  }

  _createClass(Idb, [{
    key: "add",
    value:
    /**
     * Add a record
     * @param storeName 
     * @param record 
     * @returns 
     */
    function add(storeName, record) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var fn = function fn() {
          var storeOption = _this2.storeOptions.find(function (n) {
            return n.storeName === storeName;
          });

          if (!storeOption) {
            reject(new Error("Can not add record to ".concat(_this2.dbName, ":").concat(storeName)));
            return;
          }

          var keyPath = storeOption.keyPath;
          var key = keyPath ? record[keyPath] : "".concat(getRandomString(), "_").concat(Date.now());

          var transaction = _this2.db.transaction(storeName, 'readwrite');

          transaction.objectStore(storeName).put(_objectSpread(_objectSpread({}, record), {}, _defineProperty({}, keyPath || KEY_PATH, key)));

          transaction.oncomplete = function () {
            resolve(key);
          };

          transaction.onerror = reject;
        };

        if (_this2.db) {
          fn();
          return;
        }

        _this2.callbacksOfReady.push(fn);
      });
    }
    /**
     * Get records
     * @param storeName 
     * @returns 
     */

  }, {
    key: "getRecords",
    value: function getRecords(storeName) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        var fn = function fn() {
          var storeOption = _this3.storeOptions.find(function (n) {
            return n.storeName === storeName;
          });

          if (!storeOption) {
            reject(new Error("Can not add record to ".concat(_this3.dbName, ":").concat(storeName)));
            return;
          }

          var keyPath = storeOption.keyPath;

          var transaction = _this3.db.transaction(storeName, 'readonly');

          transaction.objectStore(storeName).getAll();

          transaction.oncomplete = function (ev) {
            resolve(ev.target.result);
          };

          transaction.onerror = reject;
        };

        if (_this3.db) {
          fn();
          return;
        }

        _this3.callbacksOfReady.push(fn);
      });
    }
  }]);

  return Idb;
}();

_defineProperty(Idb, "KEY_PATH", KEY_PATH);
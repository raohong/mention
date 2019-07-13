'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));
var ReactDOM = _interopDefault(require('react-dom'));
var omit = _interopDefault(require('omit.js'));
var PropTypes = _interopDefault(require('prop-types'));

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    keys.push.apply(keys, Object.getOwnPropertySymbols(object));
  }

  if (enumerableOnly) keys = keys.filter(function (sym) {
    return Object.getOwnPropertyDescriptor(object, sym).enumerable;
  });
  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    if (i % 2) {
      var source = arguments[i] != null ? arguments[i] : {};
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(arguments[i]));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(arguments[i], key));
      });
    }
  }

  return target;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

var regEscape = function regEscape(str) {
  return str.replace(/[*+?{}[\]().^$\\/-]/g, '\\$&');
};

/**
 *
 * @param value
 * @param current
 * @param prefix
 */
var detectLastMentioned = function detectLastMentioned(value, prefix) {
  // not expected line wrap (?:(?!\\r\\n?|\\n)\\s)*
  var parser = new RegExp("(".concat(regEscape(prefix.join('|')), ")([^\\s").concat(regEscape(prefix.join('')), "]*)$"));
  var match = value.match(parser);

  if (match === null) {
    return null;
  }

  var meta = {
    index: match.index,
    prefix: match[1],
    content: match[2] || ''
  };
  return meta;
};

/**
 * 获取 mention 信息
 * @param str
 * @param prefix
 * @param backup
 * @param validator
 * @param offset 默认是 -1. 因为取值是 value.slice(0, selectionEnd), 当进入递归时, 要把默认删除行为删除的字符加上
 */
var deepGetMetaInfo = function deepGetMetaInfo(str, prefix, backup, validator) {
  var offset = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : -1;
  var meta = detectLastMentioned(str, prefix);

  if (typeof validator === 'function' && meta !== null) {
    var flag = validator(meta.content);

    if (!flag && backup.length) {
      return deepGetMetaInfo(str + backup[0], prefix, backup.slice(1), validator, offset + 1);
    } else if (!flag) {
      meta = null;
    }
  }

  return {
    raw: str,
    meta: meta,
    offset: offset
  };
};
/**
 *
 * @param value
 * @param prefix
 * @param split
 * @param validator
 */


var updateValueWhenDelete = function updateValueWhenDelete(value, current, prefix, split, selectionEnd, validator) {
  var startValue = current.slice(0, selectionEnd);
  var gap = current.slice(selectionEnd);
  gap = gap.match(/^\S+/) ? gap.match(/^\S+/)[0] : '';
  var backup = gap.split('');
  var rest = value.slice(selectionEnd);
  var info = deepGetMetaInfo(startValue, prefix, backup, validator);

  if (info.meta === null) {
    return value;
  }

  var restFilter = new RegExp("^[".concat(regEscape(split), "]"));
  var restText;

  if (info.offset >= 0) {
    restText = rest.slice(info.offset).replace(restFilter, '');
  } else {
    restText = rest;
  }

  return info.raw.slice(0, Math.max(0, info.meta.index - 1)) + restText;
};
var insertMention = function insertMention(value, mention, prefix, split) {
  var gap = split;
  var reg = new RegExp("".concat(regEscape(gap), "+$")); // 新的一行 不添加 间隙 已有间隙不加

  if (/(?:\r?\n|\r)$/.test(value) || value.length === 0 || reg.test(value)) {
    gap = '';
  }

  return "".concat(value).concat(gap).concat(prefix).concat(mention, " ");
};
var execCb = function execCb(cb) {
  if (typeof cb === 'function') {
    for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      rest[_key - 1] = arguments[_key];
    }

    cb.apply(void 0, rest);
  }
};
var getValueFromProps = function getValueFromProps(child) {
  if (_typeof(child) !== 'object' || child === null) {
    throw new TypeError('MentionOption is required a value propperty');
  }

  if ('props' in child && 'value' in child.props) {
    return child.props.value;
  }

  throw new TypeError('MentionOption is required a value propperty');
};
var getKeyFromProps = function getKeyFromProps(child) {
  if (_typeof(child) !== 'object') {
    return null;
  }

  if (child !== null && 'key' in child) {
    return child.key;
  }

  return null;
};
var getPrefix = function getPrefix(prefix) {
  return Array.isArray(prefix) ? prefix : [prefix];
};
var createMentionDeleteModeValidator = function createMentionDeleteModeValidator(options) {
  return function (value) {
    return options.some(function (item) {
      return String(item.value) === value;
    });
  };
};

var KEY_DOWN = 40;
var KEY_UP = 38;
var KEY_ENTER = 13;

var ZyouMention =
/*#__PURE__*/
function (_React$Component) {
  _inherits(ZyouMention, _React$Component);

  function ZyouMention(_props) {
    var _this;

    _classCallCheck(this, ZyouMention);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ZyouMention).call(this, _props));
    _this.cursorRef = void 0;
    _this.dropdownItemRefs = [];
    _this.inputRef = void 0;
    _this.lastMeta = null;

    _this.getCursorRect = function () {
      var node = _this.cursorRef.current;
      var ret = {
        left: 0,
        top: 'auto',
        bottom: 'auto'
      };

      if (node) {
        var parent = node.parentElement;

        if (parent === null) {
          return ret;
        }

        var rect = node.getBoundingClientRect();
        ret.left = rect.left;
        var offset = rect.bottom > parent.clientHeight ? parent.clientHeight : rect.bottom;

        if (_this.props.placement === 'bottom') {
          ret.top = offset;
        } else {
          ret.bottom = document.documentElement.clientHeight - offset;
        }
      }

      return ret;
    };

    _this.setFocus = function () {
      if (_this.inputRef.current) {
        _this.inputRef.current.focus();
      }
    };

    _this.setBlur = function () {
      if (_this.inputRef.current) {
        _this.inputRef.current.blur();
      }
    };

    _this.handleFocus = function (evt) {
      var onFocus = _this.props.onFocus;

      if (typeof onFocus === 'function') {
        onFocus(evt);
      }
    };

    _this.handleBlur = function (evt) {
      var onBlur = _this.props.onBlur;

      if (typeof onBlur === 'function') {
        onBlur(evt);
      }
    };

    _this.getFilterdOptions = function () {
      var _this$state = _this.state,
          keyword = _this$state.keyword,
          mentionOptions = _this$state.mentionOptions;
      return keyword ? mentionOptions.filter(function (item) {
        return String(item.value).includes(keyword);
      }) : mentionOptions;
    };

    _this.handleKeydown = function (evt) {
      var keyCode = evt.keyCode;
      var _this$state2 = _this.state,
          dropdownVisible = _this$state2.dropdownVisible,
          dropdownActiveIndex = _this$state2.dropdownActiveIndex;

      if (!dropdownVisible) {
        return;
      }

      var options = _this.getFilterdOptions();

      var index = dropdownActiveIndex;
      index = Math.max(0, Math.min(options.length - 1, index));

      switch (keyCode) {
        case KEY_DOWN:
          index += 1;
          index = index % options.length;
          break;

        case KEY_UP:
          index -= 1;
          index = (index + options.length) % options.length;
          break;

        case KEY_ENTER:
          evt.preventDefault();

          _this.toggleOption(options[dropdownActiveIndex].value);

          return;
      }

      _this.setState({
        dropdownActiveIndex: index
      });
    };

    _this.toggleOption = function (value) {
      if (_this.lastMeta !== null) {
        var _this$lastMeta = _this.lastMeta,
            index = _this$lastMeta.index,
            prefix = _this$lastMeta.prefix;

        _this.notifyChange(insertMention(_this.state.value.slice(0, index), value, prefix, _this.props.split));
      }

      _this.setFocus();

      _this.resetMentionState();

      if ('onSearch' in _this.props && typeof _this.props.onSearch === 'function') {
        _this.props.onSearch(value);
      }
    };

    _this.handleChange = function (evt) {
      var value = evt.target.value;
      var _this$state3 = _this.state,
          current = _this$state3.value,
          mentionOptions = _this$state3.mentionOptions;
      var _this$props = _this.props,
          prefix = _this$props.prefix,
          deleteMode = _this$props.deleteMode,
          split = _this$props.split; // 获取光标 因为存在从右到左选取 从左到右选取

      var selectionEnd = Math.max(evt.target.selectionStart || value.length, evt.target.selectionEnd || value.length); // 当 deleteMode 是 whole 时

      if (value.length < current.length && _this.lastMeta === null && deleteMode === 'whole') {
        var newValue = updateValueWhenDelete(value, current, getPrefix(prefix), split, selectionEnd, createMentionDeleteModeValidator(mentionOptions));

        if (newValue !== null) {
          _this.resetMentionState();

          _this.notifyChange(newValue);

          return;
        }
      }

      _this.handleTriggerMention(value);
    };

    _this.handleTriggerMention = function (value) {
      var prefix = getPrefix(_this.props.prefix);
      var meta = detectLastMentioned(value, prefix);
      _this.lastMeta = meta; // 说明没有 @

      if (meta === null) {
        _this.resetMentionState();

        _this.notifyChange(value);

        return;
      }

      _this.notifyMention(value, meta);
    };

    _this.resetMentionState = function () {
      _this.setState({
        measureText: '',
        keyword: '',
        dropdownActiveIndex: 0
      });

      _this.setDropdownVisible(false);

      _this.lastMeta = null;
    };

    _this.setDropdownVisible = function (dropdownVisible) {
      _this.setState(function () {
        return {
          dropdownVisible: dropdownVisible
        };
      });
    };

    _this.notifyChange = function (value) {
      if ('value' in _this.props) {
        return execCb(_this.props.onChange, value);
      }

      _this.setState({
        value: value
      });
    };

    _this.notifyMention = function (value, meta) {
      var _assertThisInitialize = _assertThisInitialized(_this),
          props = _assertThisInitialize.props;

      var mentionContent = meta.content,
          index = meta.index;
      var onSearch = props.onSearch; // eg hello@meszyouh => hello@

      var measureText = value.slice(0, index + 1);
      var params;

      if (!('value' in props)) {
        params = {
          value: value,
          keyword: mentionContent,
          measureText: measureText
        };
      } else {
        params = {
          // 存在 onSearch 由外部驱动
          keyword: 'onSearch' in props ? '' : mentionContent,
          measureText: measureText
        };
      } // 重置为 0


      params.dropdownActiveIndex = 0;

      _this.notifyChange(value); // 更新搜索信息


      _this.setState(params, function () {
        _this.setDropdownVisible(true);
      });

      if ('onSearch' in props) {
        execCb(onSearch, mentionContent);
      }
    };

    _this.renderDropdown = function () {
      var _this$state4 = _this.state,
          dropdownVisible = _this$state4.dropdownVisible,
          dropdownActiveIndex = _this$state4.dropdownActiveIndex;

      if (!dropdownVisible) {
        return null;
      }

      var pos = _this.getCursorRect(); // 渲染时重置


      _this.dropdownItemRefs = [];

      var options = _this.getFilterdOptions();

      var children = options.map(function (item, index) {
        var _item$props = item.props,
            onClick = _item$props.onClick,
            rest = _objectWithoutProperties(_item$props, ["onClick"]);

        var handleClick = function handleClick(evt) {
          _this.toggleOption(item.value);

          if (typeof onClick === 'function') {
            onClick(evt);
          }
        };

        return React.createElement("li", _extends({}, rest, {
          onClick: handleClick,
          ref: function ref(node) {
            return _this.dropdownItemRefs[index] = node;
          },
          key: item.key,
          className: "".concat(ZyouMention.clsPrefix, "__mention-dropdown-item").concat(index === dropdownActiveIndex ? " ".concat(ZyouMention.clsPrefix, "__mention-dropdown-item-active") : '')
        }), item.children);
      });
      return ReactDOM.createPortal(React.createElement("ul", {
        tabIndex: 0,
        onBlur: _this.resetMentionState,
        onKeyDown: _this.handleKeydown,
        style: pos,
        className: "".concat(ZyouMention.clsPrefix, "__mention-dropdown")
      }, children), document.body);
    };

    _this.state = {
      value: _props.defaultValue || '',
      measureText: '',
      keyword: '',
      dropdownVisible: false,
      dropdownActiveIndex: 0,
      mentionOptions: [],
      children: null
    };
    _this.cursorRef = React.createRef();
    _this.inputRef = React.createRef();
    return _this;
  }

  _createClass(ZyouMention, [{
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.getCursorRect();
      var dropdownActiveIndex = this.state.dropdownActiveIndex;
      var item = this.dropdownItemRefs[dropdownActiveIndex];

      if (item && item.scrollIntoView) {
        item.scrollIntoView(false);
      }
    } // 获取 测量光标位置

  }, {
    key: "render",
    value: function render() {
      var _this$props2 = this.props,
          _this$props2$style = _this$props2.style,
          style = _this$props2$style === void 0 ? {} : _this$props2$style,
          className = _this$props2.className,
          children = _this$props2.children,
          onChange = _this$props2.onChange,
          rows = _this$props2.rows,
          placeholder = _this$props2.placeholder,
          rest = _objectWithoutProperties(_this$props2, ["style", "className", "children", "onChange", "rows", "placeholder"]);

      var _this$state5 = this.state,
          value = _this$state5.value,
          measureText = _this$state5.measureText;
      var props = omit(rest, ['value', 'prefix', 'onSearch', 'split', 'onBlur', 'onFocus', 'defaultValue', 'deleteMode']);

      var elStyle = _objectSpread2({}, style, {}, ZyouMention.style);

      var wrapperClasName = "".concat(ZyouMention.clsPrefix, "__mention").concat(className ? " ".concat(className) : '');
      var inputClassName = "".concat(ZyouMention.clsPrefix, "__mention-input");
      var measureClassName = "".concat(ZyouMention.clsPrefix, "__mention-measure");
      return React.createElement(React.Fragment, null, React.createElement("div", _extends({}, props, {
        style: elStyle,
        className: wrapperClasName
      }), React.createElement("textarea", {
        placeholder: placeholder,
        onKeyDown: this.handleKeydown,
        onBlur: this.handleBlur,
        onFocus: this.handleFocus,
        ref: this.inputRef,
        value: value,
        onChange: this.handleChange,
        rows: rows,
        className: inputClassName
      }), React.createElement("div", {
        className: measureClassName
      }, measureText ? React.createElement(React.Fragment, null, measureText, React.createElement("span", {
        ref: this.cursorRef
      }, "|")) : null)), this.renderDropdown());
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      var nextState = {};
      var value = nextProps.value,
          children = nextProps.children; // 缓存 children

      if (nextProps.children !== prevState.children) {
        nextState.mentionOptions = ZyouMention.getOptionsFromChildren(nextProps.children);
        nextState.children = children;
        nextState.dropdownActiveIndex = 0;
      }

      if ('value' in nextProps && value !== prevState.value) {
        nextState.value = value;
        return nextState;
      }

      return nextState;
    }
  }, {
    key: "getOptionsFromChildren",
    value: function getOptionsFromChildren(childen) {
      return React.Children.map(childen, function (child) {
        return {
          value: getValueFromProps(child),
          children: child,
          key: getKeyFromProps(child),
          props: _typeof(child) === 'object' && child !== null ? omit(child.props, ['children', 'value']) : {}
        };
      });
    }
  }]);

  return ZyouMention;
}(React.Component);

ZyouMention.clsPrefix = 'zyou';
ZyouMention.Option = void 0;
ZyouMention.style = {
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word'
};
ZyouMention.defaultProps = {
  rows: 3,
  split: ' ',
  prefix: '@',
  placement: 'bottom',

  /**
   * After selecting a mention,
   * if the text behind the cursor can match from the data source,
   * delete the corresponding text.
   */
  deleteMode: 'whole'
};
ZyouMention.propTypes = {
  value: PropTypes.string,
  deleteMode: PropTypes.oneOf(['normal', 'whole']),
  placement: PropTypes.oneOf(['top', 'bottom']),
  defaultValue: PropTypes.string,
  placeholder: PropTypes.string,
  onSearch: PropTypes.func,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  style: PropTypes.object,
  className: PropTypes.string,
  rows: PropTypes.number,
  split: PropTypes.string,
  prefix: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)])
};

var ZyouMentionOption = function ZyouMentionOption(_ref) {
  var children = _ref.children;
  return React.createElement(React.Fragment, null, children);
};

ZyouMentionOption.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  style: PropTypes.object,
  className: PropTypes.string
};

ZyouMention.Option = ZyouMentionOption;

exports.default = ZyouMention;

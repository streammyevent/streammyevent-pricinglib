var __legacyDecorateClassTS = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1;i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

// node_modules/serializr/lib/serializr.es.js
var invariant = function(condition, message) {
  var variables = [];
  for (var _i = 2;_i < arguments.length; _i++) {
    variables[_i - 2] = arguments[_i];
  }
  if (!condition) {
    var variablesToLog_1 = [];
    var index_1 = 0;
    var formattedMessage = message.replace(/%([a-zA-Z%])/g, function(match, format) {
      if (match === "%%")
        return match;
      var formatter = formatters[format];
      if (typeof formatter === "function") {
        var variable = variables[index_1++];
        variablesToLog_1.push(variable);
        return formatter(variable);
      }
      return match;
    });
    if (console && variablesToLog_1.length > 0) {
      console.log.apply(console, variablesToLog_1);
    }
    throw new Error("[serializr] " + (formattedMessage || "Illegal State"));
  }
};
var GUARDED_NOOP = function(err) {
  if (err)
    throw new Error(err);
};
var once = function(fn) {
  var fired = false;
  return function() {
    var args = [];
    for (var _i = 0;_i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    if (!fired) {
      fired = true;
      return fn.apply(undefined, args);
    }
    invariant(false, "callback was invoked twice");
  };
};
var parallel = function(ar, processor, cb) {
  if (ar.length === 0)
    return void cb(null, []);
  var left = ar.filter(function(x) {
    return true;
  }).length;
  var resultArray = [];
  var failed = false;
  ar.forEach(function(value, idx) {
    processor(value, function(err, result) {
      if (err) {
        if (!failed) {
          failed = true;
          cb(err);
        }
      } else {
        resultArray[idx] = result;
        if (--left === 0)
          cb(null, resultArray);
      }
    }, idx);
  });
};
var isPrimitive = function(value) {
  if (value === null)
    return true;
  return typeof value !== "object" && typeof value !== "function";
};
var isModelSchema = function(thing) {
  return thing && thing.factory && thing.props;
};
var isPropSchema = function(thing) {
  return thing && thing.serializer && thing.deserializer;
};
var isAliasedPropSchema = function(propSchema) {
  return typeof propSchema === "object" && typeof propSchema.jsonname == "string";
};
var isIdentifierPropSchema = function(propSchema) {
  return typeof propSchema === "object" && propSchema.identifier === true;
};
var isAssignableTo = function(actualType, expectedType) {
  var currentActualType = actualType;
  while (currentActualType) {
    if (currentActualType === expectedType)
      return true;
    currentActualType = currentActualType.extends;
  }
  return false;
};
var isMapLike = function(thing) {
  return thing && typeof thing.keys === "function" && typeof thing.clear === "function" && typeof thing.forEach === "function" && typeof thing.set === "function";
};
var getIdentifierProp = function(modelSchema) {
  invariant(isModelSchema(modelSchema), "modelSchema must be a ModelSchema");
  var currentModelSchema = modelSchema;
  while (currentModelSchema) {
    for (var propName in currentModelSchema.props)
      if (isIdentifierPropSchema(currentModelSchema.props[propName]))
        return propName;
    currentModelSchema = currentModelSchema.extends;
  }
  return;
};
var processAdditionalPropArgs = function(propSchema, additionalArgs) {
  if (additionalArgs) {
    invariant(isPropSchema(propSchema), "expected a propSchema");
    Object.assign(propSchema, additionalArgs);
  }
  return propSchema;
};
var getDefaultModelSchema = function(thing) {
  if (!thing)
    return;
  if (isModelSchema(thing))
    return thing;
  if (isModelSchema(thing.serializeInfo))
    return thing.serializeInfo;
  if (thing.constructor && thing.constructor.serializeInfo)
    return thing.constructor.serializeInfo;
};
var setDefaultModelSchema = function(clazz, modelSchema) {
  invariant(isModelSchema(modelSchema), "expected modelSchema, got ".concat(modelSchema));
  clazz.serializeInfo = modelSchema;
  return modelSchema;
};
var createModelSchema = function(clazz, props, factory) {
  invariant(clazz !== Object, "one cannot simply put define a model schema for Object");
  invariant(typeof clazz === "function", "expected constructor function");
  var model = {
    targetClass: clazz,
    factory: factory || function() {
      return new clazz;
    },
    props
  };
  if (clazz.prototype.constructor !== Object) {
    var s = getDefaultModelSchema(clazz.prototype.constructor);
    if (s && s.targetClass !== clazz)
      model.extends = s;
  }
  setDefaultModelSchema(clazz, model);
  return model;
};
var __spreadArray = function(to, from, pack) {
  if (pack || arguments.length === 2)
    for (var i = 0, l = from.length, ar;i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar)
          ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
  return to.concat(ar || Array.prototype.slice.call(from));
};
var primitive = function(additionalArgs) {
  var result = {
    serializer: function(value) {
      invariant(isPrimitive(value), "this value is not primitive: ".concat(value));
      return value;
    },
    deserializer: function(jsonValue, done) {
      if (!isPrimitive(jsonValue))
        return void done("[serializr] this value is not primitive: ".concat(jsonValue));
      return void done(null, jsonValue);
    }
  };
  result = processAdditionalPropArgs(result, additionalArgs);
  return result;
};
var getParamNames = function(func) {
  var _a;
  var fnStr = func.toString().replace(STRIP_COMMENTS, "");
  return (_a = fnStr.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")")).match(ARGUMENT_NAMES)) !== null && _a !== undefined ? _a : [];
};
var serializableDecorator = function(propSchema, target, propName, descriptor) {
  invariant(arguments.length >= 2, "too few arguments. Please use @serializable as property decorator");
  var factory;
  if (propName === undefined && typeof target === "function" && target.prototype && descriptor !== undefined && typeof descriptor === "number") {
    invariant(isPropSchema(propSchema), "Constructor params must use alias(name)");
    invariant(isAliasedPropSchema(propSchema), "Constructor params must use alias(name)");
    var paramNames = getParamNames(target);
    if (paramNames.length >= descriptor) {
      propName = paramNames[descriptor];
      propSchema.paramNumber = descriptor;
      descriptor = undefined;
      target = target.prototype;
      factory = function(context) {
        var _a;
        var params = [];
        var _loop_1 = function(i2) {
          Object.keys(context.modelSchema.props).forEach(function(key) {
            var prop = context.modelSchema.props[key];
            if (prop.paramNumber === i2) {
              params[i2] = context.json[prop.jsonname];
            }
          });
        };
        for (var i = 0;i < target.constructor.length; i++) {
          _loop_1(i);
        }
        return (_a = target.constructor).bind.apply(_a, __spreadArray([undefined], params, false));
      };
    }
  }
  invariant(typeof propName === "string", "incorrect usage of @serializable decorator");
  var info = getDefaultModelSchema(target);
  if (!info || !Object.prototype.hasOwnProperty.call(target.constructor, "serializeInfo"))
    info = createModelSchema(target.constructor, {}, factory);
  if (info && info.targetClass !== target.constructor)
    info = createModelSchema(target.constructor, {}, factory);
  info.props[propName] = propSchema;
  if (descriptor && !descriptor.get && !descriptor.set)
    descriptor.writable = true;
  return descriptor;
};
var serializable = function(targetOrPropSchema, key, baseDescriptor) {
  if (!key) {
    var propSchema = targetOrPropSchema === true ? _defaultPrimitiveProp : targetOrPropSchema;
    invariant(isPropSchema(propSchema), "@serializable expects prop schema");
    var result = serializableDecorator.bind(null, propSchema);
    return result;
  } else {
    serializableDecorator(primitive(), targetOrPropSchema, key, baseDescriptor);
  }
};
var serialize = function() {
  var args = [];
  for (var _i = 0;_i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  invariant(args.length === 1 || args.length === 2, "serialize expects one or 2 arguments");
  var schema;
  var value;
  if (args.length === 1) {
    schema = undefined;
    value = args[0];
  } else {
    schema = args[0], value = args[1];
  }
  if (Array.isArray(value)) {
    return value.map(function(item) {
      return schema ? serialize(schema, item) : serialize(item);
    });
  }
  if (!schema) {
    schema = getDefaultModelSchema(value);
  } else if (typeof schema !== "object") {
    schema = getDefaultModelSchema(schema);
  }
  if (!schema) {
    invariant(schema, "Failed to find default schema for ".concat(value));
  }
  return serializeWithSchema(schema, value);
};
var serializeWithSchema = function(schema, obj) {
  var _a;
  invariant(schema && typeof schema === "object" && schema.props, "Expected schema");
  invariant(obj && typeof obj === "object", "Expected object");
  var res;
  if (schema.extends)
    res = serializeWithSchema(schema.extends, obj);
  else {
    res = {};
  }
  Object.keys(schema.props).forEach(function(key) {
    var propDef = schema.props[key];
    if (!propDef)
      return;
    if (key === "*") {
      serializeStarProps(schema, propDef, obj, res);
      return;
    }
    if (propDef === true)
      propDef = _defaultPrimitiveProp;
    var jsonValue = propDef.serializer(obj[key], key, obj);
    if (jsonValue === SKIP) {
      return;
    }
    res[propDef.jsonname || key] = jsonValue;
  });
  if ((_a = schema.discriminator) === null || _a === undefined ? undefined : _a.storeDiscriminator) {
    schema.discriminator.storeDiscriminator(res);
  }
  return res;
};
var serializeStarProps = function(schema, propDef, obj, target) {
  for (var _i = 0, _a = Object.keys(obj);_i < _a.length; _i++) {
    var key = _a[_i];
    if (!(key in schema.props)) {
      if (propDef === true || propDef && (!propDef.pattern || propDef.pattern.test(key))) {
        var value = obj[key];
        if (propDef === true) {
          if (isPrimitive(value)) {
            target[key] = value;
          }
        } else {
          var jsonValue = propDef.serializer(value, key, obj);
          if (jsonValue === SKIP) {
            return;
          }
          target[key] = jsonValue;
        }
      }
    }
  }
};
var schemaHasAlias = function(schema, name) {
  for (var key in schema.props) {
    var propSchema = schema.props[key];
    if (typeof propSchema === "object" && propSchema.jsonname === name)
      return true;
  }
  return false;
};
var deserializeStarProps = function(context, schema, propDef, obj, json) {
  var _loop_1 = function(key2) {
    if (!(key2 in schema.props) && !schemaHasAlias(schema, key2)) {
      var jsonValue = json[key2];
      if (propDef === true) {
        invariant(isPrimitive(jsonValue), "encountered non primitive value while deserializing '*' properties in property '".concat(key2, "': ").concat(jsonValue));
        obj[key2] = jsonValue;
      } else if (propDef && (!propDef.pattern || propDef.pattern.test(key2))) {
        propDef.deserializer(jsonValue, context.rootContext.createCallback(function(r) {
          return r !== SKIP && (obj[key2] = r);
        }), context);
      }
    }
  };
  for (var key in json) {
    _loop_1(key);
  }
};
var identifyActualSchema = function(json, baseSchema) {
  var _a;
  if ((_a = baseSchema.subSchemas) === null || _a === undefined ? undefined : _a.length) {
    for (var _i = 0, _b = baseSchema.subSchemas;_i < _b.length; _i++) {
      var subSchema = _b[_i];
      if (subSchema.discriminator) {
        if (subSchema.discriminator.isActualType(json)) {
          return subSchema;
        }
      }
    }
  }
  return baseSchema;
};
var deserialize = function(clazzOrModelSchema, json, callback, customArgs) {
  if (callback === undefined) {
    callback = GUARDED_NOOP;
  }
  invariant(arguments.length >= 2, "deserialize expects at least 2 arguments");
  var schema = getDefaultModelSchema(clazzOrModelSchema);
  invariant(isModelSchema(schema), "first argument should be model schema");
  if (Array.isArray(json)) {
    var items_1 = [];
    parallel(json, function(childJson, itemDone) {
      var instance = deserializeObjectWithSchema(undefined, schema, childJson, itemDone, customArgs);
      items_1.push(instance);
    }, callback);
    return items_1;
  } else {
    return deserializeObjectWithSchema(undefined, schema, json, callback, customArgs);
  }
};
var deserializeObjectWithSchema = function(parentContext, modelSchema, json, callback, customArgs) {
  if (json === null || json === undefined || typeof json !== "object")
    return void callback(null, null);
  var actualSchema = identifyActualSchema(json, modelSchema);
  var context = new Context(parentContext, actualSchema, json, callback, customArgs);
  var target = actualSchema.factory(context);
  invariant(!!target, "No object returned from factory");
  context.setTarget(target);
  var lock = context.createCallback(GUARDED_NOOP);
  deserializePropsWithSchema(context, actualSchema, json, target);
  lock();
  return target;
};
var deserializePropsWithSchema = function(context, modelSchema, json, target) {
  var _a;
  if (modelSchema.extends)
    deserializePropsWithSchema(context, modelSchema.extends, json, target);
  function deserializeProp(propDef, jsonValue, propName) {
    var whenDone = context.rootContext.createCallback(function(r) {
      return r !== SKIP && (target[propName] = r);
    });
    propDef.deserializer(jsonValue, function(err, newValue) {
      return onAfterDeserialize(whenDone, err, newValue, jsonValue, json, propName, context, propDef);
    }, context, target[propName]);
  }
  var _loop_2 = function(key2) {
    var propDef = modelSchema.props[key2];
    if (!propDef)
      return { value: undefined };
    if (key2 === "*") {
      deserializeStarProps(context, modelSchema, propDef, target, json);
      return { value: undefined };
    }
    if (propDef === true)
      propDef = _defaultPrimitiveProp;
    var jsonAttr = (_a = propDef.jsonname) !== null && _a !== undefined ? _a : key2;
    invariant(typeof jsonAttr !== "symbol", "You must alias symbol properties. prop = %l", key2);
    var jsonValue = json[jsonAttr];
    var propSchema = propDef;
    var callbackDeserialize = function(err, jsonVal) {
      if (!err && jsonVal !== undefined) {
        deserializeProp(propSchema, jsonVal, key2);
      }
    };
    onBeforeDeserialize(callbackDeserialize, jsonValue, json, jsonAttr, context, propDef);
  };
  for (var _i = 0, _b = Object.keys(modelSchema.props);_i < _b.length; _i++) {
    var key = _b[_i];
    var state_1 = _loop_2(key);
    if (typeof state_1 === "object")
      return state_1.value;
  }
};
var object = function(modelSchema, additionalArgs) {
  invariant(typeof modelSchema === "object" || typeof modelSchema === "function", "No modelschema provided. If you are importing it from another file be aware of circular dependencies.");
  var result = {
    serializer: function(item) {
      modelSchema = getDefaultModelSchema(modelSchema);
      invariant(isModelSchema(modelSchema), "expected modelSchema, got ".concat(modelSchema));
      if (item === null || item === undefined)
        return item;
      return serialize(modelSchema, item);
    },
    deserializer: function(childJson, done, context) {
      modelSchema = getDefaultModelSchema(modelSchema);
      invariant(isModelSchema(modelSchema), "expected modelSchema, got ".concat(modelSchema));
      if (childJson === null || childJson === undefined)
        return void done(null, childJson);
      return void deserializeObjectWithSchema(context, modelSchema, childJson, done, undefined);
    }
  };
  result = processAdditionalPropArgs(result, additionalArgs);
  return result;
};
var identifier = function(arg1, arg2) {
  var registerFn;
  var additionalArgs;
  if (typeof arg1 === "function") {
    registerFn = arg1;
    additionalArgs = arg2;
  } else {
    additionalArgs = arg1;
  }
  invariant(!additionalArgs || typeof additionalArgs === "object", "Additional property arguments should be an object, register function should be omitted or a funtion");
  var result = {
    identifier: true,
    serializer: _defaultPrimitiveProp.serializer,
    deserializer: function(jsonValue, done, context) {
      _defaultPrimitiveProp.deserializer(jsonValue, function(err, id) {
        defaultRegisterFunction(id, context.target, context);
        if (registerFn)
          registerFn(id, context.target, context);
        done(err, id);
      }, context);
    }
  };
  result = processAdditionalPropArgs(result, additionalArgs);
  return result;
};
var createDefaultRefLookup = function(modelSchema) {
  return function resolve(uuid, cb, context) {
    context.rootContext.await(modelSchema, uuid, cb);
  };
};
var reference = function(target, lookupFnOrAdditionalPropArgs, additionalArgs) {
  invariant(!!target, "No modelSchema provided. If you are importing it from another file be aware of circular dependencies.");
  var lookupFn = typeof lookupFnOrAdditionalPropArgs === "function" ? lookupFnOrAdditionalPropArgs : undefined;
  additionalArgs = additionalArgs || (lookupFn ? undefined : lookupFnOrAdditionalPropArgs);
  var initialized = false;
  var childIdentifierAttribute;
  function initialize() {
    initialized = true;
    invariant(typeof target !== "string" || typeof lookupFn === "function", "if the reference target is specified by attribute name, a lookup function is required");
    invariant(!lookupFn || typeof lookupFn === "function", "second argument should be a lookup function or additional arguments object");
    if (typeof target === "string") {
      childIdentifierAttribute = target;
    } else {
      var modelSchema = getDefaultModelSchema(target);
      invariant(isModelSchema(modelSchema), "expected model schema or string as first argument for 'ref', got ".concat(modelSchema));
      lookupFn = lookupFn || createDefaultRefLookup(modelSchema);
      childIdentifierAttribute = getIdentifierProp(modelSchema);
      invariant(!!childIdentifierAttribute, "provided model schema doesn't define an identifier() property and cannot be used by 'ref'.");
    }
  }
  var result = {
    serializer: function(item) {
      if (!initialized)
        initialize();
      return item ? item[childIdentifierAttribute] : null;
    },
    deserializer: function(identifierValue, done, context) {
      if (!initialized)
        initialize();
      if (identifierValue === null || identifierValue === undefined)
        done(null, identifierValue);
      else
        lookupFn(identifierValue, done, context);
    }
  };
  result = processAdditionalPropArgs(result, additionalArgs);
  return result;
};
var list = function(propSchema, additionalArgs) {
  propSchema = propSchema || _defaultPrimitiveProp;
  invariant(isPropSchema(propSchema), "expected prop schema as first argument");
  invariant(!isAliasedPropSchema(propSchema), "provided prop is aliased, please put aliases first");
  var result = {
    serializer: function(ar) {
      if (ar === undefined) {
        return SKIP;
      }
      if (ar === null) {
        return null;
      }
      invariant(ar && "length" in ar && "map" in ar, "expected array (like) object");
      return ar.map(propSchema.serializer);
    },
    deserializer: function(jsonArray, done, context) {
      if (jsonArray === null)
        return void done(null, jsonArray);
      if (!Array.isArray(jsonArray))
        return void done("[serializr] expected JSON array");
      function processItem(jsonValue, onItemDone, itemIndex) {
        function callbackBefore(err, value) {
          if (!err) {
            propSchema.deserializer(value, deserializeDone, context);
          } else {
            onItemDone(err);
          }
        }
        function deserializeDone(err, value) {
          if (typeof propSchema.afterDeserialize === "function") {
            onAfterDeserialize(onItemDone, err, value, jsonValue, jsonArray, itemIndex, context, propSchema);
          } else {
            onItemDone(err, value);
          }
        }
        onBeforeDeserialize(callbackBefore, jsonValue, jsonArray, itemIndex, context, propSchema);
      }
      parallel(jsonArray, processItem, function(err, result2) {
        if (err) {
          return void done(err);
        }
        done(undefined, result2.filter(function(x) {
          return SKIP !== x;
        }));
      });
    }
  };
  result = processAdditionalPropArgs(result, additionalArgs);
  return result;
};
var map = function(propSchema, additionalArgs) {
  propSchema = propSchema || _defaultPrimitiveProp;
  invariant(isPropSchema(propSchema), "expected prop schema as first argument");
  invariant(!isAliasedPropSchema(propSchema), "provided prop is aliased, please put aliases first");
  var result = {
    serializer: function(m) {
      invariant(m && typeof m === "object", "expected object or Map");
      var result2 = {};
      if (isMapLike(m)) {
        m.forEach(function(value, key2) {
          return result2[key2] = propSchema.serializer(value, key2, m);
        });
      } else {
        for (var key in m)
          result2[key] = propSchema.serializer(m[key], key, m);
      }
      return result2;
    },
    deserializer: function(jsonObject, done, context, oldValue) {
      if (!jsonObject || typeof jsonObject !== "object")
        return void done("[serializr] expected JSON object");
      var keys = Object.keys(jsonObject);
      list(propSchema, additionalArgs).deserializer(keys.map(function(key) {
        return jsonObject[key];
      }), function(err, values) {
        if (err)
          return void done(err);
        var isMap = isMapLike(oldValue);
        var newValue;
        if (isMap) {
          oldValue.clear();
          newValue = oldValue;
        } else
          newValue = {};
        for (var i = 0, l = keys.length;i < l; i++) {
          if (isMap)
            newValue.set(keys[i], values[i]);
          else
            newValue[keys[i]] = values[i];
        }
        done(null, newValue);
      }, context);
    }
  };
  result = processAdditionalPropArgs(result, additionalArgs);
  return result;
};
var raw = function(additionalArgs) {
  var result = {
    serializer: function(value) {
      return value;
    },
    deserializer: function(jsonValue, done) {
      return void done(null, jsonValue);
    }
  };
  result = processAdditionalPropArgs(result, additionalArgs);
  return result;
};
var formatters = {
  j: function json(v) {
    try {
      return JSON.stringify(v);
    } catch (error) {
      return "[UnexpectedJSONParseError]: ".concat(error.message);
    }
  },
  l: function symbol(s) {
    return s.toString();
  }
};
var SKIP = typeof Symbol !== "undefined" ? Symbol("SKIP") : { SKIP: true };
var _defaultPrimitiveProp = primitive();
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
var ARGUMENT_NAMES = /([^\s,]+)/g;
var Context = function() {
  function Context2(parentContext, modelSchema, json2, onReadyCb, customArgs) {
    this.parentContext = parentContext;
    this.modelSchema = modelSchema;
    this.json = json2;
    this.onReadyCb = onReadyCb;
    this.isRoot = !parentContext;
    this.pendingCallbacks = 0;
    this.pendingRefsCount = 0;
    this.target = undefined;
    this.hasError = false;
    if (!parentContext) {
      this.rootContext = this;
      this.args = customArgs;
      this.pendingRefs = {};
      this.resolvedRefs = {};
    } else {
      this.rootContext = parentContext.rootContext;
      this.args = parentContext.args;
    }
  }
  Context2.prototype.createCallback = function(fn) {
    var _this = this;
    this.pendingCallbacks++;
    return once(function(err, value) {
      if (err) {
        if (!_this.hasError) {
          _this.hasError = true;
          _this.onReadyCb(err);
          Context2.rootContextCache.delete(_this);
        }
      } else if (!_this.hasError) {
        fn(value);
        if (--_this.pendingCallbacks === _this.pendingRefsCount) {
          if (_this.pendingRefsCount > 0) {
            _this.onReadyCb(new Error("Unresolvable references in json: \"".concat(Object.keys(_this.pendingRefs).filter(function(uuid) {
              return _this.pendingRefs[uuid].length > 0;
            }).join("\", \""), "\"")));
            Context2.rootContextCache.delete(_this);
          } else {
            _this.onReadyCb(null, _this.target);
            Context2.rootContextCache.delete(_this);
          }
        }
      }
    });
  };
  Context2.prototype.await = function(modelSchema, uuid, callback) {
    invariant(this.isRoot, "await can only be called on the root context");
    if (uuid in this.resolvedRefs) {
      var match = this.resolvedRefs[uuid].filter(function(resolved) {
        return isAssignableTo(resolved.modelSchema, modelSchema);
      })[0];
      if (match)
        return void callback(null, match.value);
    }
    this.pendingRefsCount++;
    if (!this.pendingRefs[uuid])
      this.pendingRefs[uuid] = [];
    this.pendingRefs[uuid].push({
      modelSchema,
      uuid,
      callback
    });
  };
  Context2.prototype.resolve = function(modelSchema, uuid, value) {
    invariant(this.isRoot, "resolve can only called on the root context");
    if (!this.resolvedRefs[uuid])
      this.resolvedRefs[uuid] = [];
    this.resolvedRefs[uuid].push({
      modelSchema,
      value
    });
    if (uuid in this.pendingRefs) {
      for (var i = this.pendingRefs[uuid].length - 1;i >= 0; i--) {
        var opts = this.pendingRefs[uuid][i];
        if (isAssignableTo(modelSchema, opts.modelSchema)) {
          this.pendingRefs[uuid].splice(i, 1);
          this.pendingRefsCount--;
          opts.callback(null, value);
        }
      }
    }
  };
  Context2.prototype.setTarget = function(target) {
    if (this.isRoot && this.target) {
      Context2.rootContextCache.delete(this.target);
    }
    this.target = target;
    Context2.rootContextCache.set(this.target, this);
  };
  Context2.prototype.cancelAwaits = function() {
    var _this = this;
    invariant(this.isRoot, "cancelAwaits can only be called on the root context");
    Object.keys(this.pendingRefs).forEach(function(uuid) {
      _this.pendingRefs[uuid].forEach(function(refOpts) {
        _this.pendingRefsCount--;
        refOpts.callback(new Error("Reference resolution canceled for " + uuid));
      });
    });
    this.pendingRefs = {};
    this.pendingRefsCount = 0;
  };
  Context2.getTargetContext = function(target) {
    return Context2.rootContextCache.get(target);
  };
  Context2.rootContextCache = new WeakMap;
  return Context2;
}();
var onBeforeDeserialize = function(callback, jsonValue, jsonParentValue, propNameOrIndex, context, propDef) {
  if (propDef && typeof propDef.beforeDeserialize === "function") {
    propDef.beforeDeserialize(callback, jsonValue, jsonParentValue, propNameOrIndex, context, propDef);
  } else {
    callback(null, jsonValue);
  }
};
var onAfterDeserialize = function(callback, err, newValue, jsonValue, jsonParentValue, propNameOrIndex, context, propDef) {
  if (propDef && typeof propDef.afterDeserialize === "function") {
    propDef.afterDeserialize(callback, err, newValue, jsonValue, jsonParentValue, propNameOrIndex, context, propDef);
  } else {
    callback(err, newValue);
  }
};
var defaultRegisterFunction = function(id, value, context) {
  context.rootContext.resolve(context.modelSchema, id, context.target);
};

// src/pricing.ts
class Price {
  formatter;
  constructor(value = 0, unit = "EUR", locale = "en-US") {
    this.unit = unit;
    this.value = value;
    this.locale = locale;
    this.formatter = new Intl.NumberFormat(locale, { style: "currency", currency: unit });
  }
  get formatted() {
    return this.formatter.format(this.value);
  }
  toString() {
    return this.formatted;
  }
  valueOf() {
    return this.value;
  }
}
__legacyDecorateClassTS([
  serializable
], Price.prototype, "unit", undefined);
__legacyDecorateClassTS([
  serializable
], Price.prototype, "value", undefined);
__legacyDecorateClassTS([
  serializable
], Price.prototype, "locale", undefined);

class Factor {
  constructor(options = {}) {
    this.range = [0, Infinity];
    this.factor = 1;
    Object.assign(this, options);
  }
}
__legacyDecorateClassTS([
  serializable(list(primitive()))
], Factor.prototype, "range", undefined);
__legacyDecorateClassTS([
  serializable
], Factor.prototype, "factor", undefined);

class FactorGroup {
  constructor(options = {}) {
    this.name = "";
    this.factors = [];
    Object.assign(this, options);
  }
  getFactor(multiplier) {
    let totalFactor = 0;
    for (let step = 0;step < multiplier; step++) {
      for (const factor of this.factors) {
        if (step >= factor.range[0] && step < factor.range[1]) {
          totalFactor += factor.factor;
          break;
        }
      }
    }
    return Number(totalFactor.toPrecision(4));
  }
}
__legacyDecorateClassTS([
  serializable(identifier())
], FactorGroup.prototype, "name", undefined);
__legacyDecorateClassTS([
  serializable(list(object(Factor)))
], FactorGroup.prototype, "factors", undefined);

class Cost {
  constructor(options = {}) {
    this.price = new Price(0, "EUR");
    this.costInternal = new Price(0, "EUR");
    this.costExternal = new Price(0, "EUR");
    this.quantity = 0;
    this.discountPercent = 0;
    this.discountAmount = new Price(0, "EUR");
    Object.assign(this, options);
  }
  get multiplier() {
    return this.multiplierValue || 1;
  }
  get totalQuantity() {
    return this.quantity * (this.multiplier || 1);
  }
  factor() {
    if (!this.factorGroup) {
      return this.multiplier;
    }
    return this.factorGroup.getFactor(this.multiplier);
  }
  get subtotalBeforeMultiplier() {
    return new Price(this.price.value * this.quantity, this.price.unit);
  }
  get subtotalAfterMultiplier() {
    return new Price(this.subtotalBeforeMultiplier.value * this.factor(), this.price.unit);
  }
  get discount() {
    return new Price(this.discountAmount.value + this.subtotalAfterMultiplier.value * this.discountPercent, this.price.unit);
  }
  get total() {
    const subtotalValue = this.subtotalAfterMultiplier.value;
    const discountValue = this.discount.value;
    const totalValue = subtotalValue - discountValue;
    return new Price(totalValue, this.price.unit);
  }
}
__legacyDecorateClassTS([
  serializable(object(Price))
], Cost.prototype, "price", undefined);
__legacyDecorateClassTS([
  serializable(object(Price))
], Cost.prototype, "costInternal", undefined);
__legacyDecorateClassTS([
  serializable(object(Price))
], Cost.prototype, "costExternal", undefined);
__legacyDecorateClassTS([
  serializable
], Cost.prototype, "quantity", undefined);
__legacyDecorateClassTS([
  serializable
], Cost.prototype, "multiplierValue", undefined);
__legacyDecorateClassTS([
  serializable(object(FactorGroup))
], Cost.prototype, "factorGroup", undefined);
__legacyDecorateClassTS([
  serializable
], Cost.prototype, "discountPercent", undefined);
__legacyDecorateClassTS([
  serializable(object(Price))
], Cost.prototype, "discountAmount", undefined);

// node_modules/nanoid/url-alphabet/index.js
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

// node_modules/nanoid/index.browser.js
var nanoid = (size = 21) => {
  let id = "";
  let bytes = crypto.getRandomValues(new Uint8Array(size));
  while (size--) {
    id += urlAlphabet[bytes[size] & 63];
  }
  return id;
};

// src/uniqueObject.ts
function generateId() {
  return nanoid(7);
}
class UniqueObject {
  constructor(options = {}) {
    this.id = generateId();
    Object.assign(this, options);
  }
}
__legacyDecorateClassTS([
  serializable(identifier())
], UniqueObject.prototype, "id", undefined);

// src/times.ts
class Times extends UniqueObject {
  constructor(options = {}) {
    super(options);
    this.start = "";
    this.end = "";
    this.timezone = "";
    Object.assign(this, options);
  }
  static startAsDate(start) {
    return new Date(start);
  }
  get startAsDate() {
    return Times.startAsDate(this.start);
  }
  static endAsDate(end) {
    return new Date(end);
  }
  get endAsDate() {
    return Times.endAsDate(this.end);
  }
  static hours(start, end) {
    return Math.ceil((Times.endAsDate(end).getTime() - Times.startAsDate(start).getTime()) / 3600 / 1000);
  }
  get hours() {
    return Times.hours(this.start, this.end);
  }
  static days(start, end) {
    return Math.ceil(Times.hours(start, end) / 24);
  }
  get days() {
    return Times.days(this.start, this.end);
  }
  static nights(start, end) {
    return Math.max(Times.days(start, end) - 1, 0);
  }
  get nights() {
    return Times.nights(this.start, this.end);
  }
  static formattedStart(start, timezone) {
    return Times.startAsDate(start).toLocaleString("nl-NL", { timeZone: timezone });
  }
  get formattedStart() {
    return Times.formattedStart(this.start, this.timezone);
  }
  static formattedEnd(end, timezone) {
    return Times.endAsDate(end).toLocaleString("nl-NL", { timeZone: timezone });
  }
  get formattedEnd() {
    return Times.formattedEnd(this.end, this.timezone);
  }
}
__legacyDecorateClassTS([
  serializable(primitive())
], Times.prototype, "name", undefined);
__legacyDecorateClassTS([
  serializable(primitive())
], Times.prototype, "comment", undefined);
__legacyDecorateClassTS([
  serializable(primitive())
], Times.prototype, "start", undefined);
__legacyDecorateClassTS([
  serializable(primitive())
], Times.prototype, "end", undefined);
__legacyDecorateClassTS([
  serializable(primitive())
], Times.prototype, "timezone", undefined);

// src/quoteLines.ts
class QuoteLineItem extends Cost {
  constructor(options = {}) {
    super(options);
    this.id = generateId();
    Object.assign(this, options);
  }
  get days() {
    if (this.start && this.end)
      return Times.days(this.start?.start, this.end?.end);
  }
  get nights() {
    if (this.start && this.end)
      return Times.nights(this.start?.start, this.end?.end);
  }
  get hours() {
    if (this.start && this.end)
      return Times.hours(this.start?.start, this.end?.end);
  }
  get multiplier() {
    if (this.multiplierType === "days")
      return this.days || 1;
    if (this.multiplierType === "nights")
      return this.nights || 1;
    return this.multiplierValue || 1;
  }
}
__legacyDecorateClassTS([
  serializable
], QuoteLineItem.prototype, "id", undefined);
__legacyDecorateClassTS([
  serializable
], QuoteLineItem.prototype, "name", undefined);
__legacyDecorateClassTS([
  serializable
], QuoteLineItem.prototype, "description", undefined);
__legacyDecorateClassTS([
  serializable(reference(Times))
], QuoteLineItem.prototype, "start", undefined);
__legacyDecorateClassTS([
  serializable(reference(Times))
], QuoteLineItem.prototype, "end", undefined);
__legacyDecorateClassTS([
  serializable
], QuoteLineItem.prototype, "multiplierType", undefined);
__legacyDecorateClassTS([
  serializable(raw())
], QuoteLineItem.prototype, "meta", undefined);

class QuoteLineItemGroup extends UniqueObject {
  constructor(options = {}) {
    super(options);
    this.name = "";
    this.lineItems = [];
    Object.assign(this, options);
  }
  get days() {
    if (this.start && this.end)
      return Times.days(this.start?.start, this.end?.end);
  }
  get nights() {
    if (this.start && this.end)
      return Times.nights(this.start?.start, this.end?.end);
  }
  get hours() {
    if (this.start && this.end)
      return Times.hours(this.start?.start, this.end?.end);
  }
  static total(lineItemGroup) {
    let totalValue = 0;
    let currencyUnit = "EUR";
    lineItemGroup.lineItems.forEach((item) => {
      totalValue += item.total?.value;
      currencyUnit = currencyUnit || item.total?.unit;
    });
    return new Price(totalValue, currencyUnit);
  }
  get total() {
    return QuoteLineItemGroup.total(this);
  }
}
__legacyDecorateClassTS([
  serializable
], QuoteLineItemGroup.prototype, "name", undefined);
__legacyDecorateClassTS([
  serializable(reference(Times))
], QuoteLineItemGroup.prototype, "start", undefined);
__legacyDecorateClassTS([
  serializable(reference(Times))
], QuoteLineItemGroup.prototype, "end", undefined);
__legacyDecorateClassTS([
  serializable(reference(FactorGroup))
], QuoteLineItemGroup.prototype, "factorGroup", undefined);
__legacyDecorateClassTS([
  serializable(list(object(QuoteLineItem)))
], QuoteLineItemGroup.prototype, "lineItems", undefined);

// src/quote.ts
class QuoteContentsCategory {
  constructor(options = {}) {
    this.name = "";
    this.icon = "";
    this.groups = [];
    Object.assign(this, options);
  }
  get title() {
    return this.icon + " " + this.name.charAt(0).toUpperCase() + this.name.slice(1);
  }
  get total() {
    let total = 0;
    total = this.groups.reduce((sum, group) => {
      return sum + group.total.value;
    }, 0);
    return new Price(total, "EUR");
  }
  sumLineItemValue(key) {
    return this.groups.reduce((sum, group) => {
      return sum + group.lineItems.reduce((sum2, lineItem) => {
        return sum2 + Number(lineItem[key]);
      }, 0);
    }, 0);
  }
}
__legacyDecorateClassTS([
  serializable
], QuoteContentsCategory.prototype, "name", undefined);
__legacyDecorateClassTS([
  serializable
], QuoteContentsCategory.prototype, "icon", undefined);
__legacyDecorateClassTS([
  serializable(list(object(QuoteLineItemGroup)))
], QuoteContentsCategory.prototype, "groups", undefined);

class Quote extends UniqueObject {
  constructor(options = {}) {
    super(options);
    this.schedule = [];
    this.contents = {};
    Object.assign(this, options);
  }
  get total() {
    let total = 0;
    total = Object.values(this.contents).reduce((sum, category) => {
      return sum + category.total.value;
    }, 0);
    return new Price(total, "EUR");
  }
  serialize() {
    return JSON.stringify(serialize(Quote, this), null, 2);
  }
  static deserialize(input) {
    const unstringified = JSON.parse(input);
    return deserialize(Quote, unstringified);
  }
  deepClone() {
    return Quote.deserialize(this.serialize());
  }
  get metadata() {
    return {
      total: this.total.formatted,
      crewDays: this.contents.crew?.sumLineItemValue("totalQuantity") || 0,
      billableHours: this.contents.billables?.sumLineItemValue("totalQuantity") || 0
    };
  }
}
__legacyDecorateClassTS([
  serializable(list(object(Times)))
], Quote.prototype, "schedule", undefined);
__legacyDecorateClassTS([
  serializable(map(object(QuoteContentsCategory)))
], Quote.prototype, "contents", undefined);
export {
  generateId,
  UniqueObject,
  Times,
  QuoteLineItemGroup,
  QuoteLineItem,
  QuoteContentsCategory,
  Quote,
  Price,
  FactorGroup,
  Factor,
  Cost
};

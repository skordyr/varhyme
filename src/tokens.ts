import type { Simplify } from "./shared/types";

import { EMPTY_OBJECT } from "./shared/utils";

export type TokenPropertyKnownSyntax =
  | "*"
  | "<color>"
  | "<length>"
  | "<number>"
  | "<percentage>"
  | "<length-percentage>"
  | "<time>"
  | "<angle>"
  | "<transform-function>"
  | "<transform-list>"
  | "<integer>"
  | "<url>"
  | "<image>"
  | "<string>"
  | "<resolution>"
  | "<custom-ident>";

export type TokenPropertySyntax =
  | `"${TokenPropertyKnownSyntax}"`
  | `'${TokenPropertyKnownSyntax}'`
  | (`"${string}"` & {})
  | (`'${string}'` & {});

export type TokenProperty = `--${string}`;

export type TokenVariable = `var(${string})`;

export type TokenPrimitive = string | number;

export type TokensStyle = {
  [key: TokenProperty]: TokenPrimitive;
};

export type TokensValue = {
  [key: string]: TokenPrimitive;
};

export type TokensKey<TTokensValue extends TokensValue> = keyof TTokensValue & string;

export interface TokenPropertyDescriptor<TTokenValue extends TokenPrimitive> {
  syntax: TokenPropertySyntax;
  inherits: boolean;
  initialValue?: NonNullable<TTokenValue>;
}

export type TokenPropertyConfig<TTokensValue extends TokensValue> = {
  [TKey in TokensKey<TTokensValue>]?: TokenPropertyDescriptor<TTokensValue[TKey]>;
};

export type TokensConfig<TTokensValue extends TokensValue> = Partial<TTokensValue>;

export interface Tokens<TTokensValue extends TokensValue> {
  (config: TokensConfig<TTokensValue>): TokensStyle;
  definition: TTokensValue;
  style: TokensStyle;
  css(): string;
  css(selector: string, wrapper?: string): string;
  css(config: TokensConfig<TTokensValue>): string;
  css(config: TokensConfig<TTokensValue>, selector: string, wrapper?: string): string;
  atProperties(config: TokenPropertyConfig<TTokensValue>): string;
  value<TKey extends TokensKey<TTokensValue>>(key: TKey): TTokensValue[TKey];
  value<TKey extends TokensKey<TTokensValue>>(
    key: TKey,
    fallback: NonNullable<TTokensValue[TKey]>,
  ): NonNullable<TTokensValue[TKey]>;
  value<TKey extends TokensKey<TTokensValue>>(
    key: TKey,
    fallback?: NonNullable<TTokensValue[TKey]>,
  ): NonNullable<TTokensValue[TKey]> | undefined;
  property<TKey extends TokensKey<TTokensValue>>(key: TKey): TokenProperty;
  variable<TKey extends TokensKey<TTokensValue>>(
    key: TKey,
    fallback?: NonNullable<TTokensValue[TKey]>,
  ): TokenVariable;
  extend<TExtensionTokensValue extends TokensValue>(
    extension: TExtensionTokensValue & TokensConfig<TTokensValue>,
  ): Tokens<Simplify<TTokensValue & TExtensionTokensValue>>;
}

export type InferTokensConfig<TTokens extends Tokens<any>> =
  TTokens extends Tokens<infer TTokenValue> ? TokensConfig<TTokenValue> : never;

const TOKENS_BRAND = Symbol("varhyme.tokens");

export function isTokens(target: unknown): target is Tokens<any> {
  const candidate = target as { [TOKENS_BRAND]: true };

  return Boolean(candidate && candidate[TOKENS_BRAND] === true);
}

export interface CreateTokensOptions {
  prefix?: string;
  createVariableName?(key: string, prefix?: string): string;
}

export function createTokens<TTokensValue extends TokensValue>(
  tokens: TTokensValue,
  options: CreateTokensOptions = EMPTY_OBJECT,
): Tokens<TTokensValue> {
  const { prefix, createVariableName = createVariableNameWithDash } = options;

  function dereference(value: TokenPrimitive): TokenPrimitive {
    if (!hasReference(value)) {
      return value;
    }

    return value.replace(/\{([^}]+)\}/g, (_, expression: string) => {
      let key;
      let fallback;

      const fallbackMarkerIndex = expression.indexOf("??");

      if (fallbackMarkerIndex > -1) {
        key = expression.slice(0, fallbackMarkerIndex).trim();
        fallback = expression.slice(fallbackMarkerIndex + 2).trim();
      } else {
        key = expression.trim();
      }

      return variable(
        key as TokensKey<TTokensValue>,
        fallback as TTokensValue[TokensKey<TTokensValue>] | undefined,
      );
    });
  }

  function create(config: TokensConfig<TTokensValue>): TokensStyle {
    const style: TokensStyle = {};

    for (const [key, value] of Object.entries(config)) {
      if (value !== undefined) {
        style[property(key)] = dereference(value);
      }
    }

    return style;
  }

  function css(
    maybeConfig?: TokensConfig<TTokensValue> | string,
    maybeSelector?: string,
    maybeWrapper?: string,
  ): string {
    let config: TokensConfig<TTokensValue>;
    let selector: string | undefined;
    let wrapper: string | undefined;

    if (typeof maybeConfig === "object") {
      config = maybeConfig;
      selector = maybeSelector;
      wrapper = maybeWrapper;
    } else {
      config = tokens;
      selector = maybeConfig;
      wrapper = maybeSelector;
    }

    const entries = Object.entries(createStyle(config));

    if (entries.length === 0) {
      return "";
    }

    const output: string[] = [];

    if (wrapper && selector) {
      output.push(`${wrapper} {
  ${selector} {`);

      for (const [name, value] of entries) {
        output.push(`    ${name}: ${value};`);
      }

      output.push(`  }
}`);
    } else if (selector) {
      output.push(`${selector} {`);

      for (const [name, value] of entries) {
        output.push(`  ${name}: ${value};`);
      }

      output.push(`}`);
    } else {
      for (const [name, value] of entries) {
        output.push(`${name}: ${value};`);
      }
    }

    return output.join("\n");
  }

  function atProperties(config: TokenPropertyConfig<TTokensValue>): string {
    const entries = Object.entries(config);

    if (entries.length === 0) {
      return "";
    }

    const output: string[] = [];

    for (const [key, descriptor] of entries) {
      if (descriptor !== undefined) {
        const { syntax, inherits, initialValue } = descriptor;

        if (output.length > 0) {
          output.push("");
        }

        const name = property(key as TokensKey<TTokensValue>);

        output.push(`@property ${name} {`);
        output.push(`  syntax: ${syntax};`);
        output.push(`  inherits: ${inherits};`);

        if (initialValue !== undefined) {
          output.push(`  initial-value: ${initialValue};`);
        }

        output.push(`}`);
      }
    }

    return output.join("\n");
  }

  function value<TKey extends TokensKey<TTokensValue>>(key: TKey): TTokensValue[TKey] | undefined;
  function value<TKey extends TokensKey<TTokensValue>>(
    key: TKey,
    fallback: NonNullable<TTokensValue[TKey]>,
  ): NonNullable<TTokensValue[TKey]>;
  function value<TKey extends TokensKey<TTokensValue>>(
    key: TKey,
    fallback?: NonNullable<TTokensValue[TKey]>,
  ): NonNullable<TTokensValue[TKey]> | undefined;
  function value<TKey extends TokensKey<TTokensValue>>(key: TKey, fallback?: TTokensValue[TKey]) {
    const { [key]: value } = tokens;

    return value !== undefined ? dereference(value) : fallback;
  }

  function property<TKey extends TokensKey<TTokensValue>>(key: TKey): TokenProperty {
    return `--${createVariableName(key, prefix)}`;
  }

  function variable<TKey extends TokensKey<TTokensValue>>(
    key: TKey,
    fallback?: NonNullable<TTokensValue[TKey]>,
  ): TokenVariable {
    return fallback === undefined ? `var(${property(key)})` : `var(${property(key)}, ${fallback})`;
  }

  function extend<TExtensionTokensValue extends TokensValue>(
    extension: TExtensionTokensValue & TokensConfig<TTokensValue>,
  ): Tokens<Simplify<TTokensValue & TExtensionTokensValue>> {
    return createTokens<TTokensValue & TExtensionTokensValue>({ ...tokens, ...extension }, options);
  }

  let _style: TokensStyle;

  function createStyle(config: TokensConfig<TTokensValue>): TokensStyle {
    if (config !== tokens) {
      return create(config);
    }

    if (!_style) {
      _style = create(config);
    }

    return _style;
  }

  createStyle.definition = tokens;

  createStyle.css = css;

  createStyle.atProperties = atProperties;

  createStyle.value = value;

  createStyle.property = property;

  createStyle.variable = variable;

  createStyle.extend = extend;

  Object.defineProperty(createStyle, "style", {
    get() {
      return createStyle(tokens);
    },
  });

  Object.defineProperty(createStyle, TOKENS_BRAND, { value: true });

  return createStyle as Tokens<TTokensValue>;
}

function hasReference(value: unknown): value is string {
  return typeof value === "string" && value.includes("{");
}

function createVariableNameWithDash(key: string, prefix?: string) {
  if (key.includes(".")) {
    const path = key.split(".");

    if (prefix) {
      path.unshift(prefix);
    }

    return path.join("-");
  }

  if (prefix) {
    return `${prefix}-${key}`;
  }

  return key;
}

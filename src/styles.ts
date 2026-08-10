import type { PartialShallow, Simplify, SimplifyShallow } from "./shared/types";

import { EMPTY_OBJECT, run } from "./shared/utils";
import { sx } from "./utils";

export type SlotsValue = {
  [name: string]: string;
};

export type Slots<TSlotsValue extends SlotsValue> = {
  [name in keyof TSlotsValue]: string;
};

export type VariantPrimitive = string | number;

export type VariantValue<TVariantValue extends VariantPrimitive> = TVariantValue extends
  | "true"
  | "false"
  ? boolean
  : TVariantValue;

export type VariantsValue<TSlotsValue extends SlotsValue> = {
  [name: string]: {
    [value: VariantPrimitive]: Partial<Slots<TSlotsValue>>;
  };
};

export type Variants<
  TSlotsValue extends SlotsValue,
  TVariantsValue extends VariantsValue<TSlotsValue>,
> = {
  [TName in keyof TVariantsValue]: VariantValue<keyof TVariantsValue[TName] & VariantPrimitive>;
};

export type CompoundVariantVariantsValue<
  TSlotsValue extends SlotsValue,
  TVariantsValue extends VariantsValue<TSlotsValue>,
> = {
  [TName in keyof TVariantsValue]?:
    | VariantValue<keyof TVariantsValue[TName] & VariantPrimitive>
    | VariantValue<keyof TVariantsValue[TName] & VariantPrimitive>[];
};

export interface CompoundVariant<
  TSlotsValue extends SlotsValue,
  TVariantsValue extends VariantsValue<TSlotsValue>,
> {
  variants: CompoundVariantVariantsValue<TSlotsValue, TVariantsValue>;
  slots: Partial<Slots<TSlotsValue>>;
}

export type CompoundVariants<
  TSlotsValue extends SlotsValue,
  TVariantsValue extends VariantsValue<TSlotsValue>,
> = CompoundVariant<TSlotsValue, TVariantsValue> | CompoundVariant<TSlotsValue, TVariantsValue>[];

export interface StylesValue<
  TSlotsValue extends SlotsValue,
  TVariantsValue extends VariantsValue<TSlotsValue>,
> {
  slots: TSlotsValue;
  variants?: TVariantsValue;
  compoundVariants?: CompoundVariants<TSlotsValue, TVariantsValue>;
  defaultVariants?: Partial<Variants<TSlotsValue, TVariantsValue>>;
}

export interface StylesConfig<
  TSlotsValue extends SlotsValue,
  TVariantsValue extends VariantsValue<TSlotsValue>,
> {
  slots?:
    | ((
        variants: Partial<Variants<TSlotsValue, TVariantsValue>>,
      ) => Partial<Slots<TSlotsValue>> | undefined)
    | Partial<Slots<TSlotsValue>>;
  variants?: Partial<Variants<TSlotsValue, TVariantsValue>>;
}

export interface Styles<
  TSlotsValue extends SlotsValue,
  TVariantsValue extends VariantsValue<TSlotsValue>,
> {
  (
    config?: StylesConfig<TSlotsValue, TVariantsValue>,
    overrides?: Partial<Slots<TSlotsValue>> | string,
  ): Slots<TSlotsValue>;
  definition: StylesValue<TSlotsValue, TVariantsValue>;
  slots: Slots<TSlotsValue>;
  extend<
    TExtensionSlotsValue extends SlotsValue,
    TExtensionVariantsValue extends VariantsValue<TExtensionSlotsValue & Partial<TSlotsValue>>,
  >(
    extension: Partial<
      StylesValue<
        Simplify<TExtensionSlotsValue & Partial<TSlotsValue>>,
        SimplifyShallow<TExtensionVariantsValue & PartialShallow<TVariantsValue>>
      >
    >,
  ): Styles<
    Simplify<TSlotsValue & TExtensionSlotsValue>,
    SimplifyShallow<TVariantsValue & TExtensionVariantsValue>
  >;
}

export type InferStylesConfig<TStyles extends Styles<any, any>> =
  TStyles extends Styles<infer TSlotsValue, infer TVariantsValue>
    ? StylesConfig<TSlotsValue, VariantsValue<any> extends TVariantsValue ? {} : TVariantsValue>
    : never;

export type ExtractStylesConfig<TStyles extends Styles<any, any>, TRules extends string> =
  TStyles extends Styles<infer TSlotsValue, infer TVariantsValue>
    ? StylesConfig<
        Simplify<Pick<TSlotsValue, Extract<keyof TSlotsValue, TRules>>>,
        VariantsValue<any> extends TVariantsValue ? {} : TVariantsValue
      >
    : never;

export type ExcludeStylesConfig<TStyles extends Styles<any, any>, TRules extends string> =
  TStyles extends Styles<infer TSlotsValue, infer TVariantsValue>
    ? StylesConfig<
        Simplify<Pick<TSlotsValue, Exclude<keyof TSlotsValue, TRules>>>,
        VariantsValue<any> extends TVariantsValue ? {} : TVariantsValue
      >
    : never;

export type InferComponentStylesConfig<TStyles extends Styles<any, any>> = Simplify<
  Pick<InferStylesConfig<TStyles>, "slots"> & InferStylesConfig<TStyles>["variants"]
>;

export type ExtractComponentStylesConfig<
  TStyles extends Styles<any, any>,
  TRules extends string,
> = Simplify<
  Pick<ExtractStylesConfig<TStyles, TRules>, "slots"> & InferStylesConfig<TStyles>["variants"]
>;

export type ExcludeComponentStylesConfig<
  TStyles extends Styles<any, any>,
  TRules extends string,
> = Simplify<
  Pick<ExcludeStylesConfig<TStyles, TRules>, "slots"> & InferStylesConfig<TStyles>["variants"]
>;

const STYLES_BRAND = Symbol("varhyme.styles");

export function isStyles(target: unknown): target is Styles<any, any> {
  const candidate = target as { [STYLES_BRAND]: true };

  return Boolean(candidate && candidate[STYLES_BRAND] === true);
}

export interface CreateStylesOptions {
  mergeClasses?(...classes: string[]): string;
}

export function createStyles<
  TSlotsValue extends SlotsValue,
  TVariantsValue extends VariantsValue<TSlotsValue>,
>(
  styles: StylesValue<TSlotsValue, TVariantsValue>,
  options: CreateStylesOptions = EMPTY_OBJECT,
): Styles<TSlotsValue, TVariantsValue> {
  const { mergeClasses = mergeClassesWithSpace } = options;

  const createConfigVariantsValue = run<
    (
      configVariants?: Partial<Variants<TSlotsValue, TVariantsValue>>,
    ) => Partial<Variants<TSlotsValue, TVariantsValue>> | undefined
  >(() => {
    const { variants } = styles;

    if (!variants) {
      return () => {
        return undefined;
      };
    }

    const { defaultVariants } = styles;

    if (!defaultVariants) {
      return (configVariants) => {
        return configVariants;
      };
    }

    return (configVariants) => {
      if (!configVariants) {
        return defaultVariants;
      }

      const mergedVariants = { ...defaultVariants };

      for (const [key, value] of Object.entries(configVariants)) {
        if (value !== undefined) {
          const name = key as keyof Variants<TSlotsValue, TVariantsValue>;

          mergedVariants[name] = value;
        }
      }

      return mergedVariants;
    };
  });

  const createVariantsSlotsValues = run<
    (
      configVariantsValue?: Partial<Variants<TSlotsValue, TVariantsValue>>,
      slotsValues?: Partial<Slots<TSlotsValue>>[],
    ) => Partial<Slots<TSlotsValue>>[]
  >(() => {
    const { variants } = styles;

    if (!variants) {
      return (_, slotsValues = []) => {
        return slotsValues;
      };
    }

    const createCompoundVariantsSlotsValues = run<
      (
        configVariantsValue: Partial<Variants<TSlotsValue, TVariantsValue>>,
        slotsValues?: Partial<Slots<TSlotsValue>>[],
      ) => Partial<Slots<TSlotsValue>>[]
    >(() => {
      const compoundVariants =
        styles.compoundVariants &&
        (Array.isArray(styles.compoundVariants)
          ? styles.compoundVariants
          : [styles.compoundVariants]);

      if (!compoundVariants || compoundVariants.length === 0) {
        return (_, slotsValues = []) => {
          return slotsValues;
        };
      }

      const compoundConditions = compoundVariants.map((compoundVariant) => {
        const { slots, variants } = compoundVariant;

        return {
          slots,
          conditions: Object.entries(variants).map(([key, value]) => {
            return [
              key,
              value,
              Array.isArray(value) ? value.map((value) => String(value)) : String(value),
            ] as const;
          }),
        };
      });

      return (configVariantsValue, slotsValues = []) => {
        for (const compoundCondition of compoundConditions) {
          const isMatch = compoundCondition.conditions.every(([key, value, valueString]) => {
            if (value === undefined) {
              return true;
            }

            const variantValue = configVariantsValue[key];

            if (variantValue === undefined) {
              return false;
            }

            if (variantValue === value) {
              return true;
            }

            const variantValueString = String(variantValue);

            if (!Array.isArray(valueString)) {
              return variantValueString === valueString;
            }

            return valueString.includes(variantValueString);
          });

          if (isMatch) {
            slotsValues.push(compoundCondition.slots);
          }
        }

        return slotsValues;
      };
    });

    return (
      configVariantsValue?: Partial<Variants<TSlotsValue, TVariantsValue>>,
      slotsValues = [],
    ) => {
      if (!configVariantsValue) {
        return slotsValues;
      }

      const configVariantsValueEntries = Object.entries(configVariantsValue);

      if (configVariantsValueEntries.length === 0) {
        return slotsValues;
      }

      let hasDefinedVariants = false;

      for (const [key, value] of configVariantsValueEntries) {
        if (value !== undefined) {
          hasDefinedVariants = true;

          const slotsValue = variants[key][String(value)];

          if (slotsValue) {
            slotsValues.push(slotsValue);
          }
        }
      }

      if (hasDefinedVariants) {
        createCompoundVariantsSlotsValues(configVariantsValue, slotsValues);
      }

      return slotsValues;
    };
  });

  const slotsEntries = Object.entries(styles.slots);

  function create(
    config?: StylesConfig<TSlotsValue, TVariantsValue>,
    overrides?: Partial<Slots<TSlotsValue>> | string,
  ): Slots<TSlotsValue> {
    if (slotsEntries.length === 0) {
      return styles.slots;
    }

    const configVariantsValue = createConfigVariantsValue(config?.variants);
    const configSlotsValue =
      config?.slots &&
      (typeof config.slots === "function"
        ? config.slots(configVariantsValue || EMPTY_OBJECT)
        : config.slots);
    const overridesSlotsValue =
      overrides &&
      (typeof overrides === "string"
        ? ({ root: overrides } as Partial<Slots<TSlotsValue>>)
        : overrides);

    const slotsValues = createVariantsSlotsValues(configVariantsValue);

    if (configSlotsValue) {
      slotsValues.push(configSlotsValue);
    }

    if (overridesSlotsValue) {
      slotsValues.push(overridesSlotsValue);
    }

    if (slotsValues.length === 0) {
      return styles.slots;
    }

    const mergedSlots = {} as Slots<TSlotsValue>;

    for (const [key, value] of slotsEntries) {
      const name = key as keyof TSlotsValue;

      const classes: string[] = [];

      for (const slots of slotsValues) {
        const value = slots[name];

        if (value) {
          classes.push(value);
        }
      }

      mergedSlots[name] = classes.length > 0 ? mergeClasses(value, ...classes) : value;
    }

    return mergedSlots;
  }

  function extend<
    TExtensionSlotsValue extends SlotsValue,
    TExtensionVariantsValue extends VariantsValue<TExtensionSlotsValue & Partial<TSlotsValue>>,
  >(
    extension: Partial<
      StylesValue<
        Simplify<TExtensionSlotsValue & Partial<TSlotsValue>>,
        SimplifyShallow<TExtensionVariantsValue & PartialShallow<TVariantsValue>>
      >
    >,
  ): Styles<
    Simplify<TSlotsValue & TExtensionSlotsValue>,
    SimplifyShallow<TVariantsValue & TExtensionVariantsValue>
  > {
    function mergeSlots(base?: Partial<SlotsValue>, patch?: Partial<SlotsValue>) {
      if (!patch) {
        return base;
      }

      if (!base) {
        return patch;
      }

      const merged = { ...base };

      for (const [name, value] of Object.entries(patch)) {
        if (value) {
          merged[name] = base[name] ? mergeClasses(base[name], value) : value;
        }
      }

      return merged;
    }

    function mergeVariants(base?: VariantsValue<SlotsValue>, patch?: VariantsValue<SlotsValue>) {
      if (!patch) {
        return base;
      }

      if (!base) {
        return patch;
      }

      const merged = { ...base };

      for (const [variantName, value] of Object.entries(patch)) {
        if (base[variantName]) {
          const mergedValue = { ...base[variantName] };

          for (const [variantValue, slots] of Object.entries(value)) {
            mergedValue[variantValue] = mergeSlots(base[variantName][variantValue], slots)!;
          }

          merged[variantName] = mergedValue;
        } else {
          merged[variantName] = value;
        }
      }

      return merged;
    }

    function mergeCompoundVariants(
      base?: CompoundVariants<SlotsValue, VariantsValue<SlotsValue>>,
      patch?: CompoundVariants<SlotsValue, VariantsValue<SlotsValue>>,
    ) {
      if (!patch) {
        return base;
      }

      if (!base) {
        return patch;
      }

      const baseCompoundVariants = Array.isArray(base) ? base : [base];
      const patchCompoundVariants = Array.isArray(patch) ? patch : [patch];

      const merged = [...baseCompoundVariants];

      const variantsNamesCache: Map<
        CompoundVariant<SlotsValue, VariantsValue<SlotsValue>>,
        string[]
      > = new Map();

      const getVariantsNames = (
        variant: CompoundVariant<SlotsValue, VariantsValue<SlotsValue>>,
      ) => {
        let names = variantsNamesCache.get(variant);

        if (!names) {
          names = Object.keys(variant.variants);

          variantsNamesCache.set(variant, names);
        }

        return names;
      };

      for (const patchCompoundVariant of patchCompoundVariants) {
        const patchVariantsNames = getVariantsNames(patchCompoundVariant);

        const index = baseCompoundVariants.findIndex((baseCompoundVariant) => {
          const baseVariantsNames = getVariantsNames(baseCompoundVariant);

          if (baseVariantsNames.length !== patchVariantsNames.length) {
            return false;
          }

          for (const variantName of patchVariantsNames) {
            const baseVariantValue = baseCompoundVariant.variants[variantName];
            const patchVariantValue = patchCompoundVariant.variants[variantName];

            if (baseVariantValue !== patchVariantValue) {
              if (!baseVariantValue || !patchVariantValue) {
                return false;
              }

              const baseVariantValues = Array.isArray(baseVariantValue)
                ? baseVariantValue
                : [baseVariantValue];
              const patchVariantValues = Array.isArray(patchVariantValue)
                ? patchVariantValue
                : [patchVariantValue];

              if (
                baseVariantValues.length !== patchVariantValues.length ||
                baseVariantValues.some((value) => !patchVariantValues.includes(value)) ||
                patchVariantValues.some((value) => !baseVariantValues.includes(value))
              ) {
                return false;
              }
            }
          }

          return true;
        });

        if (index > -1) {
          merged[index] = {
            ...merged[index],
            slots: mergeSlots(merged[index].slots, patchCompoundVariant.slots)!,
          };
        } else {
          merged.push(patchCompoundVariant);
        }
      }

      if (merged.length === 1 && !Array.isArray(base) && !Array.isArray(patch)) {
        return merged[0];
      }

      return merged;
    }

    return createStyles(
      {
        slots: mergeSlots(styles.slots, extension.slots),
        variants: mergeVariants(styles.variants, extension.variants),
        compoundVariants: mergeCompoundVariants(
          styles.compoundVariants as
            | CompoundVariants<SlotsValue, VariantsValue<SlotsValue>>
            | undefined,
          extension.compoundVariants as
            | CompoundVariants<SlotsValue, VariantsValue<SlotsValue>>
            | undefined,
        ),
        defaultVariants: sx(styles.defaultVariants, extension.defaultVariants),
      } as StylesValue<
        Simplify<TSlotsValue & TExtensionSlotsValue>,
        SimplifyShallow<TVariantsValue & TExtensionVariantsValue>
      >,
      options,
    );
  }

  let _slots: Slots<TSlotsValue>;

  function createSlots(
    config?: StylesConfig<TSlotsValue, TVariantsValue>,
    overrides?: Partial<Slots<TSlotsValue>> | string,
  ): Slots<TSlotsValue> {
    if ((config && (config.slots || config.variants)) || overrides) {
      return create(config, overrides);
    }

    if (!_slots) {
      _slots = create();
    }

    return _slots;
  }

  createSlots.definition = styles;

  createSlots.extend = extend;

  Object.defineProperty(createSlots, "slots", {
    get() {
      return createSlots();
    },
  });

  Object.defineProperty(createSlots, STYLES_BRAND, { value: true });

  return createSlots as Styles<TSlotsValue, TVariantsValue>;
}

function mergeClassesWithSpace(...classes: string[]) {
  return classes.join(" ");
}

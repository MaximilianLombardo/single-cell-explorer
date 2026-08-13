/* eslint-disable no-bitwise -- unsigned right shift better than Math.round */
import { expect, test } from "@playwright/test";

/*
test color helpers
*/
import {
  createColorTable,
  loadUserColorConfig,
} from "../../../src/util/stateManager/colorHelpers";
import * as Dataframe from "../../../src/util/dataframe";

const { describe } = test;

/*
Deterministic PRNG (mulberry32).  The fixtures below need pseudo-random data,
but a bare Math.random() makes failures unreproducible, so seed it.
*/
let rngState = 0x9e3779b9;
function random() {
  rngState |= 0;
  rngState = (rngState + 0x6d2b79f5) | 0;
  let t = Math.imul(rngState ^ (rngState >>> 15), 1 | rngState);
  t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

describe("categorical color helpers", () => {
  /*
  Primary test constraint for categorical colors is that they are ordered/identified
  by schema order, NOT by value.  Ie,

    scale(schemaIndex) should match rgb[obsOffset]
  */

  const schema = indexSchema({
    annotations: {
      obs: {
        columns: [
          {
            name: "name_0",
            type: "string",
            writable: false,
          },
          {
            name: "continuousColumn",
            type: "float32",
            writable: false,
          },
          {
            categories: [
              "CD4 T cells",
              "CD14+ Monocytes",
              "B cells",
              "CD8 T cells",
              "NK cells",
              "FCGR3A+ Monocytes",
              "Dendritic cells",
              "Megakaryocytes",
            ],
            name: "categoricalColumn",
            type: "categorical",
            writable: false,
          },
        ],
        index: "name_0",
      },
      var: {
        columns: [
          {
            name: "name_0",
            type: "string",
            writable: false,
          },
        ],
        index: "name_0",
      },
    },
    dataframe: {
      nObs: 2638,
      nVar: 1838,
      type: "float32",
    },
    layout: {},
  });

  const catColCategories = schema.annotations.obs.columns[2].categories;
  const isSpatial = false;
  const obsDataframe = new Dataframe.Dataframe(
    [schema.dataframe.nObs, 2],
    [
      new Float32Array(schema.dataframe.nObs).map(() => random()),
      new Array(schema.dataframe.nObs)
        .fill("")
        .map(
          () => catColCategories[(random() * catColCategories.length) >>> 0]
        ),
    ],
    null,
    new Dataframe.KeyIndex(["continuousColumn", "categoricalColumn"])
  );

  test("default category order", () => {
    const ct = createColorTable({
      colorMode: "color by categorical metadata",
      colorByAccessor: "categoricalColumn",
      colorByData: obsDataframe,
      schema,
      userColors: null,
      isSpatial,
    });
    expect(ct).toBeDefined();
    const data = obsDataframe.col("categoricalColumn").asArray();
    const cats = schema.annotations.obsByName.categoricalColumn.categories;
    for (let i = 0; i < schema.dataframe.nObs; i += 1) {
      expect(makeScale(ct.rgb, i)).toEqual(ct?.scale?.(cats.indexOf(data[i])));
    }
  });

  test("shuffle category order", () => {
    const schemaClone = indexSchema(JSON.parse(JSON.stringify(schema)));
    const originalOrder = Array.from(
      schemaClone.annotations.obsByName.categoricalColumn.categories
    );
    shuffle(schemaClone.annotations.obsByName.categoricalColumn.categories);
    // guard against a no-op shuffle silently making this a duplicate of the
    // "default category order" test
    expect(
      schemaClone.annotations.obsByName.categoricalColumn.categories
    ).not.toEqual(originalOrder);
    const ct = createColorTable({
      colorMode: "color by categorical metadata",
      colorByAccessor: "categoricalColumn",
      colorByData: obsDataframe,
      schema: schemaClone,
      userColors: null,
      isSpatial,
    });
    expect(ct).toBeDefined();
    const data = obsDataframe.col("categoricalColumn").asArray();
    const cats = schemaClone.annotations.obsByName.categoricalColumn.categories;
    for (let i = 0; i < schemaClone.dataframe.nObs; i += 1) {
      expect(makeScale(ct.rgb, i)).toEqual(ct?.scale?.(cats.indexOf(data[i])));
    }
  });

  test("user defined color order", () => {
    const cats = schema.annotations.obsByName.categoricalColumn.categories;

    const shuffleCats = shuffle(
      Array.from(schema.annotations.obsByName.categoricalColumn.categories)
    );

    const userDefinedColorTable = {
      categoricalColumn: shuffleCats.reduce(
        (acc: { [label: string]: string }, label: string) => {
          acc[label] = randRGBColor();
          return acc;
        },
        {}
      ),
    };

    const userColors = loadUserColorConfig(userDefinedColorTable);
    expect(userColors).toBeDefined();

    const ct = createColorTable({
      colorMode: "color by categorical metadata",
      colorByAccessor: "categoricalColumn",
      colorByData: obsDataframe,
      schema,
      userColors,
      isSpatial,
    });
    expect(ct).toBeDefined();
    const data = obsDataframe.col("categoricalColumn").asArray();
    for (let i = 0; i < schema.dataframe.nObs; i += 1) {
      expect(makeScale(ct.rgb, i)).toEqual(
        ct?.scale?.(cats.indexOf(data[i])).toString()
      );
    }
  });
});

/*
TODO:
1. mix up category order in schema to make sure it works with varied order
2. user defined colors
*/

// eslint-disable-next-line @typescript-eslint/no-explicit-any --- FIXME: disabled temporarily on migrate to TS.
function indexSchema(schema: any) {
  schema.annotations.obsByName = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any --- FIXME: disabled temporarily on migrate to TS.
    schema.annotations?.obs?.columns?.map((v: any) => [v.name, v]) ?? []
  );
  schema.annotations.varByName = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any --- FIXME: disabled temporarily on migrate to TS.
    schema.annotations?.var?.columns?.map((v: any) => [v.name, v]) ?? []
  );
  schema.layout.obsByName = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any --- FIXME: disabled temporarily on migrate to TS.
    schema.layout?.obs?.map((v: any) => [v.name, v]) ?? []
  );
  schema.layout.varByName = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any --- FIXME: disabled temporarily on migrate to TS.
    schema.layout?.var?.map((v: any) => [v.name, v]) ?? []
  );

  return schema;
}

/*
ColorTable.rgb is a *flat* Float32Array of length 3 * nObs -- three
consecutive floats (0..1) per obs -- so the triple for obs `i` lives at
[3i, 3i+3).
*/
function makeScale(rgb: Float32Array, i: number) {
  // make a scale string from the rgb float triple of obs `i`
  const r = Math.round(rgb[3 * i] * 255);
  const g = Math.round(rgb[3 * i + 1] * 255);
  const b = Math.round(rgb[3 * i + 2] * 255);
  return `rgb(${r}, ${g}, ${b})`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any --- FIXME: disabled temporarily on migrate to TS.
function shuffle(array: any) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = (random() * (i + 1)) >>> 0;
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function randHexColor() {
  const hex = ((random() * 255) >>> 0).toString(16);
  return `0${hex}`.slice(-2);
}

function randRGBColor() {
  return `#${randHexColor()}${randHexColor()}${randHexColor()}`;
}

/* eslint-enable no-bitwise -- unsigned right shift better than Math.round */

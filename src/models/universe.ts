import { BaseImmutable, NamedArray, Property } from 'immutable-class';

import { Attractor, AttractorJS } from './attractor';
import { Emitter, EmitterJS } from './emitter';

function getUniqueName(array: (Emitter | Attractor)[], root: string): string {
  let n = 0;
  const name = root;

  while (NamedArray.containsByName(array, name + ' #' + n)) n++;

  return name + ' #' + n;
}

export interface UniverseValue {
  emitters?: Emitter[];
  attractors?: Attractor[];
  controlsHidden?: boolean;
  selectedItems?: string[];
}

export interface UniverseJS {
  emitters?: EmitterJS[];
  attractors?: AttractorJS[];
  controlsHidden?: boolean;
  selectedItems?: string[];
}

export class Universe extends BaseImmutable<UniverseValue, UniverseJS> {
  static DEFAULT: Universe;

  static PROPERTIES: Property[] = [
    { name: 'emitters', immutableClassArray: Emitter },
    { name: 'attractors', immutableClassArray: Attractor },
    { name: 'controlsHidden', defaultValue: false },
    { name: 'selectedItems', defaultValue: null },
  ];

  static fromJS(params: UniverseJS) {
    return new Universe(BaseImmutable.jsToValue(Universe.PROPERTIES, params));
  }

  static fromHash(hash: string): Universe {
    if (!hash) return Universe.DEFAULT;

    const commonScope = {
      t: 0,
      R: Math.random(),
    };

    try {
      const json = JSON.parse(decodeURI(hash.replace(/^#/, '')));

      const emitters = json.emitters.map((e: any, i: number) =>
        Emitter.unserialize(e).update({
          ...commonScope,
          j: i,
          n: json.emitters.length,
          r: Math.random(),
        }),
      );
      const attractors = json.attractors.map((a: any, i: number) =>
        Attractor.unserialize(a).update({
          ...commonScope,
          j: i,
          n: json.attractors.length,
          r: Math.random(),
        }),
      );

      return new Universe({
        emitters,
        attractors,
        controlsHidden: !!json.controlsHidden,
        selectedItems: json.selectedItems,
      });
    } catch (e) {
      console.log(e);
      return Universe.DEFAULT;
    }
  }

  public emitters: Emitter[] | undefined;
  public attractors: Attractor[] | undefined;
  public controlsHidden: boolean | undefined;
  public selectedItems: string[] | undefined;

  constructor(params: UniverseValue = {}) {
    super(params);
  }

  // @ts-ignore
  changeEmitters: (emitters: Emitter[]) => Universe;

  // @ts-ignore
  getEmitters: () => Emitter[];

  // @ts-ignore
  changeAttractors: (attractors: Attractor[]) => Universe;

  // @ts-ignore
  getAttractors: () => Attractor[];

  // @ts-ignore
  changeSelectedItems: (selectedItems: string[]) => Universe;

  // @ts-ignore
  getSelectedItems: () => string[];

  // @ts-ignore
  changeControlsHidden: (controlsHidden: boolean) => Universe;

  // @ts-ignore
  getControlsHidden: () => boolean;

  toggleControls() {
    return this.changeControlsHidden(!this.controlsHidden);
  }

  toHash() {
    const { selectedItems, controlsHidden } = this;

    const o = {
      selectedItems,
      controlsHidden,
      emitters: this.getEmitters().map(e => e.serialize()),
      attractors: this.getAttractors().map(a => a.serialize()),
    };

    return '#' + encodeURI(JSON.stringify(o));
  }

  update(time: number) {
    const v = this.valueOf();

    const commonScope = {
      t: time,
      R: Math.random(),
    };

    v.emitters = this.getEmitters().map((e, i) =>
      e.update({
        ...commonScope,
        j: i,
        n: this.getEmitters().length,
        r: Math.random(),
      }),
    );
    v.attractors = this.getAttractors().map((a, i) =>
      a.update({
        ...commonScope,
        j: i,
        n: this.getAttractors().length,
        r: Math.random(),
      }),
    );

    return new Universe(v);
  }

  addEmitter(time: number) {
    const emitters = this.getEmitters();

    const name = getUniqueName(emitters, 'Emitter');
    const newItem = Emitter.fromJS({
      name,
      label: name,
      x: '50',
      y: '50',
      spread: 'pi / 4',
      angle: '0',
      emissionRate: 'true',
      batchSize: '6',
      lifeSpan: '500',
      hue: 'abs(sin(t / 50)) + 1',
    }).update({
      t: time,
      j: emitters.length,
      n: emitters.length + 1,
      r: Math.random(),
      R: Math.random(),
    });

    return this.changeMany({
      emitters: emitters.concat([newItem]),
      selectedItems: [newItem.name],
    });
  }

  addAttractor(time: number) {
    const attractors = this.getAttractors();

    const name = getUniqueName(attractors, 'Attractor');
    const newItem = Attractor.fromJS({
      name,
      label: name,
      mass: 'sin(t / 50) * 20',
      x: '250',
      y: '50',
    }).update({
      t: time,
      j: attractors.length,
      n: attractors.length + 1,
      r: Math.random(),
      R: Math.random(),
    });

    return this.changeMany({
      attractors: attractors.concat([newItem]),
      selectedItems: [newItem.name],
    });
  }

  getSourceOfSelection() {
    const { selectedItems, attractors, emitters } = this;

    if (!selectedItems || !selectedItems.length) return null;

    if (this.getAttractors().find(a => a.name === selectedItems[0])) return attractors;

    return emitters;
  }

  changeItems(items: (Attractor | Emitter)[]) {
    const emitters = this.getEmitters();
    const attractors = this.getAttractors();

    if (Emitter.isEmitter(items[0])) {
      return this.changeEmitters(NamedArray.overridesByName(emitters, items) as Emitter[]);
    } else {
      return this.changeAttractors(NamedArray.overridesByName(attractors, items) as Attractor[]);
    }
  }

  selectNext() {
    const selectedItems = this.getSelectedItems();

    const a = this.getSourceOfSelection();
    if (!a) return this;

    const i = NamedArray.findIndexByName(a as any, selectedItems[0]);

    return this.changeSelectedItems([a[i === a.length - 1 ? 0 : i + 1].name]);
  }

  selectPrevious() {
    const selectedItems = this.getSelectedItems();

    const a = this.getSourceOfSelection();
    if (!a) return this;

    const i = NamedArray.findIndexByName(a as any, selectedItems[0]);

    return this.changeSelectedItems([a[i === 0 ? a.length - 1 : i - 1].name]);
  }

  getSelectedItemsFields() {
    const selectedItems = this.getSelectedItems();
    const emitters = this.getEmitters();

    if (!selectedItems || !selectedItems.length) return [];

    const isEmitter = !!NamedArray.findByName(emitters, selectedItems[0]);

    if (isEmitter) {
      return [
        'x',
        'y',
        'angle',
        'spread',
        'velocity',
        'batchSize',
        'emissionRate',
        'hue',
        'saturation',
        'lightness',
      ];
    } else {
      return ['x', 'y', 'mass'];
    }
  }

  select(item: Attractor | Emitter, isMulti = false) {
    const selectedItems = this.getSelectedItems();
    const emitters = this.getEmitters();
    const attractors = this.getAttractors();

    let newSelectedItems: string[] = [];

    if (!isMulti) {
      if (selectedItems.indexOf(item.name) > -1) {
        newSelectedItems = selectedItems.length > 1 ? [item.name] : [];
      } else {
        newSelectedItems = [item.name];
      }
    } else {
      if (selectedItems.indexOf(item.name) > -1) {
        newSelectedItems = selectedItems.filter(n => n !== name);
      } else {
        newSelectedItems = selectedItems.concat([item.name]);

        const onlyAttractors = newSelectedItems.every(n => !!NamedArray.findByName(attractors, n));
        const onlyEmitters = newSelectedItems.every(n => !!NamedArray.findByName(emitters, n));

        if (!onlyAttractors && !onlyEmitters) {
          newSelectedItems = [item.name];
        }
      }
    }

    return this.changeSelectedItems(newSelectedItems);
  }

  deleteSelectedItems() {
    const selectedItems = this.getSelectedItems();
    const emitters = this.getEmitters();
    const attractors = this.getAttractors();

    const v = this.valueOf();

    v.attractors = attractors.filter(a => selectedItems.indexOf(a.name) === -1);
    v.emitters = emitters.filter(e => selectedItems.indexOf(e.name) === -1);
    v.selectedItems = [];

    return new Universe(v);
  }

  duplicateSelectedItems() {
    const selectedItems = this.getSelectedItems();
    const emitters = this.getEmitters();
    const attractors = this.getAttractors();

    if (!selectedItems || !selectedItems.length) return this;

    if (NamedArray.findByName(emitters, selectedItems[0])) {
      const newItems = selectedItems.map(name => {
        const newName = getUniqueName(emitters, 'Emitter');

        return NamedArray.findByName(emitters, name)!.changeMany({
          name: newName,
          label: newName,
        });
      });

      return this.changeEmitters(emitters.concat(newItems));
    } else {
      const newItems = selectedItems.map(name => {
        const newName = getUniqueName(attractors, 'Attractor');

        return NamedArray.findByName(attractors, name)!.changeMany({
          name: newName,
          label: newName,
        });
      });

      return this.changeAttractors(attractors.concat(newItems));
    }
  }

  getActualSelectedItems() {
    const a = this.getSourceOfSelection();

    return this.getSelectedItems()
      .map(n => NamedArray.findByName(a as (Emitter | Attractor)[], n))
      .filter(Boolean) as (Attractor | Emitter)[];
  }

  resetTime() {
    const emitters = this.getEmitters();
    const attractors = this.getAttractors();

    const v = this.valueOf();

    v.emitters = emitters.map(e => e.change('time', 0));
    v.attractors = attractors.map(a => a.change('time', 0));

    return new Universe(v);
  }
}

BaseImmutable.finalize(Universe);

const R = Math.random();
Universe.DEFAULT = new Universe({
  selectedItems: [],
  controlsHidden: false,
  emitters: [
    Emitter.fromJS({
      name: 'Emitter #0',
      label: 'Emitter #0',
      x: '50',
      y: '250',
      spread: 'pi / 4',
      angle: '0',
      emissionRate: 't % 20 == 0',
      batchSize: '1',
      lifeSpan: '500',
      hue: 'abs(sin(t / 50)) + 1',
    }).update({ t: 0, j: 0, n: 2, r: Math.random(), R }),
    Emitter.fromJS({
      name: 'Emitter #1',
      label: 'Emitter #1',
      x: '450',
      y: '250',
      spread: 'pi / 4',
      angle: 'pi',
      emissionRate: 't % 20 == 0',
      batchSize: '1',
      lifeSpan: '500',
      hue: 'abs(sin(t / 50)) + 1',
    }).update({ t: 0, j: 1, n: 2, r: Math.random(), R }),
  ] as any,
  attractors: [
    Attractor.fromJS({
      name: 'Attractor #0',
      label: 'Attractor #0',
      mass: 'sin(t / 50) * 20',
      x: '250',
      y: '250',
    }).update({ t: 0, j: 0, n: 1, r: Math.random(), R }),
  ],
});

import { BaseImmutable, Property, NamedArray } from 'immutable-class';

import { Emitter, EmitterJS } from './emitter';
import { Attractor, AttractorJS } from './attractor';

function getUniqueName(array: (Emitter | Attractor)[], root: string): string {
  let n = 0;
  let name = root;

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
  emitters?: EmitterJS[]
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
    { name: 'selectedItems', defaultValue: null }
  ];

  static fromJS(params: UniverseJS) {
    return new Universe(BaseImmutable.jsToValue(Universe.PROPERTIES, params));
  }

  static fromHash(hash: string): Universe {
    if (!hash) return Universe.DEFAULT;

    try {
      const json = JSON.parse(decodeURI(hash.replace(/^#/, '')));

      const emitters = json.emitters.map((e: any, i: number) => Emitter.unserialize(e).update(0, i, json.emitters.length));
      const attractors = json.attractors.map((a: any, i: number) => Attractor.unserialize(a).update(0, i, json.attractors.length));

      return new Universe({
        emitters,
        attractors,
        controlsHidden: !!json.controlsHidden,
        selectedItems: json.selectedItems
      });

    } catch (e) {
      console.log(e);
      return Universe.DEFAULT;
    }
  }

  public emitters: Emitter[];
  public attractors: Attractor[];
  public controlsHidden: boolean;
  public selectedItems: string[];


  constructor(params: UniverseValue = {}) {
    super(params);
  }

  changeEmitters: (emitters: Emitter[]) => Universe;
  changeAttractors: (attractors: Attractor[]) => Universe;
  changeSelectedItems: (selectedItems: string[]) => Universe;
  changeControlsHidden: (controlsHidden: boolean) => Universe;

  toggleControls() {
    return this.changeControlsHidden(!this.controlsHidden);
  }

  toHash() {
    const { selectedItems, emitters, attractors, controlsHidden } = this;

    const o = {
      selectedItems,
      controlsHidden,
      emitters: emitters.map(e => e.serialize()),
      attractors: attractors.map(a => a.serialize())
    };

    return '#' + encodeURI(JSON.stringify(o));
  }

  update(time: number) {
    let v = this.valueOf();

    v.emitters = this.emitters.map((e, i) => e.update(time, i, this.emitters.length));
    v.attractors = this.attractors.map((a, i) => a.update(time, i, this.attractors.length));

    return new Universe(v);
  }

  addEmitter(time: number) {
    const { emitters } = this;

    const name = getUniqueName(emitters, 'Emitter');
    const newItem = Emitter.fromJS({
      name,
      label: name,
      x: '50', y: '50',
      spread: 'pi / 4',
      angle: '0',
      emissionRate: 't % 2 == 0',
      batchSize: '6',
      lifeSpan: '500',
      hue: 'sin(t / 100)*255',
    }).update(time, emitters.length, emitters.length + 1);

    return this.changeMany({
      emitters: emitters.concat([newItem]),
      selectedItems: [newItem.name]
    });
  }

  addAttractor(time: number) {
    const { attractors } = this;

    const name = getUniqueName(attractors, 'Attractor');
    const newItem = Attractor.fromJS({
      name,
      label: name,
      mass: 'sin(t / 50) * 20',
      x: '250', y: '50',
    }).update(time, attractors.length, attractors.length + 1);

    return this.changeMany({
      attractors: attractors.concat([newItem]),
      selectedItems: [newItem.name]
    });
  }

  getSourceOfSelection() {
    const { selectedItems, attractors, emitters } = this;

    if (!selectedItems || !selectedItems.length) return null;

    if (attractors.find(a => a.name === selectedItems[0])) return attractors;

    return emitters;
  }

  changeItems(items: (Attractor | Emitter)[]) {
    const { emitters, attractors } = this;

    if (Emitter.isEmitter(items[0])) {
      return this.changeEmitters(NamedArray.overridesByName(emitters, items) as Emitter[]);
    } else {
      return this.changeAttractors(NamedArray.overridesByName(attractors, items) as Attractor[]);
    }
  }

  selectNext() {
    const { selectedItems } = this;

    const a = this.getSourceOfSelection();
    if (!a) return this;

    const i = NamedArray.findIndexByName(a as any, selectedItems[0]);

    return this.changeSelectedItems([a[i === a.length - 1 ? 0 : i + 1].name]);
  }

  selectPrevious() {
    const { selectedItems } = this;

    const a = this.getSourceOfSelection();
    if (!a) return this;

    const i = NamedArray.findIndexByName(a as any, selectedItems[0]);

    return this.changeSelectedItems([a[i === 0 ? a.length - 1 : i - 1].name]);
  }

  getSelectedItemsFields() {
    const { selectedItems, attractors, emitters } = this;

    if (!selectedItems || !selectedItems.length) return [];

    const isEmitter = !!NamedArray.findByName(emitters, selectedItems[0]);

    if (isEmitter) {
      return [
        'x', 'y',
        'angle', 'spread',
        'velocity', 'batchSize',
        'emissionRate', 'hue', 'saturation', 'lightness'
      ];
    } else {
      return ['x', 'y', 'mass'];
    }
  }

  select(item: Attractor | Emitter, isMulti = false) {
    const { selectedItems, attractors, emitters } = this;

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

        const onlyAttractors = newSelectedItems.every(n => !!NamedArray.findByName(attractors, n))
        const onlyEmitters = newSelectedItems.every(n => !!NamedArray.findByName(emitters, n))

        if (!onlyAttractors && !onlyEmitters) {
          newSelectedItems = [item.name];
        }
      }
    }

    return this.changeSelectedItems(newSelectedItems);
  }

  deleteSelectedItems() {
    const { selectedItems, attractors, emitters } = this;

    const v = this.valueOf();

    v.attractors = attractors.filter(a => selectedItems.indexOf(a.name) === -1);
    v.emitters = emitters.filter(e => selectedItems.indexOf(e.name) === -1);
    v.selectedItems = [];

    return new Universe(v);
  }

  duplicateSelectedItems() {
    const { selectedItems, attractors, emitters } = this;

    if (!selectedItems || !selectedItems.length) return this;

    if (NamedArray.findByName(emitters, selectedItems[0])) {
      const newItems = selectedItems.map(name => {
        const newName = getUniqueName(emitters, 'Emitter');

        return NamedArray.findByName(emitters, name)
          .changeMany({name: newName, label: newName});
      });

      return this.changeEmitters(emitters.concat(newItems));
    } else {
      const newItems = selectedItems.map(name => {
        const newName = getUniqueName(attractors, 'Attractor');

        return NamedArray.findByName(attractors, name)
          .changeMany({name: newName, label: newName});
      });

      return this.changeAttractors(attractors.concat(newItems));
    }
  }

  getActualSelectedItems() {
    const a = this.getSourceOfSelection();

    return this.selectedItems.map(n => NamedArray.findByName(a as (Emitter | Attractor)[], n));
  }

  resetTime() {
    const { emitters, attractors } = this;

    const v = this.valueOf();

    v.emitters = emitters.map(e => e.change('time', 0));
    v.attractors = attractors.map(a => a.change('time', 0));

    return new Universe(v);
  }
}

BaseImmutable.finalize(Universe);

Universe.DEFAULT = new Universe({
  selectedItems: [],
  controlsHidden: false,
  emitters: [
    Emitter.fromJS({
      name: 'Emitter #0',
      label: 'Emitter #0',
      x: '50', y: '250',
      spread: 'pi / 4',
      angle: '0',
      emissionRate: 't % 20 == 0',
      batchSize: '1',
      lifeSpan: '500',
      hue: 'sin(t / 100)*255'
    }).update(0, 0, 2),
    Emitter.fromJS({
      name: 'Emitter #1',
      label: 'Emitter #1',
      x: '450', y: '250',
      spread: 'pi / 4',
      angle: 'pi',
      emissionRate: 't % 20 == 0',
      batchSize: '1',
      lifeSpan: '500',
      hue: 'sin(t / 100)*255'
    }).update(0, 1, 2)
  ] as any,
  attractors: [
    Attractor.fromJS({
      name: 'Attractor #0',
      label: 'Attractor #0',
      mass: 'sin(t / 50) * 20',
      x: '250', y: '250',
      time: 0
    }).update(0, 0, 1)
  ]
});

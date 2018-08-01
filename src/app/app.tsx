import * as React from 'react';

import { NamedArray } from 'immutable-class';
import { IconButton } from '../icon-button/icon-button';

import { Detail } from '../detail/detail';
import { AttractorRenderer } from '../attractor-renderer/attractor-renderer';
import { EmitterRenderer } from '../emitter-renderer/emitter-renderer';

import { Emitter, Attractor, Particle } from '../models/index';

import './app.css';
export interface AppState {
  emitters?: Emitter[];
  attractors?: Attractor[];

  paused?: boolean;
  hideStuff?: boolean;

  selectedItems?: (Emitter | Attractor)[];
}

export class App extends React.Component<{}, AppState> {
  private canvas: HTMLCanvasElement;
  private info: HTMLDivElement;

  private now: number;
  private before: number;
  private leaps = 1;
  private fps: number;
  private time = 0;

  private particles: Particle[] = [];

  constructor(props: {}, context: any) {
    super(props, context);

    this.state = this.getStateFromHash() || this.getDefaultState();

    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#' + this.getHashFromState()) return;

      const newState = this.getStateFromHash();
      (newState.emitters as Emitter[]).forEach((e, i) => e.update(this.time, i));
      (newState.attractors as Attractor[]).forEach((a, i) => a.update(this.time, i));

      this.setState(newState)
    });
  }

  getStateFromHash() {
    const hash = location.hash;

    if (!hash) return this.getDefaultState();

    try {
      const json = JSON.parse(atob(hash.replace(/^#/, '')));

      const emitters = json.emitters.map((e: any, i: number) => Emitter.fromJS(e).update(0, i));
      const attractors = json.attractors.map((a: any, i: number) => Attractor.fromJS(a).update(0, i));

      const all = emitters.concat(attractors);
      const selectedItems = json.selectedItems.map((name: string) => NamedArray.findByName(all, name));

      return {
        emitters,
        attractors,
        hideStuff: !!json.hideStuff,
        selectedItems
      };

    } catch (e) {
      console.log(e)
      return null;
    }
  }

  getHashFromState() {
    const { selectedItems, emitters, attractors, hideStuff, paused } = this.state;

    const o = {
      selectedItems: selectedItems.map(item => item.name),
      hideStuff,
      emitters: emitters.map(e => e.toJS()),
      attractors: attractors.map(a => a.toJS())
    };

    return btoa(JSON.stringify(o));
  }

  updateHash = () => {
    location.hash = this.getHashFromState();
  }

  getDefaultState() {
    return {
      selectedItems: [] as (Attractor | Emitter)[],
      paused: false,
      hideStuff: false,
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
        }).update(0, 0),
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
        }).update(0, 1)
      ] as any,
      attractors: [
        Attractor.fromJS({
          name: 'Attractor #0',
          label: 'Attractor #0',
          mass: 'sin(t / 50) * 20',
          x: '250', y: '250',
          time: 0
        }).update(0, 0)
      ]
    };
  }

  componentDidMount() {
    requestAnimationFrame(this.loop);
  }

  loop = () => {
    const { paused, attractors, emitters } = this.state;

    if (!paused) {
      let newState: AppState = {};

      if (this.time % this.leaps === 0) {
        this.update(attractors, emitters);
      }

      this.time++;
      requestAnimationFrame(this.loop);
    }
  }

  update(attractors: Attractor[], emitters: Emitter[]) {
    // FPS
    this.now = Date.now();
    this.fps = Math.round(1000 / (this.now - this.before));
    this.before = this.now;

    this.clear();

    const newAttractors = attractors.map((a, index) => a.update(this.time, index));
    const newEmitters = emitters.map((e, index) => e.update(this.time, index));

    let newParticles: Particle[] = [];
    newEmitters.forEach(e => e.emit(newParticles));

    const ctx = this.canvas.getContext('2d');

    let i = this.particles.length;
    while (i--) {
      const p = this.particles[i];

      if (p.isDead() || p.isLost()) {
        continue;
      }

      p.update(this.time, newAttractors);
      newParticles.push(p);

      ctx.fillStyle = `hsla(${p.color[0]}, ${p.color[1]}%, ${p.color[2]}%, ${p.opacity})`;
      ctx.fillRect(p.px - 1, p.py - 1, 2, 2);
    }

    this.setState({
      attractors: newAttractors,
      emitters: newEmitters
    });

    this.particles = newParticles;
    this.updateInfo();
  }

  updateInfo() {
    if (!this.info) return;

    this.info.innerHTML = `${this.particles.length} particles, frame #${this.time}, ${this.fps}fps`;
  }

  private clear() {
    if (!this.canvas) return;

    this.canvas.height = 500;
    this.canvas.width = 500;
  }

  playPause = () => {
    const { paused } = this.state;

    this.setState({
      paused: !paused
    });

    if (paused) requestAnimationFrame(this.loop);
  }

  getUniqueName(array: (Emitter | Attractor)[], root: string): string {
    let n = 0;
    let name = root;

    while (NamedArray.containsByName(array, name + ' #' + n)) n++;

    return name + ' #' + n;
  }

  addEmitter = () => {
    const { emitters } = this.state;

    const name = this.getUniqueName(emitters, 'Emitter');
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
    }).update(this.time, emitters.length);

    this.setState({
      emitters: emitters.concat([newItem]),
      selectedItems: [newItem]
    }, this.updateHash);
  }

  addAttractor = () => {
    const { attractors } = this.state;

    const name = this.getUniqueName(attractors, 'Attractor');

    const newItem = Attractor.fromJS({
      name,
      label: name,
      mass: 'sin(t / 50) * 20',
      x: '250', y: '50',
    }).update(this.time, attractors.length);

    this.setState({
      attractors: attractors.concat([newItem]),
      selectedItems: [newItem]
    }, this.updateHash);
  }

  resetTime = () => {
    this.particles = [];
    this.time = 0;

    const { emitters, attractors } = this.state;

    this.setState({
      emitters: emitters.map((e, i) => e.update(0, i)),
      attractors: attractors.map((a, i) => a.update(0, i))
    });

    this.clear();
    this.updateInfo();
  }

  reset = () => {
    this.resetTime();
    this.setState(this.getDefaultState(), this.updateHash);
  }

  nextSelectedItem = () => {
    const { attractors, emitters, selectedItems } = this.state;

    const a = Emitter.isEmitter(selectedItems[0]) ? emitters : attractors;
    const i = NamedArray.findIndexByName(a as any, selectedItems[0].name);

    this.setState({
      selectedItems: [a[i === a.length - 1 ? 0 : i + 1]]
    });
  }

  previousSelectedItem = () => {
    const { attractors, emitters, selectedItems } = this.state;

    const a = Emitter.isEmitter(selectedItems[0]) ? emitters : attractors;
    const i = NamedArray.findIndexByName(a as any, selectedItems[0].name);

    this.setState({
      selectedItems: [a[i === 0 ? a.length - 1 : i - 1]]
    });
  }

  onItemsChange = (items: (Attractor | Emitter)[]) => {
    const { emitters, attractors } = this.state;

    if (Emitter.isEmitter(items[0])) {
      const newEmitters = NamedArray.overridesByName(emitters, items) as Emitter[];

      this.setState({
        emitters: newEmitters.map((e, i) => e.update(this.time, i)),
        selectedItems: items
      }, this.updateHash);
    } else {
      const newAttractors = NamedArray.overridesByName(attractors, items) as Attractor[];

      this.setState({
        attractors: newAttractors.map((a, i) => a.update(this.time, i)),
        selectedItems: items
      }, this.updateHash);
    }
  }

  getSelectedItemsFields() {
    const { selectedItems } = this.state;

    if (!selectedItems || !selectedItems.length) return [];

    if (Emitter.isEmitter(selectedItems[0])) {
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

  handleClick(items: (Attractor | Emitter)[] , item: Attractor | Emitter, isMulti = false) {
    const { selectedItems } = this.state;

    let newSelectedItems: (Attractor | Emitter)[] = [];

    if (!isMulti) {
      if (NamedArray.containsByName(selectedItems, item.name)) {
        newSelectedItems = selectedItems.length > 1 ? [item] : [];
      } else {
        newSelectedItems = [item];
      }
    } else {
      if (NamedArray.containsByName(selectedItems, item.name)) {
        newSelectedItems = NamedArray.deleteByName(selectedItems, item.name);
      } else {
        newSelectedItems = selectedItems.concat([item]);

        if (!newSelectedItems.every(Emitter.isEmitter) && !newSelectedItems.every(Attractor.isAttractor)) {
          newSelectedItems = [item];
        }
      }
    }

    this.setState({
      selectedItems: newSelectedItems
    }, this.updateHash);
  }

  onAttractorClick = (attractor: Attractor, event: React.MouseEvent<any>) => {
    this.handleClick(this.state.attractors, attractor, event.shiftKey);
  }

  onEmitterClick = (emitter: Emitter, event: React.MouseEvent<any>) => {
    this.handleClick(this.state.emitters, emitter, event.shiftKey);
  }

  toggleHideStuff = () => {
    const { hideStuff } = this.state;

    this.setState({hideStuff: !hideStuff}, this.updateHash);
  }

  removeSelectedItems = () => {
    const { selectedItems, emitters, attractors } = this.state;

    if (Emitter.isEmitter(selectedItems[0])) {
      let newEmitters = emitters;

      selectedItems.forEach(e => newEmitters = NamedArray.deleteByName(newEmitters, e.name));

      this.setState({
        selectedItems: [],
        emitters: newEmitters
      }, this.updateHash);
    } else {
      let newAttractors = attractors;

      selectedItems.forEach(a => newAttractors = NamedArray.deleteByName(newAttractors, a.name));

      this.setState({
        selectedItems: [],
        attractors: newAttractors
      }, this.updateHash);
    }
  }

  duplicateSelectedItems = () => {
    const { selectedItems, emitters, attractors } = this.state;

    if (Emitter.isEmitter(selectedItems[0])) {
      const newItems = selectedItems.map(e => {
        const newName = this.getUniqueName(emitters, 'Emitter');
        const n = e.changeMany({
          name: newName,
          label: newName
        });

        return n;
      });

      this.setState({
        emitters: emitters.concat(newItems as Emitter[])
      });
    }
  }

  renderEmitter = (item: Emitter) => {
    const { selectedItems } = this.state;

    return <EmitterRenderer
      key={item.name}
      emitter={item}
      onClick={e => this.onEmitterClick(item, e)}
      selected={NamedArray.containsByName(selectedItems, item.name)}
    />;
  }

  renderAttractor = (item: Attractor) => {
    const { selectedItems } = this.state;

    return <AttractorRenderer
      key={item.name}
      attractor={item}
      onClick={e => this.onAttractorClick(item, e)}
      selected={NamedArray.containsByName(selectedItems, item.name)}
    />;
  }

  public render() {
    const { hideStuff, paused, emitters, selectedItems, attractors } = this.state;

    return <div className="app">

      { !hideStuff
        ? <div className="info" ref={r => this.info = r}/>
        : null
      }

      <div className="stage">
        <canvas ref={r => this.canvas = r} width={500} height={500}/>
        { !hideStuff
            ? <svg className="overlay" width="500" height="500">
                <g className="event-target" onClick={() => this.setState({selectedItems: []})}>
                  <rect x="0" width="500" y="0" height="500"/>
                </g>
                { attractors.map(this.renderAttractor) }
                { emitters.map(this.renderEmitter) }
              </svg>
            : null
        }
      </div>

      {
        !hideStuff && selectedItems && selectedItems.length
          ? <Detail
              fields={this.getSelectedItemsFields()}
              items={selectedItems}
              onChange={this.onItemsChange}
              next={this.nextSelectedItem}
              previous={this.previousSelectedItem}

              remove={this.removeSelectedItems}
              duplicate={selectedItems.length === 1 ? this.duplicateSelectedItems : null}
            />
          : null
      }

      <div className="controls">
        <IconButton label="Show/hide info" icon={!hideStuff ? 'visibility_off' : 'visibility'} type="primary" onClick={this.toggleHideStuff}/>
        { !hideStuff ? <IconButton label="Play/pause" onClick={this.playPause} type="primary" icon={paused ? 'play_arrow' : 'pause'}/> : null }

        <div className="spacer"/>

        { !hideStuff ? <IconButton label="Add an emitter" onClick={this.addEmitter} type="primary" icon="filter_tilt_shift"/> : null }
        { !hideStuff ? <IconButton label="Add an attractor" onClick={this.addAttractor} type="primary" icon="lens"/> : null }

        <div className="spacer"/>
        { !hideStuff ? <IconButton label="Reset time" onClick={this.resetTime} type="primary" icon="restore"/> : null }
        { !hideStuff ? <IconButton label="Reset everything" onClick={this.reset} type="warn" icon="settings_backup_restore"/> : null }
      </div>

    </div>;
  }
}

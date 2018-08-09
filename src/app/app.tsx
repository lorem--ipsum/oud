import * as React from 'react';
import * as classNames from 'classnames';

import { NamedArray } from 'immutable-class';
import { IconButton } from '../icon-button/icon-button';

import { Detail } from '../detail/detail';
import { AttractorRenderer } from '../attractor-renderer/attractor-renderer';
import { EmitterRenderer } from '../emitter-renderer/emitter-renderer';

import { Emitter, Attractor, Particle, EXAMPLES, Example, Universe } from '../models/index';

import * as drawer from './drawer';

import './app.css';

export interface AppState {
  universe?: Universe;

  paused?: boolean;

  time?: number;
}

export class App extends React.Component<{}, AppState> {
  private canvas: HTMLCanvasElement;
  private info: HTMLDivElement;

  private now: number;
  private before = Date.now();
  private leaps = 1;
  private fps: number[] = [];
  private timeAtPause = 0;

  private particles: Particle[] = [];

  constructor(props: {}, context: any) {
    super(props, context);

    this.state = {
      universe: Universe.fromHash(location.hash),
      time: 0
    };

    window.addEventListener('hashchange', () => {
      const { time, universe } = this.state;

      if (window.location.hash === universe.toHash()) return;

      const newUniverse = Universe.fromHash(location.hash).update(time);

      this.setState({
        universe: newUniverse
      });
    });
  }

  updateHash = () => {
    location.hash = this.state.universe.toHash();
  }

  componentDidMount() {
    this.resetDrawer();
  }

  resetDrawer() {
    const { paused } = this.state;

    drawer.init(this.canvas, () => {
      paused ? drawer.clear() : drawer.start(this.update);
    });
  }

  update = (time: number) => {
    const { paused, universe } = this.state;

    const newUniverse = universe.update(time);
    const { emitters, attractors } = newUniverse;

    // FPS
    this.now = Date.now();
    if (this.fps.push(1000 / (this.now - this.before)) === 100) this.fps.shift();
    this.before = this.now;

    let newParticles: Particle[] = [];
    emitters.forEach(e => {
      if (time >= e.time) e.emit(newParticles)
    });

    let i = this.particles.length;
    let lastColor = '';
    while (i--) {
      const p = this.particles[i];

      if (!paused && p.isDead() || p.isLost()) {
        continue;
      }

      p.update(time, attractors);
      newParticles.push(p);
    }

    this.setState({
      time,
      universe: newUniverse
    });

    this.particles = newParticles;
    return newParticles;
  }

  playPause = () => {
    const { paused, time } = this.state;

    const isNowPaused = !paused;

    this.setState({
      paused: isNowPaused
    });

    if (isNowPaused) {
      drawer.stop();
      this.timeAtPause = time;
    } else {
      drawer.start(this.update);
    }
  }

  addEmitter = () => {
    const { universe, time } = this.state;

    this.setState({
      universe: universe.addEmitter(time),
    }, this.updateHash);
  }

  addAttractor = () => {
    const { universe, time } = this.state;

    this.setState({
      universe: universe.addAttractor(time),
    }, this.updateHash);
  }

  resetTime = () => {
    this.particles = [];
    drawer.clear();
    drawer.stop();

    this.setState({
      time: 0,
      universe: this.state.universe.resetTime()
    }, () => this.resetDrawer());
  }

  reset = () => {
    this.particles = [];
    drawer.clear();
    drawer.stop();

    this.setState({
      time: 0,
      universe: Universe.DEFAULT
    }, () => {
      this.updateHash();
      this.resetDrawer();
    }); }

  nextSelectedItem = () => {
    this.setState({
      universe: this.state.universe.selectNext()
    });
  }

  previousSelectedItem = () => {
    this.setState({
      universe: this.state.universe.selectPrevious()
    });
  }

  onItemsChange = (items: (Attractor | Emitter)[]) => {
    const { universe, time } = this.state;

    this.setState({
      universe: universe.changeItems(items).update(time)
    });
  }

  onAttractorClick = (attractor: Attractor, event: React.MouseEvent<any>) => {
    const { universe } = this.state;

    this.setState({
      universe: universe.select(attractor, event.shiftKey)
    });
  }

  onEmitterClick = (emitter: Emitter, event: React.MouseEvent<any>) => {
    const { universe } = this.state;

    this.setState({
      universe: universe.select(emitter, event.shiftKey)
    });
  }

  toggleHideStuff = () => {
    const { universe } = this.state;

    this.setState({
      universe: universe.toggleControls()
    }, this.updateHash);
  }

  removeSelectedItems = () => {
    const { universe } = this.state;

    this.setState({
      universe: universe.deleteSelectedItems()
    }, this.updateHash);
  }

  duplicateSelectedItems = () => {
    const { universe } = this.state;

    this.setState({
      universe: universe.duplicateSelectedItems()
    }, this.updateHash);
  }

  renderEmitter = (item: Emitter) => {
    const { universe } = this.state;

    return <EmitterRenderer
      key={item.name}
      emitter={item}
      onClick={e => this.onEmitterClick(item, e)}
      selected={universe.selectedItems.indexOf(item.name) > -1}
    />;
  }

  renderAttractor = (item: Attractor) => {
    const { universe } = this.state;

    return <AttractorRenderer
      key={item.name}
      attractor={item}
      onClick={e => this.onAttractorClick(item, e)}
      selected={universe.selectedItems.indexOf(item.name) > -1}
    />;
  }

  isExampleSelected(example: Example) {
    const { universe } = this.state;

    return universe.equals(Universe.fromJS(example.config));
  }

  loadExample = (example: Example) => {
    this.resetTime();
    window.location.hash = Universe.fromJS(example.config).toHash();
  }

  public render() {
    const { paused, universe, time } = this.state;
    const { selectedItems, attractors, emitters } = universe;

    const fps = Math.round(this.fps.reduce(((total, a) => total + a), 0) / this.fps.length);
    const hideStuff = universe.controlsHidden;

    return <div className="app">
      { !hideStuff
        ? <div className="examples">
          {
            EXAMPLES.map((example, i) => {
              return <div
                key={i}
                className={classNames('example', {selected: this.isExampleSelected(example)})}
                onClick={() => this.loadExample(example)}
              >{i + 1}</div>;
            })
          }
          </div>
        : null
      }

      { !hideStuff
        ? <div className="info">{`${this.particles.length} particles, frame #${time}, ${fps}fps`}</div>
        : null
      }

      <div className="stage">
        <canvas ref={r => this.canvas = r} width={500} height={500}/>
        { !hideStuff
            ? <svg className="overlay" width="500" height="500">
                <g className="event-target" onClick={() => this.setState({universe: universe.changeSelectedItems([])})}>
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
              fields={universe.getSelectedItemsFields()}
              items={universe.getActualSelectedItems()}
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

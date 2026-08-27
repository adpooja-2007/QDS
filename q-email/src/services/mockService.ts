import { getFixture, SCENARIOS, SCENARIO_LABELS } from '../data/fixtures';
import type { Scenario, ScenarioFixture } from '../data/fixtures';

export type { Scenario };
export { SCENARIOS, SCENARIO_LABELS };

class MockService {
  private _scenario: Scenario = 'CLEAN';
  private _fixture: ScenarioFixture;

  constructor() {
    this._fixture = getFixture(this._scenario);
  }

  get scenario() { return this._scenario; }

  setScenario(s: Scenario) {
    this._scenario = s;
    this._fixture = getFixture(s);
  }

  getSession() { return this._fixture.session; }
  getDecision() { return this._fixture.decision; }
  getEvents() { return this._fixture.events; }
  getNodes() { return this._fixture.nodes; }
  getAnalytics() { return this._fixture.analytics; }
  getComm() { return this._fixture.comm; }
  getProtocol() { return this._fixture.protocol; }

  getDashboard() {
    return {
      session: this._fixture.session,
      decision: this._fixture.decision,
      recent_events: this._fixture.events,
    };
  }
}

export const mockService = new MockService();

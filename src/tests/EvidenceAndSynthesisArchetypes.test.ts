import { describe, it, expect } from 'vitest';
import type { EvidenceClaim, EvidenceSnippet, SynthesisParameter } from '../types/game';

describe('Evidence Archetype Verification Logic', () => {
  const claims: EvidenceClaim[] = [
    {
      id: 'claim_cavitation',
      claimText: 'Impeller blade pitting was caused by hydraulic vapor collapse (cavitation), not tectonic shock.',
      claimSource: 'Chief Engineer Vance',
      isTrue: true,
      requiredProofSnippetId: 'snip_hydro',
      downstreamFact: 'Black box confirms acoustic micro-implosions.'
    }
  ];

  const snippets: EvidenceSnippet[] = [
    {
      id: 'snip_hydro',
      documentTitle: 'Telemetry Spectrogram Log',
      snippetText: 'High-frequency 22 kHz acoustic spikes observed prior to vibration spike, characteristic of micro-bubble implosion.',
      authorOrDate: 'Reactor Delta Black Box'
    },
    {
      id: 'snip_wrong',
      documentTitle: 'Seismic Station Report',
      snippetText: 'Sub-sea basalt shelf recorded tremor of magnitude 2.1.',
      authorOrDate: 'Geological Archive'
    }
  ];

  it('correctly substantiates claim when matching citation is provided', () => {
    const claim = claims[0];
    const selectedSnippet = snippets.find((s) => s.id === 'snip_hydro');

    const isSubstantiated = selectedSnippet?.id === claim.requiredProofSnippetId;
    expect(isSubstantiated).toBe(true);
  });

  it('rejects claim verification when non-matching citation is provided', () => {
    const claim = claims[0];
    const selectedSnippet = snippets.find((s) => s.id === 'snip_wrong');

    const isSubstantiated = selectedSnippet?.id === claim.requiredProofSnippetId;
    expect(isSubstantiated).toBe(false);
  });
});

describe('Synthesis Archetype Multi-Parameter Harmony Logic', () => {
  const parameters: SynthesisParameter[] = [
    {
      id: 'param_freq',
      name: 'Transceiver Carrier Frequency',
      unit: 'kHz',
      minValue: 400,
      maxValue: 500,
      step: 1,
      initialValue: 400,
      targetValue: 434,
      tolerance: 2,
      derivationHint: 'Derived from ionospheric reflection log',
      subsystemLabel: 'Transceiver'
    },
    {
      id: 'param_elev',
      name: 'Yagi Antenna Elevation',
      unit: '°',
      minValue: 0,
      maxValue: 90,
      step: 1,
      initialValue: 0,
      targetValue: 12,
      tolerance: 1,
      derivationHint: 'Derived from geostationary skip angle',
      subsystemLabel: 'Antenna Array'
    },
    {
      id: 'param_damping',
      name: 'Modulation Damping',
      unit: '%',
      minValue: 0,
      maxValue: 100,
      step: 5,
      initialValue: 0,
      targetValue: 65,
      tolerance: 5,
      derivationHint: 'Derived from spark-gap noise filter spec',
      subsystemLabel: 'Modulation Filter'
    }
  ];

  const verifyHarmonization = (values: Record<string, number>) => {
    for (const p of parameters) {
      const current = values[p.id];
      if (current === undefined || Math.abs(current - p.targetValue) > p.tolerance) {
        return { isHarmonized: false, failedParam: p.name };
      }
    }
    return { isHarmonized: true, failedParam: null };
  };

  it('passes when all parameters are harmonized within tolerance', () => {
    const result = verifyHarmonization({
      param_freq: 435, // 434 ± 2 -> PASS
      param_elev: 12,  // 12 ± 1 -> PASS
      param_damping: 65 // 65 ± 5 -> PASS
    });

    expect(result.isHarmonized).toBe(true);
    expect(result.failedParam).toBeNull();
  });

  it('fails with specific mechanical diagnostic when any parameter is out of tolerance', () => {
    const result = verifyHarmonization({
      param_freq: 435,
      param_elev: 25, // Target 12 ± 1 -> FAIL
      param_damping: 65
    });

    expect(result.isHarmonized).toBe(false);
    expect(result.failedParam).toBe('Yagi Antenna Elevation');
  });
});

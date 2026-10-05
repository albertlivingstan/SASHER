import * as fs from 'fs';
import * as path from 'path';
import { EvaluationEngine } from '../src/services/recommendation/EvaluationEngine';
import { ComponentModels } from '../src/services/recommendation/ComponentModels';
import { BENCHMARK_EVALUATION_DATASET } from '../src/services/recommendation/DataProvider';
import { INITIAL_PRODUCTS } from '../src/data/products';
import { Product } from '../src/types';

/**
 * SASHER Reproducible Offline Recommendation Evaluation Script
 * 
 * Objectives:
 * 1. Train Item-Item Collaborative Filtering on empirical interaction logs
 * 2. Evaluate 6 baseline models across 4 session maturity stages
 * 3. Calculate Precision@5, Precision@10, Recall@10, NDCG@10, MRR, Hit Rate
 * 4. Run full ablation framework
 * 5. Compute paired Student's t-test with real degrees of freedom & p-value
 * 6. Export machine-readable JSON & CSV results
 */

async function main() {
  console.log('================================================================');
  console.log('  SASHER REPRODUCIBLE OFFLINE RECOMMENDATION EVALUATION ENGINE  ');
  console.log('================================================================\n');

  const cwd = process.cwd();
  const interactionsCsvPath = path.join(cwd, 'data', 'interactions.csv');
  const productsCsvPath = path.join(cwd, 'data', 'products.csv');

  console.log(`[1] Reading raw dataset logs...`);
  console.log(`    Interactions: ${interactionsCsvPath}`);
  console.log(`    Products:     ${productsCsvPath}`);

  // 1. Parse Interactions CSV
  const interactionRaw = fs.readFileSync(interactionsCsvPath, 'utf-8').trim().split('\n');
  const interactionHeaders = interactionRaw[0].split(',');
  const interactionRows = interactionRaw.slice(1).map(line => {
    const parts = line.split(',');
    return {
      userId: parts[0],
      sessionId: parts[1],
      productId: parts[2],
      eventType: parts[3],
      dwellMs: parseInt(parts[4] || '0', 10),
      timestamp: parseInt(parts[5] || '0', 10),
      split: parts[6]
    };
  });

  console.log(`    Parsed ${interactionRows.length} interaction rows across ${new Set(interactionRows.map(r => r.sessionId)).size} sessions.`);

  // 2. Train Collaborative Filtering Matrix from Train interactions
  const trainInteractions = interactionRows.filter(r => r.split === 'train');
  console.log(`[2] Training Item-Item Collaborative Filtering Matrix on ${trainInteractions.length} training events...`);
  ComponentModels.trainCollaborativeMatrix(
    trainInteractions.map(r => ({ sessionId: r.sessionId, productId: r.productId }))
  );
  console.log(`    Collaborative similarity matrix trained successfully.`);

  // 3. Initialize Evaluation Engine with Product Catalog
  const products: Product[] = INITIAL_PRODUCTS;
  const engine = new EvaluationEngine(products);

  console.log(`[3] Running comprehensive academic benchmark evaluation across ${BENCHMARK_EVALUATION_DATASET.length} session cases...`);
  const report = engine.runComprehensiveExperiment(BENCHMARK_EVALUATION_DATASET, 42);

  console.log(`\n----------------------------------------------------------------`);
  console.log('  BASELINE MODEL COMPARISON (Overall Benchmark, N=' + BENCHMARK_EVALUATION_DATASET.length + ')');
  console.log('----------------------------------------------------------------');
  console.log(
    'Model'.padEnd(20) +
    'NDCG@10'.padEnd(10) +
    'Prec@5'.padEnd(10) +
    'Prec@10'.padEnd(10) +
    'Recall@10'.padEnd(12) +
    'MRR'.padEnd(10) +
    'HitRate@10'.padEnd(12) +
    'Latency'
  );
  console.log(''.padEnd(90, '-'));

  const modelKeys = Object.keys(report.overallBaselines) as (keyof typeof report.overallBaselines)[];
  modelKeys.forEach(key => {
    const m = report.overallBaselines[key];
    console.log(
      key.padEnd(20) +
      m.ndcg10.toFixed(4).padEnd(10) +
      m.precision5.toFixed(4).padEnd(10) +
      m.precision10.toFixed(4).padEnd(10) +
      m.recall10.toFixed(4).padEnd(12) +
      m.mrr.toFixed(4).padEnd(10) +
      m.hitRate.toFixed(4).padEnd(12) +
      (m.latencyMs + 'ms')
    );
  });

  console.log(`\n----------------------------------------------------------------`);
  console.log('  COLD-START PERFORMANCE BY SESSION MATURITY GROUPS');
  console.log('----------------------------------------------------------------');
  report.coldStartMaturityGroups.forEach(g => {
    console.log(`\n[${g.group}] - ${g.interactionRange} (N=${g.sampleSize})`);
    console.log(
      '  ' +
      'Model'.padEnd(18) +
      'NDCG@10'.padEnd(10) +
      'Prec@10'.padEnd(10) +
      'Recall@10'.padEnd(12) +
      'MRR'.padEnd(10) +
      'HitRate'
    );
    const b = g.baselines;
    const items = [
      { name: 'Popularity', data: b.popularity },
      { name: 'Content-Based', data: b.contentBased },
      { name: 'Collaborative', data: b.collaborative },
      { name: 'Static Hybrid', data: b.staticHybrid },
      { name: 'Session-Based', data: b.sessionBased },
      { name: 'SASHER Adaptive', data: b.sasher }
    ];
    items.forEach(it => {
      console.log(
        '  ' +
        it.name.padEnd(18) +
        it.data.ndcg10.toFixed(4).padEnd(10) +
        it.data.precision10.toFixed(4).padEnd(10) +
        it.data.recall10.toFixed(4).padEnd(12) +
        it.data.mrr.toFixed(4).padEnd(10) +
        it.data.hitRate.toFixed(4)
      );
    });
    console.log(`  -> SASHER vs Static Hybrid ΔNDCG@10: ${g.sasherGainVsStaticPercent > 0 ? '+' : ''}${g.sasherGainVsStaticPercent}%`);
  });

  console.log(`\n----------------------------------------------------------------`);
  console.log('  ABLATION STUDY (Component Degradation Relative to Full SASHER)');
  console.log('----------------------------------------------------------------');
  console.log(
    'Ablation Configuration'.padEnd(42) +
    'NDCG@10'.padEnd(12) +
    'Prec@10'.padEnd(12) +
    'ΔNDCG@10 (%)'
  );
  console.log(''.padEnd(76, '-'));
  report.ablationStudy.forEach(a => {
    const sign = a.deltaNdcgPercent > 0 ? '+' : '';
    console.log(
      a.configuration.padEnd(42) +
      a.ndcg10.toFixed(4).padEnd(12) +
      a.precision10.toFixed(4).padEnd(12) +
      (sign + a.deltaNdcgPercent.toFixed(2) + '%').padEnd(15)
    );
  });

  console.log(`\n----------------------------------------------------------------`);
  console.log('  STATISTICAL SIGNIFICANCE (Two-Tailed Paired Student\'s t-Test)');
  console.log('----------------------------------------------------------------');
  const sig = report.significanceTest;
  console.log(`  Comparison:          ${sig.modelA} vs ${sig.modelB}`);
  console.log(`  Metric:              ${sig.metric}`);
  console.log(`  Sample Size (N):     ${sig.sampleSize}`);
  console.log(`  Mean A (SASHER):     ${sig.meanA}`);
  console.log(`  Mean B (Static):     ${sig.meanB}`);
  console.log(`  Mean Difference:     ${sig.meanDiff}`);
  console.log(`  Sample Std Dev:      ${sig.stdDiff}`);
  console.log(`  Standard Error:      ${sig.standardError}`);
  console.log(`  t-statistic:         ${sig.tStatistic}`);
  console.log(`  Degrees of Freedom:  ${sig.degreesOfFreedom}`);
  console.log(`  Exact p-value:       ${sig.pValue}`);
  console.log(`  Significant (p<0.05):${sig.isStatisticallySignificant ? 'YES' : 'NO'}`);
  console.log(`  Notes:               ${sig.notes}`);

  console.log(`\n----------------------------------------------------------------`);
  console.log('  RESEARCH QUESTION EVIDENCE SUMMARY');
  console.log('----------------------------------------------------------------');
  console.log(`\n[${report.researchQuestions.rq1.question}]`);
  console.log(`  Answer:   ${report.researchQuestions.rq1.answer}`);
  console.log(`  Evidence: ${report.researchQuestions.rq1.empiricalEvidence}`);

  console.log(`\n[${report.researchQuestions.rq2.question}]`);
  console.log(`  Answer:   ${report.researchQuestions.rq2.answer}`);
  console.log(`  Evidence: ${report.researchQuestions.rq2.empiricalEvidence}`);

  console.log(`\n[${report.researchQuestions.rq3.question}]`);
  console.log(`  Answer:   ${report.researchQuestions.rq3.answer}`);
  console.log(`  Evidence: ${report.researchQuestions.rq3.empiricalEvidence}`);

  // 4. Export Machine-Readable Artifacts (JSON & CSV)
  console.log(`\n[4] Writing machine-readable artifacts...`);
  
  // JSON
  const jsonPath = path.join(cwd, 'data', 'experiment_results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`    Saved: ${jsonPath}`);

  // CSV 1: Baselines
  const baselinesCsvPath = path.join(cwd, 'data', 'experiment_baselines.csv');
  const baselineHeader = 'model_name,ndcg10,precision5,precision10,recall5,recall10,mrr,hit_rate,latency_ms,sample_count\n';
  const baselineLines = modelKeys.map(k => {
    const m = report.overallBaselines[k];
    return `${k},${m.ndcg10},${m.precision5},${m.precision10},${m.recall5},${m.recall10},${m.mrr},${m.hitRate},${m.latencyMs},${m.sampleCount}`;
  }).join('\n');
  fs.writeFileSync(baselinesCsvPath, baselineHeader + baselineLines + '\n', 'utf-8');
  console.log(`    Saved: ${baselinesCsvPath}`);

  // CSV 2: Cold-Start Groups
  const coldStartCsvPath = path.join(cwd, 'data', 'experiment_cold_start.csv');
  const coldStartHeader = 'group,stage,interaction_range,sample_size,model,ndcg10,precision10,recall10,mrr,hit_rate\n';
  const coldStartLines: string[] = [];
  report.coldStartMaturityGroups.forEach(g => {
    const b = g.baselines;
    const mList = [
      { name: 'popularity', d: b.popularity },
      { name: 'content_based', d: b.contentBased },
      { name: 'collaborative', d: b.collaborative },
      { name: 'static_hybrid', d: b.staticHybrid },
      { name: 'session_based', d: b.sessionBased },
      { name: 'sasher_adaptive', d: b.sasher }
    ];
    mList.forEach(m => {
      coldStartLines.push(`"${g.group}",${g.stage},"${g.interactionRange}",${g.sampleSize},${m.name},${m.d.ndcg10},${m.d.precision10},${m.d.recall10},${m.d.mrr},${m.d.hitRate}`);
    });
  });
  fs.writeFileSync(coldStartCsvPath, coldStartHeader + coldStartLines.join('\n') + '\n', 'utf-8');
  console.log(`    Saved: ${coldStartCsvPath}`);

  // CSV 3: Ablation Study
  const ablationCsvPath = path.join(cwd, 'data', 'experiment_ablations.csv');
  const ablationHeader = 'configuration,ndcg10,precision10,recall10,delta_ndcg_percent,active_features,description\n';
  const ablationLines = report.ablationStudy.map(a => {
    return `"${a.configuration}",${a.ndcg10},${a.precision10},${a.recall10},${a.deltaNdcgPercent},"${a.activeFeatures.join(';')}", "${a.description}"`;
  }).join('\n');
  fs.writeFileSync(ablationCsvPath, ablationHeader + ablationLines + '\n', 'utf-8');
  console.log(`    Saved: ${ablationCsvPath}`);

  console.log('\n[✔] Evaluation completed successfully. Machine-readable files ready.\n');
}

main().catch(err => {
  console.error('Fatal evaluation error:', err);
  process.exit(1);
});

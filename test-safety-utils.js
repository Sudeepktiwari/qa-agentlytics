#!/usr/bin/env node

/**
 * Simple test runner for JavaScript Safety Utilities
 * 
 * This allows us to test the safety utilities before integrating them
 * into the main application.
 */

import { runAllSafetyTests, demonstrateSafeWidgetGeneration } from './src/lib/javascriptSafety.test.js';

console.log('🔧 Testing JavaScript Safety Utilities...\n');

// Run all tests
const testResults = runAllSafetyTests();

// Display results
console.log('📊 Test Results:');
console.log('================');

for (const [testName, result] of Object.entries(testResults.results)) {
  const status = result.passed ? '✅' : '❌';
  console.log(`${status} ${testName}: ${result.passed ? 'PASSED' : 'FAILED'}`);
  
  if (!result.passed) {
    result.errors.forEach(error => {
      console.log(`   ↳ ${error}`);
    });
  }
}

console.log('\n' + testResults.summary);

// If all tests pass, show demo
if (testResults.allPassed) {
  console.log('\n🎉 All safety tests passed! Here\'s how safe widget generation works:\n');
  console.log('📝 Safe Widget JavaScript Example:');
  console.log('==================================');
  
  const demoCode = demonstrateSafeWidgetGeneration();
  console.log(demoCode);
  
  console.log('\n✨ This JavaScript is safe because:');
  console.log('- All strings are properly escaped');
  console.log('- No dangerous patterns are present');
  console.log('- Input is validated and sanitized');
  console.log('- Objects are safely serialized');
  
  console.log('\n🚀 Ready to proceed to Step 2: Booking Detection API');
} else {
  console.log('\n⚠️  Please fix the failing tests before proceeding.');
  process.exit(1);
}

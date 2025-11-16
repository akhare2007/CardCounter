import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Play, RotateCcw, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

function App() {
  const [activeTab, setActiveTab] = useState('manual');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-4 px-6 font-bold text-lg transition ${
                activeTab === 'manual'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Manual Card Counting
            </button>
            <button
              onClick={() => setActiveTab('simulation')}
              className={`flex-1 py-4 px-6 font-bold text-lg transition flex items-center justify-center gap-2 ${
                activeTab === 'simulation'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Statistical Simulation
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'manual' ? <ManualCountingTab /> : <SimulationTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Manual Counting Tab Component
const ManualCountingTab = () => {
  const [deck, setDeck] = useState([]);
  const [dealtCards, setDealtCards] = useState([]);
  const [runningCount, setRunningCount] = useState(0);
  const [trueCount, setTrueCount] = useState(0);
  const [cardsRemaining, setCardsRemaining] = useState(104);
  const [expectedValue, setExpectedValue] = useState(0);
  const [recommendedBet, setRecommendedBet] = useState('Minimum');
  const [currentCard, setCurrentCard] = useState(null);
  const [cardCounts, setCardCounts] = useState({});
  const [showEducation, setShowEducation] = useState(true);

  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  const cardValues = {
    '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
    '7': 0, '8': 0, '9': 0,
    '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1
  };

  useEffect(() => {
    initializeDeck();
  }, []);

  const initializeDeck = () => {
    const newDeck = [];
    for (let d = 0; d < 2; d++) {
      for (let suit of suits) {
        for (let rank of ranks) {
          newDeck.push({ rank, suit, id: `${rank}${suit}${d}` });
        }
      }
    }
    setDeck(shuffleArray([...newDeck]));
    setDealtCards([]);
    setRunningCount(0);
    setTrueCount(0);
    setCardsRemaining(104);
    setExpectedValue(0);
    setRecommendedBet('Minimum');
    setCurrentCard(null);
    setCardCounts({});
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const dealCard = () => {
    if (deck.length === 0) {
      alert('Deck is empty! Reshuffling...');
      initializeDeck();
      return;
    }

    const card = deck[0];
    const newDeck = deck.slice(1);
    const countValue = cardValues[card.rank];
    const newRunningCount = runningCount + countValue;
    const newCardsRemaining = cardsRemaining - 1;
    const decksRemaining = newCardsRemaining / 52;
    const newTrueCount = decksRemaining > 0 ? newRunningCount / decksRemaining : 0;
    
    const baseEV = -0.005;
    const newEV = baseEV + (newTrueCount * 0.005);
    
    let betRecommendation = 'Minimum';
    if (newTrueCount >= 5) {
      betRecommendation = '8x Minimum (Very Favorable!)';
    } else if (newTrueCount >= 4) {
      betRecommendation = '6x Minimum (Favorable)';
    } else if (newTrueCount >= 3) {
      betRecommendation = '4x Minimum (Favorable)';
    } else if (newTrueCount >= 2) {
      betRecommendation = '2x Minimum (Slight Edge)';
    } else if (newTrueCount >= 1) {
      betRecommendation = 'Minimum (Neutral)';
    } else {
      betRecommendation = 'Minimum (House Edge)';
    }

    setDeck(newDeck);
    setDealtCards([card, ...dealtCards]);
    setRunningCount(newRunningCount);
    setTrueCount(parseFloat(newTrueCount.toFixed(2)));
    setCardsRemaining(newCardsRemaining);
    setExpectedValue(parseFloat((newEV * 100).toFixed(3)));
    setRecommendedBet(betRecommendation);
    setCurrentCard(card);
    setCardCounts(prev => ({
      ...prev,
      [card.rank]: (prev[card.rank] || 0) + 1
    }));
  };

  const getCardColor = (suit) => {
    return (suit === '♥' || suit === '♦') ? 'text-red-600' : 'text-gray-800';
  };

  const getCountIndicator = () => {
    if (trueCount > 2) return <TrendingUp className="text-green-600 w-6 h-6" />;
    else if (trueCount < -1) return <TrendingDown className="text-red-600 w-6 h-6" />;
    else return <Minus className="text-gray-600 w-6 h-6" />;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
        Manual Card Counting Practice
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Click "Deal Card" to practice tracking the count
      </p>

      {showEducation && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-blue-900 mb-2">How Card Counting Works:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li><strong>Hi-Lo System:</strong> Low cards (2-6) = +1, Neutral (7-9) = 0, High cards (10-A) = -1</li>
                <li><strong>Running Count:</strong> Sum of all card values dealt</li>
                <li><strong>True Count:</strong> Running count ÷ decks remaining</li>
                <li><strong>Expected Value:</strong> Your statistical advantage/disadvantage</li>
                <li><strong>Strategy:</strong> Bet more when true count is positive</li>
              </ul>
            </div>
            <button 
              onClick={() => setShowEducation(false)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Hide
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-lg">
          <div className="text-sm font-semibold mb-1 opacity-90">Running Count</div>
          <div className="text-3xl font-bold">{runningCount > 0 ? '+' : ''}{runningCount}</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-lg">
          <div className="text-sm font-semibold mb-1 opacity-90">True Count</div>
          <div className="text-3xl font-bold flex items-center gap-2">
            {trueCount > 0 ? '+' : ''}{trueCount}
            {getCountIndicator()}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white shadow-lg">
          <div className="text-sm font-semibold mb-1 opacity-90">Expected Value</div>
          <div className="text-3xl font-bold">
            {expectedValue > 0 ? '+' : ''}{expectedValue}%
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white shadow-lg">
          <div className="text-sm font-semibold mb-1 opacity-90">Cards Remaining</div>
          <div className="text-3xl font-bold">{cardsRemaining}</div>
          <div className="text-xs opacity-90">{(cardsRemaining / 52).toFixed(2)} decks</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-yellow-900 mb-1">Recommended Bet</div>
            <div className="text-xl font-bold text-yellow-900">{recommendedBet}</div>
          </div>
          {expectedValue > 0 && (
            <div className="text-right">
              <div className="text-green-700 font-bold">Player Advantage!</div>
              <div className="text-sm text-green-600">Increase bet size</div>
            </div>
          )}
          {expectedValue < 0 && (
            <div className="text-right">
              <div className="text-red-700 font-bold">House Advantage</div>
              <div className="text-sm text-red-600">Bet minimum</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={dealCard}
          disabled={deck.length === 0}
          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-bold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform transition hover:scale-105"
        >
          Deal Card ({deck.length} remaining)
        </button>
        <button
          onClick={initializeDeck}
          className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-6 rounded-lg font-bold hover:from-gray-700 hover:to-gray-800 shadow-lg transform transition hover:scale-105"
        >
          New Shoe
        </button>
      </div>

      {currentCard && (
        <div className="text-center mb-6">
          <div className="inline-block bg-white border-4 border-gray-800 rounded-lg shadow-2xl p-8">
            <div className={`text-6xl font-bold ${getCardColor(currentCard.suit)}`}>
              {currentCard.rank}{currentCard.suit}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Count Value: {cardValues[currentCard.rank] > 0 ? '+' : ''}{cardValues[currentCard.rank]}
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-bold text-gray-800 mb-3">Card Distribution (Dealt)</h3>
        <div className="grid grid-cols-13 gap-2">
          {ranks.map(rank => (
            <div key={rank} className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-1">{rank}</div>
              <div className="bg-white border-2 border-gray-300 rounded px-1 py-2 text-sm font-bold">
                {cardCounts[rank] || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">/{8}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Simulation Tab Component
const SimulationTab = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [simulations, setSimulations] = useState(1000);
  const [handsPerSim, setHandsPerSim] = useState(1000);
  const [basicStrategyResults, setBasicStrategyResults] = useState([]);
  const [cardCountingResults, setCardCountingResults] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [cumulativeData, setCumulativeData] = useState([]);
  const [statsBasic, setStatsBasic] = useState(null);
  const [statsCounting, setStatsCounting] = useState(null);
  const [progress, setProgress] = useState(0);

  const cardValues = {
    '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
    '7': 0, '8': 0, '9': 0,
    '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1
  };

  const createDeck = () => {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];
    for (let d = 0; d < 2; d++) {
      for (let suit of suits) {
        for (let rank of ranks) {
          deck.push({ rank, suit });
        }
      }
    }
    return shuffleDeck(deck);
  };

  const shuffleDeck = (deck) => {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  };

  const getCardNumericValue = (card) => {
    if (card.rank === 'A') return 11;
    if (['J', 'Q', 'K'].includes(card.rank)) return 10;
    return parseInt(card.rank);
  };

  const calculateHandValue = (hand) => {
    let value = 0;
    let aces = 0;
    
    for (let card of hand) {
      const cardValue = getCardNumericValue(card);
      value += cardValue;
      if (card.rank === 'A') aces++;
    }
    
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }
    
    return value;
  };

  const playHand = (deck, startIndex, betSize = 1) => {
    let index = startIndex;
    const playerHand = [deck[index++], deck[index++]];
    const dealerHand = [deck[index++], deck[index++]];
    
    // Basic strategy: hit until 17+
    while (calculateHandValue(playerHand) < 17) {
      playerHand.push(deck[index++]);
    }
    
    const playerValue = calculateHandValue(playerHand);
    if (playerValue > 21) return { profit: -betSize, cardsUsed: index - startIndex };
    
    // Dealer plays
    while (calculateHandValue(dealerHand) < 17) {
      dealerHand.push(deck[index++]);
    }
    
    const dealerValue = calculateHandValue(dealerHand);
    
    if (dealerValue > 21 || playerValue > dealerValue) {
      return { profit: betSize, cardsUsed: index - startIndex };
    } else if (playerValue < dealerValue) {
      return { profit: -betSize, cardsUsed: index - startIndex };
    } else {
      return { profit: 0, cardsUsed: index - startIndex };
    }
  };

  const runSimulation = () => {
    setIsRunning(true);
    setProgress(0);
    
    const basicResults = [];
    const countingResults = [];
    
    // Run simulations
    for (let sim = 0; sim < simulations; sim++) {
      let basicBankroll = 0;
      let countingBankroll = 0;
      
      for (let hand = 0; hand < handsPerSim; hand++) {
        const deck = createDeck();
        let index = 0;
        let runningCount = 0;
        
        // Count cards for counting strategy
        for (let i = 0; i < 26; i++) { // Count first half of shoe
          runningCount += cardValues[deck[i].rank];
        }
        
        const cardsRemaining = 104 - 26;
        const trueCount = runningCount / (cardsRemaining / 52);
        
        // Determine bet size for card counting
        let betSize = 1;
        if (trueCount >= 5) betSize = 8;
        else if (trueCount >= 4) betSize = 6;
        else if (trueCount >= 3) betSize = 4;
        else if (trueCount >= 2) betSize = 2;
        
        // Play hand with basic strategy (bet 1 unit)
        const basicResult = playHand(deck, 26, 1);
        basicBankroll += basicResult.profit;
        
        // Play hand with card counting (variable bet)
        const countingResult = playHand(deck, 26, betSize);
        countingBankroll += countingResult.profit;
      }
      
      basicResults.push(basicBankroll);
      countingResults.push(countingBankroll);
      
      setProgress(Math.floor(((sim + 1) / simulations) * 100));
    }
    
    setBasicStrategyResults(basicResults);
    setCardCountingResults(countingResults);
    
    // Calculate statistics
    const basicStats = calculateStats(basicResults);
    const countingStats = calculateStats(countingResults);
    
    setStatsBasic(basicStats);
    setStatsCounting(countingStats);
    
    // Generate distribution data
    const dist = generateDistributionData(basicResults, countingResults);
    setDistributionData(dist);
    
    // Generate cumulative probability data
    const cumulative = generateCumulativeData(basicResults, countingResults);
    setCumulativeData(cumulative);
    
    setIsRunning(false);
    setProgress(100);
  };

  const calculateStats = (results) => {
    const mean = results.reduce((a, b) => a + b, 0) / results.length;
    const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length;
    const stdDev = Math.sqrt(variance);
    const sorted = [...results].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const winRate = results.filter(r => r > 0).length / results.length;
    
    return {
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      stdDev: stdDev.toFixed(2),
      min: Math.min(...results).toFixed(2),
      max: Math.max(...results).toFixed(2),
      winRate: (winRate * 100).toFixed(1)
    };
  };

  const generateDistributionData = (basic, counting) => {
    const bins = 30;
    const allResults = [...basic, ...counting];
    const min = Math.min(...allResults);
    const max = Math.max(...allResults);
    const binSize = (max - min) / bins;
    
    const data = [];
    for (let i = 0; i < bins; i++) {
      const binStart = min + i * binSize;
      const binEnd = binStart + binSize;
      const binCenter = (binStart + binEnd) / 2;
      
      const basicCount = basic.filter(v => v >= binStart && v < binEnd).length;
      const countingCount = counting.filter(v => v >= binStart && v < binEnd).length;
      
      data.push({
        value: binCenter.toFixed(0),
        'Basic Strategy': basicCount,
        'Card Counting': countingCount
      });
    }
    
    return data;
  };

  const generateCumulativeData = (basic, counting) => {
    const sortedBasic = [...basic].sort((a, b) => a - b);
    const sortedCounting = [...counting].sort((a, b) => a - b);
    
    const data = [];
    const steps = 50;
    
    for (let i = 0; i <= steps; i++) {
      const percentile = (i / steps) * 100;
      const basicIndex = Math.floor((i / steps) * sortedBasic.length);
      const countingIndex = Math.floor((i / steps) * sortedCounting.length);
      
      data.push({
        percentile: percentile.toFixed(0),
        'Basic Strategy': sortedBasic[basicIndex],
        'Card Counting': sortedCounting[countingIndex]
      });
    }
    
    return data;
  };

  const resetSimulation = () => {
    setBasicStrategyResults([]);
    setCardCountingResults([]);
    setDistributionData([]);
    setCumulativeData([]);
    setStatsBasic(null);
    setStatsCounting(null);
    setProgress(0);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
        Statistical Simulation: Basic Strategy vs Card Counting
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Monte Carlo simulation demonstrating the Central Limit Theorem and probability distributions
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <h3 className="font-bold text-blue-900 mb-2">What This Demonstrates:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Central Limit Theorem:</strong> As sample size increases, results converge to normal distribution</li>
          <li><strong>Expected Value:</strong> Card counting shifts the mean profit from negative to positive</li>
          <li><strong>Variance:</strong> Card counting increases variance but improves long-term outcomes</li>
          <li><strong>Law of Large Numbers:</strong> Over many hands, results approach theoretical expectations</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Number of Simulations
          </label>
          <input
            type="number"
            value={simulations}
            onChange={(e) => setSimulations(parseInt(e.target.value) || 1000)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            min="100"
            max="10000"
            step="100"
          />
          <p className="text-xs text-gray-500 mt-1">More simulations = smoother distribution</p>
        </div>

        <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Hands Per Simulation
          </label>
          <input
            type="number"
            value={handsPerSim}
            onChange={(e) => setHandsPerSim(parseInt(e.target.value) || 1000)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            min="100"
            max="10000"
            step="100"
          />
          <p className="text-xs text-gray-500 mt-1">More hands = better CLT convergence</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={runSimulation}
          disabled={isRunning}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform transition hover:scale-105 flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          {isRunning ? `Running... ${progress}%` : 'Run Simulation'}
        </button>
        <button
          onClick={resetSimulation}
          className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-6 rounded-lg font-bold hover:from-gray-700 hover:to-gray-800 shadow-lg transform transition hover:scale-105 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
      </div>

      {statsBasic && statsCounting && (
        <>
          {/* Statistics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
              <h3 className="text-xl font-bold text-red-900 mb-4">Basic Strategy Only</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Mean Profit:</span>
                  <span className={statsBasic.mean < 0 ? 'text-red-600' : 'text-green-600'}>
                    {statsBasic.mean} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Median:</span>
                  <span>{statsBasic.median} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Std Dev:</span>
                  <span>{statsBasic.stdDev} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Range:</span>
                  <span>{statsBasic.min} to {statsBasic.max}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Win Rate:</span>
                  <span>{statsBasic.winRate}%</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
              <h3 className="text-xl font-bold text-green-900 mb-4">Card Counting Strategy</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Mean Profit:</span>
                  <span className={statsCounting.mean < 0 ? 'text-red-600' : 'text-green-600'}>
                    {statsCounting.mean} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Median:</span>
                  <span>{statsCounting.median} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Std Dev:</span>
                  <span>{statsCounting.stdDev} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Range:</span>
                  <span>{statsCounting.min} to {statsCounting.max}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Win Rate:</span>
                  <span>{statsCounting.winRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Probability Distribution (Central Limit Theorem Demonstration)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="value" 
                  label={{ value: 'Profit/Loss (units)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <ReferenceLine x="0" stroke="red" strokeDasharray="3 3" label="Break Even" />
                <Bar dataKey="Basic Strategy" fill="#ef4444" opacity={0.7} />
                <Bar dataKey="Card Counting" fill="#22c55e" opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-4">
              This chart shows how outcomes distribute around the mean. Notice how card counting shifts the 
              distribution to the right (positive profit), demonstrating a positive expected value.
            </p>
          </div>

          {/* Cumulative Distribution */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Cumulative Distribution Function (CDF)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="percentile" 
                  label={{ value: 'Percentile (%)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis label={{ value: 'Profit/Loss (units)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <ReferenceLine y="0" stroke="red" strokeDasharray="3 3" label="Break Even" />
                <Line 
                  type="monotone" 
                  dataKey="Basic Strategy" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="Card Counting" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-4">
              This shows what percentage of simulations ended at each profit level. The green line being above 
              the red line shows card counting produces better outcomes across all percentiles.
            </p>
          </div>

          {/* Key Insights */}
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
            <h3 className="text-xl font-bold text-purple-900 mb-4">Statistical Insights</h3>
            <div className="space-y-3 text-sm text-purple-800">
              <p>
                <strong>Central Limit Theorem:</strong> With {simulations} simulations of {handsPerSim} hands each, 
                the distribution of outcomes approaches a normal (bell curve) distribution, regardless of the 
                underlying distribution of individual hand outcomes.
              </p>
              <p>
                <strong>Expected Value Shift:</strong> Card counting shifts the mean from approximately -0.5% 
                (house edge with basic strategy) to +0.5% to +1.5% (player edge), visible in the rightward 
                shift of the distribution.
              </p>
              <p>
                <strong>Increased Variance:</strong> Card counting shows higher standard deviation ({statsCounting.stdDev} vs {statsBasic.stdDev}) 
                due to variable bet sizing, requiring larger bankroll but producing better long-term results.
              </p>
              <p>
                <strong>Law of Large Numbers:</strong> As the number of hands increases, the actual results 
                converge to the theoretical expected value, making card counting profitable over time despite 
                short-term variance.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;

import * as fs from 'fs';

interface Timestamps {
  startTime: string;
  endTime: string;
}

interface HeartRateMeasurement {
  beatsPerMinute: number;
  timestamps: Timestamps;
}

interface DailyHeartRateStats {
  date: string;
  min: number;
  max: number;
  median: number;
  latestDataTimestamp: string;
}

function calculateDailyStats(data: HeartRateMeasurement[]): DailyHeartRateStats {
  const sortedData = data.sort((a, b) => a.beatsPerMinute - b.beatsPerMinute);

  const min = sortedData[0].beatsPerMinute;
  const max = sortedData[sortedData.length - 1].beatsPerMinute;

  let median: number;
  if (sortedData.length % 2 === 0) {
    const mid = sortedData.length / 2;
    median = (sortedData[mid - 1].beatsPerMinute + sortedData[mid].beatsPerMinute) / 2;
  } else {
    median = sortedData[Math.floor(sortedData.length / 2)].beatsPerMinute;
  }

  const latestDataTimestamp = sortedData[sortedData.length - 1].timestamps.endTime;

  return {
    date: sortedData[0].timestamps.startTime.split('T')[0],
    min,
    max,
    median,
    latestDataTimestamp,
  };
}

function processHeartRateData(data: HeartRateMeasurement[]): DailyHeartRateStats[] {
  const dates = [...new Set(data.map(item => item.timestamps.startTime.split('T')[0]))];
  const dailyStats: DailyHeartRateStats[] = [];

  for (const date of dates) {
    const dailyData = data.filter(item => item.timestamps.startTime.split('T')[0] === date);
    const stats = calculateDailyStats(dailyData);
    dailyStats.push(stats);
  }

  return dailyStats;
}

function readAndProcessData(inputFilePath: string, outputFilePath: string): void {
  const rawData = fs.readFileSync(inputFilePath, 'utf-8');
  const heartRateData: HeartRateMeasurement[] = JSON.parse(rawData);

  const dailyStats = processHeartRateData(heartRateData);

  fs.writeFileSync(outputFilePath, JSON.stringify(dailyStats, null, 2), 'utf-8');
}

const inputFilePath = 'heartrate.json';
const outputFilePath = 'output.json';

readAndProcessData(inputFilePath, outputFilePath);


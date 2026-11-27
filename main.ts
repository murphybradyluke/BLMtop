const coreTempDir = await getSensorPath("coretemp");
const fanSpeedDir = await getSensorPath("applesmc");
const cpuHistory: number[] = [];
const fanHistory: number[] = [];
let lastError: string | null = null;
const WIDTH = 40;
const VALUEWIDTH = 5;
const UNITWIDTH = 4;

async function getCoreTemp(dir: string): Promise<number> {
  const rawTemp: string = await Deno.readTextFile(`${dir}/temp1_input`);
  const tempInCelsius: number = Number(rawTemp.trim()) / 1000;
  return tempInCelsius;
}

async function getFanSpeed(dir: string): Promise<number> {
  const rawSpeed: string = await Deno.readTextFile(`${dir}/fan1_input`);
  const fanInRPM: number = Number(rawSpeed.trim());
  return fanInRPM;
}

async function getSensorPath(nameText: string): Promise<string> {
  for await (const entry of Deno.readDir("/sys/class/hwmon/")) {
    const text = await Deno.readTextFile(`/sys/class/hwmon/${entry.name}/name`);
    if (nameText === text.trim()) {
      return `/sys/class/hwmon/${entry.name}`;
    }
  }
  throw new Error(`${nameText} not found`);
}

const fetchData = async (tempDir: string, fanDir: string) => {
  const coreTemp = await getCoreTemp(tempDir);
  const fanSpeed = await getFanSpeed(fanDir);
  return { coreTemp, fanSpeed };
};

function historyAddAndDrop(sensorHistory: number[], sensorData: number): void {
  if (sensorHistory.length === WIDTH) {
    sensorHistory.shift();
  }
  sensorHistory.push(sensorData);
}

function render(
  cpuValue: number[],
  fanValue: number[],
  errorValue: string | null,
): void {
  const lines: string[] = [
    `CPU ${formatLatest(cpuValue, VALUEWIDTH, "\u00B0C", UNITWIDTH)} ${sparkline(cpuValue, 60, 105)}`,
    `Fan ${formatLatest(fanValue, VALUEWIDTH, "rpm", UNITWIDTH)} ${sparkline(fanValue, 1000, 6200)}`,
  ];

  if (errorValue != null) {
    lines.push(errorValue);
  }

  const message = lines.join("\n");
  console.log(`\x1b[2J\x1b[H${message}`);
}

async function tick() {
  try {
    const { coreTemp, fanSpeed } = await fetchData(coreTempDir, fanSpeedDir);
    historyAddAndDrop(cpuHistory, coreTemp);
    historyAddAndDrop(fanHistory, fanSpeed);
    lastError = null;
  } catch (e) {
    const timestamp: string = new Date().toLocaleTimeString();
    if (e instanceof Error) {
      lastError = `${timestamp}: ${e.message}`;
    } else {
      lastError = `${timestamp}: ${String(e)}`;
    }
  }
  render(cpuHistory, fanHistory, lastError);
}

const pollData = () => {
  tick();
  setInterval(tick, 1000);
};

function formatLatest(
  history: number[],
  historyWidth: number,
  unit: string,
  unitWidth: number,
): string {
  return `${String(history.at(-1) ?? "?").padStart(historyWidth)} ${unit.padEnd(unitWidth)}`;
}

function sparkline(values: number[], min: number, max: number): string {
  const range = max - min;
  const chars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  const bars = [];
  for (const value of values) {
    if (Number.isNaN(value)) {
      bars.push("?");
    } else if (value <= min) {
      // this handles min === max
      bars.push(chars[0]);
    } else if (value > max) {
      bars.push(chars[chars.length - 1]);
    } else {
      const position = (value - min) / range;
      const index = Math.floor(position * 8);
      bars.push(chars[Math.min(index, chars.length - 1)]);
    }
  }
  return bars.join("");
}

pollData();

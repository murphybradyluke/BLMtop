const coreTempDir = await getSensorPath("coretemp");
const fanSpeedDir = await getSensorPath("applesmc");

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

async function tick() {
  try {
    const { coreTemp, fanSpeed } = await fetchData(coreTempDir, fanSpeedDir);
    console.log(`CPU  ${coreTemp}\u00b0C\nFan  ${fanSpeed} rpm`);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

const pollData = () => {
  tick();
  setInterval(tick, 1000);
};

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

console.log(sparkline([60, 65, 70, 75, 80, 85, 90], 60, 90));
pollData();

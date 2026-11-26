const coreTempDir = await getSensorPath("coretemp");
const fanSpeedDir = await getSensorPath("applesmc");

async function getCoreTemp(dir: string): Promise<number> {
  const rawTemp:string = await Deno.readTextFile(`${dir}/temp1_input`);
  const tempInCelsius:number = Number(rawTemp.trim()) / 1000;
  return tempInCelsius
}

async function getFanSpeed(dir: string): Promise<number> {
  const rawSpeed:string = await Deno.readTextFile(`${dir}/fan1_input`);
  const fanInRPM:number = Number(rawSpeed.trim())
  //const maxSpeed:string = await Deno.readTextFile(`${dir}/fan1_max`);
  return fanInRPM
}

async function getSensorPath(nameText:string): Promise<string> {
  for await (const entry of Deno.readDir("/sys/class/hwmon/")) {
    const text = await Deno.readTextFile(`/sys/class/hwmon/${entry.name}/name`)
    if (nameText === text.trim()){
      return (`/sys/class/hwmon/${entry.name}`)
    }
}
throw new Error(`${nameText} not found`)
}

const fetchData = async (tempDir: string, fanDir: string) => {
    try {
        const coreTemp = await getCoreTemp(tempDir);
        const fanSpeed = await getFanSpeed(fanDir);
        return `CPU  ${coreTemp}\u00B0C\nFan  ${fanSpeed} rpm`
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

async function tick (){
  console.log(await fetchData(coreTempDir, fanSpeedDir))
}

const pollData = () => {
    tick();
    setInterval(tick, 1000);
};

pollData();
//console.log(await getCoreTemp());
//console.log(await getFanSpeed());

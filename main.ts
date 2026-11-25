// fanspark: live CPU temperature + fan speed sparkline for the terminal.
// Run with: deno task start
//
// Step 1 goes here. See README.md.

const HWMON_DIR:string = "/sys/class/hwmon/hwmon2/temp1_input";

const rawTemp:string = await Deno.readTextFile(HWMON_DIR);
const tempInCelsius:number = Number(rawTemp.trim()) / 1000;

console.log(`${tempInCelsius}\u00B0C`);

# fanspark

A small terminal tool that shows the MacBook's CPU temperature and fan speed
as live sparklines, like this:

```
CPU  71°C  ▃▃▄▄▅▆▆▇▇▆▅▅▄▃▃▂
Fan 3200rpm ▁▁▁▂▃▄▅▆▆▆▅▄▄▃▂▂
```

Written by hand for practice. Claude gives hints and reviews; it doesn't write the code.

## Where the numbers live

Linux exposes sensors as plain text files under `/sys/class/hwmon/hwmonN/`.
Each `hwmonN` folder has a file called `name`. The **text inside** that file
(e.g. `coretemp`) tells you which device the folder belongs to. It's not a subfolder.

```
/sys/class/hwmon/hwmon2/name         <- contains "coretemp"
/sys/class/hwmon/hwmon2/temp1_input  <- the temperature
```

| What             | Text in `name` | File (same folder)                  | Units |
|---               |---            |---                                   |---|
| CPU package temp | `coretemp`    | `temp1_input` (label "Package id 0") | millidegrees C (63000 = 63°C) |
| Fan speed        | `applesmc`    | `fan1_input`                         | RPM |
| Fan maximum      | `applesmc`    | `fan1_max`                           | RPM (6199) |

The `N` in `hwmonN` can change between boots, so look folders up by `name`
rather than hard-coding `hwmon5`.

Try it in a shell first: `grep . /sys/class/hwmon/hwmon*/name` shows each folder and its name.

## Steps

Each step should run and print something before you start the next one.

- [ ] **1. Read one number.** Read the CPU temp file, turn it into a number of degrees, print it.
      (Hint: `Deno.readTextFile`, then trim and parse.)
- [ ] **2. Find sensors by name.** Write a function that takes a name like `"coretemp"` and returns
      the folder path. (Hint: `Deno.readDir("/sys/class/hwmon")`.) What should it do if the name isn't there?
- [ ] **3. Poll.** Print temp and fan once a second. (Hint: `setInterval`, or an `async` loop with a sleep.)
- [ ] **4. Sparkline function.** Write `sparkline(values: number[], min: number, max: number): string`
      using the characters `▁▂▃▄▅▆▇█`. Test it on a hard-coded array before wiring it up.
- [ ] **5. History.** Keep the last 40 readings of each in an array. Drop the oldest when it's full.
- [ ] **6. Redraw in place.** Instead of scrolling, redraw the same two lines each tick.
      (Hint: ANSI escape codes. `\x1b[2J\x1b[H` clears and moves to the top.)
- [ ] **7. Quit cleanly.** Ctrl+C should leave the terminal tidy.

## Stretch ideas

- Colour the temperature: green below 68°C, yellow to 90°C, red above (the same thresholds macfan uses).
- Show the min/max/average over the window.
- A `--once` flag that prints a single line, so it could feed the Omarchy bar.
- Log readings to a CSV and compare against `~/thermal-baseline`.

# BLMtop

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

| What             | Text in `name` | File (same folder)                   | Units                         |
| ---------------- | -------------- | ------------------------------------ | ----------------------------- |
| CPU package temp | `coretemp`     | `temp1_input` (label "Package id 0") | millidegrees C (63000 = 63°C) |
| Fan speed        | `applesmc`     | `fan1_input`                         | RPM                           |
| Fan maximum      | `applesmc`     | `fan1_max`                           | RPM (6199)                    |

The `N` in `hwmonN` can change between boots, so look folders up by `name`
rather than hard-coding `hwmon5`.

Try it in a shell first: `grep . /sys/class/hwmon/hwmon*/name` shows each folder and its name.

## Steps

Each step should run and print something before you start the next one.

- [x] **1. Read one number.** Read the CPU temp file, turn it into a number of degrees, print it.
      (Hint: `Deno.readTextFile`, then trim and parse.)
- [x] **2. Find sensors by name.** Write a function that takes a name like `"coretemp"` and returns
      the folder path. (Hint: `Deno.readDir("/sys/class/hwmon")`.) What should it do if the name isn't there?
- [x] **3. Poll.** Print temp and fan once a second. (Hint: `setInterval`, or an `async` loop with a sleep.)
- [x] **4. Sparkline function.** Write `sparkline(values: number[], min: number, max: number): string`
      using the characters `▁▂▃▄▅▆▇█`. Test it on a hard-coded array before wiring it up.
- [x] **5. History.** Keep the last 40 readings of each in an array. Drop the oldest when it's full.
- [x] **6. Redraw in place.** Instead of scrolling, redraw the same two lines each tick.
      (Hint: ANSI escape codes. `\x1b[2J\x1b[H` clears and moves to the top.)
- [x] **7. Quit cleanly.** Ctrl+C should leave the terminal tidy.

## Growing it into the Boot.dev personal project (~40 hours)

Same rule as above: each step should run before you start the next one.

**Make the display useful**

- [ ] **8. Colour.** Temperature green below 68°C, yellow up to 90°C, red above (macfan's thresholds).
      (Hint: ANSI colour codes, or `@std/fmt/colors`.)
- [ ] **9. Window stats.** Show min / max / average over the history next to each sparkline.
- [ ] **10. Fan as % of max.** Read `fan1_max` once at startup and show the fan as a percentage too.
- [ ] **11. More sensors.** Add the NVMe drive temp and battery temp (`nvme`, `BAT0`).
      What has to change so adding a sensor is one line, not a copy-pasted function?

**Make it configurable**

- [ ] **12. Command-line flags.** `--interval 2`, `--width 60`, `--sensors cpu,fan`.
      (Hint: `Deno.args`, or `parseArgs` from `@std/cli`.) What happens with `--interval banana`?
- [ ] **13. `--help`.** Print usage and exit.
- [ ] **14. `--once` mode.** Print one compact line and exit, so the Omarchy bar could run it.

**Make it save and compare**

- [ ] **15. CSV logging.** `--log thermal.csv` appends a timestamped row each tick.
- [ ] **16. Replay.** `fanspark replay thermal.csv` draws sparklines from a saved log instead of live sensors.
      (Your `fetchData` / `sparkline` split pays off here.)
- [ ] **17. Compare runs.** Summarise two CSVs side by side, e.g. a fresh run against
      `~/thermal-baseline/before-2026-10-03-2116.csv`. Check that file's columns first.

**Make it solid**

- [ ] **18. Tests.** `deno test` for `sparkline()` (the edge cases you already found: clamping,
      `min === max`, `NaN`, empty array) and for the CSV parsing.
- [ ] **19. Fake sensors.** Let tests or a `--demo` flag use made-up readings, so it runs on a
      machine without `applesmc`. (Hint: pass the "read a sensor" function in, instead of calling
      `Deno.readTextFile` directly.)
- [ ] **20. Install it.** `deno compile` into a single `fanspark` binary and put it on your PATH.

**Finish**

- [ ] **21. Write the real README** for Boot.dev, in your own words: what it does, why you built it
      (the fan saga), how to install and run it (including why it needs `--allow-all`), and a screenshot or GIF.
      Replace this planning README with it; the checklist can move to `PLAN.md`.

Not every step is required. If one turns into a rabbit hole, skip it.

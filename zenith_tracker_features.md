# Zenith Tracker — Complete Feature Documentation



## 2. Landing Page

The first screen shown to new users or users who have not yet entered the app. Acts as an introduction and entry point.

### Hero Section

### Feature Highlights Grid

### Footer Strip
- App version number (e.g. `v1.0.0`).

---

## 4. Dashboard

The default landing view on app load.

### Summary Cards (top row, 2-col mobile / 4-col desktop)
| Card | Data Source | Display |
|---|---|---|
| Mood | Latest mood log for today | `value/10` or `-` |
| Habits | Active habits, count done today | `done/total` |
| Hydration | Sum of today's `effective` hydration | `X ml` |
| Sleep | Sum of today's **night** sleep logs only | `Xh Ym` or `-` |

### Action Panel (habits widget)
- Title "Action Panel" with "Manage All" link to Habits view.
- Each habit has three states with distinct UI:
  - **Pending**: circle icon, name; Done (✓) and Skip (−) buttons.
  - **Done**: strikethrough text, primary-colored background, check-circle icon, "Undo" link.
  - **Skipped**: muted, minus-circle icon, "(Skipped)" label, "Undo" link.


### Today's Journals Panel
- Read-only preview of all journals written today, shown newest first.
- Each entry shows: title (truncated) + body (3-line clamp) with a colored left border.
- "New Entry" button navigates to Journal view.
- If no journals: italic placeholder text.

### Weekly Mood Trend Chart
- Chart.js `line` chart, 7 days rolling (Mon → today).
- X-axis: weekday abbreviations.
- Y-axis: 0–10.
- `spanGaps: true` — gaps are skipped (no null plotted).
- Data: daily average mood per day.
- Colors adopt current theme via CSS variables.
- Chart is destroyed and re-created on each dashboard render and on theme change.

---

## 5. Mood Tracker

### Mood Scale
10-point scale with named labels:
| Value | Label |
|---|---|
| 1 | Awful |
| 2 | Very Bad |
| 3 | Bad |
| 4 | Poor |
| 5 | Neutral |
| 6 | Okay |
| 7 | Good |
| 8 | Very Good |
| 9 | Great |
| 10 | Amazing |

### Mood Logging Form
- **Dynamic icon** at top updates live as slider moves:
- **Range slider**: `min=1`, `max=10`, `accent-color` follows theme primary.
- Live preview label updates to `"LabelName (value)"` format on every slider `oninput`.
- Slider is pre-populated with the latest mood logged today (or defaults to 5).
- **Note input**: optional free-text field, cleared after each save.
- **"Log Current Mood" button**: saves a new entry — multiple moods per day are allowed.
- Each save records: `id` (timestamp), `value`, `note`, `time` (locale time), `timestamp` (epoch).

### Today's Mood Log
- Listed newest-first in a reversed copy of the array.
- Each entry shows: large colored smiley icon, mood name, `(value/10)`, time (monospace).
- If a note exists: displayed in a styled blockquote-style box with left border.
- **Delete button** (trash icon) removes the specific entry by id. Dashboard re-renders if active.

---

## 6. Habit Tracker

### Adding Habits
- Text input + submit button form at the top. Submit on Enter or button click.
- Validation: empty name shows a modal error.
- Default seed habits on first install: "Drink Water (Morning)", "Read 10 pages", "Exercise 30m".

### Habit Card (Active)
Each active habit renders a card with:
- **Habit name** (large, bold).
- **Streak badge**: `🔥 N Streak`
- **7-day grid**: the past 6 days + today, each as a round button:
  - Shows weekday abbreviation above button.
  - "Today
  - Done 
  - Skipped 
  - Not done + not today 
  - Today's button is interactive: clicking toggles between done/not-done (removes skip).
- **Action buttons** (top-right of card): Archive, Rename, Delete

### Streak Calculation
- `calculateStreak(doneDates, skippedDates)`:
  - Iterates backward up to 365 days.
  - A skipped day does **not** break the streak.
  - If today is not done AND not skipped AND yesterday is not done AND not skipped → streak = 0.
  - Counts consecutive days where either done OR skipped, stopping at first uncovered day.

### Habit Status Toggle (from habits view)
- `toggleHabitDate(id, dateStr)`: only works for `todayStr`.
  - Clears skip for that date first.
  - If already done → removes from `doneDates` (un-done).
  - If not done → adds to `doneDates`.

### Setting Habit Status (from dashboard)
- `setHabitStatus(id, 'done' | 'skip' | 'none')`:
  - Removes date from both arrays first, then adds to the target array if status is not `'none'`.

### Renaming
- Modal with pre-filled text input auto-focused and auto-selected.
- Cancel/Save buttons.

### Deletion
- Confirmation modal before deleting. Permanently removes the habit AND all its history.

### Archiving
- Toggle archive state. Archived habits are hidden from the 7-day grid and action panel.
- Archived habits displayed in a separate "Archived Vault" section at the bottom.
- Vault items show name with strikethrough, "Restore" and "Drop" (permanent delete) buttons.
- Archived habits are excluded from streak calculation and dashboard counts.

---

## 7. Sleep Tracker

### Sleep Type Toggle
- Two buttons: **Night Sleep**  and **Nap / Rest** .
- Type is stored per entry as `'night'` or `'nap'`.

### Sleep Logging Form
- **Bedtime** input: `type="time"`, required.
- **Wake time** input: `type="time"`, required.
- **Time Awake (mins)** input: `type="number"`, min 0, max 720, default 0.
- All three fields trigger `calculateSleepDuration()` on `onchange`/`onkeyup`.

### Duration Calculation Logic
- Converts both times to total minutes since midnight.
- If wake time ≤ bed time → adds 1440 minutes (cross-midnight handling).
- Subtracts `awakeMinutes` from the difference.
- Result clamped to ≥ 0.
- Displays as `Xh Ym` in a large styled block.
- Hidden inputs `sleep-hours` and `sleep-minutes` store the calculated values.

### Sleep Quality
- 4 options: **Poor**, **Fair**, **Good** (default), **Excellent**.
- Radio group — active option gets `bg-primary text-app font-bold`.

### Notes Fields
- **"The Good"** text input: e.g. "Deep sleep, good dreams".
- **"Problems faced"** text input: e.g. "Woke up frequently, too hot".
- Both cleared after save.

### Save Logic
- Saves: id, type, bedTime, wakeTime, awakeMinutes, hours, minutes, goodNotes, badNotes, quality.
- Validation: both bedTime and wakeTime must be filled.
- Multiple sessions can be logged per day.

### Today's Sleep History
- Listed newest-first.
- Each entry shows:
  - Type badge ("Night Sleep" in blue or "Nap Session" in yellow).
  - Total duration in large text.
  - `bedTime - wakeTime` in monospace.
  - `(-Xm awake)` badge in red if `awakeMinutes > 0`.
  - Quality badge.
  - Good notes in green-tinted box.
  - Bad notes in red-tinted box.
  - Delete (trash) button.

### Sleep Cycle Calculator

An inline tool inside the Sleep Tracker that helps users find their ideal bedtime or wake-up time based on 90-minute sleep cycles.

**Header:**
- Title: "Sleep Cycle Calculator"
- Subtitle: "Each sleep cycle lasts ~90 minutes. The ideal bedtime ensures you wake up at the end of a full cycle."

**Three Calculation Modes (tab switcher):**
| Mode | Label | Description |
|---|---|---|
| 1 | Wake-up + Cycles | Set your wake-up time and desired cycles → calculates ideal bedtime |
| 2 | Bedtime + Wake-up | Set both times → shows how many full cycles your schedule gives |
| 3 | Bedtime + Cycles | Set your bedtime and desired cycles → calculates ideal wake-up time |

- Active tab has a highlighted border and bold label.
- Switching modes re-renders inputs and recalculates the result.

**Mode 1 — Wake-up + Cycles (inputs):**
- **Wake-up Time**: `type="time"` input, displayed in 12-hour AM/PM format (e.g. `07:00 AM`).
- **Sleep Cycles slider**: range from `0.5` to `7` in 0.5 steps.
  - Tick labels: `0.5 (45m)`, `1 (1.5h)`, `2 (3h)`, `5 (7.5h)`, `7 (10.5h)`.
  - Styled with primary-color fill on the active portion.

**Mode 2 — Bedtime + Wake-up (inputs):**
- **Bedtime**: `type="time"` input.
- **Wake-up Time**: `type="time"` input.

**Mode 3 — Bedtime + Cycles (inputs):**
- **Bedtime**: `type="time"` input.
- **Sleep Cycles slider**: same range and styling as Mode 1.

**Result Card:**
Displayed below the inputs in a highlighted bordered box. Updates live as inputs change.
| Field | Description |
|---|---|
| Bedtime | Calculated or entered bedtime |
| Wake-up | Calculated or entered wake-up time |
| Duration | Total sleep time formatted as `Xh Ym` |
| Cycles | Number of full 90-minute cycles |

- **Optimal badge**: `★ Optimal for most adults` shown in amber/gold when cycles = 5 (7.5h sleep).
- **Duration label**: small muted label (e.g. `7.5h sleep`) shown at bottom-right of the card.
- **"Apply to Schedule" button**: full-width primary button. Populates the Sleep Logging Form's bedtime and wake-time fields with the calculator's values and scrolls to the form.

**Cycle Duration Constant:** `CYCLE_MINUTES = 90`. Bedtime = wake-up time − (cycles × 90 mins). Cross-midnight is handled correctly (subtracting into the previous day).

### Dashboard Integration
- Dashboard `Sleep` card shows sum of **night** sessions only for today.

---

## 8. Hydration Tracker

### Smart Goal Calculation
Formula: `calculateHydrationGoal()`:
```
baseBody = (weight * 35) + ((height - 150) * 5)
tempFactor = 1 + (temp - 22) * 0.015
humidityFactor = 1 + (humidity - 50) * 0.005
goal = max( round(baseBody * activityLevel * tempFactor * humidityFactor), 1000 )
```
- Minimum goal: 1000 ml (floor).
- Goal recalculates dynamically whenever profile is saved.

### Visual Fill Effect
-Fills a animates Glass on every drink.
- Height animates from 0% to `(currentEffective / goal * 100)%`.
- CSS transition: `height 0.8s cubic-bezier(0.4, 0, 0.2, 1)`.
- Clamped to max 100%.

### Quick Add Form
- Number input (ml), 1–5000 range, placeholder "e.g. 250".
- Submit via "Log Amount" button or Enter key.
- Creates entry with: `drinkId='quick'`, `drinkName='Quick Add'`, `multiplier=1.0`, `icon='ph-drop'`.
- Input cleared after submission.

### 1-Click Drink Templates
- Pre-loaded defaults:
  | Name | Volume | Multiplier | Icon |
  |---|---|---|---|
  | Glass of Water | 250ml | 1.0 |
  | Water Bottle | 500ml | 1.0 | 
  | Coffee | 250ml | 0.8 |
  | Tea | 250ml | 0.9 |
  | Soda / Juice | 330ml | 0.6 |
  |etc.|etc|etc|etc

- Each template button shows icon, name, and volume (ml).
- Hovering scales the icon slightly.
- Effective hydration = `volume × multiplier`.
- A "+ Create Preset" dashed-border button opens the add-drink modal.

### Create Custom Drink Template (Modal)
Fields:
- **Template Name** (text input, required)
- **Volume in ml** (number input, 1–5000, required)
- **Hydration Factor** (dropdown):
- **Icon** (dropdown,  choices):

### Manage Custom Drinks (Modal)
- Opened via pencil-edit button.
- Lists all drinks with icon, name, volume, multiplier factor.
- Each drink has a red trash/delete button.
- Deleting a drink calls `deleteCustomDrink()` which filters it out and re-renders the hydration view AND re-opens the manage modal.

### Hydration Profile (Personalize Modal)
Fields:
- Weight (kg) — number input
- Height (cm) — number input
- Activity Level — dropdown: Sedentary (1.0), Lightly Active (1.2), Moderately Active (1.4), Very Active (1.6)
- Temp (°C) — number input
- Humidity (%) — number input
- **Auto-Detect Weather button**: calls `fetchLocalWeather()`.

### Auto-Detect Weather
- Uses browser `navigator.geolocation.getCurrentPosition()`.
- On success: fetches `https://api.open-meteo.com/v1/forecast?latitude=X&longitude=Y&current=temperature_2m,relative_humidity_2m` (Open-Meteo API, no key required).
- Populates `prof-temp` and `prof-humidity` fields.
- Button text updates to show found values e.g. "✓ Found! 28°C, 72% Hum" in green.
- Error states: "Network Error" or "Permission Denied".

### Today's Logbook
- Listed newest-first.
- Each entry shows: drink icon (circular bg), drink name, raw volume in monospace, time, effective hydration (green for positive multiplier, red for negative).
- Delete (trash) button per entry.

---

## 9. Breathing Exercise

### Built-in Techniques (4 defaults)
| ID | Name | Inhale | Hold1 | Exhale | Hold2 |
|---|---|---|---|---|---|
| b1 | Box Breathing (4-4-4-4) | 4 | 4 | 4 | 4 |
| b2 | Relaxing (4-7-8) | 4 | 7 | 8 | 0 |
| b3 | Equal Breathing (4-0-4-0) | 4 | 0 | 4 | 0 |
| b4 | Awake (6-0-2-0) | 6 | 0 | 2 | 0 |

### Technique Selector Button
- Dropdown-style button showing active technique name and a caret.
- Opens a modal listing all techniques.
- Active technique has glow border and check-circle icon.
- Clicking a technique sets `activeTechId`, updates the UI subtext (pattern description), closes the modal.
- Disabled during an active session.

### Breathing Subtext
- Displays the pattern as `"Xs Inhale • Xs Hold • Xs Exhale • Xs Hold"`.
- Omits phases with duration 0.

### Custom Breathing Technique (Modal)
Fields:
- **Technique Name** (text, required)
- **Inhale (sec)**: number, 1–20, default 4
- **Top Hold (sec)**: number, 0–30, default 4
- **Exhale (sec)**: number, 1–20, default 4
- **Bottom Hold (sec)**: number, 0–30, default 4
- Saved to `state.breathingTechniques`, auto-selected on creation.
- ID: `'bc' + Date.now()`.

### Animated Breathing Circle
- Two layered circles: outer `#breath-visual` (20% opacity) and inner `#breath-visual-core` (40% opacity).
- Both have `box-shadow: 0 0 40px var(--primary)` (glow).
- On **inhale**: both scale to `1.8` with CSS transition matching inhale duration.
- On **exhale**: both scale back to `1.0` with CSS transition matching exhale duration.
- On **hold**: no scale change.

### Breathing Phase Engine
- `runBreathPhase(phase, technique)` cycles: `inhale → hold1 (if > 0) → exhale → hold2 (if > 0) → inhale...`
- Each phase uses `setTimeout` with the phase's duration in ms.
- Center text updates: `INHALE`, `HOLD`, `EXHALE`, `HOLD`.
- Stops recursion immediately when `isBreathingActive === false`.

### Live Session Timer
- `#breath-live-timer` displays `MM:SS` format.
- Updated every 1 second via `setInterval` while active.
- Resets to `00:00` on stop.

### Start / Stop
- **Start**: hides Start button, shows Stop button, disables technique selector.
- **Stop & Save**: saves session only if duration ≥ 10 seconds. Shorter sessions are discarded silently.
- Saved data: id, techniqueId, techniqueName, durationSeconds, timestamp, time.
- After stop: resets text to `READY`, resets timer, re-enables technique selector.

### Today's Stats
- **Total Mindful Time**: sum of all `durationSeconds` for today, formatted as `Xm Ys`.
- **Today's Sessions list**: shows technique name, time, and duration in primary-color monospace. Listed newest-first.

---

## 10. Journal

### Writing an Entry
- **Title input**: optional, large styled underlined input, placeholder "Entry Title (e.g., Morning Thoughts)".
- **Body textarea**: required,
- Date label shows full formatted date: "Wednesday, June 11, 2025".
- Validation: empty body triggers an error modal, not a browser alert.
- Saves: id (timestamp), date (`todayStr`), title, body.
- Multiple entries per day allowed.
- After save: form fields are cleared, list re-renders.

### Previous Entries
- Sorted by date descending, then by id descending (newest first within the same day).
- Each entry card shows:
  - Title ("Untitled Entry" fallback).
  - Date badge (monospace, uppercase).
  - **Delete button**: appears only on hover (`opacity-0 group-hover:opacity-100`). Also visible on keyboard focus.
  - Body text with `whitespace-pre-wrap` (preserves line breaks).
- Deletion with no confirmation prompt — immediate.

### Dashboard Integration
- Today's journals previewed in a panel with 3-line body clamp.

---

## 11. Analytics

### 7-Day Rolling Stats (4 cards)
| Stat | Calculation | Display |
|---|---|---|
| Avg Mood (7d) | Average of all mood entries across the 7 days (only days with data) | `X.X` or `-` |
| Avg Sleep (7d) | Average nightly sleep hours across the 7 days (only days with data) | `X.Xh` or `-` |
| Habits Hit Rate (7d) | `(total done / total possible, excluding skipped) × 100%` | `X%` |
| Avg Breathe (7d) | Total breathing seconds ÷ 7, formatted as `Xm Ys` | `Xm Ys` |

### Chart 1 — Mood & Sleep Correlation (line chart)
- Type: `Chart.js line`, dual Y-axis.
- Dataset 1 — Mood (1–10): left Y-axis, solid line.
- Dataset 2 — Sleep (Hrs): right Y-axis, dashed line (`borderDash: [5, 5]`), max 12.
- `spanGaps: true` (null days skipped gracefully).
- Tooltip mode: `'index'` (hover shows both values at once).
- Legend shown with Inter font labels.

### Chart 2 — Habit Completion Rate (bar chart)
- Type: `Chart.js bar`.
- Y-axis: 0–100%, tick callback appends `%`.
- Bar color: amber (`#f59e0b80` fill, `#f59e0b` border), `borderRadius: 6`.
- Legend hidden.
- Completion per day = `doneOnDay / (activeHabits - skippedThatDay)`.

### Chart 3 — Hydration & Mindful Minutes (mixed chart)
- Type: `Chart.js bar` (base type), full-width spanning both chart columns.
- Dataset 1 — Hydration (ml): bars, left Y-axis, primary color.
- Dataset 2 — Breathing (Mins): line overlay, right Y-axis, emerald green (`#10b981`).
- Dual Y-axis with labels "ml" and "Mins".
- Tooltip mode: `'index'`.

### Lifetime Overview (5 stats)
| Stat | Calculation |
|---|---|
| Lifetime Mood | Average across all-time mood entries |
| Total Sleep | Total hours ever logged |
| Total Water | Total effective hydration ever logged (in liters) |
| Mindful Time | Total breathing minutes ever logged |
| Journals Written | Count of all journal entries |

### Chart Color Theming
- All charts change color on theme change when analytics is the active view.
---

## 12. Calendar

### Month Navigation
- Left/Right chevron buttons change month via `changeMonth(-1)` and `changeMonth(1)`.
- Header displays full month + year.
- `currentCalDate` is a `Date` object mutated directly by `setMonth()`.

### Day Grid
- Renders in a 7-column CSS grid.
- Empty `div` cells fill the leading days of the week before the 1st.
- Each day is a `<button>` with `aspect-square` (perfect square cells).
- Timezone offset is applied correctly: `new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0]`.

### Day Cell States
- **Today**: `bg-primary text-app border-primary`, bold black font, drop shadow.
- **Low mood (≤3)**: red-tinted background and border.
- **Medium mood (4–6)**: yellow-tinted background and border.
- **High mood (≥7)**: green-tinted background and border.
- **No mood**: default surface/border.
- All non-today days have hover scale (`hover:scale-[1.02]`).

### Activity Indicator Dots (bottom of each cell)
| Dot Color | Meaning |
|---|---|
| Blue | Journal entry exists |
| Purple | Sleep logged |
| Emerald green | Breathing session logged |

### Day Detail Modal (`showDayDetails`)
Clicking any day opens a modal showing a full summary:
- Date header (full format: "Wednesday, June 11, 2025").
- **Mood Avg**: average mood / 10 or "None".
- **Habits Done**: count + list of habit names as individual badges.
- **Sleep Logged**: total hours and minutes (all types combined).
- **Hydration**: total effective ml.
- **Mindful Time**: total breathing time formatted.
- **Journals**: list of journal titles for the day (shown only if ≥1 journal exists).

---

## 13. Settings

### Data Management Section

#### Export Options (4 buttons)
1. **Export CSV** (`exportAnalyticsCSV()`):
   - Filename: `OmniTracker_Export_YYYY-MM-DD.csv`
   - Columns: Date, Avg Mood, Total Sleep (Hrs), Total Hydration (ml), Mindful Secs.
   - Loops over all unique dates found across mood/sleep/hydration logs.
   - Success modal shown after download.

2. **Export MD** (`exportAnalyticsMD()`):
   - Filename: `OmniTracker_Report_YYYY-MM-DD.md`
   - Contains: generation date, lifetime summary section (avg mood, total sleep, total hydration in liters, mindful minutes, total journals), and full journal entries sorted newest-first with `---` separator.
   - Success modal shown after download.

3. **Export PDF** (`exportAnalyticsPDF()`):
   - Uses `html2pdf.js`.
   - Navigates to analytics view first.
   - Shows "Generating PDF" modal, hides it during capture.
   - Captures `#view-analytics` element.
   - Options: margin 0.5in, JPEG quality 0.98, scale 2, landscape letter format.
   - Filename: `OmniTracker_Analytics_YYYY-MM-DD.pdf`.

4. **Raw Backup** (`exportData()`):
   - Downloads entire `state` object as formatted JSON.
   - Filename: `omnitracker_backup_YYYY-MM-DD.json`
   - MIME type: `application/json`.

#### Import (Restore JSON Backup)
- Hidden `<input type="file" accept=".json">` behind a styled label.
- Reads file with `FileReader.readAsText()`.
- Validates: must be an object with an `Array` `habits` property.
- On success: replaces `state`, saves to IDB, shows success modal with "Reload App" button.
- On failure: shows "Import Failed" error modal.
- Input value is cleared after selection (`e.target.value = ''`).

### Theme Engine Section

- 40 hand-crafted themes organized in 4 categories: Dark, Light, Colorful/Vibrant, Earthy/Pastel.
- Each theme defines 6 CSS variables: `--bg`, `--surface`, `--border`, `--text-main`, `--text-muted`, `--primary`.
- Theme is applied instantly via `document.documentElement.style.setProperty()` for all 6 variables.
- Theme name persisted to state and IDB.
- Active theme gets a `ring-2 ring-primary` highlight and a checkmark icon.
- A `<meta name="theme-color">` tag is created/updated to match `theme.surface` (PWA browser chrome coloring).
- Charts re-render on theme change if analytics or dashboard is active.

#### Full Theme List (40 themes)
**Dark (15):** Tokyo Night, Dracula, Nord, Gruvbox Dark, Catppuccin Mocha, Catppuccin Macchiato, Catppuccin Frappe, One Dark, Ayu Dark, Palenight, Night Owl, Oceanic Next, Monokai Pro, Material Dark, Synthwave

**Light (10):** Catppuccin Latte, Github Light, Solarized Light, Gruvbox Light, One Light, Rose Pine Dawn, Ayu Light, Paper, Minimal Light, Soft Light

**Colorful/Vibrant (8):** Cyberpunk, Outrun, Ruby, Sapphire, Emerald, Amethyst, Sunset, Neon

**Earthy/Pastel (7):** Rose Pine, Forest, Ocean, Desert, Coffee, Matcha, Lavender

### Danger Zone
- "Wipe All Data" button in red.
- Triggers a confirmation modal before executing.
- `executeFactoryReset()`:
  1. Removes `omniTrackerState` from localStorage.
  2. Closes the IDB connection.
  3. Calls `indexedDB.deleteDatabase(DB_NAME)` (async, resolves on both success and error).
  4. Calls `location.reload()`.

---

## 14. Profile Menu

An overlay or slide-in panel accessible from a persistent avatar/icon in the navigation bar. Provides a quick summary of the user and shortcuts to key areas.

### User Identity Block
- **Avatar**: displays the user's initials (first + last name initial) in a styled circular badge using the current theme's primary color.
- **Display Name**: full name as entered in the profile settings.


## 17. Responsive / Mobile Design


## 18. Custom Scrollbar 


## 20. Default State (Fresh Install)

On first run, the app loads with these seeded values:

**Habits (3):**
- Drink Water (Morning)
- Read 10 pages
- Exercise 30m

**Custom Drinks (5):**
- Glass of Water, 250ml, ×1.0
- Water Bottle, 500ml, ×1.0
- Coffee, 250ml, ×0.8
- Tea, 250ml, ×0.9
- Soda / Juice, 330ml, ×0.6

**Breathing Techniques (4):**
- Box Breathing (4-4-4-4)
- Relaxing (4-7-8)
- Equal Breathing (4-0-4-0)
- Awake (6-0-2-0)

**User Profile:**
- Gender: male
- Weight: 65kg
- Height: 170cm
- Activity Level: 1.2 (Lightly Active)
- Temp: 22°C
- Humidity: 50%

**Theme:** Tokyo Night

**All logs:** empty (no moods, no sleep, no hydration, no breathing, no journals)

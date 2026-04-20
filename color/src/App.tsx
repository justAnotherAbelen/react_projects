import { useState } from "react";
import "./App.css";


function App() {
  const SWATCH_COUNT = 5;

  const createRandomPalette = () => {
    const hexLetter = "0123456789ABCDEF";
    const newPalette: string[] = [];

    for (let i = 0; i < SWATCH_COUNT; i++) {
      let hexColor = "#";

      for (let j = 0; j < 6; j++) {
        hexColor += hexLetter[Math.floor(Math.random() * 16)];
      }

      newPalette.push(hexColor);
    }

    return newPalette;
  };

  // string[] — each entry is a hex color (e.g. "#3a7bd5"). Matches setPalette / palette updates to strings only.
  const [palette, setPalette] = useState<string[]>(() => createRandomPalette());

  // boolean[] — parallel to palette indices: true = swatch stays fixed when regenerating colors.
  // an array of boolean
  const [locked, setLocked] = useState<boolean[]>(
    () => Array(SWATCH_COUNT).fill(false)
  );

  // Record<number, boolean> — map swatch index → "show copied feedback" for that single color (often cleared after a timeout).
  // to check if the color is copied or not 
  const [copiedState, setCopiedState] = useState<Record<number, boolean>>({});

  // boolean — separate from per-swatch copy: true after "copy all" until you reset UI feedback.
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
 
  const colorRandomizer = () => {
    const hexLetter = "0123456789ABCDEF";
    let hexColor = "#";

    for (let i = 0; i < 6; i++) {
      hexColor += hexLetter[Math.floor(Math.random() * 16)];
    }

    return hexColor;
  };

  // Builds the next 5-swatch palette: locked indices keep palette[i]; others get a new random hex.
  // Call setPalette(newPalette) when you want React to show the result (otherwise state does not update).
  const paletteGenerator = () => {
    // Fresh list that will replace (or become) the current palette once passed to setPalette.
    const newPalette: string[] = [];

    // Five slots, matching the five colors / lock toggles in the UI.
    for (let i = 0; i < SWATCH_COUNT; i++) {
      if (locked[i]) {
        // if locked => Keep this swatch’s color when regenerating (reuse from current palette).
        newPalette.push(palette[i]);
      } else {
        // Unlocked: assign a new random #RRGGBB from colorRandomizer.
        newPalette.push(colorRandomizer());
      }
    }

    setPalette(newPalette);
  };

  const toggleClock = (index: number) => {
    const newLocked = [...locked];

    // toggle between lock and unlock
    newLocked[index] = !newLocked[index];

    setLocked(newLocked);
  };

  const unlockAll = () => {
    setLocked(Array(SWATCH_COUNT).fill(false));
  };

  const copyToClipboard = (color: string, index: number) => {
    if (copiedState[index]) {
      return;
    }

    navigator.clipboard.writeText(color);

    // Mark swatch index as copied (true), and leave all other indices unchanged.
    setCopiedState((prev) => ({ ...prev, [index]: true }));

    setTimeout(() => {
      setCopiedState((prev) => {
        const newState = { ...prev };

        delete newState[index];

        return newState;
      });
    }, 1200);
  };

  const copyToAll = () => {
    // combine all into a single string
    const paletteString = palette.join(",");

    navigator.clipboard.writeText(paletteString);

    setCopiedAll(true);

    // reset after certain time 
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // convert hex => rgb format :
  // "#FF5733" => "rgb(255,87,51)"
  const hexToRgb = (hex: string) => {
    // hex color breakdown : #RRGGBB 
    // from 00-FF 

    // convert from string to interger
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgb(${r}, ${g}, ${b})`;
  };

  const isColorLight = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    /// numbers under are weights from a luminance (perceived brightness) formula.
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // either return true if > 155 or false
    return brightness > 155;
    // why 155 ? It’s just a chosen cutoff point. Common thresholds are somewhere around 128 to 186
    // depending on how strict you want contrast detection to be.
  };

  return (
    <main className="app">
      <header className="top-bar">
        <h1>Color Palette Generator</h1>
      </header>

      <section className="palette-grid">

        {palette.map((color, index) => {
          const light = isColorLight(color);

          return (

            <article
              key={`${color}-${index}`}
              className="swatch"
              style={{ backgroundColor: color }}
            >

              <div className={`swatch-content ${light ? "dark-text" : "light-text"}`}>

                <div className="swatch-meta">
                  <h2>{color}</h2>
                  <p>{hexToRgb(color)}</p>
                </div>

                <div className="swatch-actions">

                  <button type="button" onClick={() => toggleClock(index)}>
                    {locked[index] ? "Unlock" : "Lock"}
                  </button>

                  <button type="button" onClick={() => copyToClipboard(color, index)}>
                    {copiedState[index] ? "Copied!" : "Copy"}
                  </button>

                </div>
              </div>
            </article>
          );
        })}
      </section>

      <footer className="toolbar">

        <button type="button" onClick={paletteGenerator}>
          Generate palette
        </button>

        <button type="button" onClick={copyToAll}>
          {copiedAll ? "All copied!" : "Copy all"}
        </button>

        <button type="button" onClick={unlockAll}>
          Unlock all
        </button>
        
      </footer>
    </main>
  );
}

export default App;

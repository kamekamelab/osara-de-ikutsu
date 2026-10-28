// Local SVG illustrations: no remote assets, fonts, or downloads are needed.
(() => {
  const svg = (body) => `<svg viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;
  const apple = svg(`<path d="M51 28c-2-13 2-20 8-24" fill="none" stroke="#654628" stroke-width="7" stroke-linecap="round"/><path d="M55 23C57 5 79 6 87 10 79 25 67 29 55 23Z" fill="#4a8550" stroke="#2e603e" stroke-width="3"/><path d="M50 35C28 19 8 34 10 56c1 20 14 38 27 38 6 0 9-3 13-3s8 3 14 3c13 0 26-19 26-39 0-22-21-36-40-20Z" fill="#e4624d" stroke="#943c30" stroke-width="4" stroke-linejoin="round"/><path d="M50 37c8-6 14-6 17-5 15 6 17 19 15 32-2 13-10 24-17 26" fill="none" stroke="#c74839" stroke-width="9" stroke-linecap="round"/><path d="M25 45c-4 5-5 11-4 16" fill="none" stroke="#ffe3c7" stroke-width="6" stroke-linecap="round"/>`);
  const elephant = `<svg viewBox="10 23 254 178" aria-hidden="true">
    <defs>
      <linearGradient id="__ANIMAL__-body" x1="0" y1="0" x2=".3" y2="1"><stop stop-color="#b2bec4"/><stop offset=".6" stop-color="#9cabb3"/><stop offset="1" stop-color="#85979f"/></linearGradient>
      <linearGradient id="__ANIMAL__-ear" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="#bac6cb"/><stop offset="1" stop-color="#8a9da6"/></linearGradient>
      <linearGradient id="__ANIMAL__-trunk" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#b1bfc5"/><stop offset="1" stop-color="#8b9ea7"/></linearGradient>
    </defs>
    <ellipse cx="127" cy="191" rx="94" ry="5" fill="#738166" opacity=".12"/>
    <path d="M39 83C22 88 25 115 18 124" fill="none" stroke="#63757e" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M18 120c-4 3-7 8-5 11 4 0 8-4 9-8Z" fill="#52646d"/>
    <path d="M84 121c-3 15 1 33 2 52-1 9 3 13 10 13h8c7-1 8-5 6-12l-2-51Z" fill="#7f929d" stroke="#61757e" stroke-width="2.3" stroke-linejoin="round"/>
    <path d="m177 114 11 61c2 9 5 11 12 11h10c7-1 8-5 5-12l-9-62Z" fill="#7f929d" stroke="#61757e" stroke-width="2.3" stroke-linejoin="round"/>
    <path d="M44 65C62 44 92 36 125 43c28 2 51 9 65 29 17 23 8 45-9 60l-4 44c-1 8-5 12-12 12h-10c-6-1-9-5-8-12l2-32c-24 8-49 6-74-6l-2 38c-1 8-5 12-13 12H50c-7-1-10-5-10-12l2-49C27 109 28 83 44 65Z" fill="url(#__ANIMAL__-body)" stroke="#5d727c" stroke-width="2.7" stroke-linejoin="round"/>
    <path d="M46 69c18-19 47-26 72-21" fill="none" stroke="#d4dde0" stroke-width="3.5" opacity=".7" stroke-linecap="round"/>
    <path d="M75 138c-4-10-5-18-3-26m78 29c4-9 8-15 8-28" fill="none" stroke="#80959f" stroke-width="2" stroke-linecap="round"/>
    <path d="M49 116c-6-10-5-20-2-29m7 55-2 14m109-5-2 13m-61-94-2 12" fill="none" stroke="#8fa2ac" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>
    <path d="M180 54c4-17 17-27 34-24 19 2 31 20 30 38 5 17 8 40 4 63-2 14-7 26-15 33-4 4-10 4-11 0-1-3 2-7 5-11 4-8 6-17 6-27-1-16-6-29-14-38-9 8-18 12-26 5-10-10-12-24-7-37Z" fill="url(#__ANIMAL__-trunk)" stroke="#5d727c" stroke-width="2.7" stroke-linejoin="round"/>
    <path d="M187 52c4-12 15-18 25-16" fill="none" stroke="#d2dce0" stroke-width="2.8" opacity=".65" stroke-linecap="round"/>
    <path d="m233 96 10-2m-8 14 9-1m-8 13 8 1m-9 12 7 2m-9 10 5 3" fill="none" stroke="#788f9b" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M180 54c-11-11-28-10-35 4-8 13-4 31 7 44 7 8 16 8 22-1 9-14 14-34 6-47Z" fill="url(#__ANIMAL__-ear)" stroke="#627983" stroke-width="2.3" stroke-linejoin="round"/>
    <path d="M173 58c-8-7-17-5-22 5-4 9-2 19 3 27" fill="none" stroke="#d5dfe1" stroke-width="2.6" opacity=".65" stroke-linecap="round"/>
    <path d="M159 98c9-2 17-15 18-29" fill="none" stroke="#7e96a1" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M212 91c15 7 32 7 44-4-6 14-25 18-44 6Z" fill="#f5ecd5" stroke="#a59f8c" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M216 93c12 4 24 3 33-2" fill="none" stroke="#fffaf0" stroke-width="1.5" stroke-linecap="round"/>
    <path d="m210 59 6-1" fill="none" stroke="#6c838e" stroke-width="1.8" stroke-linecap="round"/>
    <ellipse cx="218" cy="66" rx="2.8" ry="3.1" fill="#30424b"/><circle cx="218.8" cy="65" r=".8" fill="#f7faf9"/>
    <path d="m213 74 6 2m-23 11 6 1" fill="none" stroke="#899fa9" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M47 173h19m87 0h17" fill="none" stroke="#8a9fa9" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M44 186v-3c0-5 6-5 6 0v4m3 0v-4c0-5 6-5 6 0v4m3 0v-4c0-5 6-5 6 0v3m81 0v-3c0-5 6-5 6 0v4m3 0v-4c0-5 6-5 6 0v4m3 0v-4c0-5 6-5 6 0v3" fill="#c3ced2" stroke="#8b9fa7" stroke-width="1"/>
  </svg>`;
  const carriage = svg(`<path d="M2 72h96" stroke="#475d59" stroke-width="5" stroke-linecap="round"/><rect x="7" y="27" width="86" height="50" rx="9" fill="#4e9688" stroke="#28584d" stroke-width="4"/><path d="M8 64h84" stroke="#edc465" stroke-width="9"/><rect x="15" y="35" width="19" height="20" rx="3" fill="#fff1c7" stroke="#28584d" stroke-width="3"/><rect x="41" y="35" width="19" height="20" rx="3" fill="#fff1c7" stroke="#28584d" stroke-width="3"/><rect x="67" y="35" width="17" height="29" rx="3" fill="#fff1c7" stroke="#28584d" stroke-width="3"/><circle cx="25" cy="79" r="9" fill="#42534e" stroke="#243d36" stroke-width="3"/><circle cx="75" cy="79" r="9" fill="#42534e" stroke="#243d36" stroke-width="3"/><circle cx="25" cy="79" r="3" fill="#b4c4b9"/><circle cx="75" cy="79" r="3" fill="#b4c4b9"/>`);
  const balloon = svg(`<path d="M50 65c-17 12 15 18-2 31" stroke="#687c82" stroke-width="3" fill="none" stroke-linecap="round"/><path d="m50 59-6 10h12Z" fill="#d9813b" stroke="#985324" stroke-width="2"/><ellipse cx="50" cy="33" rx="29" ry="31" fill="#f2b14f" stroke="#985324" stroke-width="3"/><path d="M34 14c-6 6-7 13-6 18" fill="none" stroke="#fff1d1" stroke-width="5" stroke-linecap="round"/>`);
  const donut = svg(`<circle cx="50" cy="50" r="39" fill="#d69856" stroke="#925b32" stroke-width="4"/><path d="M17 47c-2-17 15-31 33-30 19-1 34 14 33 30-1 8-7 6-10 12-6 9-10 3-16 8-9 6-14-3-21-1-8 2-19-10-19-19Z" fill="#efada8" stroke="#b66d70" stroke-width="3"/><circle cx="50" cy="48" r="13" fill="#fffefa" stroke="#925b32" stroke-width="4"/><path d="m29 35 5 5m30-12-3 6m7 15 7 2m-45 3-5 5m19 12 6-3" stroke="#fff5d9" stroke-width="4" stroke-linecap="round"/><path d="m47 26 5 2m17 34-4 4" stroke="#98609c" stroke-width="4" stroke-linecap="round"/>`);
  const common = { unit: 'こ', nounUnit: '個', addAction: 'あわせる！', takeAction: 'へらす！', takeLegend: 'とる かず', takeHeading: 'とってみよう', takeLabel: 'とった もの' };
  window.countingGames = Object.freeze({
    plate: { ...common, name: 'おさら', title: 'おさらで あわせる', description: 'りんごを おさらへ', noun: 'りんご', illustration: apple, area: 'おさら', left: 'ひだりのおさら', right: 'みぎのおさら', result: 'おおきなおさら', remaining: 'のこる おさら', addHeading: 'あつめよう', addHint: 'おおきなおさらへ。', takeHint: 'とった りんごは、よこへ。', empty: 'おさらは からっぽ。' },
    basket: { ...common, name: 'かご', title: 'かごを あわせる', description: 'りんごを かごへ', noun: 'りんご', illustration: apple, area: 'かご', left: 'ひだりのかご', right: 'みぎのかご', result: 'おおきなかご', remaining: 'のこる かご', addHeading: 'かごへ あつめよう', addHint: 'おおきなかごへ。', takeHint: 'とった りんごは、よこへ。', empty: 'かごは からっぽ。' },
    animals: { ...common, name: 'どうぶつ', title: 'どうぶつ しゅうごう', description: 'ぞうを そうげんへ', noun: 'ぞう', unit: 'とう', nounUnit: '頭', illustration: elephant, area: 'そうげん', left: 'ひだりのそうげん', right: 'みぎのそうげん', result: 'みんなの そうげん', remaining: 'のこる そうげん', addAction: 'しゅうごう！', takeAction: 'おでかけ！', takeLegend: 'でかける かず', takeLabel: 'でかけた ぞう', addHeading: 'しゅうごうしよう', addHint: 'みんなの そうげんへ。', takeHeading: 'おでかけしよう', takeHint: 'でかける ぞうは、よこへ。', empty: 'ぞうは いないね。' },
    train: { ...common, name: 'でんしゃ', title: 'でんしゃを つなげる', description: 'しゃりょうを れんけつ', noun: 'しゃりょう', unit: 'りょう', nounUnit: '両', illustration: carriage, area: 'せんろ', left: 'ひだりのでんしゃ', right: 'みぎのでんしゃ', result: 'つながる でんしゃ', remaining: 'のこる でんしゃ', addAction: 'れんけつ！', takeAction: 'きりはなす！', takeLegend: 'はなす かず', takeLabel: 'はなした しゃりょう', addHeading: 'つなげよう', addHint: 'ひとつの でんしゃに。', takeHeading: 'きりはなそう', takeHint: 'うしろの しゃりょうを、よこへ。', empty: 'しゃりょうは ないね。' },
    balloon: { ...common, name: 'ふうせん', title: 'ふうせんを あつめる', description: 'ふうせんを そらへ', noun: 'ふうせん', illustration: balloon, area: 'そら', left: 'ひだりのふうせん', right: 'みぎのふうせん', result: 'あつまる ふうせん', remaining: 'のこる ふうせん', addAction: 'あつめる！', takeAction: 'とばす！', takeLegend: 'とばす かず', takeLabel: 'とばした ふうせん', addHeading: 'あつめよう', addHint: 'そらへ、ふわっと。', takeHeading: 'とばしてみよう', takeHint: 'とばす ふうせんは、よこへ。', empty: 'ふうせんは ないね。' },
    tray: { ...common, name: 'トレー', title: 'トレーに のせる', description: 'ドーナツを トレーへ', noun: 'ドーナツ', illustration: donut, area: 'トレー', left: 'ひだりのトレー', right: 'みぎのトレー', result: 'おおきなトレー', remaining: 'のこる トレー', addAction: 'のせる！', addHeading: 'いっしょに のせよう', addHint: 'おおきなトレーへ。', takeHint: 'とった ドーナツは、よこへ。', empty: 'トレーは からっぽ。' }
  });
})();

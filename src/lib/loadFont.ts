import {continueRender, delayRender, staticFile} from 'remotion';

const FONT_FAMILY = 'IBM Plex Sans Arabic';

const FONT_FACES: Array<{file: string; weight: number}> = [
  {file: 'fonts/IBMPlexSansArabic-Regular.woff2', weight: 400},
  {file: 'fonts/IBMPlexSansArabic-Medium.woff2', weight: 500},
  {file: 'fonts/IBMPlexSansArabic-SemiBold.woff2', weight: 600},
  {file: 'fonts/IBMPlexSansArabic-Bold.woff2', weight: 700},
];

let loaded = false;

export const ensureBrandFont = (): void => {
  if (typeof document === 'undefined' || loaded) {
    return;
  }

  const handle = delayRender('Loading IBM Plex Sans Arabic');

  const style = document.createElement('style');
  style.textContent = FONT_FACES.map(
    ({file, weight}) => `
@font-face {
  font-family: '${FONT_FAMILY}';
  src: url('${staticFile(file)}') format('woff2');
  font-weight: ${weight};
  font-style: normal;
  font-display: block;
}
`,
  ).join('\n');
  document.head.appendChild(style);

  void Promise.all(
    FONT_FACES.map(({weight}) => document.fonts.load(`${weight} 48px "${FONT_FAMILY}"`, 'نظام')),
  )
    .then(() => {
      loaded = true;
      continueRender(handle);
    })
    .catch((error: unknown) => {
      console.error('Font load failed', error);
      continueRender(handle);
    });
};

export {FONT_FAMILY};

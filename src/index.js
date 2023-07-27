import path from 'path';
import {
  launchBrowser,
  compareLayout,
  runTests,
  mkdir,
  mkfile,
  structure,
  stylelint,
  w3c,
  orderStyles,
  lang,
  titleEmmet,
  horizontalScroll,
  extraFonts,
} from 'lib-verstka-tests';
import ru from './locales/ru.js';
import {
  elementsBySelectors,
  propertiesByElement,
  videoAttributes,
  pseudoElements,
} from './tests.js';

const [, , PROJECT_PATH, LANG = 'ru'] = process.argv;

const app = async (projectPath, lng) => {
  const options = {
    projectPath,
    lang: lng,
    resource: ru,
  };

  const check = async () => {
    const tree = mkdir('project', [
      mkfile('index.html'),
      mkdir('styles', [
        mkfile('style.css'),
      ]),
      mkdir('fonts', [
        mkfile('font.css'),
      ]),
      mkdir('video'),
      mkdir('images'),
    ]);
    const structureErrors = structure(projectPath, tree);

    if (structureErrors.length) {
      return structureErrors;
    }

    const metaTags = [
      {
        name: 'description',
        selector: 'meta[name="description"][content]:not([content=""])',
      },
      {
        name: 'og:url',
        selector: 'meta[property="og:url"][content]:not([content=""])',
      },
      {
        name: 'og:title',
        selector: 'meta[property="og:title"][content]:not([content=""])',
      },
      {
        name: 'og:description',
        selector: 'meta[property="og:description"][content]:not([content=""])',
      },
      {
        name: 'og:image',
        selector: 'meta[property="og:image"][content]:not([content=""])',
      },
      {
        name: 'twitter:card',
        selector: 'meta[property="twitter:card"][content]:not([content=""])',
      },
    ];

    const favicons = [
      {
        name: 'ico',
        selector: 'link[rel="icon"][href$=".ico"]',
      },
      {
        name: 'svg',
        selector: 'link[rel="icon"][href$=".svg"]',
      },
    ];

    const mobileFavicons = [
      { name: 'apple-touch-icon', selector: 'link[rel="apple-touch-icon"]' },
    ];

    const baseUrl = 'http://localhost:3000';
    const viewport = { width: 800, height: 600 };
    const launchOptions = { args: ['--no-sandbox', '--disable-setuid-sandbox'] };
    const { browser, page } = await launchBrowser(baseUrl, { launchOptions, viewport });
    const errors = (await Promise.all([
      w3c(projectPath, 'index.html'),
      stylelint(projectPath),
      orderStyles(page, ['font.css', 'style.css']),
      extraFonts(path.join(projectPath, 'styles', 'style.css'), ['Raleway']),
      lang(page, lng),
      titleEmmet(page),
      elementsBySelectors(page, metaTags, 'metaTagsMissing'),
      elementsBySelectors(page, favicons, 'faviconsMissing'),
      elementsBySelectors(page, mobileFavicons, 'mobileFaviconMissing'),
      propertiesByElement(page, 'body', { margin: '0px' }),
      videoAttributes(page, ['muted', 'autoplay', 'poster', 'loop'], ['controls']),
      pseudoElements(path.join(projectPath, 'styles', 'style.css')),
      horizontalScroll(page),
      compareLayout(baseUrl, {
        canonicalImage: 'layout-canonical-800.jpg',
        pageImage: 'layout-800.jpg',
        outputImage: 'output-800.jpg',
        browserOptions: { launchOptions, viewport: { width: 800, height: 600 } },
      }, {
        onBeforeScreenshot: async (p) => {
          await p.evaluate(() => {
            const videos = document.querySelectorAll('video');
            videos.forEach((video) => {
              video.pause();
              video.removeAttribute('autoplay');
              video.currentTime = 0;
            });
          });
          await p.hover('h1');
        },
      }),
    ]))
      .filter(Boolean)
      .flat();

    await browser.close();

    return errors;
  };

  await runTests(options, check);
};

app(PROJECT_PATH, LANG);

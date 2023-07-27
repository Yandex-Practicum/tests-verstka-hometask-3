import fs from 'fs';
import * as csstree from 'css-tree';
import {
  hasElementBySelectors,
  getStyles,
} from 'lib-verstka-tests';

const elementsBySelectors = async (page, search, errorId) => {
  const found = await Promise.all(search.map(async ({ name, selector }) => {
    const isFound = await hasElementBySelectors(page, selector);

    return {
      name,
      isMissing: !isFound,
    };
  }));
  const missing = found.filter(({ isMissing }) => isMissing);
  const missingNames = missing.map(({ name }) => name);

  if (missingNames.length) {
    return [{
      id: errorId,
      values: {
        names: missingNames.join(', '),
      },
    }];
  }

  return [];
};

const propertiesByElement = async (page, selector, properties) => {
  const styles = await getStyles(page, selector, Object.keys(properties));
  const incorrectProperties = Object.entries(properties)
    .filter(([name, value]) => styles[name] !== value)
    .map(([name, value]) => `${name}: ${value}`);

  if (incorrectProperties.length) {
    return [{
      id: 'elementProperties',
      values: {
        name: selector,
        properties: incorrectProperties.join('; '),
      },
    }];
  }

  return [];
};

const videoAttributes = async (page, requiredAttributes, excludeAttributes) => {
  const errors = [];
  const attributes = await page.evaluate(() => (
    Array.from(document.querySelector('video').attributes)
      .map(({ name }) => name)
  ));
  const missingAttributes = requiredAttributes.filter((name) => !attributes.includes(name));
  const extraAttributes = excludeAttributes.filter((name) => attributes.includes(name));

  if (missingAttributes.length) {
    errors.push({
      id: 'videoAttributesMissing',
      values: {
        names: missingAttributes.join(', '),
      },
    });
  }

  if (extraAttributes.length) {
    errors.push({
      id: 'videoAttributesExtra',
      values: {
        names: extraAttributes.join(', '),
      },
    });
  }

  return errors;
};

const pseudoElements = (cssPath) => {
  const cssCode = fs.readFileSync(cssPath, 'utf8');
  const ast = csstree.parse(cssCode);

  const found = csstree.findAll(ast, (node) => node.type === 'PseudoClassSelector' || node.type === 'PseudoElementSelector');

  if (found.length < 3) {
    return [{ id: 'countPseudoElements' }];
  }

  return [];
};

export {
  elementsBySelectors,
  propertiesByElement,
  videoAttributes,
  pseudoElements,
};

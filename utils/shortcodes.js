module.exports = function (eleventyConfig) {
  eleventyConfig.addShortcode('displayPostList', function (posts) {
    return `<ul class="postlist">
    ${posts
      .map(
        (post) => `<li class="postlist-item">
      <a class="postlist-title" href="${post.url}">${post.data.title}</a>
      ${
        post.data.description
          ? `<p class="postlist-description">${post.data.description}</p>`
          : ''
      }
    </li>`
      )
      .join('')}
    </ul>`;
  });

  eleventyConfig.addPairedShortcode(
    'netlifyForm',
    function (content, { action, name }) {
      return `<form action="${action}" method="POST" netlify="true" name="${name}">${content}</form>`;
    }
  );

  eleventyConfig.addShortcode(
    'formSubmit',
    function ({ text = 'Submit' } = {}) {
      return `<div class="text-right">
      <button type="submit" class="btn btn-primary btn-lg">${text}</button>
    </div>`;
    }
  );

  eleventyConfig.addShortcode('formCoC', function () {
    return `<label class="form-group form-check">
      <input type="checkbox" name="agree" class="form-check-input" required value="agree">
      <span class="form-check-label">I've read the Code of Conduct and understand my responsibilities as a member of the Virtual Coffee community</span>
    </label>`;
  });

  function processFormAttributes(labelText, helpText, inputAttributes) {
    const { name } = inputAttributes;

    const processedHelpText = helpText
      ? helpText
      : inputAttributes.required
      ? 'Required.'
      : null;

    if (!labelText) {
      throw new Error('missing form label');
    }

    if (!name) {
      throw new Error('missing form name');
    }

    const helpTextId = `help${name}`;

    const attributes = Object.keys(inputAttributes).reduce(
      (attributesArray, attrKey) => {
        // class, id, aria-describedby handled below
        if (attrKey === 'class' || attrKey === 'id') {
          return attributesArray;
        }

        const val = inputAttributes[attrKey];

        if (val === true) {
          return [...attributesArray, attrKey];
        }

        return [...attributesArray, `${attrKey}="${val}"`];
      },
      []
    );

    attributes.push(`class="${inputAttributes['class'] || 'form-control'}"`);

    attributes.push(`id="${inputAttributes.id || `form${name}`}"`);

    if (processedHelpText && !inputAttributes['aria-describedby']) {
      attributes.push(`aria-describedby="${helpTextId}"`);
    }

    return {
      processedHelpText,
      helpTextId,
      attributes,
    };
  }

  eleventyConfig.addShortcode(
    'formInput',
    function ({ labelText, helpText, ...inputAttributes }) {
      const {
        processedHelpText,
        helpTextId,
        attributes,
      } = processFormAttributes(labelText, helpText, inputAttributes);

      return `<div class="form-group">
        <label for="${attributes.id}">${labelText}</label>
        <input ${attributes.join(' ')} />
        ${
          processedHelpText
            ? `<small id="${helpTextId}" class="form-text text-muted">${processedHelpText}</small>`
            : ``
        }
      </div>`;
    }
  );

  eleventyConfig.addShortcode(
    'formTextarea',
    function ({ labelText, helpText, value = '', ...inputAttributes }) {
      const {
        processedHelpText,
        helpTextId,
        attributes,
      } = processFormAttributes(labelText, helpText, inputAttributes);

      return `<div class="form-group">
        <label for="${attributes.id}">${labelText}</label>
        <textarea ${attributes.join(' ')}>${value}</textarea>
        ${
          processedHelpText
            ? `<small id="${helpTextId}" class="form-text text-muted">${processedHelpText}</small>`
            : ``
        }
      </div>`;
    }
  );

  // formSelect takes an option list with optional optgroups.
  //
  // label is optional, if there is no label then value will be used
  //
  // Sample:
  // [
  //   {
  //     optgroup: 'Option Group',
  //     options: [
  //       {
  //         label: 'Option 1',
  //         value: 'option_1',
  //       },
  //       {
  //         value: 'option_2',
  //       },
  //       {
  //         label: 'Option 3',
  //         value: 'option_3',
  //       },
  //     ],
  //   },
  //   {
  //     label: 'Option 10',
  //     value: 'option_10',
  //   }
  // ]

  eleventyConfig.addShortcode(
    'formSelect',
    function ({ labelText, helpText, options = [], ...inputAttributes }) {
      const {
        processedHelpText,
        helpTextId,
        attributes,
      } = processFormAttributes(labelText, helpText, inputAttributes);

      function displayOption({ label, value }) {
        return `<option value="${value}">${label || value}</option>`;
      }

      return `<div class="form-group">
        <label for="${attributes.id}">${labelText}</label>
        <select ${attributes.join(' ')}>
          ${options
            .map((opt) => {
              if (opt.optgroup) {
                return `<optgroup label="${
                  opt.optgroup
                }">${opt.options
                  .map((subOpt) => displayOption(subOpt))
                  .join('')}</optgroup>`;
              }

              return displayOption(opt);
            })
            .join('')}
        </select>
        ${
          processedHelpText
            ? `<small id="${helpTextId}" class="form-text text-muted">${processedHelpText}</small>`
            : ``
        }
      </div>`;
    }
  );

  // formRadio takes an option list
  //
  // label is optional, if there is no label then value will be used
  //
  // Sample:
  // [
  //   {
  //     label: 'Option 10',
  //     value: 'option_10',
  //     checked: true
  //   },
  //   {
  //     label: 'Option 20',
  //     value: 'option_20',
  //   },
  //   {
  //     label: 'Option 30',
  //     value: 'option_30',
  //   },
  // ]

  eleventyConfig.addShortcode(
    'formRadioSelect',
    function ({ labelText, helpText, options = [], ...inputAttributes }) {
      const {
        processedHelpText,
        helpTextId,
        attributes,
      } = processFormAttributes(labelText, helpText, inputAttributes);

      function displayOption({ label, value, checked }) {
        return `<label class="form-check">
        <input class="form-check-input" type="radio" name="${
          inputAttributes.name
        }" value="${value}" ${checked ? 'checked' : ''}>
        <span class="form-check-label">
          ${label || value}
        </span>
      </label>`;
      }

      return `<div class="form-group">
        <div>${labelText}</div>

          ${options
            .map((opt) => {
              return displayOption(opt);
            })
            .join('')}

        ${
          processedHelpText
            ? `<small id="${helpTextId}" class="form-text text-muted">${processedHelpText}</small>`
            : ``
        }
      </div>`;
    }
  );
};

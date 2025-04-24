const { feedPlugin } = require("@11ty/eleventy-plugin-rss");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const markdownIt = require("markdown-it");
const MarkdownItGitHubAlerts = require("markdown-it-github-alerts");
const path = require("node:path");

module.exports = async function (eleventyConfig) {
  // Copy the contents of the `public` folder to the output folder
  // For example, `./public/css/` ends up in `_site/css/`
  eleventyConfig.addPassthroughCopy({
    "./public/": "/",
    // Copy JS file for copy code button
    "./src/assets/js/": "/assets/js/",
    // Put robots.txt in root
    'src/robots.txt': '/robots.txt' 
  });

  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: {
      name: "posts",
      limit: 0,
    },
    metadata: {
      language: "pt",
      title: "Rodrigo Castro",
      subtitle: "O espaço de Rodrigo Castro na internet",
      base: "https://rodrcastro.com",
      author: {
        name: "Rodrigo Castro",        
      }
    }
  });

  // eleventyConfig.addPlugin(pluginRss);
  // eleventyConfig.addLiquidFilter("dateToRfc3339", pluginRss.dateToRfc3339);
  // eleventyConfig.addLiquidFilter(
  //   "getNewestCollectionItemDate",
  //   pluginRss.getNewestCollectionItemDate
  // );

  // Run Eleventy when these files change:
  // https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

  // Watch content images for the image pipeline.
  eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");

  eleventyConfig.addCollection("posts", function (collectionApi) {
    let posts = collectionApi.getFilteredByGlob("src/posts/blog/*.md")
    .filter(post => !post.data.draft); // Exclude drafts 
    return posts
  })

  let options = {
    html: true,
    breaks: true,
    linkify: true,
  }

  const md = markdownIt(options);

  // Store the original fence rule
  const defaultRender = md.renderer.rules.fence || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  // Override the fence rule to add a wrapper and copy button
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    // Use the raw code content for copying
    const rawCode = token.content.trim();
    // Get the default syntax-highlighted output (using the stored original render)
    const highlightedCodeHtml = defaultRender(tokens, idx, options, env, self);

    // Add a wrapper div, the copy button (with SVG icon), and a hidden textarea for easy copying
    return `<div class="code-block-container">
              ${highlightedCodeHtml}
              <button class="copy-button" title="Copy code" aria-label="Copy code snippet">
                <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 16 16" width="16" fill="currentColor" aria-hidden="true"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg>
                <span class="copy-status"></span>
              </button>
              <textarea class="code-to-copy" style="position: absolute; left: -9999px; top: 0; height: 0; width: 0;" aria-hidden="true" readonly>${rawCode.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</textarea>
            </div>`;
  };

  eleventyConfig.setLibrary("md", md);
  eleventyConfig.amendLibrary("md", (mdLib) => mdLib.use(MarkdownItGitHubAlerts));

  eleventyConfig.addCollection("pages", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/pages/*.md");
  });

  //Image config
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		// which file extensions to process
		extensions: "html",

		// Add any other Image utility options here:

		// optional, output image formats
    formats: ["jpeg", "webp", "svg", "png"],

		// optional, output image widths
		// widths: ["auto"],

		// optional, attributes assigned on <img> override these values.
		defaultAttributes: {
			loading: "lazy",
			decoding: "async",
		},

    filenameFormat: function(id, src, width, format, options) {
      const extension = path.extname(src);
      const name = path.basename(src, extension);
      return `${name}.${format}`;
    }
	});

  const { IdAttributePlugin } = await import("@11ty/eleventy");

	eleventyConfig.addPlugin(IdAttributePlugin);

  return {
    // Control which files Eleventy will process
    // e.g.: *.md, *.njk, *.html, *.liquid
    templateFormats: ["md", "njk", "html", "liquid"],

    // Pre-process *.md files with: (default: `liquid`)
    markdownTemplateEngine: "njk",

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: "njk",

    // These are all optional:
    dir: {
      input: "src", // default: "."
    },

    // -----------------------------------------------------------------
    // Optional items:
    // -----------------------------------------------------------------

    // If your site deploys to a subdirectory, change `pathPrefix`.
    // Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

    // When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
    // it will transform any absolute URLs in your HTML to include this
    // folder name and does **not** affect where things go in the output folder.
    pathPrefix: "/",
  };
};
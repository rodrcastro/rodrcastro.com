const pluginRss = require("@11ty/eleventy-plugin-rss");
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
  });

  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addLiquidFilter("dateToRfc3339", pluginRss.dateToRfc3339);
  eleventyConfig.addLiquidFilter(
    "getNewestCollectionItemDate",
    pluginRss.getNewestCollectionItemDate
  );

  // Run Eleventy when these files change:
  // https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

  // Watch content images for the image pipeline.
  eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");

  eleventyConfig.addFilter("postTags", (tags) => {
    return Object.keys(tags)
      .filter((k) => k !== "posts")
      .filter((k) => k !== "all")
      .map((k) => ({ name: k, count: tags[k].length }))
      .sort((a, b) => b.count - a.count);
  });

  eleventyConfig.addCollection("posts", function (collectionApi) {
    let posts = collectionApi.getFilteredByGlob("src/posts/blog/*.md")

    for(let i = 0; i < posts.length ; i++) {
        const nextPost = posts[i + 1];
        const prevPost = posts[i - 1];

        posts[i].data["nextPost"] = nextPost;
        posts[i].data["prevPost"] = prevPost;
    }

    return posts
  })

  let options = {
    html: true,
    breaks: true,
    linkify: true,
  }

  eleventyConfig.setLibrary("md", markdownIt(options));
  eleventyConfig.amendLibrary("md", (mdLib) => mdLib.use(MarkdownItGitHubAlerts));

  // eleventyConfig.addCollection("posts", function (collectionApi) {
  //   return collectionApi.getFilteredByGlob("src/posts/blog/*.md");
  // });

  eleventyConfig.addCollection("pages", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/pages/*.md");
  });

  //Image config
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		// which file extensions to process
		extensions: "html",

		// Add any other Image utility options here:

		// optional, output image formats
    formats: ["webp", "jpeg", "svg"],

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
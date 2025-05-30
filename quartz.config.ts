import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Zrief's Blog",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "zh-CN",
    baseUrl: "quartz.jzhao.xyz",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          // 浅色模式配色方案
          light: "rgba(250, 248, 246, 1)",        // 页面背景色 - 米白色
          lightgray: "rgba(224, 220, 216, 1)",    // 边框颜色 - 浅灰色
          gray: "rgba(240, 237, 233, 1)",         // 图表链接和较重边框 - 灰色
          darkgray: "rgba(109, 106, 103, 1)",     // 正文文本 - 深灰色
          dark: "rgba(58, 56, 54, 1)",            // 标题文本和图标 - 近黑色
          secondary: "rgba(196, 93, 101, 1)",     // 链接颜色、当前图表节点 - 深红色
          tertiary: "rgba(95, 174, 183, 1)",      // 悬停状态和已访问图表节点 - 青色
          highlight: "rgba(245, 227, 214, 1)",    // 内部链接背景、高亮文本、代码高亮行 - 浅褐色
          textHighlight: "rgba(168, 216, 224, 1)",// Markdown高亮文本背景 - 浅蓝色
        },
        darkMode: {
          // 深色模式配色方案
          light: "rgba(37, 42, 53, 1)",           // 页面背景色 - 深石板灰
          lightgray: "rgba(60, 65, 77, 1)",       // 边框颜色 - 灰蓝色
          gray: "rgba(52, 58, 71, 1)",            // 图表链接和较重边框 - 深灰色
          darkgray: "rgba(197, 201, 209, 1)",     // 正文文本 - 浅灰色
          dark: "rgba(230, 233, 239, 1)",         // 标题文本和图标 - 近白色
          secondary: "rgba(110, 130, 150, 1)",    // 链接颜色、当前图表节点 - 深蓝色
          tertiary: "rgba(217, 122, 115, 1)",     // 悬停状态和已访问图表节点 - 橙红色
          highlight: "rgba(74, 93, 122, 1)",      // 内部链接背景、高亮文本、代码高亮行 - 深蓝色
          textHighlight: "rgba(255, 217, 201, 1)",// Markdown高亮文本背景 - 浅橙色
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config

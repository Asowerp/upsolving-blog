import { defineConfig } from 'vitepress'
import Sidebar from 'vitepress-plugin-sidebar-resolve'
import mathjax3 from 'markdown-it-mathjax3'

// MathJax 生成的自定义标签列表，需要让 Vue 识别
const mathjaxCustomElements = [
  'mjx-container', 'mjx-assistive-mml', 'math', 'maction', 'maligngroup',
  'malignmark', 'menclose', 'merror', 'mfenced', 'mfrac', 'mi', 'mlongdiv',
  'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot',
  'mrow', 'ms', 'mscarries', 'mscarry', 'msgroup', 'msline', 'msrow',
  'mspace', 'msqrt', 'mstack', 'mstyle', 'msub', 'msup', 'msubsup',
  'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover', 'semantics',
  'annotation', 'annotation-xml'
]

// https://vitepress.dev/reference/site-config
export default defineConfig({
  vite: {
    // 只需添加这行，插件就会自动扫描并生成侧边栏
    plugins: [Sidebar({titleFormMd: true})],
  },
  title: "Upsolving Blog",
  description: "A VitePress Site",
  base: '/upsolving-blog/',  // 设置基础路径，确保部署在 GitHub Pages 上时资源路径正确
  markdown: {
    config: (md) => {
      md.use(mathjax3)  // 使用 mathjax3 插件
    },
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => mathjaxCustomElements.includes(tag),
      },
    },
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'AtCoder', link: '/atcoder/' },
      { text: 'LeetCode', link: '/leetcode/' },
      { text: 'Codeforces', link: '/codeforces/' },
      { text: '日常做题', link: '/daily/' }

    ],

    // sidebar: [
    //   {
    //     text: 'Examples',
    //     items: [
    //       { text: 'Markdown Examples', link: '/markdown-examples' },
    //       { text: 'Runtime API Examples', link: '/api-examples' }
    //     ]
    //   }
    // ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})

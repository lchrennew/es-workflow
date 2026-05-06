import { marked } from 'marked'
import Prism from 'prismjs'
import 'prismjs/themes/prism.css'
import { markedHighlight } from "marked-highlight";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { mangle } from "marked-mangle";

marked.use(markedHighlight({
    highlight(code, lang) {
        const language = Prism.languages[lang]
        return language ? Prism.highlight(code, language, lang) : code
    }
}))
marked.use(gfmHeadingId({ prefix: 'md-' }))
marked.use(mangle())
marked.use({
    renderer: {
        heading: (text, level) => {
            const escapedText = text;

            return `
            <h${ level } class="md-heading">
              <a name="${ escapedText }" class="md-heading-anchor" title="${ text }" href="#${ escapedText }" data-level="${ level }">
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z"></path></svg>
              </a>
              ${ text }
            </h${ level }>`;
        }
    }
})
marked.setOptions({
    async: true,
    breaks: true,
    gfm: true,
})
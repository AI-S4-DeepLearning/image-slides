// ./setup/monaco.ts
import { defineMonacoSetup } from '@slidev/types'
import '../slidev-theme-hu/styles/code.css';

export default defineMonacoSetup(() => {
  return {
    editorOptions: {
      fontSize: '16px',
      fontWeight: '500',
      lineHeight: '18px',
      lineNumbers: 'on',
      wordWrap: 'on',  // ✅ Enable word wrapping
      fontLigatures: true,
      renderLineHighlightOnlyWhenFocus: true,
      fontVariations: 'normal',
      showFoldingControls: 'never',
      guides: {
        indentation: false,
      },
      lineDecorationsWidth: false,
      matchBrackets: 'near',
      columnSelection: false,
      wrappingIndent: 'same'  // ✅ Align wrapped lines correctly
    },
  }
})
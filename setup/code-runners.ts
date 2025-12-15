import { defineCodeRunnersSetup } from '@slidev/types'
import Convert from 'ansi-to-html'

const convert = new Convert({
  colors: [
    '#333333', '#C4265E', '#86B42B', '#B3B42B', '#6A7EC8', '#8C6BC8', '#56ADBC', '#E3E3DD',
    '#666666', '#F92672', '#A6E22E', '#E2E22E', '#819AFF', '#AE81FF', '#66D9EF', '#F8F8F2',
  ]
})
export default defineCodeRunnersSetup(() => {
  return {
    cpp: async (code: string, ctx) => {
      return await runGodbolt(code, ctx, 'clang_trunk', 'c++');
    },
    python: async (code: string, ctx) => {
      return await runGodbolt(code, ctx, 'python313', 'python');
    }
  };
});

async function runGodbolt(code, ctx, compilerId, lang) {
  const userArguments = (ctx.options.userArguments as string) || "";

  const payload = {
    source: code,
    compiler: compilerId,
    options: {
      userArguments,
      compilerOptions: { executorRequest: true },
      filters: { execute: true }
    },
    lang: lang,
    allowStoreCodeDebug: false
  };

  try {
    const response = await fetch(`https://godbolt.org/api/compiler/${compilerId}/compile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return { text: `Error: ${response.status} ${response.statusText}` };
    }

    const result = await response.json();
    const buildResult = result.buildResult?.code ? result.buildResult : result;

    const stdout = Array.isArray(buildResult.stdout)
      ? buildResult.stdout.map((line) => line.text).join("\n")
      : "";
    const stderr = Array.isArray(buildResult.stderr)
      ? buildResult.stderr.map((line) => line.text).join("\n")
      : "";

    let output = buildResult.code !== 0
      ? `Build failed, return code: ${buildResult.code}\n` + stdout + (stderr ? "\n" + stderr : "")
      : stdout + (stderr ? "\n" + stderr : "");

    return { html: `<pre>${output}</pre>` };
  } catch (error) {
    return { text: `Error: ${error.message || error}` };
  }
}

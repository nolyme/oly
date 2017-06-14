// tslint:disable
declare const Prism: any;

Prism.languages.typescript = Prism.languages.extend("javascript", {
  keyword: /(?:^|[^.])\b(break|async|await|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|false|finally|for|from|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|set|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield|module|declare|constructor|string|Function|any|number|boolean|Array)\b/, // tslint:disable-line
  class: /class\s([A-Z][a-z]+)/,
});
Prism.languages.ts = Prism.languages.typescript;
Prism.languages.insertBefore("typescript", "function", {
  annotation: {
    alias: "punctuation",
    pattern: /(^|[^.])@\w+/,
    lookbehind: true,
  },
});

(function (Prism) {

  const typescript = Prism.util.clone(Prism.languages.typescript);

  Prism.languages.ts = Prism.languages.extend('markup', typescript);
  Prism.languages.ts.tag.pattern = /\B<\/?[\w\.:-]+\s*(?:\s+[\w\.:-]+(?:=(?:("|')(\\?[\w\W])*?\1|[^\s'">=]+|(\{[\w\W]*?\})))?\s*)*\/?>/i;
  Prism.languages.ts.tag.inside['attr-value'].pattern = /=[^\{](?:('|")[\w\W]*?(\1)|[^\s>]+)/i;

  let tsxExpression = Prism.util.clone(Prism.languages.ts);

  delete tsxExpression.punctuation;

  tsxExpression = Prism.languages.insertBefore('ts', 'operator', {
    'punctuation': /=(?={)|[{}[\];(),.:]/,
  }, {ts: tsxExpression});

  Prism.languages.insertBefore('inside', 'attr-value', {
    'script': {
      // Allow for one level of nesting
      pattern: /=(\{(?:\{[^}]*\}|[^}])+\})/i,
      inside: tsxExpression,
      'alias': 'language-typescript',
    },
  }, Prism.languages.ts.tag);

}(Prism));

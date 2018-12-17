// import {
//   lineCount,
//   generateSourceMap,
//   encodeLineMappings,
//   SourceMappableSyntax,
// } from './sourcemaps.mjs'; // summarizeLineMappings,

// const preserveLines = true;

// const {log, warn, error} = console;

// export const MarkoutBlocks = /(^|.*?\n|)(?:([`~]){3,}js module *\n)(.*?)\2{3,}.*?(\n|$)|.*?\n/gsu;

// export const unfence = (
//   markout,
//   {sourceURL, source, file, hash, syntax = 'js'} = {},
// ) => {
//   let sourceLine = 0,
//     sourceFile = 0,
//     sourceColumn = 0,
//     mappedLine = 0,
//     mappedColumn = 0;
//   const sourceLines = lineCount(markout);
//   const lineMappings = Array(sourceLines).fill([]);
//   // const unfenced = `${markout || ''}`.replace(MarkoutBlocks, '$3');

//   const matcher =
//     (!hash && syntax === 'js' && MarkoutBlocks) ||
//     new RegExp(
//       MarkoutBlocks.source.replace(
//         'js module',
//         `${syntax} module${
//           hash ? `=(?:"${hash.slice(1)}"|'${hash.slice(1)}'|)` : ''
//         }`,
//       ),
//       MarkoutBlocks.flags,
//     );

//   // log({ matcher, syntax, hash });
//   // `js module="${hash.slice(1)}"`;

//   let unfenced = `${markout || ''}`.replace(matcher, (m, a, f, b, d) => {
//     const matchLines = lineCount(m);
//     if (b) {
//       if (preserveLines) {
//         const blankLines = lineCount(a) + 1; // + (sourceLine - mappedLine);
//         const blockLines = lineCount(b);

//         b = `${'\n'.repeat(blankLines)}${b}`;

//         for (let n = blockLines, line = sourceLine + blankLines; n--; )
//           lineMappings[(mappedLine = line)] = [
//             [mappedColumn, sourceFile, line++, sourceColumn],
//           ];

//         d && ((b = `${b}\n`), mappedLine++);
//       } else {
//         for (let n = lineCount(b), line = sourceLine + lineCount(a) + 1; n--; )
//           lineMappings[mappedLine++] = [
//             [mappedColumn, sourceFile, line++, sourceColumn],
//           ];
//       }
//     } else if (matchLines && preserveLines) {
//       b = `${'\n'.repeat(matchLines)}`;
//       mappedLine += matchLines;
//     }
//     matchLines && (sourceLine += matchLines);
//     return b || '';
//   });

//   lineMappings.splice(mappedLine, lineMappings.length);

//   if (sourceURL && SourceMappableSyntax.test(syntax)) {
//     unfenced = `${unfenced}\n\n/*# sourceURL=${sourceURL} */`;
//     if (lineMappings.length) {
//       // log(summarizeLineMappings(lineMappings));
//       const mappings = encodeLineMappings(lineMappings);
//       const sourceMappings = generateSourceMap({
//         mappings,
//         file,
//         sources: [source],
//       });
//       unfenced = `${unfenced}\n/*# sourceMappingURL=data:application/json;base64,${Buffer.from(
//         sourceMappings,
//       ).toString('base64')}*/\n`;
//     }
//   }

//   return unfenced;
// };

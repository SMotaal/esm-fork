# Meta

<details open><summary><b>181215 guy's input</b>

_Scope_

- [ ] Would be independent from (but portable to) node's infrastructure

_Cases_

<samp>

| Case               | Description                              | ❕  |
| ------------------ | ---------------------------------------- | --- |
| `pj-none`          | No "package.json"                        | ❓  |
| `pj-unspecified`   | No "main" or "exports" in "package.json" | ❗️ |
| `pj-main-cjs`      | Package "main" is "main.js"              | ⭐️ |
| `pj-main-mjs`      | Package "main" is "main.mjs"             | ⁉️  |
| `pj-main-auto`     | Package "main" is "main"                 | ⁉️  |
| `pj-exports-empty` | Package "exports" is {}                  | 🌟  |
| `pj-exports-esm`   | Package "exports" is { "./": "esm.js" }  | 🌟  |

</samp>

</summary>

> I will take the weekend to put together a scaffold repository of examples.
>
> > an examples repo would be of a lot of use, so that when we discuss cases we can all be clear
> >
> > a repo of numbered folders each with a different case
> >
> > eg no package.json, with a package.json, with a commonjs main, with exports, and different require cases
> >
> > so far we've brought up:
> >
> > - loading '.js' without a package.json where it is expected to be CJS
> > - loading `node dist` where dist/index.js is supposed to exist
> > - a package that does not have "exports" but contains ".mjs" files that you want to run
> >
> > as problematic scenarios it wold be good to have examples for
> >
> > Then of course the variations that do work well as mentioned above
> > also useful to have failing cases:
> >
> > - what happens when the package.json has invalid JSON in the app
> > - what happens when the package.json is missing or invalid in node_modules/dep/
> > - what happens when the "exports" value is invalid
> > - what happens when the "exports" main doesnt exist
> >   etc etc
> > - loading an unknown file extension
> > - loading an unknown file extension i a CommonJS package vs no package.json vs an ESM package

> So I'm thinking of this as entirely isolated from node's testing infrastructure and frankly I want this to evolve with pending browser specs, agree?
>
> > I think it would be useful to go along with this spec work specifically, as a simple test harness running `node example-x/entry.js` and verifying the runtime behaviour
> >
> > then we have something to point to for discussion cases as well
> >
> > I mean the implementation does need tests
> >
> > so you could even help flesh out the direct tests too if you like
> >
> > but not pressure
>
> yes, I was planning to make it reasonable to port into node's tests by refining them once we have something to work with
>
> I just don't want to get distracted with infrastructure or let it cap my imagination at first

</details>

# Test tools with fixtures

> Write JSON fixtures for your tools, run them locally with caplo tool test and on Caplo with --remote, and gate project publishes on them.

A fixture is one tool call and what you expect back. Fixtures live in your package as JSON files, run the same way on your machine and on Caplo, and stop a project publish when they fail.

## Write a fixture

Each file in `tests/` (or the glob `tests` sets in `caplo.yaml`) holds one fixture:

```json
{
  "name": "looks up a shipped order",
  "tool": "get_order",
  "arguments": { "orderId": "SO-1002" },
  "secrets": { "SHOP_API_KEY": "test-key" },
  "expect": {
    "isError": false,
    "structuredContent": { "orderId": "SO-1002", "status": "shipped" },
    "textIncludes": "shipped"
  }
}
```

| Field       | Required | Notes                                                                           |
| ----------- | -------- | ------------------------------------------------------------------------------- |
| `name`      | No       | A label for the output.                                                         |
| `tool`      | Yes      | The tool name as the package lists it, such as `get_order`, not the model name. |
| `arguments` | Yes      | The call’s arguments, an object.                                                |
| `secrets`   | No       | Test values for declared secrets, by name.                                      |
| `expect`    | Yes      | At least one of the checks below.                                               |

| Check               | Passes when                                                                                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isError`           | The result’s error flag equals it. Use `true` to test a refusal, such as an unknown order.                                                                                 |
| `structuredContent` | Every listed property equals the result’s property of that name. Values are compared exactly, including nested objects and arrays; properties you do not list are ignored. |
| `textIncludes`      | The result’s text content contains this string.                                                                                                                            |

The full schema is in the [fixture reference](/reference/fixtures/).

Caution

Fixtures are source files you push and often commit. Put test credentials in `secrets`, never production ones. Live calls never use fixture secrets.

Tips:

* Write one fixture per behaviour that matters: a normal result, an empty result, an invalid input your API rejects.
* Keep expectations to the properties you care about, so harmless additions to the result do not break the test.
* If a tool calls a live API, point fixtures at a test account or sandbox whose data does not change.

## Run fixtures locally

```sh
caplo tool test
```

`caplo tool test` bundles the package with the builder’s exact settings, loads it from an empty directory with no environment variables, checks `caplo.yaml` against the tools the code lists, and runs each fixture in Node 24 with the tool’s timeout. Run `npm install` first.

```txt
bundle 8.1 KB (5be0c2d41a7e, esbuild 0.28.2)
tool order_lookup__get_order (read, 5s)
capabilities subject-context/1 effect-outcome/1 operation-status/1
server advertises subject-context/1 effect-outcome/1
ok   tests/get-order.json (looks up a shipped order)
FAIL tests/unknown-order.json (refuses an unknown order)
  expected isError true, got false
1 passed, 1 failed
```

* Log lines are printed for failing fixtures; add `-v` to print them for passing ones too.
* The command exits with code 3 when a fixture fails, so CI can gate on it.
* Local tests use your machine’s network and do not enforce the `egress` list.
* Local tests run every fixture, **including write tools**, for real. Point write fixtures at a test environment, or leave writes to `--remote`, which skips them.
* It needs Node 24 exactly, on macOS or Linux (on Windows, use WSL).

## Run fixtures on Caplo

```sh
caplo tool test --remote
```

`--remote` pushes the folder as the package’s workspace draft and builds it, like `caplo tool push`, then runs the fixtures on Caplo, which runs packages the same way as live calls:

* The `egress` list is enforced. A refused host is printed under the fixture as `egress denied <host>: <reason>`.
* Fixtures for write tools are skipped and reported as `skip ... (write_effect)`.
* Each result shows its execution time, and `cold` when the package had to load first.
* Fixture `secrets` are used; workspace secret values are not.

Run `--remote` before you publish to catch a missing egress host or a dependency that behaves differently in the build. The build on Caplo is the one that gets published, and it installs strictly from your lockfile.

In Tool Studio, **Run Fixture Tests** in the **Tools** view does the same for the latest build.

## Fixtures in projects

In a [project](/cli/projects/), `caplo test` runs the selected packages’ fixtures locally, like `caplo tool test`. `caplo publish` goes further: for each package it publishes, it pushes, builds and runs the fixtures on Caplo, and stops the publish if any fixture fails. Agents that use the package are not published either.

```sh
caplo test tool/orders
caplo publish tool/orders
```

## Let an AI agent write fixtures

AI prompt

Write fixtures for my Caplo tool package

Adds JSON fixtures that cover each tool's normal and error behaviour, and runs them locally and on Caplo.

[Open in Claude](https://claude.ai/new?q=Goal%3A%20give%20the%20Caplo%20tool%20package%20in%20%60%3CPACKAGE_DIR%3E%60%20a%20useful%20set%20of%20fixtures%2C%20one%20JSON%20file%20per%20call%2C%20so%20%60caplo%20tool%20test%60%20catches%20regressions%20before%20a%20version%20is%20published.%0A%0ARead%20these%20pages%20first%3A%0A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Ftools%2Ftesting.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Freference%2Ffixtures.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Ftools%2Fdefine-tool-and-context.md%0A%0ASteps%3A%0A%0A1.%20Read%20%60caplo.yaml%60%20\(its%20%60tools%60%20list%20or%2C%20for%20a%20function%20package%2C%20its%20top-level%20policy%2C%20and%20its%20%60tests%60%20glob%2C%20default%20%60tests%2F*.json%60\)%20and%20the%20source%20of%20each%20tool.%20Note%20each%20tool's%20%60effect%60%2C%20its%20input%20schema%20and%20what%20it%20returns%20in%20%60structuredContent%60%20and%20text.%0A2.%20For%20each%20tool%2C%20plan%20fixtures%20for%3A%0A%20%20%20-%20a%20normal%20call%20with%20realistic%20arguments%3B%0A%20%20%20-%20an%20edge%20case%2C%20such%20as%20an%20empty%20result%20or%20the%20largest%20allowed%20input%3B%0A%20%20%20-%20an%20expected%20error%2C%20such%20as%20an%20unknown%20ID%2C%20with%20%60%22expect%22%3A%20%7B%20%22isError%22%3A%20true%20%7D%60.%0A%20%20%20Show%20me%20the%20plan%20before%20writing%20files.%0A3.%20Write%20each%20fixture%20as%20its%20own%20file%20in%20the%20tests%20folder%2C%20named%20after%20the%20tool%20and%20case%20\(for%20example%20%60tests%2Fget_order-shipped.json%60\)%3A%0A%0A%20%20%20%60%60%60json%0A%20%20%20%7B%0A%20%20%20%20%20%22name%22%3A%20%22%3CWHAT_THIS_CASE_CHECKS%3E%22%2C%0A%20%20%20%20%20%22tool%22%3A%20%22%3CTOOL_NAME%3E%22%2C%0A%20%20%20%20%20%22arguments%22%3A%20%7B%20%7D%2C%0A%20%20%20%20%20%22expect%22%3A%20%7B%20%22structuredContent%22%3A%20%7B%20%7D%2C%20%22textIncludes%22%3A%20%22%3CTEXT%3E%22%20%7D%0A%20%20%20%7D%0A%20%20%20%60%60%60%0A%0A%20%20%20%60tool%60%20is%20the%20tool%20name%20the%20package%20lists%2C%20not%20the%20%60%3Cpackage%3E__%3Ctool%3E%60%20model%20name.%20In%20%60structuredContent%60%2C%20list%20only%20the%20properties%20that%20matter%3B%20listed%20values%20must%20match%20exactly%2C%20unlisted%20ones%20are%20ignored.%20Every%20fixture%20needs%20at%20least%20one%20expectation.%0A4.%20If%20a%20tool%20reads%20secrets%2C%20the%20fixture%20needs%20%60secrets%60%20with%20test%20values.%20Use%20only%20values%20I%20give%20you%20for%20a%20test%20or%20sandbox%20environment%3B%20if%20I%20have%20none%2C%20ask%20me%20how%20to%20proceed.%0A5.%20If%20the%20package%20has%20write%20tools%2C%20warn%20me%20that%20%60caplo%20tool%20test%60%20runs%20write%20fixtures%20for%20real%20on%20my%20machine.%20Write%20them%20only%20against%20a%20test%20environment%20I%20confirm%3B%20%60caplo%20tool%20test%20--remote%60%20skips%20them.%0A6.%20Run%20the%20fixtures%20and%20fix%20the%20fixtures%20\(not%20the%20tool\)%20until%20they%20reflect%20the%20tool's%20real%2C%20correct%20behaviour.%20If%20a%20fixture%20reveals%20a%20bug%20in%20the%20tool%2C%20report%20it%20instead%20of%20weakening%20the%20expectation.%0A%0A%20%20%20%60%60%60sh%0A%20%20%20cd%20%3CPACKAGE_DIR%3E%0A%20%20%20caplo%20tool%20test%20-v%0A%20%20%20%60%60%60%0A%0A7.%20Ask%20me%20before%20running%20%60caplo%20tool%20test%20--remote%60%2C%20which%20pushes%20the%20package%20as%20the%20workspace%20draft%2C%20builds%20it%20and%20runs%20the%20read%20fixtures%20on%20Caplo%20with%20the%20egress%20list%20enforced.%0A%0AVerify%3A%20%60caplo%20tool%20test%60%20prints%20%60ok%60%20for%20every%20fixture%20and%20exits%200%3B%20with%20%60--remote%60%2C%20there%20are%20no%20failures%20and%20no%20%60egress%20denied%60%20lines.%0A%0ARules%3A%0A%0A-%20Never%20put%20production%20credentials%2C%20real%20customer%20data%20or%20secret%20values%20in%20fixtures%20or%20in%20this%20chat.%0A-%20Do%20not%20run%20%60caplo%20tool%20push%60%2C%20%60caplo%20tool%20publish%60%20or%20%60caplo%20publish%60%20without%20my%20approval.%0A-%20Use%20Node%2024%3B%20check%20with%20%60node%20--version%60%20and%20run%20%60npm%20install%60%20first%20if%20%60node_modules%60%20is%20missing.)[Open in ChatGPT](https://chatgpt.com/?q=Goal%3A%20give%20the%20Caplo%20tool%20package%20in%20%60%3CPACKAGE_DIR%3E%60%20a%20useful%20set%20of%20fixtures%2C%20one%20JSON%20file%20per%20call%2C%20so%20%60caplo%20tool%20test%60%20catches%20regressions%20before%20a%20version%20is%20published.%0A%0ARead%20these%20pages%20first%3A%0A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Ftools%2Ftesting.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Freference%2Ffixtures.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Ftools%2Fdefine-tool-and-context.md%0A%0ASteps%3A%0A%0A1.%20Read%20%60caplo.yaml%60%20\(its%20%60tools%60%20list%20or%2C%20for%20a%20function%20package%2C%20its%20top-level%20policy%2C%20and%20its%20%60tests%60%20glob%2C%20default%20%60tests%2F*.json%60\)%20and%20the%20source%20of%20each%20tool.%20Note%20each%20tool's%20%60effect%60%2C%20its%20input%20schema%20and%20what%20it%20returns%20in%20%60structuredContent%60%20and%20text.%0A2.%20For%20each%20tool%2C%20plan%20fixtures%20for%3A%0A%20%20%20-%20a%20normal%20call%20with%20realistic%20arguments%3B%0A%20%20%20-%20an%20edge%20case%2C%20such%20as%20an%20empty%20result%20or%20the%20largest%20allowed%20input%3B%0A%20%20%20-%20an%20expected%20error%2C%20such%20as%20an%20unknown%20ID%2C%20with%20%60%22expect%22%3A%20%7B%20%22isError%22%3A%20true%20%7D%60.%0A%20%20%20Show%20me%20the%20plan%20before%20writing%20files.%0A3.%20Write%20each%20fixture%20as%20its%20own%20file%20in%20the%20tests%20folder%2C%20named%20after%20the%20tool%20and%20case%20\(for%20example%20%60tests%2Fget_order-shipped.json%60\)%3A%0A%0A%20%20%20%60%60%60json%0A%20%20%20%7B%0A%20%20%20%20%20%22name%22%3A%20%22%3CWHAT_THIS_CASE_CHECKS%3E%22%2C%0A%20%20%20%20%20%22tool%22%3A%20%22%3CTOOL_NAME%3E%22%2C%0A%20%20%20%20%20%22arguments%22%3A%20%7B%20%7D%2C%0A%20%20%20%20%20%22expect%22%3A%20%7B%20%22structuredContent%22%3A%20%7B%20%7D%2C%20%22textIncludes%22%3A%20%22%3CTEXT%3E%22%20%7D%0A%20%20%20%7D%0A%20%20%20%60%60%60%0A%0A%20%20%20%60tool%60%20is%20the%20tool%20name%20the%20package%20lists%2C%20not%20the%20%60%3Cpackage%3E__%3Ctool%3E%60%20model%20name.%20In%20%60structuredContent%60%2C%20list%20only%20the%20properties%20that%20matter%3B%20listed%20values%20must%20match%20exactly%2C%20unlisted%20ones%20are%20ignored.%20Every%20fixture%20needs%20at%20least%20one%20expectation.%0A4.%20If%20a%20tool%20reads%20secrets%2C%20the%20fixture%20needs%20%60secrets%60%20with%20test%20values.%20Use%20only%20values%20I%20give%20you%20for%20a%20test%20or%20sandbox%20environment%3B%20if%20I%20have%20none%2C%20ask%20me%20how%20to%20proceed.%0A5.%20If%20the%20package%20has%20write%20tools%2C%20warn%20me%20that%20%60caplo%20tool%20test%60%20runs%20write%20fixtures%20for%20real%20on%20my%20machine.%20Write%20them%20only%20against%20a%20test%20environment%20I%20confirm%3B%20%60caplo%20tool%20test%20--remote%60%20skips%20them.%0A6.%20Run%20the%20fixtures%20and%20fix%20the%20fixtures%20\(not%20the%20tool\)%20until%20they%20reflect%20the%20tool's%20real%2C%20correct%20behaviour.%20If%20a%20fixture%20reveals%20a%20bug%20in%20the%20tool%2C%20report%20it%20instead%20of%20weakening%20the%20expectation.%0A%0A%20%20%20%60%60%60sh%0A%20%20%20cd%20%3CPACKAGE_DIR%3E%0A%20%20%20caplo%20tool%20test%20-v%0A%20%20%20%60%60%60%0A%0A7.%20Ask%20me%20before%20running%20%60caplo%20tool%20test%20--remote%60%2C%20which%20pushes%20the%20package%20as%20the%20workspace%20draft%2C%20builds%20it%20and%20runs%20the%20read%20fixtures%20on%20Caplo%20with%20the%20egress%20list%20enforced.%0A%0AVerify%3A%20%60caplo%20tool%20test%60%20prints%20%60ok%60%20for%20every%20fixture%20and%20exits%200%3B%20with%20%60--remote%60%2C%20there%20are%20no%20failures%20and%20no%20%60egress%20denied%60%20lines.%0A%0ARules%3A%0A%0A-%20Never%20put%20production%20credentials%2C%20real%20customer%20data%20or%20secret%20values%20in%20fixtures%20or%20in%20this%20chat.%0A-%20Do%20not%20run%20%60caplo%20tool%20push%60%2C%20%60caplo%20tool%20publish%60%20or%20%60caplo%20publish%60%20without%20my%20approval.%0A-%20Use%20Node%2024%3B%20check%20with%20%60node%20--version%60%20and%20run%20%60npm%20install%60%20first%20if%20%60node_modules%60%20is%20missing.)

Show prompt

````
Goal: give the Caplo tool package in `<PACKAGE_DIR>` a useful set of fixtures, one JSON file per call, so `caplo tool test` catches regressions before a version is published.

Read these pages first:

- https://docs.caplo.si/tools/testing.md
- https://docs.caplo.si/reference/fixtures.md
- https://docs.caplo.si/tools/define-tool-and-context.md

Steps:

1. Read `caplo.yaml` (its `tools` list or, for a function package, its top-level policy, and its `tests` glob, default `tests/*.json`) and the source of each tool. Note each tool's `effect`, its input schema and what it returns in `structuredContent` and text.
2. For each tool, plan fixtures for:
   - a normal call with realistic arguments;
   - an edge case, such as an empty result or the largest allowed input;
   - an expected error, such as an unknown ID, with `"expect": { "isError": true }`.
   Show me the plan before writing files.
3. Write each fixture as its own file in the tests folder, named after the tool and case (for example `tests/get_order-shipped.json`):

   ```json
   {
     "name": "<WHAT_THIS_CASE_CHECKS>",
     "tool": "<TOOL_NAME>",
     "arguments": { },
     "expect": { "structuredContent": { }, "textIncludes": "<TEXT>" }
   }
   ```

   `tool` is the tool name the package lists, not the `<package>__<tool>` model name. In `structuredContent`, list only the properties that matter; listed values must match exactly, unlisted ones are ignored. Every fixture needs at least one expectation.
4. If a tool reads secrets, the fixture needs `secrets` with test values. Use only values I give you for a test or sandbox environment; if I have none, ask me how to proceed.
5. If the package has write tools, warn me that `caplo tool test` runs write fixtures for real on my machine. Write them only against a test environment I confirm; `caplo tool test --remote` skips them.
6. Run the fixtures and fix the fixtures (not the tool) until they reflect the tool's real, correct behaviour. If a fixture reveals a bug in the tool, report it instead of weakening the expectation.

   ```sh
   cd <PACKAGE_DIR>
   caplo tool test -v
   ```

7. Ask me before running `caplo tool test --remote`, which pushes the package as the workspace draft, builds it and runs the read fixtures on Caplo with the egress list enforced.

Verify: `caplo tool test` prints `ok` for every fixture and exits 0; with `--remote`, there are no failures and no `egress denied` lines.

Rules:

- Never put production credentials, real customer data or secret values in fixtures or in this chat.
- Do not run `caplo tool push`, `caplo tool publish` or `caplo publish` without my approval.
- Use Node 24; check with `node --version` and run `npm install` first if `node_modules` is missing.
````

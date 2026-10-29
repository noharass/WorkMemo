# 网页优化完整源码清单与代码

日期：2026-10-29（Asia/Shanghai）。说明与全部文档、截图路径见 [WEB-UI-UPDATE.md](WEB-UI-UPDATE.md)。以下包含本次全部程序、依赖锁定和测试脚本的完整内容，不省略代码；第三方许可完整内容单独保存在 E:\WorkMemo\docs\THIRD-PARTY-LICENSES.txt。

| 状态 | 完整路径 | SHA256 |
| --- | --- | --- |
| UPDATE | E:\WorkMemo\package.json | 572cb366addfc5c5559e4a177a7bb6e98397d28f1b6329b05be2cda47e478eef |
| UPDATE | E:\WorkMemo\package-lock.json | c8fc8ed7e0e8c87b56f6bfe4f46f3b951c0c286bc85e8343915a33c62fd717d0 |
| UPDATE | E:\WorkMemo\src\Dashboard.tsx | 2683c68f9bd0a95ff5acfbf21fd8f7d9b2f9f511c201187754bdc390ebb5a848 |
| UPDATE | E:\WorkMemo\src\Dashboard.css | a99b517e56b72c03ccc8d3fb3da1a7b174f119e13bae7b9722abdba4ef6c0c60 |
| NEW FILE | E:\WorkMemo\src\ui\UiProvider.tsx | 5fed9b3cc34187abf156a42f754158d7409ad7c685f302c07be7f95da1f88856 |
| NEW FILE | E:\WorkMemo\src\ui\BottomSheet.tsx | 2f5b4be2b832e9f4274cdf4174e4654a82497190f69fc4a47bbe7a8f7f9ee8c0 |
| NEW FILE | E:\WorkMemo\src\dashboard\api.ts | 1f05c94f3a6bbda879ecbbe17a85c5b1b249e412072e282f4a3c6f45a42d0a86 |
| NEW FILE | E:\WorkMemo\src\dashboard\useDashboardData.ts | 008fee63d7e1f0a5dd9bb5226cf4b39f1317d88ab7b5188a53f5c68fd69ca3b2 |
| NEW FILE | E:\WorkMemo\src\dashboard\Charts.tsx | a50c5b86b388634060729fa9987331c7bc4ea7cee6a000f06b278964a22ae833 |
| NEW FILE | E:\WorkMemo\scripts\dashboard-fixture.mjs | 682da7f6e7144179991a3700a056aa8e1d310206c3852abf5296c83e8fb1b620 |
| NEW FILE | E:\WorkMemo\scripts\verify-web-ui.mjs | 24c93625b44ac25f053e892ddf86db7d2fe315095fd5527b62cf10d6c1d03206 |
| UPDATE | E:\WorkMemo\scripts\verify-ui-022.mjs | 98bf5487d2f46e77b44adb0204e0d518bb7baf3a4398af02c989f1a2d4454895 |
| UPDATE | E:\WorkMemo\scripts\verify-v023-phase1.mjs | 3d95bb70996d0104e88cae67c10335dc8badf978aeb7a92f36ae1fa933f1e0ce |

## E:\WorkMemo\package.json

```json
{
  "name": "workmemo",
  "private": true,
  "version": "0.2.3",
  "type": "module",
  "engines": {
    "node": ">=24 <25"
  },
  "scripts": {
    "dev": "vite",
    "bridge:dev": "cargo build --locked --manifest-path src-tauri/Cargo.toml --bin workmemo-browser && node scripts/stage-browser-resources.mjs --debug",
    "build": "tsc --noEmit && vite build",
    "typecheck": "tsc --noEmit",
    "test:themes": "node --test tests/themes.test.mjs",
    "test:workflow": "node --test tests/workflow.test.mjs",
    "test:history": "node --test tests/history.test.mjs",
    "test": "node --test tests/*.test.mjs",
    "test:web": "node scripts/verify-web-ui.mjs",
    "icons": "node scripts/prepare-icon.mjs",
    "preview": "vite preview",
    "tauri": "tauri"
  },
  "dependencies": {
    "@ant-design/icons": "^6.3.4",
    "@ant-design/icons-svg": "^4.6.0",
    "@tauri-apps/api": "^2",
    "antd": "6.6.8",
    "dayjs": "1.11.13",
    "echarts": "6.1.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "@tauri-apps/cli": "^2",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^6.0.2",
    "tailwindcss": "^4.3.3",
    "typescript": "~6.0.3",
    "vite": "^8.0.16"
  }
}
```

## E:\WorkMemo\package-lock.json

```json
{
  "name": "workmemo",
  "version": "0.2.3",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "workmemo",
      "version": "0.2.3",
      "dependencies": {
        "@ant-design/icons": "^6.3.4",
        "@ant-design/icons-svg": "^4.6.0",
        "@tauri-apps/api": "^2",
        "antd": "6.6.8",
        "dayjs": "1.11.13",
        "echarts": "6.1.0",
        "react": "^19.1.0",
        "react-dom": "^19.1.0"
      },
      "devDependencies": {
        "@tailwindcss/vite": "^4.3.3",
        "@tauri-apps/cli": "^2",
        "@types/react": "^19.1.8",
        "@types/react-dom": "^19.1.6",
        "@vitejs/plugin-react": "^6.0.2",
        "tailwindcss": "^4.3.3",
        "typescript": "~6.0.3",
        "vite": "^8.0.16"
      },
      "engines": {
        "node": ">=24 <25"
      }
    },
    "node_modules/@ant-design/colors": {
      "version": "8.0.1",
      "resolved": "https://registry.npmjs.org/@ant-design/colors/-/colors-8.0.1.tgz",
      "integrity": "sha512-foPVl0+SWIslGUtD/xBr1p9U4AKzPhNYEseXYRRo5QSzGACYZrQbe11AYJbYfAWnWSpGBx6JjBmSeugUsD9vqQ==",
      "license": "MIT",
      "dependencies": {
        "@ant-design/fast-color": "^3.0.0"
      }
    },
    "node_modules/@ant-design/cssinjs": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/@ant-design/cssinjs/-/cssinjs-2.1.2.tgz",
      "integrity": "sha512-2Hy8BnCEH31xPeSLbhhB2ctCPXE2ZnASdi+KbSeS79BNbUhL9hAEe20SkUk+BR8aKTmqb6+FKFruk7w8z0VoRQ==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.11.1",
        "@emotion/hash": "^0.8.0",
        "@emotion/unitless": "^0.7.5",
        "@rc-component/util": "^1.4.0",
        "clsx": "^2.1.1",
        "csstype": "^3.1.3",
        "stylis": "^4.3.4"
      },
      "peerDependencies": {
        "react": ">=16.0.0",
        "react-dom": ">=16.0.0"
      }
    },
    "node_modules/@ant-design/cssinjs-utils": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/@ant-design/cssinjs-utils/-/cssinjs-utils-2.1.2.tgz",
      "integrity": "sha512-5fTHQ158jJJ5dC/ECeyIdZUzKxE/mpEMRZxthyG1sw/AKRHKgJBg00Yi6ACVXgycdje7KahRNvNET/uBccwCnA==",
      "license": "MIT",
      "dependencies": {
        "@ant-design/cssinjs": "^2.1.2",
        "@babel/runtime": "^7.23.2",
        "@rc-component/util": "^1.4.0"
      },
      "peerDependencies": {
        "react": ">=18",
        "react-dom": ">=18"
      }
    },
    "node_modules/@ant-design/fast-color": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/@ant-design/fast-color/-/fast-color-3.0.1.tgz",
      "integrity": "sha512-esKJegpW4nckh0o6kV3Tkb7NPIZYbPnnFxmQDUmL08ukXZAvV85TZBr70eGuke/CIArLaP6aw8lt9KILjnWuOw==",
      "license": "MIT",
      "engines": {
        "node": ">=8.x"
      }
    },
    "node_modules/@ant-design/icons": {
      "version": "6.3.4",
      "resolved": "https://registry.npmjs.org/@ant-design/icons/-/icons-6.3.4.tgz",
      "integrity": "sha512-kDoUlppczVyCUTFthF6cHmPzMBYqNZQhu9j6EyIX/YIdM9j9CZNZoJUjzVw7/1v1VO8WwVMmPp15r/uwIAS0AQ==",
      "license": "MIT",
      "dependencies": {
        "@ant-design/colors": "^8.0.1",
        "@ant-design/icons-svg": "^4.6.0",
        "@rc-component/util": "^1.11.0",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8"
      },
      "peerDependencies": {
        "react": ">=16.0.0",
        "react-dom": ">=16.0.0"
      }
    },
    "node_modules/@ant-design/icons-svg": {
      "version": "4.6.0",
      "resolved": "https://registry.npmjs.org/@ant-design/icons-svg/-/icons-svg-4.6.0.tgz",
      "integrity": "sha512-PRomU725ABMf/lnQp5HiB7my1kjEbFY0D10N4lXYxK6TIB1gKjIVD5MRThpDaezLgw1D774J8eOeeDB0M6wHrQ==",
      "license": "MIT"
    },
    "node_modules/@ant-design/react-slick": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/@ant-design/react-slick/-/react-slick-2.0.0.tgz",
      "integrity": "sha512-HMS9sRoEmZey8LsE/Yo6+klhlzU12PisjrVcydW3So7RdklyEd2qehyU6a7Yp+OYN72mgsYs3NFCyP2lCPFVqg==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.28.4",
        "clsx": "^2.1.1",
        "json2mq": "^0.2.0",
        "throttle-debounce": "^5.0.0"
      },
      "peerDependencies": {
        "react": "^0.14.0 || ^15.0.1 || ^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",
        "react-dom": "^0.14.0 || ^15.0.1 || ^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/@babel/runtime": {
      "version": "7.29.10",
      "resolved": "https://registry.npmjs.org/@babel/runtime/-/runtime-7.29.10.tgz",
      "integrity": "sha512-NpugTzbKgGrNe45Ui32cN8vCFFMxVtP/9rtfwv0nP5FRDAjvYBxJcLVpYA9mr1jxP6cnIT7x9LUzuDTbWYYNRA==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@emotion/hash": {
      "version": "0.8.0",
      "resolved": "https://registry.npmjs.org/@emotion/hash/-/hash-0.8.0.tgz",
      "integrity": "sha512-kBJtf7PH6aWwZ6fka3zQ0p6SBYzx4fl1LoZXE2RrnYST9Xljm7WfKJrU4g/Xr3Beg72MLrp1AWNUmuYJTL7Cow==",
      "license": "MIT"
    },
    "node_modules/@emotion/unitless": {
      "version": "0.7.5",
      "resolved": "https://registry.npmjs.org/@emotion/unitless/-/unitless-0.7.5.tgz",
      "integrity": "sha512-OWORNpfjMsSSUBVrRBVGECkhWcULOAJz9ZW8uK9qgxD+87M7jHRcvh/A96XXNhXTLmKcoYSQtBEX7lHMO7YRwg==",
      "license": "MIT"
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.13",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz",
      "integrity": "sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.0",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/remapping": {
      "version": "2.3.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/remapping/-/remapping-2.3.5.tgz",
      "integrity": "sha512-LI9u/+laYG4Ds1TDKSJW2YPrIlcVYOwi2fUC6xB43lueCjgxV4lffOCZCtYFiH6TNOX+tQKXx97T4IKHbhyHEQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.5",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.6.0.tgz",
      "integrity": "sha512-T7jf+5zgsZHwNJ4lvQ7/aezbyk0nNX+zJVWpmHA7VYsEx7a7qr5Rg5IbtJFqkgze5Y2sruq1RUY8Q837Od7iFw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.31",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz",
      "integrity": "sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@oxc-project/types": {
      "version": "0.155.0",
      "resolved": "https://registry.npmjs.org/@oxc-project/types/-/types-0.155.0.tgz",
      "integrity": "sha512-SeE8JPwW1xs1tHeNycjUtUBdhorRa8o4jlvjwk49R7/Z291i+4DQa7JJIgOm/TaYQZx+QrPQbVJ/9c8dMIZN8Q==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/oxc-project"
      }
    },
    "node_modules/@rc-component/async-validator": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/@rc-component/async-validator/-/async-validator-6.0.0.tgz",
      "integrity": "sha512-D3AGQwdyE58gmvx6waVSXJ80JGO+IY5L2O8HDnSOex7JNlzB3GuN/4hyHNTdhy2qtOhkpbIjmeAN3tL993wKbA==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.24.4"
      },
      "engines": {
        "node": ">=14.x"
      }
    },
    "node_modules/@rc-component/cascader": {
      "version": "1.22.0",
      "resolved": "https://registry.npmjs.org/@rc-component/cascader/-/cascader-1.22.0.tgz",
      "integrity": "sha512-SffrA57aS9oub3VuI7ajPhJTPtaNxngSvtRhD40Rd8dwJ5vfWPSrVanWgeepdWFGBt7EHftIK5RUU0u3rCTwWw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/select": "~1.10.0",
        "@rc-component/tree": "~1.4.0",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/checkbox": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/@rc-component/checkbox/-/checkbox-2.0.0.tgz",
      "integrity": "sha512-3CXGPpAR9gsPKeO2N78HAPOzU30UdemD6HGJoWVJOpa6WleaGB5kzZj3v6bdTZab31YuWgY/RxV3VKPctn0DwQ==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.3.0",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/collapse": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/@rc-component/collapse/-/collapse-1.2.0.tgz",
      "integrity": "sha512-ZRYSKSS39qsFx93p26bde7JUZJshsUBEQRlRXPuJYlAiNX0vyYlF5TsAm8JZN3LcF8XvKikdzPbgAtXSbkLUkw==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.10.1",
        "@rc-component/motion": "^1.1.4",
        "@rc-component/util": "^1.3.0",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/color-picker": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/@rc-component/color-picker/-/color-picker-3.1.1.tgz",
      "integrity": "sha512-OHaCHLHszCegdXmIq2ZRIZBN/EtpT6Wm8SG/gpzLATHbVKc/avvuKi+zlOuk05FTWvgaMmpxAko44uRJ3M+2pg==",
      "license": "MIT",
      "dependencies": {
        "@ant-design/fast-color": "^3.0.1",
        "@rc-component/util": "^1.3.0",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/context": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/@rc-component/context/-/context-2.0.2.tgz",
      "integrity": "sha512-uiGpAlblCNlziHPwj4S4Iy/oemeuz/hR03mbiEjTCXwsqOIN3BOzsRMyDwpyO5Fm0vIEEJRUf9ZtbRLbhksuTA==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.11.0"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/dialog": {
      "version": "1.10.0",
      "resolved": "https://registry.npmjs.org/@rc-component/dialog/-/dialog-1.10.0.tgz",
      "integrity": "sha512-eDukNlz9vNszAGv7i3zKXdxEd3wgVmNxuJijYt8zvTh17QwTu8KK/bdURRd/lU4qaMzhO1HKKmMrwOnkaw0BvQ==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/motion": "^1.3.3",
        "@rc-component/portal": "^2.1.0",
        "@rc-component/util": "^1.9.0",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/drawer": {
      "version": "1.4.2",
      "resolved": "https://registry.npmjs.org/@rc-component/drawer/-/drawer-1.4.2.tgz",
      "integrity": "sha512-1ib+fZEp6FBu+YvcIktm+nCQ+Q+qIpwpoaJH6opGr4ofh2QMq+qdr5DLC4oCf5qf3pcWX9lUWPYX652k4ini8Q==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/motion": "^1.1.4",
        "@rc-component/portal": "^2.1.3",
        "@rc-component/util": "^1.9.0",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/dropdown": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@rc-component/dropdown/-/dropdown-1.0.3.tgz",
      "integrity": "sha512-YTST/N6kpqpDz3IMuM/PSSZnrDpSOA6dgHv12gPA90ZTSLv2CoqkZ0+9NtwTY6BeO7dstPblSic2QJg7dSFy/g==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/trigger": "^3.0.0",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.11.0",
        "react-dom": ">=16.11.0"
      }
    },
    "node_modules/@rc-component/form": {
      "version": "1.8.6",
      "resolved": "https://registry.npmjs.org/@rc-component/form/-/form-1.8.6.tgz",
      "integrity": "sha512-1EXVsSKPZC6kGrIqxVck7kAWM6T65b6et/n5wIcyiaIa41VrDshD0nVLHoBDEIZr2ATQsOP6icb4XQkNFMLBAw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/async-validator": "^6.0.0",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/image": {
      "version": "1.10.0",
      "resolved": "https://registry.npmjs.org/@rc-component/image/-/image-1.10.0.tgz",
      "integrity": "sha512-BjeZCRQ+hw+4WAhvrw8rJvy5fckA2xpf/X2XQEOABUHvLTNB9inB98X3Mp54jYQ7g10DfWERQWHXeC4ylxp1Uw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/motion": "^1.0.0",
        "@rc-component/portal": "^2.1.2",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/input": {
      "version": "1.3.1",
      "resolved": "https://registry.npmjs.org/@rc-component/input/-/input-1.3.1.tgz",
      "integrity": "sha512-iFvTUT9W+JC/MSin2aGAk8NqsVlTzcExNC9DZariON1IWirju9NoNeEk47an4Q8iHazkoVI/y1LnDi88+CPcig==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/resize-observer": "^1.1.1",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.0.0",
        "react-dom": ">=16.0.0"
      }
    },
    "node_modules/@rc-component/input-number": {
      "version": "1.6.2",
      "resolved": "https://registry.npmjs.org/@rc-component/input-number/-/input-number-1.6.2.tgz",
      "integrity": "sha512-Gjcq7meZlCOiWN1t1xCC+7/s85humHVokTBI7PJgTfoyw5OWF74y3e6P8PHX104g9+b54jsodFIzyaj6p8LI9w==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/mini-decimal": "^1.0.1",
        "@rc-component/util": "^1.4.0",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/listy": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@rc-component/listy/-/listy-1.2.3.tgz",
      "integrity": "sha512-IXiMjV5s0rczLBlfh7G5nB4M3365mrEeedjwKtf5I+Ns3PqRUsebR2h5u8CeFarsVfLUPC2I5p0h09TNoOWyvQ==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/motion": "^1.1.4",
        "@rc-component/portal": "^2.0.0",
        "@rc-component/resize-observer": "^1.0.0",
        "@rc-component/util": "^1.3.1",
        "@rc-component/virtual-list": "^1.4.0",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/mentions": {
      "version": "1.12.0",
      "resolved": "https://registry.npmjs.org/@rc-component/mentions/-/mentions-1.12.0.tgz",
      "integrity": "sha512-v5MBx8zDcqCT+uybJgKpcx3Fgrvj0m3u+A/15RlSBaMx12lLoJZTTYggC3pbYYfohcKujWWUyBz6O6Gp2vGiNA==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/input": "~1.3.1",
        "@rc-component/menu": "~1.5.0",
        "@rc-component/trigger": "^3.0.0",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/menu": {
      "version": "1.5.0",
      "resolved": "https://registry.npmjs.org/@rc-component/menu/-/menu-1.5.0.tgz",
      "integrity": "sha512-RjvzPsZkwVEg3xu+/jDDqDeUCBJAnWylONFlGeQgg5enlNAnlpybqhaMGE/UPEIvr6hL90PGhjFBguJqj0Qb2Q==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/motion": "^1.1.4",
        "@rc-component/overflow": "^1.0.0",
        "@rc-component/trigger": "^3.0.0",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/mini-decimal": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/@rc-component/mini-decimal/-/mini-decimal-1.1.4.tgz",
      "integrity": "sha512-xiuXcaCwyOWpD8a8scdExFl+bntNphAW8XeenL1ig2en0AAZY0Pcp4pC0dI22qJ+NvxKn9RoNIoRdqYU3BLH4w==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.18.0"
      },
      "engines": {
        "node": ">=8.x"
      }
    },
    "node_modules/@rc-component/motion": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/@rc-component/motion/-/motion-1.3.3.tgz",
      "integrity": "sha512-Xh3IszxvlSv3/PLYFyC2UZi9LNB83yOnkB/LNmRzaypZLvkhqUIPS7MQpGZcCMWrNsXV2p6YTSWbSGvFpEle9A==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.11.0",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/mutate-observer": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/@rc-component/mutate-observer/-/mutate-observer-2.0.1.tgz",
      "integrity": "sha512-AyarjoLU5YlxuValRi+w8JRH2Z84TBbFO2RoGWz9d8bSu0FqT8DtugH3xC3BV7mUwlmROFauyWuXFuq4IFbH+w==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.2.0"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/notification": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/@rc-component/notification/-/notification-2.1.1.tgz",
      "integrity": "sha512-HD+Gx/HUjivBI6GZtfPVLjvOJZybSEIoE2upnmoVg4w9vZQHMaIPWP6B52cHWOGg+u48HBbO+HnyVNN8AKQxgQ==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/motion": "^1.1.4",
        "@rc-component/util": "^1.13.0",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/overflow": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@rc-component/overflow/-/overflow-1.0.1.tgz",
      "integrity": "sha512-syfmgAABaHCnCDzPwHZ/2tuvIcpOO3jefYZMmfkN+pmo8HKTzsfhS57vxo4ksPdN0By+uWVJhJWNFozNBxi2eA==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.11.1",
        "@rc-component/resize-observer": "^1.0.1",
        "@rc-component/util": "^1.4.0",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/pagination": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/@rc-component/pagination/-/pagination-1.4.0.tgz",
      "integrity": "sha512-CW1g7P9V8u+e8JQdUsl2RWg+GCsoee0mtJjZUCCxn/vb3jzOwDKm6hAdwddHCVBfWJ58eGUBZz3IvnU8rRktjw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/picker": {
      "version": "1.12.2",
      "resolved": "https://registry.npmjs.org/@rc-component/picker/-/picker-1.12.2.tgz",
      "integrity": "sha512-ZB1A+tzTQkgtR4flPrAMvxIAOelIIOOOsp22fU2Nad6PbZcJacnyGJUJqUH7ZS9mwxeUwurf1pLMKXrVsK1tlA==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/overflow": "^1.0.0",
        "@rc-component/resize-observer": "^1.0.0",
        "@rc-component/trigger": "^3.6.15",
        "@rc-component/util": "^1.13.0",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=12.x"
      },
      "peerDependencies": {
        "date-fns": ">= 2.x",
        "dayjs": ">= 1.x",
        "luxon": ">= 3.x",
        "moment": ">= 2.x",
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      },
      "peerDependenciesMeta": {
        "date-fns": {
          "optional": true
        },
        "dayjs": {
          "optional": true
        },
        "luxon": {
          "optional": true
        },
        "moment": {
          "optional": true
        }
      }
    },
    "node_modules/@rc-component/portal": {
      "version": "2.2.1",
      "resolved": "https://registry.npmjs.org/@rc-component/portal/-/portal-2.2.1.tgz",
      "integrity": "sha512-ck+r1kW/JSv0wxPji3KN2ss9K6Z0qqwusw/mf/0JobXhZ8hC2ejZwCJObW/SvDi0uhA0VzmCnx0CaCci95tcmA==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.11.0",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=12.x"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/progress": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@rc-component/progress/-/progress-1.0.3.tgz",
      "integrity": "sha512-Q1nPLIvKr95el/q76yaBh5nv1hqCsWaHQb8U7vXEDMefEhHgM7n3CPoN+o4LHnTyANQHmMFgoS/naAT4Bhxuaw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/qrcode": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/@rc-component/qrcode/-/qrcode-2.0.0.tgz",
      "integrity": "sha512-aAv3QhPP1xyafuTZOxub6a54pCeBnN3IwQkpETrBtthq4BL5IgxnCbuoBWPDpdLw1y1j6BgBUCAKV92+yX06Dw==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.24.7"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/rate": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@rc-component/rate/-/rate-1.0.1.tgz",
      "integrity": "sha512-bkXxeBqDpl5IOC7yL7GcSYjQx9G8H+6kLYQnNZWeBYq2OYIv1MONd6mqKTjnnJYpV0cQIU2z3atdW0j1kttpTw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.3.0",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/resize-observer": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@rc-component/resize-observer/-/resize-observer-1.1.2.tgz",
      "integrity": "sha512-t/Bb0W8uvL4PYKAB3YcChC+DlHh0Wt5kM7q/J+0qpVEUMLe7Hk5zuvc9km0hMnTFPSx5Z7Wu/fzCLN6erVLE8Q==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.2.0"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/segmented": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/@rc-component/segmented/-/segmented-1.4.0.tgz",
      "integrity": "sha512-NZlpKGSplOYlmF5ukUF1fCLr0ns5WfjNoqMlMkf4AHP0iu90wyiP7hn2qZKRHEuRlG4CvEEz/lF9qRiYnLTofQ==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^8.0.0",
        "@rc-component/motion": "^1.1.4",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.0.0",
        "react-dom": ">=16.0.0"
      }
    },
    "node_modules/@rc-component/segmented/node_modules/@babel/runtime": {
      "version": "8.0.8",
      "resolved": "https://registry.npmjs.org/@babel/runtime/-/runtime-8.0.8.tgz",
      "integrity": "sha512-dEu8nGlRqjsJsvviUUoSMfcRHpwomCiRlXsc2mPfJ79+ffTpDm+JtfUtTMzUrqCApHQnCsVPD3gT1ZT8RgBRCQ==",
      "license": "MIT"
    },
    "node_modules/@rc-component/select": {
      "version": "1.10.1",
      "resolved": "https://registry.npmjs.org/@rc-component/select/-/select-1.10.1.tgz",
      "integrity": "sha512-H+yQsl+qED9NilQ3g6zdpsMwUgwVjrcMTkNHAWRVU/MoNCYgTbDgU+MIMgZDK+rVdd2JUfI/MkysMcZZ0cyQKw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/overflow": "^1.0.0",
        "@rc-component/trigger": "^3.0.0",
        "@rc-component/util": "^1.11.1",
        "@rc-component/virtual-list": "^1.2.0",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": "*",
        "react-dom": "*"
      }
    },
    "node_modules/@rc-component/slider": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/@rc-component/slider/-/slider-1.1.1.tgz",
      "integrity": "sha512-LSzgWGYDgeCDgR4r1XlU29gbYws6HpLnvJd/uMhLeW/vQgxldeR+Wb4uzHDCHiYEbr1bnEHWdjkPxjJRHxuiig==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.3.0",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/steps": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@rc-component/steps/-/steps-1.2.3.tgz",
      "integrity": "sha512-/b9gHcvDGjTDWJZW7+1kKFvzs0jrEeQ8mFvvIgX+h7xNT0FsOYODJYKjyJR4fPbvMBCfCOEqaBK66HBxov5BQA==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/switch": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@rc-component/switch/-/switch-1.0.3.tgz",
      "integrity": "sha512-Jgi+EbOBquje/XNdofr7xbJQZPYJP+BlPfR0h+WN4zFkdtB2EWqEfvkXJWeipflwjWip0/17rNbxEAqs8hVHfw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.3.0",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/table": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@rc-component/table/-/table-1.11.1.tgz",
      "integrity": "sha512-OWdS6DMmeWb7bJBGqPxYZpQbzBlBiXZUu2sqo6Ii7Sjs9GeK1IsrXrWk26SL2c6KEseabswdxrRj7WUm9LdECw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/context": "^2.0.1",
        "@rc-component/resize-observer": "^1.0.0",
        "@rc-component/util": "^1.11.1",
        "@rc-component/virtual-list": "^1.0.1",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/tabs": {
      "version": "1.13.0",
      "resolved": "https://registry.npmjs.org/@rc-component/tabs/-/tabs-1.13.0.tgz",
      "integrity": "sha512-3FXr+9ZII8tFLWuDWrgjRaxZd2mazkKJAGRFEfVmp4r1qnBglOlxQ78l54Td1aj6/iFaaEReKSAF2HToztU5uw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/dropdown": "~1.0.0",
        "@rc-component/menu": "~1.5.0",
        "@rc-component/motion": "^1.1.3",
        "@rc-component/resize-observer": "^1.0.0",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/tooltip": {
      "version": "1.5.2",
      "resolved": "https://registry.npmjs.org/@rc-component/tooltip/-/tooltip-1.5.2.tgz",
      "integrity": "sha512-VLq4BclU3LgRe46g2hTr2bdsM8tFYs7dVwpuD88rPNNg4lCGe8mBSS4FiRzYzS+ffnZ46y4SI8KYKo9K7qBnhw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/trigger": "^3.10.0",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/tour": {
      "version": "2.4.0",
      "resolved": "https://registry.npmjs.org/@rc-component/tour/-/tour-2.4.0.tgz",
      "integrity": "sha512-aui4r4TqmTzwaBgcQxHYep8kM8PTjZFufjokObpy35KfFeZ0k9ArquWFZqegQlH24P14t+F0qO0mGTgzlav1yg==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/portal": "^2.2.0",
        "@rc-component/trigger": "^3.0.0",
        "@rc-component/util": "^1.7.0",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/tree": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/@rc-component/tree/-/tree-1.4.0.tgz",
      "integrity": "sha512-dGsJGDJQedA0BqqVgj3F8BvHXTSZijyhTXdbAdkcx8lynzZkty/CV3Z3LOm/fxz+BCfl3dfGiAQpb7Q5XNvl0Q==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/motion": "^1.0.0",
        "@rc-component/util": "^1.11.1",
        "@rc-component/virtual-list": "^1.2.0",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=10.x"
      },
      "peerDependencies": {
        "react": "*",
        "react-dom": "*"
      }
    },
    "node_modules/@rc-component/tree-select": {
      "version": "1.16.1",
      "resolved": "https://registry.npmjs.org/@rc-component/tree-select/-/tree-select-1.16.1.tgz",
      "integrity": "sha512-a1Oi6EJhqAhdOxxupdJi6fP0RPHMKn5TcfkX2+llaQ4lF4nwfH7b6SCHcnsybaa2s+pk1yZYwVyeOYkDnEBRdg==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/select": "~1.10.0",
        "@rc-component/tree": "~1.4.0",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": "*",
        "react-dom": "*"
      }
    },
    "node_modules/@rc-component/trigger": {
      "version": "3.10.1",
      "resolved": "https://registry.npmjs.org/@rc-component/trigger/-/trigger-3.10.1.tgz",
      "integrity": "sha512-mXlDN0IXdtV8Yqqm8195ECCyrbmfvvfKvwVvSlH0+qvKD6BUF8gRhEjSy0FOcD1+CcDRHgTiX99LoxfQrmh3Cw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/motion": "^1.3.3",
        "@rc-component/portal": "^2.2.1",
        "@rc-component/resize-observer": "^1.1.2",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/upload": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/@rc-component/upload/-/upload-1.1.1.tgz",
      "integrity": "sha512-GvYWSKeaJTOxxC5p6+nOSadzfvXA1h8C/iHFPFZX+szH3JUXrvs+DLiW8YUTBgvMh8m63mJeHrlYlJzAlg+pDA==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/util": {
      "version": "1.14.0",
      "resolved": "https://registry.npmjs.org/@rc-component/util/-/util-1.14.0.tgz",
      "integrity": "sha512-qFpkGBCiyN3NNAU+FOnZdcdz7A/rXCg3JdQk+bujUKAExZgRqzf2yy1f4YN63Lwctic5FcK9rgjQ6aWbykqwEw==",
      "license": "MIT",
      "dependencies": {
        "is-mobile": "^5.0.0",
        "react-is": "^19.2.7"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/virtual-list": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/@rc-component/virtual-list/-/virtual-list-1.6.0.tgz",
      "integrity": "sha512-aHPlTWVtfgDmzb4oJNrqBW1yeEdFeIS28EoJLQ/dGBgZPRlrQ84c2Rk/Il6JxDUV5P7FDtNFD0aXc7EB22kR3Q==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^8.0.0",
        "@rc-component/resize-observer": "^1.0.1",
        "@rc-component/util": "^1.4.0",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/virtual-list/node_modules/@babel/runtime": {
      "version": "8.0.8",
      "resolved": "https://registry.npmjs.org/@babel/runtime/-/runtime-8.0.8.tgz",
      "integrity": "sha512-dEu8nGlRqjsJsvviUUoSMfcRHpwomCiRlXsc2mPfJ79+ffTpDm+JtfUtTMzUrqCApHQnCsVPD3gT1ZT8RgBRCQ==",
      "license": "MIT"
    },
    "node_modules/@rolldown/binding-android-arm-eabi": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-android-arm-eabi/-/binding-android-arm-eabi-1.2.15.tgz",
      "integrity": "sha512-aLcgK9gIJ3YRvrrtfSBbRa27F5WrpiTaPulnFpsHPxpUHgFlSgnU4854MHwoRGEBhfRJDWCS2WQ7lIjskE9Olw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-android-arm64": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-android-arm64/-/binding-android-arm64-1.2.15.tgz",
      "integrity": "sha512-xD7DdZCrbThKuxNg7ooQmvp07ys4J/pnSEMTG3/OdOWl6daC67m/Q4fL78sRHMxTH/N4fGUbYhcPM0MF5WFHkg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-arm64": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-arm64/-/binding-darwin-arm64-1.2.15.tgz",
      "integrity": "sha512-m2WuQ6r0B4OTYxyPpNLtXaMRbRDUbG8YQV2Q3KTdSSK8Th6KHCnC8jVCJt8bvYeSB5WivkkNbc85mKadaSdOxA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-x64": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-x64/-/binding-darwin-x64-1.2.15.tgz",
      "integrity": "sha512-5RtnsHM36nodM9WbMy+zip0LGS/G+y5wro5RHrpOlr4ac24+1zSi9kiV2MP1myZeZ/ifEHfulQcWjnAXzc2C2A==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-freebsd-x64": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-freebsd-x64/-/binding-freebsd-x64-1.2.15.tgz",
      "integrity": "sha512-g3l09pyFqhu+135JKkbkwiKGQmwU5hUMUPJ4VdBADvuqR8d33L6H578rh8m7rtxbdp+VmX/+nzI7nvhSZlzpUQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm-gnueabihf": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm-gnueabihf/-/binding-linux-arm-gnueabihf-1.2.15.tgz",
      "integrity": "sha512-nIe3VugI97nGQtspPxDqA4sXMUpeiocKIP/CqpY/u/vgbT+alX+cVxu1C/oVBPKg4feNTmYovE91v4DgXvXNwQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-gnu": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-gnu/-/binding-linux-arm64-gnu-1.2.15.tgz",
      "integrity": "sha512-iTBjXx+B5QSvgI89lJfmqh4wTh8NabR1YZIIN3hNx4zSG0EVfVqkOvLulNpG4251pbd6/IAmZ/LefVk1Y4rPhw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-musl": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-musl/-/binding-linux-arm64-musl-1.2.15.tgz",
      "integrity": "sha512-uN26XOnVR7rqQupG3V9oAG2EGGatWjcJHOeDOHUFCh4TBWmP2tHTFoVN13aYbwfm0aHqJAEmcwhAu6sooIjfqQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-ppc64-gnu": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-ppc64-gnu/-/binding-linux-ppc64-gnu-1.2.15.tgz",
      "integrity": "sha512-9nWkcdd+H+XhaA3fQIwpHnKIrfx/PQ6rO0pivr78Og07tXlUlctBBJoEYLPfhTmCR/QxEVdn6uPjHV5SymPhdw==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-s390x-gnu": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-s390x-gnu/-/binding-linux-s390x-gnu-1.2.15.tgz",
      "integrity": "sha512-Ggh0ciFjLwIusLSLz7LZYEaGdxOAUJXI+Qu5JCbhPJJHEt8vP+IjRATTJheiJsdzzTYgUiHUiw3X1Ea3ZpMBdA==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-gnu": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-gnu/-/binding-linux-x64-gnu-1.2.15.tgz",
      "integrity": "sha512-FHg60rS6DBePAYZ9X9F67x+JObFdmgn6tupA1C/a3B+CufFmTD4mX+e8M75tCiAO3foR/6xwVBI0KQiI7sn/rw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-musl": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-musl/-/binding-linux-x64-musl-1.2.15.tgz",
      "integrity": "sha512-/cvV/7v5VGz/moiz0XKRj2dE8DzsKyhIu1KpOvJGPjRywg3yscON889UGvAe8zfiJLHup7VLjBduoGWi3HusWQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-openharmony-arm64": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-openharmony-arm64/-/binding-openharmony-arm64-1.2.15.tgz",
      "integrity": "sha512-MyzC5Hrv/sm+Z7TSGKP/j8001RO2xQm1zOpCNVL4j0cY/VhBZviludA2YFQ7i4lH6ZAXxQm0lcMdBzM+99mE7w==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-arm64-msvc": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-arm64-msvc/-/binding-win32-arm64-msvc-1.2.15.tgz",
      "integrity": "sha512-+PgYiS+AH5omy6L45ZLxybasauJaj3M8buoT83D+nzPmCayXlxUV9hydhciCKVyIg0B/v0BtXPDE1uGqNwCPpg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-x64-msvc": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-x64-msvc/-/binding-win32-x64-msvc-1.2.15.tgz",
      "integrity": "sha512-HFZd2QNQYn1JbIi+Hpd7H+r/lkWxcfIu28nirZ6eCn2LafuvmExMlb/P96Sfx5tf7pPArw39IdhmCF8vmV+NhQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/pluginutils": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.1.tgz",
      "integrity": "sha512-2j9bGt5Jh8hj+vPtgzPtl72j0yRxHAyumoo6TNfAjsLB04UtpSvPbPcDcBMxz7n+9CYB0c1GxQFxYRg2jimqGw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@tailwindcss/node": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/node/-/node-4.3.3.tgz",
      "integrity": "sha512-/T8IKEsf9VTU6tLjgC7+sv2mOPtQxzE2jMw7u4Tt40Tx+QSZxpzh95/H6cMKoja9XuW7iMdLJYBB0o9G1CaAgg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/remapping": "^2.3.5",
        "enhanced-resolve": "^5.24.1",
        "jiti": "^2.7.0",
        "lightningcss": "1.32.0",
        "magic-string": "^0.30.21",
        "source-map-js": "^1.2.1",
        "tailwindcss": "4.3.3"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss/-/lightningcss-1.32.0.tgz",
      "integrity": "sha512-NXYBzinNrblfraPGyrbPoD19C1h9lfI/1mzgWYvXUTe414Gz/X1FD2XBZSZM7rRTrMA8JL3OtAaGifrIKhQ5yQ==",
      "dev": true,
      "license": "MPL-2.0",
      "dependencies": {
        "detect-libc": "^2.0.3"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      },
      "optionalDependencies": {
        "lightningcss-android-arm64": "1.32.0",
        "lightningcss-darwin-arm64": "1.32.0",
        "lightningcss-darwin-x64": "1.32.0",
        "lightningcss-freebsd-x64": "1.32.0",
        "lightningcss-linux-arm-gnueabihf": "1.32.0",
        "lightningcss-linux-arm64-gnu": "1.32.0",
        "lightningcss-linux-arm64-musl": "1.32.0",
        "lightningcss-linux-x64-gnu": "1.32.0",
        "lightningcss-linux-x64-musl": "1.32.0",
        "lightningcss-win32-arm64-msvc": "1.32.0",
        "lightningcss-win32-x64-msvc": "1.32.0"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-android-arm64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.32.0.tgz",
      "integrity": "sha512-YK7/ClTt4kAK0vo6w3X+Pnm0D2cf2vPHbhOXdoNti1Ga0al1P4TBZhwjATvjNwLEBCnKvjJc2jQgHXH0NEwlAg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-darwin-arm64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.32.0.tgz",
      "integrity": "sha512-RzeG9Ju5bag2Bv1/lwlVJvBE3q6TtXskdZLLCyfg5pt+HLz9BqlICO7LZM7VHNTTn/5PRhHFBSjk5lc4cmscPQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-darwin-x64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.32.0.tgz",
      "integrity": "sha512-U+QsBp2m/s2wqpUYT/6wnlagdZbtZdndSmut/NJqlCcMLTWp5muCrID+K5UJ6jqD2BFshejCYXniPDbNh73V8w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-freebsd-x64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.32.0.tgz",
      "integrity": "sha512-JCTigedEksZk3tHTTthnMdVfGf61Fky8Ji2E4YjUTEQX14xiy/lTzXnu1vwiZe3bYe0q+SpsSH/CTeDXK6WHig==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-linux-arm-gnueabihf": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.32.0.tgz",
      "integrity": "sha512-x6rnnpRa2GL0zQOkt6rts3YDPzduLpWvwAF6EMhXFVZXD4tPrBkEFqzGowzCsIWsPjqSK+tyNEODUBXeeVHSkw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-linux-arm64-gnu": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.32.0.tgz",
      "integrity": "sha512-0nnMyoyOLRJXfbMOilaSRcLH3Jw5z9HDNGfT/gwCPgaDjnx0i8w7vBzFLFR1f6CMLKF8gVbebmkUN3fa/kQJpQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-linux-arm64-musl": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.32.0.tgz",
      "integrity": "sha512-UpQkoenr4UJEzgVIYpI80lDFvRmPVg6oqboNHfoH4CQIfNA+HOrZ7Mo7KZP02dC6LjghPQJeBsvXhJod/wnIBg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-linux-x64-gnu": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.32.0.tgz",
      "integrity": "sha512-V7Qr52IhZmdKPVr+Vtw8o+WLsQJYCTd8loIfpDaMRWGUZfBOYEJeyJIkqGIDMZPwPx24pUMfwSxxI8phr/MbOA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-linux-x64-musl": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.32.0.tgz",
      "integrity": "sha512-bYcLp+Vb0awsiXg/80uCRezCYHNg1/l3mt0gzHnWV9XP1W5sKa5/TCdGWaR/zBM2PeF/HbsQv/j2URNOiVuxWg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-win32-arm64-msvc": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.32.0.tgz",
      "integrity": "sha512-8SbC8BR40pS6baCM8sbtYDSwEVQd4JlFTOlaD3gWGHfThTcABnNDBda6eTZeqbofalIJhFx0qKzgHJmcPTnGdw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-win32-x64-msvc": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.32.0.tgz",
      "integrity": "sha512-Amq9B/SoZYdDi1kFrojnoqPLxYhQ4Wo5XiL8EVJrVsB8ARoC1PWW6VGtT0WKCemjy8aC+louJnjS7U18x3b06Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/oxide": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide/-/oxide-4.3.3.tgz",
      "integrity": "sha512-krXjAikiaFSPaK/FkAQT5UTx3VormQaiZ5hBFlJZ9UFQGB/rwg1MZIhHAG9smMQRTdyJxP6Qt5MwMtdyU5FWrA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 20"
      },
      "optionalDependencies": {
        "@tailwindcss/oxide-android-arm64": "4.3.3",
        "@tailwindcss/oxide-darwin-arm64": "4.3.3",
        "@tailwindcss/oxide-darwin-x64": "4.3.3",
        "@tailwindcss/oxide-freebsd-x64": "4.3.3",
        "@tailwindcss/oxide-linux-arm-gnueabihf": "4.3.3",
        "@tailwindcss/oxide-linux-arm64-gnu": "4.3.3",
        "@tailwindcss/oxide-linux-arm64-musl": "4.3.3",
        "@tailwindcss/oxide-linux-x64-gnu": "4.3.3",
        "@tailwindcss/oxide-linux-x64-musl": "4.3.3",
        "@tailwindcss/oxide-wasm32-wasi": "4.3.3",
        "@tailwindcss/oxide-win32-arm64-msvc": "4.3.3",
        "@tailwindcss/oxide-win32-x64-msvc": "4.3.3"
      }
    },
    "node_modules/@tailwindcss/oxide-android-arm64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-android-arm64/-/oxide-android-arm64-4.3.3.tgz",
      "integrity": "sha512-Y85A2gmPSkl5Ve5qR86GL4HT509cFqQh1aes9p3sSkyTPwt0Pppf3GkwGe4JPACcRYjgJIEhQgM6dBClnr0NYw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-darwin-arm64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-darwin-arm64/-/oxide-darwin-arm64-4.3.3.tgz",
      "integrity": "sha512-BiaWatpBcERQFDlOjRDpIVXuFK5PJez5SA4JMg6VYZdBYU+qKfV/vqjcIs+IYmtitf1xYQZTwXvU/8y4lfZUGw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-darwin-x64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-darwin-x64/-/oxide-darwin-x64-4.3.3.tgz",
      "integrity": "sha512-fAeUqfV5ndhxRwai8cXGzdLvul9utWOmeTkv69unv4ZXixjn61Z+p9lCWdwOwA3TYboG3BwdVuN/RDjhBRl0mw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-freebsd-x64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-freebsd-x64/-/oxide-freebsd-x64-4.3.3.tgz",
      "integrity": "sha512-iyf5bV6+wnAlflVeEy7R25dupxTNECZN5QMI0qNT6eT+EgaGdZcKhGkr5SdoaWiLJ3spLqIY9VCeSGrwmtg4kw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-arm-gnueabihf": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-arm-gnueabihf/-/oxide-linux-arm-gnueabihf-4.3.3.tgz",
      "integrity": "sha512-aAYUprJAJQWWbRrPvtjdroZ56Md+JM8pMiopS6xGEwDfLhqj+2ver2p4nU4Mb3CRqcMmNBjo8KkUgcxhkzVQGQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-arm64-gnu": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-arm64-gnu/-/oxide-linux-arm64-gnu-4.3.3.tgz",
      "integrity": "sha512-nDxldcEENOxZRzC2uu9jrutZdAAQtb+8WWDCSnWL1zvBk1+FN+x6MtDViPB5AJMfttVCUhehGWus3XBPgatM/w==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-arm64-musl": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-arm64-musl/-/oxide-linux-arm64-musl-4.3.3.tgz",
      "integrity": "sha512-Md44bD6veX/PC5iyF8cDVnw4HBIANZepRZZ7a8DQOvkfo5WUBwcp6iAuCUz23u+4SUkhJlD3eL7hNdW8ezd/kA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-x64-gnu": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-x64-gnu/-/oxide-linux-x64-gnu-4.3.3.tgz",
      "integrity": "sha512-tx7us1muwOKAKWao2v/GaafFeQboE6aj88vC6ziN2NCGcRm8gWUhwjzg+YdVB1e4boAtdtma4L43onunI6NS4w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-x64-musl": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-x64-musl/-/oxide-linux-x64-musl-4.3.3.tgz",
      "integrity": "sha512-SJxX60smvHgasZoBy11dX6YRjXJFovwWBoedhbQPOBzgFWBHGB+TVPWB9BxzR7TTxU8FQZAI2AyiNCMzFm8Img==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-wasm32-wasi": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-wasm32-wasi/-/oxide-wasm32-wasi-4.3.3.tgz",
      "integrity": "sha512-jx1+rPhY/5Ympkktd656HBWEBLxP7dH06losBLjjf5vgCODXvi9KhtftWcMIwTFIDqBr7cRnQkdLnAG+IOlGvQ==",
      "bundleDependencies": [
        "@napi-rs/wasm-runtime",
        "@emnapi/core",
        "@emnapi/runtime",
        "@tybys/wasm-util",
        "@emnapi/wasi-threads",
        "tslib"
      ],
      "cpu": [
        "wasm32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/core": "^1.11.1",
        "@emnapi/runtime": "^1.11.1",
        "@emnapi/wasi-threads": "^1.2.2",
        "@napi-rs/wasm-runtime": "^1.1.4",
        "@tybys/wasm-util": "^0.10.2",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/@tailwindcss/oxide-win32-arm64-msvc": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-win32-arm64-msvc/-/oxide-win32-arm64-msvc-4.3.3.tgz",
      "integrity": "sha512-3rc292Ca2ceK6Ulcc/bAVnTs/3nDtoPhyEKlgPv+yQJQi/JS/AMJlqzxvlDacL1nekbrcf6bTqp/jV4qgnPxNQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-win32-x64-msvc": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-win32-x64-msvc/-/oxide-win32-x64-msvc-4.3.3.tgz",
      "integrity": "sha512-yJ0pwIVc/nYeGoV02WtsN8KYyLQv7kyI2wDnkezyJlGGjkd4QLwDGAwl47YpPJeuI0M0ObaXGSPjvWDPeTPggw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/vite": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/vite/-/vite-4.3.3.tgz",
      "integrity": "sha512-yYU8cogLeSh/ms2jh8Fj7jaba/EWa7Ja6GoUqYZaraEuCI5YS6ms6ObZgjjedm+jm6XZjdNRWBpPP6Z86oOxcw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@tailwindcss/node": "4.3.3",
        "@tailwindcss/oxide": "4.3.3",
        "tailwindcss": "4.3.3"
      },
      "peerDependencies": {
        "vite": "^5.2.0 || ^6 || ^7 || ^8"
      }
    },
    "node_modules/@tauri-apps/api": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/api/-/api-2.12.4.tgz",
      "integrity": "sha512-pVmfis+4zT8H0Qhp3xPZx9Ju7kpzvA6rr/PSJPyuwfvucTQ8sVt61NYU9KMkK703UFlYadFmjKA4HhybOtN0gg==",
      "license": "Apache-2.0 OR MIT",
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/tauri"
      }
    },
    "node_modules/@tauri-apps/cli": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli/-/cli-2.12.4.tgz",
      "integrity": "sha512-JI9bHfudSRJikGOrjbXEm6RjzzvmKuLc+JixB1NE8hNzQkNlCCIC3pTES3uypkR9lxHrsbxzcnSwhI2IxBQphw==",
      "dev": true,
      "license": "Apache-2.0 OR MIT",
      "bin": {
        "tauri": "tauri.js"
      },
      "engines": {
        "node": ">= 10"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/tauri"
      },
      "optionalDependencies": {
        "@tauri-apps/cli-darwin-arm64": "2.12.4",
        "@tauri-apps/cli-darwin-x64": "2.12.4",
        "@tauri-apps/cli-linux-arm-gnueabihf": "2.12.4",
        "@tauri-apps/cli-linux-arm64-gnu": "2.12.4",
        "@tauri-apps/cli-linux-arm64-musl": "2.12.4",
        "@tauri-apps/cli-linux-riscv64-gnu": "2.12.4",
        "@tauri-apps/cli-linux-x64-gnu": "2.12.4",
        "@tauri-apps/cli-linux-x64-musl": "2.12.4",
        "@tauri-apps/cli-win32-arm64-msvc": "2.12.4",
        "@tauri-apps/cli-win32-ia32-msvc": "2.12.4",
        "@tauri-apps/cli-win32-x64-msvc": "2.12.4"
      }
    },
    "node_modules/@tauri-apps/cli-darwin-arm64": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-darwin-arm64/-/cli-darwin-arm64-2.12.4.tgz",
      "integrity": "sha512-OxqKSckIkoJ6vX2AjifIJpTasFC0Hbdoo7gEiCmAjauABO3U8m2MRsLWe+QTiBwDx1mIrvgA+rvI7tvDnbnHVg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-darwin-x64": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-darwin-x64/-/cli-darwin-x64-2.12.4.tgz",
      "integrity": "sha512-fz76/77wMMJOaaUN6n3CybRG0P/MTEjjqYk81mGPyhi9m6Ue5T+LWBnJP/AkPooNatBPI2vtulGqomyMJ44lCQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-linux-arm-gnueabihf": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-linux-arm-gnueabihf/-/cli-linux-arm-gnueabihf-2.12.4.tgz",
      "integrity": "sha512-K0w8Bof6Lt8QKLAYhRy0yy36ZH5iA/35VuSOvnxyjvCUZ+A3JKsUTlALviH/sVgAlisaPzzmeJSH8XOn4Q2HBA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-linux-arm64-gnu": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-linux-arm64-gnu/-/cli-linux-arm64-gnu-2.12.4.tgz",
      "integrity": "sha512-j5rOnjmRUwWrm1oosf0zBYl4D+fqydgUROFCk0hvKZxvbTT8SOERes0QB7rBV/XWNy+kM6pCKzb3oSm2sRglzg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-linux-arm64-musl": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-linux-arm64-musl/-/cli-linux-arm64-musl-2.12.4.tgz",
      "integrity": "sha512-aOue3Fy6Jb7+oWcfAVUsVHfeTybSCt2CZoU06aO4jv4d2Ks/KnaTPwMAK3CLEduGOvBLY1lbBBrIyomqLLH5Sg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-linux-riscv64-gnu": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-linux-riscv64-gnu/-/cli-linux-riscv64-gnu-2.12.4.tgz",
      "integrity": "sha512-Fx6GShY/RvST+t6LMlTHAwd66+1tEaAAGrnU7cysVfaiRP1BKng5Vl6rVmO6rSLOA1Sp1dRzNYM4f0OWQGb7qA==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-linux-x64-gnu": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-linux-x64-gnu/-/cli-linux-x64-gnu-2.12.4.tgz",
      "integrity": "sha512-tNzZSa79Z1nRpHxEpQ38lsAFpKlFlYvoXzjTV+lRRn/zSf3wrdUC3wnLcq2XEadchPu4ttK0zivhYzr+XGD19Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-linux-x64-musl": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-linux-x64-musl/-/cli-linux-x64-musl-2.12.4.tgz",
      "integrity": "sha512-jmZ1pr0xEqUhuEusWtt9Yt+GF6lCnGHUmIL+KIknpbjK/XQ2qkhDBhaxK/JMHM2A8dAacVXCxXJk2EXpwhQUfA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-win32-arm64-msvc": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-win32-arm64-msvc/-/cli-win32-arm64-msvc-2.12.4.tgz",
      "integrity": "sha512-fGo8pgEHZxdSYgZ/J98m1usJ7NHKmKbq7k6uT0x1rpOq6Bg2YVzzpaAblWk710f5LHYBJIL5QIFS5IrD+4gmTg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-win32-ia32-msvc": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-win32-ia32-msvc/-/cli-win32-ia32-msvc-2.12.4.tgz",
      "integrity": "sha512-ezl8sQIcjYsye3TUnTH5VcWmWzccZASlQm7hlZt0dYyj1XD0qpVW47u2xYVrIKui0F8uQv/7QGZixdWiClBsbg==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-win32-x64-msvc": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-win32-x64-msvc/-/cli-win32-x64-msvc-2.12.4.tgz",
      "integrity": "sha512-DJhDeCqjLDNMWYFy7ZS8cfeAHX2RK0RbQMLiA3bMVVkXRDJ4NBYiHriGqsUhsr9iG41aTb+dJGkFPmPw1gWwVw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@types/react": {
      "version": "19.3.0",
      "resolved": "https://registry.npmjs.org/@types/react/-/react-19.3.0.tgz",
      "integrity": "sha512-N0rFCuH9YoxG9/m61l9MfpJKfmLOVU0em7ipIz6TRgSSkvReLB9vL85GB+yr8Bs5leqpvg96JSwF4ZS1s4viQg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "csstype": "^3.2.2"
      }
    },
    "node_modules/@types/react-dom": {
      "version": "19.3.0",
      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-19.3.0.tgz",
      "integrity": "sha512-ZI7bU42mZXXKHn/qNLEw2IrbiINU7X5+vfgdixBHkCNpYWXjKgfQ/P+uyGb5CjOLB9UcnTeg3rylQtV2hym44Q==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "^19.3.0"
      }
    },
    "node_modules/@vitejs/plugin-react": {
      "version": "6.1.2",
      "resolved": "https://registry.npmjs.org/@vitejs/plugin-react/-/plugin-react-6.1.2.tgz",
      "integrity": "sha512-fhJNGUdscQa4HkI0xFxwonWyhnVReCPDbXI7FH7jmzpnVCrFQI7PRrhWecO263610vOrs9tr2Y4xcf8uAdFxbw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@rolldown/pluginutils": "^1.0.1"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "peerDependencies": {
        "@rolldown/plugin-babel": "^0.1.7 || ^0.2.0",
        "babel-plugin-react-compiler": "^1.0.0",
        "oxc-transform-react": "^0.152.0",
        "vite": "^8.0.0"
      },
      "peerDependenciesMeta": {
        "@rolldown/plugin-babel": {
          "optional": true
        },
        "babel-plugin-react-compiler": {
          "optional": true
        },
        "oxc-transform-react": {
          "optional": true
        }
      }
    },
    "node_modules/antd": {
      "version": "6.6.8",
      "resolved": "https://registry.npmjs.org/antd/-/antd-6.6.8.tgz",
      "integrity": "sha512-e+hDj/0myqbLBn8UGS0dYhPROAENruNscWe4gzyTnwx7yTip7D72wJUNxtsTplPXwRM1Mo4tXNSgaSb3UmV3RQ==",
      "license": "MIT",
      "dependencies": {
        "@ant-design/colors": "^8.0.1",
        "@ant-design/cssinjs": "^2.1.2",
        "@ant-design/cssinjs-utils": "^2.1.2",
        "@ant-design/fast-color": "^3.0.1",
        "@ant-design/icons": "^6.3.4",
        "@ant-design/react-slick": "~2.0.0",
        "@babel/runtime": "^7.29.2",
        "@rc-component/cascader": "~1.22.0",
        "@rc-component/checkbox": "~2.0.0",
        "@rc-component/collapse": "~1.2.0",
        "@rc-component/color-picker": "~3.1.1",
        "@rc-component/dialog": "~1.10.0",
        "@rc-component/drawer": "~1.4.2",
        "@rc-component/dropdown": "~1.0.3",
        "@rc-component/form": "~1.8.6",
        "@rc-component/image": "~1.10.0",
        "@rc-component/input": "~1.3.1",
        "@rc-component/input-number": "~1.6.2",
        "@rc-component/listy": "~1.2.3",
        "@rc-component/mentions": "~1.12.0",
        "@rc-component/menu": "~1.5.0",
        "@rc-component/motion": "^1.3.3",
        "@rc-component/mutate-observer": "^2.0.1",
        "@rc-component/notification": "~2.1.1",
        "@rc-component/pagination": "~1.4.0",
        "@rc-component/picker": "~1.12.2",
        "@rc-component/progress": "~1.0.3",
        "@rc-component/qrcode": "~2.0.0",
        "@rc-component/rate": "~1.0.1",
        "@rc-component/resize-observer": "^1.1.2",
        "@rc-component/segmented": "~1.4.0",
        "@rc-component/select": "~1.10.1",
        "@rc-component/slider": "~1.1.1",
        "@rc-component/steps": "~1.2.3",
        "@rc-component/switch": "~1.0.3",
        "@rc-component/table": "~1.11.1",
        "@rc-component/tabs": "~1.13.0",
        "@rc-component/tooltip": "~1.5.2",
        "@rc-component/tour": "~2.4.0",
        "@rc-component/tree": "~1.4.0",
        "@rc-component/tree-select": "~1.16.1",
        "@rc-component/trigger": "^3.10.1",
        "@rc-component/upload": "~1.1.1",
        "@rc-component/util": "^1.14.0",
        "clsx": "^2.1.1",
        "dayjs": "^1.11.11",
        "scroll-into-view-if-needed": "^3.1.0",
        "throttle-debounce": "^5.0.2"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/ant-design"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/clsx": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/clsx/-/clsx-2.1.1.tgz",
      "integrity": "sha512-eYm0QWBtUrBWZWG0d386OGAw16Z995PiOVo2B7bjWSbHedGl5e0ZWaq65kOGgUSNesEIDkB9ISbTg/JK9dhCZA==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/compute-scroll-into-view": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/compute-scroll-into-view/-/compute-scroll-into-view-3.1.1.tgz",
      "integrity": "sha512-VRhuHOLoKYOy4UbilLbUzbYg93XLjv2PncJC50EuTWPA3gaja1UjBsUP/D/9/juV3vQFr6XBEzn9KCAHdUvOHw==",
      "license": "MIT"
    },
    "node_modules/csstype": {
      "version": "3.2.3",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz",
      "integrity": "sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==",
      "license": "MIT"
    },
    "node_modules/dayjs": {
      "version": "1.11.13",
      "resolved": "https://registry.npmjs.org/dayjs/-/dayjs-1.11.13.tgz",
      "integrity": "sha512-oaMBel6gjolK862uaPQOVTA7q3TZhuSvuMQAAglQDOWYO9A91IrAOUJEyKVlqJlHE0vq5p5UXxzdPfMH/x6xNg==",
      "license": "MIT"
    },
    "node_modules/detect-libc": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz",
      "integrity": "sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/echarts": {
      "version": "6.1.0",
      "resolved": "https://registry.npmjs.org/echarts/-/echarts-6.1.0.tgz",
      "integrity": "sha512-q0yaFPggC9FUdsWH4blavRWFmxdrIodbkoKNAjJudAI6CA9gNPxHtV2RcZNEepZVlk4yvBYkOkbk6HIVpIyHZA==",
      "license": "Apache-2.0",
      "dependencies": {
        "tslib": "2.3.0",
        "zrender": "6.1.0"
      }
    },
    "node_modules/enhanced-resolve": {
      "version": "5.26.0",
      "resolved": "https://registry.npmjs.org/enhanced-resolve/-/enhanced-resolve-5.26.0.tgz",
      "integrity": "sha512-9vhedylFonb2YGogzUKX6+Ja72gOJbN1QHAqdrvqLwhdl/QWbKopzoUC9EbQNVsAns/bx/4uyqalrQAoy1IByw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "graceful-fs": "^4.2.4",
        "tapable": "^2.3.3"
      },
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/fdir": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/graceful-fs": {
      "version": "4.2.11",
      "resolved": "https://registry.npmjs.org/graceful-fs/-/graceful-fs-4.2.11.tgz",
      "integrity": "sha512-RbJ5/jmFcNNCcDV5o9eTnBLJ/HszWV0P73bc+Ff4nS/rJj+YaS6IGyiOL0VoBYX+l1Wrl3k63h/KrH+nhJ0XvQ==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/is-mobile": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/is-mobile/-/is-mobile-5.0.0.tgz",
      "integrity": "sha512-Tz/yndySvLAEXh+Uk8liFCxOwVH6YutuR74utvOcu7I9Di+DwM0mtdPVZNaVvvBUM2OXxne/NhOs1zAO7riusQ==",
      "license": "MIT"
    },
    "node_modules/jiti": {
      "version": "2.7.0",
      "resolved": "https://registry.npmjs.org/jiti/-/jiti-2.7.0.tgz",
      "integrity": "sha512-AC/7JofJvZGrrneWNaEnJeOLUx+JlGt7tNa0wZiRPT4MY1wmfKjt2+6O2p2uz2+skll8OZZmJMNqeke7kKbNgQ==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "jiti": "lib/jiti-cli.mjs"
      }
    },
    "node_modules/json2mq": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/json2mq/-/json2mq-0.2.0.tgz",
      "integrity": "sha512-SzoRg7ux5DWTII9J2qkrZrqV1gt+rTaoufMxEzXbS26Uid0NwaJd123HcoB80TgubEppxxIGdNxCx50fEoEWQA==",
      "license": "MIT",
      "dependencies": {
        "string-convert": "^0.2.0"
      }
    },
    "node_modules/lightningcss": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss/-/lightningcss-1.33.0.tgz",
      "integrity": "sha512-WkUDrojuJs0xkgGf2udWxa3yGBRxPtxUkB79i6aCZLRgc7PM8fZe9TosfPDcvEpQZbuFASnHYmRLBLUbmLOIIA==",
      "dev": true,
      "license": "MPL-2.0",
      "dependencies": {
        "detect-libc": "^2.0.3"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      },
      "optionalDependencies": {
        "lightningcss-android-arm64": "1.33.0",
        "lightningcss-darwin-arm64": "1.33.0",
        "lightningcss-darwin-x64": "1.33.0",
        "lightningcss-freebsd-x64": "1.33.0",
        "lightningcss-linux-arm-gnueabihf": "1.33.0",
        "lightningcss-linux-arm64-gnu": "1.33.0",
        "lightningcss-linux-arm64-musl": "1.33.0",
        "lightningcss-linux-x64-gnu": "1.33.0",
        "lightningcss-linux-x64-musl": "1.33.0",
        "lightningcss-win32-arm64-msvc": "1.33.0",
        "lightningcss-win32-x64-msvc": "1.33.0"
      }
    },
    "node_modules/lightningcss-android-arm64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.33.0.tgz",
      "integrity": "sha512-gEpRTalKdosp4Bb8qWtc2iOgE5SeIHlpS1up9bFq2wAyYhl1UdTObYiHe98zEM9SQvSoqQZ1IQD0JNpg3Ml5pg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-arm64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.33.0.tgz",
      "integrity": "sha512-Sciaz8eenNTKn9b3t7+xr0ipTp9YxKQY4npwQ3mrRuL0BAVHBLyZxofhaKBAVtzmtRZ/zTyo0/to4B1uWG/Djg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-x64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.33.0.tgz",
      "integrity": "sha512-Z5UPAxzrjlWNNyGy6i65cJzzvgJ5D3T6wMvs+gWpY9d7qRhANrxqAp6LhxIgZhWEw18RfJTGcRxjuLIBr+m8XQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-freebsd-x64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.33.0.tgz",
      "integrity": "sha512-QQM/Ti/hQajJwCY+RiWuCZ9sdtI/XQk7nDK5vC8kkdwixezOlDgvDx7+RT+QjK6FcFT4MpsuoBnHIo/O3StRRg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm-gnueabihf": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.33.0.tgz",
      "integrity": "sha512-N7FVBe6iS24MlM6R/4RBTxGhQheZGs7tiQ9U32UtF75NzP5Q7xWPRqLBCKxlRQRk3rY1jCIPLzx7WzOhuUIRLQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-gnu": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.33.0.tgz",
      "integrity": "sha512-j2v/itmy4HlNxlc6voKXYgBqNi0Ng2LShg4z7GufpEgs05P+2suBVyi9I6YHq5uoVFx9ETin3eCEhLVyXGQnKg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-musl": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.33.0.tgz",
      "integrity": "sha512-yiO5ROMuYQgXbC60yjZU5CYSFZGKXL0HFATXt9mHJn1+zW55oCtMI9NfcVhYLMFDL7gV7oBPon/EmMMGg2OvtQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-gnu": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.33.0.tgz",
      "integrity": "sha512-ar+Ju7LmcN0Jo4FpL4hpFybwNG9/3A/Br5KW2n2jyODg3MEZXaDYADdemoNS+BDNfMgKvylJLj4S5tyRActuAg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-musl": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.33.0.tgz",
      "integrity": "sha512-RYiYbkokw0trfKqqzfF55lginwEPrD3OJDfTuJzFs1MK6iFnDenaz1fqLLtX4ITG3OktJQXOeTaw1awrBAlZPw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-arm64-msvc": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.33.0.tgz",
      "integrity": "sha512-1K+MPfLSFVpphzpdbfkhlWk6wBrTObBzS2T6db10PNOZgR9GoVsAWzwNyuhUYYbTp23j+4RrncfujZ4uAzXvwA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-x64-msvc": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.33.0.tgz",
      "integrity": "sha512-OlEICDx/Xl0FqSp4bry8zFnCvGpig3Gl4gCquvYwHuqJKEC1+n9NgDniFvqHGmMv1ZkqDJrDqKKSykTDX+ehuA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/magic-string": {
      "version": "0.30.21",
      "resolved": "https://registry.npmjs.org/magic-string/-/magic-string-0.30.21.tgz",
      "integrity": "sha512-vd2F4YUyEXKGcLHoq+TEyCjxueSeHnFxyyjNp80yg0XV4vUhnDer/lvvlqM/arB5bXQN5K2/3oinyCRyx8T2CQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.5"
      }
    },
    "node_modules/nanoid": {
      "version": "3.3.20",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.20.tgz",
      "integrity": "sha512-uKdg2G3GNCKQn9byYOpxbGqrT2fGO5KRt5J/8b3pok8rT6qxGWF6hxMyJiEYtAf+FVyYuD9hRaDqX5uPFYJ4ZQ==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/picomatch": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz",
      "integrity": "sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/postcss": {
      "version": "8.5.31",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.31.tgz",
      "integrity": "sha512-YUbWYCgErwnMAVkjUnYa+KlMBzGpHwiIt/DE7f0G33AuX2LH9UcTk6KgWxd3zRU+pN3u/C+Xl3EnMLM4Hea7Sg==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.20",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.2"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/react": {
      "version": "19.3.1",
      "resolved": "https://registry.npmjs.org/react/-/react-19.3.1.tgz",
      "integrity": "sha512-QNhWdt7nrgVWWQG58QuGsAR3jv3Hbe4mb4vz7w2csnHavciZJgda1CPNaldF6eVxv90ud3jUXpKlHL69gO38yw==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "19.3.1",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-19.3.1.tgz",
      "integrity": "sha512-Y0bARz53lhEC1NMCASs0/j+faB/zqt3R8hpvg1e8+61ZVJ4UL0UdC4cBbXfZMcIuhrfgeILTLe+ZeBCavQPtKQ==",
      "license": "MIT",
      "dependencies": {
        "scheduler": "^0.28.0"
      },
      "peerDependencies": {
        "react": "^19.3.1"
      }
    },
    "node_modules/react-is": {
      "version": "19.3.1",
      "resolved": "https://registry.npmjs.org/react-is/-/react-is-19.3.1.tgz",
      "integrity": "sha512-RRieF6IyxQBkcK6pP8xOHprLTPW6QjRkbGdImtqNme+/hYVwCZkLQLdlZGOhUqXwkS9IEynaGvPJtv6XB/cz0Q==",
      "license": "MIT"
    },
    "node_modules/rolldown": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/rolldown/-/rolldown-1.2.15.tgz",
      "integrity": "sha512-6odND+fel5zVw3I4Yc2e69gvguDnX0CAAGiNDZSq4ik5WUcaLrkD2GLuog0XcODbor31hZ5ayEMgVDno+KPV5g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@oxc-project/types": "=0.155.0",
        "@rolldown/pluginutils": "^1.0.0"
      },
      "bin": {
        "rolldown": "bin/cli.mjs"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "optionalDependencies": {
        "@rolldown/binding-android-arm-eabi": "1.2.15",
        "@rolldown/binding-android-arm64": "1.2.15",
        "@rolldown/binding-darwin-arm64": "1.2.15",
        "@rolldown/binding-darwin-x64": "1.2.15",
        "@rolldown/binding-freebsd-x64": "1.2.15",
        "@rolldown/binding-linux-arm-gnueabihf": "1.2.15",
        "@rolldown/binding-linux-arm64-gnu": "1.2.15",
        "@rolldown/binding-linux-arm64-musl": "1.2.15",
        "@rolldown/binding-linux-ppc64-gnu": "1.2.15",
        "@rolldown/binding-linux-s390x-gnu": "1.2.15",
        "@rolldown/binding-linux-x64-gnu": "1.2.15",
        "@rolldown/binding-linux-x64-musl": "1.2.15",
        "@rolldown/binding-openharmony-arm64": "1.2.15",
        "@rolldown/binding-win32-arm64-msvc": "1.2.15",
        "@rolldown/binding-win32-x64-msvc": "1.2.15"
      }
    },
    "node_modules/scheduler": {
      "version": "0.28.0",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.28.0.tgz",
      "integrity": "sha512-juorfCmIkIw8tT+p5BXSm6PJjQF/ycEYmKyzURCIt/RaZIhL+PulbQ9Yu2z1HdOJDdqDTlxA1+xKBmHXJsczAw==",
      "license": "MIT"
    },
    "node_modules/scroll-into-view-if-needed": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/scroll-into-view-if-needed/-/scroll-into-view-if-needed-3.1.0.tgz",
      "integrity": "sha512-49oNpRjWRvnU8NyGVmUaYG4jtTkNonFZI86MmGRDqBphEK2EXT9gdEUoQPZhuBM8yWHxCWbobltqYO5M4XrUvQ==",
      "license": "MIT",
      "dependencies": {
        "compute-scroll-into-view": "^3.0.2"
      }
    },
    "node_modules/source-map-js": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.2.tgz",
      "integrity": "sha512-KGj/8Y43x35aZVDtt+J4mK1hoLGHULMYfSkODJNQjNDC3oW1PqPoxMwo0pLUsWM/UEGzON/NxeHywEfNXNP3Vw==",
      "dev": true,
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/string-convert": {
      "version": "0.2.1",
      "resolved": "https://registry.npmjs.org/string-convert/-/string-convert-0.2.1.tgz",
      "integrity": "sha512-u/1tdPl4yQnPBjnVrmdLo9gtuLvELKsAoRapekWggdiQNvvvum+jYF329d84NAa660KQw7pB2n36KrIKVoXa3A==",
      "license": "MIT"
    },
    "node_modules/stylis": {
      "version": "4.4.0",
      "resolved": "https://registry.npmjs.org/stylis/-/stylis-4.4.0.tgz",
      "integrity": "sha512-5Z9ZpRzfuH6l/UAvCPAPUo3665Nk2wLaZU3x+TLHKVzIz33+sbJqbtrYoC3KD4/uVOr2Zp+L0LySezP9OHV9yA==",
      "license": "MIT"
    },
    "node_modules/tailwindcss": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/tailwindcss/-/tailwindcss-4.3.3.tgz",
      "integrity": "sha512-gOhV3P7ufE62QDGg1zVaTgCR+EtPv92k2nIhVcVKcLmxT1sUBsQGhnZj175j+MqRt4zLF7ic+sCYjfhxMxj7YQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tapable": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/tapable/-/tapable-2.3.3.tgz",
      "integrity": "sha512-uxc/zpqFg6x7C8vOE7lh6Lbda8eEL9zmVm/PLeTPBRhh1xCgdWaQ+J1CUieGpIfm2HdtsUpRv+HshiasBMcc6A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/webpack"
      }
    },
    "node_modules/throttle-debounce": {
      "version": "5.0.2",
      "resolved": "https://registry.npmjs.org/throttle-debounce/-/throttle-debounce-5.0.2.tgz",
      "integrity": "sha512-B71/4oyj61iNH0KeCamLuE2rmKuTO5byTOSVwECM5FA7TiAiAW+UqTKZ9ERueC4qvgSttUhdmq1mXC3kJqGX7A==",
      "license": "MIT",
      "engines": {
        "node": ">=12.22"
      }
    },
    "node_modules/tinyglobby": {
      "version": "0.2.17",
      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz",
      "integrity": "sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fdir": "^6.5.0",
        "picomatch": "^4.0.4"
      },
      "engines": {
        "node": ">=12.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/tslib": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.3.0.tgz",
      "integrity": "sha512-N82ooyxVNm6h1riLCoyS9e3fuJ3AMG2zIZs2Gd1ATcSFjSA23Q0fzjjZeh0jbJvWVDZ0cJT8yaNNaaXHzueNjg==",
      "license": "0BSD"
    },
    "node_modules/typescript": {
      "version": "6.0.3",
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-6.0.3.tgz",
      "integrity": "sha512-y2TvuxSZPDyQakkFRPZHKFm+KKVqIisdg9/CZwm9ftvKXLP8NRWj38/ODjNbr43SsoXqNuAisEf1GdCxqWcdBw==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "tsc": "bin/tsc",
        "tsserver": "bin/tsserver"
      },
      "engines": {
        "node": ">=14.17"
      }
    },
    "node_modules/vite": {
      "version": "8.3.5",
      "resolved": "https://registry.npmjs.org/vite/-/vite-8.3.5.tgz",
      "integrity": "sha512-z1YpjieJ9g0ebTmQpLBv/oq9E3F9EIlOe+7LahW8SrE3LTiG3udBRUXQOlYXP9b+IC2q2phHeVxj9xGlw34OEQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "lightningcss": "^1.33.0",
        "picomatch": "^4.0.7",
        "postcss": "^8.5.30",
        "rolldown": "~1.2.14",
        "tinyglobby": "^0.2.17"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^20.19.0 || >=22.12.0",
        "@vitejs/devtools": "^0.7.1 || ^0.8.0",
        "esbuild": "^0.27.0 || ^0.28.0",
        "jiti": ">=1.21.0",
        "less": "^4.0.0",
        "sass": "^1.70.0",
        "sass-embedded": "^1.70.0",
        "stylus": ">=0.54.8",
        "sugarss": "^5.0.0",
        "terser": "^5.16.0",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "@vitejs/devtools": {
          "optional": true
        },
        "esbuild": {
          "optional": true
        },
        "jiti": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    },
    "node_modules/zrender": {
      "version": "6.1.0",
      "resolved": "https://registry.npmjs.org/zrender/-/zrender-6.1.0.tgz",
      "integrity": "sha512-oEGMDB6pOP2S6OwRR4PdVv610zrjnA3Bh+JnSG12fYJlBKjtNAoEb5fSUoCOOINlH96I2fU38/A2UpRKs67xYQ==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "tslib": "2.3.0"
      }
    }
  }
}
```

## E:\WorkMemo\src\Dashboard.tsx

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Collapse,
  DatePicker,
  Descriptions,
  Empty,
  Form,
  Input,
  Menu,
  Modal,
  Pagination,
  Segmented,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  type InputRef,
  type TableColumnsType,
} from "antd";
import dayjs from "dayjs";
import {
  CATEGORIES,
  formatDuration,
  formatTime,
  type SettleInput,
} from "./types";
import { formatQuantity, localDate } from "./history";
import {
  shiftPeriod,
  reportRangeLabel,
  type ReportPeriod,
} from "./reportPeriod";
import { useCategoryNames } from "./categoryNames";
import { DEFAULT_PRESENTATION, WorkBadge } from "./desktopPreferences";
import { validateWorkInput } from "./workInput";
import { Icon } from "./Icon";
import { UiProvider, useMediaQuery } from "./ui/UiProvider";
import { BottomSheet } from "./ui/BottomSheet";
import {
  api,
  initialQuery,
  type CategoryTotal,
  type Detail,
  type Query,
  type Row,
} from "./dashboard/api";
import { useDashboardData } from "./dashboard/useDashboardData";
import { CalendarChart, CategoryChart, TrendChart } from "./dashboard/Charts";
import "./Dashboard.css";

const minDate = dayjs("1970-01-01"),
  maxDate = dayjs("9999-12-31");
function RecordStatus({ row }: { row: Row }) {
  return (
    <Tag
      color={
        row.status !== "FINISHED"
          ? "processing"
          : row.settlement_status === "PENDING"
            ? "gold"
            : "success"
      }
    >
      {row.status !== "FINISHED"
        ? "进行中"
        : row.settlement_status === "PENDING"
          ? "待补全"
          : "已确认"}
    </Tag>
  );
}
function Title({ title, description }: { title: string; description: string }) {
  return (
    <div className="dc-card-title">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
function DashboardContent() {
  const { message } = AntApp.useApp();
  const { name } = useCategoryNames();
  const narrow = useMediaQuery("(max-width: 640px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [query, setQuery] = useState<Query>(initialQuery);
  const [filters, setFilters] = useState<Query>(initialQuery);
  const [refresh, setRefresh] = useState(0);
  const { data, meta, error, online, refreshing, updatedAt, loading } =
    useDashboardData(query, refresh);
  const [actionError, setActionError] = useState("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({
    category: "开发",
    quantity: "",
    remark: "",
  });
  const [editorError, setEditorError] = useState("");
  const [detailStale, setDetailStale] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const quantityInput = useRef<InputRef>(null);
  const safeConfirmAction = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const recordsRef = useRef<HTMLElement>(null);
  const [confirmation, setConfirmation] = useState<"guard" | "delete" | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const next = useRef<(() => void) | null>(null);
  const afterConfirm = useRef<(() => void) | null>(null);
  const [categoryMetric, setCategoryMetric] = useState("duration");
  const [section, setSection] = useState("overview");
  const presentation = meta?.presentation ?? DEFAULT_PRESENTATION;
  const categoryOptions = CATEGORIES.map((value) => ({
    value,
    label: name(value),
  }));
  const dirty =
    !!detail &&
    editing &&
    (fields.category !== detail.record.category ||
      fields.quantity !==
        (detail.record.quantity === null
          ? ""
          : String(detail.record.quantity)) ||
      fields.remark !== detail.record.remark);
  const blocked = busy || confirmation !== null;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0])
          setSection(entries[0].isIntersecting ? "records" : "overview");
      },
      { rootMargin: "-64px 0px -25% 0px" },
    );
    if (recordsRef.current) observer.observe(recordsRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (editing && sheetOpen && !confirmation)
      quantityInput.current?.focus({ preventScroll: true });
  }, [editing, sheetOpen, confirmation]);
  function applyQuery(value: Query) {
    setFilters(value);
    setQuery(value);
  }
  function selectPeriod(period: ReportPeriod) {
    applyQuery({
      ...filters,
      period,
      anchor_date:
        period === "custom"
          ? null
          : filters.anchor_date || data?.range.anchor_date || null,
      start_date: period === "custom" ? (data?.range.start_date ?? null) : null,
      end_date: period === "custom" ? (data?.range.end_date ?? null) : null,
      page: 1,
    });
  }
  function movePeriod(direction: number) {
    const anchor = data?.range.anchor_date;
    const shifted = anchor && shiftPeriod(query.period, anchor, direction);
    if (shifted) applyQuery({ ...query, anchor_date: shifted, page: 1 });
  }
  function leave(action: () => void) {
    if (busyRef.current || confirmation) return;
    if (dirty) {
      next.current = action;
      setConfirmation("guard");
      setConfirmOpen(true);
    } else action();
  }
  async function openDetail(row: Row, edit = false) {
    if (busyRef.current || detail) return;
    trigger.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    busyRef.current = true;
    setBusy(true);
    setActionError("");
    setEditorError("");
    try {
      const value = await api<Detail>("detail", { id: row.id });
      setDetail(value);
      setDetailStale(false);
      setFields({
        category: value.record.category,
        quantity:
          value.record.quantity === null ? "" : String(value.record.quantity),
        remark: value.record.remark,
      });
      setEditing(edit && value.record.status === "FINISHED");
      setSheetOpen(true);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  const save = useCallback(async () => {
    if (!detail || busyRef.current || !online) return false;
    const result = validateWorkInput(
      fields.category,
      fields.quantity,
      fields.remark,
      true,
    );
    if (!result.ok) {
      setEditorError(Object.values(result.errors).join(" "));
      return false;
    }
    if (result.input.quantity === null) return false;
    busyRef.current = true;
    setBusy(true);
    setEditorError("");
    let committed = false;
    try {
      const input: SettleInput = {
        ...result.input,
        quantity: result.input.quantity,
        id: detail.record.id,
        expected_revision: detail.record.revision,
      };
      await api("save", input);
      committed = true;
      // A successful write remains successful if its follow-up read fails.
      const record: Row = {
        ...detail.record,
        ...result.input,
        settlement_status: "COMPLETE",
      };
      setDetail({ ...detail, record });
      setEditing(false);
      setDetailStale(true);
      setFields({
        category: record.category,
        quantity: String(record.quantity),
        remark: record.remark,
      });
      setRefresh((value) => value + 1);
      const updated = await api<Detail>("detail", { id: detail.record.id });
      setDetail(updated);
      setDetailStale(false);
      void message.success({ content: "工作量已保存", key: "workload-save" });
      return true;
    } catch (e) {
      const text = e instanceof Error ? e.message : String(e);
      setEditorError(
        committed
          ? `已保存，详情刷新失败：${text}。请关闭后重新打开详情。`
          : text,
      );
      if (committed)
        void message.warning({
          content: "已保存，详情刷新失败",
          key: "workload-save",
        });
      return committed;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [detail, fields, online, message]);
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "s" &&
        editing &&
        sheetOpen &&
        !confirmation
      ) {
        event.preventDefault();
        void save();
      }
    };
    const unload = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("keydown", keys);
    window.addEventListener("beforeunload", unload);
    return () => {
      window.removeEventListener("keydown", keys);
      window.removeEventListener("beforeunload", unload);
    };
  }, [dirty, editing, sheetOpen, confirmation, save]);
  async function remove() {
    if (!deleting || busyRef.current || !online) return;
    busyRef.current = true;
    setBusy(true);
    setEditorError("");
    try {
      await api("delete", {
        id: deleting.id,
        expected_revision: deleting.revision,
      });
      setConfirmOpen(false);
      setRefresh((value) => value + 1);
      void message.success("记录已删除");
    } catch (e) {
      setEditorError(e instanceof Error ? e.message : String(e));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  function closeConfirmation() {
    if (!busyRef.current) {
      next.current = null;
      afterConfirm.current = null;
      setConfirmOpen(false);
    }
  }
  function restoreTrigger() {
    requestAnimationFrame(() => {
      (trigger.current?.isConnected
        ? trigger.current
        : recordsRef.current
      )?.focus({ preventScroll: true });
    });
  }
  const reportColumns: TableColumnsType<CategoryTotal> = [
    {
      title: "工作类型",
      dataIndex: "category",
      width: "29%",
      render: (value: string) => (
        <WorkBadge category={value} presentation={presentation} />
      ),
    },
    {
      title: "已确认工作量",
      key: "quantity",
      render: (_, row) => (
        <div className="dc-report-quantity">
          <strong>
            {row.complete > 0
              ? formatQuantity(row.quantity)
              : row.pending > 0
                ? "待补填"
                : "—"}
          </strong>
          <small>
            {row.complete > 0
              ? `已确认 ${row.complete} 条`
              : row.pending > 0
                ? "尚未确认产出"
                : "暂无已结束记录"}
          </small>
        </div>
      ),
    },
    {
      title: "有效工时",
      dataIndex: "duration_ms",
      render: (value: number) => (
        <span className="dc-number">{formatDuration(value / 1000)}</span>
      ),
    },
    {
      title: "已结束记录",
      dataIndex: "records",
      render: (value: number) => <span className="dc-number">{value} 条</span>,
    },
    {
      title: "待补填",
      dataIndex: "pending",
      render: (value: number) =>
        value > 0 ? (
          <Tag color="gold">{value} 条</Tag>
        ) : (
          <span className="dc-muted">0 条</span>
        ),
    },
  ];
  const recordColumns: TableColumnsType<Row> = [
    {
      title: "类别",
      dataIndex: "category",
      width: 150,
      render: (value: string, row) => (
        <Space orientation="vertical" size={4}>
          <WorkBadge category={value} presentation={presentation} />
          {row.is_demo && <Tag color="gold">演示</Tag>}
        </Space>
      ),
    },
    {
      title: "开始时间",
      dataIndex: "start_time",
      width: 170,
      render: (value: number) => (
        <span className="dc-date">{formatTime(value)}</span>
      ),
    },
    {
      title: "有效工时",
      dataIndex: "duration_ms",
      width: 120,
      render: (value: number) => (
        <span className="dc-number">{formatDuration(value / 1000)}</span>
      ),
    },
    {
      title: "工作量",
      key: "quantity",
      width: 110,
      render: (_, row) =>
        row.settlement_status === "COMPLETE" ? (
          <span className="dc-number">{formatQuantity(row.quantity)}</span>
        ) : (
          <span className="dc-muted">
            {row.status === "FINISHED" ? "待补填" : "进行中"}
          </span>
        ),
    },
    {
      title: "状态",
      key: "status",
      width: 100,
      render: (_, row) => <RecordStatus row={row} />,
    },
    {
      title: "备注",
      dataIndex: "remark",
      width: 190,
      ellipsis: true,
      render: (value: string) => (
        <span className="dc-muted">{value || "—"}</span>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 170,
      render: (_, row) => (
        <Space size={2} className="dc-row-actions">
          <Button
            type="link"
            size="small"
            disabled={busy}
            onClick={() => {
              void openDetail(row);
            }}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            disabled={!online || busy || row.status !== "FINISHED"}
            onClick={() => {
              void openDetail(row, true);
            }}
          >
            {row.settlement_status === "PENDING" ? "补填" : "编辑"}
          </Button>
          <Button
            type="text"
            danger
            size="small"
            disabled={!online || busy || row.status !== "FINISHED"}
            onClick={() => {
              setEditorError("");
              setDeleting(row);
              setConfirmation("delete");
              setConfirmOpen(true);
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];
  const totals = data?.totals;
  const scrollBehavior = reduced ? "instant" : "smooth";
  const dateField = (
    label: string,
    value: string | null,
    change: (value: string | null) => void,
    required = false,
  ) => (
    <Form.Item label={label}>
      <DatePicker
        aria-label={label}
        value={value ? dayjs(value) : null}
        minDate={minDate}
        maxDate={maxDate}
        allowClear={!required}
        format="YYYY-MM-DD"
        onChange={(date) => change(date?.format("YYYY-MM-DD") ?? null)}
        inputReadOnly={false}
      />
    </Form.Item>
  );
  return (
    <div className="data-center">
      <aside className="dc-sidebar" inert={!!detail || !!confirmation}>
        <Tooltip title="WorkMemo 工作数据中心" placement="right">
          <a
            className="dc-brand"
            href="/dashboard"
            aria-label="WorkMemo 工作数据中心"
          >
            <img src="/workmemo.png" alt="" />
          </a>
        </Tooltip>
        <Menu
          mode="inline"
          inlineCollapsed
          selectedKeys={[section]}
          items={[
            {
              key: "overview",
              icon: <Icon name="chart" />,
              label: "工作总览",
              title: "工作总览",
            },
            {
              key: "records",
              icon: <Icon name="list" />,
              label: "工作明细",
              title: "工作明细",
            },
          ]}
          onClick={({ key }) => {
            if (key === "records")
              recordsRef.current?.scrollIntoView({ behavior: scrollBehavior });
            else window.scrollTo({ top: 0, behavior: scrollBehavior });
          }}
        />
        <div className="dc-sidebar-bottom">
          <Tooltip
            title={`${online ? "本机连接正常" : "等待本机连接"} · v${meta?.version ?? "0.2.3"}`}
            placement="right"
          >
            <span
              className={`connection-dot ${online ? "connected" : ""}`}
              role="img"
              aria-label={online ? "本机连接正常" : "等待本机连接"}
            />
          </Tooltip>
        </div>
      </aside>
      <div className="dc-page" inert={!!detail || !!confirmation}>
        <header className="dc-topbar">
          <span className="dc-breadcrumb">
            我的工作空间 <span>/ 工作总览</span>
          </span>
          <Space size={12}>
            <span className="dc-sync" aria-live="polite">
              {refreshing
                ? "正在刷新…"
                : updatedAt
                  ? `更新于 ${new Date(updatedAt).toLocaleTimeString("zh-CN", { hour12: false })}`
                  : "等待连接"}
            </span>
            <Button
              icon={<Icon name="refresh" />}
              onClick={() => setRefresh((value) => value + 1)}
            >
              刷新连接
            </Button>
          </Space>
        </header>
        <main className="dc-main">
          <div className="dc-heading">
            <div>
              <span className="dc-eyebrow">WORK REPORT</span>
              <h1>工作总览</h1>
              <p>按类型看清工作量，按周期回顾投入。</p>
            </div>
            <Tag variant="filled">记录保存在本机</Tag>
          </div>
          {query.scope !== "real" && (
            <Alert
              className="dc-notice"
              type="warning"
              showIcon
              title={
                query.scope === "demo"
                  ? "正在查看演示数据"
                  : "当前结果包含演示数据"
              }
              description="示例仅用于查看效果，日常真实统计默认排除。"
            />
          )}
          {(error || actionError) && (
            <Alert
              className="dc-notice"
              type="error"
              showIcon
              title={
                data && error ? "刷新失败，当前显示上次结果" : "操作未完成"
              }
              description={actionError || error}
              action={
                <Button
                  size="small"
                  onClick={() => {
                    setActionError("");
                    setRefresh((value) => value + 1);
                  }}
                >
                  重试
                </Button>
              }
            />
          )}
          {meta?.active && (
            <Alert
              className="dc-notice dc-active"
              type="info"
              showIcon
              title={
                <Space wrap>
                  <WorkBadge
                    category={meta.active.category}
                    presentation={presentation}
                  />
                  <span>
                    {meta.active.is_paused
                      ? "当前任务已暂停"
                      : "当前任务正在计时"}
                  </span>
                </Space>
              }
              description="结束后可在这里补填工作量，进行中的任务不计入已结束报表。"
            />
          )}
          <Card
            className="dc-filters"
            styles={{ body: { padding: narrow ? 16 : 20 } }}
          >
            <div className="dc-period-bar">
              <Segmented
                aria-label="统计周期"
                value={filters.period}
                options={[
                  { value: "day", label: "日" },
                  { value: "week", label: "周" },
                  { value: "month", label: "月" },
                  { value: "custom", label: "自定义" },
                ]}
                onChange={(value) => selectPeriod(value as ReportPeriod)}
              />
              {query.period !== "custom" && (
                <div className="dc-period-nav">
                  <Button
                    aria-label="上一周期"
                    icon={<Icon name="left" />}
                    disabled={
                      !data?.range.anchor_date ||
                      !shiftPeriod(query.period, data.range.anchor_date, -1)
                    }
                    onClick={() => movePeriod(-1)}
                  />
                  <strong>
                    {data ? reportRangeLabel(data.range) : "正在读取周期…"}
                  </strong>
                  <Button
                    aria-label="下一周期"
                    icon={<Icon name="right" />}
                    disabled={
                      !data?.range.anchor_date ||
                      !shiftPeriod(query.period, data.range.anchor_date, 1)
                    }
                    onClick={() => movePeriod(1)}
                  />
                  <Button
                    onClick={() =>
                      applyQuery({ ...query, anchor_date: null, page: 1 })
                    }
                  >
                    {
                      {
                        day: "今天",
                        week: "本周",
                        month: "本月",
                        custom: "当前",
                      }[query.period]
                    }
                  </Button>
                </div>
              )}
            </div>
            <Form
              layout="vertical"
              className="dc-filter-form"
              onFinish={() => applyQuery({ ...filters, page: 1 })}
            >
              {filters.period === "custom" ? (
                <>
                  {dateField("开始日期", filters.start_date, (value) =>
                    setFilters({ ...filters, start_date: value }),
                  )}
                  {dateField("结束日期", filters.end_date, (value) =>
                    setFilters({ ...filters, end_date: value }),
                  )}
                </>
              ) : (
                dateField(
                  "基准日期",
                  filters.anchor_date ??
                    data?.range.anchor_date ??
                    localDate(new Date()),
                  (value) => setFilters({ ...filters, anchor_date: value }),
                  true,
                )
              )}
              <Form.Item label="类别">
                <Select
                  aria-label="筛选工作类别"
                  value={filters.category ?? ""}
                  options={[
                    { value: "", label: "全部类别" },
                    ...categoryOptions,
                  ]}
                  onChange={(value) =>
                    setFilters({ ...filters, category: value || null })
                  }
                />
              </Form.Item>
              <Form.Item label="状态">
                <Select
                  aria-label="筛选记录状态"
                  value={filters.status}
                  options={[
                    { value: "all", label: "全部状态" },
                    { value: "pending", label: "待补全" },
                    { value: "complete", label: "已确认" },
                    { value: "working", label: "进行中" },
                  ]}
                  onChange={(value) =>
                    setFilters({ ...filters, status: value })
                  }
                />
              </Form.Item>
              <Form.Item label="数据范围">
                <Select
                  aria-label="数据范围"
                  value={filters.scope}
                  options={[
                    { value: "real", label: "真实数据" },
                    { value: "demo", label: "演示数据" },
                    { value: "all", label: "全部数据" },
                  ]}
                  onChange={(value) => setFilters({ ...filters, scope: value })}
                />
              </Form.Item>
              <div className="dc-filter-actions">
                {filters.period === "custom" && (
                  <Button
                    onClick={() =>
                      applyQuery({
                        ...filters,
                        start_date: null,
                        end_date: null,
                        page: 1,
                      })
                    }
                  >
                    全部日期
                  </Button>
                )}
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<Icon name="search" />}
                >
                  应用筛选
                </Button>
              </div>
            </Form>
            <div className="dc-filter-summary">
              {JSON.stringify(filters) !== JSON.stringify(query)
                ? "筛选条件已修改，点击应用筛选后更新结果。"
                : `当前已应用 · ${data ? reportRangeLabel(data.range) : "正在读取周期"} · ${query.category ? name(query.category) : "全部类别"} · ${({ all: "全部状态", pending: "待补全", complete: "已确认", working: "进行中" } as Record<string, string>)[query.status]}`}
            </div>
          </Card>
          <section className="dc-kpis" aria-label="工作数据汇总">
            {[
              {
                label: "有效工时",
                value: totals ? (totals.duration_ms / 3600000).toFixed(1) : "—",
                unit: "小时",
                icon: "clock" as const,
                caption: "已结束记录的有效时间",
              },
              {
                label: "已结束记录",
                value: totals ? String(totals.records) : "—",
                unit: "条",
                icon: "list" as const,
                caption: "进行中的任务单独保留",
              },
              {
                label: "待补全",
                value: totals ? String(totals.pending) : "—",
                unit: "条",
                icon: "note" as const,
                caption: "工时已保存，等待填写工作量",
              },
            ].map((item) => (
              <Card key={item.label} className="dc-kpi">
                <div className="dc-kpi-label">
                  <span>{item.label}</span>
                  <Icon name={item.icon} />
                </div>
                <strong>
                  {item.value}
                  <small>{item.unit}</small>
                </strong>
                <p>{item.caption}</p>
              </Card>
            ))}
          </section>
          <Card
            className="dc-card dc-category-report"
            title={
              <Title
                title="分类工作量"
                description={`${data ? reportRangeLabel(data.range) : "正在读取…"} · 数量按类型分别合计`}
              />
            }
            extra={<Tag>自动汇总</Tag>}
            styles={{ body: { padding: 0 } }}
          >
            {loading ? (
              <div className="dc-loading" role="status">
                <Skeleton active paragraph={{ rows: 4 }} title={false} />
              </div>
            ) : data ? (
              <>
                {narrow ? (
                  <div className="dc-report-cards">
                    {data.categories.map((row) => (
                      <Card
                        size="small"
                        key={row.category}
                        title={
                          <WorkBadge
                            category={row.category}
                            presentation={presentation}
                          />
                        }
                      >
                        <dl>
                          <div>
                            <dt>已确认工作量</dt>
                            <dd className="dc-report-quantity">
                              <strong>
                                {row.complete > 0
                                  ? formatQuantity(row.quantity)
                                  : row.pending > 0
                                    ? "待补填"
                                    : "—"}
                              </strong>
                              <small>
                                {row.complete > 0
                                  ? `已确认 ${row.complete} 条`
                                  : row.pending > 0
                                    ? "尚未确认产出"
                                    : "暂无已结束记录"}
                              </small>
                            </dd>
                          </div>
                          <div>
                            <dt>有效工时</dt>
                            <dd className="dc-number">
                              {formatDuration(row.duration_ms / 1000)}
                            </dd>
                          </div>
                          <div>
                            <dt>已结束记录</dt>
                            <dd>{row.records} 条</dd>
                          </div>
                          <div>
                            <dt>待补填</dt>
                            <dd>
                              {row.pending > 0 ? (
                                <Tag color="gold">{row.pending} 条</Tag>
                              ) : (
                                "0 条"
                              )}
                            </dd>
                          </div>
                        </dl>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Table<CategoryTotal>
                    className="dc-report-table"
                    rowKey="category"
                    columns={reportColumns}
                    dataSource={data.categories}
                    pagination={false}
                    scroll={{ x: 680 }}
                  />
                )}
                <p className="dc-report-note">
                  按记录开始日期归属周期。未补填不视为 0；当前任务不计入此报表。
                </p>
                {data.totals.records === 0 && (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="这个范围还没有已结束记录"
                  />
                )}
              </>
            ) : (
              <Empty
                description="暂无统计结果，请检查连接后重试"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
          <Card
            className="dc-card dc-trend"
            title={
              <Title
                title="工作趋势"
                description={`${data?.range.trend_unit === "hour" ? "按开始小时汇总" : data?.range.trend_unit === "month" ? "按开始月份汇总" : "按开始日期汇总"} · 已结束记录的有效工时`}
              />
            }
            extra={<Tag>时间视角</Tag>}
            styles={{ body: { padding: "12px 8px 8px" } }}
          >
            {data ? (
              <TrendChart trend={data.trend} range={data.range} />
            ) : loading ? (
              <div className="dc-loading">
                <Skeleton active />
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无趋势数据"
              />
            )}
          </Card>
          <Collapse
            className="dc-auxiliary"
            items={[
              {
                key: "analysis",
                label: (
                  <span>
                    辅助分析{" "}
                    <small className="dc-muted">类别分布与工作的节奏</small>
                  </span>
                ),
                children: data ? (
                  <div className="dc-auxiliary-grid">
                    <Card
                      className="dc-category"
                      title={
                        <Title
                          title="工作分布"
                          description="按工作类别回顾投入"
                        />
                      }
                      extra={
                        <Select
                          aria-label="工作分布指标"
                          value={categoryMetric}
                          options={[
                            { value: "duration", label: "工时（小时）" },
                            { value: "quantity", label: "工作量" },
                          ]}
                          onChange={setCategoryMetric}
                        />
                      }
                      styles={{ body: { padding: 8 } }}
                    >
                      <CategoryChart
                        categories={data.categories}
                        presentation={presentation}
                        metric={categoryMetric}
                        onCategory={(label) => {
                          const key = CATEGORIES.find(
                            (value) => name(value) === label,
                          );
                          if (key)
                            applyQuery({ ...query, category: key, page: 1 });
                        }}
                      />
                    </Card>
                    <Card
                      className="dc-calendar"
                      title={
                        <Title
                          title="工作的节奏"
                          description="已应用筛选范围 · 最多展示近90天有效工时"
                        />
                      }
                      styles={{ body: { padding: 8 } }}
                    >
                      <CalendarChart
                        calendar={data.calendar}
                        range={data.range}
                      />
                      <div className="dc-heat-legend" aria-label="工时由少到多">
                        少{" "}
                        {[
                          "#ebedf0",
                          "#9be9a8",
                          "#40c463",
                          "#30a14e",
                          "#216e39",
                        ].map((color) => (
                          <i key={color} style={{ background: color }} />
                        ))}{" "}
                        多
                      </div>
                    </Card>
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无分析数据"
                  />
                ),
              },
            ]}
          />
          <section
            className="dc-records"
            id="records"
            ref={recordsRef}
            tabIndex={-1}
          >
            <Card
              className="dc-card"
              title={
                <Title
                  title="工作明细"
                  description="查看计时区间、补填工作量，或回顾修正记录。"
                />
              }
              extra={<Tag>{data ? data.record_count : "—"} 条记录</Tag>}
              styles={{ body: { padding: 0 } }}
            >
              {loading ? (
                <div className="dc-loading">
                  <Skeleton active paragraph={{ rows: 5 }} />
                </div>
              ) : (
                <Table<Row>
                  rowKey="id"
                  columns={recordColumns}
                  dataSource={data?.records ?? []}
                  pagination={false}
                  scroll={{ x: 1010 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          error ? "未能读取工作明细" : "当前筛选没有工作记录"
                        }
                      />
                    ),
                  }}
                />
              )}
              <footer className="dc-pagination">
                <span>每页 50 条 · 共 {data?.pages ?? "—"} 页</span>
                <Pagination
                  current={data?.page ?? query.page}
                  total={data?.record_count ?? 0}
                  pageSize={50}
                  showSizeChanger={false}
                  size={narrow ? "small" : undefined}
                  onChange={(page) => applyQuery({ ...query, page })}
                />
              </footer>
            </Card>
          </section>
          <footer className="dc-page-footer">
            WorkMemo · 记录留在本机，注意力留给手上的事。
          </footer>
        </main>
      </div>
      <BottomSheet
        open={sheetOpen}
        blocked={blocked}
        covered={!!confirmation}
        title={
          <div className="dc-sheet-title">
            <span className="dc-eyebrow">
              WORK RECORD {detail ? `#${detail.record.id}` : ""}
            </span>
            <h2>
              {editing ? "填写工作量" : "工作详情"}{" "}
              {detail?.record.is_demo && <Tag color="gold">演示数据</Tag>}
            </h2>
          </div>
        }
        drawerRender={(node) => (
          <div inert={!!confirmation} style={{ display: "contents" }}>
            {node}
          </div>
        )}
        onClose={() => leave(() => setSheetOpen(false))}
        afterOpenChange={(open) => {
          if (open && editing)
            quantityInput.current?.focus({ preventScroll: true });
          if (!open) {
            setDetail(null);
            setEditing(false);
            setEditorError("");
            restoreTrigger();
          }
        }}
        footer={
          <div className="dc-sheet-footer">
            <span className={dirty ? "dc-unsaved" : "dc-muted"}>
              {dirty ? "有未保存修改" : "数据保存在本机"}
            </span>
            <Space>
              <Button
                disabled={blocked}
                onClick={() => leave(() => setSheetOpen(false))}
              >
                关闭
              </Button>
              {editing ? (
                <Button
                  key="save"
                  type="primary"
                  form="dc-editor"
                  htmlType="submit"
                  aria-label="保存工作量"
                  aria-busy={busy}
                  loading={busy ? { delay: 120 } : false}
                  disabled={!online || !!confirmation}
                >
                  保存工作量
                </Button>
              ) : (
                <Button
                  key="edit"
                  type="primary"
                  aria-label="编辑工作量"
                  disabled={
                    !online ||
                    blocked ||
                    detailStale ||
                    detail?.record.status !== "FINISHED"
                  }
                  onClick={() => setEditing(true)}
                >
                  编辑工作量
                </Button>
              )}
            </Space>
          </div>
        }
      >
        {detail && (
          <div className="dc-detail-content">
            <div className="dc-record-summary">
              <WorkBadge
                category={detail.record.category}
                presentation={presentation}
              />
              <div>
                <strong>
                  {formatDuration(detail.record.duration_ms / 1000)}
                </strong>
                <small>有效工时</small>
              </div>
              <RecordStatus row={detail.record} />
            </div>
            <Descriptions
              className="dc-detail-times"
              size="small"
              column={narrow ? 1 : 2}
              items={[
                {
                  key: "start",
                  label: "开始",
                  children: formatTime(detail.record.start_time),
                },
                {
                  key: "end",
                  label: "结束",
                  children: detail.record.end_time
                    ? formatTime(detail.record.end_time)
                    : "尚未结束",
                },
              ]}
            />
            {editing ? (
              <Form
                id="dc-editor"
                layout="vertical"
                onFinish={() => {
                  void save();
                }}
                disabled={blocked}
              >
                <Form.Item label="工作类别" htmlFor="dc-category">
                  <Select
                    id="dc-category"
                    value={fields.category}
                    options={categoryOptions}
                    onChange={(value) =>
                      setFields((previous) => ({
                        ...previous,
                        category: value,
                      }))
                    }
                    getPopupContainer={(element) => element.parentElement!}
                  />
                </Form.Item>
                <Form.Item
                  label="工作量"
                  htmlFor="dc-quantity"
                  extra="0 表示已确认无产出；支持小数和科学计数，最大 10 亿。"
                >
                  <Input
                    id="dc-quantity"
                    ref={quantityInput}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="填写本次工作量"
                    value={fields.quantity}
                    onChange={(event) =>
                      setFields((previous) => ({
                        ...previous,
                        quantity: event.target.value,
                      }))
                    }
                  />
                </Form.Item>
                <Form.Item label="备注" htmlFor="dc-remark">
                  <Input.TextArea
                    id="dc-remark"
                    maxLength={4000}
                    rows={5}
                    value={fields.remark}
                    onChange={(event) =>
                      setFields((previous) => ({
                        ...previous,
                        remark: event.target.value,
                      }))
                    }
                  />
                </Form.Item>
                <p className="dc-muted">
                  修改类别、数量和备注，计时结果保持原样。Ctrl+S 保存。
                </p>
              </Form>
            ) : (
              <div>
                <div className="dc-detail-quantity">
                  <span>已确认工作量</span>
                  <strong>
                    {detail.record.settlement_status === "COMPLETE"
                      ? formatQuantity(detail.record.quantity)
                      : detail.record.status === "FINISHED"
                        ? "待补填"
                        : "进行中"}
                  </strong>
                </div>
                <div className="dc-detail-remark">
                  {detail.record.remark || "未填写备注。"}
                </div>
              </div>
            )}
            {editorError && (
              <Alert
                type="error"
                showIcon
                title={editorError}
                className="dc-notice"
              />
            )}
            <Collapse
              className="dc-audit"
              items={[
                {
                  key: "segments",
                  label: `计时区间（${detail.segments.length}）`,
                  children: detail.segments.length ? (
                    detail.segments.map((segment) => (
                      <div className="dc-segment" key={segment.id}>
                        <span>
                          {formatTime(segment.start_time)}
                          <br />
                          {segment.end_time
                            ? formatTime(segment.end_time)
                            : "计时中"}
                        </span>
                        <strong className="dc-number">
                          {formatDuration(segment.duration_ms / 1000)}
                        </strong>
                      </div>
                    ))
                  ) : (
                    <p className="dc-muted">
                      旧记录仅保留累计工时，没有可展示的区间。
                    </p>
                  ),
                },
                {
                  key: "revisions",
                  label: `修正记录（${detail.revisions.length}）`,
                  children: detail.revisions.length ? (
                    detail.revisions.map((revision) => (
                      <div className="dc-revision" key={revision.revision}>
                        <strong>
                          第 {revision.revision} 次 ·{" "}
                          {formatTime(revision.changed_at)}
                        </strong>
                        <p>
                          {name(revision.before?.category)} →{" "}
                          {name(revision.after?.category)} · 数量{" "}
                          {formatQuantity(revision.before?.quantity)} →{" "}
                          {formatQuantity(revision.after?.quantity)}
                        </p>
                        <p>
                          备注：{revision.before?.remark || "未填"} →{" "}
                          {revision.after?.remark || "未填"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="dc-muted">尚无修正。</p>
                  ),
                },
              ]}
            />
          </div>
        )}
      </BottomSheet>
      <Modal
        open={confirmOpen}
        centered
        width={460}
        zIndex={1200}
        mask={{ closable: false }}
        keyboard={!busy}
        closable={false}
        destroyOnHidden
        title={
          confirmation === "delete" ? "删除这条记录？" : "保留未保存的修改？"
        }
        onCancel={closeConfirmation}
        afterOpenChange={(open) => {
          if (open) safeConfirmAction.current?.focus({ preventScroll: true });
        }}
        afterClose={() => {
          setConfirmation(null);
          setDeleting(null);
          const action = afterConfirm.current;
          afterConfirm.current = null;
          action?.();
        }}
        footer={
          confirmation === "delete" ? (
            <Space>
              <Button
                ref={safeConfirmAction}
                disabled={busy}
                onClick={closeConfirmation}
              >
                取消
              </Button>
              <Button
                danger
                type="primary"
                aria-label="确认删除"
                loading={busy ? { delay: 120 } : false}
                disabled={!online}
                onClick={() => {
                  void remove();
                }}
              >
                确认删除
              </Button>
            </Space>
          ) : (
            <Space wrap>
              <Button
                type="primary"
                aria-label="保存并继续"
                loading={busy ? { delay: 120 } : false}
                disabled={!online}
                onClick={() => {
                  void save().then((ok) => {
                    if (ok) {
                      afterConfirm.current = next.current;
                      next.current = null;
                      setConfirmOpen(false);
                    }
                  });
                }}
              >
                保存并继续
              </Button>
              <Button
                disabled={busy}
                onClick={() => {
                  setEditing(false);
                  afterConfirm.current = next.current;
                  next.current = null;
                  setConfirmOpen(false);
                }}
              >
                放弃修改
              </Button>
              <Button
                ref={safeConfirmAction}
                disabled={busy}
                onClick={closeConfirmation}
              >
                继续编辑
              </Button>
            </Space>
          )
        }
      >
        {confirmation === "delete" ? (
          <>
            <p className="dc-confirm-description">
              {deleting &&
                `${name(deleting.category)} · ${formatTime(deleting.start_time)}${deleting.is_demo ? " · 演示数据" : ""}`}
            </p>
            <p className="dc-confirm-description">
              删除后不可撤销，计时区间和修正记录也会一同删除。
            </p>
          </>
        ) : (
          <p className="dc-confirm-description">
            保存成功后再离开；保存失败会保留输入。
          </p>
        )}
        {editorError && (
          <Alert
            className="dc-notice"
            type="error"
            title={editorError}
            showIcon
          />
        )}
      </Modal>
    </div>
  );
}
export default function Dashboard() {
  return (
    <UiProvider>
      <DashboardContent />
    </UiProvider>
  );
}
```

## E:\WorkMemo\src\Dashboard.css

```css
/* Web-only layout. Ant Design owns control appearance, focus, motion and overlays. */
/* Keep specificity below the library's `html body` scroll locker. */
body:where(:has(.data-center)) {
  overflow: auto;
  background: #f4f7f5;
}
/* Legacy desktop buttons use width:100%; web controls opt out without a global reset. */
.wm-ui-root .wm-btn:not(.wm-btn-icon-only),
.dc-sheet-root .wm-btn:not(.wm-btn-icon-only),
.wm-modal .wm-btn:not(.wm-btn-icon-only) {
  width: auto;
}
.data-center {
  min-height: 100vh;
  color: #243c33;
  background: #f4f7f5;
  font:
    14px/1.6 "Segoe UI",
    "Microsoft YaHei UI",
    sans-serif;
}
.data-center *,
.dc-sheet-root * {
  box-sizing: border-box;
}
.data-center h1,
.data-center h2,
.dc-sheet-title h2 {
  margin: 0;
  font-weight: 650;
  letter-spacing: -0.025em;
}
.data-center h2 {
  font-size: 16px;
}
.data-center p {
  margin: 0;
}
.data-center .icon,
.dc-sheet-root .icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  font-size: 17px;
}
.data-center .work-badge,
.dc-sheet-root .work-badge {
  min-width: 0;
  gap: 9px;
  font-weight: 550;
}
.data-center .work-badge > span:last-child,
.dc-sheet-root .work-badge > span:last-child {
  white-space: normal;
  overflow-wrap: anywhere;
}
.data-center .work-symbol,
.dc-sheet-root .work-symbol {
  width: 30px;
  height: 30px;
  border-radius: 9px;
}
.data-center .work-symbol .icon,
.dc-sheet-root .work-symbol .icon {
  font-size: 16px;
}
.dc-sidebar {
  width: 68px;
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 22px 0;
  background: #fff;
  border-right: 1px solid #e3ebe5;
}
.dc-brand {
  display: inline-flex;
  margin-bottom: 26px;
}
.dc-brand img {
  width: 36px;
  height: 36px;
}
.dc-sidebar-bottom {
  margin-top: auto;
  padding-top: 20px;
}
.connection-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #b48350;
  box-shadow: 0 0 0 4px #b4835010;
}
.connection-dot.connected {
  background: #37936d;
  box-shadow: 0 0 0 4px #37936d10;
}
.dc-page {
  margin-left: 68px;
}
.dc-topbar {
  position: sticky;
  top: 0;
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 64px;
  padding: 0 28px;
  background: rgb(255 255 255 / 95%);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e3ebe5;
}
.dc-breadcrumb {
  font-size: 12px;
  color: #64796d;
  white-space: nowrap;
}
.dc-breadcrumb > span {
  color: #89998f;
  margin-left: 12px;
}
.dc-sync {
  display: inline-block;
  min-width: 118px;
  color: #89998f;
  font-size: 11px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.dc-main {
  max-width: 1380px;
  margin: auto;
  padding: 28px 28px 0;
}
.dc-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}
.dc-eyebrow {
  display: block;
  font-size: 10px;
  letter-spacing: 0.16em;
  color: #86998d;
  margin-bottom: 6px;
  font-weight: 600;
}
.dc-heading h1 {
  font-size: 28px;
  line-height: 1.3;
  margin-bottom: 7px;
}
.dc-heading p {
  font-size: 13px;
  color: #718579;
}
.dc-notice {
  margin-block: 14px;
}
.dc-period-bar,
.dc-period-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.dc-period-nav {
  justify-content: flex-start;
}
.dc-period-nav strong {
  min-width: 154px;
  text-align: center;
  color: #355b46;
  font-size: 14px;
  font-weight: 550;
}
.dc-filter-form {
  display: flex;
  align-items: end;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 18px;
}
.dc-filter-form > .wm-form-item {
  flex: 1 1 136px;
  min-width: 120px;
  margin-bottom: 0;
}
.dc-filter-form .wm-picker,
.dc-filter-form .wm-select {
  width: 100%;
}
.dc-filter-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.dc-filter-summary {
  border-top: 1px solid #edf2ee;
  margin-top: 16px;
  padding-top: 12px;
  min-height: 30px;
  font-size: 11px;
  color: #7b8e81;
  overflow-wrap: anywhere;
}
.dc-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-block: 18px;
}
.dc-kpi-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: #718579;
}
.dc-kpi-label .icon {
  color: #87a58f;
}
.dc-kpi strong {
  display: block;
  font-size: 30px;
  font-weight: 650;
  line-height: 1.6;
  color: #284d3a;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.dc-kpi strong small {
  font-size: 12px;
  font-weight: 400;
  margin-left: 8px;
  color: #7b8e81;
}
.dc-kpi p {
  font-size: 11px;
  color: #7b8e81;
}
.dc-card {
  min-width: 0;
  margin-bottom: 18px;
}
.dc-card-title {
  padding-block: 16px;
  white-space: normal;
}
.dc-card-title p {
  margin-top: 4px;
  font-size: 11px;
  color: #7b8e81;
  font-weight: 400;
}
.dc-report-quantity strong {
  display: block;
  font-size: 22px;
  font-weight: 650;
  line-height: 1.4;
  color: #284d3a;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.dc-report-quantity small {
  display: block;
  margin-top: 3px;
  font-size: 11px;
  color: #7b8e81;
}
.dc-number {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.dc-date {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.dc-muted {
  color: #7b8e81;
  font-size: 12px;
}
.dc-report-note {
  padding: 14px 24px;
  color: #7b8e81;
  font-size: 11px;
}
.dc-report-cards {
  display: grid;
  gap: 12px;
  padding: 12px;
}
.dc-report-cards dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 0;
}
.dc-report-cards dt {
  font-size: 11px;
  color: #7b8e81;
  margin-bottom: 6px;
}
.dc-report-cards dd {
  margin: 0;
}
.dc-chart {
  width: 100%;
  height: 260px;
  overflow: hidden;
}
.dc-auxiliary {
  margin-bottom: 18px;
}
.dc-auxiliary small {
  margin-left: 10px;
}
.dc-auxiliary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.dc-auxiliary-grid > * {
  min-width: 0;
}
.dc-category .dc-chart {
  height: 180px;
}
.dc-calendar .dc-chart {
  height: 158px;
}
.dc-heat-legend {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding-bottom: 8px;
  font-size: 10px;
  color: #7b8e81;
}
.dc-heat-legend i {
  width: 11px;
  height: 11px;
  border-radius: 2px;
  border: 1px solid #1f23281a;
}
.dc-records {
  scroll-margin-top: 80px;
  outline: none;
}
.dc-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 24px;
  flex-wrap: wrap;
}
.dc-pagination > span {
  color: #7b8e81;
  font-size: 11px;
}
.dc-page-footer {
  text-align: center;
  color: #899c8f;
  font-size: 11px;
  padding: 12px 0 28px;
}
.dc-loading {
  padding: 24px;
}
.dc-sheet-title h2 {
  font-size: 20px;
  color: #243c33;
}
.dc-sheet-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.dc-unsaved {
  font-size: 12px;
  color: #9c752f;
}
.dc-record-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 18px;
  background: #f4f8f5;
  border: 1px solid #e6eee8;
  border-radius: 12px;
}
.dc-record-summary > div {
  margin-left: auto;
  text-align: right;
}
.dc-record-summary strong {
  display: block;
  font:
    600 24px/1.4 ui-monospace,
    monospace;
  color: #284d3a;
}
.dc-record-summary small {
  display: block;
  color: #7b8e81;
  font-size: 11px;
}
.dc-detail-times {
  margin-block: 22px;
}
.dc-detail-quantity {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  color: #7b8e81;
}
.dc-detail-quantity strong {
  color: #284d3a;
  font-size: 24px;
  font-variant-numeric: tabular-nums;
}
.dc-detail-remark {
  padding: 16px;
  min-height: 76px;
  background: #f7faf8;
  border-radius: 10px;
  color: #526c5d;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.9;
}
.dc-audit {
  margin-top: 22px;
}
.dc-segment {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-block: 12px;
  border-bottom: 1px solid #e9efeb;
  font-size: 12px;
  color: #65796f;
}
.dc-revision {
  padding-block: 12px;
  border-bottom: 1px solid #e9efeb;
  font-size: 12px;
  color: #65796f;
  overflow-wrap: anywhere;
}
.dc-revision p {
  margin-block: 8px 0;
  white-space: pre-wrap;
}
.dc-confirm-description {
  color: #65796f;
  line-height: 1.9;
  margin-block: 12px;
  overflow-wrap: anywhere;
}
@media (max-width: 1000px) {
  .dc-main {
    padding: 24px 20px 0;
  }
  .dc-topbar {
    padding-inline: 20px;
  }
  .dc-auxiliary-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 760px) {
  .dc-sidebar {
    display: none;
  }
  .dc-page {
    margin-left: 0;
  }
  .dc-breadcrumb > span,
  .dc-sync {
    display: none;
  }
  .dc-main {
    padding: 20px 16px 0;
  }
  .dc-topbar {
    padding-inline: 16px;
  }
}
@media (max-width: 640px) {
  .dc-main {
    padding-inline: 12px;
  }
  .dc-heading {
    align-items: flex-start;
  }
  .dc-heading h1 {
    font-size: 24px;
  }
  .dc-heading > .wm-tag {
    display: none;
  }
  .dc-period-bar {
    justify-content: center;
  }
  .dc-period-nav {
    justify-content: center;
    gap: 6px;
  }
  .dc-period-nav strong {
    min-width: 138px;
    font-size: 12px;
  }
  .dc-filter-form {
    gap: 12px;
  }
  .dc-filter-form > .wm-form-item {
    flex-basis: calc(50% - 6px);
    min-width: 0;
  }
  .dc-filter-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .dc-kpis {
    gap: 8px;
  }
  .dc-kpi .wm-card-body {
    padding: 12px 10px;
  }
  .dc-kpi strong {
    font-size: 23px;
  }
  .dc-kpi strong small {
    display: block;
    margin: 0;
    line-height: 1.4;
  }
  .dc-kpi-label {
    font-size: 11px;
  }
  .dc-kpi-label .icon {
    display: none;
  }
  .dc-kpi p {
    font-size: 10px;
    margin-top: 8px;
  }
  .dc-auxiliary small {
    display: block;
    margin-left: 0;
  }
  .dc-pagination {
    padding: 16px;
  }
  .dc-sheet-footer {
    flex-wrap: wrap;
  }
  .dc-sheet-footer > span {
    font-size: 11px;
  }
  .dc-report-note {
    padding-inline: 16px;
  }
}
```

## E:\WorkMemo\src\ui\UiProvider.tsx

```tsx
import { App, ConfigProvider, type ThemeConfig } from "antd";
import zhCN from "antd/locale/zh_CN";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );
  useEffect(() => {
    const media = window.matchMedia(query);
    const change = () => setMatches(media.matches);
    change();
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, [query]);
  return matches;
}

/** Shared Ant Design configuration; imported only by surfaces that opt into it. */
export function UiProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const theme = useMemo<ThemeConfig>(
    () => ({
      token: {
        colorPrimary: "#287b63",
        colorInfo: "#287b63",
        colorSuccess: "#287b63",
        colorText: "#243c33",
        colorTextSecondary: "#65796f",
        colorBgLayout: "#f4f7f5",
        colorBorder: "#dce6df",
        colorBorderSecondary: "#e9efeb",
        colorError: "#b74251",
        colorInfoBg: "#eef7f2",
        colorInfoBorder: "#cfe5d8",
        colorSuccessBg: "#edf7f0",
        colorSuccessBorder: "#cfe5d8",
        colorPrimaryBg: "#eaf3ee",
        fontFamily: '"Segoe UI", "Microsoft YaHei UI", sans-serif',
        fontSize: 14,
        borderRadius: 10,
        controlHeight: 38,
        motion: !reducedMotion,
        motionDurationMid: "0.18s",
        motionDurationSlow: "0.24s",
      },
      components: {
        Button: {
          primaryShadow: "none",
          defaultShadow: "none",
          fontWeight: 500,
        },
        Table: {
          headerBg: "#f6f9f7",
          headerColor: "#65796f",
          rowHoverBg: "#f7faf8",
          cellPaddingBlock: 16,
        },
        Drawer: { footerPaddingBlock: 16, footerPaddingInline: 24 },
        Menu: {
          collapsedWidth: 68,
          itemBorderRadius: 10,
          itemSelectedBg: "#eaf3ee",
        },
      },
    }),
    [reducedMotion],
  );
  return (
    <ConfigProvider
      prefixCls="wm"
      locale={zhCN}
      theme={theme}
      button={{ autoInsertSpace: false }}
    >
      <App className="wm-ui-root">{children}</App>
    </ConfigProvider>
  );
}
```

## E:\WorkMemo\src\ui\BottomSheet.tsx

```tsx
import { Drawer, type DrawerProps } from "antd";
import { useMediaQuery } from "./UiProvider";

/** Ant Design owns motion, focus registration and scroll locking. */
export function BottomSheet({
  blocked = false,
  covered = false,
  ...props
}: DrawerProps & { blocked?: boolean; covered?: boolean }) {
  const narrow = useMediaQuery("(max-width: 640px)");
  // Percentages follow the fixed overlay's visible height, including CSS/browser zoom.
  return (
    <Drawer
      {...props}
      placement="bottom"
      size={narrow ? "92%" : "min(760px, 88%)"}
      rootClassName="dc-sheet-root"
      className="dc-sheet"
      destroyOnHidden={false}
      push={false}
      mask={{ closable: false }}
      keyboard={!blocked}
      focusable={{ trap: !covered, focusTriggerAfterClose: true }}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        // Ant Design 6.6's focus lock handles DOM focus changes, but Edge can move
        // Tab from the final control into browser chrome without a focusin event.
        // Complete that boundary through the official Drawer's keyboard hook.
        if (covered || event.defaultPrevented || event.key !== "Tab") return;
        const controls = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            "button, input, textarea, select, a[href], [tabindex]",
          ),
        ].filter(
          (element) =>
            element.tabIndex >= 0 &&
            !element.matches(":disabled") &&
            !element.closest("[inert]") &&
            element.getClientRects().length > 0,
        );
        const first = controls[0],
          last = controls[controls.length - 1];
        const target =
          event.shiftKey && document.activeElement === first
            ? last
            : !event.shiftKey && document.activeElement === last
              ? first
              : null;
        if (target) {
          event.preventDefault();
          target.focus({ preventScroll: true });
        }
      }}
      closable={{
        disabled: blocked,
        placement: "end",
        "aria-label": "关闭工作详情",
      }}
      styles={{
        wrapper: {
          width: narrow ? "100%" : "min(760px, calc(100% - 48px))",
          marginInline: "auto",
          insetInline: 0,
          bottom: narrow ? 0 : 24,
          borderRadius: narrow ? "20px 20px 0 0" : 20,
          overflow: "hidden",
        },
        section: {
          borderRadius: narrow ? "20px 20px 0 0" : 20,
          overflow: "hidden",
          boxShadow: "0 24px 90px #173c2b30",
        },
        header: { padding: "20px 24px", flexShrink: 0 },
        body: {
          padding: "22px 24px",
          overscrollBehavior: "contain",
          overflowY: blocked ? "hidden" : "auto",
        },
        footer: { flexShrink: 0, background: "#fff" },
        mask: {
          background: "rgb(20 38 30 / 30%)",
          backdropFilter: "blur(3px)",
        },
      }}
    />
  );
}
```

## E:\WorkMemo\src\dashboard\api.ts

```typescript
import type { WorkRecord } from "../types";
import type { CategoryNames } from "../categoryNames";
import type { Presentation } from "../desktopPreferences";
import type { ReportPeriod, ReportRange } from "../reportPeriod";

export type Row = WorkRecord & { is_demo: boolean; demo_batch: string | null };
export type Query = {
  period: ReportPeriod;
  anchor_date: string | null;
  start_date: string | null;
  end_date: string | null;
  category: string | null;
  scope: "real" | "demo" | "all";
  status: string;
  page: number;
};
export type CategoryTotal = {
  category: string;
  duration_ms: number;
  quantity: number;
  records: number;
  complete: number;
  pending: number;
};
export type Data = {
  range: ReportRange;
  totals: {
    duration_ms: number;
    quantity: number;
    records: number;
    pending: number;
  };
  trend: {
    date: string;
    duration_ms: number;
    quantity: number;
    records: number;
  }[];
  monthly: boolean;
  categories: CategoryTotal[];
  calendar: [string, number][];
  records: Row[];
  record_count: number;
  page: number;
  pages: number;
  scope: string;
};
export type Detail = {
  record: Row;
  segments: {
    id: number;
    start_time: number;
    end_time: number | null;
    duration_ms: number;
    state: string;
  }[];
  revisions: {
    revision: number;
    changed_at: number;
    before: WorkRecord;
    after: WorkRecord;
  }[];
};
export type Meta = {
  version: string;
  category_names: CategoryNames;
  presentation: Presentation;
  active: WorkRecord | null;
};
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 0,
  ) {
    super(message);
  }
}
const entry = new URLSearchParams(location.hash.slice(1));
const incoming = entry.get("token");
if (incoming) {
  sessionStorage.setItem("workmemo-token", incoming);
  history.replaceState(null, "", location.pathname + location.search);
}
const sessionToken = incoming ?? sessionStorage.getItem("workmemo-token") ?? "";
export function initialQuery(): Query {
  const pending = entry.get("view") === "pending";
  return {
    period: pending ? "custom" : "day",
    anchor_date: null,
    start_date: null,
    end_date: null,
    category: null,
    scope: entry.get("scope") === "demo" ? "demo" : "real",
    status: pending ? "pending" : "all",
    page: 1,
  };
}
export async function api<T>(path: string, body?: unknown): Promise<T> {
  if (!sessionToken)
    throw new ApiError("请从 WorkMemo 打开数据中心，以建立本机连接。", 403);
  try {
    const response = await fetch(`/api/${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(8000),
    });
    let result: T & { error?: string };
    try {
      result = await response.json();
    } catch {
      throw new ApiError(
        "连接授权已失效，请从 WorkMemo 重新打开数据中心。",
        response.status,
      );
    }
    if (!response.ok)
      throw new ApiError(result.error ?? "操作未完成。", response.status);
    return result;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(
      "与 WorkMemo 的连接已中断。请保持软件在后台运行，再刷新连接。",
    );
  }
}
```

## E:\WorkMemo\src\dashboard\useDashboardData.ts

```typescript
import { useEffect, useRef, useState } from "react";
import { useCategoryNames } from "../categoryNames";
import { api, ApiError, type Data, type Meta, type Query } from "./api";

function equal(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}
function reconcile(previous: Data | null, value: Data): Data {
  if (!previous) return value;
  if (equal(previous, value)) return previous;
  // Keep unchanged chart inputs stable even when only a quantity or active timer changes.
  return {
    ...value,
    trend: equal(previous.trend, value.trend) ? previous.trend : value.trend,
    calendar: equal(previous.calendar, value.calendar)
      ? previous.calendar
      : value.calendar,
    categories: equal(previous.categories, value.categories)
      ? previous.categories
      : value.categories,
    range: equal(previous.range, value.range) ? previous.range : value.range,
  };
}

export function useDashboardData(query: Query, refresh: number) {
  const key = JSON.stringify(query);
  const [snapshot, setSnapshot] = useState<{ key: string; value: Data | null }>(
    { key, value: null },
  );
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const names = useRef("");
  const { accept } = useCategoryNames();
  useEffect(() => {
    let stopped = false;
    let reading = false;
    setError("");
    setRefreshing(true);
    async function load() {
      if (reading) return;
      reading = true;
      try {
        const metadata = await api<Meta>("meta");
        if (stopped) return;
        setMeta((previous) =>
          equal(previous, metadata) ? previous : metadata,
        );
        const nameKey = JSON.stringify(metadata.category_names);
        if (names.current !== nameKey) {
          names.current = nameKey;
          accept(metadata.category_names);
        }
        setOnline(true);
        const rows = await api<Data>("query", query);
        if (stopped) return;
        setSnapshot((previous) => {
          const value = reconcile(
            previous.key === key ? previous.value : null,
            rows,
          );
          return previous.key === key && previous.value === value
            ? previous
            : { key, value };
        });
        setUpdatedAt(Date.now());
        setError("");
      } catch (e) {
        if (stopped) return;
        setError(e instanceof Error ? e.message : String(e));
        if (!(e instanceof ApiError) || e.status === 0 || e.status === 403)
          setOnline(false);
      } finally {
        reading = false;
        if (!stopped) setRefreshing(false);
      }
    }
    void load();
    const timer = setInterval(() => {
      if (!document.hidden) void load();
    }, 2000);
    const focus = () => {
      void load();
    };
    window.addEventListener("focus", focus);
    return () => {
      stopped = true;
      clearInterval(timer);
      window.removeEventListener("focus", focus);
    };
    // key is the complete serialized request, including pagination and source scope.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, refresh, accept]);
  const data = snapshot.key === key ? snapshot.value : null;
  return {
    data,
    meta,
    error,
    online,
    refreshing,
    updatedAt,
    loading: !data && !error,
  };
}
```

## E:\WorkMemo\src\dashboard\Charts.tsx

```tsx
import { memo, useEffect, useMemo, useRef } from "react";
import { init, use as registerCharts, type ECharts } from "echarts/core";
import { BarChart, LineChart, HeatmapChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CalendarComponent,
  VisualMapComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";
import type { Data } from "./api";
import type { Presentation } from "../desktopPreferences";
import { localDate } from "../history";
import { useCategoryNames } from "../categoryNames";
import { useMediaQuery } from "../ui/UiProvider";

registerCharts([
  BarChart,
  LineChart,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CalendarComponent,
  VisualMapComponent,
  CanvasRenderer,
]);
const tooltip = {
  renderMode: "richText" as const,
  backgroundColor: "#fff",
  borderColor: "#dce6df",
  textStyle: { color: "#243c33" },
};

const Chart = memo(function Chart({
  option,
  label,
  onCategory,
}: {
  option: EChartsOption;
  label: string;
  onCategory?: (name: string) => void;
}) {
  const node = useRef<HTMLDivElement>(null);
  const chart = useRef<ECharts | null>(null);
  const click = useRef(onCategory);
  click.current = onCategory;
  useEffect(() => {
    if (!node.current) return;
    const instance = init(node.current, undefined, { renderer: "canvas" });
    chart.current = instance;
    instance.on("click", (p) => {
      if (typeof p.name === "string") click.current?.(p.name);
    });
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const host = node.current;
        if (
          host &&
          (instance.getWidth() !== host.clientWidth ||
            instance.getHeight() !== host.clientHeight)
        )
          instance.resize();
      });
    });
    observer.observe(node.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      instance.dispose();
      chart.current = null;
    };
  }, []);
  useEffect(() => {
    // Merge named series; a poll must not replace the whole chart or replay its entrance.
    chart.current?.setOption(option, {
      replaceMerge: ["series"],
      lazyUpdate: true,
    });
  }, [option]);
  return <div ref={node} className="dc-chart" role="img" aria-label={label} />;
});

export function TrendChart({ trend, range }: Pick<Data, "trend" | "range">) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const option = useMemo<EChartsOption>(
    () => ({
      animation: !reduced,
      animationDuration: 240,
      animationDurationUpdate: 160,
      tooltip: {
        ...tooltip,
        trigger: "axis",
        valueFormatter: (value: unknown) =>
          `${Number(value).toLocaleString("zh-CN", { maximumFractionDigits: 4 })} 小时`,
      },
      legend: { top: 0, right: 16, data: ["有效工时"] },
      grid: { left: 22, right: 24, top: 64, bottom: 20, containLabel: true },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: trend.map((x) => x.date),
        axisLine: { lineStyle: { color: "#dce7e0" } },
        axisTick: { show: false },
        axisLabel: {
          color: "#718078",
          hideOverlap: true,
          showMinLabel: true,
          showMaxLabel: true,
          formatter: (value: string) =>
            range.trend_unit === "hour" ? value : value.slice(5),
        },
      },
      yAxis: {
        type: "value",
        name: "小时",
        min: 0,
        axisLabel: { color: "#718078" },
        splitLine: { lineStyle: { color: "#edf2ef", type: "dashed" } },
      },
      series: [
        {
          id: "work-duration",
          name: "有效工时",
          type: "line",
          smooth: false,
          symbolSize: 5,
          data: trend.map((x) => x.duration_ms / 3600000),
          lineStyle: { width: 2.5, color: "#287b63" },
          itemStyle: { color: "#287b63" },
          areaStyle: { color: "#eaf3ee", opacity: 0.7 },
        },
      ],
    }),
    [trend, range, reduced],
  );
  return <Chart option={option} label="有效工时趋势" />;
}

export function CategoryChart({
  categories,
  presentation,
  metric,
  onCategory,
}: {
  categories: Data["categories"];
  presentation: Presentation;
  metric: string;
  onCategory: (name: string) => void;
}) {
  const { name } = useCategoryNames();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const option = useMemo<EChartsOption>(
    () => ({
      animation: !reduced,
      animationDuration: 240,
      animationDurationUpdate: 160,
      tooltip: { ...tooltip, trigger: "axis" },
      grid: { left: 12, right: 22, top: 25, bottom: 28, containLabel: true },
      xAxis: { type: "value", splitLine: { lineStyle: { color: "#eef2f0" } } },
      yAxis: {
        type: "category",
        data: categories.map((x) => name(x.category)),
        axisLabel: { width: 100, overflow: "truncate" },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series: [
        {
          id: "category-total",
          type: "bar",
          barMaxWidth: 24,
          data: categories.map((x) => ({
            name: name(x.category),
            value:
              metric === "duration"
                ? Number((x.duration_ms / 3600000).toFixed(2))
                : x.quantity,
            itemStyle: {
              color: presentation.categories[x.category]?.color,
              borderRadius: [0, 5, 5, 0],
            },
          })),
        },
      ],
    }),
    [categories, presentation, metric, name, reduced],
  );
  return (
    <Chart
      option={option}
      label="按类别汇总的工作分布"
      onCategory={onCategory}
    />
  );
}

export function CalendarChart({
  calendar,
  range,
}: Pick<Data, "calendar" | "range">) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const option = useMemo<EChartsOption>(() => {
    const end = range.end_date ?? localDate(new Date());
    const start = new Date(`${end}T12:00:00`);
    start.setDate(start.getDate() - 89);
    const startDate =
      range.start_date && range.start_date > localDate(start)
        ? range.start_date
        : localDate(start);
    const max = Math.max(1, ...calendar.map((v) => v[1]));
    return {
      animation: !reduced,
      tooltip: {
        ...tooltip,
        formatter: (p: unknown) => {
          const point = (p as { value?: [string, number] }).value;
          return point
            ? `${point[0]}  ${(point[1] / 3600000).toFixed(2)} 小时`
            : "";
        },
      },
      visualMap: {
        type: "piecewise",
        show: false,
        pieces: [
          { value: 0, color: "#ebedf0" },
          ...["#9be9a8", "#40c463", "#30a14e", "#216e39"].map((color, i) => ({
            gt: (i * max) / 4,
            lte: ((i + 1) * max) / 4,
            color,
          })),
        ],
      },
      calendar: {
        range: [startDate, end],
        cellSize: [16, 16],
        left: "center",
        top: 32,
        yearLabel: { show: false },
        monthLabel: { nameMap: "cn", color: "#65796f" },
        dayLabel: { firstDay: 1, nameMap: "cn", color: "#718078" },
        splitLine: { lineStyle: { color: "#dce6df" } },
        itemStyle: { borderWidth: 3, borderColor: "#fff", color: "#ebedf0" },
      },
      series: [
        {
          id: "work-calendar",
          type: "heatmap",
          coordinateSystem: "calendar",
          data: calendar,
        },
      ],
    };
  }, [calendar, range, reduced]);
  return <Chart option={option} label="筛选范围内的有效工时工作日历" />;
}
```

## E:\WorkMemo\scripts\dashboard-fixture.mjs

```javascript
// HTTP fixtures for browser verification only. Never connects to a WorkMemo database.
export const keys = ["评测", "质检", "开发", "文档"];
export const fixtureDate = "2026-10-29";
export async function dashboardFixture(page) {
  const names = {
    revision: 1,
    names: { 评测: "评测", 质检: "质检", 开发: "代码开发", 文档: "文档" },
  };
  const presentation = {
    version: 1,
    revision: 0,
    background: null,
    categories: Object.fromEntries(
      keys.map((key, i) => [
        key,
        {
          icon: ["checkSquare", "safety", "code", "note"][i],
          color: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"][i],
        },
      ]),
    ),
  };
  const records = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    category: i < 5 ? "评测" : i === 5 ? "质检" : "开发",
    quantity: i < 4 ? [30, 40, 50, 8.5][i] : i === 5 ? 0 : null,
    remark: "隔离测试记录 · 不写入用户数据库",
    start_time: Date.parse(`${fixtureDate}T09:00:00+08:00`) + i * 1800000,
    end_time: Date.parse(`${fixtureDate}T10:00:00+08:00`) + i * 1800000,
    duration_ms: i < 5 ? 1920000 : i === 5 ? 1200000 : 2250000,
    duration_seconds: i < 5 ? 1920 : i === 5 ? 1200 : 2250,
    status: "FINISHED",
    is_paused: true,
    recovery_pending: false,
    settlement_status: i < 4 || i === 5 ? "COMPLETE" : "PENDING",
    source: "MANUAL_START",
    pause_reason: null,
    confirmed_end_time: null,
    last_input_time: null,
    end_reason: "MANUAL",
    legacy_duration_ms: 0,
    revision: 0,
    control_mode: "MANUAL",
    is_demo: false,
    demo_batch: null,
  }));
  const active = {
    ...records[0],
    id: 99,
    category: "开发",
    quantity: null,
    status: "WORKING",
    settlement_status: "IN_PROGRESS",
    end_time: null,
    is_paused: false,
    duration_ms: 25000,
    duration_seconds: 25,
  };
  const state = {
    records,
    active,
    names,
    presentation,
    saveFailure: null,
    queryFailure: false,
    detailFailure: false,
    queryDelay: 0,
    delayFor: null,
    saveDelay: 0,
    saves: 0,
    queries: 0,
    details: 0,
    deletes: 0,
    currentQuery: null,
    requests: [],
    revisions: [],
    segments: [],
    many: false,
  };
  const iso = (date) => date.toISOString().slice(0, 10);
  function range(query) {
    const anchor = query.anchor_date ?? fixtureDate;
    const date = new Date(anchor + "T12:00:00Z");
    let start = query.start_date,
      end = query.end_date;
    if (query.period === "day") start = end = anchor;
    if (query.period === "week") {
      date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
      start = iso(date);
      date.setUTCDate(date.getUTCDate() + 6);
      end = iso(date);
    }
    if (query.period === "month") {
      date.setUTCDate(1);
      start = iso(date);
      date.setUTCMonth(date.getUTCMonth() + 1);
      date.setUTCDate(0);
      end = iso(date);
    }
    return {
      period: query.period,
      anchor_date: query.period === "custom" ? null : anchor,
      start_date: start,
      end_date: end,
      trend_unit: query.period === "day" ? "hour" : "day",
    };
  }
  function aggregate(rows) {
    return {
      duration_ms: rows.reduce((n, row) => n + row.duration_ms, 0),
      quantity: rows
        .filter((row) => row.settlement_status === "COMPLETE")
        .reduce((n, row) => n + row.quantity, 0),
      records: rows.length,
      pending: rows.filter((row) => row.settlement_status === "PENDING").length,
      complete: rows.filter((row) => row.settlement_status === "COMPLETE")
        .length,
    };
  }
  function data(query) {
    const resolved = range(query);
    const extras = state.many
      ? Array.from({ length: 52 }, (_, i) => ({
          ...state.records[0],
          id: 200 + i,
          quantity: 1,
        }))
      : [];
    const demo = {
      ...state.records[0],
      id: 500,
      is_demo: true,
      demo_batch: "isolated-browser-fixture",
      quantity: 999,
    };
    const filtered = [
      ...state.records,
      ...extras,
      ...(state.active ? [state.active] : []),
      demo,
    ].filter((row) => {
      const date = iso(new Date(row.start_time + 8 * 3600000));
      return (
        (query.scope === "all" || row.is_demo === (query.scope === "demo")) &&
        (!resolved.start_date || date >= resolved.start_date) &&
        (!resolved.end_date || date <= resolved.end_date) &&
        (!query.category || row.category === query.category) &&
        (query.status === "all" ||
          (query.status === "working" && row.status !== "FINISHED") ||
          (query.status === "pending" && row.settlement_status === "PENDING") ||
          (query.status === "complete" && row.settlement_status === "COMPLETE"))
      );
    });
    const ended = filtered.filter((row) => row.status === "FINISHED");
    const categories = keys
      .filter((key) => !query.category || key === query.category)
      .map((category) => ({
        category,
        ...aggregate(ended.filter((row) => row.category === category)),
      }));
    const buckets =
      query.period === "day"
        ? Array.from(
            { length: 24 },
            (_, hour) => String(hour).padStart(2, "0") + ":00",
          )
        : query.period === "custom"
          ? [fixtureDate]
          : Array.from({ length: 32 }, (_, i) => {
              const date = new Date(resolved.start_date + "T12:00:00Z");
              date.setUTCDate(date.getUTCDate() + i);
              return iso(date);
            }).filter((date) => date <= resolved.end_date);
    const trend = buckets.map((date) => ({
      date,
      ...aggregate(
        ended.filter((row) =>
          query.period === "day"
            ? new Date(row.start_time + 8 * 3600000).getUTCHours() ===
              Number(date.slice(0, 2))
            : iso(new Date(row.start_time + 8 * 3600000)) === date,
        ),
      ),
    }));
    const pages = Math.max(1, Math.ceil(filtered.length / 50)),
      current = Math.min(query.page, pages);
    return {
      range: resolved,
      totals: aggregate(ended),
      categories,
      trend,
      monthly: false,
      calendar: ended.length
        ? [[fixtureDate, aggregate(ended).duration_ms]]
        : [],
      records: filtered.slice((current - 1) * 50, current * 50),
      record_count: filtered.length,
      page: current,
      pages,
      scope: query.scope,
    };
  }
  state.data = data;
  await page.route("**/api/**", async (route) => {
    const endpoint = new URL(route.request().url()).pathname.split("/").at(-1);
    const body = route.request().postData()
      ? route.request().postDataJSON()
      : null;
    state.requests.push({ endpoint, body });
    if (endpoint === "meta")
      return route.fulfill({
        json: {
          version: "0.2.3 · 隔离验收",
          category_names: names,
          presentation,
          active: state.active,
        },
      });
    if (endpoint === "query") {
      state.queries++;
      state.currentQuery = body;
      const result = data(body),
        failure = state.queryFailure;
      const delay = state.delayFor ? state.delayFor(body) : state.queryDelay;
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      return failure
        ? route.fulfill({ status: 500, json: { error: "隔离统计读取失败" } })
        : route.fulfill({ json: result });
    }
    if (endpoint === "detail") {
      state.details++;
      if (state.detailFailure)
        return route.fulfill({
          status: 500,
          json: { error: "隔离详情读取失败" },
        });
      const record = [
        ...state.records,
        ...(state.active ? [state.active] : []),
      ].find((row) => row.id === body.id);
      return route.fulfill({
        json: { record, segments: state.segments, revisions: state.revisions },
      });
    }
    if (endpoint === "save") {
      state.saves++;
      if (state.saveDelay)
        await new Promise((resolve) => setTimeout(resolve, state.saveDelay));
      if (state.saveFailure)
        return route.fulfill({
          status: state.saveFailure,
          json: {
            error:
              state.saveFailure === 409
                ? "记录已被其他窗口修改"
                : "隔离保存失败",
          },
        });
      const row = state.records.find((row) => row.id === body.id);
      const before = structuredClone(row);
      Object.assign(row, body, {
        revision: row.revision + 1,
        settlement_status: "COMPLETE",
      });
      state.revisions.push({
        revision: row.revision,
        changed_at: Date.now(),
        before,
        after: structuredClone(row),
      });
      return route.fulfill({ json: { ok: true } });
    }
    if (endpoint === "delete") {
      state.deletes++;
      state.records = state.records.filter((row) => row.id !== body.id);
      return route.fulfill({ json: { ok: true } });
    }
    return route.fulfill({
      status: 404,
      json: { error: "No fixture endpoint" },
    });
  });
  return state;
}
```

## E:\WorkMemo\scripts\verify-web-ui.mjs

```javascript
// End-to-end Ant Design regression. All /api requests are intercepted in an isolated browser.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dashboardFixture } from "./dashboard-fixture.mjs";
const { chromium } = await import(
  process.env.WORKMEMO_PLAYWRIGHT
    ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href
    : "playwright"
);
const output = new URL("../artifacts/web-ui/qa/", import.meta.url);
const baseUrl = process.env.WORKMEMO_WEB_URL ?? "http://127.0.0.1:1420";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  timezoneId: "Asia/Shanghai",
});
if (process.env.WORKMEMO_WEB_URL) {
  // Match the Rust data server's CSP while testing the compiled, local assets.
  await context.route("**/dashboard", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'",
      },
    });
  });
}
const page = await context.newPage();
page.setDefaultTimeout(10000);
const errors = [],
  warnings = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (value) => {
  if (
    value.type() === "error" &&
    !value.text().includes("status of 500") &&
    !value.text().includes("status of 409")
  )
    warnings.push(value.text());
});
const state = await dashboardFixture(page);
const shot = (name) =>
  page.screenshot({
    path: fileURLToPath(new URL(name + ".png", output)),
    fullPage: false,
  });
const result = { baseUrl };
const layoutOnly = process.argv.includes("--layout-only");
const sheet = page.locator(".dc-sheet-root .wm-drawer-section");
const editor = page.locator("#dc-editor");
const report = page.locator(".dc-category-report");
const quantity = page.getByRole("textbox", { name: "工作量", exact: true });
async function open(edit = false, index = 0) {
  await page.locator(".dc-page").waitFor({ state: "visible" });
  const background = await page.locator(".dc-page").boundingBox();
  await page
    .locator(".dc-records")
    .getByRole("button", { name: edit ? "编辑" : "详情", exact: true })
    .nth(index)
    .click();
  await sheet.waitFor();
  await page.waitForTimeout(350);
  await page.waitForFunction(
    () =>
      !document
        .querySelector(".wm-drawer-content-wrapper")
        ?.className.includes("-active"),
  );
  const locked = await page.locator(".dc-page").boundingBox();
  assert.ok(
    Math.abs(background.x - locked.x) < 1 &&
      Math.abs(background.width - locked.width) < 1,
    "opening the sheet must not shift the background",
  );
}
async function close() {
  await sheet.getByRole("button", { name: "关闭", exact: true }).click();
  await sheet.waitFor({ state: "hidden" });
  await page.waitForFunction(
    () => document.querySelector(".dc-page")?.inert === false,
  );
}
async function select(label, option) {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page
    .locator(".wm-select-dropdown:visible")
    .getByText(option, { exact: true })
    .last()
    .click();
}
try {
  await page.goto(`${baseUrl}/dashboard#token=isolated-web-ui-fixture`);
  await report.getByText("128.5", { exact: true }).waitFor();
  assert.equal(await page.locator(".dc-kpi").count(), 3);
  assert.equal(await report.locator("tbody tr[data-row-key]").count(), 4);
  assert.equal(
    await report.locator(".dc-report-quantity strong").nth(1).textContent(),
    "0",
  );
  assert.equal(
    await report.locator(".dc-report-quantity strong").nth(2).textContent(),
    "待补填",
  );
  await shot("overview-desktop");
  await page.screenshot({
    path: fileURLToPath(new URL("overview-full.png", output)),
    fullPage: true,
  });
  if (!layoutOnly) {
    await page.waitForTimeout(350);
    const graph = await page.locator(".dc-trend .dc-chart").screenshot();
    await page.waitForTimeout(2400);
    assert.deepEqual(
      await page.locator(".dc-trend .dc-chart").screenshot(),
      graph,
      "unchanged polling must not redraw a different chart",
    );
    result.stablePolling = true;

    await open(true);
    assert.equal(state.saves, 0, "entering edit must not submit");
    await page.waitForFunction(
      () => document.activeElement?.id === "dc-quantity",
    );
    await shot("edit-desktop");
    const geometry = await sheet.boundingBox();
    assert.ok(
      geometry.width <= 761 && geometry.height <= 881,
      JSON.stringify(geometry),
    );
    assert.ok(
      Math.abs(1000 - geometry.y - geometry.height - 24) < 2,
      JSON.stringify(geometry),
    );
    const scrollY = await page.evaluate(() => scrollY);
    await page.mouse.move(80, 200);
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(180);
    assert.equal(
      await page.evaluate(() => window.scrollY),
      scrollY,
      "background wheel is locked",
    );
    await quantity.fill("0");
    for (const status of [500, 409]) {
      state.saveFailure = status;
      await sheet.locator('button[form="dc-editor"]').click();
      await sheet
        .getByRole("alert")
        .filter({
          hasText: status === 409 ? "记录已被其他窗口修改" : "隔离保存失败",
        })
        .waitFor();
      assert.equal(await quantity.inputValue(), "0");
    }
    state.saveFailure = null;
    state.queryDelay = 900;
    await page.evaluate(() => {
      window.webFrames = [];
      window.webSample = true;
      const sample = () => {
        if (!window.webSample) return;
        window.webFrames.push({
          report: !!document.querySelector(".dc-report-table tbody"),
          kpi: document.querySelector(".dc-kpi strong")?.textContent,
          y: scrollY,
          loading: !!document.querySelector(".dc-category-report .dc-loading"),
        });
        requestAnimationFrame(sample);
      };
      sample();
    });
    await sheet.locator('button[form="dc-editor"]').click();
    await editor.waitFor({ state: "detached" });
    await page.waitForTimeout(1200);
    const frames = await page.evaluate(() => {
      window.webSample = false;
      return window.webFrames;
    });
    assert.ok(frames.length > 10);
    assert.ok(
      frames.every(
        (frame) =>
          frame.report &&
          !frame.loading &&
          !frame.kpi.startsWith("—") &&
          frame.y === scrollY,
      ),
      "save must preserve the background at every sampled frame",
    );
    await close();
    await report.getByText("98.5", { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => window.scrollY), scrollY);
    assert.equal(
      await page
        .locator(".dc-records")
        .getByRole("button", { name: "编辑", exact: true })
        .first()
        .evaluate((el) => el === document.activeElement),
      true,
    );
    state.queryDelay = 0;
    result.saveNoFlicker = {
      sampledFrames: frames.length,
      zero: true,
      failuresPreserveInput: true,
      focusRestored: true,
    };

    state.queryFailure = true;
    await page.getByRole("button", { name: "刷新连接", exact: true }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "刷新失败，当前显示上次结果" })
      .waitFor();
    await report.getByText("98.5", { exact: true }).waitFor();
    state.queryFailure = false;
    await page.getByRole("button", { name: "刷新连接", exact: true }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "刷新失败，当前显示上次结果" })
      .waitFor({ state: "detached" });
    result.staleSnapshotLabel = true;

    await open(true);
    await quantity.fill("12.5");
    await sheet.getByRole("button", { name: "关闭", exact: true }).click();
    const guard = page.getByRole("dialog", { name: "保留未保存的修改？" });
    await guard.waitFor();
    await page.waitForFunction(
      () => document.activeElement?.textContent === "继续编辑",
    );
    await shot("unsaved-confirmation");
    await page.keyboard.press("Control+s");
    assert.equal(state.saves, 3);
    await page.keyboard.press("Escape");
    await guard.waitFor({ state: "hidden" });
    assert.equal(await quantity.inputValue(), "12.5");
    assert.equal(
      await sheet.isVisible(),
      true,
      "one Escape must close only the confirmation",
    );
    await sheet.getByRole("button", { name: "关闭", exact: true }).click();
    await guard.getByRole("button", { name: "放弃修改", exact: true }).click();
    await sheet.waitFor({ state: "hidden" });
    result.nestedGuard = true;

    await open(true);
    await quantity.fill("1.25e2");
    await page.keyboard.press("Control+s");
    await editor.waitFor({ state: "detached" });
    assert.equal(state.records[0].quantity, 125);
    await close();
    result.scientificQuantity = true;

    // Invalid quantities remain strings and never reach the save endpoint.
    await open(true);
    const beforeInvalid = state.saves;
    for (const value of ["-1", "1e-9999", "1000000001"]) {
      await quantity.fill(value);
      await sheet.locator('button[form="dc-editor"]').click();
      await sheet.getByRole("alert").waitFor();
      assert.equal(state.saves, beforeInvalid);
      assert.equal(await quantity.inputValue(), value);
    }
    // Official Select popup stays inside the sheet and has keyboard selection.
    await sheet
      .getByRole("combobox", { name: "工作类别", exact: true })
      .click();
    const popup = sheet.locator(".wm-select-dropdown:visible");
    await popup.getByText("质检", { exact: true }).last().click();
    assert.equal(
      await sheet
        .getByRole("combobox", { name: "工作类别", exact: true })
        .getAttribute("aria-expanded"),
      "false",
    );
    await sheet
      .getByRole("button", { name: "关闭", exact: true })
      .last()
      .click();
    await guard.getByRole("button", { name: "放弃修改", exact: true }).click();
    await sheet.waitFor({ state: "hidden" });
    result.validationAndSheetSelect = true;

    // Persisted writes cannot be relabelled as failed when a follow-up GET fails.
    await open(true);
    await quantity.fill("126");
    state.detailFailure = true;
    await sheet.locator('button[form="dc-editor"]').click();
    await editor.waitFor({ state: "detached" });
    await sheet
      .getByRole("alert")
      .filter({ hasText: "已保存，详情刷新失败" })
      .waitFor();
    assert.equal(state.records[0].quantity, 126);
    assert.equal(
      await sheet
        .getByRole("button", { name: "编辑工作量", exact: true })
        .isDisabled(),
      true,
    );
    state.detailFailure = false;
    await close();
    result.committedReadFailure = true;

    // The guard's own save succeeds/fails without submitting the underlying form twice.
    await open(true);
    await quantity.fill("127");
    await page.keyboard.press("Escape");
    await guard.waitFor();
    const beforeGuardSave = state.saves;
    state.saveFailure = 500;
    await guard
      .getByRole("button", { name: "保存并继续", exact: true })
      .click();
    await guard
      .getByRole("alert")
      .filter({ hasText: "隔离保存失败" })
      .waitFor();
    assert.equal(state.saves, beforeGuardSave + 1);
    state.saveFailure = null;
    await guard.getByRole("button", { name: /保存并继续$/ }).click();
    await guard.waitFor({ state: "hidden" });
    await sheet.waitFor({ state: "hidden" });
    assert.equal(state.records[0].quantity, 127);
    result.guardSave = true;

    // DatePicker and Segmented retain natural-period and local-date semantics.
    await page
      .locator(".dc-period-bar")
      .getByText("周", { exact: true })
      .click();
    await page
      .locator(".dc-period-nav strong")
      .filter({ hasText: "2026-10-26 — 2026-11-01" })
      .waitFor();
    assert.equal(
      await page.getByRole("button", { name: "下一周期" }).isEnabled(),
      true,
    );
    await page.getByRole("button", { name: "下一周期" }).click();
    await page
      .locator(".dc-period-nav strong")
      .filter({ hasText: "2026-11-02 — 2026-11-08" })
      .waitFor();
    await page.getByRole("button", { name: "上一周期" }).click();
    await page
      .locator(".dc-period-bar")
      .getByText("月", { exact: true })
      .click();
    const date = page.getByRole("textbox", { name: "基准日期", exact: true });
    await date.fill("2024-02-29");
    await date.press("Enter");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await page
      .locator(".dc-period-nav strong")
      .filter({ hasText: "2024 年 02 月" })
      .waitFor();
    assert.equal(state.currentQuery.anchor_date, "2024-02-29");
    await date.click();
    await page.locator(".wm-picker-dropdown:visible").waitFor();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "本月", exact: true }).click();
    await page
      .locator(".dc-period-bar")
      .getByText("自定义", { exact: true })
      .click();
    await page.getByRole("button", { name: "全部日期", exact: true }).click();
    await page
      .locator(".dc-category-report")
      .getByText("最早记录 — 至今", { exact: false })
      .waitFor();
    await select("筛选工作类别", "代码开发");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await page.waitForFunction(
      () =>
        document.querySelectorAll(".dc-report-table tbody tr[data-row-key]")
          .length === 1,
    );
    assert.equal(state.currentQuery.category, "开发");
    await select("筛选工作类别", "全部类别");
    await select("数据范围", "演示数据");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await report.getByText("999", { exact: true }).waitFor();
    await select("数据范围", "真实数据");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await page
      .locator(".dc-period-bar")
      .getByText("日", { exact: true })
      .click();
    await page
      .locator(".dc-period-nav strong")
      .filter({ hasText: "2026.10.29" })
      .waitFor();
    result.periodsAndScopes = true;

    // An older, deliberately delayed query must not overwrite the latest result.
    state.delayFor = (query) => (query.category === "评测" ? 650 : 0);
    await select("筛选工作类别", "评测");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await select("筛选工作类别", "质检");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await report.getByText("0", { exact: true }).waitFor();
    await page.waitForTimeout(850);
    assert.equal(await report.locator("tbody tr[data-row-key]").count(), 1);
    assert.equal(await report.locator(".work-badge").innerText(), "质检");
    state.delayFor = null;
    await select("筛选工作类别", "全部类别");
    await page.getByRole("button", { name: "应用筛选" }).click();
    result.staleRequestIgnored = true;

    // Pagination is controlled by the existing 50-row backend contract.
    state.many = true;
    await page.getByRole("button", { name: "刷新连接" }).click();
    await page.locator(".wm-pagination-item-2").click();
    await page.waitForFunction(
      () =>
        document.querySelector(".wm-pagination-item-active")?.textContent ===
        "2",
    );
    assert.equal(state.currentQuery.page, 2);
    state.many = false;
    await page.locator(".wm-pagination-item-1").click();
    await page
      .locator(".dc-records")
      .getByRole("button", { name: "详情", exact: true })
      .first()
      .waitFor();
    result.pagination = true;

    // Read-only active records and explicit delete confirmation.
    const activeRow = page.locator('.dc-records tr[data-row-key="99"]');
    assert.equal(
      await activeRow
        .getByRole("button", { name: "编辑", exact: true })
        .isDisabled(),
      true,
    );
    await activeRow.getByRole("button", { name: "详情", exact: true }).click();
    await sheet.waitFor();
    assert.equal(
      await sheet
        .getByRole("button", { name: "编辑工作量", exact: true })
        .isDisabled(),
      true,
    );
    await close();
    await page
      .locator(".dc-records")
      .getByRole("button", { name: "删除", exact: true })
      .first()
      .click();
    const deletion = page.getByRole("dialog", { name: "删除这条记录？" });
    await deletion.waitFor();
    assert.equal(state.deletes, 0);
    await deletion.getByRole("button", { name: "取消", exact: true }).click();
    await deletion.waitFor({ state: "hidden" });
    assert.equal(state.deletes, 0);
    result.readOnlyAndDeleteCancel = true;

    // Body-only scrolling, nested focus, boundary chaining, short-screen footer.
    state.segments = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      start_time: state.records[0].start_time,
      end_time: state.records[0].end_time,
      duration_ms: 30000,
      state: "CLOSED",
    }));
    await page.setViewportSize({ width: 1024, height: 520 });
    await open();
    await sheet.getByRole("button", { name: "计时区间（25）" }).click();
    const body = sheet.locator(".wm-drawer-body");
    await body.evaluate((el) => (el.scrollTop = el.scrollHeight));
    const bodyTop = await body.evaluate((el) => el.scrollTop),
      backgroundTop = await page.evaluate(() => scrollY);
    await body.hover();
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => scrollY), backgroundTop);
    assert.ok((await body.evaluate((el) => el.scrollTop)) >= bodyTop);
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      assert.equal(
        await page
          .locator(".dc-sheet-root")
          .evaluate((el) => el.contains(document.activeElement)),
        true,
        JSON.stringify(
          await page.evaluate(() => ({
            focused: document.activeElement?.outerHTML.slice(0, 500),
          })),
        ),
      );
    }
    const footer = await sheet.locator(".wm-drawer-footer").boundingBox();
    assert.ok(footer.y + footer.height <= 520 && footer.y >= 0);
    await close();
    state.segments = [];
    result.shortScreenScrollAndFocus = true;
  }

  const widths = [];
  for (const width of [390, 640, 800, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(160);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      `page overflow ${width}`,
    );
    await page.evaluate(() => scrollTo(0, 0));
    await shot("overview-" + width);
    await open(true);
    const box = await sheet.boundingBox();
    assert.ok(box.x >= -1 && box.x + box.width <= width + 1);
    assert.ok(
      Math.abs(1000 - box.y - box.height - (width <= 640 ? 0 : 24)) < 2,
      JSON.stringify({ width, ...box }),
    );
    await shot("sheet-" + width);
    await close();
    widths.push(width);
  }
  result.widths = widths;
  const zooms = [];
  for (const zoom of [1.25, 1.5]) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.evaluate(
      (value) => (document.documentElement.style.zoom = String(value)),
      zoom,
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await open(true);
    const box = await sheet.boundingBox();
    assert.ok(
      box.x >= 0 &&
        box.x + box.width <= 1281 &&
        box.y >= 0 &&
        box.y + box.height <= 901,
      JSON.stringify({ zoom, ...box }),
    );
    await shot("zoom-" + zoom);
    await close();
    zooms.push(zoom);
  }
  await page.evaluate(() => (document.documentElement.style.zoom = "1"));
  result.cssZooms = zooms;
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(true);
  await shot("reduced-motion");
  await close();
  result.reducedMotion = true;
  if (!layoutOnly) {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => {
      window.motionFrames = [];
      window.sampleMotion = true;
      const sample = () => {
        if (!window.sampleMotion) return;
        const panel = document.querySelector(".wm-drawer-section");
        if (panel?.getClientRects().length)
          window.motionFrames.push({
            y: panel.getBoundingClientRect().y,
            locked: document.querySelector(".dc-page").inert,
          });
        requestAnimationFrame(sample);
      };
      sample();
    });
    await open();
    const settled = await sheet.boundingBox();
    await close();
    const animation = await page.evaluate(() => {
      window.sampleMotion = false;
      return window.motionFrames;
    });
    assert.ok(
      animation.some((frame) => frame.y > settled.y + 20),
      "official bottom motion must move the panel",
    );
    assert.ok(
      animation.every((frame) => frame.locked),
      "background remains locked throughout both motions",
    );
    result.officialMotion = { frames: animation.length };

    await open(true);
    await quantity.fill("128");
    state.saveDelay = 400;
    const before = state.saves;
    await sheet.locator('button[form="dc-editor"]').click();
    await page.keyboard.press("Control+s");
    await editor.waitFor({ state: "detached" });
    assert.equal(state.saves, before + 1);
    await close();
    state.saveDelay = 0;
    result.noDuplicateSubmission = true;

    const count = state.records.length;
    await page
      .locator('.dc-records tr[data-row-key="8"]')
      .getByRole("button", { name: "删除", exact: true })
      .click();
    const deletion = page.getByRole("dialog", { name: "删除这条记录？" });
    await deletion
      .getByRole("button", { name: "确认删除", exact: true })
      .click();
    await deletion.waitFor({ state: "hidden" });
    await page
      .locator('.dc-records tr[data-row-key="8"]')
      .waitFor({ state: "detached" });
    assert.equal(state.records.length, count - 1);
    assert.equal(state.deletes, 1);
    result.deleteAndRefresh = true;

    const firstFailure = await context.newPage();
    const failed = await dashboardFixture(firstFailure);
    failed.queryFailure = true;
    firstFailure.on("pageerror", (error) => errors.push(error.message));
    await firstFailure.goto(
      `${baseUrl}/dashboard#token=isolated-first-failure`,
    );
    await firstFailure
      .getByRole("alert")
      .filter({ hasText: "隔离统计读取失败" })
      .waitFor();
    assert.ok(
      (await firstFailure.locator(".dc-kpi strong").allTextContents()).every(
        (value) => value.startsWith("—"),
      ),
    );
    await firstFailure.close();
    const unauth = await context.newPage();
    unauth.on("pageerror", (error) => errors.push(error.message));
    await unauth.goto(`${baseUrl}/dashboard`);
    await unauth
      .getByRole("alert")
      .filter({ hasText: "请从 WorkMemo 打开数据中心" })
      .waitFor();
    assert.ok(
      (await unauth.locator(".dc-kpi strong").allTextContents()).every(
        (value) => value.startsWith("—"),
      ),
    );
    await unauth.close();
    result.firstLoadAndAuthorizationErrors = true;
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  await writeFile(
    new URL(
      layoutOnly
        ? "layout-result.json"
        : process.env.WORKMEMO_WEB_URL
          ? "production-result.json"
          : "result.json",
      output,
    ),
    JSON.stringify({ ...result, errors, warnings }, null, 2),
  );
  console.log(JSON.stringify(result));
} catch (error) {
  await shot("failure");
  await writeFile(
    new URL("failure-aria.txt", output),
    await sheet.ariaSnapshot().catch(() => "sheet missing"),
  );
  await writeFile(
    new URL("failure.json", output),
    JSON.stringify(
      {
        message: error.message,
        errors,
        warnings,
        saves: state.saves,
        requests: state.requests.slice(-6),
        sheet: await sheet
          .evaluate((el) => ({
            inert: el.closest("[inert]")?.outerHTML.slice(0, 100),
            ariaHidden: el.closest("[aria-hidden]")?.outerHTML.slice(0, 100),
            buttons: [...el.querySelectorAll("button")].map((b) => ({
              text: b.textContent,
              disabled: b.disabled,
              hidden: b.closest("[aria-hidden]")?.getAttribute("aria-hidden"),
            })),
          }))
          .catch(() => null),
      },
      null,
      2,
    ),
  );
  throw error;
} finally {
  await browser.close();
}
```

## E:\WorkMemo\scripts\verify-ui-022.mjs

```javascript
// Optional browser regression check. Uses isolated HTTP fixtures, never a user database.
// Set WORKMEMO_PLAYWRIGHT to a local playwright package entry if it is not installed.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const output = new URL('../artifacts/0.2.3/qa/', import.meta.url);
await mkdir(output, {recursive:true});
const browser = await chromium.launch({channel:'msedge',headless:true});
const page = await browser.newPage({viewport:{width:1280,height:900}});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
await page.addInitScript(()=>{window.qaWindowErrors=[];window.addEventListener('error',event=>window.qaWindowErrors.push(event.message));});
const today = new Date().toLocaleDateString('sv-SE');
const record={id:1,category:'开发',quantity:2,remark:'UI regression fixture',start_time:Date.now()-3600000,end_time:Date.now()-1000,duration_ms:3599000,duration_seconds:3599,status:'FINISHED',is_paused:true,recovery_pending:false,settlement_status:'COMPLETE',revision:1,is_demo:false,demo_batch:null};
const graphDays=Array.from({length:90},(_,i)=>{
  const date=new Date();date.setDate(date.getDate()-89+i);
  return {date:date.toLocaleDateString('sv-SE'),duration_ms:(i%8)*1800000,quantity:i%5,records:i%3};
});
// The Ant Design web surface has its own current regression in verify-web-ui.mjs.
// Keep the historical desktop fixtures independently runnable.
if (!process.argv.includes('--desktop-only')) {
let saves=0, failure=null;
await page.route('**/api/**',async route=>{
  const name=new URL(route.request().url()).pathname.split('/').at(-1);
  if(name==='save'){
    saves++;
    if(failure) return route.fulfill({status:failure,contentType:'application/json',body:JSON.stringify({error:failure===409?'记录已变化，请重新读取':'保存失败，请重试'})});
    Object.assign(record,JSON.parse(route.request().postData()));record.revision++;
  }
  const data={meta:{version:'0.2.2',active:null},query:{range:{period:'day',anchor_date:today,start_date:today,end_date:today,trend_unit:'hour'},record_count:1,totals:{duration_ms:3599000,quantity:record.quantity,records:1,pending:0},trend:graphDays,monthly:false,categories:[{category:'开发',duration_ms:3599000,quantity:record.quantity,records:1,complete:1,pending:0}],calendar:graphDays.map(d=>[d.date,d.duration_ms]),records:[record],page:1,pages:1,scope:'real'},detail:{record,segments:[],revisions:[]},save:{ok:true}}[name];
  await route.fulfill({json:data});
});
await page.goto('http://127.0.0.1:1420/dashboard#token=isolated-ui-fixture');
await page.getByRole('button',{name:'详情',exact:true}).click();
await page.getByRole('button',{name:'编辑工作量',exact:true}).click();
if(process.argv.includes('--baseline')) {
  await page.waitForTimeout(700);
  assert.equal(saves,1,'v0.2.1 should reproduce the unintended immediate submission');
  assert.equal(await page.locator('#dc-editor').count(),0);
  console.log('Reproduced v0.2.1: clicking edit immediately submits once and returns to detail.');
  await browser.close();process.exit(0);
}
await page.locator('#dc-editor').waitFor();
await page.waitForTimeout(300);
assert.equal(saves,0,'Entering edit must not submit');
assert.equal(await page.locator('#dc-editor input').evaluate(el=>el===document.activeElement),true);
await page.locator('#dc-editor input').fill('0');
failure=500;
await page.getByRole('button',{name:'保存工作量',exact:true}).click();
await page.getByRole('alert').filter({hasText:'保存失败'}).waitFor();
assert.equal(await page.locator('#dc-editor input').inputValue(),'0');
failure=409;
await page.getByRole('button',{name:'保存工作量',exact:true}).click();
await page.getByRole('alert').filter({hasText:'记录已变化'}).waitFor();
assert.equal(await page.locator('#dc-editor input').inputValue(),'0');
failure=null;
await page.getByRole('button',{name:'保存工作量',exact:true}).click();
await page.locator('#dc-editor').waitFor({state:'detached'});
assert.equal(record.quantity,0);
await page.getByRole('button',{name:'关闭工作详情'}).click();
const layoutCases=[];
for(const width of [390,800,1024,1280,1440,1600,1920]){
  await page.setViewportSize({width,height:1000});
  await page.waitForTimeout(400);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`page overflow ${width}`);
  const layout=await page.evaluate(()=>{
    const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,right:r.right,bottom:r.bottom};};
    return {filters:rect('.dc-filters'),kpis:rect('.dc-kpis'),report:rect('.dc-category-report'),trend:rect('.dc-trend'),auxiliary:rect('.dc-auxiliary'),records:rect('.dc-records')};
  });
  assert.ok(Math.abs(layout.filters.width-layout.report.width)<2,JSON.stringify(layout));
  assert.ok(Math.abs(layout.kpis.width-layout.report.width)<2,JSON.stringify(layout));
  assert.ok(Math.abs(layout.trend.width-layout.report.width)<2,JSON.stringify(layout));
  assert.ok(layout.report.bottom<=layout.trend.y,JSON.stringify(layout));
  assert.ok(layout.records.y>=layout.auxiliary.bottom,JSON.stringify(layout));
  layoutCases.push({width,...layout});
  await page.screenshot({path:new URL(`dashboard-${width}.png`,output).pathname.replace(/^\/(\w:)/,'$1'),fullPage:true});
}
// Browser zoom equivalence for CSS layout (not native Windows DPI verification).
await page.evaluate(()=>document.documentElement.style.zoom='1.25');
await page.waitForTimeout(400);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
await page.evaluate(()=>document.documentElement.style.zoom='1');
assert.deepEqual(errors,[]);
assert.deepEqual(await page.evaluate(()=>window.qaWindowErrors),[]);
await writeFile(new URL('browser-result.json',output),JSON.stringify({enterEditNoSubmit:true,focus:true,zeroSave:true,failurePreservesInput:true,revisionConflictPreservesInput:true,periodReportLayout:true,widths:[390,800,1024,1280,1440,1600,1920],cssZoom:1.25,pageErrors:errors},null,2));
await writeFile(new URL('overview-layout-result.json',output),JSON.stringify(layoutCases,null,2));
if(process.argv.includes('--dashboard-only')) { await browser.close();console.log('Overview report layout and editor regressions passed; HTTP fixtures only.');process.exit(0); }
}
// Mock IPC only in a fresh browser page. No native work commands are sent.
const island=await browser.newPage({viewport:{width:320,height:56}});
await island.addInitScript(({record})=>{
  window.qaTheme='cream';window.qaState='working';window.qaCalls=[];
  window.__TAURI_EVENT_PLUGIN_INTERNALS__={unregisterListener(){}};
  const snapshot=()=>({active:['browse','candidate'].includes(window.qaState)?null:{...record,status:'WORKING',is_paused:window.qaState==='paused',pause_reason:window.qaState==='paused'?'MANUAL':null,control_mode:'AUTO'},monitoring:{browsing_only:window.qaState==='browse',browse_ready:true,start_candidate:window.qaState==='candidate'?{id:7,category:'评测',rule_id:1}:null,away_pause_remaining_seconds:null},recent_records:[],pending_count:0});
  window.__TAURI_INTERNALS__={metadata:{currentWindow:{label:'notice'},currentWebview:{label:'notice'}},transformCallback(){return 1;},unregisterCallback(){},invoke:async(command,args)=>{
    window.qaCalls.push(command);
    if(command==='get_snapshot') return snapshot();
    if(command==='get_notice') return null;
    if(command==='get_appearance') return {version:1,theme:window.qaTheme,opacity:94};
    if(command==='get_presentation') return {version:1,categories:{'评测':{icon:'checkSquare',color:'#447cba'},'开发':{icon:'code',color:'#8b5cf6'}},background:null};
    if(command==='pause_task'){window.qaState='paused';return snapshot();}
    if(command==='resume_task'){window.qaState='working';return snapshot();}
    if(command==='enter_browsing'){window.qaState='browse';return snapshot();}
    if(command==='confirm_work'){window.qaState='working';return snapshot();}
    return null;
  }};
},{record});
const islandResults=[];
for(const theme of ['cream','glass','dark','neon']){
  await island.goto('http://127.0.0.1:1420/?notice=1');
  await island.evaluate(t=>window.qaTheme=t,theme);
  await island.waitForTimeout(1100);
  // Appearance reload occurs on mount; reload with theme selected via init for this document.
  const vars=await island.evaluate(async t=>(await import('/src/themes.ts')).themeStyle({version:1,theme:t,opacity:94}),theme);
  await island.locator('.island-frame').evaluate((el,v)=>{for(const [k,val] of Object.entries(v))el.style.setProperty(k,String(val));},vars);
  const button=island.getByRole('button',{name:'暂停记录'});
  await button.waitFor();
  await button.hover();
  const bounds=await island.locator('.island-main-row').boundingBox();
  assert.ok(bounds.y+bounds.height<=56,`island height ${theme}`);
  assert.ok(bounds.x+bounds.width<=320,`island width ${theme}`);
  await island.screenshot({path:new URL(`island-${theme}.png`,output).pathname.replace(/^\/(\w:)/,'$1')});
  islandResults.push(theme);
}
await island.getByRole('button',{name:'暂停记录'}).click();
await island.getByRole('button',{name:'继续记录',exact:true}).click();
await island.evaluate(()=>window.qaState='browse');await island.waitForTimeout(1100);
await island.getByRole('button',{name:'开始记录',exact:true}).waitFor();
await island.getByRole('button',{name:'开始记录',exact:true}).click();
await island.getByRole('button',{name:'暂停记录'}).waitFor();
await island.evaluate(()=>window.qaState='paused');await island.waitForTimeout(1100);
await island.getByRole('button',{name:'继续记录',exact:true}).click();
await island.evaluate(()=>window.qaState='candidate');await island.setViewportSize({width:320,height:88});await island.waitForTimeout(1100);
await island.getByRole('button',{name:'开始记录',exact:true}).waitFor();
await island.screenshot({path:new URL('island-confirm.png',output).pathname.replace(/^\/(\w:)/,'$1')});
await writeFile(new URL('island-result.json',output),JSON.stringify({themes:islandResults,pauseBrowseStartResume:true,candidate:true,native:false},null,2));
const settings=await browser.newPage({viewport:{width:1024,height:850}});
await settings.goto('http://127.0.0.1:1420/?panel=settings&section=layout');
await settings.locator('.layout-form').waitFor();
for(const width of [1024,600]){
  await settings.setViewportSize({width,height:850});
  const alignment=await settings.locator('.layout-form').evaluate(el=>{
    const form=el.getBoundingClientRect(),parent=el.parentElement.getBoundingClientRect();
    return {centerDifference:Math.abs((form.left+form.right)-(parent.left+parent.right)),width:form.width,scrollWidth:el.scrollWidth};
  });
  assert.ok(alignment.centerDifference<2,JSON.stringify(alignment));
  assert.ok(alignment.width<=650 && alignment.scrollWidth<=alignment.width+1,JSON.stringify({width,...alignment}));
}
await settings.screenshot({path:new URL('layout-settings.png',output).pathname.replace(/^\/(\w:)/,'$1')});
await browser.close();
console.log('Dashboard UI regression passed; fixtures only.');
```

## E:\WorkMemo\scripts\verify-v023-phase1.mjs

```javascript
// Isolated UI/IPC fixtures. No access to real user records or native input.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const {chromium} = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const output = new URL('../artifacts/0.2.3/qa/',import.meta.url);
await mkdir(output,{recursive:true});
const browser = await chromium.launch({channel:'msedge',headless:true});
try {
  const context = await browser.newContext({viewport:{width:780,height:900}});
  const errors = [];
  context.on('page', page => page.on('pageerror', e => errors.push(e.message)));
  await context.addInitScript(() => {
    window.isTauri=true;
    const categories=['评测','质检','开发','文档'];
    const original={revision:0,names:Object.fromEntries(categories.map(c=>[c,c]))};
    const getNames=()=>JSON.parse(localStorage.getItem('qa-names')??JSON.stringify(original));
    const visuals={version:1,revision:0,background:null,categories:Object.fromEntries(categories.map((key,i)=>[key,{icon:['checkSquare','safety','code','note'][i],color:['#3b82f6','#10b981','#8b5cf6','#f59e0b'][i]}]))};
    window.qaFail=false; window.qaSaves=[]; window.qaCommands=[];
    window.__TAURI_EVENT_PLUGIN_INTERNALS__={unregisterListener(){}};
    let next=1; const callbacks=new Map(); const events=new Map();
    window.__TAURI_INTERNALS__={metadata:{currentWindow:{label:'settings'},currentWebview:{label:'settings'}},
      transformCallback(callback){const id=next++;callbacks.set(id,callback);return id;},unregisterCallback(id){callbacks.delete(id);},
      invoke:async(command,args)=>{
        window.qaCommands.push(command);
        if(command==='plugin:event|listen'){events.set(next,{name:args.event,callback:args.handler});return next++;}
        if(command==='plugin:event|unlisten'){events.delete(args.eventId);return;}
        if(command==='get_category_names') return getNames();
        if(command==='save_category_names'){
          window.qaSaves.push(structuredClone(args.input));
          if(window.qaFail) throw new Error('名称保存失败测试');
          const current=getNames();
          if(args.input.revision!==current.revision) throw new Error('工作名称已被其他窗口修改，请重新读取后保存。');
          const saved={revision:current.revision+1,names:Object.fromEntries(Object.entries(args.input.names).map(([k,v])=>[k,v.trim()]))};
          localStorage.setItem('qa-names',JSON.stringify(saved));
          for(const [id,event] of events)if(event.name==='workmemo:categories-changed') callbacks.get(event.callback)?.({event:event.name,id,payload:null});
          return saved;
        }
        if(command==='get_presentation') return visuals;
        if(command==='get_appearance') return {version:1,theme:'cream',opacity:94};
        if(command==='get_layout_settings') return {density:'comfortable',revision:0,sound_enabled:true,font_size:14,font_weight:400,line_spacing:'standard'};
        if(command==='get_monitor_config') return {enabled:false,revision:0,times:{idle_pause_seconds:120,idle_warning_seconds:300,idle_end_seconds:420,away_pause_seconds:120,hold_seconds:600},poll_interval_seconds:1,auto_resume_manual:true,rules:[{id:1,category:'开发',url_prefix:'https://example.test/',match_mode:'origin'}]};
        if(command==='get_connection_status') return {state:'ready',message:'隔离验收夹具',identifier:'fixture',version:'0.2.2'};
        if(command==='app_info') return {name:'WorkMemo',version:'0.2.2'};
        if(command==='get_notice') return null;
        if(command==='get_pending_records')return [{id:1,category:'开发',quantity:null,remark:'隔离夹具',start_time:Date.now()-10000,end_time:Date.now(),duration_ms:10000,duration_seconds:10,status:'FINISHED',is_paused:true,recovery_pending:false,settlement_status:'PENDING',source:'MANUAL_START',pause_reason:null,confirmed_end_time:Date.now(),last_input_time:null,end_reason:'MANUAL',legacy_duration_ms:0,revision:0,control_mode:'MANUAL'}];
        if(command==='get_snapshot')return {active:null,recent_records:[],warning:null,pending_count:1,monitoring:{enabled:false,native_available:true,idle_warning:false,revision:0,away_pause_remaining_seconds:null,message:'隔离夹具'}};
        if(command==='get_today_workload')return [];
        return null;
      }};
    window.addEventListener('storage',event=>{
      if(event.key==='qa-names')for(const [id,e] of events)if(e.name==='workmemo:categories-changed')callbacks.get(e.callback)?.({event:e.name,id,payload:null});
    });
  });
  const settings=await context.newPage();
  await settings.goto('http://127.0.0.1:1420/?panel=settings&section=visuals');
  const editor=settings.locator('.category-names-editor');
  const input=editor.getByLabel('类型 3（原名：开发）');
  await input.waitFor();
  await input.fill('编程任务');
  await settings.evaluate(()=>window.qaFail=true);
  await editor.getByRole('button',{name:'保存工作名称',exact:true}).click();
  await editor.getByRole('alert').filter({hasText:'名称保存失败测试'}).waitFor();
  assert.equal(await input.inputValue(),'编程任务');
  await settings.evaluate(()=>window.qaFail=false);
  await editor.getByRole('button',{name:'保存工作名称',exact:true}).click();
  await editor.getByRole('status').filter({hasText:'工作名称已保存'}).waitFor();
  await settings.locator('legend .work-badge').filter({hasText:'编程任务'}).waitFor();
  assert.equal((await settings.evaluate(()=>JSON.parse(localStorage.getItem('qa-names')))).names['开发'],'编程任务');

  const second=await context.newPage();
  await second.goto('http://127.0.0.1:1420/?panel=settings&section=visuals');
  const secondInput=second.locator('.category-names-editor').getByLabel('类型 3（原名：开发）');
  await secondInput.fill('第二窗口草稿');
  await input.fill('第一窗口更新');
  await editor.getByRole('button',{name:'保存工作名称',exact:true}).click();
  await settings.waitForFunction(()=>JSON.parse(localStorage.getItem('qa-names')).revision===2);
  await second.waitForTimeout(100);
  assert.equal(await secondInput.inputValue(),'第二窗口草稿');
  await second.locator('.category-names-editor').getByRole('button',{name:'保存工作名称',exact:true}).click();
  await second.getByRole('alert').filter({hasText:'已被其他窗口修改'}).waitFor();
  assert.equal(await secondInput.inputValue(),'第二窗口草稿');
  await second.locator('.category-names-editor').getByRole('button',{name:'重新读取并放弃名称修改'}).click();
  await second.waitForFunction(()=>Array.from(document.querySelectorAll('.category-names-editor input')).some(input=>input.value==='第一窗口更新'));
  assert.equal(await secondInput.inputValue(),'第一窗口更新');
  await second.close();
  await settings.screenshot({path:new URL('phase1-category-settings.png',output).pathname.replace(/^\/(\w:)/,'$1'),fullPage:true});

  const main=await context.newPage();
  await main.goto('http://127.0.0.1:1420/');
  await main.getByRole('option',{name:'第一窗口更新',exact:true}).waitFor({state:'attached'});
  assert.equal(await main.getByRole('option',{name:'第一窗口更新',exact:true}).getAttribute('value'),'开发');
  await settings.getByRole('button',{name:'监测',exact:true}).click();
  const workgroup=settings.locator('.monitor-work-group[aria-label="第一窗口更新工作网址"]');
  await workgroup.getByText('1 个 URL',{exact:true}).waitFor();
  assert.equal(await workgroup.getByLabel('归属工作').inputValue(),'开发');
  await settings.getByLabel('键鼠无操作后暂停',{exact:true}).waitFor();
  assert.equal(await settings.getByLabel('键鼠无操作后暂停',{exact:true}).inputValue(),'120');
  for(const width of [390,780]){
    await settings.setViewportSize({width,height:900});
    assert.equal(await settings.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`settings overflow ${width}`);
  }
  await settings.screenshot({path:new URL('phase1-monitor-settings.png',output).pathname.replace(/^\/(\w:)/,'$1'),fullPage:true});
  const dashboard=await context.newPage();
  const dashboardRecord={id:1,category:'开发',quantity:0,remark:'isolated rename fixture',start_time:Date.now()-10000,end_time:Date.now(),duration_ms:10000,duration_seconds:10,status:'FINISHED',is_paused:true,recovery_pending:false,settlement_status:'COMPLETE',source:'MANUAL_START',pause_reason:null,confirmed_end_time:Date.now(),last_input_time:null,end_reason:'MANUAL',legacy_duration_ms:0,revision:0,control_mode:'MANUAL'};
  const queries=[];
  const dashboardNames=await settings.evaluate(()=>JSON.parse(localStorage.getItem('qa-names')));
  await dashboard.route('**/api/**',async route=>{
    const endpoint=new URL(route.request().url()).pathname.split('/').at(-1);
    if(endpoint==='meta')return route.fulfill({json:{version:'0.2.2',active:null,category_names:dashboardNames}});
    if(endpoint==='detail')return route.fulfill({json:{record:dashboardRecord,segments:[],revisions:[]}});
    if(endpoint==='query'){
      queries.push(JSON.parse(route.request().postData()));
      return route.fulfill({json:{range:{period:'day',anchor_date:'2026-10-29',start_date:'2026-10-29',end_date:'2026-10-29',trend_unit:'hour'},record_count:1,totals:{duration_ms:10000,quantity:0,records:1,pending:0},trend:[],monthly:false,categories:[{category:'开发',duration_ms:10000,quantity:0,records:1,complete:1,pending:0}],calendar:[],records:[dashboardRecord],page:1,pages:1,scope:'real'}});
    }
    return route.fulfill({json:{saved:true}});
  });
  await dashboard.goto('http://127.0.0.1:1420/dashboard#token=isolated-rename-fixture');
  await dashboard.locator('td .work-badge').filter({hasText:'第一窗口更新'}).first().waitFor();
  await dashboard.getByRole('combobox',{name:'筛选工作类别',exact:true}).click();
  await dashboard.locator('.wm-select-dropdown:visible').getByText('第一窗口更新',{exact:true}).last().click();
  await dashboard.getByRole('button',{name:'应用筛选'}).click();
  await dashboard.waitForTimeout(100);
  assert.equal(queries.at(-1).category,'开发');
  await dashboard.getByRole('button',{name:'详情',exact:true}).click();
  await dashboard.locator('.dc-record-summary .work-badge').filter({hasText:'第一窗口更新'}).waitFor();
  await dashboard.getByRole('button',{name:'编辑工作量',exact:true}).click();
  await dashboard.locator('#dc-editor .wm-select-content').filter({hasText:'第一窗口更新'}).waitFor();
  await dashboard.getByRole('combobox',{name:'工作类别',exact:true}).click();
  await dashboard.locator('.wm-select-dropdown:visible').getByText('第一窗口更新',{exact:true}).last().waitFor();
  await dashboard.keyboard.press('Escape');
  assert.deepEqual(errors,[]);
  await writeFile(new URL('phase1-ui-result.json',output),JSON.stringify({renameSave:true,failedSavePreservesInput:true,multiWindowConflict:true,explicitReload:true,stableSelectIdentity:true,monitorGroupName:true,idlePauseSetting:true,dashboardNameAndStableFilter:true,widths:[390,780],pageErrors:errors},null,2));
  console.log('v0.2.3 phase 1 UI regressions passed; isolated IPC fixtures only.');
} finally {await browser.close();}
```

# v0.2.11 完整源码清单与内容

2026-11-16。14 个版本/工具/说明文件完整内容；发布状态见 RELEASE-0.2.11.md。锁文件亦完整保留，未用省略号代替。

## E:\WorkMemo\.gitignore

```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
/artifacts/
*.local

# Local credentials and working data
.env
.env.*
!.env.example
*.db
*.db-shm
*.db-wal
*.sqlite
*.sqlite-shm
*.sqlite-wal
*.sqlite3
*.sqlite3-shm
*.sqlite3-wal

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Python release-tool bytecode
__pycache__/
```

## E:\WorkMemo\package.json

```json
{
  "name": "workmemo",
  "private": true,
  "version": "0.2.11",
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
    "@rc-component/motion": "1.3.3",
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
  "version": "0.2.11",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "workmemo",
      "version": "0.2.11",
      "dependencies": {
        "@ant-design/icons": "^6.3.4",
        "@ant-design/icons-svg": "^4.6.0",
        "@rc-component/motion": "1.3.3",
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

## E:\WorkMemo\src-tauri\Cargo.toml

```toml
[package]
name = "workmemo"
version = "0.2.11"
description = "Local personal work journal and focus timer"
edition = "2024"
default-run = "workmemo"

[features]
custom-protocol = ["tauri/custom-protocol"]

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[lib]
# The `_lib` suffix may seem redundant but it is necessary
# to make the lib name unique and wouldn't conflict with the bin name.
# This seems to be only an issue on Windows, see https://github.com/rust-lang/cargo/issues/8519
name = "workmemo_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }
serde_json = "1"

[dependencies]
tauri = { version = "2", features = ["tray-icon"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
rusqlite = { version = "0.41", features = ["bundled", "backup"] }
url = "2.5.8"
tiny_http = "0.12"
image = { version = "0.25", default-features = false, features = ["png", "jpeg", "webp"] }

[target.'cfg(windows)'.dependencies]
tauri-plugin-autostart = "=2.5.1"
tauri-plugin-single-instance = "2"
windows-sys = { version = "0.61.2", features = ["Win32_Foundation", "Win32_Media_Audio", "Win32_Security_Cryptography", "Win32_Graphics_Gdi", "Win32_System_SystemInformation", "Win32_System_Threading", "Win32_System_LibraryLoader", "Win32_System_Registry", "Win32_System_RemoteDesktop", "Win32_System_Power", "Win32_UI_WindowsAndMessaging", "Win32_UI_Shell", "Win32_UI_Controls_Dialogs", "Win32_UI_Input_KeyboardAndMouse"] }


# Read the optimization guideline for more details: https://tauri.app/concept/size/#cargo-configuration
[profile.release]
codegen-units = 1
lto = true
opt-level = 3
panic = "abort"
strip = true
```

## E:\WorkMemo\src-tauri\Cargo.lock

```toml
# This file is automatically @generated by Cargo.
# It is not intended for manual editing.
version = 4

[[package]]
name = "adler2"
version = "2.0.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "320119579fcad9c21884f5c4861d16174d0e06250625266f50fe6898340abefa"

[[package]]
name = "aho-corasick"
version = "1.1.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c982642fa9e8606056828ee9a8505737230110bb1099153c79efe865c59d12ba"
dependencies = [
 "memchr",
]

[[package]]
name = "alloc-no-stdlib"
version = "3.0.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c2fb6cfd47bf496ff64095c20eaba0c201404ee38714d4142fcfa1dc334fcc7a"

[[package]]
name = "alloc-stdlib"
version = "0.3.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0b5c1865780388bfa186411ab5f247819487fc4864c6e9c3106611fa347586e1"
dependencies = [
 "alloc-no-stdlib",
]

[[package]]
name = "android_system_properties"
version = "0.1.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ae221649c9976a6f6c56ae1facf410f3ddb33cc661c4b7b61020a912d4237fbc"
dependencies = [
 "libc",
]

[[package]]
name = "anyhow"
version = "1.0.104"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "330a5ed07fa54e4702c9d6c4174f74427fc0ef6e214bbd677ae50a5099946470"

[[package]]
name = "ascii"
version = "1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d92bec98840b8f03a5ff5413de5293bfcd8bf96467cf5452609f939ec6f5de16"

[[package]]
name = "async-broadcast"
version = "0.7.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "435a87a52755b8f27fcf321ac4f04b2802e337c8c4872923137471ec39c37532"
dependencies = [
 "event-listener",
 "event-listener-strategy",
 "futures-core",
 "pin-project-lite",
]

[[package]]
name = "async-channel"
version = "2.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "924ed96dd52d1b75e9c1a3e6275715fd320f5f9439fb5a4a11fa51f4221158d2"
dependencies = [
 "concurrent-queue",
 "event-listener-strategy",
 "futures-core",
 "pin-project-lite",
]

[[package]]
name = "async-executor"
version = "1.14.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c96bf972d85afc50bf5ab8fe2d54d1586b4e0b46c97c50a0c9e71e2f7bcd812a"
dependencies = [
 "async-task",
 "concurrent-queue",
 "fastrand",
 "futures-lite",
 "pin-project-lite",
 "slab",
]

[[package]]
name = "async-io"
version = "2.6.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "456b8a8feb6f42d237746d4b3e9a178494627745c3c56c6ea55d92ba50d026fc"
dependencies = [
 "autocfg",
 "cfg-if",
 "concurrent-queue",
 "futures-io",
 "futures-lite",
 "parking",
 "polling",
 "rustix",
 "slab",
 "windows-sys 0.61.2",
]

[[package]]
name = "async-lock"
version = "3.4.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "290f7f2596bd5b78a9fec8088ccd89180d7f9f55b94b0576823bbbdc72ee8311"
dependencies = [
 "event-listener",
 "event-listener-strategy",
 "pin-project-lite",
]

[[package]]
name = "async-process"
version = "2.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fc50921ec0055cdd8a16de48773bfeec5c972598674347252c0399676be7da75"
dependencies = [
 "async-channel",
 "async-io",
 "async-lock",
 "async-signal",
 "async-task",
 "blocking",
 "cfg-if",
 "event-listener",
 "futures-lite",
 "rustix",
]

[[package]]
name = "async-recursion"
version = "1.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4f8abc12baad266b1c8cec146854c195b5864b4221d4b2ca7296a7ae82d9e451"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "async-signal"
version = "0.2.14"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "52b5aaafa020cf5053a01f2a60e8ff5dccf550f0f77ec54a4e47285ac2bab485"
dependencies = [
 "async-io",
 "async-lock",
 "atomic-waker",
 "cfg-if",
 "futures-core",
 "futures-io",
 "rustix",
 "signal-hook-registry",
 "slab",
 "windows-sys 0.61.2",
]

[[package]]
name = "async-task"
version = "4.7.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8b75356056920673b02621b35afd0f7dda9306d03c79a30f5c56c44cf256e3de"

[[package]]
name = "async-trait"
version = "0.1.92"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "82f6aeea286b8eb4dd3431a1be1b59d290ace00f5bfd8e2a159bc2a05e2c1667"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "atk"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "241b621213072e993be4f6f3a9e4b45f65b7e6faad43001be957184b7bb1824b"
dependencies = [
 "atk-sys",
 "glib",
 "libc",
]

[[package]]
name = "atk-sys"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c5e48b684b0ca77d2bbadeef17424c2ea3c897d44d566a1617e7e8f30614d086"
dependencies = [
 "glib-sys",
 "gobject-sys",
 "libc",
 "system-deps",
]

[[package]]
name = "atomic-waker"
version = "1.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1505bd5d3d116872e7271a6d4e16d81d0c8570876c8de68093a09ac269d8aac0"

[[package]]
name = "auto-launch"
version = "0.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1f012b8cc0c850f34117ec8252a44418f2e34a2cf501de89e29b241ae5f79471"
dependencies = [
 "dirs 4.0.0",
 "thiserror 1.0.69",
 "winreg 0.10.1",
]

[[package]]
name = "autocfg"
version = "1.5.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f2032f911046de80f0a198e0901378627c33f59ea0ac00e363d481118bd70a53"

[[package]]
name = "base64"
version = "0.21.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9d297deb1925b89f2ccc13d7635fa0714f12c87adce1c75356b39ca9b7178567"

[[package]]
name = "base64"
version = "0.23.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ac07cdecf99051d9a5238b80f35af32cdeba5b336e55d957b318b50137e18da5"

[[package]]
name = "bit-set"
version = "0.8.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "08807e080ed7f9d5433fa9b275196cfc35414f66a0c79d864dc51a0d825231a3"
dependencies = [
 "bit-vec",
]

[[package]]
name = "bit-vec"
version = "0.8.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5e764a1d40d510daf35e07be9eb06e75770908c27d411ee6c92109c9840eaaf7"

[[package]]
name = "bitflags"
version = "1.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bef38d45163c2f1dde094a7dfd33ccf595c92905c8f8f4fdc18d06fb1037718a"

[[package]]
name = "bitflags"
version = "2.13.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3ded4057c258ba199e2d26386d3af3780957ecaee6c4ef4041c6b4b8b97c0b06"
dependencies = [
 "serde_core",
]

[[package]]
name = "block-buffer"
version = "0.10.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3078c7629b62d3f0439517fa394996acacc5cbc91c5a20d8c658e77abd503a71"
dependencies = [
 "generic-array",
]

[[package]]
name = "block2"
version = "0.6.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cdeb9d870516001442e364c5220d3574d2da8dc765554b4a617230d33fa58ef5"
dependencies = [
 "objc2",
]

[[package]]
name = "blocking"
version = "1.7.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a70e4329df6cb94385eed412ec92375c3cdd8a6e502493d1229b6414e4036dfa"
dependencies = [
 "async-channel",
 "async-task",
 "futures-io",
 "futures-lite",
 "piper",
]

[[package]]
name = "brotli"
version = "9.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6737ce8b81460bf9407909f73ff50bf13f7cb8577e1e76715f57ed0eba58ba44"
dependencies = [
 "alloc-no-stdlib",
 "alloc-stdlib",
 "brotli-decompressor",
]

[[package]]
name = "brotli-decompressor"
version = "6.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "34c6783f42c21c952ad7112b354f0ba2f10760e9decea5b1b60523d6e270faaf"
dependencies = [
 "alloc-no-stdlib",
 "alloc-stdlib",
]

[[package]]
name = "bs58"
version = "0.5.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bf88ba1141d185c399bee5288d850d63b8369520c1eafc32a0430b5b6c287bf4"
dependencies = [
 "tinyvec",
]

[[package]]
name = "bumpalo"
version = "3.20.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "72f5acc6cb2ba439de613abc23857ec3d78374d8ed5ac84e9d11336e87da8649"

[[package]]
name = "bytemuck"
version = "1.25.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "95832e849adfb21180ccb6826a99da14e5d266ae5c2e668e1602cf234f153797"

[[package]]
name = "byteorder"
version = "1.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1fd0f2584146f6f2ef48085050886acf353beff7305ebd1ae69500e27c67f64b"

[[package]]
name = "byteorder-lite"
version = "0.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8f1fe948ff07f4bd06c30984e69f5b4899c516a3ef74f34df92a2df2ab535495"

[[package]]
name = "bytes"
version = "1.12.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fc652a48c352aef3ea3aed32080501cf3ef6ed5da78602a020c991775b0aff04"
dependencies = [
 "serde",
]

[[package]]
name = "cairo-rs"
version = "0.18.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8ca26ef0159422fb77631dc9d17b102f253b876fe1586b03b803e63a309b4ee2"
dependencies = [
 "bitflags 2.13.2",
 "cairo-sys-rs",
 "glib",
 "libc",
 "once_cell",
 "thiserror 1.0.69",
]

[[package]]
name = "cairo-sys-rs"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "685c9fa8e590b8b3d678873528d83411db17242a73fccaed827770ea0fedda51"
dependencies = [
 "glib-sys",
 "libc",
 "system-deps",
]

[[package]]
name = "camino"
version = "1.2.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bbbad30e4b4c14a39e3cc8aed085a12a327257c316619c93581e017bc52be591"
dependencies = [
 "serde_core",
]

[[package]]
name = "cargo-platform"
version = "0.1.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e35af189006b9c0f00a064685c727031e3ed2d8020f7ba284d78cc2671bd36ea"
dependencies = [
 "serde",
]

[[package]]
name = "cargo_metadata"
version = "0.19.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "dd5eb614ed4c27c5d706420e4320fbe3216ab31fa1c33cd8246ac36dae4479ba"
dependencies = [
 "camino",
 "cargo-platform",
 "semver",
 "serde",
 "serde_json",
 "thiserror 2.0.21",
]

[[package]]
name = "cargo_toml"
version = "1.0.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "82f4b26e751e711a5302649417f2da046dce6391b2ea30a4820f37462314f0b9"
dependencies = [
 "semver",
 "serde",
 "toml 1.1.8+spec-1.1.0",
]

[[package]]
name = "cc"
version = "1.10.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "86e055fa6e3e40ad6187ba25b6855eeb635d5271f8e0f0e1e9a5826b8d75bea0"
dependencies = [
 "find-msvc-tools",
 "shlex",
]

[[package]]
name = "cesu8"
version = "1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6d43a04d8753f35258c91f8ec639f792891f748a1edbd759cf1dcea3382ad83c"

[[package]]
name = "cfb"
version = "0.14.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a347dcabdae9c31b0825fd6a8bed285ec9c2acb89c47827126d52fa4f59cece3"
dependencies = [
 "fnv",
 "uuid",
 "web-time",
]

[[package]]
name = "cfg-expr"
version = "0.15.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d067ad48b8650848b989a59a86c6c36a995d02d2bf778d45c3c5d57bc2718f02"
dependencies = [
 "smallvec",
 "target-lexicon",
]

[[package]]
name = "cfg-if"
version = "1.0.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4e7648175b45a9a48536d676f68d918270699102aa8dab5496df06904c914600"

[[package]]
name = "chrono"
version = "0.4.45"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1aa79e62e7697b8e29b513a68abacf485adcd1fe8284a4316c5ae868e6633327"
dependencies = [
 "iana-time-zone",
 "num-traits",
 "serde",
 "windows-link",
]

[[package]]
name = "chunked_transfer"
version = "1.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6e4de3bc4ea267985becf712dc6d9eed8b04c953b3fcfb339ebc87acd9804901"

[[package]]
name = "combine"
version = "4.6.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4356eba6976435498d05a311ee9fc486da3bc81c200d3f0d7dd9703b41913f92"
dependencies = [
 "bytes",
 "memchr",
]

[[package]]
name = "concurrent-queue"
version = "2.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4ca0197aee26d1ae37445ee532fefce43251d24cc7c166799f4d46817f1d3973"
dependencies = [
 "crossbeam-utils",
]

[[package]]
name = "cookie"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1a373e3602691c3cdea496d2f0ee5935151e6168fe87739483c463db1b2f2f87"
dependencies = [
 "time",
 "version_check",
]

[[package]]
name = "core-foundation"
version = "0.10.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b2a6cd9ae233e7f62ba4e9353e81a88df7fc8a5987b8d445b4d90c879bd156f6"
dependencies = [
 "core-foundation-sys",
 "libc",
]

[[package]]
name = "core-foundation-sys"
version = "0.8.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "773648b94d0e5d620f64f280777445740e61fe701025087ec8b57f45c791888b"

[[package]]
name = "core-graphics"
version = "0.25.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "064badf302c3194842cf2c5d61f56cc88e54a759313879cdf03abdd27d0c3b97"
dependencies = [
 "bitflags 2.13.2",
 "core-foundation",
 "core-graphics-types",
 "foreign-types",
 "libc",
]

[[package]]
name = "core-graphics-types"
version = "0.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3d44a101f213f6c4cdc1853d4b78aef6db6bdfa3468798cc1d9912f4735013eb"
dependencies = [
 "bitflags 2.13.2",
 "core-foundation",
 "libc",
]

[[package]]
name = "cpufeatures"
version = "0.2.17"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "59ed5838eebb26a2bb2e58f6d5b5316989ae9d08bab10e0e6d103e656d1b0280"
dependencies = [
 "libc",
]

[[package]]
name = "crc32fast"
version = "1.5.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0ba106e844045ddc02c20768ac4b0b7cb45f2cc2ecbd833ac9f5dacb183c2055"
dependencies = [
 "cfg-if",
]

[[package]]
name = "crossbeam-channel"
version = "0.5.17"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "98b0cc327b5bc766e7fda9c9260cc0fa81b43a8e240440422dff70788e3f9ef1"
dependencies = [
 "crossbeam-utils",
]

[[package]]
name = "crossbeam-utils"
version = "0.8.23"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a31eee39dddec8330830986fcd7625edb5a24ec90ea038215273bbc3adb08ac6"

[[package]]
name = "crypto-common"
version = "0.1.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "78c8292055d1c1df0cce5d180393dc8cce0abec0a7102adb6c7b1eef6016d60a"
dependencies = [
 "generic-array",
 "typenum",
]

[[package]]
name = "cssparser"
version = "0.37.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8c9cdaae01d5ed7882b04d795e7f752f46ff52d2fa3b50a20d28c464510bba98"
dependencies = [
 "cssparser-macros",
 "dtoa-short",
 "itoa",
 "phf",
 "smallvec",
]

[[package]]
name = "cssparser-macros"
version = "0.7.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d045de693cb712d0b22c6a64be5b953f67b3ce00ab5ad3dd5d8b441886ab8e1a"
dependencies = [
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "ctor"
version = "1.0.13"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "914a755b7c2d4af2bdcff7ce1739e2db9a1b81a9b07123d8015786ae03c0980d"

[[package]]
name = "darling"
version = "0.24.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ed17f5901b6630b993ca003def43f2f8ef4014fc13b047b57aad617ff32bc2ec"
dependencies = [
 "darling_core",
 "darling_macro",
]

[[package]]
name = "darling_core"
version = "0.24.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6837e2cf7485aaae18f86181d2f0e9a7ed297a025e220aeabf63fdebd3a2ddff"
dependencies = [
 "ident_case",
 "proc-macro2",
 "quote",
 "strsim",
 "syn 3.0.9",
]

[[package]]
name = "darling_macro"
version = "0.24.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2ac7135c3ef02b2f7833bbeb1be5ba7f966dcde8a87c6b87f65a778d71a02785"
dependencies = [
 "darling_core",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "dbus"
version = "0.9.12"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3ab69f03cc8c4340c9c8e315114e1658e6775a9b16a04357973aa21cec22b32e"
dependencies = [
 "libc",
 "libdbus-sys",
 "windows-sys 0.61.2",
]

[[package]]
name = "defmt"
version = "1.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e4a0795ac740cb54d7b3775c9c17345f6aaecf884c01733b39d6017738e0e3e1"
dependencies = [
 "bitflags 1.3.2",
 "defmt-macros",
]

[[package]]
name = "defmt-macros"
version = "1.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "840bb056bd99c495c9188198a258ab787c79f306d864db3e6e8451442d6d8366"
dependencies = [
 "defmt-parser",
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "defmt-parser"
version = "1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "71958f69fb2de856c5dd51ac9377e986ca1aa5919f931bf5395a807277f889a0"
dependencies = [
 "thiserror 2.0.21",
]

[[package]]
name = "deranged"
version = "0.5.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9e9de72ce2ad1f90dc62fa25f0f430ef85eb4b0d8fa0be4f30373bc40a21d28e"
dependencies = [
 "serde_core",
]

[[package]]
name = "derive_more"
version = "2.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d751e9e49156b02b44f9c1815bcb94b984cdcc4396ecc32521c739452808b134"
dependencies = [
 "derive_more-impl",
]

[[package]]
name = "derive_more-impl"
version = "2.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "799a97264921d8623a957f6c3b9011f3b5492f557bbb7a5a19b7fa6d06ba8dcb"
dependencies = [
 "proc-macro2",
 "quote",
 "rustc_version",
 "syn 2.0.119",
]

[[package]]
name = "digest"
version = "0.10.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9ed9a281f7bc9b7576e61468ba615a66a5c8cfdff42420a70aa82701a3b1e292"
dependencies = [
 "block-buffer",
 "crypto-common",
]

[[package]]
name = "dirs"
version = "4.0.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ca3aa72a6f96ea37bbc5aa912f6788242832f75369bdfdadcb0e38423f100059"
dependencies = [
 "dirs-sys 0.3.7",
]

[[package]]
name = "dirs"
version = "7.0.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8d57d423b3c82e89b9a24ca3091fee61f456a26edbd28d26c65906f4bc1dcd8f"
dependencies = [
 "dirs-sys 0.5.0",
]

[[package]]
name = "dirs-sys"
version = "0.3.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1b1d1d91c932ef41c0f2663aa8b0ca0342d444d842c06914aa0a7e352d0bada6"
dependencies = [
 "libc",
 "redox_users 0.4.6",
 "winapi",
]

[[package]]
name = "dirs-sys"
version = "0.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e01a3366d27ee9890022452ee61b2b63a67e6f13f58900b651ff5665f0bb1fab"
dependencies = [
 "libc",
 "option-ext",
 "redox_users 0.5.3",
 "windows-sys 0.61.2",
]

[[package]]
name = "dispatch2"
version = "0.3.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1e0e367e4e7da84520dedcac1901e4da967309406d1e51017ae1abfb97adbd38"
dependencies = [
 "bitflags 2.13.2",
 "block2",
 "libc",
 "objc2",
]

[[package]]
name = "displaydoc"
version = "0.2.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c6232dd377dcc64799954cbd3a9bb882e9cdc1308ccd87b1c098f1fb2eaf82a8"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "dlopen2"
version = "0.8.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5e2c5bd4158e66d1e215c49b837e11d62f3267b30c92f1d171c4d3105e3dc4d4"
dependencies = [
 "dlopen2_derive",
 "libc",
 "once_cell",
 "winapi",
]

[[package]]
name = "dlopen2_derive"
version = "0.4.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0fbbb781877580993a8707ec48672673ec7b81eeba04cfd2310bd28c08e47c8f"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "dom_query"
version = "0.28.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fac5fca71e65e94cc718a6e2af65d6e0f9c6027751c2aa562fbb5087fda639bc"
dependencies = [
 "bit-set",
 "cssparser",
 "foldhash",
 "html5ever",
 "precomputed-hash",
 "selectors",
 "tendril",
]

[[package]]
name = "dpi"
version = "0.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d8b14ccef22fc6f5a8f4d7d768562a182c04ce9a3b3157b91390b52ddfdf1a76"
dependencies = [
 "serde",
]

[[package]]
name = "dtoa"
version = "1.0.11"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4c3cf4824e2d5f025c7b531afcb2325364084a16806f6d47fbc1f5fbd9960590"

[[package]]
name = "dtoa-short"
version = "0.3.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cd1511a7b6a56299bd043a9c167a6d2bfb37bf84a6dfceaba651168adfb43c87"
dependencies = [
 "dtoa",
]

[[package]]
name = "dunce"
version = "1.0.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "92773504d58c093f6de2459af4af33faa518c13451eb8f2b5698ed3d36e7c813"

[[package]]
name = "dyn-clone"
version = "1.0.20"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d0881ea181b1df73ff77ffaaf9c7544ecc11e82fba9b5f27b262a3c73a332555"

[[package]]
name = "embed-resource"
version = "3.0.12"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6168487b5e7eb2673e6efe1200b1848016e436a6ca0b8031bf04bd9d493a249f"
dependencies = [
 "cc",
 "memchr",
 "rustc_version",
 "toml 1.1.8+spec-1.1.0",
 "vswhom",
 "winreg 0.56.0",
]

[[package]]
name = "embed_plist"
version = "1.2.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4ef6b89e5b37196644d8796de5268852ff179b44e96276cf4290264843743bb7"

[[package]]
name = "endi"
version = "1.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "66b7e2430c6dff6a955451e2cfc438f09cea1965a9d6f87f7e3b90decc014099"

[[package]]
name = "enumflags2"
version = "0.7.12"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1027f7680c853e056ebcec683615fb6fbbc07dbaa13b4d5d9442b146ded4ecef"
dependencies = [
 "enumflags2_derive",
 "serde",
]

[[package]]
name = "enumflags2_derive"
version = "0.7.12"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "67c78a4d8fdf9953a5c9d458f9efe940fd97a0cab0941c075a813ac594733827"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "equivalent"
version = "1.0.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "00d174d5400e5e8fd687ad1049e2f578285fa914201b1af7e8b112a4546bd826"

[[package]]
name = "erased-serde"
version = "0.4.11"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1e59b668157f32d3459d4bd634861a06ffa2503a461ca5f0916b9f0252605e66"
dependencies = [
 "serde",
 "serde_core",
 "typeid",
]

[[package]]
name = "errno"
version = "0.3.14"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "39cab71617ae0d63f51a36d69f866391735b51691dbda63cf6f96d042b63efeb"
dependencies = [
 "libc",
 "windows-sys 0.61.2",
]

[[package]]
name = "event-listener"
version = "5.4.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5a23add41df1562121a9393cb065eab5146a1242410f23a644851e90cfd669d2"
dependencies = [
 "parking",
 "pin-project-lite",
]

[[package]]
name = "event-listener-strategy"
version = "0.5.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8be9f3dfaaffdae2972880079a491a1a8bb7cbed0b8dd7a347f668b4150a3b93"
dependencies = [
 "event-listener",
 "pin-project-lite",
]

[[package]]
name = "fallible-iterator"
version = "0.3.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2acce4a10f12dc2fb14a218589d4f1f62ef011b2d0cc4b3cb1bba8e94da14649"

[[package]]
name = "fallible-streaming-iterator"
version = "0.1.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7360491ce676a36bf9bb3c56c1aa791658183a54d2744120f27285738d90465a"

[[package]]
name = "fastrand"
version = "2.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "da7c62ceae207dd37ea5b845da6a0696c799f85e97da1ab5b7910be3c1c80223"

[[package]]
name = "fdeflate"
version = "0.3.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1e6853b52649d4ac5c0bd02320cddc5ba956bdb407c4b75a2c6b75bf51500f8c"
dependencies = [
 "simd-adler32",
]

[[package]]
name = "field-offset"
version = "0.3.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "38e2275cc4e4fc009b0669731a1e5ab7ebf11f469eaede2bab9309a5b4d6057f"
dependencies = [
 "memoffset",
 "rustc_version",
]

[[package]]
name = "find-msvc-tools"
version = "0.1.15"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1c66915cc5391097de7a2b0b972e8505aa33c0df401fd3a6811dbdb32881ba48"

[[package]]
name = "flate2"
version = "1.1.10"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6e634e2e0ebac1ee034020da1ca582e17ffe4e0f5e985823721e168928136dcb"
dependencies = [
 "crc32fast",
 "miniz_oxide 0.9.1",
 "zlib-rs",
]

[[package]]
name = "fnv"
version = "1.0.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3f9eec918d3f24069decb9af1554cad7c880e2da24a9afd88aca000531ab82c1"

[[package]]
name = "foldhash"
version = "0.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "77ce24cb58228fbb8aa041425bb1050850ac19177686ea6e0f41a70416f56fdb"

[[package]]
name = "foreign-types"
version = "0.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d737d9aa519fb7b749cbc3b962edcf310a8dd1f4b67c91c4f83975dbdd17d965"
dependencies = [
 "foreign-types-macros",
 "foreign-types-shared",
]

[[package]]
name = "foreign-types-macros"
version = "0.2.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ea5190182e6915eb873ddbc16e23b711b6eb1f9c00a0d0a3a91b5f6228475225"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "foreign-types-shared"
version = "0.3.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "aa9a19cbb55df58761df49b23516a86d432839add4af60fc256da840f66ed35b"

[[package]]
name = "form_urlencoded"
version = "1.2.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cb4cb245038516f5f85277875cdaa4f7d2c9a0fa0468de06ed190163b1581fcf"
dependencies = [
 "percent-encoding",
]

[[package]]
name = "futures-channel"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b1f9e3d69d39e4862ffed03ed071a76f9a13ba1d9109d355b0f0aa6b15e393c4"
dependencies = [
 "futures-core",
]

[[package]]
name = "futures-core"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "92d699e522242e69e3003b94ecc1f960f3a5e015aa7c5d7486e65ad01dd94f5e"

[[package]]
name = "futures-executor"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "031b47cf1a3c6cc8bc2fc76cd437f521619387907d469316e7c0bc278f1f5432"
dependencies = [
 "futures-core",
 "futures-task",
 "futures-util",
]

[[package]]
name = "futures-io"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "53c0fa8157de1303bfffdaa1cc2a673bfffb60102f76b0ef4441659124373fed"

[[package]]
name = "futures-lite"
version = "2.6.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f78e10609fe0e0b3f4157ffab1876319b5b0db102a2c60dc4626306dc46b44ad"
dependencies = [
 "fastrand",
 "futures-core",
 "futures-io",
 "parking",
 "pin-project-lite",
]

[[package]]
name = "futures-macro"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9fb9654ba8355388abeb8dcb4fc62f511300867002afc858860463bdd9fe0c44"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "futures-sink"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1944426bf7d03f1d14f708785e4b33efd750b36d48a157b836b3efc15ede8e1d"

[[package]]
name = "futures-task"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cd417de3d1d015fc3bfd2b1ea46dfc7bab72ef86f1cc7cc9c78e728b34a6d1fd"

[[package]]
name = "futures-util"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0d50a92467f8ba5dd6e3ee5d4bd04d73ab2e4e1c44474a0674821dfce14b79bc"
dependencies = [
 "futures-core",
 "futures-io",
 "futures-macro",
 "futures-sink",
 "futures-task",
 "memchr",
 "pin-project-lite",
 "slab",
]

[[package]]
name = "gdk"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d9f245958c627ac99d8e529166f9823fb3b838d1d41fd2b297af3075093c2691"
dependencies = [
 "cairo-rs",
 "gdk-pixbuf",
 "gdk-sys",
 "gio",
 "glib",
 "libc",
 "pango",
]

[[package]]
name = "gdk-pixbuf"
version = "0.18.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "50e1f5f1b0bfb830d6ccc8066d18db35c487b1b2b1e8589b5dfe9f07e8defaec"
dependencies = [
 "gdk-pixbuf-sys",
 "gio",
 "glib",
 "libc",
 "once_cell",
]

[[package]]
name = "gdk-pixbuf-sys"
version = "0.18.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3f9839ea644ed9c97a34d129ad56d38a25e6756f99f3a88e15cd39c20629caf7"
dependencies = [
 "gio-sys",
 "glib-sys",
 "gobject-sys",
 "libc",
 "system-deps",
]

[[package]]
name = "gdk-sys"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5c2d13f38594ac1e66619e188c6d5a1adb98d11b2fcf7894fc416ad76aa2f3f7"
dependencies = [
 "cairo-sys-rs",
 "gdk-pixbuf-sys",
 "gio-sys",
 "glib-sys",
 "gobject-sys",
 "libc",
 "pango-sys",
 "pkg-config",
 "system-deps",
]

[[package]]
name = "gdkwayland-sys"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "140071d506d223f7572b9f09b5e155afbd77428cd5cc7af8f2694c41d98dfe69"
dependencies = [
 "gdk-sys",
 "glib-sys",
 "gobject-sys",
 "libc",
 "pkg-config",
 "system-deps",
]

[[package]]
name = "gdkx11"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3caa00e14351bebbc8183b3c36690327eb77c49abc2268dd4bd36b856db3fbfe"
dependencies = [
 "gdk",
 "gdkx11-sys",
 "gio",
 "glib",
 "libc",
 "x11",
]

[[package]]
name = "gdkx11-sys"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6e2e7445fe01ac26f11601db260dd8608fe172514eb63b3b5e261ea6b0f4428d"
dependencies = [
 "gdk-sys",
 "glib-sys",
 "libc",
 "system-deps",
 "x11",
]

[[package]]
name = "generic-array"
version = "0.14.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "85649ca51fd72272d7821adaf274ad91c288277713d9c18820d8499a7ff69e9a"
dependencies = [
 "typenum",
 "version_check",
]

[[package]]
name = "getrandom"
version = "0.2.17"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ff2abc00be7fca6ebc474524697ae276ad847ad0a6b3faa4bcb027e9a4614ad0"
dependencies = [
 "cfg-if",
 "libc",
 "wasi",
]

[[package]]
name = "getrandom"
version = "0.3.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "899def5c37c4fd7b2664648c28120ecec138e4d395b459e5ca34f9cce2dd77fd"
dependencies = [
 "cfg-if",
 "libc",
 "r-efi 5.3.0",
 "wasip2",
]

[[package]]
name = "getrandom"
version = "0.4.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "300e883d756b2e4ec94e02791f39b04b522276138852cfc41d9fb7e904106099"
dependencies = [
 "cfg-if",
 "libc",
 "r-efi 6.0.0",
]

[[package]]
name = "gio"
version = "0.18.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d4fc8f532f87b79cbc51a79748f16a6828fb784be93145a322fa14d06d354c73"
dependencies = [
 "futures-channel",
 "futures-core",
 "futures-io",
 "futures-util",
 "gio-sys",
 "glib",
 "libc",
 "once_cell",
 "pin-project-lite",
 "smallvec",
 "thiserror 1.0.69",
]

[[package]]
name = "gio-sys"
version = "0.18.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "37566df850baf5e4cb0dfb78af2e4b9898d817ed9263d1090a2df958c64737d2"
dependencies = [
 "glib-sys",
 "gobject-sys",
 "libc",
 "system-deps",
 "winapi",
]

[[package]]
name = "glib"
version = "0.18.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "233daaf6e83ae6a12a52055f568f9d7cf4671dabb78ff9560ab6da230ce00ee5"
dependencies = [
 "bitflags 2.13.2",
 "futures-channel",
 "futures-core",
 "futures-executor",
 "futures-task",
 "futures-util",
 "gio-sys",
 "glib-macros",
 "glib-sys",
 "gobject-sys",
 "libc",
 "memchr",
 "once_cell",
 "smallvec",
 "thiserror 1.0.69",
]

[[package]]
name = "glib-macros"
version = "0.18.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0bb0228f477c0900c880fd78c8759b95c7636dbd7842707f49e132378aa2acdc"
dependencies = [
 "heck 0.4.1",
 "proc-macro-crate 2.0.2",
 "proc-macro-error",
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "glib-sys"
version = "0.18.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "063ce2eb6a8d0ea93d2bf8ba1957e78dbab6be1c2220dd3daca57d5a9d869898"
dependencies = [
 "libc",
 "system-deps",
]

[[package]]
name = "glob"
version = "0.3.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e4eba85ea1d0a966a983acd07deee566e67395d2d96b6fb39e62b5a833f1eb0b"

[[package]]
name = "gobject-sys"
version = "0.18.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0850127b514d1c4a4654ead6dedadb18198999985908e6ffe4436f53c785ce44"
dependencies = [
 "glib-sys",
 "libc",
 "system-deps",
]

[[package]]
name = "gtk"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fd56fb197bfc42bd5d2751f4f017d44ff59fbb58140c6b49f9b3b2bdab08506a"
dependencies = [
 "atk",
 "cairo-rs",
 "field-offset",
 "futures-channel",
 "gdk",
 "gdk-pixbuf",
 "gio",
 "glib",
 "gtk-sys",
 "gtk3-macros",
 "libc",
 "pango",
 "pkg-config",
]

[[package]]
name = "gtk-sys"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8f29a1c21c59553eb7dd40e918be54dccd60c52b049b75119d5d96ce6b624414"
dependencies = [
 "atk-sys",
 "cairo-sys-rs",
 "gdk-pixbuf-sys",
 "gdk-sys",
 "gio-sys",
 "glib-sys",
 "gobject-sys",
 "libc",
 "pango-sys",
 "system-deps",
]

[[package]]
name = "gtk3-macros"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "52ff3c5b21f14f0736fed6dcfc0bfb4225ebf5725f3c0209edeec181e4d73e9d"
dependencies = [
 "proc-macro-crate 1.3.1",
 "proc-macro-error",
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "hashbrown"
version = "0.12.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8a9ee70c43aaf417c914396645a0fa852624801b24ebb7ae78fe8272889ac888"

[[package]]
name = "hashbrown"
version = "0.17.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ed5909b6e89a2db4456e54cd5f673791d7eca6732202bbf2a9cc504fe2f9b84a"
dependencies = [
 "foldhash",
]

[[package]]
name = "hashlink"
version = "0.12.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a596f1b20ed2cc5ecac41a164aaebc7258057060f06c0cf7a2ba3991ee7990fb"
dependencies = [
 "hashbrown 0.17.1",
]

[[package]]
name = "heck"
version = "0.4.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "95505c38b4572b2d910cecb0281560f54b440a19336cbbcb27bf6ce6adc6f5a8"

[[package]]
name = "heck"
version = "0.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2304e00983f87ffb38b55b444b5e3b60a884b5d30c0fca7d82fe33449bbe55ea"

[[package]]
name = "hermit-abi"
version = "0.5.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e17592d60ebacc7d5e169f4663c5f84f9161cc90328abcfe8456f41e4dfcb284"

[[package]]
name = "hex"
version = "0.4.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7f24254aa9a54b5c858eaee2f5bccdb46aaf0e486a595ed5fd8f86ba55232a70"

[[package]]
name = "html5ever"
version = "0.39.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "46a1761807faccc9a19e86944bbf40610014066306f96edcdedc2fb714bcb7b8"
dependencies = [
 "log",
 "markup5ever",
]

[[package]]
name = "http"
version = "1.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "918d3568bebf352712bc2ef3d46a8bcf1a75b373be6539de198e9105cbbf9ce0"
dependencies = [
 "bytes",
 "itoa",
]

[[package]]
name = "http-body"
version = "1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ca2a8f2913ee65f60facd6a5905613afaa448497a0230cc41ce022d93290bc2c"
dependencies = [
 "bytes",
 "http",
]

[[package]]
name = "http-body-util"
version = "0.1.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "23169fe34a5fbcdd3f3862e78fb9b6fccd5f02a6dc6f732547005d45631ce71c"
dependencies = [
 "bytes",
 "futures-core",
 "http",
 "http-body",
 "pin-project-lite",
]

[[package]]
name = "httparse"
version = "1.10.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6dbf3de79e51f3d586ab4cb9d5c3e2c14aa28ed23d180cf89b4df0454a69cc87"

[[package]]
name = "httpdate"
version = "1.0.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "df3b46402a9d5adb4c86a0cf463f42e19994e3ee891101b1841f30a545cb49a9"

[[package]]
name = "hyper"
version = "1.12.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2c3e324da4c95177d6291d4c8730197c0d1822f8a9766814a4a44fa5ab797c9c"
dependencies = [
 "atomic-waker",
 "bytes",
 "futures-core",
 "http",
 "http-body",
 "httparse",
 "itoa",
 "pin-project-lite",
 "smallvec",
 "tokio",
 "want",
]

[[package]]
name = "hyper-util"
version = "0.1.21"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ddc03d96684f9226b8a787cdb71488417b53ab5ea8fdb1dac946cb9431cc8bff"
dependencies = [
 "base64 0.23.1",
 "bytes",
 "futures-channel",
 "futures-util",
 "http",
 "http-body",
 "httparse",
 "hyper",
 "ipnet",
 "libc",
 "percent-encoding",
 "pin-project-lite",
 "socket2",
 "tokio",
 "tower-service",
 "tracing",
]

[[package]]
name = "iana-time-zone"
version = "0.1.65"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e31bc9ad994ba00e440a8aa5c9ef0ec67d5cb5e5cb0cc7f8b744a35b389cc470"
dependencies = [
 "android_system_properties",
 "core-foundation-sys",
 "iana-time-zone-haiku",
 "js-sys",
 "log",
 "wasm-bindgen",
 "windows-core",
]

[[package]]
name = "iana-time-zone-haiku"
version = "0.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f31827a206f56af32e590ba56d5d2d085f558508192593743f16b2306495269f"
dependencies = [
 "cc",
]

[[package]]
name = "ico"
version = "0.6.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d75e94d66081e4d8dcd098bd8dc5254800fea14a26389b298410158d834de167"
dependencies = [
 "byteorder",
 "png",
]

[[package]]
name = "icu_collections"
version = "2.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fe090a42a0d3140fed8c63263ed1fecc02422cb2f4bfe55cd8de2de1b8e105dd"
dependencies = [
 "displaydoc",
 "potential_utf",
 "utf8_iter",
 "yoke",
 "zerofrom",
 "zerovec",
]

[[package]]
name = "icu_locale_core"
version = "2.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "25d29b57c17c6528d0dc4c2141cfa2d08200465acb537a3909c8b9b8a4a984c0"
dependencies = [
 "displaydoc",
 "litemap",
 "tinystr",
 "writeable",
 "zerovec",
]

[[package]]
name = "icu_normalizer"
version = "2.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "404a3b8c486f205c87fe7f23ab6894d84a4ad76d6e4671ae1981ba7def87c599"
dependencies = [
 "icu_collections",
 "icu_normalizer_data",
 "icu_properties",
 "icu_provider",
 "smallvec",
 "zerovec",
]

[[package]]
name = "icu_normalizer_data"
version = "2.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "20f0088bfb7441f7a37fa0c9e20cb1e9cba1cac6b9ce8cd2a6dc44294f8e8cbc"

[[package]]
name = "icu_properties"
version = "2.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2ea83d991c56158f7cf898bf86436c1dfe7c07ee82fe88951f2695c9f37a379f"
dependencies = [
 "displaydoc",
 "icu_collections",
 "icu_locale_core",
 "icu_properties_data",
 "icu_provider",
 "zerotrie",
 "zerovec",
]

[[package]]
name = "icu_properties_data"
version = "2.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b98f29af82d02b163fe50161388350e743bb3107cc8e8c2f7314cb505faddfcf"

[[package]]
name = "icu_provider"
version = "2.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "413099315636c588ee8f011190b329b971a09a8fae9d157e01dcae8379468514"
dependencies = [
 "displaydoc",
 "icu_locale_core",
 "writeable",
 "yoke",
 "zerofrom",
 "zerotrie",
 "zerovec",
]

[[package]]
name = "ident_case"
version = "1.0.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b9e0384b61958566e926dc50660321d12159025e767c18e043daf26b70104c39"

[[package]]
name = "idna"
version = "1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3b0875f23caa03898994f6ddc501886a45c7d3d62d04d2d90788d47be1b1e4de"
dependencies = [
 "idna_adapter",
 "smallvec",
 "utf8_iter",
]

[[package]]
name = "idna_adapter"
version = "1.2.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cb68373c0d6620ef8105e855e7745e18b0d00d3bdb07fb532e434244cdb9a714"
dependencies = [
 "icu_normalizer",
 "icu_properties",
]

[[package]]
name = "image"
version = "0.25.10"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "85ab80394333c02fe689eaf900ab500fbd0c2213da414687ebf995a65d5a6104"
dependencies = [
 "bytemuck",
 "byteorder-lite",
 "image-webp",
 "moxcms",
 "num-traits",
 "png",
 "zune-core",
 "zune-jpeg",
]

[[package]]
name = "image-webp"
version = "0.2.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "525e9ff3e1a4be2fbea1fdf0e98686a6d98b4d8f937e1bf7402245af1909e8c3"
dependencies = [
 "byteorder-lite",
 "quick-error",
]

[[package]]
name = "indexmap"
version = "1.9.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bd070e393353796e801d209ad339e89596eb4c8d430d18ede6a1cced8fafbd99"
dependencies = [
 "autocfg",
 "hashbrown 0.12.3",
 "serde",
]

[[package]]
name = "indexmap"
version = "2.14.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cc4e190f5d26ca7051642629da2c52fc03bde85a03197c99408dcd291734c855"
dependencies = [
 "equivalent",
 "hashbrown 0.17.1",
 "serde",
 "serde_core",
]

[[package]]
name = "infer"
version = "0.22.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f4200d433cbd5178df7797c9c2e75b348b728e39631cf14520d1e2fc424201f4"
dependencies = [
 "cfb",
]

[[package]]
name = "ipnet"
version = "2.12.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "791930b43c0d5973160d90a8f3894509f2b273430f5c5c73b668636d0287c5c0"

[[package]]
name = "itoa"
version = "1.0.18"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8f42a60cbdf9a97f5d2305f08a87dc4e09308d1276d28c869c684d7777685682"

[[package]]
name = "javascriptcore-rs"
version = "1.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ca5671e9ffce8ffba57afc24070e906da7fc4b1ba66f2cabebf61bf2ea257fcc"
dependencies = [
 "bitflags 1.3.2",
 "glib",
 "javascriptcore-rs-sys",
]

[[package]]
name = "javascriptcore-rs-sys"
version = "1.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "af1be78d14ffa4b75b66df31840478fef72b51f8c2465d4ca7c194da9f7a5124"
dependencies = [
 "glib-sys",
 "gobject-sys",
 "libc",
 "system-deps",
]

[[package]]
name = "jiff"
version = "0.2.38"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b2b005715dcbeb0089a3c0dab99f2ff1cc3b2525323552703d648585d342a383"
dependencies = [
 "defmt",
 "jiff-core",
 "jiff-static",
 "jiff-tzdb-platform",
 "log",
 "portable-atomic",
 "portable-atomic-util",
 "serde_core",
 "windows-link",
]

[[package]]
name = "jiff-core"
version = "0.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5e52fe76043ccecc9005d2305ebaadf7d7fc0cc89ca6baa10a94d6bc68c7128c"
dependencies = [
 "defmt",
 "log",
]

[[package]]
name = "jiff-static"
version = "0.2.38"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2cc9817253cf7c7ee4684451bd327e88d6f3658014e54a29198625590650695c"
dependencies = [
 "jiff-core",
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "jiff-tzdb"
version = "0.1.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fa8377070c6bae868759445e5a77f66d84f0b72f3a054bfb00e6d038b8282da7"

[[package]]
name = "jiff-tzdb-platform"
version = "0.1.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "875a5a69ac2bab1a891711cf5eccbec1ce0341ea805560dcd90b7a2e925132e8"
dependencies = [
 "jiff-tzdb",
]

[[package]]
name = "jni"
version = "0.21.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1a87aa2bb7d2af34197c04845522473242e1aa17c12f4935d5856491a7fb8c97"
dependencies = [
 "cesu8",
 "cfg-if",
 "combine",
 "jni-sys 0.3.1",
 "log",
 "thiserror 1.0.69",
 "walkdir",
 "windows-sys 0.45.0",
]

[[package]]
name = "jni-sys"
version = "0.3.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "41a652e1f9b6e0275df1f15b32661cf0d4b78d4d87ddec5e0c3c20f097433258"
dependencies = [
 "jni-sys 0.4.1",
]

[[package]]
name = "jni-sys"
version = "0.4.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c6377a88cb3910bee9b0fa88d4f42e1d2da8e79915598f65fb0c7ee14c878af2"
dependencies = [
 "jni-sys-macros",
]

[[package]]
name = "jni-sys-macros"
version = "0.4.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "38c0b942f458fe50cdac086d2f946512305e5631e720728f2a61aabcd47a6264"
dependencies = [
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "js-sys"
version = "0.3.106"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7883d941dae510fb2d978fc3fe018c71c9e2892fd38854de3e8b92c2e5ad9cc5"
dependencies = [
 "cfg-if",
 "futures-util",
 "wasm-bindgen",
]

[[package]]
name = "json-patch"
version = "4.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7421438de105a0827e44fadd05377727847d717c80ce29a229f85fd04c427b72"
dependencies = [
 "jsonptr",
 "serde",
 "serde_json",
 "thiserror 2.0.21",
]

[[package]]
name = "jsonptr"
version = "0.7.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a5a3cc660ba5d72bce0b3bb295bf20847ccbb40fd423f3f05b61273672e561fe"
dependencies = [
 "serde",
 "serde_json",
]

[[package]]
name = "keyboard-types"
version = "0.8.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0fbe853b403ae61a04233030ae8a79d94975281ed9770a1f9e246732b534b28d"
dependencies = [
 "bitflags 2.13.2",
 "serde",
]

[[package]]
name = "libappindicator"
version = "0.9.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "03589b9607c868cc7ae54c0b2a22c8dc03dd41692d48f2d7df73615c6a95dc0a"
dependencies = [
 "glib",
 "gtk",
 "gtk-sys",
 "libappindicator-sys",
 "log",
]

[[package]]
name = "libappindicator-sys"
version = "0.9.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6e9ec52138abedcc58dc17a7c6c0c00a2bdb4f3427c7f63fa97fd0d859155caf"
dependencies = [
 "gtk-sys",
 "libloading",
 "once_cell",
]

[[package]]
name = "libc"
version = "0.2.191"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "65cd87c9a6d60536580b316ad985726104730a5151c99845f2490428ef91240a"

[[package]]
name = "libdbus-sys"
version = "0.2.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "328c4789d42200f1eeec05bd86c9c13c7f091d2ba9a6ea35acdf51f31bc0f043"
dependencies = [
 "pkg-config",
]

[[package]]
name = "libloading"
version = "0.7.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b67380fd3b2fbe7527a606e18729d21c6f3951633d0500574c4dc22d2d638b9f"
dependencies = [
 "cfg-if",
 "winapi",
]

[[package]]
name = "libredox"
version = "0.1.25"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "61ff90caf6077a803a240f62fdbe88645a890bbca49ef8174c3cb0404362171d"
dependencies = [
 "libc",
]

[[package]]
name = "libsqlite3-sys"
version = "0.39.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "14a5f01b87b92705d07b433c06f96cbc764637d81a0bffb5734ce17cf0f9a2b3"
dependencies = [
 "cc",
 "pkg-config",
 "vcpkg",
]

[[package]]
name = "linux-raw-sys"
version = "0.12.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "32a66949e030da00e8c7d4434b251670a91556f4144941d37452769c25d58a53"

[[package]]
name = "litemap"
version = "0.8.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "47d9d19d1d6efa0109d2f65ff4c85cddd50bd572e5a00127ab10987290bcefae"

[[package]]
name = "lock_api"
version = "0.4.14"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "224399e74b87b5f3557511d98dff8b14089b3dadafcab6bb93eab67d3aace965"
dependencies = [
 "scopeguard",
]

[[package]]
name = "log"
version = "0.4.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f9f8bd3e56ce4dfc153cf470fffbfa98c7620958b312ca5c3a4b8d5181fd13c6"

[[package]]
name = "markup5ever"
version = "0.39.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7122d987ec5f704ee56f6e5b41a7d93722e9aae27ae07cafa4036c4d3f9757de"
dependencies = [
 "log",
 "tendril",
 "web_atoms",
]

[[package]]
name = "memchr"
version = "2.8.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cf8baf1c55e62ffcace7a9f06f4bd9cd3f0c4beb022d3b367256b91b87513d98"

[[package]]
name = "memoffset"
version = "0.9.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "488016bfae457b036d996092f6cb448677611ce4449e970ceaf42695203f218a"
dependencies = [
 "autocfg",
]

[[package]]
name = "mime"
version = "0.3.17"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6877bb514081ee2a7ff5ef9de3281f14a4dd4bceac4c09388074a6b5df8a139a"

[[package]]
name = "miniz_oxide"
version = "0.8.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1fa76a2c86f704bdb222d66965fb3d63269ce38518b83cb0575fca855ebb6316"
dependencies = [
 "adler2",
 "simd-adler32",
]

[[package]]
name = "miniz_oxide"
version = "0.9.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b63fbc4a50860e98e7b2aa7804ded1db5cbc3aff9193adaff57a6931bf7c4b4c"
dependencies = [
 "adler2",
 "simd-adler32",
]

[[package]]
name = "mio"
version = "1.2.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1788edb87fdc09c7e26304471e2f5be8cdefb1b6930d6e3985fc02ff53bf86ee"
dependencies = [
 "libc",
 "wasi",
 "windows-sys 0.61.2",
]

[[package]]
name = "moxcms"
version = "0.8.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bb85c154ba489f01b25c0d36ae69a87e4a1c73a72631fc6c0eb6dde34a73e44b"
dependencies = [
 "num-traits",
 "pxfm",
]

[[package]]
name = "muda"
version = "0.20.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cca139e57da4383727f189e43e66e84fa372347027fc996f9f1a007ec0a37996"
dependencies = [
 "crossbeam-channel",
 "dpi",
 "gtk",
 "keyboard-types",
 "objc2",
 "objc2-app-kit",
 "objc2-core-foundation",
 "objc2-foundation",
 "once_cell",
 "png",
 "serde",
 "thiserror 2.0.21",
 "windows-sys 0.61.2",
]

[[package]]
name = "ndk"
version = "0.9.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c3f42e7bbe13d351b6bead8286a43aac9534b82bd3cc43e47037f012ebfd62d4"
dependencies = [
 "bitflags 2.13.2",
 "jni-sys 0.3.1",
 "log",
 "ndk-sys",
 "num_enum",
 "raw-window-handle",
 "thiserror 1.0.69",
]

[[package]]
name = "ndk-context"
version = "0.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "27b02d87554356db9e9a873add8782d4ea6e3e58ea071a9adb9a2e8ddb884a8b"

[[package]]
name = "ndk-sys"
version = "0.6.0+11769913"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ee6cda3051665f1fb8d9e08fc35c96d5a244fb1be711a03b71118828afc9a873"
dependencies = [
 "jni-sys 0.3.1",
]

[[package]]
name = "new_debug_unreachable"
version = "1.0.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "650eef8c711430f1a879fdd01d4745a7deea475becfb90269c06775983bbf086"

[[package]]
name = "num-conv"
version = "0.2.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "521739c6d2bac4aa25192232afe6841231376b2b26d4d9fae5ecf8ca5772e441"

[[package]]
name = "num-traits"
version = "0.2.19"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "071dfc062690e90b734c0b2273ce72ad0ffa95f0c74596bc250dcfd960262841"
dependencies = [
 "autocfg",
]

[[package]]
name = "num_enum"
version = "0.7.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5d0bca838442ec211fa11de3a8b0e0e8f3a4522575b5c4c06ed722e005036f26"
dependencies = [
 "num_enum_derive",
 "rustversion",
]

[[package]]
name = "num_enum_derive"
version = "0.7.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "680998035259dcfcafe653688bf2aa6d3e2dc05e98be6ab46afb089dc84f1df8"
dependencies = [
 "proc-macro-crate 3.5.0",
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "objc2"
version = "0.6.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "08849bbd4767dfae9457696856ae1c84fe4e0281bbe4a7abff2d0e06fb7981f8"
dependencies = [
 "objc2-encode",
 "objc2-exception-helper",
]

[[package]]
name = "objc2-app-kit"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d49e936b501e5c5bf01fda3a9452ff86dc3ea98ad5f283e1455153142d97518c"
dependencies = [
 "bitflags 2.13.2",
 "block2",
 "objc2",
 "objc2-core-foundation",
 "objc2-foundation",
 "objc2-quartz-core",
]

[[package]]
name = "objc2-cloud-kit"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "73ad74d880bb43877038da939b7427bba67e9dd42004a18b809ba7d87cee241c"
dependencies = [
 "bitflags 2.13.2",
 "objc2",
 "objc2-foundation",
]

[[package]]
name = "objc2-core-data"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0b402a653efbb5e82ce4df10683b6b28027616a2715e90009947d50b8dd298fa"
dependencies = [
 "objc2",
 "objc2-foundation",
]

[[package]]
name = "objc2-core-foundation"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2a180dd8642fa45cdb7dd721cd4c11b1cadd4929ce112ebd8b9f5803cc79d536"
dependencies = [
 "bitflags 2.13.2",
 "dispatch2",
 "objc2",
]

[[package]]
name = "objc2-core-graphics"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e022c9d066895efa1345f8e33e584b9f958da2fd4cd116792e15e07e4720a807"
dependencies = [
 "bitflags 2.13.2",
 "dispatch2",
 "objc2",
 "objc2-core-foundation",
 "objc2-io-surface",
]

[[package]]
name = "objc2-core-image"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e5d563b38d2b97209f8e861173de434bd0214cf020e3423a52624cd1d989f006"
dependencies = [
 "objc2",
 "objc2-foundation",
]

[[package]]
name = "objc2-core-location"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ca347214e24bc973fc025fd0d36ebb179ff30536ed1f80252706db19ee452009"
dependencies = [
 "objc2",
 "objc2-foundation",
]

[[package]]
name = "objc2-core-text"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0cde0dfb48d25d2b4862161a4d5fcc0e3c24367869ad306b0c9ec0073bfed92d"
dependencies = [
 "bitflags 2.13.2",
 "objc2",
 "objc2-core-foundation",
 "objc2-core-graphics",
]

[[package]]
name = "objc2-encode"
version = "4.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ef25abbcd74fb2609453eb695bd2f860d389e457f67dc17cafc8b8cbc89d0c33"

[[package]]
name = "objc2-exception-helper"
version = "0.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c7a1c5fbb72d7735b076bb47b578523aedc40f3c439bea6dfd595c089d79d98a"
dependencies = [
 "cc",
]

[[package]]
name = "objc2-foundation"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e3e0adef53c21f888deb4fa59fc59f7eb17404926ee8a6f59f5df0fd7f9f3272"
dependencies = [
 "bitflags 2.13.2",
 "block2",
 "objc2",
 "objc2-core-foundation",
]

[[package]]
name = "objc2-io-surface"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "180788110936d59bab6bd83b6060ffdfffb3b922ba1396b312ae795e1de9d81d"
dependencies = [
 "bitflags 2.13.2",
 "objc2",
 "objc2-core-foundation",
]

[[package]]
name = "objc2-quartz-core"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "96c1358452b371bf9f104e21ec536d37a650eb10f7ee379fff67d2e08d537f1f"
dependencies = [
 "bitflags 2.13.2",
 "objc2",
 "objc2-core-foundation",
 "objc2-foundation",
]

[[package]]
name = "objc2-ui-kit"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d87d638e33c06f577498cbcc50491496a3ed4246998a7fbba7ccb98b1e7eab22"
dependencies = [
 "bitflags 2.13.2",
 "block2",
 "objc2",
 "objc2-cloud-kit",
 "objc2-core-data",
 "objc2-core-foundation",
 "objc2-core-graphics",
 "objc2-core-image",
 "objc2-core-location",
 "objc2-core-text",
 "objc2-foundation",
 "objc2-quartz-core",
 "objc2-user-notifications",
]

[[package]]
name = "objc2-user-notifications"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9df9128cbbfef73cda168416ccf7f837b62737d748333bfe9ab71c245d76613e"
dependencies = [
 "objc2",
 "objc2-foundation",
]

[[package]]
name = "objc2-web-kit"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b2e5aaab980c433cf470df9d7af96a7b46a9d892d521a2cbbb2f8a4c16751e7f"
dependencies = [
 "bitflags 2.13.2",
 "block2",
 "objc2",
 "objc2-app-kit",
 "objc2-core-foundation",
 "objc2-foundation",
]

[[package]]
name = "once_cell"
version = "1.21.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9f7c3e4beb33f85d45ae3e3a1792185706c8e16d043238c593331cc7cd313b50"

[[package]]
name = "option-ext"
version = "0.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "04744f49eae99ab78e0d5c0b603ab218f515ea8cfe5a456d7629ad883a3b6e7d"

[[package]]
name = "ordered-stream"
version = "0.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9aa2b01e1d916879f73a53d01d1d6cee68adbb31d6d9177a8cfce093cced1d50"
dependencies = [
 "futures-core",
 "pin-project-lite",
]

[[package]]
name = "pango"
version = "0.18.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7ca27ec1eb0457ab26f3036ea52229edbdb74dee1edd29063f5b9b010e7ebee4"
dependencies = [
 "gio",
 "glib",
 "libc",
 "once_cell",
 "pango-sys",
]

[[package]]
name = "pango-sys"
version = "0.18.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "436737e391a843e5933d6d9aa102cb126d501e815b83601365a948a518555dc5"
dependencies = [
 "glib-sys",
 "gobject-sys",
 "libc",
 "system-deps",
]

[[package]]
name = "parking"
version = "2.2.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f38d5652c16fde515bb1ecef450ab0f6a219d619a7274976324d5e377f7dceba"

[[package]]
name = "parking_lot"
version = "0.12.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "93857453250e3077bd71ff98b6a65ea6621a19bb0f559a85248955ac12c45a1a"
dependencies = [
 "lock_api",
 "parking_lot_core",
]

[[package]]
name = "parking_lot_core"
version = "0.9.12"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2621685985a2ebf1c516881c026032ac7deafcda1a2c9b7850dc81e3dfcb64c1"
dependencies = [
 "cfg-if",
 "libc",
 "redox_syscall",
 "smallvec",
 "windows-link",
]

[[package]]
name = "percent-encoding"
version = "2.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9b4f627cb1b25917193a259e49bdad08f671f8d9708acfd5fe0a8c1455d87220"

[[package]]
name = "phf"
version = "0.13.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c1562dc717473dbaa4c1f85a36410e03c047b2e7df7f45ee938fbef64ae7fadf"
dependencies = [
 "phf_macros",
 "phf_shared",
 "serde",
]

[[package]]
name = "phf_codegen"
version = "0.13.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "49aa7f9d80421bca176ca8dbfebe668cc7a2684708594ec9f3c0db0805d5d6e1"
dependencies = [
 "phf_generator",
 "phf_shared",
]

[[package]]
name = "phf_generator"
version = "0.13.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "135ace3a761e564ec88c03a77317a7c6b80bb7f7135ef2544dbe054243b89737"
dependencies = [
 "fastrand",
 "phf_shared",
]

[[package]]
name = "phf_macros"
version = "0.13.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "812f032b54b1e759ccd5f8b6677695d5268c588701effba24601f6932f8269ef"
dependencies = [
 "phf_generator",
 "phf_shared",
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "phf_shared"
version = "0.13.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e57fef6bc5981e38c2ce2d63bfa546861309f875b8a75f092d1d54ae2d64f266"
dependencies = [
 "siphasher",
]

[[package]]
name = "pin-project-lite"
version = "0.2.17"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a89322df9ebe1c1578d689c92318e070967d1042b512afbe49518723f4e6d5cd"

[[package]]
name = "piper"
version = "0.2.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c835479a4443ded371d6c535cbfd8d31ad92c5d23ae9770a61bc155e4992a3c1"
dependencies = [
 "atomic-waker",
 "fastrand",
 "futures-io",
]

[[package]]
name = "pkg-config"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f6b464fbc74e149a392436b17d523f769e057cb6877f6a5c4618bc6f11800548"

[[package]]
name = "plist"
version = "1.10.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "327a4cb2ad49dc48adfdc9da89e22c64d488b508c67a044d71ba729e4521a285"
dependencies = [
 "base64 0.23.1",
 "indexmap 2.14.2",
 "quick-xml",
 "serde",
 "time",
]

[[package]]
name = "png"
version = "0.18.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "60769b8b31b2a9f263dae2776c37b1b28ae246943cf719eb6946a1db05128a61"
dependencies = [
 "bitflags 2.13.2",
 "crc32fast",
 "fdeflate",
 "flate2",
 "miniz_oxide 0.8.9",
]

[[package]]
name = "polling"
version = "3.11.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5d0e4f59085d47d8241c88ead0f274e8a0cb551f3625263c05eb8dd897c34218"
dependencies = [
 "cfg-if",
 "concurrent-queue",
 "hermit-abi",
 "pin-project-lite",
 "rustix",
 "windows-sys 0.61.2",
]

[[package]]
name = "portable-atomic"
version = "1.15.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "05c8b63e8d9609db387f0324918f81d68fe27748f084ef092fb35954d0539a85"

[[package]]
name = "portable-atomic-util"
version = "0.2.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "10ab3eb7f3becc3a1cbc4f2c6f20267996cfc1a6467a873763411b136a122715"
dependencies = [
 "portable-atomic",
]

[[package]]
name = "potential_utf"
version = "0.1.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d83eb9bc6d8e5cf568e7a1101d60ee05e81ed50ea106026f3d18deeb046d7661"
dependencies = [
 "zerovec",
]

[[package]]
name = "powerfmt"
version = "0.2.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4a6394b9e965e73d0a289ee54f589087e2c676aedf60885baf52c76b771e4958"

[[package]]
name = "precomputed-hash"
version = "0.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "925383efa346730478fb4838dbe9137d2a47675ad789c546d150a6e1dd4ab31c"

[[package]]
name = "proc-macro-crate"
version = "1.3.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7f4c021e1093a56626774e81216a4ce732a735e5bad4868a03f3ed65ca0c3919"
dependencies = [
 "once_cell",
 "toml_edit 0.19.15",
]

[[package]]
name = "proc-macro-crate"
version = "2.0.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b00f26d3400549137f92511a46ac1cd8ce37cb5598a96d382381458b992a5d24"
dependencies = [
 "toml_datetime 0.6.3",
 "toml_edit 0.20.2",
]

[[package]]
name = "proc-macro-crate"
version = "3.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e67ba7e9b2b56446f1d419b1d807906278ffa1a658a8a5d8a39dcb1f5a78614f"
dependencies = [
 "toml_edit 0.25.17+spec-1.1.0",
]

[[package]]
name = "proc-macro-error"
version = "1.0.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "da25490ff9892aab3fcf7c36f08cfb902dd3e71ca0f9f9517bea02a73a5ce38c"
dependencies = [
 "proc-macro-error-attr",
 "proc-macro2",
 "quote",
 "syn 1.0.109",
 "version_check",
]

[[package]]
name = "proc-macro-error-attr"
version = "1.0.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a1be40180e52ecc98ad80b184934baf3d0d29f979574e439af5a55274b35f869"
dependencies = [
 "proc-macro2",
 "quote",
 "version_check",
]

[[package]]
name = "proc-macro2"
version = "1.0.107"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "985e7ec9bb745e6ce6535b544d84d6cd6f7ad8bd711c398938ae983b91a766d9"
dependencies = [
 "unicode-ident",
]

[[package]]
name = "pxfm"
version = "0.1.30"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d55d956fa96f5ec02be2e13af0e20391a5aa83d6a074e3ad368959d0fab299ea"

[[package]]
name = "quick-error"
version = "2.0.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a993555f31e5a609f617c12db6250dedcac1b0a85076912c436e6fc9b2c8e6a3"

[[package]]
name = "quick-xml"
version = "0.42.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "41b1177fdf999d2321d3fb46ff47159d9c1fb9ad66a4879f8c50a0b504615e9b"
dependencies = [
 "memchr",
]

[[package]]
name = "quote"
version = "1.0.47"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1fbf4db142a473a8d80c26bbf18454ed458bf8d26c8219c331daecfdbd079001"
dependencies = [
 "proc-macro2",
]

[[package]]
name = "r-efi"
version = "5.3.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "69cdb34c158ceb288df11e18b4bd39de994f6657d83847bdffdbd7f346754b0f"

[[package]]
name = "r-efi"
version = "6.0.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f8dcc9c7d52a811697d2151c701e0d08956f92b0e24136cf4cf27b57a6a0d9bf"

[[package]]
name = "raw-window-handle"
version = "0.6.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "20675572f6f24e9e76ef639bc5552774ed45f1c30e2951e1e99c59888861c539"

[[package]]
name = "redox_syscall"
version = "0.5.18"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ed2bf2547551a7053d6fdfafda3f938979645c44812fbfcda098faae3f1a362d"
dependencies = [
 "bitflags 2.13.2",
]

[[package]]
name = "redox_users"
version = "0.4.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ba009ff324d1fc1b900bd1fdb31564febe58a8ccc8a6fdbb93b543d33b13ca43"
dependencies = [
 "getrandom 0.2.17",
 "libredox",
 "thiserror 1.0.69",
]

[[package]]
name = "redox_users"
version = "0.5.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "60dc65c0ff1a7ae1294b0c67b9f14baf70b644404010370171787bfac1038fc0"
dependencies = [
 "libredox",
 "thiserror 2.0.21",
]

[[package]]
name = "ref-cast"
version = "1.0.27"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7e440fb4e4b4147295338efb76001ab9e4efc0e5839df2c47fc5ac2381d365c3"
dependencies = [
 "ref-cast-impl",
]

[[package]]
name = "ref-cast-impl"
version = "1.0.27"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "92ecd8964f8453721699a1ed72037b0db49ce2f5a5138486ee89bed6f67cdf3a"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "regex"
version = "1.13.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f020237b6c8eed93db2e2cb53c00c60a8e1bc73da7d073199a1180401450218d"
dependencies = [
 "aho-corasick",
 "memchr",
 "regex-automata",
 "regex-syntax",
]

[[package]]
name = "regex-automata"
version = "0.4.18"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ad8553b9b26413251cbf30e620595c7a41b3887f03da04579c0e6b0d6a06b4b2"
dependencies = [
 "aho-corasick",
 "memchr",
 "regex-syntax",
]

[[package]]
name = "regex-syntax"
version = "0.8.11"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d6f6ff9a378485b298a5286656da665ba74413d36db0979633275d2e708145d4"

[[package]]
name = "reqwest"
version = "0.13.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "16a1cfa75cc186dd73d5818e510e042e40927bccc9c236b061cea97e1eb08029"
dependencies = [
 "base64 0.23.1",
 "bytes",
 "futures-core",
 "futures-util",
 "http",
 "http-body",
 "http-body-util",
 "hyper",
 "hyper-util",
 "js-sys",
 "log",
 "percent-encoding",
 "pin-project-lite",
 "serde",
 "serde_json",
 "sync_wrapper",
 "tokio",
 "tokio-util",
 "tower",
 "tower-http",
 "tower-service",
 "url",
 "wasm-bindgen",
 "wasm-bindgen-futures",
 "wasm-streams",
 "web-sys",
]

[[package]]
name = "rsqlite-vfs"
version = "0.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "353b74f9810d5b085b6c42c9d86a5f0fdb795553235cdd48753b32e3809d18a7"
dependencies = [
 "thiserror 2.0.21",
]

[[package]]
name = "rusqlite"
version = "0.41.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9c026b4444579e8d754556c6c75d040d69c4a44283cdb648ab8a8d5965c2cfa8"
dependencies = [
 "bitflags 2.13.2",
 "fallible-iterator",
 "fallible-streaming-iterator",
 "hashlink",
 "libsqlite3-sys",
 "smallvec",
 "sqlite-wasm-rs",
]

[[package]]
name = "rustc-hash"
version = "2.1.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6b1e7f9a428571be2dc5bc0505c13fb6bf936822b894ec87abf8a08a4e51742d"

[[package]]
name = "rustc_version"
version = "0.4.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cfcb3a22ef46e85b45de6ee7e79d063319ebb6594faafcf1c225ea92ab6e9b92"
dependencies = [
 "semver",
]

[[package]]
name = "rustix"
version = "1.1.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e5e76742e5294153d4dde1207dbec5bdd81eef6fabdc0d2118babadabfd858aa"
dependencies = [
 "bitflags 2.13.2",
 "errno",
 "libc",
 "linux-raw-sys",
 "windows-sys 0.61.2",
]

[[package]]
name = "rustversion"
version = "1.0.23"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cf54715a573b99ac80df0bc206da022bcd442c974952c7b9720069370852e21f"

[[package]]
name = "same-file"
version = "1.0.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "93fc1dc3aaa9bfed95e02e6eadabb4baf7e3078b0bd1b4d7b6b0b68378900502"
dependencies = [
 "winapi-util",
]

[[package]]
name = "schemars"
version = "0.8.22"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3fbf2ae1b8bc8e02df939598064d22402220cd5bbcca1c76f7d6a310974d5615"
dependencies = [
 "dyn-clone",
 "indexmap 1.9.3",
 "schemars_derive",
 "serde",
 "serde_json",
 "url",
 "uuid",
]

[[package]]
name = "schemars"
version = "0.9.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4cd191f9397d57d581cddd31014772520aa448f65ef991055d7f61582c65165f"
dependencies = [
 "dyn-clone",
 "ref-cast",
 "serde",
 "serde_json",
]

[[package]]
name = "schemars"
version = "1.2.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ab508826f74a77ca9d5aba6ff19b522583ee3eaf28a19384ff3d0e5835fadf6e"
dependencies = [
 "dyn-clone",
 "ref-cast",
 "serde",
 "serde_json",
]

[[package]]
name = "schemars_derive"
version = "0.8.22"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "32e265784ad618884abaea0600a9adf15393368d840e0222d101a072f3f7534d"
dependencies = [
 "proc-macro2",
 "quote",
 "serde_derive_internals",
 "syn 2.0.119",
]

[[package]]
name = "scopeguard"
version = "1.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "94143f37725109f92c262ed2cf5e59bce7498c01bcc1502d7b9afe439a4e9f49"

[[package]]
name = "selectors"
version = "0.38.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8adfa1c298912827b8a28b223b3b874357397ae706e6190acd9bf28cee99114d"
dependencies = [
 "bitflags 2.13.2",
 "cssparser",
 "derive_more",
 "log",
 "new_debug_unreachable",
 "phf",
 "phf_codegen",
 "precomputed-hash",
 "rustc-hash",
 "servo_arc",
 "smallvec",
]

[[package]]
name = "semver"
version = "1.0.28"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8a7852d02fc848982e0c167ef163aaff9cd91dc640ba85e263cb1ce46fae51cd"
dependencies = [
 "serde",
 "serde_core",
]

[[package]]
name = "serde"
version = "1.0.229"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4148590afebada386688f18773da617792bf2ef03ffc1e4cbd2b1d45b023e0ba"
dependencies = [
 "serde_core",
 "serde_derive",
]

[[package]]
name = "serde-untagged"
version = "0.1.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f9faf48a4a2d2693be24c6289dbe26552776eb7737074e6722891fadbe6c5058"
dependencies = [
 "erased-serde",
 "serde",
 "serde_core",
 "typeid",
]

[[package]]
name = "serde_core"
version = "1.0.229"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "67dca2c9c51e58a4791a4b1ed58308b39c64224d349a935ab5039aa360942a48"
dependencies = [
 "serde_derive",
]

[[package]]
name = "serde_derive"
version = "1.0.229"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e7a5d71263a5a7d47b41f6b3f06ba276f10cc18b0931f1799f710578e2309348"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "serde_derive_internals"
version = "0.29.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "18d26a20a969b9e3fdf2fc2d9f21eda6c40e2de84c9408bb5d3b05d499aae711"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "serde_json"
version = "1.0.154"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e7e9cc8b1b85264074fbcc02a88680c4096b1e47df8f739dceb03bf482f04bd6"
dependencies = [
 "itoa",
 "memchr",
 "serde",
 "serde_core",
 "zmij",
]

[[package]]
name = "serde_repr"
version = "0.1.21"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8d3b1629de253c70a0508c3899572da79ca359fdab27c7920ff00406df418906"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "serde_spanned"
version = "0.6.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bf41e0cfaf7226dca15e8197172c295a782857fcb97fad1808a166870dee75a3"
dependencies = [
 "serde",
]

[[package]]
name = "serde_spanned"
version = "1.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4e7523beb55eece201a2356bee0bbca0d1ab466c14c07703b2e0ee6d42cb0c2c"
dependencies = [
 "serde_core",
]

[[package]]
name = "serde_with"
version = "3.24.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "df9adc193c780ef8f159aee8b61e2d5801aaa555e6eb0947fe45530ec506296f"
dependencies = [
 "base64 0.23.1",
 "bs58",
 "chrono",
 "hex",
 "indexmap 1.9.3",
 "indexmap 2.14.2",
 "jiff",
 "schemars 0.9.0",
 "schemars 1.2.3",
 "serde_core",
 "serde_json",
 "serde_with_macros",
 "time",
]

[[package]]
name = "serde_with_macros"
version = "3.24.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3e17bbc68e28663bbbb90df47e058aa7eda4fb445b89fe70457bb94fbccf6e49"
dependencies = [
 "darling",
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "serialize-to-javascript"
version = "0.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "04f3666a07a197cdb77cdf306c32be9b7f598d7060d50cfd4d5aa04bfd92f6c5"
dependencies = [
 "serde",
 "serde_json",
 "serialize-to-javascript-impl",
]

[[package]]
name = "serialize-to-javascript-impl"
version = "0.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "772ee033c0916d670af7860b6e1ef7d658a4629a6d0b4c8c3e67f09b3765b75d"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "servo_arc"
version = "0.4.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "170fb83ab34de17dc69aa7c67482b22218ddb85da56546f9bd6b929e32a05930"
dependencies = [
 "stable_deref_trait",
]

[[package]]
name = "sha2"
version = "0.10.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a7507d819769d01a365ab707794a4084392c824f54a7a6a7862f8c3d0892b283"
dependencies = [
 "cfg-if",
 "cpufeatures",
 "digest",
]

[[package]]
name = "shlex"
version = "2.0.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f8fadd59c855ef2080decdef8ff161eb6661b86933c9d82e5ba29dc602a55aba"

[[package]]
name = "signal-hook-registry"
version = "1.4.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c4db69cba1110affc0e9f7bcd48bbf87b3f4fc7c61fc9155afd4c469eb3d6c1b"
dependencies = [
 "errno",
 "libc",
]

[[package]]
name = "simd-adler32"
version = "0.3.10"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3a219298ac11a56ea9a6d2120044824d6f01aeb034955e7af7bc16858527deea"

[[package]]
name = "siphasher"
version = "1.0.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "33f4fe9184a62d842c9ef383018f3306d8ba224fd9d836f56d7288308847c256"

[[package]]
name = "slab"
version = "0.4.12"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0c790de23124f9ab44544d7ac05d60440adc586479ce501c1d6d7da3cd8c9cf5"

[[package]]
name = "smallvec"
version = "1.16.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d0d5d4b1981b8bbbb7aed204cae5726d683d5d6ac7e74ec54122ea28f315e7c8"

[[package]]
name = "socket2"
version = "0.6.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c3d1e2c7f27f8d4cb10542a02c49005dbd6e93095799d6f3be745fae9f8fedd4"
dependencies = [
 "libc",
 "windows-sys 0.61.2",
]

[[package]]
name = "softbuffer"
version = "0.4.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "aac18da81ebbf05109ab275b157c22a653bb3c12cf884450179942f81bcbf6c3"
dependencies = [
 "bytemuck",
 "js-sys",
 "ndk",
 "objc2",
 "objc2-core-foundation",
 "objc2-core-graphics",
 "objc2-foundation",
 "objc2-quartz-core",
 "raw-window-handle",
 "redox_syscall",
 "tracing",
 "wasm-bindgen",
 "web-sys",
 "windows-sys 0.61.2",
]

[[package]]
name = "soup3"
version = "0.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "471f924a40f31251afc77450e781cb26d55c0b650842efafc9c6cbd2f7cc4f9f"
dependencies = [
 "futures-channel",
 "gio",
 "glib",
 "libc",
 "soup3-sys",
]

[[package]]
name = "soup3-sys"
version = "0.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7ebe8950a680a12f24f15ebe1bf70db7af98ad242d9db43596ad3108aab86c27"
dependencies = [
 "gio-sys",
 "glib-sys",
 "gobject-sys",
 "libc",
 "system-deps",
]

[[package]]
name = "sqlite-wasm-rs"
version = "0.6.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "36bd8e29bf08189a005b2df1df99823aa0861cabe9044e5f31ed54ca292ee618"
dependencies = [
 "cc",
 "rsqlite-vfs",
]

[[package]]
name = "stable_deref_trait"
version = "1.2.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6ce2be8dc25455e1f91df71bfa12ad37d7af1092ae736f3a6cd0e37bc7810596"

[[package]]
name = "static_vcruntime"
version = "3.0.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ff7589a1859b09232522bb9edf076ca7fcf14ded96685d3fa629db73023ffbb7"

[[package]]
name = "string_cache"
version = "0.9.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a18596f8c785a729f2819c0f6a7eae6ebeebdfffbfe4214ae6b087f690e31901"
dependencies = [
 "new_debug_unreachable",
 "parking_lot",
 "phf_shared",
 "precomputed-hash",
]

[[package]]
name = "string_cache_codegen"
version = "0.6.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "585635e46db231059f76c5849798146164652513eb9e8ab2685939dd90f29b69"
dependencies = [
 "phf_generator",
 "phf_shared",
 "proc-macro2",
 "quote",
]

[[package]]
name = "strsim"
version = "0.11.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7da8b5736845d9f2fcb837ea5d9e2628564b3b043a70948a3f0b778838c5fb4f"

[[package]]
name = "swift-rs"
version = "1.0.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cefd87076fd385308ee4aff597256c902f1fbb4d031de1558efc12f8ffefadd9"
dependencies = [
 "base64 0.21.7",
 "serde",
 "serde_json",
]

[[package]]
name = "syn"
version = "1.0.109"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "72b64191b275b66ffe2469e8af2c1cfe3bafa67b529ead792a6d0160888b4237"
dependencies = [
 "proc-macro2",
 "unicode-ident",
]

[[package]]
name = "syn"
version = "2.0.119"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "872831b642d1a07999a962a351ed35b955ea2cfc8f3862091e2a240a84f17297"
dependencies = [
 "proc-macro2",
 "quote",
 "unicode-ident",
]

[[package]]
name = "syn"
version = "3.0.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d78c8dee4c7bf0e14673097256fed6142ce9d3b85a408189d07482442145823b"
dependencies = [
 "proc-macro2",
 "quote",
 "unicode-ident",
]

[[package]]
name = "sync_wrapper"
version = "1.0.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0bf256ce5efdfa370213c1dabab5935a12e49f2c58d15e9eac2870d3b4f27263"
dependencies = [
 "futures-core",
]

[[package]]
name = "synstructure"
version = "0.14.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "901704edd0dfe137f1987838ee4f259e4e063c31371bdb423f7ae38ec6f77f02"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "system-deps"
version = "6.2.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a3e535eb8dded36d55ec13eddacd30dec501792ff23a0b1682c38601b8cf2349"
dependencies = [
 "cfg-expr",
 "heck 0.5.0",
 "pkg-config",
 "toml 0.8.2",
 "version-compare",
]

[[package]]
name = "tao"
version = "0.37.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d5777b06fe6435126ae8d816eba269e050e1e10d302cf5461e9c49eccabc3548"
dependencies = [
 "bitflags 2.13.2",
 "block2",
 "core-foundation",
 "core-graphics",
 "crossbeam-channel",
 "dbus",
 "dispatch2",
 "dlopen2",
 "dpi",
 "gdkwayland-sys",
 "gdkx11-sys",
 "gtk",
 "jni",
 "libc",
 "log",
 "ndk",
 "ndk-context",
 "ndk-sys",
 "objc2",
 "objc2-app-kit",
 "objc2-foundation",
 "objc2-ui-kit",
 "parking_lot",
 "percent-encoding",
 "raw-window-handle",
 "tao-macros",
 "unicode-segmentation",
 "url",
 "windows",
 "windows-core",
 "windows-version",
 "x11-dl",
]

[[package]]
name = "tao-macros"
version = "0.1.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5f7eeb6d99155545da6150a1795945f16ac9c178deb2a5f2e74d776107bd5849"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "target-lexicon"
version = "0.12.16"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "61c41af27dd6d1e27b1b16b489db798443478cef1f06a660c96db617ba5de3b1"

[[package]]
name = "tauri"
version = "2.12.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5fb0244332cfb9cee7e2a568bf5da29a36ed8fdbd717f6f47a66b6b7b358c072"
dependencies = [
 "anyhow",
 "bytes",
 "cookie",
 "dirs 7.0.0",
 "dunce",
 "embed_plist",
 "getrandom 0.3.4",
 "glob",
 "gtk",
 "heck 0.5.0",
 "http",
 "jni",
 "libc",
 "log",
 "mime",
 "muda",
 "objc2",
 "objc2-app-kit",
 "objc2-foundation",
 "objc2-ui-kit",
 "objc2-web-kit",
 "percent-encoding",
 "plist",
 "raw-window-handle",
 "reqwest",
 "serde",
 "serde_json",
 "serde_repr",
 "serialize-to-javascript",
 "swift-rs",
 "tauri-build",
 "tauri-macros",
 "tauri-runtime",
 "tauri-runtime-wry",
 "tauri-utils",
 "thiserror 2.0.21",
 "tokio",
 "tray-icon",
 "url",
 "webkit2gtk",
 "webview2-com",
 "window-vibrancy",
 "windows",
]

[[package]]
name = "tauri-build"
version = "2.7.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "adddb0e648752aaac5da9c3c3c6a68e1e87cab55e3b757b18a9441ef8c3ac614"
dependencies = [
 "anyhow",
 "cargo_toml",
 "dirs 7.0.0",
 "glob",
 "heck 0.5.0",
 "json-patch",
 "schemars 0.8.22",
 "semver",
 "serde",
 "serde_json",
 "static_vcruntime",
 "strsim",
 "tauri-utils",
 "tauri-winres",
 "walkdir",
]

[[package]]
name = "tauri-codegen"
version = "2.7.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fb37631cf71dab5e8ab55e1bdd701e18a52653d90b78e71d0e5598b1e0a61316"
dependencies = [
 "base64 0.23.1",
 "brotli",
 "ico",
 "json-patch",
 "plist",
 "png",
 "proc-macro2",
 "quote",
 "semver",
 "serde",
 "serde_json",
 "sha2",
 "syn 2.0.119",
 "tauri-utils",
 "thiserror 2.0.21",
 "time",
 "url",
 "uuid",
 "walkdir",
]

[[package]]
name = "tauri-macros"
version = "2.7.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0cc38db58854c10fb5f91a887ed8bf82d3239bb92b5d8db86eda09e96d9963d1"
dependencies = [
 "heck 0.5.0",
 "proc-macro2",
 "quote",
 "syn 2.0.119",
 "tauri-codegen",
 "tauri-utils",
]

[[package]]
name = "tauri-plugin"
version = "2.7.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "67fb21a77e8f94e8beb3325e583102488659365af0a3948b7ea244c5b779c291"
dependencies = [
 "anyhow",
 "glob",
 "plist",
 "schemars 0.8.22",
 "serde",
 "serde_json",
 "tauri-utils",
 "walkdir",
]

[[package]]
name = "tauri-plugin-autostart"
version = "2.5.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "459383cebc193cdd03d1ba4acc40f2c408a7abce419d64bdcd2d745bc2886f70"
dependencies = [
 "auto-launch",
 "serde",
 "serde_json",
 "tauri",
 "tauri-plugin",
 "thiserror 2.0.21",
]

[[package]]
name = "tauri-plugin-single-instance"
version = "2.5.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "726b6da0dd5bd1344f84f4108a622c07d01923baacb5c803a605189672c5352f"
dependencies = [
 "serde",
 "serde_json",
 "tauri",
 "thiserror 2.0.21",
 "tokio",
 "tracing",
 "windows-sys 0.61.2",
 "zbus",
]

[[package]]
name = "tauri-runtime"
version = "2.12.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7c55766d99cea69055904d1735b93c2049302b2e09effd462120deb5581d78e9"
dependencies = [
 "cookie",
 "dpi",
 "gtk",
 "http",
 "jni",
 "objc2",
 "objc2-ui-kit",
 "objc2-web-kit",
 "raw-window-handle",
 "serde",
 "serde_json",
 "tauri-utils",
 "thiserror 2.0.21",
 "url",
 "webkit2gtk",
 "webview2-com",
 "windows",
]

[[package]]
name = "tauri-runtime-wry"
version = "2.12.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e1aa9d8b7a120f879f44fdc1053f7b7dbf416bf0bbc6a72b714dec46b782b52f"
dependencies = [
 "gtk",
 "http",
 "jni",
 "log",
 "objc2",
 "objc2-app-kit",
 "percent-encoding",
 "raw-window-handle",
 "softbuffer",
 "tao",
 "tauri-runtime",
 "tauri-utils",
 "url",
 "webkit2gtk",
 "webview2-com",
 "windows",
 "wry",
]

[[package]]
name = "tauri-utils"
version = "2.10.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "362ab21cd4cc713f2a02b1a9b5688198b1541cfb6907c4281e9190e0f0ef4aa3"
dependencies = [
 "anyhow",
 "brotli",
 "cargo_metadata",
 "ctor",
 "dom_query",
 "dunce",
 "glob",
 "http",
 "infer",
 "json-patch",
 "log",
 "memchr",
 "phf",
 "plist",
 "proc-macro2",
 "quote",
 "regex",
 "schemars 0.8.22",
 "semver",
 "serde",
 "serde-untagged",
 "serde_json",
 "serde_with",
 "swift-rs",
 "thiserror 2.0.21",
 "toml 1.1.8+spec-1.1.0",
 "url",
 "urlpattern",
 "uuid",
 "walkdir",
]

[[package]]
name = "tauri-winres"
version = "0.3.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c52bb6904475a6ca662f15ef787f18ade61d5740a1ee12c45d3b748efdb6f796"
dependencies = [
 "dunce",
 "embed-resource",
 "toml 1.1.8+spec-1.1.0",
]

[[package]]
name = "tempfile"
version = "3.27.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "32497e9a4c7b38532efcdebeef879707aa9f794296a4f0244f6f69e9bc8574bd"
dependencies = [
 "fastrand",
 "getrandom 0.4.3",
 "once_cell",
 "rustix",
 "windows-sys 0.61.2",
]

[[package]]
name = "tendril"
version = "0.5.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5fed54709c5b3a53d09bb1c113ea4f5ceafd1e772ddcb0030a82e1d56c087b08"
dependencies = [
 "new_debug_unreachable",
]

[[package]]
name = "thiserror"
version = "1.0.69"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b6aaf5339b578ea85b50e080feb250a3e8ae8cfcdff9a461c9ec2904bc923f52"
dependencies = [
 "thiserror-impl 1.0.69",
]

[[package]]
name = "thiserror"
version = "2.0.21"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "09e52cb86a36cede5cb101bf8908837b3e4c6e5e59fe7fd85c23fb56200d189e"
dependencies = [
 "thiserror-impl 2.0.21",
]

[[package]]
name = "thiserror-impl"
version = "1.0.69"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4fee6c4efc90059e10f81e6d42c60a18f76588c3d74cb83a0b242a2b6c7504c1"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "thiserror-impl"
version = "2.0.21"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fe5197923287db20a58125f0bc85c062f7f2c892de97b18c356f9efb14b28524"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "time"
version = "0.3.55"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cdb87b95ec50ddfa440816d227a17b2ccbdda963a316a727fda0fc4334f7d134"
dependencies = [
 "deranged",
 "num-conv",
 "powerfmt",
 "serde_core",
 "time-core",
 "time-macros",
]

[[package]]
name = "time-core"
version = "0.1.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9e1c906769ad99c88eaa54e728060edef082f8e358ff32030cb7c7d315e81109"

[[package]]
name = "time-macros"
version = "0.2.32"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7e689342a48d2ea927c87ea50cabf8594854bf940e9310208848d680d668ed85"
dependencies = [
 "num-conv",
 "time-core",
]

[[package]]
name = "tiny_http"
version = "0.12.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "389915df6413a2e74fb181895f933386023c71110878cd0825588928e64cdc82"
dependencies = [
 "ascii",
 "chunked_transfer",
 "httpdate",
 "log",
]

[[package]]
name = "tinystr"
version = "0.8.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "abc840c238154d58f9e86b2792261edfde565a17696e1cda1a449de27979801a"
dependencies = [
 "displaydoc",
 "zerovec",
]

[[package]]
name = "tinyvec"
version = "1.13.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fd3ca314f692efd6c868f8408f53fe444634a845f96c028b97d35f6a1f79f0ee"

[[package]]
name = "tokio"
version = "1.54.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b52fd3255258d26fac7264ab5a76b53c13367136dc011d3d6ad4f8ed070396a3"
dependencies = [
 "bytes",
 "libc",
 "mio",
 "pin-project-lite",
 "socket2",
 "windows-sys 0.61.2",
]

[[package]]
name = "tokio-util"
version = "0.7.20"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e464cf451ba96ebfc6f9b6542f17ee8b8956e33f1e40d9690624e59d7a7f8a4b"
dependencies = [
 "bytes",
 "futures-core",
 "futures-sink",
 "pin-project-lite",
 "tokio",
]

[[package]]
name = "toml"
version = "0.8.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "185d8ab0dfbb35cf1399a6344d8484209c088f75f8f68230da55d48d95d43e3d"
dependencies = [
 "serde",
 "serde_spanned 0.6.9",
 "toml_datetime 0.6.3",
 "toml_edit 0.20.2",
]

[[package]]
name = "toml"
version = "1.1.8+spec-1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "20489e00e4d8741d6be680764cc12e270655e375a20d1011e844a9c3379e678d"
dependencies = [
 "indexmap 2.14.2",
 "serde_core",
 "serde_spanned 1.1.2",
 "toml_datetime 1.1.2+spec-1.1.0",
 "toml_parser",
 "toml_writer",
 "winnow 1.0.4",
]

[[package]]
name = "toml_datetime"
version = "0.6.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7cda73e2f1397b1262d6dfdcef8aafae14d1de7748d66822d3bfeeb6d03e5e4b"
dependencies = [
 "serde",
]

[[package]]
name = "toml_datetime"
version = "1.1.2+spec-1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2b86d767906c6c42421dcba507eb9d203e779497710a47782a224bb871653053"
dependencies = [
 "serde_core",
]

[[package]]
name = "toml_edit"
version = "0.19.15"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1b5bb770da30e5cbfde35a2d7b9b8a2c4b8ef89548a7a6aeab5c9a576e3e7421"
dependencies = [
 "indexmap 2.14.2",
 "toml_datetime 0.6.3",
 "winnow 0.5.40",
]

[[package]]
name = "toml_edit"
version = "0.20.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "396e4d48bbb2b7554c944bde63101b5ae446cff6ec4a24227428f15eb72ef338"
dependencies = [
 "indexmap 2.14.2",
 "serde",
 "serde_spanned 0.6.9",
 "toml_datetime 0.6.3",
 "winnow 0.5.40",
]

[[package]]
name = "toml_edit"
version = "0.25.17+spec-1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e3641d5bbb5349a79e1020a242d251efbc546ad8048d133958323ce9c40a9c9c"
dependencies = [
 "indexmap 2.14.2",
 "toml_datetime 1.1.2+spec-1.1.0",
 "toml_parser",
 "winnow 1.0.4",
]

[[package]]
name = "toml_parser"
version = "1.1.5+spec-1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "baa693a8032d7e1cada7d0041e96126df243179ff061456783ac7f12bda4744c"
dependencies = [
 "winnow 1.0.4",
]

[[package]]
name = "toml_writer"
version = "1.1.3+spec-1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "06bdbd8cfc056b8d2e2e85f29b56a3bdbecb527cef81eb39e3e7b98af4652770"

[[package]]
name = "tower"
version = "0.5.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ebe5ef63511595f1344e2d5cfa636d973292adc0eec1f0ad45fae9f0851ab1d4"
dependencies = [
 "futures-core",
 "futures-util",
 "pin-project-lite",
 "sync_wrapper",
 "tokio",
 "tower-layer",
 "tower-service",
]

[[package]]
name = "tower-http"
version = "0.6.11"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4cfcf7e2740e6fc6d4d688b4ef00650406bb94adf4731e43c096c3a19fe40840"
dependencies = [
 "bitflags 2.13.2",
 "bytes",
 "futures-util",
 "http",
 "http-body",
 "pin-project-lite",
 "tower",
 "tower-layer",
 "tower-service",
 "url",
]

[[package]]
name = "tower-layer"
version = "0.3.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "121c2a6cda46980bb0fcd1647ffaf6cd3fc79a013de288782836f6df9c48780e"

[[package]]
name = "tower-service"
version = "0.3.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8df9b6e13f2d32c91b9bd719c00d1958837bc7dec474d94952798cc8e69eeec3"

[[package]]
name = "tracing"
version = "0.1.44"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "63e71662fa4b2a2c3a26f570f037eb95bb1f85397f3cd8076caed2f026a6d100"
dependencies = [
 "pin-project-lite",
 "tracing-attributes",
 "tracing-core",
]

[[package]]
name = "tracing-attributes"
version = "0.1.31"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7490cfa5ec963746568740651ac6781f701c9c5ea257c58e057f3ba8cf69e8da"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "tracing-core"
version = "0.1.36"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "db97caf9d906fbde555dd62fa95ddba9eecfd14cb388e4f491a66d74cd5fb79a"
dependencies = [
 "once_cell",
]

[[package]]
name = "tray-icon"
version = "0.25.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b2b9c52859a94554803ccd4a24b98f74148ebc73b90676d783f3490b1bff9d72"
dependencies = [
 "crossbeam-channel",
 "dirs 7.0.0",
 "libappindicator",
 "muda",
 "objc2",
 "objc2-app-kit",
 "objc2-core-foundation",
 "objc2-core-graphics",
 "objc2-foundation",
 "once_cell",
 "png",
 "serde",
 "thiserror 2.0.21",
 "windows-sys 0.61.2",
]

[[package]]
name = "try-lock"
version = "0.2.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e421abadd41a4225275504ea4d6566923418b7f05506fbc9c0fe86ba7396114b"

[[package]]
name = "typeid"
version = "1.0.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bc7d623258602320d5c55d1bc22793b57daff0ec7efc270ea7d55ce1d5f5471c"

[[package]]
name = "typenum"
version = "1.20.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b6f5e870be6c3b371b77fe0ee0bafb859fa4964b4404c27de1d380043c4dda20"

[[package]]
name = "uds_windows"
version = "1.2.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f2f6fb2847f6742cd76af783a2a2c49e9375d0a111c7bef6f71cd9e738c72d6e"
dependencies = [
 "memoffset",
 "tempfile",
 "windows-sys 0.61.2",
]

[[package]]
name = "unicode-ident"
version = "1.0.27"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a2c754d6c33795a1c324727428e5a7dedb5b06195f9890bdbcba760d3e246563"

[[package]]
name = "unicode-segmentation"
version = "1.13.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c6f5d3c3b1bf09027a88a6bc961fc00497d651009560b5463668dc81b0fa87a8"

[[package]]
name = "url"
version = "2.5.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ff67a8a4397373c3ef660812acab3268222035010ab8680ec4215f38ba3d0eed"
dependencies = [
 "form_urlencoded",
 "idna",
 "percent-encoding",
 "serde",
 "serde_derive",
]

[[package]]
name = "urlpattern"
version = "0.6.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "df16f50ef4cc145211879a3867ba757076b25dfee812040dcb0658bd9ae7904b"
dependencies = [
 "icu_properties",
 "regex",
 "serde",
 "url",
]

[[package]]
name = "utf8_iter"
version = "1.0.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b6c140620e7ffbb22c2dee59cafe6084a59b5ffc27a8859a5f0d494b5d52b6be"

[[package]]
name = "uuid"
version = "1.29.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4a0e2d11620c50695fe12bbbfde96b3477fe606e7284c22d505c12ce51214514"
dependencies = [
 "getrandom 0.4.3",
 "js-sys",
 "serde_core",
 "wasm-bindgen",
]

[[package]]
name = "vcpkg"
version = "0.2.15"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "accd4ea62f7bb7a82fe23066fb0957d48ef677f6eeb8215f372f52e48bb32426"

[[package]]
name = "version-compare"
version = "0.2.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "03c2856837ef78f57382f06b2b8563a2f512f7185d732608fd9176cb3b8edf0e"

[[package]]
name = "version_check"
version = "0.9.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0b928f33d975fc6ad9f86c8f283853ad26bdd5b10b7f1542aa2fa15e2289105a"

[[package]]
name = "vswhom"
version = "0.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "be979b7f07507105799e854203b470ff7c78a1639e330a58f183b5fea574608b"
dependencies = [
 "libc",
 "vswhom-sys",
]

[[package]]
name = "vswhom-sys"
version = "0.1.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fb067e4cbd1ff067d1df46c9194b5de0e98efd2810bbc95c5d5e5f25a3231150"
dependencies = [
 "cc",
 "libc",
]

[[package]]
name = "walkdir"
version = "2.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "29790946404f91d9c5d06f9874efddea1dc06c5efe94541a7d6863108e3a5e4b"
dependencies = [
 "same-file",
 "winapi-util",
]

[[package]]
name = "want"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ec4cdd0dd910afe868b7ef477227d8d538b46b3075031afee8a9f2acb0a2ed0b"
dependencies = [
 "try-lock",
]

[[package]]
name = "wasi"
version = "0.11.1+wasi-snapshot-preview1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ccf3ec651a847eb01de73ccad15eb7d99f80485de043efb2f370cd654f4ea44b"

[[package]]
name = "wasip2"
version = "1.0.4+wasi-0.2.12"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b67efb37e106e55ce722a510d6b5f9c17f083e5fc79afc2badeb12cc313d9487"
dependencies = [
 "wit-bindgen",
]

[[package]]
name = "wasm-bindgen"
version = "0.2.129"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9bb54f33acc68fd454578d9820b0bde1a1a3d17aa17bb7b6595806d02886d409"
dependencies = [
 "cfg-if",
 "once_cell",
 "rustversion",
 "wasm-bindgen-macro",
 "wasm-bindgen-shared",
]

[[package]]
name = "wasm-bindgen-futures"
version = "0.4.79"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3cbab34de2d982e9b48e18d216d04c4a6f641066ff19ffb699980f591ee3610e"
dependencies = [
 "js-sys",
 "tokio",
 "wasm-bindgen",
]

[[package]]
name = "wasm-bindgen-macro"
version = "0.2.129"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2e29d0c35b16e224a7eeb5cd2d25e3e1968fbd65604117b44d3b789d00ee8535"
dependencies = [
 "quote",
 "wasm-bindgen-macro-support",
]

[[package]]
name = "wasm-bindgen-macro-support"
version = "0.2.129"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6f501a8bc3719dba86ef8ae4728879c08001bea749eb1333ac5b91e040e2a6b7"
dependencies = [
 "bumpalo",
 "proc-macro2",
 "quote",
 "syn 3.0.9",
 "wasm-bindgen-shared",
]

[[package]]
name = "wasm-bindgen-shared"
version = "0.2.129"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "23f0c9c52aa7cd7d77769a4cfe2a9adb1b331f489a41d912ce14513d5ab995c6"
dependencies = [
 "unicode-ident",
]

[[package]]
name = "wasm-streams"
version = "0.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9d1ec4f6517c9e11ae630e200b2b65d193279042e28edd4a2cda233e46670bbb"
dependencies = [
 "futures-util",
 "js-sys",
 "wasm-bindgen",
 "wasm-bindgen-futures",
 "web-sys",
]

[[package]]
name = "web-sys"
version = "0.3.106"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "88261b9deccee56594c11a3460c462c41f58d148598fe70ad77070126a68aba4"
dependencies = [
 "js-sys",
 "wasm-bindgen",
]

[[package]]
name = "web-time"
version = "1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5a6580f308b1fad9207618087a65c04e7a10bc77e02c8e84e9b00dd4b12fa0bb"
dependencies = [
 "js-sys",
 "wasm-bindgen",
]

[[package]]
name = "web_atoms"
version = "0.2.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ba8b815c1b593dc0baf78dd0f4fc8fdb2de53198fb1163738093e9a311c33fb3"
dependencies = [
 "phf",
 "phf_codegen",
 "string_cache",
 "string_cache_codegen",
]

[[package]]
name = "webkit2gtk"
version = "2.0.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a1027150013530fb2eaf806408df88461ae4815a45c541c8975e61d6f2fc4793"
dependencies = [
 "bitflags 1.3.2",
 "cairo-rs",
 "gdk",
 "gdk-sys",
 "gio",
 "gio-sys",
 "glib",
 "glib-sys",
 "gobject-sys",
 "gtk",
 "gtk-sys",
 "javascriptcore-rs",
 "libc",
 "once_cell",
 "soup3",
 "webkit2gtk-sys",
]

[[package]]
name = "webkit2gtk-sys"
version = "2.0.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "916a5f65c2ef0dfe12fff695960a2ec3d4565359fdbb2e9943c974e06c734ea5"
dependencies = [
 "bitflags 1.3.2",
 "cairo-sys-rs",
 "gdk-sys",
 "gio-sys",
 "glib-sys",
 "gobject-sys",
 "gtk-sys",
 "javascriptcore-rs-sys",
 "libc",
 "pkg-config",
 "soup3-sys",
 "system-deps",
]

[[package]]
name = "webview2-com"
version = "0.39.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3f89fca7a704cee10dcb3654c1dbb8941d1783132f1917358af75bec37a7d7e6"
dependencies = [
 "webview2-com-macros",
 "webview2-com-sys",
 "windows",
 "windows-core",
]

[[package]]
name = "webview2-com-macros"
version = "0.8.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "67a921c1b6914c367b2b823cd4cde6f96beec77d30a939c8199bb377cf9b9b54"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "webview2-com-sys"
version = "0.39.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b3a07132775117d6065853d9d1178157b8c90e228de47129d6bce2c7edebedfb"
dependencies = [
 "thiserror 2.0.21",
 "windows",
 "windows-core",
]

[[package]]
name = "winapi"
version = "0.3.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5c839a674fcd7a98952e593242ea400abe93992746761e38641405d28b00f419"
dependencies = [
 "winapi-i686-pc-windows-gnu",
 "winapi-x86_64-pc-windows-gnu",
]

[[package]]
name = "winapi-i686-pc-windows-gnu"
version = "0.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ac3b87c63620426dd9b991e5ce0329eff545bccbbb34f3be09ff6fb6ab51b7b6"

[[package]]
name = "winapi-util"
version = "0.1.11"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c2a7b1c03c876122aa43f3020e6c3c3ee5c05081c9a00739faf7503aeba10d22"
dependencies = [
 "windows-sys 0.61.2",
]

[[package]]
name = "winapi-x86_64-pc-windows-gnu"
version = "0.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "712e227841d057c1ee1cd2fb22fa7e5a5461ae8e48fa2ca79ec42cfc1931183f"

[[package]]
name = "window-vibrancy"
version = "0.8.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "111e51caca442cafd9bab396628ac4d814880eaea4e63dfd76a12e9f342b5580"
dependencies = [
 "objc2",
 "objc2-app-kit",
 "objc2-core-foundation",
 "objc2-foundation",
 "objc2-quartz-core",
 "raw-window-handle",
 "windows-sys 0.61.2",
 "windows-version",
]

[[package]]
name = "windows"
version = "0.62.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "527fadee13e0c05939a6a05d5bd6eec6cd2e3dbd648b9f8e447c6518133d8580"
dependencies = [
 "windows-collections",
 "windows-core",
 "windows-future",
 "windows-numerics",
]

[[package]]
name = "windows-collections"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "23b2d95af1a8a14a3c7367e1ed4fc9c20e0a26e79551b1454d72583c97cc6610"
dependencies = [
 "windows-core",
]

[[package]]
name = "windows-core"
version = "0.62.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b8e83a14d34d0623b51dce9581199302a221863196a1dde71a7663a4c2be9deb"
dependencies = [
 "windows-implement",
 "windows-interface",
 "windows-link",
 "windows-result",
 "windows-strings",
]

[[package]]
name = "windows-future"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e1d6f90251fe18a279739e78025bd6ddc52a7e22f921070ccdc67dde84c605cb"
dependencies = [
 "windows-core",
 "windows-link",
 "windows-threading",
]

[[package]]
name = "windows-implement"
version = "0.60.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "053e2e040ab57b9dc951b72c264860db7eb3b0200ba345b4e4c3b14f67855ddf"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "windows-interface"
version = "0.59.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3f316c4a2570ba26bbec722032c4099d8c8bc095efccdc15688708623367e358"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "windows-link"
version = "0.2.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f0805222e57f7521d6a62e36fa9163bc891acd422f971defe97d64e70d0a4fe5"

[[package]]
name = "windows-numerics"
version = "0.3.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6e2e40844ac143cdb44aead537bbf727de9b044e107a0f1220392177d15b0f26"
dependencies = [
 "windows-core",
 "windows-link",
]

[[package]]
name = "windows-result"
version = "0.4.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7781fa89eaf60850ac3d2da7af8e5242a5ea78d1a11c49bf2910bb5a73853eb5"
dependencies = [
 "windows-link",
]

[[package]]
name = "windows-strings"
version = "0.5.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7837d08f69c77cf6b07689544538e017c1bfcf57e34b4c0ff58e6c2cd3b37091"
dependencies = [
 "windows-link",
]

[[package]]
name = "windows-sys"
version = "0.45.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "75283be5efb2831d37ea142365f009c02ec203cd29a3ebecbc093d52315b66d0"
dependencies = [
 "windows-targets",
]

[[package]]
name = "windows-sys"
version = "0.61.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ae137229bcbd6cdf0f7b80a31df61766145077ddf49416a728b02cb3921ff3fc"
dependencies = [
 "windows-link",
]

[[package]]
name = "windows-targets"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8e5180c00cd44c9b1c88adb3693291f1cd93605ded80c250a75d472756b4d071"
dependencies = [
 "windows_aarch64_gnullvm",
 "windows_aarch64_msvc",
 "windows_i686_gnu",
 "windows_i686_msvc",
 "windows_x86_64_gnu",
 "windows_x86_64_gnullvm",
 "windows_x86_64_msvc",
]

[[package]]
name = "windows-threading"
version = "0.2.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3949bd5b99cafdf1c7ca86b43ca564028dfe27d66958f2470940f73d86d75b37"
dependencies = [
 "windows-link",
]

[[package]]
name = "windows-version"
version = "0.1.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e4060a1da109b9d0326b7262c8e12c84df67cc0dbc9e33cf49e01ccc2eb63631"
dependencies = [
 "windows-link",
]

[[package]]
name = "windows_aarch64_gnullvm"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "597a5118570b68bc08d8d59125332c54f1ba9d9adeedeef5b99b02ba2b0698f8"

[[package]]
name = "windows_aarch64_msvc"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e08e8864a60f06ef0d0ff4ba04124db8b0fb3be5776a5cd47641e942e58c4d43"

[[package]]
name = "windows_i686_gnu"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c61d927d8da41da96a81f029489353e68739737d3beca43145c8afec9a31a84f"

[[package]]
name = "windows_i686_msvc"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "44d840b6ec649f480a41c8d80f9c65108b92d89345dd94027bfe06ac444d1060"

[[package]]
name = "windows_x86_64_gnu"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8de912b8b8feb55c064867cf047dda097f92d51efad5b491dfb98f6bbb70cb36"

[[package]]
name = "windows_x86_64_gnullvm"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "26d41b46a36d453748aedef1486d5c7a85db22e56aff34643984ea85514e94a3"

[[package]]
name = "windows_x86_64_msvc"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9aec5da331524158c6d1a4ac0ab1541149c0b9505fde06423b02f5ef0106b9f0"

[[package]]
name = "winnow"
version = "0.5.40"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f593a95398737aeed53e489c785df13f3618e41dbcd6718c6addbf1395aa6876"
dependencies = [
 "memchr",
]

[[package]]
name = "winnow"
version = "1.0.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "23b97319f7b8343df12cc98938e5c3eb436064524c8d2b4e30a1d3a36eecdf81"
dependencies = [
 "memchr",
]

[[package]]
name = "winreg"
version = "0.10.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "80d0f4e272c85def139476380b12f9ac60926689dd2e01d4923222f40580869d"
dependencies = [
 "winapi",
]

[[package]]
name = "winreg"
version = "0.56.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7d6f32a0ff4a9f6f01231eb2059cc85479330739333e0e58cadf03b6af2cca10"
dependencies = [
 "cfg-if",
 "windows-sys 0.61.2",
]

[[package]]
name = "wit-bindgen"
version = "0.57.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1ebf944e87a7c253233ad6766e082e3cd714b5d03812acc24c318f549614536e"

[[package]]
name = "workmemo"
version = "0.2.11"
dependencies = [
 "image",
 "rusqlite",
 "serde",
 "serde_json",
 "tauri",
 "tauri-build",
 "tauri-plugin-autostart",
 "tauri-plugin-single-instance",
 "tiny_http",
 "url",
 "windows-sys 0.61.2",
]

[[package]]
name = "writeable"
version = "0.6.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3ad82d2a33cdc9674dc7465672f271e096168fcdbe0f799d9e6db8c5892679dc"

[[package]]
name = "wry"
version = "0.57.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "759c50ddad0ef9913bb5496cb9d509a50433a3b78cb0238d61105526589cf0e9"
dependencies = [
 "base64 0.23.1",
 "block2",
 "cookie",
 "crossbeam-channel",
 "dirs 7.0.0",
 "dom_query",
 "dpi",
 "dunce",
 "gdkx11",
 "gtk",
 "http",
 "javascriptcore-rs",
 "jni",
 "libc",
 "ndk",
 "objc2",
 "objc2-app-kit",
 "objc2-core-foundation",
 "objc2-foundation",
 "objc2-ui-kit",
 "objc2-web-kit",
 "percent-encoding",
 "raw-window-handle",
 "sha2",
 "soup3",
 "tao-macros",
 "thiserror 2.0.21",
 "url",
 "webkit2gtk",
 "webkit2gtk-sys",
 "webview2-com",
 "windows",
 "windows-core",
 "windows-version",
 "x11-dl",
]

[[package]]
name = "x11"
version = "2.21.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "502da5464ccd04011667b11c435cb992822c2c0dbde1770c988480d312a0db2e"
dependencies = [
 "libc",
 "pkg-config",
]

[[package]]
name = "x11-dl"
version = "2.21.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "38735924fedd5314a6e548792904ed8c6de6636285cb9fec04d5b1db85c1516f"
dependencies = [
 "libc",
 "once_cell",
 "pkg-config",
]

[[package]]
name = "yoke"
version = "0.8.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "417ef3fcf6c300b7dbd25c85531a746931c02ad536f3cf4786ed1e88223340b3"
dependencies = [
 "stable_deref_trait",
 "yoke-derive",
 "zerofrom",
]

[[package]]
name = "yoke-derive"
version = "0.8.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ec8ebde2db3681e8c9980cc27822030e68752690ddfa9473e739aeb4dbde6d71"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
 "synstructure",
]

[[package]]
name = "zbus"
version = "5.19.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5db4be7c075cb421e4b7ee645541604239bd243ba7c357511f4ff3a74b555907"
dependencies = [
 "async-broadcast",
 "async-executor",
 "async-io",
 "async-lock",
 "async-process",
 "async-recursion",
 "async-task",
 "async-trait",
 "blocking",
 "enumflags2",
 "event-listener",
 "futures-core",
 "futures-lite",
 "hex",
 "libc",
 "ordered-stream",
 "rustix",
 "serde",
 "serde_repr",
 "tracing",
 "uds_windows",
 "uuid",
 "windows-sys 0.61.2",
 "winnow 1.0.4",
 "zbus_macros",
 "zbus_names",
 "zvariant",
]

[[package]]
name = "zbus_macros"
version = "5.19.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2990635d09ade6df1868f72f8cac69a876a90981e8bd3c40b1be413f8dc88f40"
dependencies = [
 "proc-macro-crate 3.5.0",
 "proc-macro2",
 "quote",
 "syn 3.0.9",
 "zbus_names",
 "zvariant",
 "zvariant_utils",
]

[[package]]
name = "zbus_names"
version = "4.3.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "812a12be4ead7a59e18ea8f047d08add0066b73bc62fc1467066a2472ae088dd"
dependencies = [
 "serde",
 "winnow 1.0.4",
 "zvariant",
]

[[package]]
name = "zcheapstr"
version = "1.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "939f186d9ecebe044315a5cb6d6f78568bbc21152adc954d5a0c2f58bdbc9920"
dependencies = [
 "serde",
]

[[package]]
name = "zerofrom"
version = "0.1.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0ec05a11813ea801ff6d75110ad09cd0824ddba17dfe17128ea0d5f68e6c5272"
dependencies = [
 "zerofrom-derive",
]

[[package]]
name = "zerofrom-derive"
version = "0.1.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f75b4683f6c7f45248d4d64056a24298c6281e0993356d7d1b4a1a962ef10d4a"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
 "synstructure",
]

[[package]]
name = "zerotrie"
version = "0.2.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4ea269c3bd32f0a32c321907a2ae912ba6f4649bb0fc764a15627e99a7095a3f"
dependencies = [
 "displaydoc",
 "yoke",
 "zerofrom",
]

[[package]]
name = "zerovec"
version = "0.11.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f58a2799cfe9a1670c7ea8edbd52ef8edb93cb37a7f83bf31ba9e35d9dae6a40"
dependencies = [
 "yoke",
 "zerofrom",
 "zerovec-derive",
]

[[package]]
name = "zerovec-derive"
version = "0.11.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c3743ddbf47738d929cd1ae2e199d40d0162979dfe31aef8ae646d2bf00bf97a"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "zlib-rs"
version = "0.6.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b268e58e7c693d7c271f93ffc4ba3b380412554231c85bf61ca7af91042a4112"

[[package]]
name = "zmij"
version = "1.0.23"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "29666d0abbfad1e3dc4dcf6144730dd3a3ab225bbbdac83319345b1b44ccfc1b"

[[package]]
name = "zune-core"
version = "0.5.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d56377fd46368984a170bc5aac5567e52ca5da874caa60bea39fcbca78fb658b"

[[package]]
name = "zune-jpeg"
version = "0.5.15"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "27bc9d5b815bc103f142aa054f561d9187d191692ec7c2d1e2b4737f8dbd7296"
dependencies = [
 "zune-core",
]

[[package]]
name = "zvariant"
version = "5.15.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "80bf6d6cd6a4b601acb64cfb8284cdc643fcfa75ef26ae3c46ec8aa4e8a1fbb7"
dependencies = [
 "endi",
 "enumflags2",
 "serde",
 "winnow 1.0.4",
 "zcheapstr",
 "zvariant_derive",
 "zvariant_utils",
]

[[package]]
name = "zvariant_derive"
version = "5.15.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ef2672456ba1cb54b5eaec136e63135b3c7495fb938e53b28a62e633496d486d"
dependencies = [
 "proc-macro-crate 3.5.0",
 "proc-macro2",
 "quote",
 "syn 3.0.9",
 "zvariant_utils",
]

[[package]]
name = "zvariant_utils"
version = "4.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bad0294361a320b694a328460dc73add56c306150f5cb6bfafc44446120008a3"
dependencies = [
 "proc-macro2",
 "quote",
 "serde",
 "syn 3.0.9",
 "winnow 1.0.4",
]
```

## E:\WorkMemo\src-tauri\tauri.conf.json

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "WorkMemo",
  "version": "0.2.11",
  "identifier": "com.workmemo.desktop",
  "build": {
    "beforeDevCommand": "npm run bridge:dev && npm run dev",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "npm run build",
    "beforeBundleCommand": "node scripts/stage-browser-resources.mjs",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "label": "main",
        "visible": false,
        "title": "WorkMemo",
        "width": 780,
        "height": 560,
        "minWidth": 360,
        "minHeight": 280,
        "center": true,
        "backgroundColor": "#00000000",
        "transparent": true,
        "decorations": false,
        "shadow": false,
        "noRedirectionBitmap": true,
        "resizable": true,
        "maximizable": false,
        "alwaysOnTop": false,
        "skipTaskbar": false
      }
    ],
    "security": {
      "csp": "default-src 'self'; connect-src ipc: http://ipc.localhost http://localhost:1420 ws://localhost:1420; img-src 'self' data: http://background.localhost background:; style-src 'self' 'unsafe-inline'"
    }
  },
  "bundle": {
    "active": true,
    "targets": ["nsis"],
    "publisher": "noharass",
    "shortDescription": "本地工作记录与有效时长工具",
    "category": "Productivity",
    "resources": {
      "../docs/THIRD-PARTY-LICENSES.txt": "THIRD-PARTY-LICENSES.txt",
      "target/browser-resources/": ""
    },
    "windows": {
      "webviewInstallMode": {
        "type": "downloadBootstrapper",
        "silent": true
      },
      "nsis": {
        "installMode": "currentUser",
        "languages": ["SimpChinese", "English"],
        "displayLanguageSelector": false,
        "installerHooks": "installer/browser-bridge.nsh",
        "installerIcon": "icons/icon.ico",
        "uninstallerIcon": "icons/icon.ico"
      }
    },
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

## E:\WorkMemo\browser-extension\manifest.json

```json
{
  "manifest_version": 3,
  "name": "WorkMemo 本地工作监测",
  "version": "0.2.11",
  "version_name": "0.2.11",
  "description": "授权后将去除参数的网页地址和匹配状态传给本机 WorkMemo；不读取网页内容或输入文本。",
  "minimum_chrome_version": "120",
  "permissions": [
    "nativeMessaging",
    "alarms",
    "scripting"
  ],
  "optional_permissions": ["tabs"],
  "optional_host_permissions": [
    "http://*/*",
    "https://*/*"
  ],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "action": {
    "default_popup": "popup.html",
    "default_title": "WorkMemo 工作监测"
  },
  "key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtGKBoVQeI/+nL0Zq//7RFyrT35o4sVV2QMJ7kfe8vhaz471T5FxJLX1gu4WTArqWf0e+WwSHlxIiI/PfefgiWdXB/HpuamuopdfFFYuJ57D/GgzPiQvSiyifGGNtH3Tz7fDvQDVSmzhbS6/0KwHe/csgYyzrKa7OyW1R6x9+EirVYhJM1XLJ0Rvu+Y/1l6p0BApkVteGRfn7BGLK4qsUlRoow7pyG1DSlFapBUS/e9oT+ozUT2OX2fLkqtPg9M9scthII08XUATKeD3jtyUqqU0v2Pc9V4KF36J1Jnpt50PEpey/KK/TGLN9T21F8jRxHuDFFQs1mZDDvVVRWjUXCwIDAQAB"
}
```

## E:\WorkMemo\README.md

````markdown
<p align="center">
  <img src="public/workmemo.png" width="88" height="88" alt="WorkMemo 图标" />
</p>

<h1 align="center">WorkMemo</h1>

<p align="center"><strong>让忙过的一天，有迹可循。</strong></p>
<p align="center">一个安静待在桌面上的工作记录小工具。记下做了什么、花了多久，工作量可以忙完再补。</p>

<p align="center">
  <a href="https://github.com/noharass/WorkMemo/releases/download/v0.2.11/WorkMemo_0.2.11_x64-setup.exe"><strong>下载 Windows 安装版</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/noharass/WorkMemo/releases/download/v0.2.11/WorkMemo_0.2.11_windows_x64.zip">下载免安装 ZIP</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/noharass/WorkMemo/releases/tag/v0.2.11">v0.2.11 更新说明</a>
</p>
<p align="center">Windows 10 / 11 · x64 · 无需注册账号 · 记录保存在本机</p>

---

## 把注意力留给手上的事

有时候，一天下来做了不少事，回头却想不起时间都花在哪里。WorkMemo 想帮你留下一份简单的记录：什么时候开始，真正工作了多久，最后完成了多少。

- **顺手记一段工作**：选好类别就能开始，暂停不计时；数量和备注可以结束后再补。评测、质检、开发、文档都能分开看。
- **让工作页面帮你开表**：配置 Chrome 工作站点并授权后，检测到工作页面和新操作后，先问一句要不要开工。只想看看时选「仅浏览」，等你主动开始。检测和暂停阈值都能自己调整。
- **桌面上少一点打扰**：主窗口关闭后继续在后台运行，状态岛方便看一眼当前计时。Glass、Cream、Dark、Neon 四种皮肤，搭配自己的背景图；想少占些地方，就切到紧凑模式。
- **回头看，也找得到**：在 Chrome 数据中心看趋势、日历与每段工作的明细，补填数量和备注；需要换电脑或整理数据时，可以完整备份。

<p align="center"><img src="docs/assets/themes.svg" alt="Glass、Cream、Dark、Neon 四种皮肤配色" width="1000" /></p>
<p align="center"><sub>四种配色，选一个看着舒服的。</sub></p>

## 第一次用

1. 下载上面的安装版，或把 ZIP **完整解压**后运行 `WorkMemo/workmemo.exe`。不要只拿出主程序。
2. 想先试试，点击「新建任务」，选择类别后点击「开始工作」；结束后到「待补全」填写工作量，填 `0` 也可以。
3. 想用自动记录，打开「监测设置」，按[使用说明](docs/USER-GUIDE.md#使用-chrome-自动记录)装好配套扩展、添加工作网址并同步授权。

自动记录需要 Chrome 配套扩展；手动计时不需要。软件使用 Microsoft WebView2，安装版会在缺少时引导安装。

## 这次更新：网页报表与可访问性修正

**v0.2.11** 让未结束筛选正确包含计时、暂停和挂起任务；短工时保留精度，跨年趋势保留年份。连接繁忙、授权失效和超时有不同提示，刷新和保存失败时继续保护输入。

表单校验会定位到错误字段，修正后清除对应错误；后台轮询减少重复播报。趋势和工作日历可展开为数据表，键盘操作和多层弹窗焦点更完整，文字及高对比度模式更清晰。自定义趋势补齐空白周期，长范围自动聚合；网页不再加载未使用的桌面代码和样式。

数据库仍为 schema 12，从 v0.2.10 更新无需新增迁移；更旧版本升级前请备份。Windows x64 成品未签名，需 WebView2。真实 Narrator、系统 DPI、实际扩展联动和安装卸载未全部复验，详情见发布记录。

[查看 v0.2.11 下载与更新说明](https://github.com/noharass/WorkMemo/releases/tag/v0.2.11) · [构建校验与验收限制](docs/RELEASE-0.2.11.md)

历史版本和开发阶段记录继续保留在 docs 与 Releases 中。

## 从旧版本过来

更新前请先备份数据、从托盘退出旧版；更新后在 Chrome 扩展页重新加载配套扩展。**正式版与预览版的数据各自独立**：

- 从正式版更新：安装新版，沿用原有正式记录。
- 从预览版迁移：先退出预览版，再到新版「设置 → 数据管理」查看来源和数量，确认后合并；重复导入会跳过，有变化的记录会提示冲突。
- 想回退旧版：保留旧安装包和升级前的记录、设置备份；旧版可能无法读取新的音效、透明度设置或数据库格式。

具体步骤与数据位置见[使用说明](docs/USER-GUIDE.md#升级迁移与回退)。历史预览版仍保留在 [Releases](https://github.com/noharass/WorkMemo/releases)。

## 你的记录，留在你的电脑里

WorkMemo 不需要云账号。工作记录、监测设置、背景图片和备份都保存在本机。数据中心也由本机软件提供，使用期间请保持 WorkMemo 在后台运行。Chrome 扩展只在你授权的工作站点观察页面是否匹配、是否发生操作，不读取输入内容、具体按键或网页正文。

自动记录依赖页面连接和输入活动；阅读、思考时可能少计。遇到连接中断，会暂停无法确认的时间。检测间隔是目标频率，浏览器休眠或系统繁忙时可能延迟。

## 有哪里不顺手，告诉我

欢迎[提一个 Issue](https://github.com/noharass/WorkMemo/issues/new)。描述一下当时做了什么、希望它怎样工作，再附上软件版本和错误提示就好。请不要上传真实工作数据库或私人备注。

[使用说明](docs/USER-GUIDE.md) · [下载与更新](https://github.com/noharass/WorkMemo/releases/latest) · [反馈问题](https://github.com/noharass/WorkMemo/issues)
````

## E:\WorkMemo\docs\USER-GUIDE.md

````markdown
# WorkMemo v0.2.11 使用说明

v0.2.11 修正网页报表的未结束状态、短工时精度、跨年标签和连接恢复；补齐字段错误定位、键盘焦点、趋势/日历数据表及自定义趋势的空白周期。网页加载也避开了未使用的桌面代码。数据库仍为 schema 12，从 v0.2.10 更新无需新增迁移。

v0.2.10 包含北京时间零点结束跨日暂停任务及网页直接补记录功能，数据库升级至 schema 12。升级前请先备份；升级后旧版不能直接读取新数据库。历史 v0.2.9 的功能与发布说明保留在下文。

v0.2.9 基于 0.2.8 的页面任务与多任务功能，包含灵动岛默认收起和新建／绑定入口修复，使用 schema 10；原始 0.2.7 为 schema 9。

WorkMemo 是 Windows 本地工作记录工具。可以手动计时，也可以配合 Chrome，识别工作页面并确认开工后记录。数量和备注可以忙完再补。

## 安装与启动

适用于 Windows 10 / 11 x64，需要 Microsoft Edge WebView2 Runtime。

- **安装版**：运行 `WorkMemo_0.2.11_x64-setup.exe`，按向导安装。缺少 WebView2 时需要联网安装 Microsoft 官方运行环境。
- **免安装版**：完整解压 `WorkMemo_0.2.11_windows_x64.zip`，打开 `WorkMemo/workmemo.exe`。主程序旁边的浏览器组件、`extension` 文件夹和修复脚本都请保留。缺少 WebView2 时，从 [Microsoft 官网](https://developer.microsoft.com/microsoft-edge/webview2/)安装。
- 不需要开发工具或数据库服务。免安装表示程序不用安装；记录仍存放在当前 Windows 用户的数据目录，不会随解压文件夹移动。
- 从 [WorkMemo v0.2.11 正式版](https://github.com/noharass/WorkMemo/releases/tag/v0.2.11)下载安装版或完整 ZIP。程序暂未签名，可用随附 `SHA256SUMS.txt` 核对下载文件。

## 手动记录一段工作

1. 点击「新建任务」，再选择工作类别（初始为评测、质检、开发、文档，可在设置改名），点击「开始工作」。工作量和备注可以先不填。
2. 需要停一下时点击暂停；继续会累计同一条记录，暂停期间不计时。
3. 结束计时后，结果先保存。可在状态岛下方直接填写工作量和备注，成功保存后自动收起；也可在 Chrome 数据中心的「待补全」选择记录填写。数量允许 `0`，表示本次没有产出。

同一时间只会有一个未结束任务。先暂停，再点双箭头「切换任务」进入独立新建页；可填写类别、工作量和备注，取消切换返回原暂停任务。点击「开始工作」时，会先提示结束并保存上一项，再开始新任务。手动任务进行中，自动页面识别不会替换它；手动计时仍有空闲保护。

## 使用 Chrome 自动记录

首次设置：

1. 打开 WorkMemo「监测设置」，点击「打开配套扩展文件夹」。
2. Chrome 打开 `chrome://extensions`，开启开发者模式，选择「加载已解压的扩展程序」，选中上一步的 **extension 文件夹**。
3. 回到 WorkMemo，在监测设置里启用自动识别，添加工作网址和类别，然后保存。
4. 打开 Chrome 的 WorkMemo 扩展，点击同步工作站点授权，并确认需要记录的站点。
5. 保持工作页面在 Chrome 前台，进行一次新的鼠标或键盘操作。软件确认页面与输入后显示「准备开始工作？」；点击「开始记录」才从此刻计时，不补算等待时间。只是打开页面不会开始。

扩展标识固定为 `oljcealhccdhaddceacnokihjefloaih`。更新软件后，也请在 Chrome 中重新加载配套扩展；如果换了解压目录，重新加载新目录的扩展。

站点授权仅针对你配置的工作网页。扩展只发送匹配状态及是否发生可信操作的信号，不发送网页正文、输入文字、具体按键或鼠标轨迹。

### 只想浏览一下

点击主窗口顶部眼睛图标旁的「仅浏览」，或在状态岛开工提示中选择「仅浏览」，就不会新建任务或自动恢复暂停的任务。此选择会保存，重启后仍然有效，不会隔一会儿再问一次。

回到匹配的工作页面并产生操作后，状态岛会显示就绪入口，主窗口顶部「仅浏览」也可以切回记录。点击开始入口开工；已有暂停任务时显示「继续记录」，继续原任务。隐藏状态岛时，主窗口中也有入口。监测未启用时仍可手动选择类别开始。

正在计时时进入「仅浏览」会立即暂停并保留任务，不结束、不删除。离开工作页后显示「仅浏览」，再次工作由你主动开始或继续。重启后待恢复的任务仍需先处理。

### 自动记录的日常规则

- 检测间隔可选 **1–5 秒**，默认 1 秒。浏览器休眠或系统繁忙时可能延迟。
- 默认连续离开工作页 2 分钟后暂停，再保留 10 分钟；期间回到工作页面并产生新操作，可以继续同一条记录。
- 默认键鼠无操作 2 分钟自动暂停，扣除最后输入后的空闲尾段；5 分钟提醒，7 分钟结束。纯手动任务空闲暂停后有新键鼠操作即恢复原任务；自动任务须回到可信匹配工作页并产生新操作才恢复。阅读、思考时可能少计。
- 非「仅浏览」状态下，默认手动暂停后，回到工作页并产生新操作可自动恢复；在设置中关闭此选项后，只能手动继续。
- 自动任务手动继续后仍由自动规则管理。保存监测设置会暂停当前自动任务，需要重新确认页面并有新操作后恢复。
- 浏览器连接中断或系统状态无法确认时，停止累计无法确认的时间。重启后的未结束任务会停在「待恢复」，请确认后继续，不补计软件关闭期间的时间。

这些时间可在监测设置中分别调整。空闲暂停及提醒时间均须早于空闲结束时间；不同结束条件中，先到期的条件生效。

### 连不上浏览器时

先看监测设置中的连接诊断，再点击「修复本机连接」；回到 Chrome 扩展刷新连接并同步站点授权。仍不行时，完整更新软件和扩展，确认没有只复制主 EXE。

也可双击程序目录的 `Register-Browser.cmd` 修复本机注册。安装版、ZIP 都会在启动时检查本机连接。不要同时运行正式版和预览版计时。

## 窗口、外观与保存

舒展模式默认宽约 780px，紧凑模式约 420px；主窗口高度随新建／工作中内容收紧，屏幕较小时保留内容滚动。设置使用独立原生窗口；历史和待补全在 Chrome 中打开。

- 拖动标题栏移动窗口，拖动边缘调整大小。两种模式分别记住主窗口布局；正文内容变化时只拟合高度，宽度保持；设置内可以恢复默认布局。
- 设置窗口只在标题栏右上角保留关闭叉号，正文独立滚动，底部保存操作保持可见。
- 有未保存修改时，关闭或切换栏目会提示「保存、放弃、继续编辑」。`Ctrl+S` 保存当前表单；保存失败保留输入。
- 「外观」有 Glass、Cream、Dark、Neon 四种皮肤。可选择自己的 PNG、JPEG、WebP 背景，文件不超过 10 MiB、解码后不超过 1600 万像素。图片会复制保存，移动原图不影响使用。图片透明度独立调整，默认 25%；取消预览恢复已保存外观。
- 「工作名称与外观」可以修改四类名称、图标和颜色。名称去除首尾空白后须为 1～20 个字符，不能重名。保存名称后，新旧记录和网址分组统一显示新名，原有归属保持；名称与外观各自保存。
- 「布局」可选择舒展或紧凑、正文 12–18px、字重与行距，也可开关提示音、选择 FiftySounds／柔和／清脆套装并分别试听五种状态。保存后生效，原有静音选择保留；试听不受开关限制。紧凑模式说明和高级选项按需展开。
- **关闭主窗口只是隐藏到后台**。要完全关闭，从托盘选择「退出 WorkMemo」。

## Chrome 数据中心

点击底部「今日工作量」或「待补全」打开；状态岛结束提醒可直接在展开区域补填。优先使用已安装的 Chrome；未找到时可以复制本机地址或选择默认浏览器。

数据中心需要 WorkMemo 在后台运行。退出软件后连接断开，不能提交修改；重新启动后从软件重新打开数据页。页面资源在本地，不需要云账号。

- 默认查看今天，可切换自然日／周／月，前后翻周期或回到当前周期。每周从周一到周日；月份按自然月。自定义范围也可选择全部日期。
- 分类工作量表分别汇总每类已确认数量、有效工时、已结束记录和待补填数，不把不同类型数量混加。明确填写 0 显示 0，待补填不视为 0。当前任务单独显示，不计入已结束报表。右侧待补填「x 条」先列出当前周期、分类和数据范围内的记录，选择具体一条后补填；保存后返回列表，失败或冲突保留输入。
- 工时趋势按记录开始小时（日）或开始日期（周／月）汇总，跨午夜仍归入开始日；不是实时逐小时工作区间。类别分布、工时占比饼图与工作日历在「辅助分析」展开；饼图按有效工时占比，可点击扇区或图例筛选类别，日历最多展示筛选范围内的近 90 天。自定义长跨度可按月汇总；明细继续分页。
- 点开已结束记录的详情／补填面板会在页面水平、垂直居中，可以补填或修改类别、数量、备注，也能查看计时区间与修改历史。进行中记录只读；此版本不修改起止时间和有效工时。
- 页面表单支持 `Ctrl+S`。未保存就关闭明细时会提醒；其他窗口有更新时不会覆盖当前输入。遇到版本冲突，请保留输入、重新查看最新记录后再处理。
- 删除前需要确认，重要记录请先备份。

首页底部横向展示当天各类已确认工作量；未超出可用宽度时静止，超出时平滑循环滚动，悬停或键盘聚焦时暂停。系统选择减少动态效果时保持静止，可横向查看。未填数量会标记「待补填」，明确填写的 `0` 则正常计入。跨午夜的任务归入开始当天。

### 看看演示效果

「设置 → 数据管理」可生成最近 90 天的演示批次，再打开演示视图。演示覆盖四类工作、待补全和修改示例，全部是已结束记录，不改变当前任务。

真实、演示、全部三种范围可分别筛选。演示记录始终带标记，普通入口默认只看真实数据，首页统计也排除演示。重复生成不会重复插入；专门的「清理演示数据」入口需确认后才删除演示记录。

## 备份与恢复

打开「设置 → 数据管理」：

- **创建备份**：选择保存位置，生成 `.workmemo` 文件，包含工作数据库、监测配置、四类名称、外观、类别图标颜色、背景图片、布局（含音效选择）和状态岛设置，以及演示标记与浏览意图；不包含运行时连接令牌或浏览器注册信息。
- **从备份恢复**：先暂停正在计时的任务，保存或放弃其他窗口的修改。选择备份并核对数量后确认恢复。恢复会整体替换当前数据，软件会先自动备份原数据；校验或写入失败时保留或回滚原数据。

恢复出的未结束任务保持暂停、待恢复状态，不自动补计停机时间。恢复后请检查监测配置，并在 Chrome 扩展中同步站点授权。v0.2.9 也支持恢复兼容的旧版备份，并在临时副本中完成迁移。

自动备份位于 `%APPDATA%\com.workmemo.desktop\backups`。请另存一份重要备份到其他磁盘；保存在同一台电脑上的备份不能防止硬盘损坏。

## 升级、迁移与回退

### 从正式版升级

1. 从托盘正常退出旧软件。
2. **升级前保留旧安装包，并复制下面两个目录作为备份**。
3. 安装新版，或完整解压新版 ZIP 后启动。正式版沿用原数据位置，会自动升级数据格式。更新后请在 Chrome 扩展页重新加载新版本配套扩展。

| 内容 | 位置 |
| --- | --- |
| 工作记录与监测配置 | `%LOCALAPPDATA%\com.workmemo.desktop` |
| 外观、背景、窗口及状态岛设置 | `%APPDATA%\com.workmemo.desktop` |

安装版与免安装版共用这些数据。同一份数据只运行一个实例。应用运行时不要单独复制、移动或删除 SQLite、WAL、SHM 文件；使用内置备份，或退出后复制整个目录。

### 从预览版迁移

预览数据在 `%LOCALAPPDATA%\com.workmemo.test.monitor`，与正式版独立，不会因为安装正式版就自动覆盖。

1. 先从托盘退出预览程序，不必为了迁移强制结束工作任务。
2. 在正式版「设置 → 数据管理」核对来源、记录数、待补全和未结束任务。
3. 默认只导入记录，保留正式版监测配置。需要预览监测配置时单独勾选；正式版有未结束任务时，先只导入记录。导入配置后监测先保持关闭，请核对后手动开启。
4. 确认后软件先备份当前正式数据，再合并记录。原正式记录保留，重复导入会跳过，已经导入但后来变化的预览记录列为冲突，不自动覆盖。
5. 两边都有未结束任务时，历史和待补全可以先导入，冲突任务留在原处。处理后可以重试。正式版没有未结束任务时，预览任务迁为待恢复状态。

来源中的原记录不会被删除。若提示预览程序仍在运行，请从托盘正常退出后重试。

### 回退旧版本

v0.2.9 使用 schema 10，升级后的数据库不能直接交给原始 v0.2.7、v0.2.2 等旧程序读取。先从托盘退出新版，保留新版数据的副本，再安装旧版并恢复**升级前保存的整目录备份**。`.workmemo` 备份应使用支持此格式的 WorkMemo 版本恢复，不要直接交给旧版。

旧版和历史预览版安装包保留在 [Releases](https://github.com/noharass/WorkMemo/releases)。卸载或清理目录前，请确认重要备份已经另存。

## 反馈问题

在 [GitHub Issues](https://github.com/noharass/WorkMemo/issues/new) 提供软件版本、Windows 版本、错误文字和复现步骤即可。不要公开真实工作数据库、私人备注或连接信息。

第三方依赖声明见随附 `THIRD-PARTY-LICENSES.txt`。

## v0.2.7 界面、补填与提示音

- 分类待补填先选记录，保存后返回列表；已保存但刷新失败时可单独重试读取，不必重复提交。
- 辅助分析增加工时占比，包含已结束但待补填的有效工时，不包含当前任务。没有有效工时时显示空状态。
- 网页导航悬浮标签在点击后关闭；常规说明可按需展开，错误、恢复与未保存提示继续直接显示。底部两条信息卡片统一圆角。
- 四皮肤新默认不透明度为 65%，范围 40–100%；原有设置保留。滑块只影响背景，文字和图标保持清晰。
- 默认提示音为 FiftySounds，首次升级会切换，静音状态不变；保存其他套装后，后续重启不会再次覆盖。素材来源及许可保留在第三方声明中。
- 原始 0.2.7 使用 SQLite schema 9，2026-11-09 同版本修订使用 schema 10；旧版可能无法读取新数据库、低于 80% 的外观值或 fiftysounds 音效选项。回退前保留升级前的数据库与设置备份，不要假设只替换旧 EXE 就能完整还原。

## 延续 v0.2.6 的连续开工与设置保存修正

- 主窗口空闲时显示监测状态；点击「新建任务」进入手动表单，返回后输入仍保留在本次运行中。重启不承诺恢复尚未提交的手动草稿。
- 结束后继续监测；工作页出现新操作时，灵动岛优先显示识别类别和「开始记录」，确认前不计时。旧工作量未补填不阻挡下一项开工。
- 编辑旧任务工作量时，新开工通过岛顶部按钮确认，旧结算保持原记录与输入；当前任务优先显示，旧记录可从待补全继续处理。
- 设置保存不再反复重建表单；保存期间阻止重复提交和重复离开，失败保留输入，成功只执行一次目标操作，慢速保存后恢复原输入焦点。
- 本版修正了可复现的重复加载；Windows 原生闪动、透明和焦点验收受截图工具限制，不能承诺所有硬件环境均无闪动。

## 延续 v0.2.5 的桌面功能

- 顶部保留标识、设置、拖动区域和窗口操作；「仅浏览」使用眼睛图标及简短文字，开启时突出显示。
- 双箭头「切换任务」和原有暂停、备注、结束同排。新建与当前任务互斥；暂停后可切换，工作量仍可稍后填写，0 与未填不同。
- 状态岛主体保持固定尺寸和位置，允许拖动；提醒及填写区域只向下动画展开，共用背景。保存成功后收起，失败保留输入；新任务不会覆盖正在补填的旧记录。
- 默认开启当前用户开机启动，登录 Windows 后主窗口留在后台，可从托盘打开。在「设置 → 布局 → 开机启动」可以立即关闭；已有关闭选择或任务管理器禁用后不会强制重开。开发与隔离预览不注册启动项。
- 同一正式标识只运行一个实例。重复手动启动会打开已有窗口，重复自启不会抢出主窗口。
- 自启是软件完整退出后的再次启动，不会补算关闭期间工时，也不会绕过未结束任务的待恢复确认。移动 ZIP 目录后运行一次新目录的主程序可更新已启用的自启路径；不要删除正在使用的程序目录。
- 网页分类待补填先选择具体记录，保存后返回列表；详情居中，保留未保存保护、滚动和减少动态效果。

更新后请手动安装或完整解压新版，并在 Chrome 重新加载 0.2.9 配套扩展；旧程序不会自行替换。新版本验收范围与限制见 [本次发布记录](https://github.com/noharass/WorkMemo/blob/main/docs/RELEASE-0.2.9.md)。

## 延续 v0.2.3 的功能

- 键鼠空闲自动暂停，可修改阈值；继续原任务，暂停不计时，保留较长空闲结束规则。
- 四类可改名，新旧记录与网址归属保持一致。
- 自然日／周／月分类报表及新的报表优先布局，0、待补填和无记录分开显示。
- 原有柔和／清脆提示音保留，可在布局设置选回；开始、暂停、恢复、结束、空闲提醒可分别试听。
- 数据库迁移至 schema 9，保留旧记录、有效区间、修正历史及自增 ID。

### 延续 v0.2.2 的功能

- 灵动岛常态约 320×56 逻辑像素，暂停与继续位于计时右侧，继续沿用同一记录。开工确认时临时展开，浏览状态的开始入口位于右侧。
- 「监测设置 → 工作页面」可选择路径前缀、整个站点、域名后缀。已有规则默认保留路径前缀；新规则保存后，在 Chrome 扩展页重新加载 0.2.9 配套扩展并同步工作站点授权。
- 整个站点示例：`https://moonshot.feishu.cn` 覆盖该来源所有路径；域名后缀示例：`.cn-beijing-vpc.fcapp.run` 覆盖该域名及其子域名。匹配后仍需新操作和开工确认。
- 重叠时路径规则优先，其次整个站点，最后域名后缀；同类优先更具体的规则。域名后缀授权包含 HTTP 与 HTTPS，范围仅为配置的域名及子域名。
- 「布局」新增关键状态提示音开关和试听；默认开启，修改后点击保存布局。音效音量跟随 Windows 应用音量，播放失败不会影响记录。
- 总览侧栏、筛选及卡片更紧凑；工作节奏改为灰色零值与四档绿色。详情中的编辑入口修复，保存失败会保留输入。

## 一项工作使用多个网站

打开「监测设置 → 工作与网址」，展开对应工作（评测、质检、开发、文档），点击「为这项工作添加 URL」继续添加网址。每个 URL 可独立选择路径前缀、整个站点或域名后缀；例如评测可同时添加飞书站点和工作平台域名后缀。

点击「保存监测配置」后，在 Chrome 扩展中同步所有工作站点授权。已有配置会自动按归属工作分组，无需重新填写；全部工作合计最多 50 个 URL。进行中的同一工作在匹配站点之间切换时不拆分、不重复开工；空闲、离页和暂停规则保持。移除某个 URL 不影响同组其他网址；可用「归属工作」移动网址。

## 总览布局

周期与筛选在顶部，其下为有效工时、已结束记录和待补全三个概览，再展示分类工作量表。趋势和可展开的辅助分析位于下方，底部保留完整工作明细。窄屏分类表改为卡片，长名称可换行；明细表在自身区域横向滚动。趋势图例与坐标轴单位分行留出间距，不显示灰色缩放条。

## 页面与任务自动切换

v0.2.10：数据中心右上角新增「补记录」。填写类别、工作量（可明确填 0）、北京时间起止时间、需扣除的休息分钟数和备注，保存后生成「人工补录」已确认记录，计入统计并定位到记录开始日；跨日记录仍归开始日。有效工时不会超过时间跨度，不能补录未来时间，也不会修改正在计时的任务。支持 Ctrl+S；保存失败保留输入，连接中断时原样重试可避免重复新增，取消未保存输入前会提示。演示范围不能创建真实补录。

v0.2.10：北京时间每日 00:00，上一日已停止计时的暂停、挂起和待恢复任务直接结束，包含手动暂停；工时保留并转入待补全。正在计时的任务不受影响。软件关闭期间跨日，重开后的首次状态读取／后台检查会补处理；再次使用已结束任务时需新建或重新绑定。不是停表后滚动 24 小时。

v0.2.9：灵动岛默认收起；切换标签、新网页、开工确认、空闲和结束提醒只更新短文字及展开箭头旁的静态圆点，不会自动展开。点击箭头可查看并处理；手动收起后切页仍保持收起。已经打开的补填表单继续保留输入，关闭时仍会保护未保存内容。

在扩展弹窗授权识别新网页，并按需授权工作站点。新网页会暂停当前计时，可选择任务、新建任务或忽略，并选择匹配范围；已绑定网页可切换到对应未结束任务。手动暂停、仅浏览和重启待确认状态不会自动开表。返回网页后需要新的有效操作，无法可靠归属的时间不会补算。升级前请备份数据，旧版不能直接读取 schema 10。

2026-11-09 同版本修订：网页绑定的任务已结束时，点击灵动岛「打开主窗口处理」，可直接选择「新建任务」并填写名称和类别，或选择「绑定已有任务」后选择未结束任务，再点「确认绑定」。仅浏览状态下也可处理绑定；保存绑定不会退出仅浏览或开始计时。仅浏览时需明确选择开始记录。旧记录的工时和待补全信息保留。
````

## E:\WorkMemo\docs\BUILDING.md

````markdown
# 从源码运行和构建 WorkMemo

普通用户请下载 [Release 成品](https://github.com/noharass/WorkMemo/releases/latest)，无需安装开发工具。使用方法见 [USER-GUIDE.md](USER-GUIDE.md)。

## Windows x64 环境

需要 Node.js 24 x64、Rust stable MSVC、Visual Studio 2022 C++ Build Tools（含 Windows SDK）、Microsoft Edge WebView2 Runtime。通过 git clone 获取源码时需要 Git。

前端依赖和 Tauri CLI 由 npm 安装；Rust 依赖由 Cargo 按锁文件获取。SQLite 编入程序，不需要数据库服务。首次安装依赖需要联网。

## 开发

```powershell
git clone https://github.com/noharass/WorkMemo.git
Set-Location WorkMemo
npm.cmd ci
npm.cmd run tauri dev
```

`npm.cmd run dev` 只提供浏览器预览，不能保存桌面工作记录。`tauri dev` 会先准备配套浏览器组件。Chrome 需加载程序「监测设置 → 打开配套扩展文件夹」中的已构建 extension；不要直接加载 browser-extension 源文件目录。

普通源码运行使用正式标识 `com.workmemo.desktop`，会打开正式数据。预览配置 `src-tauri/tauri.preview.conf.json` 使用 `com.workmemo.test.monitor`。不要用真实工作记录做测试。

## 检查

2026-11-16 用户确认新版本0.2.11公开发布，应用与扩展版本统一，数据库仍schema12。生产构建、发布流程、完整校验及未完成的原生验收见 [RELEASE-0.2.11.md](RELEASE-0.2.11.md)。

2026-11-16 网页阶段D已完成自动验收和0.2.10候选构建，新增实际Chromium浏览器缩放、独立原生HTTP和成品内容核验。用户手动确认独立桌面窗口显示、透明和操作正常；Narrator/系统DPI/扩展联动/安装卸载未全验收。完整路径、命令、校验值和待确认发布边界见 [WEB-PHASE-D.md](WEB-PHASE-D.md)。公开0.2.10资产未替换。

2026-11-16 网页阶段C完成自定义趋势补零、有界日/月聚合和桌面入口动态加载；新增 `node scripts/verify-web-phase-c.mjs`，性能测量为 `node scripts/measure-web-phase-c.mjs`（`WORKMEMO_MEASUREMENT=after`，每次三组并覆盖同名证据）。Node/Rust 共用趋势场景契约。完整数据规则、前后 trace、命令和原生验收边界见 [WEB-PHASE-C.md](WEB-PHASE-C.md)。当前公开 0.2.10 安装包未包含 A/B/C 修正。

2026-11-16 网页阶段B完成表单语义、错误焦点、颜色/强制颜色、静默轮询、图表数据表和弹层隔离修正。新增 `node scripts/verify-web-phase-b.mjs`；可选 `WORKMEMO_AXE` 运行自动可访问性扫描，`WORKMEMO_CONTRAST=1` 使用本机 Python/Pillow 测量实际合成背景。完整命令、源码和人工验收边界见 [WEB-PHASE-B.md](WEB-PHASE-B.md)。当前公开 0.2.10 安装包仍未包含 A/B 源码修正。

2026-11-15 网页阶段A完成源码修正：新增`unfinished`筛选，旧`working` API含义不变，不迁移数据库。状态、图表及请求恢复专项为`node scripts/verify-web-phase-a.mjs`，使用`WORKMEMO_PLAYWRIGHT`和`WORKMEMO_WEB_URL`指向已有Playwright与生产资源预览；共享状态契约同时由Node及Rust测试校验。完整命令、源码和验收范围见[WEB-PHASE-A.md](WEB-PHASE-A.md)。当前公开0.2.10成品尚未包含本轮修正。

2026-11-12 零点结束源码使用 schema 11，验收使用独立标识和隔离数据库。新增 `cargo test --locked --manifest-path src-tauri/Cargo.toml day_rollover --lib`，覆盖固定北京时间边界、全部暂停原因、重启、回滚和迁移；完整结果见 [DAY-ROLLOVER.md](DAY-ROLLOVER.md)。公开 0.2.9 安装包尚不包含此变更。

同日后续网页补记录将当前源码升级为 schema 12，新增持久化请求去重表，完整备份恢复包含该表。专项为 `cargo test --locked --manifest-path src-tauri/Cargo.toml manual_entry`、`node --test tests/manual-entry.test.mjs` 和生产预览下的 `node scripts/verify-manual-entry.mjs`；网页脚本只拦截隔离 HTTP 数据，不连接正式数据库。详细命令、完整文件清单与验收限制见 [WEB-MANUAL-ENTRY.md](WEB-MANUAL-ENTRY.md)。新旧数据库不可直接降级互读，先备份；当前公开 0.2.9 成品仍是 schema 10。

```powershell
npm.cmd test
npm.cmd run build
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
```

测试与打包按顺序执行；不要让不同配置的 Cargo 构建并行复用 target 目录。特别是复制隔离可执行文件前，要核对其编译标识，避免把另一构建产生的文件作为隔离程序。

### 网页组件与隔离回归

2026-11-10 灵动岛源码修订增加 `node scripts/verify-island-manual-expand.mjs`，覆盖默认收起、连续切页与提醒更新、手动展开、补填草稿、收起区域 IPC、四皮肤和减少动态效果。`verify-page-task-ui.mjs`、`verify-page-binding-entry.mjs`、`verify-v027-island.mjs` 已改为显式点击展开入口；历史 v025/v026 脚本中的自动展开假设尚未全部改写，不能用它们判定本次默认收起为故障。源码范围和原生验收限制见 [FIX-ISLAND-MANUAL-EXPAND.md](FIX-ISLAND-MANUAL-EXPAND.md)。

网页通过共享 `src/ui/UiProvider.tsx` 使用 Ant Design 6.6.8，保留桌面原有控件和样式。不要在网页继续手写标准按钮、选择框、表格或弹层；主题通过官方 token、语义样式及共享封装配置。未引入全局 reset，图表继续使用 ECharts。

先在一个 PowerShell 窗口运行 `npm.cmd run dev -- --host 127.0.0.1`，再在另一个窗口运行：

```powershell
# Playwright 是验收工具，不是应用运行依赖；填写本机已有的 playwright/index.mjs。
$env:WORKMEMO_PLAYWRIGHT = 'C:\path\to\playwright\index.mjs'
npm.cmd run test:web
node scripts/verify-v025.mjs
node scripts/verify-v026.mjs
node scripts/verify-v025-followup.mjs
node scripts/verify-titlebar.mjs
node scripts/verify-ui-022.mjs --desktop-only
node scripts/verify-v023-phase1.mjs
node scripts/verify-multi-url.mjs
```

这些浏览器回归使用隔离 HTTP／IPC 数据，不对真实任务发送操作。新版网页回归以 `test:web` 为准。0.2.7 将分类连续补填改为先选记录、保存后返回列表；历史命令 verify-v025-followup.mjs 转到新的 verify-v027-web.mjs，桌面收高仍由 verify-v025.mjs 检查。旧网页脚本中的原生 select、侧抽屉及清空统计的断言对应历史布局，不能当作新版的验收入口。新截图和结果写入 `artifacts/web-ui/qa`；CSS 缩放和模拟 IPC 不等于 Windows 原生透明、系统 DPI 或实际浏览器扩展验收。完整说明见 [WEB-UI-UPDATE.md](WEB-UI-UPDATE.md)。

0.2.6 源码阶段新增 `verify-v026.mjs`，覆盖监测首页、连续开工入口、旧结算草稿、新任务并存，以及设置保存的节点、请求次数、焦点和逐帧稳定性；支持 `WORKMEMO_UI_URL` 指向生产预览资源。`--baseline` 仅用于开发前的缺陷复现，不能作为修复后的验收入口。既有桌面、名称脚本已适配显式「新建任务」入口和取消后保留草稿。源码阶段与原生限制见 [UPDATE-0.2.6-PHASE-1.md](UPDATE-0.2.6-PHASE-1.md)。

## 构建 v0.2.11

当前版本正式成品输出 artifacts/0.2.11；v0.2.10 资产和标签保留。先停止当前项目使用 node_modules 的 Vite 进程，保留真实工作任务和独立桌面预览，再执行：

```powershell
& .\scripts\package-windows.ps1
& .\scripts\verify-windows-candidate.ps1 -Directory artifacts/0.2.11 -PreserveDirectory artifacts/0.2.10
```

校验器默认读取当前版本；PreserveDirectory 可显式验证旧版本目录，未提供时不声称已核对旧资产。独立原生 HTTP 核验默认使用 package.json 版本，也可通过 WORKMEMO_NATIVE_VERSION 指定明确的旧预览版本，不能把旧预览结果记为新程序启动通过。发布脚本使用 Python 标准库和既有 Git 凭据助手，分 inspect / prepare / publish / verify；具体可复核命令见 RELEASE-0.2.11.md。

## 构建网页改造候选（0.2.10，尚未公开）

先停止当前项目使用 node_modules 的 Vite 预览，避免 Windows 原生模块占用；保留真实应用任务。使用单独目录，不覆盖已有版本成品：

```powershell
& .\scripts\package-windows.ps1 -OutputDirectory artifacts/web-phase-d/candidate-0.2.10
& .\scripts\verify-windows-candidate.ps1
```

自定义输出限定在当前工作区 artifacts 内；不传参数仍沿用原 artifacts/版本号 目录，可能覆盖同名文件。成品核验脚本的旧资产保留检查需要 artifacts/0.2.10 中原四项文件。独立原生查看配置为 src-tauri/tauri.web-acceptance.conf.json，不能把该 debug 验收实例当作正式安装包。全部命令和人工限制见 WEB-PHASE-D.md。

## 构建 v0.2.9 成品

2026-11-10 按用户要求将基于 0.2.8 功能的当前修正版统一发布为 0.2.9，包含灵动岛默认收起、新建／绑定入口和多任务列表，数据库仍为 schema 10，详见 [RELEASE-0.2.9.md](RELEASE-0.2.9.md)。运行下方打包脚本时输出目录为 `artifacts/0.2.9`。正式构建必须使用 Tauri build，确保启用 `custom-protocol` 内嵌前端。新 v0.2.9 标签指向本次构建提交；既有标签和发布不移动、不替换。

## 0.2.7 历史记录

0.2.7 发布后的页面任务自动切换仍处于源码阶段，数据库 schema 10 和隔离检查说明见 [PAGE-TASK-SWITCH-PHASE-1.md](PAGE-TASK-SWITCH-PHASE-1.md)。隔离界面脚本为 `node scripts/verify-page-task-ui.mjs`，请勿把开发构建复制到正式应用目录。

0.2.7 已进入成品发布阶段，发布核对与兼容性见 [RELEASE-0.2.7.md](RELEASE-0.2.7.md)；前序阶段记录、独立 Windows 构建及完整命令见 [UPDATE-0.2.7-PHASE-1.md](UPDATE-0.2.7-PHASE-1.md)。新增回归：

```powershell
node scripts/verify-v027-web.mjs
node scripts/verify-v027-feedback.mjs
node scripts/verify-v027-island.mjs
node scripts/verify-v027-visual.mjs
```

视觉脚本覆盖四皮肤、40/65/100% 不透明度及两种密度，网页截图只用于浏览器合成效果检查。原始音效只在素材编辑时需要，普通构建直接使用仓库 WAV，不联网下载。

## 打包 v0.2.9

```powershell
& .\scripts\package-windows.ps1
```

脚本收集第三方许可，执行前端与 Tauri release 构建，准备浏览器组件，生成 NSIS 安装器和免安装 ZIP：

- `artifacts/0.2.9/WorkMemo_0.2.9_x64-setup.exe`
- `artifacts/0.2.9/WorkMemo_0.2.9_windows_x64.zip`
- `artifacts/0.2.9/THIRD-PARTY-LICENSES.txt`
- `artifacts/0.2.9/SHA256SUMS.txt`

脚本不启动成品或执行安装。产物、数据库、凭据和本机配置不提交 Git。相同版本重建会替换该输出目录中的同名文件。

不运行打包脚本时：

```powershell
npm.cmd ci
node scripts/collect-licenses.mjs
npm.cmd run tauri -- build --ci --no-binary-patching
```

原始程序在 `src-tauri/target/release/workmemo.exe`，安装器在 `src-tauri/target/release/bundle/nsis/`。`custom-protocol` 功能用于内嵌前端，成品不依赖 Vite 开发服务器。打包前的资源脚本会核对 helper 的版本和配置，并构建本地扩展弹窗。

安装模式为 currentUser，数据标识为 `com.workmemo.desktop`。本项目未启用应用内自动更新；安装器使用 `--no-binary-patching` 保持与免安装包相同的程序字节。第三方许可通过 `scripts/collect-licenses.mjs` 从锁定依赖收集。

版本在 package.json、package-lock.json、Cargo.toml、Cargo.lock、tauri.conf.json 和扩展 version_name 中同步。扩展的 Chrome 数字版本另行递增，固定 key 保持扩展标识不变。

正式 release 标识首次运行默认注册当前用户开机启动；开发、隔离预览不会注册。自启以 `--autostart` 进入后台，单实例插件最先初始化。主窗口内容高度命令只允许 main 调用，状态岛区域命令只允许 notice；不要扩大前端原生权限。

0.2.7 反馈回归 `verify-v027-feedback.mjs` 覆盖侧栏提示／滚动／键盘、类别工时饼图及筛选、三／二／单列、文案与圆角。完整结果与原生限制见 [FIX-0.2.7-FEEDBACK.md](FIX-0.2.7-FEEDBACK.md)。
````

## E:\WorkMemo\docs\PHASE-8.md

````markdown
# WorkMemo 第八阶段：最终检查与 Windows 交付

## 2026-11-12 v0.2.10 正式发布

用户要求上传为 0.2.10。已构建并公开 Windows x64 安装版、免安装 ZIP、第三方许可和校验文件，四项公开下载的摘要均与本地一致。版本标签指向 ee76bba；Node 59、Rust 181 项通过。升级数据库至 schema 12，需事先备份；原生透明窗口、真实扩展交互和安装卸载未在本次实机验收。详见 [RELEASE-0.2.10.md](RELEASE-0.2.10.md)。

## 2026-11-12 网页直接补记录：源码阶段

按用户明确顺序，在零点结束提交 d951862 完成并同步后增加网页「补记录」。填写类别、数量、北京时间起止、休息分钟数和备注，保存已确认的人工补录，刷新开始日明细；不改变当前计时任务。schema 12 请求表保障重复提交／响应丢失、重启、时钟回拨、删除及备份恢复的可靠性。Node 59、Rust 181、补录专项 7、生产网页补录 5 组、既有完整网页回归与待补填 5 组、前端构建、Cargo 格式和 diff 检查通过。修正新增日期控件的旧样式影响和窄屏溢出；未启动正式应用、未操作真实任务。完整路径、源码、测试、命令与兼容性见 [WEB-MANUAL-ENTRY.md](WEB-MANUAL-ENTRY.md) 和 [WEB-MANUAL-ENTRY-SOURCE.md](WEB-MANUAL-ENTRY-SOURCE.md)。本次两项授权源码需求完成；未打包或替换公开 0.2.9 成品，不自动增加新功能。

## 2026-11-12 北京时间零点结束：源码阶段

用户最终明确按北京时间每天 00:00 直接结束所有暂停、挂起和待恢复任务，包含手动暂停，取代最初滚动 24 小时提议。新增持久化停表时间，正在计时任务不受影响，停机跨日首次状态读取／后台检查补处理。工时和原记录保留，转待补全；迁移 schema 11，不增加依赖或权限。Rust 174、Node 57、Cargo 格式与 git diff 检查通过，Vite 隔离开发预览启动成功；未启动正式应用、未操作真实任务。详细源码、路径和命令见 [DAY-ROLLOVER.md](DAY-ROLLOVER.md) 与 [DAY-ROLLOVER-SOURCE.md](DAY-ROLLOVER-SOURCE.md)。本步骤记录后，按用户明确的「做完上面的再做这个」继续网页补记录；未自动进入安装包发布。

## 2026-11-10 v0.2.9 正式版本

用户确认当前修正版基于 0.2.8，明确要求改发 0.2.9。Git 祖先检查确认包含原 v0.2.8 与多任务列表构建。主程序、helper、扩展和各版本文件统一为 0.2.9，计时、schema 10、权限和依赖保持。Node 57、Rust 163、Cargo 格式、前端生产构建、Windows x64 正式编译、中文 NSIS 和 15 文件完整 ZIP 核对通过；默认收起／岛区域／页面任务／绑定入口生产回归通过。已公开为 Latest，Release ID 439965579，四项服务端摘要及匿名下载复算全部通过；新标签 v0.2.9 与构建源码均为 1ea89a1562616aba8fd079694e1502102b03397c。完整回执见 [RELEASE-0.2.9.md](RELEASE-0.2.9.md)。旧 0.2.7／0.2.8 发布资产核对保持不变，既有标签保留，原生实机验收限制继续如实记录。本次交付完成，不自动增加新功能。

## 2026-11-10 v0.2.7 灵动岛收起成品

用户明确要求「还是发成0.2.7谢谢」，授权本次源码进入同版本发布。现有 11-09 公开四资产已完整备份并核对原摘要；正式 Windows x64、中文 NSIS 与 15 文件 ZIP 完成，版本 0.2.7、schema 10、权限和依赖保持。本次新生产资源的默认收起专项、岛区域、页面任务和绑定入口回归通过；成品版本、CRC 和安装器／ZIP 内容逐项一致。公开四资产已替换，服务端摘要及匿名下载复算全部通过，Latest=v0.2.7、Release ID 431201874；构建源码 2b9af50acc905eddd937fb131c16dbf0f945ac5d。完整回执见 [RELEASE-0.2.7-ISLAND.md](RELEASE-0.2.7-ISLAND.md)。原标签和 v0.2.8 保留，原生实机验收限制继续如实记录。本次交付结束，不自动增加新功能。

## 2026-11-10 灵动岛默认收起源码修订

按用户截图反馈，取消网页与提醒变化时自动展开，收起时用静态圆点和短文字提示，点箭头才展开。保留手动打开的补填与未保存保护；Rust 显示条件补充待绑定网页，保证无活动任务时收起提示仍可显示，并尊重托盘隐藏偏好。Node 57、Rust 163、Cargo 格式、前端生产构建通过；生产资源上的新增专项、原页面任务／绑定入口／岛区域回归通过。Windows 原生透明、点击与真实扩展切页仍待实机验收；版本 0.2.7、schema 10 和公开资产未变。本轮源码阶段完成，不自动发布。完整交付、测试命令与源码见 [FIX-ISLAND-MANUAL-EXPAND.md](FIX-ISLAND-MANUAL-EXPAND.md) 和 [FIX-ISLAND-MANUAL-EXPAND-SOURCE.md](FIX-ISLAND-MANUAL-EXPAND-SOURCE.md)。

## 2026-11-09 v0.2.7 同版本成品更新

用户明确要求「直接发布，还是0.2.7」。现有功能与新建／绑定入口修正统一使用 0.2.7，SQLite schema 10 保持；原 v0.2.7 标签与既有 v0.2.8 发布保留。原始 0.2.7 公开资产已下载并核对 SHA256 后备份。Node 57、Rust 162、Cargo 格式、正式 Windows x64 构建、中文 NSIS 和 15 文件 ZIP 校验通过，主程序和 helper 均为 0.2.7；生产资源入口专项、页面任务、反馈五组、补填五组、24 布局和 15 个试听绑定通过。公开四资产已更新，服务端摘要及匿名下载复算全部一致，Latest=v0.2.7，Release ID 431201874；构建源码 37a3f08b1ed56118ae9e9881e268fe582ef5ded4，原标签保持 cb031eb7。发布与摘要记录见 [RELEASE-0.2.7-REFRESH.md](RELEASE-0.2.7-REFRESH.md)。原生实机验收限制继续保留，本次交付结束，不自动增加功能。

## 2026-11-09 主窗口新建与重新绑定入口修正

用户反馈灵动岛提示绑定任务已结束，但主窗口没有新建选项。隔离复现：仅浏览状态隐藏网页处理表单，同时普通新建入口被待处理状态排除，形成无入口界面。修正为仅浏览下也可处理绑定，并直接展示「新建任务／绑定已有任务」选择；保持原 Rust 绑定、计时和数据校验。灵动岛区分新网页与旧任务结束，不再向后者提示不存在的忽略操作。Node 57、生产构建、新增入口专项、原页面任务回归和反馈五组通过；v026 前五组通过，第六组因历史「工作 URL」定位超时，全脚本未通过。源码交付记录与完整代码见 [FIX-PAGE-BINDING-ENTRY.md](FIX-PAGE-BINDING-ENTRY.md) 和 [FIX-PAGE-BINDING-ENTRY-SOURCE.md](FIX-PAGE-BINDING-ENTRY-SOURCE.md)。安装包、公开 Release 和版本号未变；真实用户当时状态及 Windows 实机流程仍待核对。

## 2026-11-04 同版本更新 0.2.8

按用户要求保留版本号并更新公开下载；任务列表构建提交、原标签关系、备份、摘要及验证见 [RELEASE-0.2.8.md](RELEASE-0.2.8.md)。

## 2026-11-04 主窗口与灵动岛多任务列表

当前及暂停任务统一展示，可在列表中点击继续；八任务、切换与窄屏隔离回归、57 项 Node 和生产构建通过。完整路径、代码清单、截图及原生限制见 [TASK-LIST-UPDATE.md](TASK-LIST-UPDATE.md)。源码阶段完成后等待确认。

## 2026-11-04 v0.2.8 成品

用户授权发布页面任务自动切换。版本、配套扩展和中文使用说明更新至 0.2.8；数据库升级至 schema 10。源码阶段测试结果与仍待实机验收的项目见 [页面任务阶段记录](PAGE-TASK-SWITCH-PHASE-1.md)，发布说明见 [RELEASE-0.2.8.md](RELEASE-0.2.8.md)。

## 2026-11-03 发布后的页面任务自动切换源码阶段

按用户新确认的方案，开发具名任务与网页绑定、原子计时段切换、新网页处理、手动暂停保护和隔离授权。新源码使用 SQLite schema 10；正式 0.2.7 安装包与公开 Release 未变。实现、检查及原生验收限制见 [PAGE-TASK-SWITCH-PHASE-1.md](PAGE-TASK-SWITCH-PHASE-1.md)。此开发阶段完成后等待用户确认，不自动进入下一阶段。

## 2026-11-02 v0.2.7 Windows 成品与公开发布授权

用户明确要求「传release吧」，授权完成 0.2.7 成品和公开发布。统一应用、helper 与扩展版本为 0.2.7；Node 56、Rust 152、Cargo 格式、生产构建、生产资源反馈／补填各 5 组、岛区域、24 视觉布局与既有桌面／完整网页回归通过。中文 NSIS、15 文件完整 ZIP、主程序版本、helper、内容和 SHA256 核对通过，依赖图、权限、正式标识及 SQLite schema 9 保持。原生透明／区域点击／焦点／系统 DPI／自启及安装卸载、人工听感的验收限制继续如实保留，未操作真实任务。本地成品与后续发布回执见 [RELEASE-0.2.7.md](RELEASE-0.2.7.md)。已公开 [WorkMemo v0.2.7](https://github.com/noharass/WorkMemo/releases/tag/v0.2.7) 为正式 Latest，Release ID 431201874，标签指向构建提交 cb031eb7d048dd26dc18e51a335058d21a60901f；四项资产的服务端摘要与匿名公开下载复算均通过。最终回执另行提交，标签不移动；本版本发布完成，不自动扩展功能。


## 2026-11-02 0.2.7 反馈修订：导航、饼图与信息精简

按确认方案修复网页导航提示在滚动中的重定位与旧悬浮状态，保留键盘导航；辅助分析新增真实类别工时饼图、筛选联动及三／二／单列排版。主界面去掉重复状态，设置和结算的长说明可展开；待补全和今日工作量条及其他独立卡片统一圆角。Node 56、生产构建、Cargo 格式、新增反馈 5 组、四皮肤 24 布局及相关网页／桌面／名称／多 URL 回归通过。Rust 未改动，本轮没有重跑 Rust 测试。独立 Windows 构建与 probe 成功；截图超时后重试被用户 Esc 停止，之后未再调用原生输入。现有隔离库 schema 9、完整性 ok，读取 193 条已结束记录，未操作记录。详细结果、完整路径、源码及命令见 [FIX-0.2.7-FEEDBACK.md](FIX-0.2.7-FEEDBACK.md)。正式版本和下载仍为 0.2.6，等待成品阶段确认。


## 2026-11-02 0.2.7 第一阶段：补填选择、轻透明与默认音效

按用户确认方案，分类待补填先列出记录再选择，保存后返回列表；修复灵动岛首次展开的原生区域观察器挂载问题及收起／重开竞态；桌面与网页统一轻透明控件，四皮肤接受 40–100%、新默认 65%，保留旧设置；接入 FiftySounds 五种离线提示并一次性迁移旧音效默认，保留静音及选回旧套装能力。

Node 53、Rust 152、Cargo 格式、生产构建、新增网页 5 组、岛区域、24 视觉布局／15 试听绑定以及既有网页／桌面／名称／多 URL 回归通过。独立标识 com.workmemo.test.v027 的 Windows 程序构建、启动、probe 和原生可访问性读取成功，隔离库 schema 9、完整性 ok、0 条任务；原生截图两次超时，输入缺少 geometry，Windows 原生透明、区域点击、焦点、系统 DPI／多屏和主观听感仍未验收。五 WAV 的 Windows 播放 API 调用与摘要通过。详情、完整路径、代码及命令见 [UPDATE-0.2.7-PHASE-1.md](UPDATE-0.2.7-PHASE-1.md)。保留原有未跟踪规划和真实数据；正式版本／下载仍为 0.2.6，等待用户确认成品阶段，不自动公开 Release。


## 2026-11-01 v0.2.6 Windows 成品与发布授权

用户明确要求「传release」，授权从已完成的第一阶段进入成品和公开发布。版本统一为 0.2.6；Node 51、Rust 151、Cargo 格式、生产构建、生产资源新增 9 组／旧桌面 10 组及 24 布局、连续补填 4 组和完整网页回归通过。中文 NSIS 与 15 文件完整 ZIP 的版本、helper、内容和 SHA256 核对通过；依赖、扩展权限、正式标识及 SQLite schema 9 保持。原生闪动／透明／焦点及完整安装卸载的验收限制如实保留，未操作真实任务。成品摘要、完整路径、源码和后续发布回执见 [RELEASE-0.2.6.md](RELEASE-0.2.6.md)。旧记录与原有未跟踪规划保留，不自动增加新功能。

已公开 [WorkMemo v0.2.6](https://github.com/noharass/WorkMemo/releases/tag/v0.2.6) 为正式 Latest，Release ID 430489519，标签指向构建提交 710c34e5dc21524453c5581dee34ff2f717b6157。四项资产服务端摘要和匿名公开下载复算均通过；最终发布回执已补入 RELEASE-0.2.6.md，构建标签不移动。本次版本发行完成，不自动进入下一版本。

## 2026-11-01 v0.2.6 第一阶段：连续开工与设置保存修正

按已确认方案，主窗口空闲时展示真实监测状态，点击新建后才进入手动表单；取消、候选到达、失败及其他窗口开工保留草稿。灵动岛和后台展示标识统一为当前任务／新候选优先，旧记录继续待补全，正在编辑的结算固定原记录；确认前不计时。隔离复现原监测配置单次保存触发 4 次读取及表单卸载，修正后保持首次加载 1 次读取、1 次写入，表单和背景节点及焦点保留。

Node 51、Rust 151、Cargo 格式与生产构建通过；新增 9 组隔离 UI 的开发／生产资源检查及现有桌面 10 组／24 布局、顶部 22 组、网页、工作名称、多 URL 回归通过。独立标识 com.workmemo.test.v026 的 Windows 程序已构建、启动并读取真实界面，隔离库 schema 9、完整性 ok、0 条任务；截图两次分别超时，点击报告 coordinate input geometry is unavailable，原生透明、焦点与闪动验收仍受限。完整路径、代码、命令、结果及阶段边界见 [UPDATE-0.2.6-PHASE-1.md](UPDATE-0.2.6-PHASE-1.md)。保留原有未跟踪规划，不处理真实任务；版本号／下载仍为 0.2.5，完成源码同步后等待用户确认成品阶段。

## 2026-10-30 v0.2.5 源码反馈修正：连续补填、居中面板与主窗收高

按用户实际截图反馈，分类工作量右侧待补填数量改为可点击入口，沿当前已应用周期、分类和数据范围逐条补填；支持保存并下一条，错误和冲突保持输入，写入成功后读取失败可单独重试。复用原 Drawer 的动画／焦点／背景锁定，改为水平垂直居中；主窗口保持宽度，按自然内容收紧高度，移除底栏上方大块空白。Node 49、Rust 147、生产构建、隔离 Windows 构建、原网页完整回归、新增网页 4 组（含 53 条连续补填）及桌面 10 组／24 组布局通过。截图为隔离夹具，窗口请求高度在 780px 测试布局中为新建 443、工作中 423；不能代替本轮真实原生高度／焦点／DPI 验收。没有处理真实任务或发布新安装包。完整路径、代码、命令与限制见 [FIX-0.2.5-FEEDBACK.md](FIX-0.2.5-FEEDBACK.md)。

## 2026-10-30 v0.2.5 第 1 阶段：现有 UI、固定状态岛与自启（源码交付）

按用户确认方案及补充参考图，完成顶部仅浏览、独立新建页、双箭头切换、底部文字统计、固定主体状态岛、动画展开／岛内结算，以及正式版默认后台自启和单实例保护。Node 49、Rust 146、生产构建、新版 9 组交互／24 组布局、顶部 22 组与原桌面／名称／多 URL 隔离回归通过；NSIS 私有命名空间内的自启清理及新所有者保护通过，真实注册项保持。隔离 Windows 程序构建、后台参数启动、单实例唤起和可访问性读取成功；原生截图超时，后续输入被用户 Esc 停止，原生透明、区域点击、焦点、DPI 和真实登录自启仍待验收。完整路径、源码、命令和限制见 [UPDATE-0.2.5-PHASE-1.md](UPDATE-0.2.5-PHASE-1.md)。未操作真实任务，未发布新安装包，保留旧阶段和原未跟踪规划；本阶段完成后等待用户确认成品阶段。

## 2026-10-29 v0.2.4 成品发布

用户明确确认「打包并发布新版成品」，授权将网页优化与主窗口顶部精简进入成品阶段。已统一 0.2.4 版本，49 项 Node、144 项 Rust、Cargo 格式、生产构建、五组隔离浏览器回归及安装器／ZIP 内容与版本核对通过。中文 NSIS、完整 ZIP、许可和校验文件已公开为 Latest；四项资产均核对服务端摘要，并匿名重新下载复核成功。构建提交与标签为 `3796547f8e582120e41cafb913caf9cec8dc1914`，Release ID 为 `427613324`；最终回执见 [RELEASE-0.2.4.md](RELEASE-0.2.4.md)。旧版与真实工作数据保持，不将模拟浏览器结果当作新的原生验收。本次成品阶段已完成，后续功能等待用户确认。

## 2026-10-29 主窗口顶部单一设置入口（源码交付）

按用户截图移除主窗口的统计、外观、布局快捷图标，只保留设置；已有功能通过设置栏目和工作量／待补全入口继续访问。顶部规划为标识、设置、独立拖动留白、限宽工作量胶囊及窗口操作；紧凑高 42px，保留至少 24px 拖动区，舒展至少 32px。49 项 Node、生产构建、22 组隔离标题栏布局与入口检查、原桌面四皮肤及窗口布局浏览器回归通过；原生动作未重验，不操作真实任务、不打包发行。完整路径、规划、源码及命令见 [TITLEBAR-UPDATE.md](TITLEBAR-UPDATE.md) 和 [TITLEBAR-SOURCE.md](TITLEBAR-SOURCE.md)。

## 2026-10-29 网页组件与底部浮窗优化（源码交付）

按用户确认方案接入完整 Ant Design 6.6.8，统一网页标准控件、共享主题及底部 Drawer，修复同查询刷新清空背景和滚动样式覆盖弹层锁的问题。保留统计、校验、真实／演示隔离及原接口；增加写后读取失败的明确反馈和嵌套确认保护。49 项 Node、TypeScript／生产构建、生产资源 CSP 隔离网页回归及桌面／名称／多 URL 浏览器回归通过；包括逐帧保存检查、官方进出动画、六档宽度、短屏和 CSS 缩放。原生透明／DPI／真实扩展未重做，不发布新安装包、不操作真实任务。完整结果、体积变化、路径、命令与代码见 [WEB-UI-UPDATE.md](WEB-UI-UPDATE.md) 及 [WEB-UI-SOURCE.md](WEB-UI-SOURCE.md)。保留旧阶段与原有未跟踪规划，等待用户确认本阶段效果。

## 2026-10-29 v0.2.3 第 3 阶段：正式成品与发行

用户明确要求「发版吧」，进入成品及公开发布阶段。已统一 0.2.3 版本并更新中文文档；49 项 Node、144 项 Rust、格式检查、生产构建及四组隔离浏览器回归通过，中文 NSIS 与完整 ZIP 构建完成，安装器与 ZIP 的主程序／浏览器资源逐字节一致。已公开为 Latest，四项资产均匿名下载并复核 SHA256；构建提交及标签为 83a2e2cfbbd3cb254de397d148c995082c1b4210。实际摘要和原生验收限制见 [RELEASE-0.2.3.md](RELEASE-0.2.3.md)。前两阶段等待确认是历史状态，本次「发版吧」已授权进入第 3 阶段；不结束或删除真实任务。

## 2026-10-29 v0.2.3 第 2 阶段

按用户确认继续，完成自然日／周／月分类工作量报表、报表优先排版、单工时趋势及可展开辅助图表，并增加柔和／清脆两套原生提示音及五项独立试听。49 项 Node、144 项 Rust 测试、生产构建与四组隔离浏览器回归通过，Windows 十条音频播放 API 与独立程序的真实报表接口检查通过；原生设置窗口输入及截图仍有工具限制，不将其称为验收通过。完整路径、完整代码、素材许可、检查及边界见 [UPDATE-0.2.3-PHASE-2.md](UPDATE-0.2.3-PHASE-2.md)。保留真实数据与旧阶段，等待用户确认页面和音效后进入第 3 阶段成品打包。

## 2026-10-29 趋势图右上角排版修正

按用户截图反馈，将趋势图图例与坐标轴单位分为独立两行，修正「小时」紧贴「有效工时」造成的换行错觉。TypeScript/Vite 构建、七种宽度的原有总览回归通过，另核对五种宽度的有数据与空图文字边界并打开截图检查。完整路径、代码、命令与交付边界见 [FIX-0.2.3-TREND-HEADER.md](FIX-0.2.3-TREND-HEADER.md)。修正保存在源码，未替换用户运行程序及公开下载。

## 2026-10-29 v0.2.3 第 1 阶段

按用户确认方案完成空闲自动暂停、四类工作名称配置及 SQLite schema 9 兼容迁移。47 项 Node、137 项 Rust 测试、生产构建及隔离浏览器回归通过；独立 Windows 程序构建、启动与本机鉴权接口检查通过，原生窗口捕获超时导致 GUI 计时验收受限。完整说明、文件清单、源码及限制见 [UPDATE-0.2.3-PHASE-1.md](UPDATE-0.2.3-PHASE-1.md)。保留真实任务、旧阶段及未跟踪规划文件，不修改已发布 v0.2.2 下载。本阶段结束后等待确认，再进入报表与音效阶段。

日期：2026-10-26（Asia/Shanghai）。用户确认进入第八阶段。起点 9b2c73a，main 与 origin/main 一致且工作区干净；开始时有一项暂停任务，最终用户操作及数据核对结果见第 4 节。

## 1. 目标与检查结果

阅读 PRODUCT-SPEC.md、AGENTS.md、PHASE-7.md、README，检查实际进程、暂停任务、历史、配置、前后端命令和安装资源。已有工作、计时、SQLite、历史、删除、统计和透明换肤通过前七阶段验证，本轮没有可复现的业务缺陷需要重写。

发现交付缺口：仍使用 Tauri 默认原生图标；尚无中文安装器、免安装压缩包和校验文件；源码开发与普通用户依赖说明未分开。采用最小方案补齐图标、NSIS 打包、许可文本、打包脚本及两类说明，保留应用标识、数据库结构、数据路径、窗口透明配置、业务逻辑和运行权限。

## 2. 成品与源码依赖

- 普通用户：使用中文安装版或解压 ZIP；无需 Node、Rust、Visual Studio、Git、Python 或 SQLite 服务。Windows 桌面界面使用 WebView2。
- 安装器为 currentUser，只安装到当前 Windows 用户。WebView2 使用 downloadBootstrapper，缺少时联网下载 Microsoft 官方运行环境；本机已有 WebView2，因此本轮未实际覆盖运行环境缺失的下载分支。
- 免安装版仍需要已有 WebView2，数据保存在当前用户目录，不是随 ZIP 移动的数据目录。
- 源码：Node 24 x64、Rust stable MSVC、Visual Studio 2022 C++ Build Tools/Windows SDK、WebView2；git clone 还需要 Git。npm ci 和 Cargo.lock 安装锁定依赖，SQLite bundled，无独立数据库服务。
- 本轮未配置代码签名，不能称为可信发布者签名版本；新电脑可能提示发布者未知。未修改或自动绕过 Windows 安全机制。

配置依据：[Tauri Windows 前置要求](https://v2.tauri.app/start/prerequisites/#windows)、[Windows 安装器](https://v2.tauri.app/distribute/windows-installer/)、[配置参考](https://v2.tauri.app/reference/config/#nsisconfig)。

## 3. 最小修改与文件关系

- public/workmemo.svg 为可维护的矢量图标源，与现有绿色 w. 标识保持一致；使用当前 Tauri icon 命令生成原有 16 个平台图标。没有引入图像生成服务或新运行依赖。
- index.html 增加同源 favicon；既有布局、主题和透明层级不变。
- tauri.conf.json 指定 NSIS、中文/英文、currentUser、WebView2 检测下载和图标；应用 id 保持 com.workmemo.desktop。
- package.json 及 lock 根条目声明 Node 24，.nvmrc 提供版本提示，增加统一 npm test；没有升级或新增依赖。
- package-windows.ps1 检查环境、版本、运行实例，执行 npm ci 和 Tauri 正式构建，产生安装包、ZIP 与 SHA256SUMS。
- collect-licenses.mjs 按 Windows Cargo 解析图与 npm 生产依赖收集许可，缺少包内文本时使用有明确来源及版本约束的补充；找不到许可文本就失败。汇编 253 个包版本的文本，随安装版和 ZIP 附带，不把构建依赖全部声称为运行组件。
- USER-GUIDE.md 面向成品用户；BUILDING.md 面向 GitHub 源码使用者；README 提供入口。
- artifacts/ 与 target/ 均不提交 Git。完整路径及 NEW FILE / UPDATE 见 PHASE-8-FILES.md；完整文本源码见 PHASE-8-SOURCE.md；二进制图标和许可汇编完整保存在原路径，未使用省略号代替内容。
- 上游许可文本保留原有空白，仅为这些原始文本设置窄范围 Git whitespace 属性；项目代码仍执行标准暂存检查。补充许可全文也完整保存在 scripts/third-party-licenses 中。

## 4. 实际构建与测试

- npm ci 成功，锁定依赖安装后 npm 报告 0 项已知漏洞；这是此次 npm 检查结果，不等同完整安全审计。
- Node 22 项、Rust 37 项测试通过，共 59 项；Rust 格式检查、TypeScript/Vite 生产构建通过。
- Tauri release/NSIS 实际构建成功，下载的 NSIS 及 Tauri 插件由 bundler 校验摘要后使用；没有修改全局开发工具链。
- 原生图标 PNG 实际打开检查，图形、圆角和透明边缘正确；该检查不是 Windows 所有 DPI 下的任务栏截图。
- 检查 NSIS 生成脚本确认 currentUser、HKCU、原应用 id、许可文件资源及 WebView2 分支；卸载的数据删除选项仅用户勾选时执行。本轮没有执行卸载，也没有删除真实数据。
- 首次本机安装退出码 0，但安装后的程序与原构建相差 3 个字节。确认这是 Tauri 默认 bundle 类型标记后，统一采用 --no-binary-patching。当前没有自动更新插件，该分发标记无业务用途；最终安装版和 ZIP 使用同一程序字节以便 SHA256 核对。
- PE 导入表检查仅见 Windows 系统/UCRT DLL，没有额外 VCRUNTIME/MSVCP 运行库导入；未将此表检查替代干净机器实测。

- 最终打包脚本完整执行通过，最后一次 Rust release 编译耗时 1 分 47 秒；此前也实际执行过完整构建。Node/Rust 依赖未升级。PowerShell 7.6.5 执行打包，脚本保存为 UTF-8 BOM 并显式 UTF8 读取 JSON；Windows PowerShell 5.1 语法和中文路径字面量解析检查通过，未将解析检查声称为完整 5.1 打包实测。
- NSIS 本机静默安装退出码 0，HKCU 安装信息为 WorkMemo 0.1.0，安装路径 C:\Users\Administrator\AppData\Local\WorkMemo。最终安装后的 EXE 与原始 release EXE 的 SHA256 完全相同，许可文本也相同。
- ZIP 逐项检查通过，恰好 3 个条目：WorkMemo/workmemo.exe、WorkMemo/使用说明.md、WorkMemo/THIRD-PARTY-LICENSES.txt；解压内容摘要与源文件逐个一致，不含真实用户记录。
- 开发服务关闭、1420 无监听时，通过桌面工具启动安装后的程序；可访问性树确认程序路径为安装目录、页面来自 http://tauri.localhost/、真实主界面和保存的外观入口正常。
- 数据只读核对：安装前已有的全部历史 id 均保留，数据库完整性为 ok，外观文件保持。原暂停任务在期间变成已完成，用户明确确认是自己主动点击结束；该记录仍在，时长未减少。不能将此轮记为原暂停状态全程不变，但历史无丢失。
- 用户确认安装版新图标和显示正常。未通过修改真实数据库制造暂停或完成结果，也未为验收结束、删除其工作。

## 5. PowerShell 命令

```powershell
Set-Location 'E:\WorkMemo'
$env:Path = (Join-Path $env:USERPROFILE '.cargo\bin') + ';' + $env:Path
npm.cmd ci
npm.cmd test
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
cargo test --locked --manifest-path .\src-tauri\Cargo.toml
& .\scripts\package-windows.ps1
```

单独构建官方安装器：

```powershell
npm.cmd run tauri -- build --ci --no-binary-patching
```

查看交付文件及校验：

```powershell
Get-ChildItem .\artifacts\0.1.0
Get-Content .\artifacts\0.1.0\SHA256SUMS.txt
Get-FileHash .\artifacts\0.1.0\WorkMemo_0.1.0_x64-setup.exe -Algorithm SHA256
Get-FileHash .\artifacts\0.1.0\WorkMemo_0.1.0_windows_x64.zip -Algorithm SHA256
```

脚本会覆盖同版本 artifacts 目录的同名交付文件，不进行递归删除；打包前要求正常保存关闭旧窗口。源码环境安装细节见 BUILDING.md。

## 6. 逐步验收与预期

1. 核对 SHA256 与交付清单一致；ZIP 仅含程序、使用说明、第三方许可，不含任何用户数据库、备注、凭据或本地外观配置。
2. 安装到当前用户，程序、卸载入口、开始菜单等安装资源可见；已安装 WebView2 的机器不下载额外运行环境。
3. 在开发服务关闭时启动安装后的程序，打开真实界面；暂停任务 id、毫秒时长、历史 id 集合和外观应与安装前基准一致。
4. 核对 WorkMemo 图标、透明、窗口控制、历史及外观入口。保留当前实际任务暂停，不为验收结束或删除它。
5. 源码使用者按 BUILDING.md 安装工具、npm ci、tauri dev；第一次需要网络。完整正式构建的可复现命令来自实际执行的打包脚本。
6. 新 Windows 11、缺 WebView2、不同 DPI/多显示器/时区、真实断电等未实际覆盖的场景，不因打包成功而计为通过。

## 7. 交付信息及兼容性

版本 0.1.0，目标 Windows x64；本机 Windows 10 22H2 19045、WebView2 155、Node 24.18、Rust 1.99.1 MSVC、VS 2022 Build Tools。Windows 11 及其他环境的完整实测仍未执行。

交付目录 E:\WorkMemo\artifacts\0.1.0：

| 文件 | 字节数 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.1.0_x64-setup.exe | 2,226,650 | b9f7d79a1346000e94517dd03e0f55c4dfedd68d87840ddfc6c6af593c1c4e39 |
| WorkMemo_0.1.0_windows_x64.zip | 3,008,860 | 7c120e314bcbb24622c6351a846fe1ddd40db6a2aebc98207257775b6c7086ec |
| THIRD-PARTY-LICENSES.txt | 2,235,369 | 209d8cf282922bd772bb7901c77bf97dd3934cc98556050bae41c33dcd027786 |
| SHA256SUMS.txt | 286 | 文件内列出上面 3 项的校验值 |

程序本体 E:\WorkMemo\src-tauri\target\release\workmemo.exe，6,137,856 字节，SHA256 5cab45d472feaf7d87804630ea824f7f5cf540427d3b50e9332c92772eda0acb。安装位置中的程序与其一致。现有所有阶段记录保留，真实任务已由用户主动结束。

用户明确授权后，已公开发布 [WorkMemo v0.1.0](https://github.com/noharass/WorkMemo/releases/tag/v0.1.0)，tag 指向本轮构建源码提交 38b69c09a3982485f6d0433fc4cf64db01173ec3。安装包、ZIP、许可文本、校验文件共 4 个资产；上传响应摘要及大小核对通过，公开 API 确认非草稿，另以无认证方式实际下载全部 4 项并逐个复算 SHA256，与上传前一致。发布回执仅保存公开元数据到被忽略的 artifacts 目录，没有把认证凭据写入文件或 URL。

- [中文安装版](https://github.com/noharass/WorkMemo/releases/download/v0.1.0/WorkMemo_0.1.0_x64-setup.exe)
- [免安装 ZIP](https://github.com/noharass/WorkMemo/releases/download/v0.1.0/WorkMemo_0.1.0_windows_x64.zip)
- [校验文件](https://github.com/noharass/WorkMemo/releases/download/v0.1.0/SHA256SUMS.txt)
- [第三方许可](https://github.com/noharass/WorkMemo/releases/download/v0.1.0/THIRD-PARTY-LICENSES.txt)

## 8. Git 和发布边界

按既有授权提交推送 main，检查暂存区排除产物、依赖、真实数据库、凭据和个人配置，随后比较本地和远程提交并检查工作区。

```powershell
git fetch origin main
git add .
git diff --cached --check
git commit -m "build: prepare Windows installer and final delivery"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```

公开发布已按用户明确确认完成。构建源码与随后补充的下载文档分别提交同步，未强制推送、覆盖远程历史或变更仓库公开范围。完成第八阶段及本轮最终交付后，等待新的明确需求，不自动扩展功能。


## 2026-10-27 浏览器连接全面修复

用户要求覆盖所有安装方式，灵动岛保持搁置。本轮 alpha.4 将 EXE、ZIP、源码 dev、目录迁移统一到 Rust 注册引擎，加入启动修复、连接诊断与双主机回退。SQLite schema 3 和计时/皮肤规则不变。当前自动测试 31 项 Node + 78 项 Rust 通过；正式/预览两配置隔离 NSIS 安装、CMD 修复、目录迁移、旧卸载保护与所属卸载通过。Windows 预览 EXE/ZIP 与默认源码 NSIS 均已构建并核对；alpha.4 已发布，全部 9 个资产经无认证下载比对。结果见 BROWSER-CONNECTION-DELIVERY.md，不能据此声称其他用户电脑连接或全部原生交互已验收。


## 2026-10-27 状态岛与计时参数预览发布

用户要求发布 alpha.5。状态岛首阶段和可调整的离页/空闲阈值已构建为 EXE 与 ZIP 并公开发布，自动测试和公开下载校验通过。新窗口的透明、焦点、多屏和真实浏览器关闭场景尚待验收；具体记录见 RELEASE-0.2.0-alpha.5.md。


## 2026-10-28 自动恢复与界面更新

按用户确认方案实现 alpha.6，并按后续明确许可增加已授权页面活动信号。源码、测试及本地 EXE/ZIP 结果见 UPDATE-ALPHA6.md，完整源码见 UPDATE-ALPHA6-SOURCE.md。原生 GUI 验收遇到工具误启动已安装版的限制，不能声称通过；未操作或结束真实任务。


## 2026-10-28 alpha.6 公开预发布

按用户明确要求已发布 alpha.6 EXE 与 ZIP，六个资产均经无认证公开下载复算验证；稳定 Latest 保持 v0.1.1。详情见 UPDATE-ALPHA6.md；原生验收限制继续保留。


## 2026-10-28 v0.2.2 本地成品迭代

按用户明确确认的九项需求，完成紧凑灵动岛、布局居中、网址匹配三模式、提示音、四皮肤按钮悬浮、紧凑总览、详情编辑修复及两项图表修正。检查、成品摘要及原生工具验收限制见 UPDATE-0.2.2.md。保留用户真实任务与既有阶段记录；仅本地交付及源码同步，不自动公开 Release 或添加新功能。


## 2026-10-28 v0.2.2 总览紧凑布局修订

按用户新截图反馈，收窄筛选与工作节奏卡片、让应用筛选按钮紧邻状态选项、将图例移至日历下方，并移除趋势的灰色缩放条及其空白。保留用户正在运行的 Downloads 目录程序；仅重建项目目录成品。实现、验证与新摘要见 UPDATE-0.2.2-COMPACT.md，完整变更代码见 UPDATE-0.2.2-COMPACT-SOURCE.md。


## 2026-10-28 同一工作多个 URL

按用户需求把监测设置改为现有四类工作分组，每组可添加多个 URL、独立配置匹配模式、移除或调整归属。复用已有平面规则数组及 SQLite schema 8，旧配置无需重填。定向计时测试确认匹配站点来回切换保留同一记录和连续时长。检查与当前成品摘要见 UPDATE-0.2.2-MULTI-URL.md，完整变更代码见 UPDATE-0.2.2-MULTI-URL-SOURCE.md。保留正在运行的用户实例，不操作其真实任务。


## 2026-10-28 工作总览整体网格排版

按用户反馈，重新编排整个总览：统一筛选工具栏与四统计卡，宽屏趋势占左侧、类别及节奏上下占右侧，明细紧接图表；平板改为趋势整行及右侧两卡并排，手机单列。修正图表尺寸监听同步重绘警告，保留取消灰色缩放条及多 URL 功能。七种宽度与详情编辑浏览器回归、46 项 Node 测试通过；当前交付与兼容性见 UPDATE-0.2.2-LAYOUT.md，完整代码见 UPDATE-0.2.2-LAYOUT-SOURCE.md。


## 2026-10-28 v0.2.2 版本结束与正式发布

用户明确授权完成其余上传并结束该版本。已公开发布 WorkMemo v0.2.2，设为正式 Latest，tag 指向应用最终构建源码 20758c6830d002939303aeab00f9c8a679a0ff0e。安装版、完整 ZIP、第三方许可、SHA256SUMS 共四项上传摘要核对通过，并逐项无认证公开下载复算通过；旧版本资产不变。公开发布前仅把 ZIP 的使用说明改为公开下载地址，原程序、安装器及其余解压条目保持不变。

README 与使用说明更新为公开入口，完整回执、校验值与未完成的原生验收范围见 RELEASE-0.2.2.md。保留原有未跟踪规划文件，不上传 QA 数据、截图、凭据或用户数据库。本版本开发和发布收尾结束，不自动启动下一版本或添加功能。


## 2026-10-30 v0.2.5 成品发版授权与检查

用户明确要求「发版吧」，在现有 v0.2.5 第一阶段及反馈修正基础上进入正式发布收尾。版本统一为 0.2.5，补齐精确版本插件的官方 MIT 许可，并兼容当前用户 Run 项尚不存在时的自启注册。Node 49、Rust 147、Cargo 格式、生产构建、网页及连续补填、桌面／状态岛和现有设置隔离回归完成；中文 NSIS 与完整 15 文件 ZIP 的版本、内容、helper 和 SHA256 核对通过。旧桌面脚本依赖开发模块的限制、原生透明／点击／DPI／实际登录／安装卸载未全部复验的范围如实记录。

已公开 WorkMemo v0.2.5 为正式 Latest，Release ID 428941478，标签对应构建源码 80beca896ceafcbbfe2320707dd3c763e4bb98e7，main 与标签推送后标识核对一致。安装器、完整 ZIP、第三方许可与 SHA256SUMS 四项资产的服务端摘要一致，匿名公开下载复算全部通过；最终回执见 RELEASE-0.2.5.md。发布回执文档另行提交，标签保持在构建提交。保留用户真实任务、旧版本、历史阶段及原有未跟踪规划，不自动增加功能或进入下一版本。

## 2026-11-14 网页端审查

按用户要求安装 Modern Web Guidance，执行59项Node测试、生产构建、网页全量隔离回归与5组补录场景。确认表单字段语义、轮询播报和图表数值替代三项可访问性问题，并记录页面JS体积优化项。本轮只交付审查报告及隔离取证脚本，不改应用行为；问题、命令、完整文件清单和兼容性范围见 WEB-AUDIT-2026-11-14.md。等待确认修复范围，不操作真实任务或自动启动下一阶段。

## 2026-11-15 网页端全面审查与修改计划

按用户要求进一步审查，重新执行59项Node、181项Rust、生产构建、网页全量回归和5组补录场景。新增隔离取证确认挂起状态/筛选不一致、短工时柱图舍入、跨年标签、503误提示、刷新并发、编辑错误处于滚动区之外以及稳定颜色对比度问题，复核原有三项可访问性发现；另外记录弹层隔离、自定义趋势连续性和冷启长任务的验证边界。完整证据、文件清单、PowerShell命令及A/B/C/D分阶段修改计划见WEB-AUDIT-PLAN-2026-11-15.md。本轮仅增加审查脚本和文档，应用版本仍0.2.10，未改功能、数据库或发布资产；等待确认后才执行阶段A，不自动跨阶段。

## 2026-11-15 网页阶段A完成

按用户“执行A吧”授权修复F01–F05：未结束筛选与计时/暂停/挂起状态统一、保留旧working接口；柱图保留毫秒精度，趋势保留年月；区分授权/繁忙/业务/格式/超时/断线，查询effect取消旧读取并限制重复刷新。66项Node、182项Rust、生产构建、完整网页回归、5组补录、5组待补填及5组阶段A专项通过。没有迁移数据库、操作真实任务、增加运行依赖或重建/替换公开0.2.10安装包。完整路径、代码、PowerShell命令和验收边界见WEB-PHASE-A.md及WEB-PHASE-A-SOURCE.md；阶段B/C/D等待确认，不自动继续。


## 2026-11-16 网页阶段B完成

按用户“继续下一阶段”授权执行 F06–F09、R01：关联表单标签/必填/错误、失败聚焦可见字段或摘要，备注按现有 Unicode 规则校验；加深辅助文字，支持键盘 outline 与强制颜色；后台更新时间静默，主动刷新/恢复使用独立播报；趋势/日历增加同源语义数据表，统一弹层 inert、Tab 边界及触发点恢复。67项Node、182项Rust、生产构建、完整网页、5组补录、5组待补填、5组历史布局、5组A专项及7组B专项通过。6个axe状态无报告违规，仍有incomplete；30个实际背景文字样本最低4.67:1。真实Narrator、Windows原生及整体验收未通过本轮替代。完整路径、源码、命令和限制见WEB-PHASE-B.md、WEB-PHASE-B-SOURCE.md。版本仍0.2.10/schema12，不操作真实数据或发布资产；C/D等待确认，不自动进入。


## 2026-11-16 网页阶段C完成

按用户“继续下一阶段”授权执行R02/R03。Rust复现自定义趋势漏日期、按记录跨度误选粒度后，统一按所选本地日历范围补零：短范围最多121日点，长范围月桶、极大范围合并连续月份并限制1200点；无已结束记录保持空趋势，真实零值仍保留记录数。前端标明合并宽度，图表与数据表同源，Node/Rust共享8场景契约。入口改按网页/主窗/设置/状态岛动态加载，补齐设置窗显式样式依赖，不改Vite、不加运行依赖/遥测。最终3次冷启JS从1,948,678降至1,854,810字节（约4.82%），最大长任务中位数689→475ms；仍有长任务，实验室结果不等同现场INP。69项Node、185项Rust、格式、生产构建、C的7组专项、既有网页/补录/待补填/A/B/布局及桌面任务/状态岛隔离回归通过。完整路径、源码、测量和限制见WEB-PHASE-C.md、WEB-PHASE-C-SOURCE.md。0.2.10/schema12不变，不操作真实数据或公开资产；D及原生/读屏验收等待确认，不自动继续。


## 2026-11-16 网页阶段D自动验收与候选交付

按用户“继续下阶段”进入D；用户要求不用computer-use、自行看效果，此后未用其控制窗口。69项Node、185项Rust、格式、生产构建、网页/补录/待补填/A/B/C/布局/桌面任务/状态岛隔离回归通过；实际Chromium125/150/200%缩放、错误可见/嵌套焦点、200%强制颜色通过，Edge6状态axe无报告违规但仍有incomplete。Tauri release/NSIS/ZIP构建和版本/x64/15文件/主程序字节/profile/扩展/SHA256核对通过，候选位于artifacts/web-phase-d/candidate-0.2.10，原本地0.2.10资产校验保持一致。新增独立验收标识并实际启动，用户确认显示/透明效果/窗口操作“正常”；真实Rust网页服务的授权、内嵌资源和只读查询通过。C提交已恢复GitHub同步。

D不能整体标为全部通过：真实Narrator、系统DPI、原生四皮肤逐项、扩展真实联动、安装卸载和实际登录仍待检查。版本0.2.10/schema12不变，不操作真实任务，不覆盖公开资产或移动标签；发布目标按已确认计划另行确认。完整文件、源码、PowerShell命令、候选校验值和人工回执见WEB-PHASE-D.md、WEB-PHASE-D-SOURCE.md。不自动新增功能或继续其他开发阶段。


## 2026-11-16 v0.2.11 发布授权与构建

用户明确选择发布新版本并指定0.2.11，已统一应用、锁文件、Tauri及扩展版本，更新下载入口和使用说明。69项Node、185项Rust、格式、Tauri release/NSIS/15文件ZIP、网页/补录/待补填/A/B/C及实际125/150/200%浏览器缩放回归完成；原0.2.10本地资产核验保持一致。公开发布将使用新v0.2.11标签，不移动旧标签。真实Narrator、系统DPI、扩展联动和安装卸载仍未全部复验；用户当前0.2.10独立预览保持运行，不为新版本构建强制关闭。最终公开状态、构建提交及匿名下载校验见RELEASE-0.2.11.md；本条构建记录不等同于已经公开发布。


## 2026-11-16 v0.2.11 正式发布完成

已公开WorkMemo v0.2.11为非草稿、非预发布的正式Latest，Release ID 446559551，新标签与构建提交为5858d9312c7af2d1bc20e50a5bfc9f92ddab2e04。四项资产服务器大小/摘要及无认证公开下载复算全部通过；公开页面可匿名访问，原v0.2.10四项资产ID/大小/摘要和标签目标保持不变。主程序/扩展0.2.11，schema12，ZIP15文件；用户正在查看的独立0.2.10预览保持运行，未为发版结束真实任务。回执、完整文件/代码、命令和验收限制见RELEASE-0.2.11.md及RELEASE-0.2.11-SOURCE.md。回执另行提交，v0.2.11标签保持在构建提交；发布收尾结束，不自动新增功能或启动下一版本。
````

## E:\WorkMemo\scripts\verify-native-dashboard.mjs

```javascript
// Read-only smoke check of the isolated Tauri server and its embedded web assets.
// Never print the endpoint token, metadata, work records, or browser storage.
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const expectedVersion=process.env.WORKMEMO_NATIVE_VERSION||JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8')).version;
const path=process.env.WORKMEMO_NATIVE_ENDPOINT;
assert.ok(path,'Set WORKMEMO_NATIVE_ENDPOINT to the isolated preview endpoint file');
assert.match(path,/com\.workmemo\.test\.webacceptance[\\/]dashboard\.endpoint\.json$/);
const endpoint=JSON.parse(await readFile(path,'utf8'));
const origin=new URL(endpoint.origin);assert.equal(origin.protocol,'http:');assert.equal(origin.hostname,'127.0.0.1');assert.ok(origin.port);
const {chromium}=await import(process.env.WORKMEMO_PLAYWRIGHT?pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href:'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const output=new URL('../artifacts/web-phase-d/',import.meta.url);await mkdir(output,{recursive:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
 const errors=[],requests=[];page.on('pageerror',()=>errors.push('Page runtime error'));
 await page.route('**/*',route=>{
  const url=new URL(route.request().url());
  if(url.origin!==origin.origin)return route.abort();
  if(url.pathname.startsWith('/api/')&&!['/api/meta','/api/query'].includes(url.pathname))throw new Error('Unexpected write endpoint');
  requests.push(url.pathname);return route.continue();
 });
 const denied=await context.request.get(origin.origin+'/api/meta');assert.equal(denied.status(),403);
 const meta=await context.request.get(origin.origin+'/api/meta',{headers:{Authorization:'Bearer '+endpoint.token}});
 assert.equal(meta.status(),200);const version=(await meta.json()).version;assert.equal(version,expectedVersion);
 const response=await page.goto(origin.origin+'/dashboard#token='+endpoint.token);
 assert.equal(response.status(),200);assert.match(response.headers()['content-security-policy'],/script-src 'self'/);
 await page.getByRole('heading',{name:'工作总览',exact:true}).waitFor();
 await page.waitForFunction(()=>!!document.querySelector('.dc-sync')?.textContent.includes('更新于'));
 assert.equal(await page.locator('.dc-page').count(),1);assert.deepEqual(errors,[]);
 assert.ok(requests.includes('/api/query'));assert.ok(requests.some(p=>p.endsWith('.js')));
 const result={authorizationEnforced:true,version,embeddedPageLoaded:true,requests:[...new Set(requests)],errors,readOnly:true};
 await writeFile(new URL('native-http-result.json',output),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}finally{await browser.close();}
```

## E:\WorkMemo\scripts\verify-windows-candidate.ps1

```powershell
[CmdletBinding()]
param([string]$Directory,[string]$PreserveDirectory)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$taskRoot=Split-Path -Parent $PSScriptRoot
$version=(Get-Content (Join-Path $taskRoot 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json).version
if([string]::IsNullOrWhiteSpace($Directory)) { $Directory="artifacts/$version" }
$candidate=[IO.Path]::GetFullPath($(if ([IO.Path]::IsPathRooted($Directory)) { $Directory } else { Join-Path $taskRoot $Directory }))
$setupName="WorkMemo_${version}_x64-setup.exe"
$zipName="WorkMemo_${version}_windows_x64.zip"
$expected=@($setupName,$zipName,'THIRD-PARTY-LICENSES.txt')
function Verify-Checksums([string]$folder,[string[]]$allowed) {
    $seen=@()
    foreach($line in Get-Content -LiteralPath (Join-Path $folder 'SHA256SUMS.txt')) {
        if($line -notmatch '^([a-f0-9]{64})  ([^/\\]+)$') { throw 'Invalid checksum format' }
        $expectedHash=$Matches[1];$name=$Matches[2]
        if($name -notin $allowed -or $name -in $seen) { throw 'Unexpected or duplicate checksum entry' }
        $seen+=$name
        if((Get-FileHash -LiteralPath (Join-Path $folder $name) -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expectedHash) { throw "Checksum mismatch: $name" }
    }
    if($seen.Count -ne $allowed.Count) { throw 'Incomplete checksum manifest' }
}
Verify-Checksums $candidate $expected
$release=Join-Path $taskRoot 'src-tauri/target/release/workmemo.exe'
$info=[Diagnostics.FileVersionInfo]::GetVersionInfo($release)
if($info.ProductVersion -ne $version -or $info.FileVersion -notmatch ('^'+[regex]::Escape($version)+'(?:\.0)?$')) { throw 'Executable version mismatch' }
$reader=[IO.BinaryReader]::new([IO.File]::OpenRead($release))
try {
    if($reader.ReadUInt16() -ne 0x5a4d) { throw 'Invalid DOS signature' }
    $reader.BaseStream.Position=0x3c;$pe=$reader.ReadUInt32();$reader.BaseStream.Position=$pe
    if($reader.ReadUInt32() -ne 0x4550 -or $reader.ReadUInt16() -ne 0x8664) { throw 'Expected Windows x64 executable' }
} finally { $reader.Dispose() }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive=[IO.Compression.ZipFile]::OpenRead((Join-Path $candidate $zipName))
try {
    $entries=@('WorkMemo/workmemo.exe','WorkMemo/使用说明.md','WorkMemo/THIRD-PARTY-LICENSES.txt','WorkMemo/workmemo-browser.exe','WorkMemo/Register-Browser.cmd','WorkMemo/Register-Browser.ps1','WorkMemo/workmemo-browser.profile.json')
    foreach($resource in (Get-Content (Join-Path $PSScriptRoot 'browser-resource-files.json') -Raw -Encoding UTF8 | ConvertFrom-Json)) { $entries+='WorkMemo/extension/'+$resource }
    if(Compare-Object ($entries|Sort-Object) (@($archive.Entries.FullName)|Sort-Object)) { throw 'Unexpected ZIP entries' }
    $stream=$archive.GetEntry('WorkMemo/workmemo.exe').Open();$sha=[Security.Cryptography.SHA256]::Create()
    try { $zipHash=[BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-','').ToLowerInvariant() } finally { $stream.Dispose();$sha.Dispose() }
    if($zipHash -ne (Get-FileHash $release -Algorithm SHA256).Hash.ToLowerInvariant()) { throw 'ZIP executable differs from build output' }
    foreach($entry in $archive.Entries | Where-Object { $_.FullName -eq 'WorkMemo/workmemo-browser.profile.json' -or $_.FullName -eq 'WorkMemo/extension/manifest.json' }) {
        $text=[IO.StreamReader]::new($entry.Open())
        try { $data=$text.ReadToEnd()|ConvertFrom-Json } finally { $text.Dispose() }
        if($entry.FullName.EndsWith('profile.json')) { if($data.identifier -ne 'com.workmemo.desktop') { throw 'Browser profile mismatch' } }
        elseif($data.version_name -ne $version) { throw 'Extension version mismatch' }
    }
    foreach($entry in $archive.Entries) {
        $relative=$entry.FullName.Substring('WorkMemo/'.Length)
        $source=switch($relative) {
            'workmemo.exe' { $release }
            '使用说明.md' { Join-Path $taskRoot 'docs/USER-GUIDE.md' }
            'THIRD-PARTY-LICENSES.txt' { Join-Path $candidate 'THIRD-PARTY-LICENSES.txt' }
            default { Join-Path (Join-Path $taskRoot 'src-tauri/target/browser-resources') $relative }
        }
        $stream=$entry.Open();$sha=[Security.Cryptography.SHA256]::Create()
        try { $hash=[BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-','').ToLowerInvariant() } finally { $stream.Dispose();$sha.Dispose() }
        if($hash -ne (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash.ToLowerInvariant()) { throw "ZIP payload differs from source: $relative" }
    }
    $zipCount=$archive.Entries.Count
} finally { $archive.Dispose() }
$originalPreserved=$null
$oldVersion=$null
if(-not [string]::IsNullOrWhiteSpace($PreserveDirectory)) {
    $original=[IO.Path]::GetFullPath($(if ([IO.Path]::IsPathRooted($PreserveDirectory)) { $PreserveDirectory } else { Join-Path $taskRoot $PreserveDirectory }))
    $oldVersion=Split-Path $original -Leaf
    if($oldVersion -notmatch '^\d+\.\d+\.\d+$') { throw 'Preserved release directory must end with its version' }
    Verify-Checksums $original @("WorkMemo_${oldVersion}_x64-setup.exe","WorkMemo_${oldVersion}_windows_x64.zip",'THIRD-PARTY-LICENSES.txt')
    $checkpoint=Join-Path $taskRoot 'artifacts/phase-d-published-local-before.json'
    if($oldVersion -eq '0.2.10' -and (Test-Path $checkpoint)) {
        $before=Get-Content $checkpoint -Raw -Encoding UTF8|ConvertFrom-Json
        if((Get-FileHash (Join-Path $original 'SHA256SUMS.txt') -Algorithm SHA256).Hash -ne $before.Hash) { throw 'Original checksum file changed' }
    }
    $originalPreserved=$true
}
$files=foreach($name in @($setupName,$zipName,'THIRD-PARTY-LICENSES.txt','SHA256SUMS.txt')) {
    $file=Get-Item -LiteralPath (Join-Path $candidate $name)
    @{name=$name;bytes=$file.Length;sha256=(Get-FileHash $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()}
}
$receipt=@{version=$version;zip_entries=$zipCount;architecture='x64';checksums_verified=$true;original_local_release_preserved=$originalPreserved;preserved_version=$oldVersion;files=@($files);published=$false}
$receipt|ConvertTo-Json -Depth 5|Set-Content (Join-Path $taskRoot ('artifacts/'+$version+'/package-verification.json')) -Encoding utf8
$receipt|ConvertTo-Json -Depth 5
```

## E:\WorkMemo\scripts\publish-release.py

```python
"""Explicit GitHub release steps for noharass/WorkMemo; never deletes assets or tags.

Credentials stay in memory via the repository's existing Git credential helper.
Metadata GETs can authenticate when the anonymous API quota is exhausted.
Public release pages and artifact downloads always use a separate anonymous client.
"""
import argparse
import hashlib
import json
import pathlib
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
REPO = 'noharass/WorkMemo'
API = 'https://api.github.com/repos/' + REPO


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None  # Never forward Authorization to a redirect destination.


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('step', choices=['inspect', 'prepare', 'publish', 'verify'])
    parser.add_argument('--commit')
    parser.add_argument('--notes', type=pathlib.Path)
    parser.add_argument('--previous', default='v0.2.10')
    parser.add_argument('--proxy')
    args = parser.parse_args()
    version = json.loads((ROOT / 'package.json').read_text(encoding='utf-8'))['version']
    if not re.fullmatch(r'\d+\.\d+\.\d+', version):
        raise RuntimeError('Expected a stable release version')
    tag = 'v' + version
    output = ROOT / 'artifacts' / version
    output.mkdir(parents=True, exist_ok=True)
    if args.proxy and urllib.parse.urlparse(args.proxy).hostname not in ['127.0.0.1', 'localhost']:
        raise RuntimeError('Only an explicit local proxy is supported')
    proxies = {'http': args.proxy, 'https': args.proxy} if args.proxy else {}
    public = urllib.request.build_opener(urllib.request.ProxyHandler(proxies))
    private = urllib.request.build_opener(urllib.request.ProxyHandler(proxies), NoRedirect())
    token = None
    if args.step in ['prepare', 'publish']:
        if not args.commit or not re.fullmatch(r'[a-f0-9]{40}', args.commit):
            raise RuntimeError('Supply the exact verified build commit')

    def get_token():
        nonlocal token
        if token:
            return token
        credential = subprocess.run(['git', 'credential', 'fill'], cwd=ROOT,
                                    input='protocol=https\nhost=github.com\n\n',
                                    capture_output=True, text=True, timeout=30)
        if credential.returncode:
            raise RuntimeError('Existing Git credential helper did not return credentials')
        values = dict(line.split('=', 1) for line in credential.stdout.splitlines() if '=' in line)
        token = values.get('password')
        if not token:
            raise RuntimeError('Existing Git credential helper returned no token')
        return token

    def request(url, method='GET', data=None, authenticated=False, raw=False):
        host = urllib.parse.urlparse(url).hostname
        if authenticated and host not in ['api.github.com', 'uploads.github.com']:
            raise RuntimeError('Refusing to transmit credentials to another host')
        headers = {'User-Agent': 'WorkMemo-release', 'Accept': 'application/vnd.github+json',
                   'Cache-Control': 'no-cache', 'X-GitHub-Api-Version': '2022-11-28'}
        if authenticated:
            headers['Authorization'] = 'Bearer ' + get_token()
        if data is not None:
            headers['Content-Type'] = 'application/octet-stream' if raw else 'application/json'
            if not raw:
                data = json.dumps(data, ensure_ascii=False).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        for attempt in range(3):
            try:
                with (private if authenticated else public).open(req, timeout=45) as response:
                    body = response.read()
                    return body if raw else json.loads(body)
            except urllib.error.HTTPError:
                raise
            except (urllib.error.URLError, TimeoutError):
                if method != 'GET' or attempt == 2:
                    raise
                print('Retrying metadata GET after a network error', flush=True)
                time.sleep(attempt + 1)

    def api(path, method='GET', data=None, authenticated=False):
        try:
            return request(API + '/' + path, method, data, authenticated)
        except urllib.error.HTTPError as error:
            if method == 'GET' and not authenticated and error.code == 403 and error.headers.get('X-RateLimit-Remaining') == '0':
                return request(API + '/' + path, method, data, True)
            raise

    def save(name, value):
        (output / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    def summary(release):
        return {key: release.get(key) for key in ['id', 'tag_name', 'html_url', 'draft', 'prerelease', 'published_at']}

    def find_release(authenticated=False):
        try:
            return api('releases/tags/' + tag, authenticated=authenticated)
        except urllib.error.HTTPError as error:
            if error.code != 404:
                raise
        if authenticated:
            return next((r for r in api('releases?per_page=100', authenticated=True) if r['tag_name'] == tag), None)
        return None

    def old_summary():
        release = api('releases/tags/' + args.previous)
        return {'id': release['id'], 'tag_name': release['tag_name'],
                'assets': [{key: a.get(key) for key in ['id', 'name', 'size', 'digest']} for a in release['assets']],
                'ref': api('git/ref/tags/' + args.previous)['object']}

    if args.step == 'inspect':
        old = old_summary()
        checkpoint = output / 'previous-release.json'
        if checkpoint.exists() and json.loads(checkpoint.read_text(encoding='utf-8')) != old:
            raise RuntimeError('Previous release changed since the recorded inspection')
        save('previous-release.json', old)
        existing = find_release()
        print(json.dumps({'latest': api('releases/latest')['tag_name'], 'previous_assets': old['assets'],
                          'existing_new_release': summary(existing) if existing else None}, ensure_ascii=False))
        return

    names = [f'WorkMemo_{version}_x64-setup.exe', f'WorkMemo_{version}_windows_x64.zip',
             'THIRD-PARTY-LICENSES.txt', 'SHA256SUMS.txt']
    files = {name: (output / name).read_bytes() for name in names}
    hashes = {name: hashlib.sha256(data).hexdigest() for name, data in files.items()}
    lines = files['SHA256SUMS.txt'].decode('utf-8-sig').splitlines()
    if len(lines) != 3:
        raise RuntimeError('Unexpected checksum manifest')
    for line in lines:
        digest, name = line.split('  ', 1)
        if name not in names[:3] or hashes[name] != digest:
            raise RuntimeError('Local asset checksum mismatch')

    def check_assets(release):
        assets = {a['name']: a for a in release['assets']}
        if set(assets) != set(names):
            raise RuntimeError('Release does not have exactly the expected four assets')
        for name, asset in assets.items():
            if asset['size'] != len(files[name]) or asset.get('digest') != 'sha256:' + hashes[name] or asset['state'] != 'uploaded':
                raise RuntimeError('Server asset differs from verified local file: ' + name)

    if args.step in ['prepare', 'publish']:
        ref = api('git/ref/tags/' + tag, authenticated=True)['object']
        if ref['type'] == 'tag':
            ref = api('git/tags/' + ref['sha'], authenticated=True)['object']
        if ref['type'] != 'commit' or ref['sha'] != args.commit:
            raise RuntimeError('New tag does not match the verified build commit')
        marker = 'Build source: ' + args.commit
        release = find_release(True)
        if release and marker not in (release.get('body') or ''):
            raise RuntimeError('Existing release belongs to a different build; refusing to modify it')
        if args.step == 'prepare':
            if not args.notes:
                raise RuntimeError('Supply the reviewed UTF-8 release notes')
            body = args.notes.read_text(encoding='utf-8') + '\n\n' + marker
            if release is None:
                release = api('releases', 'POST', {'tag_name': tag, 'target_commitish': args.commit,
                              'name': 'WorkMemo ' + tag, 'body': body, 'draft': True,
                              'prerelease': False, 'make_latest': 'false'}, True)
            if not release['draft']:
                raise RuntimeError('Release is already public; use verify instead')
            assets = {a['name']: a for a in release['assets']}
            upload = release['upload_url'].split('{', 1)[0]
            if not upload.startswith(f'https://uploads.github.com/repos/{REPO}/releases/{release["id"]}/assets'):
                raise RuntimeError('Unexpected upload destination')
            for name in names:
                if name in assets:
                    a = assets[name]
                    if a['size'] != len(files[name]) or a.get('digest') != 'sha256:' + hashes[name]:
                        raise RuntimeError('Existing draft asset differs; no automatic deletion: ' + name)
                else:
                    request(upload + '?' + urllib.parse.urlencode({'name': name}), 'POST', files[name], True, True)
                    print('Uploaded ' + name, flush=True)
            release = api('releases/' + str(release['id']), authenticated=True)
            check_assets(release)
            save('prepared-release.json', summary(release))
            print(json.dumps(summary(release)))
            return
        if release is None:
            raise RuntimeError('No prepared release exists')
        check_assets(release)
        if release['draft']:
            release = api('releases/' + str(release['id']), 'PATCH',
                          {'draft': False, 'prerelease': False, 'make_latest': 'true'}, True)
        save('published-release.json', summary(release))
        print(json.dumps(summary(release)))
        return

    release = find_release()
    if release is None or release['draft'] or release['prerelease']:
        raise RuntimeError('Stable public release not found')
    check_assets(release)
    latest = api('releases/latest')['tag_name']
    if latest != tag:
        raise RuntimeError('New release is not public Latest')
    previous = json.loads((output / 'previous-release.json').read_text(encoding='utf-8'))
    if old_summary() != previous:
        raise RuntimeError('Previous release assets/tag changed')
    with public.open(urllib.request.Request(release['html_url'], headers={'User-Agent': 'WorkMemo-public-verification'}), timeout=90) as response:
        if response.status != 200 or response.geturl() != release['html_url']:
            raise RuntimeError('Release page is not anonymously accessible')
        response.read()
    downloads = output / 'public-verified'
    downloads.mkdir(exist_ok=True)
    receipt = {**summary(release), 'latest': latest, 'previous_release_preserved': True, 'assets': []}
    for asset in release['assets']:
        name = asset['name']
        url = asset['browser_download_url']
        if not url.startswith(f'https://github.com/{REPO}/releases/download/{tag}/'):
            raise RuntimeError('Unexpected public download URL')
        req = urllib.request.Request(url, headers={'User-Agent': 'WorkMemo-public-verification'})
        with public.open(req, timeout=90) as response:
            downloaded = response.read()
        if len(downloaded) != len(files[name]) or hashlib.sha256(downloaded).hexdigest() != hashes[name]:
            raise RuntimeError('Anonymous download differs from local asset: ' + name)
        (downloads / name).write_bytes(downloaded)
        receipt['assets'].append({'name': name, 'bytes': len(downloaded), 'sha256': hashes[name],
                                  'public_verified': True, 'url': url})
        print('Anonymous SHA256 verified: ' + name, flush=True)
    save('public-receipt.json', receipt)
    print(json.dumps(receipt, ensure_ascii=False))


if __name__ == '__main__':
    try:
        main()
    except urllib.error.HTTPError as error:
        print('GitHub HTTP error: ' + str(error.code), file=sys.stderr)
        sys.exit(1)
    except (urllib.error.URLError, TimeoutError) as error:
        reason = getattr(error, 'reason', error)
        print('GitHub network request failed (' + type(reason).__name__ + '); no credentials were logged', file=sys.stderr)
        sys.exit(1)
    except (RuntimeError, ValueError, OSError, subprocess.SubprocessError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
```

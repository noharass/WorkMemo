# v0.2.5 第一阶段完整程序源码

日期：2026-10-30。以下为本阶段全部程序、配置、测试与依赖锁文件全文；没有使用省略号替代文件内容。阶段记录和图片完整保存在对应项目路径，文件状态及完整仓库清单见 UPDATE-0.2.5-PHASE-1-FILES.md。

## E:\WorkMemo\package-lock.json

~~~~~~json
{
  "name": "workmemo",
  "version": "0.2.4",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "workmemo",
      "version": "0.2.4",
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
~~~~~~

## E:\WorkMemo\package.json

~~~~~~json
{
  "name": "workmemo",
  "private": true,
  "version": "0.2.4",
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
~~~~~~

## E:\WorkMemo\scripts\browser-registration-test.nsi

~~~~~~nsis
Unicode true
RequestExecutionLevel user
SilentInstall silent
SilentUnInstall silent
Name "WorkMemo isolated registration test"
OutFile "${TEST_SETUP}"
InstallDir "${TEST_INSTALL}"
!define WM_BRIDGE_REGISTRY_ROOT "${TEST_REGISTRY}"
!define WM_BRIDGE_DATA_ROOT "${TEST_DATA}"
!define WM_STARTUP_REGISTRY_ROOT "${TEST_STARTUP_REGISTRY}"
!include "${TEST_HOOK}"
; Tauri includes hooks before BUNDLEID is defined, too.
!define BUNDLEID "${TEST_PROFILE}"
Section
  SetOutPath "$INSTDIR"
  File /oname=workmemo-browser.exe "${TEST_HOST}"
  File /oname=workmemo-browser.profile.json "${TEST_PROFILEFILE}"
  !insertmacro NSIS_HOOK_POSTINSTALL
  WriteUninstaller "$INSTDIR\uninstall.exe"
SectionEnd
Section Uninstall
  Delete "$INSTDIR\workmemo-browser.exe"
  Delete "$INSTDIR\workmemo-browser.profile.json"
  Delete "$INSTDIR\uninstall.exe"
  RMDir "$INSTDIR"
  !insertmacro NSIS_HOOK_POSTUNINSTALL
SectionEnd
~~~~~~

## E:\WorkMemo\scripts\test-browser-registration.ps1

~~~~~~powershell
[CmdletBinding()]
param([string]$HostBinary)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
if (-not $HostBinary) { $HostBinary = Join-Path $taskRoot 'src-tauri\target\debug\workmemo-browser.exe' }
$taskHost = (Resolve-Path -LiteralPath $HostBinary).ProviderPath
function Run-Process([string]$Path, [string]$Arguments) {
    $taskInfo = New-Object Diagnostics.ProcessStartInfo
    $taskInfo.FileName = $Path; $taskInfo.Arguments = $Arguments
    $taskInfo.UseShellExecute = $false; $taskInfo.CreateNoWindow = $true
    $taskInfo.RedirectStandardOutput = $true; $taskInfo.RedirectStandardError = $true
    $taskProcess = New-Object Diagnostics.Process
    $taskProcess.StartInfo = $taskInfo
    [void]$taskProcess.Start()
    $taskOutput = $taskProcess.StandardOutput.ReadToEnd()
    $taskError = $taskProcess.StandardError.ReadToEnd()
    $taskProcess.WaitForExit()
    $taskCode = $taskProcess.ExitCode; $taskProcess.Dispose()
    return @{Code=$taskCode;Output=$taskOutput;Error=$taskError}
}
$taskProbe = Run-Process $taskHost '--bridge-info'
if ($taskProbe.Code -ne 0 -or -not ($taskProbe.Output | ConvertFrom-Json).test_overrides) { throw 'Tests require a DEBUG helper with private-namespace overrides. Never test registration using a release helper.' }
$taskNonce = [Guid]::NewGuid().ToString('N')
$taskDirectory = Join-Path $taskRoot ('artifacts\browser-registration-tests\' + $taskNonce)
[IO.Directory]::CreateDirectory($taskDirectory) | Out-Null
$taskRegistry = 'Software\WorkMemo\RegistrationTests\' + $taskNonce
$taskData = Join-Path $taskDirectory '用户数据'
$taskNsis = Join-Path $env:LOCALAPPDATA 'tauri\NSIS\makensis.exe'
$taskUtf8 = New-Object Text.UTF8Encoding($false)
function Read-Key([string]$Path, [string]$Name = '') {
    $taskKey = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey($Path)
    if ($null -eq $taskKey) { return $null }
    try { return $taskKey.GetValue($Name) } finally { $taskKey.Dispose() }
}
$taskStartupRegistry = $taskRegistry + '\Startup'
$taskRealStartupPath = 'Software\Microsoft\Windows\CurrentVersion\Run'
$taskRealStartupBefore = Read-Key $taskRealStartupPath 'WorkMemo'
$taskRealBefore = @((Read-Key 'Software\Google\Chrome\NativeMessagingHosts\com.workmemo.browser_bridge'),(Read-Key 'Software\Google\Chrome\NativeMessagingHosts\com.workmemo.browser_bridge_test')) | ConvertTo-Json -Compress
$taskOldRegistry = $env:WORKMEMO_TEST_REGISTRY_ROOT; $taskOldData = $env:WORKMEMO_TEST_DATA_ROOT
try {
    $env:WORKMEMO_TEST_REGISTRY_ROOT = $taskRegistry; $env:WORKMEMO_TEST_DATA_ROOT = $taskData
    foreach ($taskProfile in @('com.workmemo.desktop','com.workmemo.test.registration')) {
        $taskHostName = if ($taskProfile -eq 'com.workmemo.desktop') { 'com.workmemo.browser_bridge' } else { 'com.workmemo.browser_bridge_test' }
        $taskKeyPath = $taskRegistry + '\' + $taskHostName
        $taskInstall = Join-Path $taskDirectory ($taskProfile + '\中文安装 & !')
        $taskProfileFile = Join-Path $taskDirectory ($taskProfile + '.json')
        [IO.File]::WriteAllText($taskProfileFile, (@{identifier=$taskProfile} | ConvertTo-Json -Compress), $taskUtf8)
        $taskSetup = Join-Path $taskDirectory ($taskProfile + '-setup.exe')
        $taskValues = @{TEST_SETUP=$taskSetup;TEST_INSTALL=$taskInstall;TEST_REGISTRY=$taskRegistry;TEST_STARTUP_REGISTRY=$taskStartupRegistry;TEST_DATA=$taskData;TEST_HOOK=(Join-Path $taskRoot 'src-tauri\installer\browser-bridge.nsh');TEST_PROFILE=$taskProfile;TEST_HOST=$taskHost;TEST_PROFILEFILE=$taskProfileFile}
        $taskDefines = @($taskValues.GetEnumerator() | ForEach-Object { '/D' + $_.Key + '=' + $_.Value })
        & $taskNsis /V2 /INPUTCHARSET UTF8 @taskDefines (Join-Path $PSScriptRoot 'browser-registration-test.nsi')
        if ($LASTEXITCODE -ne 0) { throw 'NSIS harness compilation failed.' }
        $taskResult = Run-Process $taskSetup '/S'
        if ($taskResult.Code -ne 0) { throw 'Silent install failed.' }
        $taskManifestPath = Join-Path $taskData ($taskProfile + '\browser-host.json')
        if ((Read-Key $taskKeyPath) -ne $taskManifestPath) { throw 'Installer registered wrong manifest.' }
        $taskManifest = Get-Content -LiteralPath $taskManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($taskManifest.path -ne (Join-Path $taskInstall 'workmemo-browser.exe') -or $taskManifest.allowed_origins.Count -ne 1) { throw 'Invalid absolute helper path or origin.' }
        $taskPortable = Join-Path $taskDirectory ($taskProfile + '\移动后 ZIP & !')
        [IO.Directory]::CreateDirectory($taskPortable) | Out-Null
        Copy-Item -LiteralPath $taskHost -Destination (Join-Path $taskPortable 'workmemo-browser.exe')
        Copy-Item -LiteralPath $taskProfileFile -Destination (Join-Path $taskPortable 'workmemo-browser.profile.json')
        $taskCmd = Join-Path $taskPortable 'Register-Browser.cmd'
        Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'register-preview-browser.cmd') -Destination $taskCmd
        $taskResult = Run-Process $env:ComSpec ('/d /s /c ""' + $taskCmd + '" /repair"')
        if ($taskResult.Code -ne 0) { throw ('CMD repair failed: ' + $taskResult.Error) }
        $taskNewStartup = '"' + (Join-Path $taskPortable 'workmemo.exe') + '" --autostart'
        $taskStartupKey = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey($taskStartupRegistry)
        try { $taskStartupKey.SetValue('WorkMemo', $taskNewStartup) } finally { $taskStartupKey.Dispose() }
        $taskResult = Run-Process (Join-Path $taskInstall 'uninstall.exe') '/S'
        Start-Sleep -Milliseconds 600
        if ($taskResult.Code -ne 0 -or (Read-Key $taskKeyPath) -ne $taskManifestPath) { throw 'Old uninstaller removed newer ZIP registration.' }
        if ((Read-Key $taskStartupRegistry 'WorkMemo') -ne $taskNewStartup) { throw 'Old uninstaller removed newer startup ownership.' }
        $taskManifest = Get-Content -LiteralPath $taskManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($taskManifest.path -ne (Join-Path $taskPortable 'workmemo-browser.exe')) { throw 'ZIP relocation not repaired.' }
        $taskResult = Run-Process (Join-Path $taskPortable 'workmemo-browser.exe') '--unregister'
        if ($taskResult.Code -ne 0 -or (Read-Key $taskKeyPath) -or (Test-Path -LiteralPath $taskManifestPath)) { throw 'CLI owned unregister failed.' }
        $taskResult = Run-Process $taskSetup '/S'
        $taskOwnedStartup = '"' + (Join-Path $taskInstall 'workmemo.exe') + '" --autostart'
        $taskStartupKey = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey($taskStartupRegistry)
        try { $taskStartupKey.SetValue('WorkMemo', $taskOwnedStartup) } finally { $taskStartupKey.Dispose() }
        $taskResult = Run-Process (Join-Path $taskInstall 'uninstall.exe') '/S'
        Start-Sleep -Milliseconds 600
        if ($taskResult.Code -ne 0 -or (Read-Key $taskKeyPath) -or (Test-Path -LiteralPath $taskManifestPath)) { throw 'Owned installer uninstall failed.' }
        if (Read-Key $taskStartupRegistry 'WorkMemo') { throw 'Owned startup entry was not removed.' }
        Write-Output ('PASS: ' + $taskProfile + ' install / ZIP-CMD repair / relocation / old uninstall protection / owned uninstall.')
    }
} finally {
    $env:WORKMEMO_TEST_REGISTRY_ROOT = $taskOldRegistry; $env:WORKMEMO_TEST_DATA_ROOT = $taskOldData
}
$taskRealAfter = @((Read-Key 'Software\Google\Chrome\NativeMessagingHosts\com.workmemo.browser_bridge'),(Read-Key 'Software\Google\Chrome\NativeMessagingHosts\com.workmemo.browser_bridge_test')) | ConvertTo-Json -Compress
if ($taskRealAfter -ne $taskRealBefore) { throw 'Real Chrome host registration was modified.' }
if ((Read-Key $taskRealStartupPath 'WorkMemo') -ne $taskRealStartupBefore) { throw 'Real startup registration was modified.' }
[Microsoft.Win32.Registry]::CurrentUser.DeleteSubKeyTree($taskRegistry,$false)
Write-Output 'PASS: actual Chrome registrations unchanged. No work database was opened.'
Write-Output 'PASS: actual startup registration unchanged; private owned/newer startup cleanup verified.'
Write-Output ('Evidence: ' + $taskDirectory)
~~~~~~

## E:\WorkMemo\scripts\verify-titlebar.mjs

~~~~~~javascript
// Isolated desktop IPC: never sends commands to a real WorkMemo process or database.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const output = new URL('../artifacts/titlebar/qa/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 260 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(() => {
  window.isTauri = true; window.headerCalls = [];
  const params = new URLSearchParams(location.search);
  const density = params.get('density') ?? 'compact', state = params.get('state') ?? 'normal';
  const keys = ['评测', '质检', '开发', '文档'];
  const names = Object.fromEntries(keys.map(key => [key, key]));
  if (state === 'long') names['开发'] = '这是二十个字的超长工作名称用于布局验证';
  const record = { id: 7, category: '开发', quantity: null, remark: '隔离布局测试，不写入真实记录', start_time: Date.now() - 60000, end_time: null, duration_ms: 60000, duration_seconds: 60, status: 'WORKING', is_paused: state === 'paused', recovery_pending: false, settlement_status: 'IN_PROGRESS', source: 'MANUAL_START', control_mode: 'MANUAL', revision: 0 };
  window.__TAURI_EVENT_PLUGIN_INTERNALS__ = { unregisterListener() {} };
  let callbackId = 0;
  window.__TAURI_INTERNALS__ = { metadata: { currentWindow: { label: 'main' }, currentWebview: { label: 'main' } }, transformCallback() { return ++callbackId; }, unregisterCallback() {}, invoke: async (command, args) => {
    window.headerCalls.push({ command, args });
    if (command === 'get_startup_status') return {enabled:false,available:false,error:null};
    if (command === 'get_layout_settings') return { density, revision: 0, sound_enabled: false, sound_theme: 'soft', font_size: params.get('large') ? 18 : 14, font_weight: 400, line_spacing: 'standard' };
    if (command === 'get_appearance') return { version: 1, theme: params.get('theme') ?? 'cream', opacity: 94 };
    if (command === 'get_presentation') return { version: 1, revision: 0, background: null, categories: Object.fromEntries(keys.map((key, i) => [key, { icon: ['checkSquare', 'safety', 'code', 'note'][i], color: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][i] }])) };
    if (command === 'get_category_names') return { revision: 0, names };
    if (command === 'get_today_workload') {
      if (state === 'empty') return [];
      if (state === 'error') throw new Error('隔离读取失败');
      return [{ category: '开发', quantity: state === 'zero' ? 0 : state === 'long' ? 1e9 : 1111, pending: state === 'pending' ? 3 : 0, complete: state === 'pending' ? 0 : 1, records: 1 }];
    }
    if (command === 'get_snapshot') return { active: ['working', 'paused'].includes(state) ? record : null, recent_records: [], warning: null, pending_count: 13, monitoring: { browsing_only: true, browse_ready: true, enabled: true, native_available: true, browser_connected: true, work_page: true, idle_warning: false, message: '仅浏览 · 当前不计时', idle_warning_seconds: 300, idle_end_seconds: 420, revision: 0 } };
    if (command === 'detect_preview_data') return false;
    return null;
  } };
});
const cases = [];
async function inspect(width, density, state = 'normal', theme = 'cream', large = false) {
  await page.setViewportSize({ width, height: density === 'compact' ? 260 : 560 });
  await page.goto(`http://127.0.0.1:1420/?density=${density}&state=${state}&theme=${theme}${large ? '&large=1' : ''}`);
  await page.locator(`.desktop-frame[data-density="${density}"]`).waitFor();
  await page.getByRole('button', { name: '设置', exact: true }).waitFor();
  await page.getByRole('button', { name: '待补全 13', exact: true }).waitFor();
  await page.locator('.today-strip-track').getByText(state === 'empty' ? '今天还没有工作记录' : state === 'error' ? '工作量暂不可用' : state === 'pending' ? '待补填' : state === 'zero' ? '开发 0' : state === 'long' ? '1,000,000,000' : '1,111').first().waitFor();
  assert.equal(await page.locator('.main-nav button').count(), 1);
  const geometry = await page.locator('.titlebar-main').evaluate(el => {
    const box = node => { const r = node.getBoundingClientRect(); return { x: r.x, right: r.right, y: r.y, bottom: r.bottom, width: r.width }; };
    return { header: box(el), items: [...el.children].map(box).sort((a,b)=>a.x-b.x), drag: box(el.querySelector('.titlebar-space')), bodyOverflow: document.documentElement.scrollWidth > innerWidth };
  });
  assert.equal(geometry.bodyOverflow, false, JSON.stringify({ width, density, state, geometry }));
  assert.ok(geometry.drag.width >= 24);
  for (let i = 0; i < geometry.items.length; i++) {
    const item = geometry.items[i];
    assert.ok(item.x >= geometry.header.x && item.right <= geometry.header.right + 1);
    assert.ok(item.y >= geometry.header.y && item.bottom <= geometry.header.bottom + 1);
    if (i) assert.ok(geometry.items[i - 1].right <= item.x + 1);
  }
  assert.equal(await page.locator('.workload-carousel').count(),0);
  assert.equal(await page.getByRole('button',{name:'仅浏览',exact:true}).count(),1);
  assert.ok(await page.evaluate(() => [document.documentElement, document.body, document.getElementById('root')].every(el => getComputedStyle(el).backgroundColor === 'rgba(0, 0, 0, 0)')));
  cases.push({ width, density, state, theme, large, ...geometry });
}
try {
  for (const density of ['compact', 'comfortable']) for (const width of [360, 420, 600, 780]) await inspect(width, density);
  for (const state of ['empty', 'zero', 'pending', 'long', 'working', 'paused', 'error']) await inspect(420, 'compact', state);
  for (const theme of ['glass', 'cream', 'dark', 'neon']) {
    await inspect(420, 'compact', 'normal', theme);
    await page.screenshot({ path: fileURLToPath(new URL(`compact-${theme}.png`, output)) });
  }
  await inspect(360, 'comfortable', 'long', 'cream', true);
  await inspect(420, 'compact');
  await page.getByRole('button', { name: '设置', exact: true }).click();
  let calls = await page.evaluate(() => window.headerCalls);
  assert.deepEqual(calls.filter(c => c.command === 'open_panel').at(-1).args, { panel: 'settings', section: 'monitor' });
  assert.equal(calls.some(c => c.command === 'plugin:window|start_dragging'), false, 'settings must not drag');
  await page.getByRole('button', { name: '打开当天工作量详情' }).click();
  calls = await page.evaluate(() => window.headerCalls);
  assert.equal(calls.filter(c => c.command === 'open_dashboard').at(-1).args.view, 'today');
  await page.locator('.titlebar-space').click();
  calls = await page.evaluate(() => window.headerCalls);
  assert.equal(calls.filter(c => c.command === 'plugin:window|start_dragging').length, 1);
  await page.getByRole('button', { name: '最小化窗口' }).click();
  await page.getByRole('button', { name: '关闭到后台' }).click();
  calls = await page.evaluate(() => window.headerCalls);
  assert.equal(calls.filter(c => c.command === 'plugin:window|minimize').length, 1);
  assert.equal(calls.filter(c => c.command === 'plugin:window|close').length, 1);
  assert.equal(calls.some(c => ['start_task', 'finish_task', 'pause_task', 'resume_task', 'settle_record'].includes(c.command)), false);
  await page.screenshot({ path: fileURLToPath(new URL('compact-420.png', output)) });
  await inspect(780, 'comfortable');
  await page.screenshot({ path: fileURLToPath(new URL('comfortable-780.png', output)) });
  assert.deepEqual(errors, []);
  await writeFile(new URL('result.json', output), JSON.stringify({ isolated: true, native: false, oneSettingsEntry: true, settingsAndDashboard: true, dragAndControls: true, cases, errors }, null, 2));
  console.log(`Titlebar: ${cases.length} isolated layouts, settings/drag/workload/window controls passed.`);
} catch (error) {
  await page.screenshot({ path: fileURLToPath(new URL('failure.png', output)) });
  throw error;
} finally { await browser.close(); }
~~~~~~

## E:\WorkMemo\scripts\verify-ui-022.mjs

~~~~~~javascript
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
island.on('pageerror',e=>console.error('Island regression:',e.message));
await island.addInitScript(({record})=>{
  window.isTauri=true;window.qaTheme='cream';window.qaState='working';window.qaCalls=[];
  window.__TAURI_EVENT_PLUGIN_INTERNALS__={unregisterListener(){}};
  const snapshot=()=>({active:['browse','candidate'].includes(window.qaState)?null:{...record,status:'WORKING',is_paused:window.qaState==='paused',pause_reason:window.qaState==='paused'?'MANUAL':null,control_mode:'AUTO'},monitoring:{browsing_only:window.qaState==='browse',browse_ready:true,start_candidate:window.qaState==='candidate'?{id:7,category:'评测',rule_id:1}:null,away_pause_remaining_seconds:null},recent_records:[],pending_count:0});
  window.__TAURI_INTERNALS__={metadata:{currentWindow:{label:'notice'},currentWebview:{label:'notice'}},transformCallback(){return 1;},unregisterCallback(){},invoke:async(command,args)=>{
    window.qaCalls.push(command);
    if(command==='get_snapshot') return snapshot();
    if(command==='get_notice') return null;
    if(command==='get_island_viewport') return innerHeight;
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
  await button.waitFor().catch(async error=>{await writeFile(new URL('island-failure.html',output),await island.content());throw error;});
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
await island.evaluate(()=>window.qaState='candidate');await island.setViewportSize({width:320,height:420});await island.waitForTimeout(1100);
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
~~~~~~

## E:\WorkMemo\scripts\verify-v025.mjs

~~~~~~javascript
// Isolated IPC fixtures only: no real backend, user database, or startup registration.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const output = new URL('../artifacts/0.2.5/qa/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel:'msedge', headless:true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(() => {
  const p = new URLSearchParams(location.search), category = ['评测','质检','开发','文档'];
  const record = {id:7,category:'评测',quantity:null,remark:'隔离验收记录',start_time:Date.now()-2300000,end_time:null,confirmed_end_time:null,duration_ms:2300000,duration_seconds:2300,status:'WORKING',is_paused:p.get('state')==='paused',recovery_pending:false,settlement_status:'IN_PROGRESS',source:'MANUAL_START',control_mode:'MANUAL',revision:1};
  const ended = {...record,id:6,status:'FINISHED',is_paused:true,settlement_status:'PENDING',end_time:Date.now(),confirmed_end_time:Date.now()};
  window.qa = {calls:[],active:p.get('state')==='empty'?null:record,notice:p.get('ended')?{kind:'ended',record:ended}:null,fail:'',browse:false,ready:true,stats:p.get('stats')==='empty'?[]:category.map((c,i)=>({category:c,quantity:i*11,pending:i===2?2:0,complete:1,records:1})),startup:{enabled:true,available:true,error:null}};
  window.isTauri = true;
  const callbacks = new Map(); let callback = 0;
  window.__TAURI_EVENT_PLUGIN_INTERNALS__ = {unregisterListener(){}};
  window.__TAURI_INTERNALS__ = {
    metadata:{currentWindow:{label:p.has('notice')?'notice':p.has('panel')?'settings':'main'},currentWebview:{label:'main'}},
    transformCallback(fn){callbacks.set(++callback,fn);return callback;}, unregisterCallback(id){callbacks.delete(id);},
    invoke:async(command,args={})=>{
      const q=window.qa; q.calls.push({command,args});
      const snapshot=()=>({active:q.active,recent_records:[],pending_count:q.notice?1:0,warning:null,monitoring:{browsing_only:q.browse,browse_ready:q.ready,enabled:true,native_available:true,browser_connected:true,work_page:true,message:q.browse?'仅浏览 · 当前不计时':'正在记录',idle_warning:false,idle_warning_seconds:300,idle_end_seconds:420,start_candidate:null}});
      if(command===q.fail) {await new Promise(r=>setTimeout(r,100));throw Error('隔离保存失败');}
      if(command==='get_snapshot') return snapshot();
      if(command==='get_notice') return structuredClone(q.notice);
      if(command==='get_appearance') return {version:1,theme:p.get('theme')||'cream',opacity:88};
      if(command==='get_category_names') return {revision:0,names:Object.fromEntries(category.map(c=>[c,p.get('long')?c+'超长自定义工作名称用于布局检查':c]))};
      if(command==='get_layout_settings') return {density:p.get('density')||'comfortable',revision:0,sound_enabled:false,sound_theme:'soft',font_size:p.has('large')?18:14,font_weight:400,line_spacing:'standard'};
      if(command==='get_presentation') return {version:1,revision:0,background:null,categories:Object.fromEntries(category.map((c,i)=>[c,{icon:['checkSquare','safety','code','note'][i],color:['#3b82f6','#10b981','#8b5cf6','#f59e0b'][i]}]))};
      if(command==='get_today_workload'){if(p.get('stats')==='loading')await new Promise(r=>setTimeout(r,1500));if(p.get('stats')==='error')throw Error('隔离统计读取失败');return q.stats;}
      if(command==='detect_preview_data') return false;
      if(command==='pause_task'){q.active={...q.active,is_paused:true,pause_reason:'MANUAL'};return snapshot();}
      if(command==='resume_task'){q.active={...q.active,is_paused:false,pause_reason:null};return snapshot();}
      if(command==='enter_browsing'){q.browse=true;if(q.active)q.active={...q.active,is_paused:true};return snapshot();}
      if(command==='confirm_work'){q.browse=false;return snapshot();}
      if(command==='start_task'){
        if(q.active && (!q.active.is_paused||q.active.id!==args.expectedActiveId))throw Error('原任务已变化');
        q.active={...record,...args.input,id:8,is_paused:false};return snapshot();
      }
      if(command==='settle_record'){
        await new Promise(r=>setTimeout(r,140));
        if(!q.notice || args.input.id!==q.notice.record.id || args.input.expected_revision!==q.notice.record.revision)throw Error('记录已变化');
        q.notice=null;return snapshot();
      }
      if(command==='defer_notice'){if(q.notice?.record.id===args.id)q.notice=null;return null;}
      if(command==='get_island_viewport') return innerHeight;
      if(command==='set_island_region'&&q.slowRegion&&args.height===56)await new Promise(r=>setTimeout(r,200));
      if(command==='get_startup_status') return q.startup;
      if(command==='set_startup_enabled'){q.startup={...q.startup,enabled:args.enabled};return q.startup;}
      if(command==='plugin:event|listen')return callback;
      return null;
    }
  };
});
const base=process.env.WORKMEMO_UI_URL||'http://127.0.0.1:1420/';
const results=[];
async function load(params={},width=780,height=560){
  await page.setViewportSize({width,height});
  await page.goto(`${base}?${new URLSearchParams(params)}`);
  await page.locator(params.notice?'.island-main-row':'.desktop-frame').waitFor();
  if(!params.notice&&!params.panel)await page.locator('.timer-card,.new-task-page').waitFor();
  await page.waitForTimeout(180);
}
async function screenshot(name){await page.screenshot({path:fileURLToPath(new URL(`${name}.png`,output))});}
async function record(name,fn){await fn();results.push(name);}
try {
  await record('four themes, two densities, widths, large text and header drag space',async()=>{
    for(const theme of ['cream','glass','dark','neon'])for(const density of ['compact','comfortable'])for(const width of [360,420,780]){
      await load({theme,density,state:'paused',...(width===360?{large:'1',long:'1'}:{})},width,density==='compact'?380:560);
      const geometry=await page.locator('.titlebar-main').evaluate(el=>{
        const box=n=>{const r=n.getBoundingClientRect();return{x:r.x,right:r.right,y:r.y,bottom:r.bottom,width:r.width};};
        return {header:box(el),items:[...el.children].map(box).sort((a,b)=>a.x-b.x),drag:box(el.querySelector('.titlebar-space'))};
      });
      assert.ok(geometry.drag.width>=24,JSON.stringify({theme,density,width,geometry}));
      for(let i=0;i<geometry.items.length;i++){
        const item=geometry.items[i];assert.ok(item.x>=geometry.header.x&&item.right<=geometry.header.right+1,JSON.stringify({width,geometry}));
        if(i)assert.ok(geometry.items[i-1].right<=item.x+1);
      }
      assert.equal(await page.locator('.browse-banner,.workload-carousel').count(),0);
      assert.equal(await page.getByRole('button',{name:'仅浏览',exact:true}).count(),1);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      if(width===420&&density==='comfortable')await screenshot(`main-${theme}`);
    }
  });
  await record('paused switch is exclusive, cancel preserves task, errors preserve draft and atomic ID',async()=>{
    await load({state:'working'});
    await screenshot('current-task-780');
    const originalWidth=await page.locator('.desktop-frame').evaluate(el=>el.getBoundingClientRect().width);
    const material=await page.locator('.timer-card').evaluate(el=>{const s=getComputedStyle(el);return [s.backgroundColor,s.borderColor,s.borderRadius,s.boxShadow,s.backdropFilter];});
    await page.getByRole('button',{name:'切换任务',exact:true}).isDisabled().then(value=>assert.equal(value,true));
    await page.getByRole('button',{name:'暂停',exact:true}).click();
    await page.getByRole('button',{name:'切换任务',exact:true}).click();
    assert.equal(await page.locator('.timer-card').count(),0);
    assert.equal(await page.locator('.desktop-frame').evaluate(el=>el.getBoundingClientRect().width),originalWidth);
    assert.deepEqual(await page.locator('.new-task-page').evaluate(el=>{const s=getComputedStyle(el);return [s.backgroundColor,s.borderColor,s.borderRadius,s.boxShadow,s.backdropFilter];}),material);
    await page.getByLabel('工作类别',{exact:true}).selectOption('开发');
    await page.getByLabel('工作量（可稍后填写）').fill('0');
    await page.getByLabel('备注（选填）').fill('切换草稿');
    await screenshot('new-task');
    await page.getByRole('button',{name:'开始工作',exact:true}).click();
    await page.evaluate(()=>window.qa.fail='start_task');
    await page.getByRole('button',{name:'保存并开始',exact:true}).click();
    await page.getByRole('alert').filter({hasText:'隔离保存失败'}).waitFor();
    assert.equal(await page.getByLabel('备注（选填）').inputValue(),'切换草稿');
    await page.getByRole('button',{name:'取消',exact:true}).click();
    await page.getByRole('button',{name:'取消切换',exact:true}).click();
    assert.equal(await page.evaluate(()=>window.qa.active.id),7);
    assert.equal(await page.evaluate(()=>window.qa.active.is_paused),true);
    await page.evaluate(()=>window.qa.fail='');
    await page.getByRole('button',{name:'切换任务',exact:true}).click();
    await page.getByLabel('工作类别',{exact:true}).selectOption('开发');
    await page.getByRole('button',{name:'开始工作',exact:true}).click();
    await page.getByRole('button',{name:'保存并开始',exact:true}).click();
    await page.getByRole('button',{name:'暂停',exact:true}).waitFor();
    const call=await page.evaluate(()=>window.qa.calls.filter(c=>c.command==='start_task').at(-1));
    assert.equal(call.args.expectedActiveId,7);assert.equal(call.args.input.quantity,null);
  });
  await record('switch draft survives changed active task and refuses stale submission',async()=>{
    await load({state:'paused'});
    await page.getByRole('button',{name:'切换任务',exact:true}).click();
    await page.getByLabel('工作类别',{exact:true}).selectOption('文档');
    await page.getByLabel('备注（选填）').fill('保留草稿');
    await page.evaluate(()=>{window.qa.active={...window.qa.active,id:20,is_paused:false};});
    await page.getByRole('status').filter({hasText:'原任务状态已变化'}).waitFor();
    assert.equal(await page.getByLabel('备注（选填）').inputValue(),'保留草稿');
    assert.equal(await page.getByRole('button',{name:'开始工作',exact:true}).isDisabled(),true);
    assert.equal(await page.evaluate(()=>window.qa.calls.some(c=>c.command==='start_task')),false);
    await page.getByRole('button',{name:'取消切换',exact:true}).click();
  });
  await record('browsing toolbar uses existing commands and readiness',async()=>{
    await page.getByRole('button',{name:'仅浏览',exact:true}).click();
    assert.equal(await page.getByRole('button',{name:'仅浏览',exact:true}).getAttribute('aria-pressed'),'true');
    await page.evaluate(()=>window.qa.ready=false);await page.waitForTimeout(1100);
    assert.equal(await page.getByRole('button',{name:'仅浏览',exact:true}).isDisabled(),true);
    await page.evaluate(()=>window.qa.ready=true);await page.waitForTimeout(1100);
    await page.getByRole('button',{name:'仅浏览',exact:true}).click();
    assert.equal(await page.getByRole('button',{name:'仅浏览',exact:true}).getAttribute('aria-pressed'),'false');
  });
  await record('stats loading/error states, overflow loop, static fit and reduced motion',async()=>{
    await load({stats:'loading'},780,560);
    await page.getByText('正在读取今日工作量…',{exact:true}).waitFor();
    await page.locator('.today-strip-track').getByText(/评测 0/).first().waitFor();
    await load({stats:'error'},780,560);
    await page.getByText('工作量暂不可用',{exact:true}).waitFor();
    await load({long:'1'},360,380);
    await page.locator('.today-strip-track.is-scrolling').waitFor();
    const before=await page.locator('.today-strip-track').evaluate(el=>getComputedStyle(el).transform);
    await page.waitForTimeout(220);
    assert.notEqual(await page.locator('.today-strip-track').evaluate(el=>getComputedStyle(el).transform),before);
    await page.getByRole('button',{name:/打开当天工作量详情/}).hover();
    assert.equal(await page.locator('.today-strip-track').evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await page.locator('.today-strip-track').evaluate(el=>getComputedStyle(el).animationName),'none');
    await page.emulateMedia({reducedMotion:'no-preference'});
    await load({stats:'empty'},780);
    assert.equal(await page.locator('.today-strip-track.is-scrolling').count(),0);
  });
  await record('island rapid reopen remains held and reduced motion collapses without animation',async()=>{
    await load({notice:'1',ended:'1'},320,420);
    await page.getByRole('button',{name:'填写工作量',exact:true}).waitFor();
    const before=await page.locator('.island-main-row').boundingBox();
    await page.evaluate(()=>window.qa.slowRegion=true);
    await page.getByRole('button',{name:'收起展开区域',exact:true}).click();
    await page.waitForTimeout(240);
    await page.getByRole('button',{name:'展开工作提醒',exact:true}).click();
    const callsBefore=await page.evaluate(()=>window.qa.calls.length);
    await page.waitForTimeout(480);
    assert.deepEqual(await page.locator('.island-main-row').boundingBox(),before);
    assert.equal(await page.getByRole('button',{name:'填写工作量',exact:true}).isVisible(),true);
    assert.ok(await page.evaluate(start=>window.qa.calls.slice(start).filter(c=>c.command==='hold_island').every(c=>c.args.holding),callsBefore));
    assert.equal(await page.evaluate(()=>window.qa.calls.filter(c=>c.command==='hold_island').at(-1).args.holding),true);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.getByRole('button',{name:'收起展开区域',exact:true}).click();
    await page.waitForTimeout(70);
    assert.equal(await page.locator('.island-expansion').evaluate(el=>el.getBoundingClientRect().height),0);
    await page.emulateMedia({reducedMotion:'no-preference'});
  });
  await record('island pinned body, inline save failures/conflicts, new work and smooth automatic collapse',async()=>{
    await load({notice:'1',ended:'1'},320,420);
    await page.getByRole('button',{name:'填写工作量',exact:true}).click();
    await page.getByLabel('工作量（必填）').fill('0');
    await page.getByLabel('备注（选填）').fill('岛内草稿');
    await page.evaluate(()=>window.qa.fail='settle_record');
    await page.getByRole('button',{name:'填写工作量并保存',exact:true}).click();
    await page.getByRole('alert').filter({hasText:'隔离保存失败'}).waitFor();
    assert.equal(await page.getByLabel('备注（选填）').inputValue(),'岛内草稿');
    await page.evaluate(()=>{window.qa.fail='';window.qa.notice.record.revision=2;});
    await page.getByRole('button',{name:'填写工作量并保存',exact:true}).click();
    await page.getByRole('alert').filter({hasText:'记录已变化'}).waitFor();
    assert.equal(await page.getByLabel('备注（选填）').inputValue(),'岛内草稿');
    await page.evaluate(()=>{window.qa.notice.record.revision=1;window.qa.active={...window.qa.active,id:99,category:'开发'};});
    await page.waitForTimeout(1150);
    assert.equal(await page.locator('.island-info strong').innerText(),'开发');
    assert.equal(await page.getByLabel('备注（选填）').inputValue(),'岛内草稿');
    await screenshot('island-form');
    await page.evaluate(()=>{
      window.qa.frames=[];window.qa.tracking=true;
      const tick=()=>{const el=document.querySelector('.island-main-row'),ex=document.querySelector('.island-expansion');if(el&&ex){const r=el.getBoundingClientRect();window.qa.frames.push({x:r.x,y:r.y,width:r.width,height:r.height,radius:getComputedStyle(el).borderRadius,lower:ex.getBoundingClientRect().height,opacity:getComputedStyle(ex).opacity});}if(window.qa.tracking)requestAnimationFrame(tick);};requestAnimationFrame(tick);
    });
    await page.getByRole('button',{name:'填写工作量并保存',exact:true}).click();
    await page.waitForTimeout(600);
    const frames=await page.evaluate(()=>{window.qa.tracking=false;return window.qa.frames;});
    assert.ok(frames.length>8);
    assert.equal(new Set(frames.map(({x,y,width,height,radius})=>JSON.stringify({x,y,width,height,radius}))).size,1);
    assert.ok(frames.some(f=>f.lower>2&&f.lower<200&&Number(f.opacity)>0&&Number(f.opacity)<1),JSON.stringify(frames));
    assert.ok(frames.at(-1).lower<1);
    assert.equal(await page.evaluate(()=>window.qa.calls.filter(c=>c.command==='settle_record').at(-1).args.input.id),6);
    assert.equal(await page.evaluate(()=>window.qa.active.id),99);
    await writeFile(new URL('island-frames.json',output),JSON.stringify(frames,null,2));
    await screenshot('island-collapsed');
  });
  await record('dirty island dismiss requires explicit discard and preserves pending record',async()=>{
    await load({notice:'1',ended:'1'},320,420);
    await page.getByRole('button',{name:'填写工作量',exact:true}).click();
    await page.getByLabel('工作量（必填）').fill('12');
    await page.getByRole('button',{name:'稍后填写',exact:true}).click();
    await page.getByRole('button',{name:'继续填写',exact:true}).click();
    assert.equal(await page.getByLabel('工作量（必填）').inputValue(),'12');
    await page.getByRole('button',{name:'稍后填写',exact:true}).click();
    await page.getByRole('button',{name:'放弃填写并收起',exact:true}).click();
    await page.waitForTimeout(400);
    assert.equal(await page.evaluate(()=>window.qa.calls.some(c=>c.command==='settle_record')),false);
    assert.ok(await page.evaluate(()=>window.qa.calls.some(c=>c.command==='defer_notice'&&c.args.id===6)));
  });
  await record('startup checkbox immediate save and failure keeps truthful status',async()=>{
    await load({panel:'settings',section:'layout'},900,800);
    await page.getByLabel('开机启动',{exact:true}).waitFor();
    await page.getByLabel('开机启动',{exact:true}).uncheck();
    assert.equal(await page.evaluate(()=>window.qa.startup.enabled),false);
    await page.evaluate(()=>window.qa.fail='set_startup_enabled');
    await page.getByLabel('开机启动',{exact:true}).click();
    await page.getByRole('alert').filter({hasText:'隔离保存失败'}).waitFor();
    assert.equal(await page.getByLabel('开机启动',{exact:true}).isChecked(),false);
  });
  assert.deepEqual(errors,[]);
  await writeFile(new URL('ui-result.json',output),JSON.stringify({isolated:true,native:false,results,errors},null,2));
  console.log(`v0.2.5: ${results.length} interaction groups passed; 24 theme/density/width layouts; fixtures only.`);
} catch(e) {await screenshot('failure');await writeFile(new URL('failure.json',output),JSON.stringify({errors,html:await page.content(),qa:await page.evaluate(()=>window.qa)},null,2));throw e;} finally {await browser.close();}
~~~~~~

## E:\WorkMemo\src-tauri\Cargo.lock

~~~~~~toml
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
version = "0.2.4"
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
~~~~~~

## E:\WorkMemo\src-tauri\Cargo.toml

~~~~~~toml
[package]
name = "workmemo"
version = "0.2.4"
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
~~~~~~

## E:\WorkMemo\src-tauri\installer\browser-bridge.nsh

~~~~~~nsis
!include "LogicLib.nsh"
!ifndef WM_STARTUP_REGISTRY_ROOT
  !define WM_STARTUP_REGISTRY_ROOT "Software\Microsoft\Windows\CurrentVersion\Run"
!endif
!ifndef WM_BRIDGE_REGISTRY_ROOT
  !define WM_BRIDGE_REGISTRY_ROOT "Software\Google\Chrome\NativeMessagingHosts"
!endif
!ifndef WM_BRIDGE_DATA_ROOT
  !define WM_BRIDGE_DATA_ROOT "$LOCALAPPDATA"
!endif
!macro WM_BRIDGE_CONSTANTS
!ifndef WM_BRIDGE_KEY
!if "${BUNDLEID}" == "com.workmemo.desktop"
  !define WM_BRIDGE_HOST "com.workmemo.browser_bridge"
!else
  !define WM_BRIDGE_HOST "com.workmemo.browser_bridge_test"
!endif
!define WM_BRIDGE_KEY "${WM_BRIDGE_REGISTRY_ROOT}\${WM_BRIDGE_HOST}"
!define WM_BRIDGE_MANIFEST "${WM_BRIDGE_DATA_ROOT}\${BUNDLEID}\browser-host.json"

!endif
!macroend

!macro NSIS_HOOK_POSTINSTALL
  !insertmacro WM_BRIDGE_CONSTANTS
  Push $R0
  SetRegView 64
  ClearErrors
  ExecWait '"$INSTDIR\workmemo-browser.exe" --register' $R0
  ${If} ${Errors}
  ${OrIf} $R0 != 0
    DetailPrint "WorkMemo browser registration needs repair in monitoring settings."
    MessageBox MB_ICONEXCLAMATION|MB_OK "Browser connection setup failed. Start WorkMemo and open monitoring settings to repair the connection." /SD IDOK
  ${Else}
    DetailPrint "WorkMemo browser connection registered for the current user."
  ${EndIf}
  Pop $R0
!macroend

; After Tauri's running-app/cancel check and resource removal.
; Never remove the registration of a newer install or portable directory.
!macro WM_BRIDGE_REMOVE_VIEW VIEW
  SetRegView ${VIEW}
  ReadRegStr $R0 HKCU "${WM_BRIDGE_KEY}" "WorkMemoExecutable"
  ReadRegStr $R1 HKCU "${WM_BRIDGE_KEY}" ""
  ReadRegStr $R2 HKCU "${WM_BRIDGE_KEY}" "WorkMemoProfile"
  ${If} $R0 == "$INSTDIR\workmemo-browser.exe"
  ${AndIf} $R1 == "${WM_BRIDGE_MANIFEST}"
  ${AndIf} $R2 == "${BUNDLEID}"
    StrCpy $R4 1
    DeleteRegValue HKCU "${WM_BRIDGE_KEY}" ""
    DeleteRegValue HKCU "${WM_BRIDGE_KEY}" "WorkMemoExecutable"
    DeleteRegValue HKCU "${WM_BRIDGE_KEY}" "WorkMemoProfile"
    DeleteRegKey /ifempty HKCU "${WM_BRIDGE_KEY}"
  ${ElseIf} $R0 != ""
    StrCpy $R3 0
  ${ElseIf} $R1 != ""
    StrCpy $R3 0
  ${EndIf}
!macroend
!macro NSIS_HOOK_POSTUNINSTALL
  ; Only remove the login entry owned by this installation.
  ; Portable or newer installations may have registered a different path.
  Push $R0
  SetRegView 64
  ReadRegStr $R0 HKCU "${WM_STARTUP_REGISTRY_ROOT}" "WorkMemo"
  ${If} $R0 == '$\"$INSTDIR\workmemo.exe$\" --autostart'
    DeleteRegValue HKCU "${WM_STARTUP_REGISTRY_ROOT}" "WorkMemo"
  ${EndIf}
  Pop $R0
  !insertmacro WM_BRIDGE_CONSTANTS
  Push $R0
  Push $R1
  Push $R2
  Push $R3
  Push $R4
  StrCpy $R3 1
  StrCpy $R4 0
  !insertmacro WM_BRIDGE_REMOVE_VIEW 32
  !insertmacro WM_BRIDGE_REMOVE_VIEW 64
  ${If} $R3 == 1
  ${AndIf} $R4 == 1
    Delete "${WM_BRIDGE_MANIFEST}"
  ${EndIf}
  SetRegView 64
  Pop $R4
  Pop $R3
  Pop $R2
  Pop $R1
  Pop $R0
!macroend
~~~~~~

## E:\WorkMemo\src-tauri\src\desktop.rs

~~~~~~rust
use serde::{Deserialize, Serialize};
use std::{
    path::PathBuf,
    sync::{
        Mutex,
        atomic::{AtomicBool, Ordering},
    },
};
use tauri::{
    Emitter, Manager, WebviewUrl, WebviewWindowBuilder,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};

#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct IslandSettings {
    version: u32,
    enabled: bool,
    position: Option<(i32, i32)>,
}
pub fn validate_island(bytes: &[u8]) -> Result<(), String> {
    let value: IslandSettings = serde_json::from_slice(bytes).map_err(|e| e.to_string())?;
    if value.version != 1 {
        return Err("状态岛配置版本不受支持".into());
    }
    Ok(())
}
impl Default for IslandSettings {
    fn default() -> Self {
        Self {
            version: 1,
            enabled: true,
            position: None,
        }
    }
}
pub struct IslandState {
    path: Result<PathBuf, String>,
    data: Mutex<(IslandSettings, bool)>,
    pub holding: AtomicBool,
    viewport_height: Mutex<f64>,
}
impl IslandState {
    pub fn initialize(app: &tauri::App) -> Self {
        let path = app
            .path()
            .app_config_dir()
            .map(|p| p.join("island.json"))
            .map_err(|e| e.to_string());
        let loaded =
            path.as_ref()
                .map_err(|e| e.clone())
                .and_then(|path| match std::fs::read(path) {
                    Ok(bytes) => serde_json::from_slice::<IslandSettings>(&bytes)
                        .map_err(|e| e.to_string())
                        .and_then(|v| {
                            if v.version == 1 {
                                Ok(v)
                            } else {
                                Err("状态岛配置版本不受支持".into())
                            }
                        }),
                    Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
                        Ok(IslandSettings::default())
                    }
                    Err(e) => Err(e.to_string()),
                });
        let (path, settings) = match loaded {
            Ok(settings) => (path, settings),
            Err(error) => (
                Err(format!("状态岛配置无法读取，未覆盖原文件：{error}")),
                IslandSettings::default(),
            ),
        };
        Self {
            path,
            data: Mutex::new((settings, false)),
            holding: AtomicBool::new(false),
            viewport_height: Mutex::new(420.0),
        }
    }
    pub fn enabled(&self) -> bool {
        self.data.lock().map(|d| d.0.enabled).unwrap_or(true)
    }
    fn toggle(&self) -> Result<(), String> {
        let mut data = self.data.lock().map_err(|_| "状态岛设置锁异常")?;
        data.0.enabled = !data.0.enabled;
        data.1 = true;
        drop(data);
        self.flush()
    }
    pub fn disable(&self) -> Result<(), String> {
        let mut data = self.data.lock().map_err(|_| "状态岛设置锁异常")?;
        data.0.enabled = false;
        data.1 = true;
        drop(data);
        self.flush()
    }
    pub fn moved(&self, p: tauri::PhysicalPosition<i32>) {
        if let Ok(mut data) = self.data.lock() {
            if data.0.position != Some((p.x, p.y)) {
                data.0.position = Some((p.x, p.y));
                data.1 = true;
            }
        }
    }
    pub fn flush(&self) -> Result<(), String> {
        let mut data = self.data.lock().map_err(|_| "状态岛设置锁异常")?;
        if !data.1 {
            return Ok(());
        }
        let path = self.path.as_ref().map_err(|e| e.clone())?;
        let parent = path.parent().ok_or("状态岛设置目录无效")?;
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        let temp = path.with_extension("pending");
        std::fs::write(
            &temp,
            serde_json::to_vec(&data.0).map_err(|e| e.to_string())?,
        )
        .map_err(|e| e.to_string())?;
        std::fs::rename(&temp, path).map_err(|e| e.to_string())?;
        data.1 = false;
        Ok(())
    }
    fn position(&self) -> Option<(i32, i32)> {
        self.data.lock().ok().and_then(|d| d.0.position)
    }
}

pub fn show_main(app: &tauri::AppHandle, settlement: bool) -> Result<(), String> {
    if settlement {
        let handle = app.clone();
        // Tray callbacks run on the UI thread; WebView creation must not block it.
        tauri::async_runtime::spawn_blocking(move || {
            if let Err(error) = crate::windows::show_panel(&handle, "settlement", None) {
                let _ = show_main(&handle, false);
                let _ = handle.emit("workmemo:runtime-error", error);
            }
        });
        return Ok(());
    }
    let window = app.get_webview_window("main").ok_or("主窗口不可用。")?;
    set_visibility(&window.as_ref().window(), true, true)?;
    window
        .show()
        .and_then(|_| window.unminimize())
        .and_then(|_| window.set_focus())
        .map_err(|e| e.to_string())?;
    Ok(())
}

pub fn setup(app: &tauri::App) -> tauri::Result<()> {
    let open = MenuItem::with_id(app, "open", "打开 WorkMemo", true, None::<&str>)?;
    let pending = MenuItem::with_id(app, "pending", "待补全工作量", true, None::<&str>)?;
    let island = MenuItem::with_id(app, "island", "显示 / 隐藏状态岛", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "退出 WorkMemo", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&open, &pending, &island, &quit])?;
    let mut builder = TrayIconBuilder::with_id("workmemo-tray")
        .tooltip("WorkMemo · 后台工作记录")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => {
                let _ = show_main(app, false);
            }
            "pending" => {
                let _ = show_main(app, true);
            }
            "island" => {
                if let Err(error) = app.state::<IslandState>().toggle() {
                    let _ = app.emit(
                        "workmemo:runtime-error",
                        format!("状态岛设置未能保存：{error}"),
                    );
                }
            }
            "quit" => {
                if let Err(error) = save_island_position(app) {
                    let _ = app.emit(
                        "workmemo:runtime-error",
                        format!("状态岛设置未能保存：{error}"),
                    );
                }
                if crate::windows::has_drafts(app) {
                    let _ = app.emit("workmemo:request-close", ());
                    return;
                }
                let backend = app.state::<crate::service::Backend>();
                match backend.save_on_exit() {
                    Ok(()) => {
                        backend.exiting.store(true, Ordering::Relaxed);
                        app.exit(0);
                    }
                    Err(error) => {
                        let _ = show_main(app, false);
                        let _ = app.emit("workmemo:storage-error", error);
                    }
                }
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if matches!(
                event,
                TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                }
            ) {
                let _ = show_main(tray.app_handle(), false);
            }
        });
    if let Some(icon) = app.default_window_icon() {
        builder = builder.icon(icon.clone());
    }
    builder.build(app)?;
    app.state::<crate::service::Backend>()
        .tray_ready
        .store(true, Ordering::Relaxed);
    Ok(())
}

pub fn save_island_position(app: &tauri::AppHandle) -> Result<(), String> {
    let state = app.state::<IslandState>();
    if let Some(window) = app.get_webview_window("notice") {
        state.moved(window.outer_position().map_err(|e| e.to_string())?);
    }
    state.flush()
}

pub fn present_notice(
    app: &tauri::AppHandle,
    visible: bool,
    _expanded: bool,
    _confirming: bool,
) -> Result<(), String> {
    if !visible {
        if let Some(window) = app.get_webview_window("notice") {
            set_visibility(&window.as_ref().window(), false, false)?;
        }
        return Ok(());
    }
    let window = match app.get_webview_window("notice") {
        Some(window) => window,
        None => {
            let saved_position = app.state::<IslandState>().position();
            let window = WebviewWindowBuilder::new(
                app,
                "notice",
                WebviewUrl::App("index.html?notice=1".into()),
            )
            .title("WorkMemo 工作提醒")
            .inner_size(320.0, 420.0)
            .resizable(false)
            .transparent(true)
            .no_redirection_bitmap(true)
            .decorations(false)
            .shadow(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .focused(false)
            .visible(false)
            .background_color(tauri::window::Color(0, 0, 0, 0))
            .build()
            .map_err(|e| e.to_string())?;
            if let Some((x, y)) = saved_position {
                window
                    .set_position(tauri::PhysicalPosition::new(x, y))
                    .map_err(|e| e.to_string())?;
            } else if let Some(monitor) = window.primary_monitor().map_err(|e| e.to_string())? {
                let scale = monitor.scale_factor();
                let origin = &monitor.work_area().position;
                let size = &monitor.work_area().size;
                let width = (320.0 * scale) as i32;
                let x = origin.x + ((size.width as i32 - width) / 2).max(0);
                let y = origin.y + (16.0 * scale) as i32;
                window
                    .set_position(tauri::PhysicalPosition::new(x, y))
                    .map_err(|e| e.to_string())?;
            }
            fit_island(&window)?;
            apply_island_region(&window.as_ref().window(), 56.0)?;
            window
        }
    };
    // Tao's creation-only focused(false) marker is cleared after creation;
    // a later generic show() may activate the window. Use the native no-activate
    // command consistently for both showing and hiding this auxiliary window.
    set_visibility(&window.as_ref().window(), true, false)
}

// The WebView canvas is fixed; only this native region follows the lower reveal.
fn apply_island_region(window: &tauri::Window, height: f64) -> Result<(), String> {
    let maximum = *window
        .state::<IslandState>()
        .viewport_height
        .lock()
        .map_err(|_| "状态岛尺寸锁异常")?;
    if !height.is_finite() || !(56.0..=maximum).contains(&height) {
        return Err("状态岛显示范围无效".into());
    }
    #[cfg(windows)]
    {
        use windows_sys::Win32::{
            Foundation::GetLastError,
            Graphics::Gdi::{CreateRoundRectRgn, DeleteObject, SetWindowRgn},
        };
        let scale = window.scale_factor().map_err(|e| e.to_string())?;
        let hwnd = window.hwnd().map_err(|e| e.to_string())?;
        let p = |v: f64| (v * scale).round() as i32;
        let region = unsafe {
            CreateRoundRectRgn(p(3.0), p(3.0), p(317.0), p(height - 3.0), p(40.0), p(40.0))
        };
        if region.is_null() {
            return Err("无法创建状态岛显示区域".into());
        }
        if unsafe { SetWindowRgn(hwnd.0 as _, region, 1) } == 0 {
            let code = unsafe { GetLastError() };
            unsafe {
                DeleteObject(region as _);
            }
            return Err(format!("状态岛区域更新失败（Windows {code}）"));
        }
        // A successful SetWindowRgn transfers ownership of the HRGN to Windows.
    }
    Ok(())
}

fn fit_island(window: &tauri::WebviewWindow) -> Result<(), String> {
    let position = window.outer_position().map_err(|e| e.to_string())?;
    let monitors = window.available_monitors().map_err(|e| e.to_string())?;
    let monitor = monitors
        .iter()
        .find(|m| {
            let a = m.work_area();
            position.x >= a.position.x
                && position.y >= a.position.y
                && i64::from(position.x) < i64::from(a.position.x) + i64::from(a.size.width)
                && i64::from(position.y) < i64::from(a.position.y) + i64::from(a.size.height)
        })
        .or(monitors.first())
        .ok_or("无法定位状态岛显示器")?;
    let a = monitor.work_area();
    let scale = monitor.scale_factor();
    let height = (a.size.height as f64 / scale).clamp(56.0, 420.0);
    let current_height = window
        .inner_size()
        .map_err(|e| e.to_string())?
        .to_logical::<f64>(scale)
        .height;
    if (current_height - height).abs() > 0.5 {
        window
            .set_size(tauri::LogicalSize::new(320.0, height))
            .map_err(|e| e.to_string())?;
    }
    *window
        .state::<IslandState>()
        .viewport_height
        .lock()
        .map_err(|_| "状态岛尺寸锁异常")? = height;
    let max_x = (i64::from(a.position.x) + i64::from(a.size.width) - (320.0 * scale) as i64)
        .max(i64::from(a.position.x));
    let max_y = (i64::from(a.position.y) + i64::from(a.size.height) - (height * scale) as i64)
        .max(i64::from(a.position.y));
    let x = i64::from(position.x).clamp(i64::from(a.position.x), max_x) as i32;
    let y = i64::from(position.y).clamp(i64::from(a.position.y), max_y) as i32;
    if (x, y) != (position.x, position.y) {
        window
            .set_position(tauri::PhysicalPosition::new(x, y))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn get_island_viewport(window: tauri::Window) -> Result<f64, String> {
    if window.label() != "notice" {
        return Err("窗口不匹配".into());
    }
    let height = window
        .inner_size()
        .map_err(|e| e.to_string())?
        .to_logical::<f64>(window.scale_factor().map_err(|e| e.to_string())?)
        .height;
    Ok(height)
}

#[tauri::command]
pub fn fit_island_position(app: tauri::AppHandle, window: tauri::Window) -> Result<(), String> {
    if window.label() != "notice" {
        return Err("窗口不匹配".into());
    }
    let island = app.get_webview_window("notice").ok_or("状态岛不可用")?;
    fit_island(&island)?;
    save_island_position(&app)
}

#[tauri::command]
pub fn set_island_region(window: tauri::Window, height: f64) -> Result<(), String> {
    if window.label() != "notice" {
        return Err("窗口不匹配".into());
    }
    apply_island_region(&window, height)
}

#[tauri::command]
pub fn hold_island(window: tauri::Window, holding: bool) -> Result<(), String> {
    if window.label() != "notice" {
        return Err("窗口不匹配".into());
    }
    window
        .state::<IslandState>()
        .holding
        .store(holding, Ordering::Relaxed);
    Ok(())
}

pub fn set_visibility(window: &tauri::Window, visible: bool, activate: bool) -> Result<(), String> {
    #[cfg(windows)]
    {
        use windows_sys::Win32::UI::WindowsAndMessaging::{
            SW_HIDE, SW_SHOWNOACTIVATE, SW_SHOWNORMAL, ShowWindowAsync,
        };
        let handle = window.hwnd().map_err(|e| e.to_string())?;
        let command = if !visible {
            SW_HIDE
        } else if activate {
            SW_SHOWNORMAL
        } else {
            SW_SHOWNOACTIVATE
        };
        if unsafe { ShowWindowAsync(handle.0 as _, command) } == 0 {
            return Err(format!(
                "原生窗口显示请求失败：{}",
                std::io::Error::last_os_error()
            ));
        }
        Ok(())
    }
    #[cfg(not(windows))]
    {
        let _ = activate;
        if visible {
            window.show()
        } else {
            window.hide()
        }
        .map_err(|e| e.to_string())
    }
}

pub fn reload_island(app: &tauri::AppHandle) -> Result<(), String> {
    let state = app.state::<IslandState>();
    let p = state.path.as_ref().map_err(|e| e.clone())?;
    let settings = if p.exists() {
        serde_json::from_slice::<IslandSettings>(&std::fs::read(p).map_err(|e| e.to_string())?)
            .map_err(|e| e.to_string())?
    } else {
        IslandSettings::default()
    };
    if settings.version != 1 {
        return Err("状态岛版本无效".into());
    }
    *state.data.lock().map_err(|_| "状态岛设置锁异常")? = (settings, false);
    Ok(())
}
~~~~~~

## E:\WorkMemo\src-tauri\src\lib.rs

~~~~~~rust
use serde::Serialize;
use tauri::{Emitter, Manager};

mod appearance;
mod browser_bridge;
mod browser_protocol;
mod clock;
mod connection;
mod dashboard;
mod database;
mod desktop;
mod monitor;
mod native_activity;
mod presentation;
#[allow(dead_code)] // Shared with the separately built native host CLI.
mod registration;
mod service;
mod sound;
mod startup;
mod windows;

/// A real IPC round trip verifies that the desktop backend is available.
#[derive(Serialize)]
struct AppInfo {
    name: &'static str,
    version: &'static str,
}

#[tauri::command]
fn app_info() -> AppInfo {
    AppInfo {
        name: "WorkMemo",
        version: env!("CARGO_PKG_VERSION"),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();
    #[cfg(windows)]
    let builder = builder
        .plugin(tauri_plugin_single_instance::init(|app, args, _| {
            if !args.iter().any(|arg| arg == "--autostart") {
                let _ = desktop::show_main(app, false);
            }
        }))
        .plugin(
            tauri_plugin_autostart::Builder::new()
                .arg("--autostart")
                .app_name("WorkMemo")
                .build(),
        );
    builder
        .register_uri_scheme_protocol("background", |context, request| {
            presentation::background_response(context.app_handle(), request.uri().path())
        })
        .setup(|app| {
            app.manage(database::data_tools::ArchiveSelection(
                std::sync::Mutex::new(None),
            ));
            app.manage(connection::ConnectionState::initialize(app));
            app.manage(service::Backend::initialize(app));
            app.manage(desktop::IslandState::initialize(app));
            windows::initialize(app)?;
            app.manage(appearance::AppearanceState::initialize(app));
            app.manage(presentation::initialize(app)?);
            app.manage(dashboard::initialize(app)?);
            desktop::setup(app)?;
            app.manage(startup::initialize(app)?);
            if !std::env::args().any(|arg| arg == "--autostart") {
                desktop::show_main(app.handle(), false)?;
            }
            if std::env::args().any(|a| a == "--demo") {
                let handle = app.handle().clone();
                tauri::async_runtime::spawn_blocking(move || {
                    let result = (|| -> Result<(), String> {
                        {
                            let backend = handle.state::<service::Backend>();
                            let mut guard = backend.inner.lock().map_err(|_| "数据锁异常")?;
                            guard.as_mut().map_err(|e| e.clone())?.seed_demo()?;
                        }
                        dashboard::open_impl(&handle, "all", "demo", false)
                    })();
                    if let Err(error) = result {
                        let _ = handle.emit("workmemo:runtime-error", error);
                    }
                });
            }
            Ok(())
        })
        .on_window_event(service::handle_window_event)
        .invoke_handler(tauri::generate_handler![
            app_info,
            desktop::get_island_viewport,
            desktop::fit_island_position,
            desktop::set_island_region,
            desktop::hold_island,
            startup::get_startup_status,
            startup::set_startup_enabled,
            presentation::get_presentation,
            presentation::save_presentation,
            presentation::import_background,
            service::confirm_work,
            service::enter_browsing,
            dashboard::open_dashboard,
            dashboard::get_dashboard_address,
            dashboard::get_today_workload,
            dashboard::seed_demo_data,
            dashboard::clear_demo_data,
            database::data_tools::detect_preview_data,
            database::data_tools::inspect_backup,
            database::data_tools::create_backup,
            database::data_tools::restore_backup,
            database::data_tools::preview_migration,
            database::data_tools::import_preview,
            windows::open_panel,
            windows::get_layout_settings,
            windows::set_layout_density,
            windows::set_layout_options,
            windows::reset_window_layout,
            windows::set_window_dirty,
            windows::close_panel,
            connection::get_connection_status,
            connection::repair_browser_connection,
            connection::open_browser_extension,
            appearance::get_appearance,
            appearance::save_appearance,
            service::get_snapshot,
            service::start_task,
            service::pause_task,
            service::resume_task,
            service::finish_task,
            service::query_history,
            service::delete_record,
            service::get_pending_records,
            service::settle_record,
            service::get_monitor_config,
            service::get_category_names,
            service::save_category_names,
            service::save_monitor_config,
            sound::preview_sound,
            service::get_notice,
            service::defer_notice,
            service::show_main,
            service::exit_app,
        ])
        .build(tauri::generate_context!())
        .expect("WorkMemo failed to start")
        .run(|app, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                if windows::has_drafts(app) {
                    api.prevent_exit();
                    let _ = app.emit("workmemo:request-close", ());
                    return;
                }
                for (_, w) in app.webview_windows() {
                    let _ = windows::capture(&w.as_ref().window());
                }
                if let Err(error) = desktop::save_island_position(app) {
                    let _ = app.emit(
                        "workmemo:runtime-error",
                        format!("状态岛设置未能保存：{error}"),
                    );
                }
                if let Err(error) = app.state::<service::Backend>().save_on_exit() {
                    api.prevent_exit();
                    let _ = app.emit("workmemo:storage-error", error);
                } else {
                    dashboard::cleanup(app);
                }
            }
        });
}

#[cfg(debug_assertions)]
pub fn monitor_probe() -> String {
    let context: tauri::Context<tauri::Wry> = tauri::generate_context!();
    let application_id = &context.config().identifier;
    match native_activity::sample() {
        Ok(sample)=>serde_json::json!({"application_id":application_id,"native_available":sample.reliable,"unlocked":sample.unlocked,
            "chrome_foreground":sample.chrome_foreground,"last_input_age_ms":sample.at.ticks_ms.saturating_sub(sample.last_input_ticks)}).to_string(),
        Err(error)=>serde_json::json!({"application_id":application_id,"native_available":false,"error":error}).to_string(),
    }
}

pub fn prepare_demo_data() -> Result<String, String> {
    let context: tauri::Context<tauri::Wry> = tauri::generate_context!();
    let identifier = &context.config().identifier;
    let path = registration::data_root()?
        .join(identifier)
        .join("workmemo.sqlite3");
    let mut store = database::Store::open(&path, Box::new(clock::SystemClock::new()))?;
    let before = store.active()?.map(|r| r.id);
    let count = store.seed_demo()?;
    let after = store.active()?.map(|r| r.id);
    if before != after {
        return Err("演示准备未能保留活动任务。".into());
    }
    Ok(serde_json::json!({"version":env!("CARGO_PKG_VERSION"),"identifier":identifier,"demo_records":count,"active_preserved":true}).to_string())
}
~~~~~~

## E:\WorkMemo\src-tauri\src\registration.rs

~~~~~~rust
use serde::{Deserialize, Serialize};
use std::{
    fs,
    io::Write,
    path::{Path, PathBuf},
};

pub const CHROME_ROOT: &str = "Software\\Google\\Chrome\\NativeMessagingHosts";
pub const OWNER_VALUE: &str = "WorkMemoExecutable";
pub const PROFILE_VALUE: &str = "WorkMemoProfile";
pub const MANIFEST_NAME: &str = "browser-host.json";
pub const EXTENSION_ORIGIN: &str = "chrome-extension://oljcealhccdhaddceacnokihjefloaih/";

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BridgeInfo {
    pub identifier: String,
    pub version: String,
    pub protocol: u32,
    #[serde(default)]
    pub test_overrides: bool,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct NativeManifest {
    pub name: String,
    pub description: String,
    pub path: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub allowed_origins: Vec<String>,
}
#[derive(Clone, Debug, Serialize)]
pub struct RegistrationResult {
    pub registered: bool,
    pub changed: bool,
    pub host_name: String,
    pub manifest_path: String,
}
pub fn host_name(identifier: &str) -> Result<&'static str, String> {
    let valid = identifier.len() <= 128
        && identifier.split('.').all(|p| !p.is_empty())
        && identifier
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b == b'.' || b == b'-' || b == b'_');
    if !valid {
        return Err("通信组件的数据标识无效。".into());
    }
    if identifier == "com.workmemo.desktop" {
        Ok("com.workmemo.browser_bridge")
    } else if identifier.starts_with("com.workmemo.test.") {
        Ok("com.workmemo.browser_bridge_test")
    } else {
        Err("不支持的 WorkMemo 数据标识。".into())
    }
}
pub fn profile_for(binary: &Path, compiled_identifier: &str) -> Result<String, String> {
    let mut identifier = compiled_identifier.to_string();
    let profile = binary.with_file_name("workmemo-browser.profile.json");
    match fs::read(profile) {
        Ok(bytes) => {
            if bytes.len() > 4096 {
                return Err("通信组件配置过大。".into());
            }
            #[derive(Deserialize)]
            #[serde(deny_unknown_fields)]
            struct Profile {
                identifier: String,
            }
            identifier = serde_json::from_slice::<Profile>(&bytes)
                .map_err(|_| "通信组件配置无效。")?
                .identifier;
        }
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => (),
        Err(_) => return Err("无法读取通信组件配置。".into()),
    }
    #[cfg(debug_assertions)]
    if let Ok(value) = std::env::var("WORKMEMO_TEST_PROFILE") {
        if !value.starts_with("com.workmemo.test.") {
            return Err("test profile".into());
        }
        identifier = value;
    }
    host_name(&identifier)?;
    Ok(identifier)
}
pub fn regular_path(path: &Path) -> Result<String, String> {
    let value = path.to_str().ok_or("组件路径无法表示为 Unicode。")?;
    Ok(if let Some(tail) = value.strip_prefix(r"\\?\UNC\") {
        format!(r"\\{tail}")
    } else {
        value.strip_prefix(r"\\?\").unwrap_or(value).to_string()
    })
}
pub fn data_root() -> Result<PathBuf, String> {
    #[cfg(debug_assertions)]
    if std::env::var("WORKMEMO_TEST_REGISTRY_ROOT")
        .is_ok_and(|s| s.starts_with("Software\\WorkMemo\\RegistrationTests\\"))
    {
        if let Some(root) = std::env::var_os("WORKMEMO_TEST_DATA_ROOT") {
            return Ok(root.into());
        }
    }
    std::env::var_os("LOCALAPPDATA")
        .map(PathBuf::from)
        .ok_or("无法定位当前用户数据目录。".into())
}
pub fn registry_root() -> String {
    #[cfg(debug_assertions)]
    if let Ok(root) = std::env::var("WORKMEMO_TEST_REGISTRY_ROOT") {
        if root.starts_with("Software\\WorkMemo\\RegistrationTests\\") && !root.contains('\0') {
            return root;
        }
    }
    CHROME_ROOT.into()
}

#[cfg(windows)]
pub(crate) mod windows_registry {
    use windows_sys::Win32::System::Registry::*;
    fn wide(s: &str) -> Vec<u16> {
        s.encode_utf16().chain(Some(0)).collect()
    }
    pub struct Key(pub HKEY);
    impl Drop for Key {
        fn drop(&mut self) {
            unsafe {
                RegCloseKey(self.0);
            }
        }
    }
    impl Key {
        pub fn open(path: &str, create: bool, view: u32) -> Result<Option<Self>, String> {
            let path = wide(path);
            let mut key = std::ptr::null_mut();
            let code = unsafe {
                if create {
                    RegCreateKeyExW(
                        HKEY_CURRENT_USER,
                        path.as_ptr(),
                        0,
                        std::ptr::null(),
                        REG_OPTION_NON_VOLATILE,
                        KEY_READ | KEY_WRITE | view,
                        std::ptr::null(),
                        &mut key,
                        std::ptr::null_mut(),
                    )
                } else {
                    RegOpenKeyExW(
                        HKEY_CURRENT_USER,
                        path.as_ptr(),
                        0,
                        KEY_READ | KEY_WRITE | view,
                        &mut key,
                    )
                }
            };
            if !create && code == 2 {
                return Ok(None);
            }
            if code != 0 {
                return Err(format!(
                    "无法访问当前用户的 Chrome 主机注册（Windows {code}）。"
                ));
            }
            Ok(Some(Self(key)))
        }
        pub fn read(&self, name: &str) -> Result<Option<String>, String> {
            let name = wide(name);
            let mut kind = 0;
            let mut length = 0;
            let code = unsafe {
                RegQueryValueExW(
                    self.0,
                    name.as_ptr(),
                    std::ptr::null_mut(),
                    &mut kind,
                    std::ptr::null_mut(),
                    &mut length,
                )
            };
            if code == 2 {
                return Ok(None);
            }
            if code != 0 || kind != REG_SZ || length > 32768 {
                return Err("Chrome 主机注册数据无效。".into());
            }
            let mut data = vec![0u16; (length as usize).div_ceil(2)];
            let code = unsafe {
                RegQueryValueExW(
                    self.0,
                    name.as_ptr(),
                    std::ptr::null_mut(),
                    &mut kind,
                    data.as_mut_ptr().cast(),
                    &mut length,
                )
            };
            if code != 0 {
                return Err(format!("无法读取 Chrome 主机注册（Windows {code}）。"));
            }
            while data.last() == Some(&0) {
                data.pop();
            }
            String::from_utf16(&data)
                .map(Some)
                .map_err(|_| "Chrome 主机注册编码无效。".into())
        }
        pub fn write(&self, name: &str, value: &str) -> Result<(), String> {
            let name = wide(name);
            let value = wide(value);
            let code = unsafe {
                RegSetValueExW(
                    self.0,
                    name.as_ptr(),
                    0,
                    REG_SZ,
                    value.as_ptr().cast(),
                    (value.len() * 2) as u32,
                )
            };
            if code != 0 {
                return Err(format!(
                    "无法注册 Chrome 本机通信（Windows {code}），请在运行 Chrome 的同一 Windows 用户下操作。"
                ));
            }
            Ok(())
        }
        pub fn remove(&self, name: &str) -> Result<(), String> {
            let code = unsafe { RegDeleteValueW(self.0, wide(name).as_ptr()) };
            if code != 0 && code != 2 {
                return Err(format!("无法移除所属主机注册（Windows {code}）。"));
            }
            Ok(())
        }
    }
    pub fn remove_empty(path: &str, view: u32) {
        unsafe {
            RegDeleteKeyExW(HKEY_CURRENT_USER, wide(path).as_ptr(), view, 0);
        }
    }
}

pub fn registration_at(
    binary: &Path,
    identifier: &str,
    data: &Path,
    root: &str,
    repair: bool,
) -> Result<RegistrationResult, String> {
    let name = host_name(identifier)?.to_string();
    if !binary.is_file() {
        return Err("缺少配套通信组件，请完整解压或重新安装 WorkMemo。".into());
    }
    let executable = regular_path(&binary.canonicalize().map_err(|_| "无法定位通信组件。")?)?;
    let folder = data.join(identifier);
    let path = folder.join(MANIFEST_NAME);
    let path_text = regular_path(&path)?;
    let expected = NativeManifest {
        name: name.clone(),
        description: "WorkMemo local browser bridge".into(),
        path: executable.clone(),
        kind: "stdio".into(),
        allowed_origins: vec![EXTENSION_ORIGIN.into()],
    };
    #[cfg(windows)]
    {
        use windows_registry::Key;
        let key_path = format!("{root}\\{name}");
        let mut registered = true;
        for view in [
            windows_sys::Win32::System::Registry::KEY_WOW64_32KEY,
            windows_sys::Win32::System::Registry::KEY_WOW64_64KEY,
        ] {
            let previous = Key::open(&key_path, false, view)?;
            registered &= if let Some(key) = previous.as_ref() {
                key.read("")?
                    .is_some_and(|v| v.eq_ignore_ascii_case(&path_text))
                    && key
                        .read(OWNER_VALUE)?
                        .is_some_and(|v| v.eq_ignore_ascii_case(&executable))
                    && key.read(PROFILE_VALUE)?.as_deref() == Some(identifier)
            } else {
                false
            };
        }
        registered &= fs::read(&path)
            .ok()
            .and_then(|v| serde_json::from_slice::<NativeManifest>(&v).ok())
            .as_ref()
            == Some(&expected);
        if registered || !repair {
            return Ok(RegistrationResult {
                registered,
                changed: false,
                host_name: name,
                manifest_path: path_text,
            });
        }
        fs::create_dir_all(&folder).map_err(|_| "无法写入当前用户的通信配置目录。")?;
        let temporary = folder.join(format!("browser-host.{}.pending", std::process::id()));
        let bytes = serde_json::to_vec_pretty(&expected).map_err(|e| e.to_string())?;
        let saved = (|| -> Result<(), String> {
            let mut file = fs::File::create(&temporary).map_err(|_| "无法保存通信主机清单。")?;
            file.write_all(&bytes)
                .and_then(|_| file.sync_all())
                .map_err(|_| "无法保存通信主机清单。")?;
            drop(file);
            fs::rename(&temporary, &path).map_err(|_| "无法更新通信主机清单。")?;
            Ok(())
        })();
        if saved.is_err() {
            let _ = fs::remove_file(&temporary);
        }
        saved?;
        for view in [
            windows_sys::Win32::System::Registry::KEY_WOW64_32KEY,
            windows_sys::Win32::System::Registry::KEY_WOW64_64KEY,
        ] {
            let key = Key::open(&key_path, true, view)?.ok_or("无法创建 Chrome 主机注册。")?;
            key.write(OWNER_VALUE, &executable)?;
            key.write(PROFILE_VALUE, identifier)?;
            key.write("", &path_text)?;
        }
        Ok(RegistrationResult {
            registered: true,
            changed: true,
            host_name: name,
            manifest_path: path_text,
        })
    }
    #[cfg(not(windows))]
    {
        let _ = (expected, root, repair);
        Err("本机通信自动接入目前仅支持 Windows。".into())
    }
}

pub fn unregister_at(
    binary: &Path,
    identifier: &str,
    data: &Path,
    root: &str,
) -> Result<bool, String> {
    let name = host_name(identifier)?;
    let executable = regular_path(binary)?;
    let path = data.join(identifier).join(MANIFEST_NAME);
    let path_text = regular_path(&path)?;
    #[cfg(windows)]
    {
        use windows_registry::Key;
        let key_path = format!("{root}\\{name}");
        let owned = fs::read(&path)
            .ok()
            .and_then(|b| serde_json::from_slice::<NativeManifest>(&b).ok())
            .is_some_and(|m| m.path.eq_ignore_ascii_case(&executable));
        let mut removed = false;
        for view in [
            windows_sys::Win32::System::Registry::KEY_WOW64_32KEY,
            windows_sys::Win32::System::Registry::KEY_WOW64_64KEY,
        ] {
            let Some(key) = Key::open(&key_path, false, view)? else {
                continue;
            };
            if !key
                .read(OWNER_VALUE)?
                .is_some_and(|p| p.eq_ignore_ascii_case(&executable))
                || !key
                    .read("")?
                    .is_some_and(|p| p.eq_ignore_ascii_case(&path_text))
            {
                continue;
            }
            key.remove("")?;
            key.remove(OWNER_VALUE)?;
            key.remove(PROFILE_VALUE)?;
            drop(key);
            windows_registry::remove_empty(&key_path, view);
            removed = true;
        }
        if removed && owned {
            fs::remove_file(path).map_err(|_| "所属注册已移除，但旧主机清单未能清理。")?;
        }
        Ok(removed)
    }
    #[cfg(not(windows))]
    {
        let _ = (name, executable, path_text, root);
        Err("当前系统不支持此接入方式。".into())
    }
}
~~~~~~

## E:\WorkMemo\src-tauri\src\service.rs

~~~~~~rust
use crate::{
    browser_bridge,
    monitor::{ConfigInput, MonitorConfig, NativeSample},
    native_activity,
};
use crate::{
    clock::{Clock, SystemClock},
    database::{
        HistoryPage, HistoryQuery, Notice, Result, SettleInput, Snapshot, StartInput, Store,
        WorkRecord,
    },
};
use std::{
    sync::{
        Arc, Mutex,
        atomic::{AtomicBool, Ordering},
    },
    time::Duration,
};
use tauri::{Emitter, Manager, State};

pub(crate) type SharedStore = Arc<Mutex<Result<Store>>>;
pub struct Backend {
    pub(crate) inner: SharedStore,
    pub tray_ready: AtomicBool,
    pub exiting: AtomicBool,
}

impl Backend {
    pub fn initialize(app: &tauri::App) -> Self {
        let directory = app.path().app_local_data_dir();
        let opened = app
            .path()
            .app_local_data_dir()
            .map_err(|e| format!("无法定位本地数据目录：{e}"))
            .and_then(|directory| {
                Store::open(
                    &directory.join("workmemo.sqlite3"),
                    Box::new(SystemClock::new()),
                )
            });
        let inner = Arc::new(Mutex::new(opened));
        if let Ok(mut guard) = inner.lock() {
            if let Ok(store) = guard.as_mut() {
                if let Ok(dir) = app.path().app_config_dir() {
                    if let Err(e) = crate::database::data_tools::recover_pending(store, &dir) {
                        *guard = Err(e);
                    }
                }
                if let Ok(store) = guard.as_mut() {
                    store.sound_config = app
                        .path()
                        .app_config_dir()
                        .ok()
                        .map(|p| p.join("window-layout.json"));
                    store.activate_monitoring();
                }
            }
        }
        if let Ok(directory) = directory {
            let ready = inner.lock().ok().is_some_and(|g| g.is_ok());
            if ready {
                if let Err(error) = browser_bridge::start(inner.clone(), &directory) {
                    if let Ok(mut guard) = inner.lock() {
                        if let Ok(store) = guard.as_mut() {
                            store.warning = Some(error);
                        }
                    }
                } else {
                    let handle = app.handle().clone();
                    std::thread::spawn(move || {
                        let _ = handle
                            .state::<crate::connection::ConnectionState>()
                            .refresh(true);
                    });
                }
            }
        }
        let weak = Arc::downgrade(&inner);
        let app_handle = app.handle().clone();
        let signals = native_activity::listen();
        std::thread::spawn(move || {
            let mut presented = None;
            let mut last_pending = None;
            let mut listener_ok = true;
            let mut reported_error: Option<String> = None;
            loop {
                std::thread::sleep(Duration::from_secs(1));
                let Some(shared) = weak.upgrade() else {
                    break;
                };
                let mut notice = None;
                let mut active_id = None;
                let mut candidate_id = None;
                let mut browsing = false;
                let mut runtime_failure: Option<String> = None;
                // Sample after the preceding loop has finished creating and positioning the window.
                // Creation emits transient move events, so those events must not overwrite saved coordinates.
                if let Some(window) = app_handle.get_webview_window("notice") {
                    if let Ok(position) = window.outer_position() {
                        app_handle
                            .state::<crate::desktop::IslandState>()
                            .moved(position);
                    }
                }
                if let Err(error) = app_handle.state::<crate::desktop::IslandState>().flush() {
                    runtime_failure = Some(format!("状态岛设置未能保存：{error}"));
                }
                if let Ok(mut guard) = shared.lock() {
                    if let Ok(store) = guard.as_mut() {
                        observe_sound(store, false);
                        let now = SystemClock::new().now();
                        for signal in signals.try_iter() {
                            match signal {
                                Ok(signal) => {
                                    if !signal.available {
                                        if let Err(error) = store.system_unavailable(signal.at) {
                                            store.warning = Some(error.clone());
                                            runtime_failure = Some(error);
                                        }
                                    }
                                    store.monitor.native = None;
                                }
                                Err(error) => {
                                    listener_ok = false;
                                    store.monitor.events_failed = true;
                                    store.warning = Some(error.clone());
                                    runtime_failure = Some(error);
                                    let _ = store.system_unavailable(now);
                                }
                            }
                        }
                        let sample = if store.monitor_sample_due(now.ticks_ms) {
                            match native_activity::sample() {
                                Ok(mut sample) => {
                                    sample.reliable &= listener_ok;
                                    sample
                                }
                                Err(error) => {
                                    store.warning = Some(error.clone());
                                    runtime_failure = Some(error);
                                    NativeSample {
                                        at: now,
                                        last_input_ticks: 0,
                                        chrome_foreground: false,
                                        unlocked: false,
                                        reliable: false,
                                    }
                                }
                            }
                        } else {
                            store.monitor.native.unwrap()
                        };
                        let now = SystemClock::new().now();
                        if let Err(error) = store.monitor_tick(sample, now) {
                            store.warning = Some(error.clone());
                            runtime_failure = Some(error);
                        }
                        observe_sound(store, true);
                        match store.current_notice() {
                            Ok(value) => notice = value,
                            Err(error) => {
                                store.warning = Some(error.clone());
                                runtime_failure = Some(error);
                            }
                        }
                        match store.snapshot() {
                            Ok(snapshot) => {
                                if last_pending != Some(snapshot.pending_count) {
                                    let _ = app_handle.emit("workmemo:data-changed", ());
                                    last_pending = Some(snapshot.pending_count);
                                }
                                candidate_id =
                                    snapshot.monitoring.start_candidate.as_ref().map(|c| c.id);
                                browsing = snapshot.monitoring.browsing_only;
                                active_id = snapshot.active.map(|record| record.id);
                            }
                            Err(error) => runtime_failure = Some(error),
                        }
                    }
                }
                let key = notice
                    .as_ref()
                    .map(|n| format!("{}:{}", n.kind, n.record.id))
                    .or_else(|| candidate_id.map(|id| format!("candidate:{id}")))
                    .or_else(|| {
                        if browsing && app_handle.state::<crate::desktop::IslandState>().enabled() {
                            return Some("browsing".into());
                        }
                        app_handle
                            .state::<crate::desktop::IslandState>()
                            .enabled()
                            .then_some(active_id)
                            .flatten()
                            .map(|id| format!("active:{id}"))
                    });
                let key = key.or_else(|| {
                    app_handle
                        .state::<crate::desktop::IslandState>()
                        .holding
                        .load(Ordering::Relaxed)
                        .then(|| "expanded".into())
                });
                if key != presented {
                    match crate::desktop::present_notice(
                        &app_handle,
                        key.is_some(),
                        notice.is_some(),
                        candidate_id.is_some(),
                    ) {
                        Ok(()) => presented = key,
                        Err(error) => {
                            let message =
                                format!("提醒窗口未能显示，记录仍保留在待补全列表：{error}");
                            if let Ok(mut guard) = shared.lock() {
                                if let Ok(store) = guard.as_mut() {
                                    store.warning = Some(message.clone());
                                }
                            }
                            runtime_failure = Some(message);
                        }
                    }
                }
                if let Some(error) = runtime_failure {
                    if reported_error.as_ref() != Some(&error) {
                        // Surface background failures without stealing keyboard focus.
                        if let Some(window) = app_handle.get_webview_window("main") {
                            let _ = crate::desktop::set_visibility(
                                &window.as_ref().window(),
                                true,
                                false,
                            );
                        }
                        let _ = app_handle.emit("workmemo:runtime-error", error.clone());
                    }
                    reported_error = Some(error);
                } else if listener_ok {
                    if let Ok(mut guard) = shared.lock() {
                        if let Ok(store) = guard.as_mut() {
                            if store.monitor.native.is_some_and(|sample| sample.reliable) {
                                if let Some(previous) = reported_error.take() {
                                    if store.warning.as_ref() == Some(&previous) {
                                        store.warning = None;
                                    }
                                    let _ = app_handle.emit("workmemo:runtime-recovered", previous);
                                }
                            }
                        }
                    }
                }
            }
        });
        Self {
            inner,
            tray_ready: AtomicBool::new(false),
            exiting: AtomicBool::new(false),
        }
    }

    pub fn save_on_exit(&self) -> Result<()> {
        let mut guard = self
            .inner
            .lock()
            .map_err(|_| "数据服务锁异常，未能保存当前任务。")?;
        // A window showing a startup database error must still be closable.
        if let Ok(store) = guard.as_mut() {
            if let Err(error) = store.pause_for_close() {
                store.warning = Some(format!("关闭时保存失败，已阻止关闭，请重试：{error}"));
                return Err(error);
            }
        }
        Ok(())
    }
}

pub(crate) async fn access<T: Send + 'static>(
    shared: SharedStore,
    action: impl FnOnce(&mut Store) -> Result<T> + Send + 'static,
) -> Result<T> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut guard = shared
            .lock()
            .map_err(|_| "本地数据服务异常，请重新打开应用。")?;
        let store = guard.as_mut().map_err(|e| e.clone())?;
        observe_sound(store, false);
        let result = action(store);
        observe_sound(store, true);
        result
    })
    .await
    .map_err(|e| format!("数据操作未能完成：{e}"))?
}

async fn execute(
    shared: SharedStore,
    action: impl FnOnce(&mut Store) -> Result<()> + Send + 'static,
) -> Result<Snapshot> {
    access(shared, move |store| {
        // Resolve expired automatic deadlines before a manual command can
        // pause/finish the same record or start another one.
        before_action(store)?;
        action(store)?;
        store.snapshot()
    })
    .await
}

fn before_action(store: &mut Store) -> Result<()> {
    if store.monitor.active {
        let sample = native_activity::sample();
        let now = SystemClock::new().now();
        let mut sample = sample.unwrap_or(NativeSample {
            at: now,
            last_input_ticks: 0,
            chrome_foreground: false,
            unlocked: false,
            reliable: false,
        });
        sample.reliable &= !store.monitor.events_failed;
        store.monitor_tick(sample, now)?;
    }
    Ok(())
}

#[tauri::command]
pub async fn query_history(state: State<'_, Backend>, query: HistoryQuery) -> Result<HistoryPage> {
    access(state.inner.clone(), move |store| store.query_history(query)).await
}

#[tauri::command]
pub async fn delete_record(state: State<'_, Backend>, id: i64) -> Result<()> {
    access(state.inner.clone(), move |store| store.delete_record(id)).await
}

#[tauri::command]
pub async fn get_snapshot(state: State<'_, Backend>) -> Result<Snapshot> {
    access(state.inner.clone(), |store| store.snapshot()).await
}

#[tauri::command]
pub async fn start_task(
    state: State<'_, Backend>,
    input: StartInput,
    expected_active_id: Option<i64>,
) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| {
        store.start_checked(input, expected_active_id)
    })
    .await
}

#[tauri::command]
pub async fn pause_task(state: State<'_, Backend>, id: i64) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| store.pause(id)).await
}

#[tauri::command]
pub async fn resume_task(state: State<'_, Backend>, id: i64) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| store.resume(id)).await
}

#[tauri::command]
pub async fn finish_task(state: State<'_, Backend>, id: i64) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| store.finish(id)).await
}

#[tauri::command]
pub async fn get_pending_records(state: State<'_, Backend>) -> Result<Vec<WorkRecord>> {
    access(state.inner.clone(), |store| store.pending_records()).await
}

#[tauri::command]
pub async fn settle_record(state: State<'_, Backend>, input: SettleInput) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| store.settle(input)).await
}

#[tauri::command]
pub async fn get_monitor_config(state: State<'_, Backend>) -> Result<MonitorConfig> {
    access(state.inner.clone(), |store| store.monitor_config()).await
}
#[tauri::command]
pub async fn get_category_names(
    state: State<'_, Backend>,
) -> Result<crate::database::categories::CategoryNames> {
    access(state.inner.clone(), |store| store.category_names()).await
}
#[tauri::command]
pub async fn save_category_names(
    app: tauri::AppHandle,
    state: State<'_, Backend>,
    input: crate::database::categories::CategoryNames,
) -> Result<crate::database::categories::CategoryNames> {
    let saved = access(state.inner.clone(), move |store| {
        store.save_category_names(input)
    })
    .await?;
    let _ = app.emit("workmemo:categories-changed", ());
    Ok(saved)
}
#[tauri::command]
pub async fn save_monitor_config(
    state: State<'_, Backend>,
    input: ConfigInput,
) -> Result<MonitorConfig> {
    access(state.inner.clone(), move |store| {
        before_action(store)?;
        store.save_monitor_config(input)
    })
    .await
}
#[tauri::command]
pub async fn get_notice(state: State<'_, Backend>) -> Result<Option<Notice>> {
    access(state.inner.clone(), |store| store.current_notice()).await
}
#[tauri::command]
pub async fn defer_notice(state: State<'_, Backend>, id: i64, kind: String) -> Result<()> {
    access(state.inner.clone(), move |store| {
        store.defer_notice(id, &kind)
    })
    .await
}
#[tauri::command]
pub fn show_main(app: tauri::AppHandle, settlement: bool) -> Result<()> {
    crate::desktop::show_main(&app, settlement)
}
#[tauri::command]
pub fn exit_app(app: tauri::AppHandle, state: State<'_, Backend>) -> Result<()> {
    if let Err(error) = crate::desktop::save_island_position(&app) {
        let _ = app.emit(
            "workmemo:runtime-error",
            format!("状态岛设置未能保存：{error}"),
        );
    }
    if crate::windows::has_drafts(&app) {
        let _ = app.emit("workmemo:request-close", ());
        return Err("请先保存或放弃二级窗口中的修改，再退出。".into());
    }
    state.save_on_exit()?;
    state.exiting.store(true, Ordering::Relaxed);
    app.exit(0);
    Ok(())
}

pub fn handle_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        let backend = window.state::<Backend>();
        let _ = crate::windows::capture(window);
        if matches!(window.label(), "settings" | "history" | "settlement") {
            api.prevent_close();
            let _ = window.emit("workmemo:request-close", ());
            return;
        }
        if window.label() == "notice" {
            api.prevent_close();
            if window
                .state::<crate::desktop::IslandState>()
                .holding
                .load(Ordering::Relaxed)
            {
                let _ = window.emit("workmemo:request-close", ());
                return;
            }
            let result = (|| -> Result<()> {
                let mut guard = backend.inner.lock().map_err(|_| "本地服务锁异常。")?;
                let store = guard.as_mut().map_err(|e| e.clone())?;
                if let Some(notice) = store.current_notice()? {
                    store.defer_notice(notice.record.id, &notice.kind)?;
                } else {
                    window.state::<crate::desktop::IslandState>().disable()?;
                }
                Ok(())
            })();
            if let Err(error) = result {
                let _ = window.emit("workmemo:storage-error", error);
            }
            return;
        }
        if window.label() == "main"
            && backend.tray_ready.load(Ordering::Relaxed)
            && !backend.exiting.load(Ordering::Relaxed)
        {
            api.prevent_close();
            if let Err(error) = crate::desktop::set_visibility(window, false, false) {
                let _ = window.emit("workmemo:storage-error", error.to_string());
            }
            return;
        }
        if let Err(error) = window.state::<Backend>().save_on_exit() {
            api.prevent_close();
            let _ = window.emit("workmemo:storage-error", error);
        }
    }
}

#[tauri::command]
pub async fn enter_browsing(state: State<'_, Backend>) -> Result<Snapshot> {
    execute(state.inner.clone(), |store| store.enter_browsing()).await
}
#[tauri::command]
pub async fn confirm_work(
    state: State<'_, Backend>,
    candidate_id: Option<u64>,
) -> Result<Snapshot> {
    let own = crate::native_activity::own_process_foreground();
    execute(state.inner.clone(), move |store| {
        store.confirm_work(candidate_id, own)
    })
    .await
}

fn observe_sound(store: &mut Store, enabled: bool) {
    if let Ok(active) = store.active() {
        let state = active.map(|r| crate::sound::Status {
            id: r.id,
            paused: r.is_paused,
            recovery: r.recovery_pending,
        });
        let cues = store
            .sounds
            .observe(state, store.monitor.status.idle_warning);
        if enabled {
            if let Some(layout) = store
                .sound_config
                .as_ref()
                .and_then(|p| crate::windows::load(p).ok())
                .filter(|layout| layout.sound_enabled)
            {
                if let Some(cue) = cues.first() {
                    let _ = crate::sound::play(*cue, layout.sound_theme);
                }
            }
        }
    }
}
~~~~~~

## E:\WorkMemo\src-tauri\src\startup.rs

~~~~~~rust
use serde::{Deserialize, Serialize};
use std::{path::PathBuf, sync::Mutex};
use tauri::{Emitter, Manager};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Preference {
    version: u8,
    enabled: bool,
}

pub struct StartupState {
    path: PathBuf,
    gate: Mutex<()>,
    initial_error: Mutex<Option<String>>,
}

#[derive(Serialize)]
pub struct StartupStatus {
    enabled: bool,
    available: bool,
    error: Option<String>,
}

fn decode(bytes: &[u8]) -> Result<Preference, String> {
    let value: Preference = serde_json::from_slice(bytes).map_err(|e| e.to_string())?;
    if value.version != 1 {
        return Err("开机启动设置版本不受支持，原文件已保留。".into());
    }
    Ok(value)
}

fn persist(path: &std::path::Path, enabled: bool) -> Result<(), String> {
    use std::io::Write;
    std::fs::create_dir_all(path.parent().ok_or("启动配置目录无效")?).map_err(|e| e.to_string())?;
    let temporary = path.with_extension("pending");
    let mut file = std::fs::File::create(&temporary).map_err(|e| e.to_string())?;
    file.write_all(
        &serde_json::to_vec(&Preference {
            version: 1,
            enabled,
        })
        .map_err(|e| e.to_string())?,
    )
    .and_then(|_| file.sync_all())
    .map_err(|e| e.to_string())?;
    drop(file);
    std::fs::rename(temporary, path).map_err(|e| e.to_string())
}

fn available(app: &tauri::AppHandle) -> bool {
    cfg!(windows) && !cfg!(debug_assertions) && app.config().identifier == "com.workmemo.desktop"
}

#[cfg(windows)]
fn register(app: &tauri::AppHandle, enabled: bool) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;
    let manager = app.autolaunch();
    let previous = startup_key(false)?
        .map(|key| key.read("WorkMemo"))
        .transpose()?
        .flatten();
    if enabled {
        let result = manager
            .enable()
            .map_err(|e| e.to_string())
            .and_then(|_| refresh_path());
        if let Err(error) = result {
            let restored = (|| {
                if let Some(key) = startup_key(previous.is_some())? {
                    if let Some(value) = previous {
                        key.write("WorkMemo", &value)?;
                    } else {
                        key.remove("WorkMemo")?;
                    }
                }
                Ok::<_, String>(())
            })();
            return Err(match restored {
                Ok(()) => error,
                Err(restore) => format!("{error}；原启动项恢复失败：{restore}"),
            });
        }
    } else if previous.is_some() {
        manager.disable().map_err(|e| e.to_string())?;
    }
    if manager.is_enabled().map_err(|e| e.to_string())? != enabled {
        return Err("系统启动项未能应用，请重试。".into());
    }
    Ok(())
}

#[cfg(windows)]
fn startup_key(create: bool) -> Result<Option<crate::registration::windows_registry::Key>, String> {
    crate::registration::windows_registry::Key::open(
        r"Software\Microsoft\Windows\CurrentVersion\Run",
        create,
        windows_sys::Win32::System::Registry::KEY_WOW64_64KEY,
    )
    .map_err(|e| format!("无法访问当前用户的开机启动项：{e}"))
}

fn startup_command(executable: &std::path::Path) -> String {
    format!("\"{}\" --autostart", executable.display())
}

#[cfg(windows)]
fn refresh_path() -> Result<(), String> {
    let key = startup_key(true)?.ok_or("启动项不可用")?;
    let command = startup_command(&std::env::current_exe().map_err(|e| e.to_string())?);
    key.write("WorkMemo", &command)?;
    if key.read("WorkMemo")?.as_deref() != Some(command.as_str()) {
        return Err("开机启动路径写入后校验失败".into());
    }
    Ok(())
}

pub fn initialize(app: &tauri::App) -> Result<StartupState, String> {
    let path = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?
        .join("startup.json");
    let mut initial_error = None;
    if available(app.handle()) {
        let result = (|| {
            let mut first_run = false;
            let preference = match std::fs::read(&path) {
                Ok(bytes) => decode(&bytes)?,
                Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
                    first_run = true;
                    persist(&path, true)?;
                    Preference {
                        version: 1,
                        enabled: true,
                    }
                }
                Err(e) => return Err(e.to_string()),
            };
            #[cfg(windows)]
            {
                use tauri_plugin_autostart::ManagerExt;
                if first_run || !preference.enabled {
                    register(app.handle(), preference.enabled)?;
                } else if app.autolaunch().is_enabled().map_err(|e| e.to_string())? {
                    // Update moved/updated executables without overriding Task Manager's choice.
                    refresh_path()?;
                } else {
                    persist(&path, false)?;
                }
            }
            let _ = preference;
            Ok::<_, String>(())
        })();
        initial_error = result.err();
    }
    Ok(StartupState {
        path,
        gate: Mutex::new(()),
        initial_error: Mutex::new(initial_error),
    })
}

#[tauri::command]
pub fn get_startup_status(
    app: tauri::AppHandle,
    window: tauri::Window,
) -> Result<StartupStatus, String> {
    if !matches!(window.label(), "settings" | "main") {
        return Err("窗口不匹配".into());
    }
    let state = app.state::<StartupState>();
    let available = available(&app);
    let mut enabled = false;
    let mut error = state
        .initial_error
        .lock()
        .map_err(|_| "启动状态锁异常")?
        .clone();
    #[cfg(windows)]
    if available {
        use tauri_plugin_autostart::ManagerExt;
        match app.autolaunch().is_enabled() {
            Ok(value) => enabled = value,
            Err(e) => error = Some(e.to_string()),
        }
    }
    Ok(StartupStatus {
        enabled,
        available,
        error,
    })
}

#[tauri::command]
pub fn set_startup_enabled(
    app: tauri::AppHandle,
    window: tauri::Window,
    enabled: bool,
) -> Result<StartupStatus, String> {
    if window.label() != "settings" || !available(&app) {
        return Err("仅正式 Windows 版本的设置窗口可以修改开机启动。".into());
    }
    let state = app.state::<StartupState>();
    let _guard = state.gate.lock().map_err(|_| "启动设置锁异常")?;
    let result = (|| {
        // Never replace a malformed preference, including when a toggle is retried.
        if state.path.exists() {
            decode(&std::fs::read(&state.path).map_err(|e| e.to_string())?)?;
        }
        persist(&state.path, enabled)?;
        #[cfg(windows)]
        register(&app, enabled)?;
        Ok::<_, String>(())
    })();
    *state.initial_error.lock().map_err(|_| "启动状态锁异常")? = result.as_ref().err().cloned();
    let _ = app.emit("workmemo:startup-changed", ());
    result?;
    Ok(StartupStatus {
        enabled,
        available: true,
        error: None,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn startup_preference_preserves_disabled_and_rejects_corruption() {
        assert!(!decode(br#"{"version":1,"enabled":false}"#).unwrap().enabled);
        assert!(decode(br#"{"version":1,"enabled":true}"#).unwrap().enabled);
        assert!(decode(br#"{"version":2,"enabled":true}"#).is_err());
        assert!(decode(br#"{"version":1}"#).is_err());
        assert!(decode(b"broken").is_err());
    }
    #[test]
    fn login_command_quotes_paths_with_spaces() {
        assert_eq!(
            startup_command(std::path::Path::new(r"C:\Work Memo\workmemo.exe")),
            "\"C:\\Work Memo\\workmemo.exe\" --autostart"
        );
    }
}
~~~~~~

## E:\WorkMemo\src-tauri\tauri.conf.json

~~~~~~json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "WorkMemo",
  "version": "0.2.4",
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
~~~~~~

## E:\WorkMemo\src-tauri\tauri.preview.conf.json

~~~~~~json
{
  "identifier": "com.workmemo.test.monitor",
  "productName": "WorkMemo Preview",
  "app": {
    "windows": [
      {
        "label": "main",
        "visible": false,
        "title": "WorkMemo 自动记录预览版（独立数据）",
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
    ]
  }
}
~~~~~~

## E:\WorkMemo\src\App.css

~~~~~~css
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);

:root {
  font-family: "Segoe UI", "Microsoft YaHei UI", sans-serif;
  color: #303b35;
  background: transparent;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
* { box-sizing: border-box; }
html, body, #root { width: 100%; height: 100%; margin: 0; background: transparent; }
body { overflow: hidden; }
button, input, select, textarea { font: inherit; }
button, input, select, textarea, summary { -webkit-tap-highlight-color: transparent; }
.desktop-frame { position: relative; width: 100%; height: 100%; padding: 8px; color: var(--text-primary); --panel: rgb(var(--surface-rgb) / var(--surface-opacity)); --content-gap: 12px; }
.desktop-frame[data-density="comfortable"] { --content-gap: 20px; }
.app-shell { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; border: 1px solid var(--window-border); border-radius: var(--window-radius); background: rgb(var(--window-rgb) / var(--window-opacity)); box-shadow: var(--window-shadow); }
.titlebar { display: grid; grid-template-columns: auto auto minmax(64px, 1fr) auto; align-items: center; gap: 12px; flex-shrink: 0; min-height: 56px; padding: 8px 14px; background: var(--header-background); user-select: none; }
.titlebar-drag { display: flex; align-items: center; gap: 8px; min-width: 0; min-height: 34px; cursor: grab; touch-action: none; }
.titlebar-drag:active { cursor: grabbing; }
.brand-mark { display: block; width: 28px; height: 28px; flex-shrink: 0; object-fit: contain; }
.brand-name { display: block; font-size: 13px; font-weight: 600; letter-spacing: -.25px; white-space: nowrap; }
.icon { width: 20px; height: 20px; flex-shrink: 0; }
.main-nav { display: flex; align-items: center; gap: 3px; }
button.nav-button { position: relative; width: 31px; height: 34px; padding: 5px; justify-content: center; color: var(--text-muted); background: transparent; box-shadow: none; border-radius: 9px; }
button.nav-button:hover:not(:disabled) { background: var(--control-hover); }
button.nav-button[aria-pressed="true"] { color: var(--accent-text); }
button.nav-button[aria-pressed="true"]::after { content: ""; position: absolute; height: 2px; left: 8px; right: 8px; bottom: -3px; border-radius: 2px; background: var(--accent); }
.category-strip { display: flex; gap: 6px; min-width: 0; overflow-x: auto; overflow-y: hidden; padding: 3px 0; overscroll-behavior-x: contain; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.category-strip::-webkit-scrollbar { height: 2px; }
.category-strip::-webkit-scrollbar-thumb { border-radius: 2px; background: var(--scroll-thumb); }
.category-strip:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 2px; border-radius: 6px; }
.category-chip { display: inline-flex; align-items: center; flex: 0 0 auto; gap: 6px; padding: 5px 9px; border-radius: 9px; font-size: 11px; line-height: 1.5; color: var(--text-muted); background: rgb(var(--surface-rgb) / 30%); white-space: nowrap; }
.category-chip span { font-variant-numeric: tabular-nums; }
.category-chip[data-current="true"] { color: var(--accent-text); background: var(--control-hover); }
.window-controls { display: flex; flex-shrink: 0; gap: 3px; justify-self: end; grid-column: -2; }
.window-content { display: flex; flex-direction: column; min-height: 0; flex: 1; overflow-y: auto; overflow-x: hidden; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.window-content::-webkit-scrollbar { width: 6px; }
.window-content::-webkit-scrollbar-track { background: transparent; }
.window-content::-webkit-scrollbar-thumb { border-radius: 6px; background: var(--scroll-thumb); }
.workspace { width: 100%; max-width: 648px; margin: 0 auto; padding: var(--content-gap) 24px 18px; outline: none; }
.workspace.is-active { margin-block: auto; }
.window-error { flex-shrink: 0; margin: 8px 14px 0; padding: 8px 10px; max-height: 90px; overflow: auto; border-radius: var(--control-radius); background: var(--error-background); color: var(--error); font-size: 11px; line-height: 1.7; overflow-wrap: anywhere; }
.resize-handle { position: absolute; z-index: 10; touch-action: none; }
.resize-North, .resize-South { left: 12px; right: 12px; height: 8px; cursor: ns-resize; }
.resize-North { top: 0; }
.resize-South { bottom: 0; }
.resize-East, .resize-West { top: 12px; bottom: 12px; width: 8px; cursor: ew-resize; }
.resize-East { right: 0; }
.resize-West { left: 0; }
.resize-NorthEast, .resize-NorthWest, .resize-SouthEast, .resize-SouthWest { width: 12px; height: 12px; }
.resize-NorthEast { top: 0; right: 0; cursor: nesw-resize; }
.resize-NorthWest { top: 0; left: 0; cursor: nwse-resize; }
.resize-SouthEast { bottom: 0; right: 0; cursor: nwse-resize; }
.resize-SouthWest { bottom: 0; left: 0; cursor: nesw-resize; }
button { display: flex; justify-content: space-between; align-items: center; gap: 8px; width: 100%; padding: 11px 13px; background: var(--accent); color: var(--on-accent); border: 1px solid transparent; border-radius: var(--control-radius); font-size: 12px; cursor: pointer; box-shadow: var(--button-shadow); transition: background .15s; }
button:hover:not(:disabled) { background: var(--accent-hover); }
button:disabled { opacity: .5; cursor: not-allowed; }
button:focus-visible, summary:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 3px; }
button.secondary { background: var(--panel); color: var(--accent-text); border-color: var(--line); justify-content: center; box-shadow: none; }
button.secondary:hover:not(:disabled) { background: var(--secondary-hover); }
button.text-button { width: auto; background: transparent; color: var(--text-muted); border-color: var(--line); padding: 7px 10px; font-size: 10px; box-shadow: none; }
button.text-button:hover:not(:disabled) { background: var(--panel); }
button.window-control { width: 27px; height: 30px; padding: 5px; justify-content: center; border-radius: var(--control-radius); background: transparent; color: var(--text-muted); box-shadow: none; }
button.window-control:hover:not(:disabled) { background: var(--control-hover); }
button.window-close:hover:not(:disabled) { color: var(--on-close); background: var(--close-background); }
.window-control svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; }
.timer-card { width: min(100%, 560px); margin-inline: auto; padding: calc(var(--content-gap) + 4px); border: 1px solid var(--window-border); border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / calc(var(--window-opacity) * .62)); box-shadow: var(--panel-shadow); backdrop-filter: blur(12px); }

.task-copy { min-width: 0; }
.task-copy h1 { margin: 0; font-size: 20px; font-weight: 550; letter-spacing: -.4px; }
.task-summary { margin: 7px 0 0; color: var(--text-muted); font-size: 11px; line-height: 1.7; overflow-wrap: anywhere; }
.meta-dot { margin-inline: 7px; }
.state-label { font-size: 10px; color: var(--text-muted); }
.state-label.working { color: var(--accent-text); }
.state-label.working::before { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-right: 6px; }
.timer { display: block; flex-shrink: 0; font-family: var(--timer-font); text-shadow: var(--timer-shadow); font-size: clamp(24px, 4.6vw, 34px); font-weight: 550; font-variant-numeric: tabular-nums; letter-spacing: -.8px; line-height: 1.3; white-space: nowrap; }
.timer-long { font-size: clamp(18px, 3.5vw, 26px); }
.task-remark, .record-remark { font-size: 12px; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
.task-remark { max-height: 160px; overflow-y: auto; }
.actions { margin-top: calc(var(--content-gap) + 6px); }
.actions button { width: auto; justify-content: center; }
button.round-action { width: 42px; height: 42px; padding: 11px; flex: 0 0 auto; border-radius: 50%; }
.round-action .icon-pause { stroke-width: 3; }
.round-action .icon-play { fill: currentColor; stroke-width: 1; }
button.quiet-action { padding: 7px 3px; border: 0; border-radius: 7px; background: transparent; color: var(--text-muted); font-size: 12px; box-shadow: none; }
button.quiet-action:hover:not(:disabled) { background: var(--control-hover); color: var(--accent-text); }
button.quiet-action:not(.finish-action) { margin-inline: auto; }
.form-card { width: min(100%, 560px); margin: var(--content-gap) auto 0; }
.form-card h2 { font-size: 12px; color: var(--text-muted); font-weight: 500; margin: 0 0 9px; }
.work-form { display: grid; gap: 10px; }
.work-form > button { min-height: 34px; padding: 8px 12px; }
.form-note > summary { display: flex; align-items: center; gap: 5px; width: fit-content; font-size: 11px; list-style: none; }
.form-note > summary::-webkit-details-marker { display: none; }
.form-note .icon { width: 15px; height: 15px; }
.form-note[open] > summary { margin-bottom: 3px; }

label { display: block; font-size: 11px; line-height: 1.6; }
.optional { color: var(--text-muted); font-size: 10px; margin-left: 3px; }
input, select, textarea { display: block; width: 100%; margin-top: 5px; padding: 7px 10px; min-width: 0; border: 1px solid var(--line); border-radius: var(--control-radius); color: inherit; background: rgb(var(--input-rgb) / 96%); font-size: 12px; }
input::placeholder, textarea::placeholder { color: var(--text-muted); opacity: .85; }
option { color: var(--text-primary); background: rgb(var(--input-rgb)); }
input:disabled, select:disabled, textarea:disabled { opacity: .55; }
textarea { resize: vertical; min-height: 44px; max-height: 150px; line-height: 1.6; }
.hint { color: var(--text-muted); font-size: 10px; line-height: 1.8; margin: 9px 0 0; overflow-wrap: anywhere; }
.notice, .error-banner { border-radius: var(--control-radius); padding: 12px; margin: 0 0 16px; font-size: 11px; line-height: 1.8; overflow-wrap: anywhere; }
.notice { color: var(--notice-text); background: var(--notice-background); border: 1px solid var(--notice-border); }
.notice p { margin: 0 0 6px; }
.error-banner { color: var(--error); background: var(--error-background); border: 1px solid var(--error-border); }
.error-banner p { margin: 5px 0 0; }
.inline-error { font-size: 11px; color: var(--error); margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.field-error { display: block; margin-top: 6px; color: var(--error); font-size: 10px; overflow-wrap: anywhere; }
.field-count { display: block; text-align: right; margin-top: 4px; color: var(--text-muted); font-size: 10px; }
[aria-invalid="true"] { border-color: var(--error); }
.finished-card { border-color: var(--accent-text); }
.saved-feedback { margin: 14px 0 0; padding-top: 12px; border-top: 1px solid var(--line); color: var(--accent-text); font-size: 11px; line-height: 1.8; }
.switch-panel, .recent-panel, .connection-panel { margin-top: var(--content-gap); padding-top: 4px; font-size: 11px; }
.switch-panel { max-width: 560px; margin-inline: auto; }
summary { color: var(--text-muted); cursor: pointer; padding: 3px 0; }
details[open] > summary { margin-bottom: 15px; }
.connection-panel { margin-top: 15px; font-size: 10px; }
.connection-panel > p { font-size: 11px; }
.connection-panel button { margin-top: 10px; }
.record-list { list-style: none; padding: 0; margin: 0; }
.record-list li { padding: 12px 0; border-bottom: 1px solid var(--line); }
.record-list li:last-child { border-bottom: 0; }
.record-heading { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 12px; }
.record-heading strong { font-weight: 550; }
.record-heading span { font-variant-numeric: tabular-nums; color: var(--accent-text); }
.record-remark { margin: 7px 0 0; font-size: 11px; }
.appearance-feedback { margin: 0 0 10px; color: var(--accent-text); }
.preview-notice { padding: 6px 9px; margin-bottom: 10px; font-size: 10px; }
.appearance-error-detail { font-size: 10px; }
.appearance-dialog { width: min(390px, calc(100% - 40px)); max-height: calc(100% - 36px); margin: auto; padding: 19px; color: var(--text-primary); background: rgb(var(--surface-rgb)); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.appearance-dialog::backdrop { background: transparent; }
.settings-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.settings-heading h2 { margin: 0; font-size: 17px; font-weight: 600; }
.settings-heading button { font-size: 22px; line-height: 1; }
.theme-fieldset { padding: 0; margin: 20px 0; border: 0; min-width: 0; }
.theme-fieldset legend { margin-bottom: 10px; padding: 0; font-size: 11px; color: var(--text-muted); }

button.theme-choice { display: flex; align-items: center; gap: 9px; padding: 12px 10px; text-align: left; background: rgb(var(--window-rgb)); color: var(--text-primary); border: 1px solid var(--line); border-radius: var(--control-radius); box-shadow: none; }
button.theme-choice:hover:not(:disabled) { background: rgb(var(--surface-rgb)); }
button.theme-choice[aria-pressed="true"] { outline: 2px solid var(--accent-text); outline-offset: 1px; }
.theme-sample { display: grid; align-content: center; gap: 4px; flex-shrink: 0; width: 30px; height: 35px; padding: 5px; border-radius: 5px; background: rgb(var(--surface-rgb)); border: 1px solid var(--line); }
.theme-sample span { height: 2px; width: 100%; background: var(--text-muted); border-radius: 2px; }
.theme-sample span:first-child { width: 60%; height: 4px; background: var(--accent); }
.theme-label { display: grid; gap: 5px; min-width: 0; }
.theme-label strong { font-size: 12px; font-weight: 600; }
.theme-label > span { font-size: 9px; color: var(--text-muted); white-space: nowrap; }
.opacity-heading { display: flex; align-items: center; justify-content: space-between; }
.opacity-heading output { font-size: 12px; font-variant-numeric: tabular-nums; color: var(--accent-text); }
input.opacity-slider { padding: 0; margin: 10px 0 3px; border: 0; background: transparent; min-height: 24px; accent-color: var(--accent); cursor: pointer; }
.opacity-scale { display: flex; justify-content: space-between; color: var(--text-muted); font-size: 9px; }
button.reset-opacity { margin: 15px 0 0; padding: 6px 8px; font-size: 10px; }
.settings-actions { margin-top: 20px; }
.settings-actions button { justify-content: center; }
.appearance-dialog > .notice, .appearance-dialog > .error-banner { margin: 14px 0 0; }
@media (max-width: 540px) {
  .brand-name { font-size: 12px; }
  .titlebar { gap: 8px; padding-inline: 10px; }
  .workspace { padding-inline: 14px; }
}
@media (max-width: 380px) {
  .titlebar { gap: 4px; padding-inline: 8px; }
  .titlebar-drag { gap: 6px; }
  .brand-name { font-size: 11px; }
  .brand-mark { width: 25px; height: 25px; }
  button.nav-button { width: 27px; }
  .main-nav { gap: 0; }
  .window-controls { gap: 0; }
  .titlebar .window-control { width: 24px; }
  .workspace { padding-inline: 10px; }
  .task-row { gap: 10px; }
  .timer-card { padding: var(--content-gap); }
  .task-copy h1 { font-size: 17px; }
  .actions { gap: 14px; }
}
@media (prefers-reduced-motion: reduce) { button { transition: none; } }
.history-entry { margin-top: 15px; }
.history-dialog, .delete-dialog { width: min(500px, calc(100% - 32px)); max-height: calc(100% - 32px); margin: auto; padding: 19px; color: var(--text-primary); background: rgb(var(--surface-rgb)); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.history-dialog::backdrop, .delete-dialog::backdrop { background: rgb(0 0 0 / 25%); }
.history-filters { display: grid; gap: 10px; margin-top: 18px; }
.history-filters input, .history-filters select { padding: 9px 6px; font-size: 11px; }
.history-filters .hint { margin-top: 0; }
.filter-category-row { display: grid; grid-template-columns: 1fr 90px; gap: 12px; align-items: end; }
.filter-category-row button { justify-content: center; }
.history-tabs { margin: 18px 0 15px; }
.history-tabs button[aria-pressed="true"] { border-color: var(--accent-text); color: var(--accent-text); background: var(--secondary-hover); }
.history-overview { font-size: 11px; line-height: 1.8; padding-bottom: 10px; border-bottom: 1px solid var(--line); }
.summary-grid { display: grid; grid-template-columns: 1fr 1fr 1.25fr; gap: 8px; margin: 13px 0 18px; }
.summary-grid > div { min-width: 0; padding: 11px 7px; background: var(--panel); border: 1px solid var(--line); border-radius: var(--control-radius); }
.summary-grid dt { font-size: 10px; color: var(--text-muted); }
.summary-grid dd { margin: 7px 0 0; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.summary-grid small { font-size: 9px; font-weight: normal; }
.history-empty { margin: 15px 0; font-size: 12px; line-height: 1.9; color: var(--text-muted); }
.history-records { list-style: none; margin: 0; padding: 0; }
.history-records li { padding: 15px 0; border-bottom: 1px solid var(--line); }
.history-records .record-remark { max-height: 110px; overflow: auto; }
button.delete-link { margin: 9px 0 0 auto; color: var(--error); }
.history-pagination { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 18px; font-size: 10px; color: var(--text-muted); }
.history-pagination button { width: auto; padding: 8px 10px; font-size: 11px; }
.stats-section { margin-top: 20px; }
.stats-section h3 { font-size: 12px; font-weight: 600; }
.stats-scroll { overflow-x: auto; }
.stats-section table { width: 100%; border-collapse: collapse; font-size: 10px; font-variant-numeric: tabular-nums; }
.stats-section th, .stats-section td { padding: 9px 5px; border-bottom: 1px solid var(--line); text-align: right; overflow-wrap: anywhere; }
.stats-section th { font-weight: 500; }
.stats-section tr > :first-child { text-align: left; white-space: nowrap; }
.stats-section thead { color: var(--text-muted); }
.history-feedback { color: var(--accent-text); font-size: 11px; line-height: 1.8; }
.delete-dialog { width: min(350px, calc(100% - 40px)); }
.delete-dialog h2 { margin: 0; font-size: 17px; }
.delete-dialog > p { font-size: 12px; line-height: 1.8; }
.delete-record-detail { padding: 12px; background: var(--panel); border: 1px solid var(--line); border-radius: var(--control-radius); font-size: 11px; line-height: 1.8; max-height: 160px; overflow: auto; }
button.danger-button { color: var(--error); background: var(--error-background); border-color: var(--error-border); }
button.danger-button:hover:not(:disabled) { background: var(--error-background); border-color: var(--error); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
.ui-dialog { width: min(360px, calc(100% - 28px)); max-height: calc(100% - 28px); margin: auto; padding: 18px; color: var(--text-primary); background: rgb(var(--surface-rgb) / 98%); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.ui-dialog::backdrop { background: rgb(0 0 0 / 18%); }
.density-settings { margin: 20px 0 0; padding: 0; border: 0; }
.density-settings legend { margin-bottom: 10px; font-size: 12px; }
.density-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.density-options button[aria-pressed="true"] { border-color: var(--accent-text); color: var(--accent-text); background: var(--control-hover); }
.utilities-panel { margin-top: 20px; font-size: 11px; }
.utilities-panel > button { margin-top: 12px; }
.note-heading { margin-top: 20px; font-size: 13px; }
.settlement-entry { margin-top: 12px; }
.settlement-panel { margin-top: 12px; padding: 16px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: var(--panel); }
.settlement-panel h2 { margin: 0; font-size: 16px; }
.settlement-panel .settings-heading .secondary { width: auto; flex-shrink: 0; font-size: 12px; line-height: 1.5; }
.settlement-record { padding: 12px 0; border-top: 1px solid var(--line); }
.settlement-record summary { cursor: pointer; }
.settlement-form { display: grid; gap: 12px; margin-top: 12px; }
.monitor-status { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; font-size: 10px; color: var(--text-muted); }
.monitor-status button { flex-shrink: 0; }
.monitor-settings { margin-top: 12px; }
.monitor-toggle { display: flex; align-items: center; gap: 8px; }
.monitor-toggle input { width: auto; margin: 0; }
.monitor-rule { display: grid; gap: 8px; margin: 0; padding: 10px; border: 1px solid var(--line); border-radius: var(--control-radius); min-width: 0; }
.notice-titlebar { padding: 12px 16px; }
.notice-titlebar span { flex: 1; font-size: 13px; cursor: grab; }
.notice-titlebar button { width: auto; padding: 7px 10px; }
.notice-content { padding: 0 18px 18px; overflow: auto; min-height: 0; }
.notice-content h1 { font-size: 18px; line-height: 1.5; }
.notice-content > section > .secondary, .notice-content > .text-button { margin-top: 14px; }
.island-frame { padding: 5px; }
.island-shell { flex-direction: row; align-items: center; border-radius: 32px; padding: 0 8px 0 14px; }
.island-drag { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; height: 100%; cursor: grab; }
.island-mark { display: grid; place-items: center; flex: 0 0 32px; height: 32px; border-radius: 50%; color: var(--accent); border: 1px solid var(--window-border); font-weight: 700; }
.island-info { display: flex; flex: 1; min-width: 0; flex-direction: column; gap: 2px; }
.island-info strong, .island-info small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.island-info strong { font-size: 14px; }
.island-info small { font-size: 11px; color: var(--text-secondary); }
.island-time { font: 600 15px ui-monospace, monospace; white-space: nowrap; }
.island-open { flex: 0 0 30px; width: 30px; height: 30px; margin-left: 5px; padding: 0; border-radius: 50%; }
.island-error { color: var(--accent); font-weight: bold; }


/* Desktop refresh: keep all color and surface choices tied to the four theme tokens. */
.icon { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; font-size: 18px; line-height: 1; }
.icon svg, .window-control .icon svg { display: block; width: 1em; height: 1em; fill: currentColor; stroke: none; }
.window-control .icon { width: 16px; height: 16px; font-size: 14px; }
.app-shell { border-radius: var(--window-radius); }
.titlebar { min-height: 62px; padding: 10px 17px; border-bottom: 1px solid var(--line); }
.brand-mark { width: 30px; height: 30px; }
.brand-name { font-size: 14px; letter-spacing: -.35px; }
.main-nav { gap: 5px; }
button.nav-button { width: 34px; height: 34px; border-radius: 10px; }
button.nav-button[aria-pressed="true"] { background: var(--control-hover); }
button.nav-button[aria-pressed="true"]::after { bottom: -2px; }
.category-chip { padding: 6px 10px; border: 1px solid var(--line); border-radius: 999px; }
.workspace { max-width: 680px; padding: 20px 24px 24px; }
.workspace.is-active { margin-block: 0; }
.monitor-status { min-height: 42px; padding: 7px 11px; margin: 0 auto 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--surface-rgb) / 45%); font-size: 11px; }
.monitor-status button { border: 0; color: var(--accent-text); font-size: 11px; }
.timer-card { width: 100%; max-width: none; padding: 22px; border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / calc(var(--window-opacity) * .72)); }
.task-eyebrow { margin-bottom: 10px; color: var(--text-muted); font-size: 10px; font-weight: 600; letter-spacing: .05em; }
.task-eyebrow .icon { width: 14px; height: 14px; font-size: 13px; }
.task-copy h1 { font-size: 22px; font-weight: 650; letter-spacing: -.5px; }
.task-summary { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; margin-top: 9px; }
.task-summary .meta-dot { margin: 0 2px; }
.task-control-mode { padding: 2px 7px; border: 1px solid var(--line); border-radius: 999px; color: var(--text-muted); font-size: 10px; }
.task-mode-hint { max-width: 310px; margin: 8px 0 0; color: var(--text-muted); font-size: 10px; line-height: 1.6; }
.timer { font-family: ui-monospace, Consolas, monospace; font-size: clamp(23px, 4vw, 32px); letter-spacing: -1px; }
.actions { gap: 12px; margin-top: 18px; padding-top: 15px; border-top: 1px solid var(--line); }
button.round-action { width: 38px; height: 38px; padding: 9px; }
button.quiet-action { padding: 8px 10px; }
.form-card { width: 100%; max-width: none; padding: 16px 18px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / 35%); }
.work-form { gap: 12px; }
.work-form > button { min-height: 40px; font-weight: 600; }
.switch-panel { max-width: none; padding: 12px 16px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / 35%); }
.switch-panel summary { font-weight: 600; color: var(--text-primary); }
.switch-confirm { margin-top: 18px; font-size: 12px; line-height: 1.8; }
.switch-confirm p { margin: 0; }
.confirm-actions { margin-top: 10px; }
.confirm-actions button { justify-content: center; }
.ui-dialog, .history-dialog, .appearance-dialog, .delete-dialog { padding: 22px; }
.settings-heading { padding-bottom: 12px; border-bottom: 1px solid var(--line); }
.settings-heading h2 { font-size: 16px; }
.monitor-settings { margin-top: 18px; }
.monitor-rule { padding: 14px; border-radius: 12px; }
.monitor-rule legend { color: var(--text-primary); font-weight: 600; }
.monitor-toggle input { accent-color: var(--accent); }
.monitor-toggle { line-height: 1.6; }
.history-records li, .settlement-record { padding: 15px 0; }
.notice-titlebar { padding: 14px 18px; border-bottom: 1px solid var(--line); }
.notice-titlebar span { font-weight: 600; }
.notice-content { padding: 8px 18px 18px; }
.island-shell { padding: 0 10px 0 14px; border-radius: 32px; }
.island-mark { color: var(--on-accent); background: var(--accent); border: 0; }
.island-info small { color: var(--text-muted); }
.island-time { font: 600 15px ui-monospace, Consolas, monospace; }
.island-open { display: flex; justify-content: center; align-items: center; color: var(--accent-text); background: var(--control-hover); }
.island-open .icon { width: 14px; height: 14px; font-size: 13px; transform: rotate(45deg); }
@media (max-width: 540px) {
  .titlebar { padding-inline: 10px; }
  .workspace { padding: 14px; }
  .timer-card { padding: 16px; }
}
@media (max-width: 380px) {
  .titlebar { padding-inline: 8px; }
  .workspace { padding: 10px; }
  .timer-card { padding: 13px; }
  .task-copy h1 { font-size: 17px; }
  .task-row { gap: 6px; }
  .timer { font-size: 22px; }
}

/* Secondary pages share the same cards, controls and token-driven typography. */
.history-dialog { width: min(540px, calc(100% - 32px)); }
.history-filters { padding: 14px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: rgb(var(--window-rgb) / 45%); }
.history-filters label { color: var(--text-muted); font-weight: 600; }
.history-filters button { min-height: 38px; }
.history-tabs { padding: 4px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 40%); }
.history-tabs button { border-color: transparent; background: transparent; }
.history-tabs .icon, .history-pagination .icon, .history-filters .icon, .delete-link .icon { width: 15px; height: 15px; font-size: 14px; }
.history-overview { padding: 12px 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 45%); }
.summary-grid > div { padding: 12px 10px; }
.history-records { display: grid; gap: 9px; }
.history-records li { padding: 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 40%); }
.history-records .record-heading { align-items: flex-start; }
.stats-section { padding: 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 40%); }
.stats-section h3 { margin: 0 0 10px; }
.settlement-panel { padding: 18px; }
.settlement-panel .settings-heading { margin-bottom: 12px; }
.settlement-record { border-bottom: 1px solid var(--line); }
.settlement-form { padding: 0 4px 10px; }

button.theme-choice { min-height: 68px; padding: 12px; }
.theme-sample { width: 36px; height: 42px; border-radius: 9px; }
.theme-label strong { font-size: 13px; }
.theme-label > span { white-space: normal; }
.opacity-heading { margin-top: 20px; }

.notice-content h1 { margin-top: 12px; }
.notice-content p { line-height: 1.7; }

/* Independent panels reserve fixed header/footer rows. Only the body scrolls. */
.panel-app{display:flex;flex-direction:column;flex:1;min-height:0;height:100%;overflow:hidden}
.panel-app .panel-surface{flex:1;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;overflow:hidden}
.panel-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 22px;border-bottom:1px solid var(--line);flex-shrink:0}
.panel-heading h2{margin:0;font-size:18px}.panel-heading button{width:auto}
.panel-scroll{overflow:auto;min-height:0;padding:18px 24px 24px;scrollbar-width:thin}
.panel-actions{grid-row:3;display:flex;align-items:center;justify-content:flex-end;gap:12px;padding:14px 22px;border-top:1px solid var(--line);background:rgb(var(--surface-rgb)/98%)}
.panel-actions>button{width:auto;min-width:120px}.panel-actions .history-pagination{width:100%;margin:0}
.settings-tabs{display:flex;gap:8px;padding:12px 20px;border-bottom:1px solid var(--line);flex-shrink:0}.settings-tabs button{width:auto;flex:1}
.settings-tabs button[aria-pressed=true]{border-color:var(--accent);color:var(--accent-text)}
.draft-indicator{font-size:11px;margin:0;padding:6px 24px;color:var(--accent-text);flex-shrink:0}
.panel-app>.error-banner{margin:8px 20px;flex-shrink:0;max-height:80px;overflow:auto}
.data-buttons{display:flex;gap:10px;margin:14px 0 24px;flex-wrap:wrap}.data-buttons button{width:auto}
.panel-app .monitor-settings{padding:0}.panel-app .theme-grid{max-width:760px}.panel-app .settlement-form{max-width:760px;margin-top:20px}
@media(max-width:600px){.panel-scroll{padding:14px}.panel-heading,.panel-actions{padding:12px}.settings-tabs{padding:8px}.panel-actions>button{min-width:0;flex:1}}

/* Shared preferences: every desktop surface uses the saved typography. */
.desktop-frame{font-size:var(--body-size,14px);font-weight:var(--body-weight,400);line-height:var(--body-line,1.6)}
.desktop-frame button,.desktop-frame input,.desktop-frame select,.desktop-frame textarea,.desktop-frame label,.desktop-frame summary{font-size:1em;font-weight:inherit;line-height:inherit}
.desktop-frame h1{font-size:1.5em}.desktop-frame h2{font-size:1.2em}.desktop-frame h3{font-size:1.05em}.desktop-frame .hint,.desktop-frame .task-summary{font-size:.82em}.desktop-frame .timer{font-size:2.25em}.desktop-frame .task-control-mode{font-size:.75em}
.app-shell{position:relative;isolation:isolate}.window-background{position:absolute;inset:0;z-index:-1;pointer-events:none;background-size:cover;background-position:center}
button.nav-button[aria-pressed="true"]::after{display:none}.desktop-frame .main-nav{display:flex;gap:3px}.desktop-frame .titlebar{grid-template-columns:auto auto minmax(0,1fr) auto}
.work-badge{display:inline-flex;align-items:center;gap:8px;min-width:0}.work-symbol{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:31px;height:31px;border-radius:9px;color:var(--work-color);background:color-mix(in srgb,var(--work-color) 12%,transparent)}.work-symbol .icon{font-size:19px}.work-badge>span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
button.workload-carousel{display:flex;align-items:center;justify-content:center;gap:7px;min-width:0;overflow:hidden;padding:6px 9px;border:1px solid var(--line);border-radius:999px;background:rgb(var(--surface-rgb)/45%);color:var(--text-primary);font-size:.8em;white-space:nowrap}.workload-carousel .work-symbol{width:22px;height:22px;border-radius:50%}.workload-carousel .icon{font-size:14px}.workload-carousel .work-badge{gap:5px;flex-shrink:0}.workload-carousel small{color:var(--text-muted);font-size:.8em;overflow:hidden;text-overflow:ellipsis}.workload-carousel>span{overflow:hidden;text-overflow:ellipsis}
.home-footer{display:flex;align-items:center;gap:8px;margin-top:12px;min-width:0}.home-footer button{flex-shrink:0}.monitor-caption{font-size:.72em;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-left:auto}.start-prompt{border:1px solid var(--line);border-radius:var(--panel-radius);background:rgb(var(--surface-rgb)/94%);padding:16px;margin-bottom:12px;display:flex;align-items:center;gap:9px;flex-wrap:wrap}.start-prompt>strong{font-size:1em}.start-prompt p{width:100%;color:var(--text-muted);font-size:.85em;margin:0}.start-prompt>div{display:flex;gap:9px;width:100%}.start-prompt button{justify-content:center}.browse-banner{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid var(--line);border-radius:12px;padding:10px 13px;margin-bottom:12px;background:rgb(var(--surface-rgb)/85%);font-size:.88em}.browse-banner button{width:auto;justify-content:center;flex-shrink:0}
.panel-actions>button,.settings-actions>button,.data-buttons>button{justify-content:center!important;text-align:center}.panel-app button{max-width:100%}.panel-heading{padding:12px 22px}.panel-heading h2{font-size:1.15em}.settings-tabs{gap:5px;padding:10px 16px}.settings-tabs button{padding:8px 9px;font-size:.88em}.layout-form{display:grid;gap:18px;max-width:650px}.layout-form input[type=range]{padding:0}.font-preview{padding:18px;border:1px solid var(--line);border-radius:12px;background:var(--panel)}.visual-category{border:1px solid var(--line);border-radius:12px;padding:15px;margin:0 0 18px;min-width:0}.visual-category legend{padding:0 7px}.color-field{display:flex!important;align-items:center;gap:12px;margin-bottom:12px}.color-field input{width:45px;height:30px;padding:2px;margin:0}.color-field span{color:var(--text-muted);font-size:.8em}.icon-picker{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:7px;margin-top:12px}.icon-picker button{min-height:40px;padding:8px}.icon-picker button[aria-pressed=true]{border-color:var(--accent-text);outline:1px solid var(--accent-text);background:var(--control-hover)}.background-settings{margin-top:24px;padding-top:18px;border-top:1px solid var(--line)}.compact-help{margin:8px 0;font-size:.84em;color:var(--text-muted)}.compact-help summary{cursor:pointer}.monitor-diagnostics,.advanced-settings{padding:12px 14px;border:1px solid var(--line);border-radius:10px;margin-bottom:14px}.monitor-diagnostics>summary,.advanced-settings>summary{cursor:pointer;font-weight:600}.monitor-diagnostics>p,.monitor-diagnostics>button,.monitor-diagnostics>details{margin-top:12px}.advanced-settings>fieldset{margin-top:12px}
.desktop-frame[data-density=compact]{padding:5px;--content-gap:6px}.desktop-frame[data-density=compact] .titlebar{min-height:39px;padding:5px 8px;gap:5px}.desktop-frame[data-density=compact] .brand-name{display:none}.desktop-frame[data-density=compact] .brand-mark{width:22px;height:22px}.desktop-frame[data-density=compact] .titlebar-drag{min-height:24px}.desktop-frame[data-density=compact] .nav-button{width:25px;height:25px;padding:4px}.desktop-frame[data-density=compact] .nav-button .icon{font-size:15px}.desktop-frame[data-density=compact] .window-control{width:22px;height:25px;padding:4px}.desktop-frame[data-density=compact] .window-controls{gap:0}.desktop-frame[data-density=compact] .workload-carousel{padding:3px 5px;gap:4px;font-size:.7em}.desktop-frame[data-density=compact] .workload-carousel small{display:none}.desktop-frame[data-density=compact] .workload-carousel .work-symbol{width:17px;height:17px}.desktop-frame[data-density=compact] .workload-carousel .work-symbol .icon{font-size:12px}.desktop-frame[data-density=compact] .workspace{padding:8px 10px 9px;max-width:none}.desktop-frame[data-density=compact] .auxiliary{display:none}.desktop-frame[data-density=compact] .timer-card{padding:10px 12px;border-radius:12px}.desktop-frame[data-density=compact] .task-copy h1{font-size:1em}.desktop-frame[data-density=compact] .task-summary{margin-top:3px;font-size:.7em;gap:3px}.desktop-frame[data-density=compact] .task-control-mode{font-size:.9em;padding:0 4px}.desktop-frame[data-density=compact] .task-copy .work-symbol{width:25px;height:25px}.desktop-frame[data-density=compact] .task-copy .work-symbol .icon{font-size:16px}.desktop-frame[data-density=compact] .timer{font-size:1.65em}.desktop-frame[data-density=compact] .actions{margin-top:6px;padding-top:6px;gap:8px}.desktop-frame[data-density=compact] .round-action{width:29px;height:29px;padding:6px}.desktop-frame[data-density=compact] .quiet-action{padding:3px 5px;font-size:.8em}.desktop-frame[data-density=compact] .form-card{padding:9px 11px;margin-top:0;border-radius:12px}.desktop-frame[data-density=compact] .work-form{gap:7px}.desktop-frame[data-density=compact] .work-form label{font-size:.82em}.desktop-frame[data-density=compact] .work-form select{padding:4px 8px;margin-top:2px}.desktop-frame[data-density=compact] .work-form>button{min-height:30px;padding:4px 9px;font-size:.82em;justify-content:center}.desktop-frame[data-density=compact] .form-note>summary{font-size:.72em}.desktop-frame[data-density=compact] .home-footer{margin-top:6px;gap:4px}.desktop-frame[data-density=compact] .home-footer button{font-size:.7em;padding:4px 7px}.desktop-frame[data-density=compact] .monitor-caption{font-size:.65em}.desktop-frame[data-density=compact] .switch-panel{margin-top:6px;padding:5px 9px;font-size:.8em}.desktop-frame[data-density=compact] .start-prompt{padding:10px;gap:6px;margin-bottom:7px}.desktop-frame[data-density=compact] .start-prompt p{font-size:.75em}.desktop-frame[data-density=compact] .start-prompt button{padding:5px 8px;font-size:.82em}.desktop-frame[data-density=compact] .browse-banner{padding:8px 10px;margin-bottom:7px}.desktop-frame[data-density=compact] .browse-banner button{padding:5px 8px}.desktop-frame[data-density=compact] .settings-tabs{padding:6px 10px}.desktop-frame[data-density=compact] .settings-tabs button{padding:5px 7px;font-size:.8em}.desktop-frame[data-density=compact] .panel-heading{padding:8px 14px}.desktop-frame[data-density=compact] .panel-scroll{padding:10px 14px}.desktop-frame[data-density=compact] .panel-actions{padding:8px 14px}.desktop-frame[data-density=compact] .panel-actions>button{padding:7px 12px}.desktop-frame[data-density=compact] .monitor-settings{gap:9px}.desktop-frame[data-density=compact] .monitor-rule{padding:9px;gap:6px}.desktop-frame[data-density=compact] .theme-choice{min-height:48px;padding:8px}.desktop-frame[data-density=compact] .theme-sample{width:25px;height:28px}.desktop-frame[data-density=compact] .visual-category{padding:10px;margin-bottom:10px}
/* Main titlebar: identity + one settings entry, drag space, workload, window controls. */
.desktop-frame .titlebar.titlebar-main { grid-template-columns:auto auto minmax(32px,1fr) minmax(120px,320px) auto; }
.titlebar-main .titlebar-space { align-self:stretch; min-width:32px; }
.titlebar-main .workload-carousel { min-height:32px; }
.titlebar-main .workload-carousel .work-badge { flex:0 1 auto; min-width:0; }
.titlebar-main .workload-carousel strong { flex:0 0 auto; font-variant-numeric:tabular-nums; }
.desktop-frame[data-density=compact] .titlebar.titlebar-main { grid-template-columns:auto auto minmax(24px,1fr) minmax(100px,240px) auto; min-height:42px; gap:6px; }
.desktop-frame[data-density=compact] .titlebar-main .titlebar-space { min-width:24px; }
.desktop-frame[data-density=compact] .titlebar-main .nav-button { width:28px; height:28px; }
.desktop-frame[data-density=compact] .titlebar-main .workload-carousel { min-height:28px; padding:4px 8px; font-size:.75em; }
@media(max-width:600px) { .titlebar-main .brand-name { display:none; } }

/* Compact native status window: all persistent actions share the same row. */
.island-frame { padding:4px; }
.island-shell { position:relative; display:flex; flex-direction:column; align-items:stretch; justify-content:center; padding:5px 8px; border-radius:20px; gap:5px; }
.island-main-row { display:flex; align-items:center; min-height:30px; gap:5px; }
.island-drag { height:auto; gap:7px; }
.island-drag .work-symbol { width:26px; height:26px; border-radius:8px; flex-shrink:0; }
.island-drag .work-symbol .icon { font-size:16px; }
.island-info { gap:0; }
.island-info strong { font-size:12px; line-height:1.4; }
.island-info small { font-size:9px; line-height:1.4; }
.island-drag .island-time { font-size:12px; }
button.island-action, button.island-open { display:flex; justify-content:center; align-items:center; flex:0 0 26px; width:26px; height:26px; margin:0; padding:4px; border-radius:50%; background:transparent; color:var(--text-muted); box-shadow:none; }
button.island-action:hover:not(:disabled),button.island-open:hover:not(:disabled) { background:var(--control-hover); color:var(--accent-text); }
button.island-start { width:auto; flex-shrink:0; min-height:26px; padding:4px 8px; font-size:10px; border-radius:8px; }
.island-intent { display:flex; gap:6px; padding-left:33px; }
.island-intent button { width:auto; min-height:25px; padding:3px 10px; font-size:10px; justify-content:center; }
.island-error { position:absolute; left:2px; top:2px; font-size:10px; }
.layout-form { width:100%; margin-inline:auto; }
.layout-form input[type=range] { margin-inline:0; }
.panel-surface:has(.layout-form) .panel-heading, .panel-surface:has(.layout-form) .panel-actions { width:100%; max-width:694px; margin-inline:auto; }
button { transition:background-color .14s,border-color .14s,color .14s; }
button:active:not(:disabled) { box-shadow:inset 0 1px 2px rgb(0 0 0 / 12%); }
button.nav-button:hover:not(:disabled),button.text-button:hover:not(:disabled),button.workload-carousel:hover:not(:disabled) { background:var(--control-hover); }
@media (prefers-reduced-motion:reduce) { button { transition:none; } }

.monitor-work-sites { display:grid; gap:10px; min-width:0; }
.monitor-work-sites h3 { margin:0; font-size:1em; }
.monitor-work-sites > .hint { margin:0; }
.monitor-work-group { border:1px solid var(--line); border-radius:12px; min-width:0; }
.monitor-work-group > summary { display:flex; align-items:center; gap:10px; padding:10px 12px; cursor:pointer; list-style:none; }
.monitor-work-group > summary::before { content:"›"; color:var(--text-muted); transition:transform .14s; }
.monitor-work-group[open] > summary::before { transform:rotate(90deg); }
.monitor-work-group > summary span { margin-left:auto; font-size:.8em; color:var(--text-muted); }
.monitor-work-urls { display:grid; gap:10px; padding:0 12px 12px; min-width:0; }

.category-names-editor { display: grid; gap: 12px; margin-block: 16px; padding-block: 16px; border-block: 1px solid var(--border); }

.sound-preview-buttons { display: flex; flex-wrap: wrap; gap: 8px; }

/* v0.2.5: retain the desktop layout and theme tokens. */
.desktop-frame .titlebar.titlebar-main { grid-template-columns:auto minmax(24px,1fr) auto auto auto; }
.titlebar-main .titlebar-drag:first-child { grid-column:1; grid-row:1; }
.titlebar-main .titlebar-space { grid-column:2; grid-row:1; min-width:24px; }
.titlebar-main .browse-toolbar { grid-column:3; grid-row:1; }
.titlebar-main .main-nav { grid-column:4; grid-row:1; padding-left:8px; border-left:1px solid var(--line); }
.titlebar-main .window-controls { grid-column:5; grid-row:1; }
.desktop-frame[data-density=compact] .titlebar.titlebar-main { grid-template-columns:auto minmax(24px,1fr) auto auto auto; }
button.browse-toolbar { width:auto; padding:4px 2px; gap:7px; color:var(--text-muted); background:transparent; box-shadow:none; font-size:12px; white-space:nowrap; }
button.browse-toolbar .icon { width:17px; height:17px; font-size:17px; }
button.browse-toolbar[aria-pressed=true] { color:var(--accent-text); }
.browse-switch { width:30px; height:18px; padding:2px; border-radius:20px; background:rgb(var(--surface-rgb)/65%); border:1px solid var(--line); }
.browse-switch::before { content:""; display:block; width:12px; height:12px; border-radius:50%; background:var(--text-muted); transition:transform .18s,background .18s; }
[aria-pressed=true] .browse-switch { background:var(--accent); border-color:var(--accent); }
[aria-pressed=true] .browse-switch::before { transform:translateX(12px); background:var(--on-accent); }
.window-background { inset:-4px; filter:blur(2px); }
.workspace { display:flex; flex-direction:column; flex:1; min-height:100%; gap:12px; }
.workspace.is-active { margin-block:0; }
.workspace > .timer-card,.workspace > .form-card { width:100%; margin:0; border-color:var(--window-border); background:rgb(var(--surface-rgb)/calc(var(--window-opacity) * .72)); box-shadow:var(--panel-shadow); backdrop-filter:blur(12px); }
.workspace .actions { display:flex; flex-wrap:wrap; align-items:center; gap:12px; border-top:1px solid var(--line); padding-top:18px; }
.workspace .quiet-action { gap:7px; }
.workspace .home-footer { margin-top:auto; }
.workspace .home-footer .text-button { padding:3px 0; border:0; border-radius:0; }
button.browse-toolbar[aria-pressed=true]:disabled { opacity:.85; }
.workspace > .notice,.workspace > .error-banner { margin-bottom:0; }
.work-form .category-field { display:flex; align-items:center; gap:12px; }
.category-field-symbol { display:grid; place-items:center; width:40px; height:40px; flex-shrink:0; border-radius:var(--control-radius); color:var(--accent-text); background:var(--control-hover); }
.work-form .category-field label { flex:1; min-width:0; }
.work-form .category-field select { border:0; background:transparent; margin:0; padding:10px 4px; font-size:1.05em; box-shadow:none; }
.work-input-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.work-input-row label { min-width:0; }
.work-input-row textarea { min-height:42px; resize:vertical; }
.work-form .start-work { width:100%; justify-content:center; border-radius:999px; gap:9px; margin-top:2px; }
.work-form .cancel-switch { justify-content:flex-start; width:auto; color:var(--text-primary); background:transparent; padding:4px 0; box-shadow:none; }
.switch-hint { font-size:11px; color:var(--text-muted); margin:0; }
button.today-strip { display:flex; gap:13px; width:100%; flex-shrink:0; padding:12px 0 2px; border:0; border-top:1px solid var(--line); border-radius:0; box-shadow:none; background:transparent; color:var(--text-muted); font-size:12px; text-align:left; }
button.today-strip:hover { background:transparent; color:var(--text-primary); }
.today-strip-label { display:flex; align-items:center; gap:7px; flex-shrink:0; color:var(--text-primary); white-space:nowrap; }
.today-strip .icon { width:16px; height:16px; font-size:16px; }
.today-strip-viewport { display:block; flex:1; min-width:0; overflow:hidden; }
.today-strip-track { display:flex; width:max-content; gap:32px; white-space:nowrap; }
.today-strip-track > span { flex-shrink:0; }
.today-strip-track.is-scrolling { animation:today-scroll var(--scroll-duration) linear infinite; }
.today-strip:hover .today-strip-track,.today-strip:focus-visible .today-strip-track { animation-play-state:paused; }
@keyframes today-scroll { to { transform:translateX(calc(-1 * var(--scroll-distance))); } }
.desktop-frame[data-density=compact] .workspace { gap:8px; }
.desktop-frame[data-density=compact] .workspace .actions { gap:8px; padding-top:10px; }
.desktop-frame[data-density=compact] .category-field-symbol { width:30px; height:30px; }
.desktop-frame[data-density=compact] .today-strip { font-size:10px; gap:8px; padding-top:8px; }
.desktop-frame[data-density=compact] .home-footer { margin-top:auto; }
@media(max-width:440px) {
  .workspace .actions { gap:8px; }
  .workspace .quiet-action { padding-inline:4px; gap:4px; }
  .workspace .quiet-action .icon { width:17px; height:17px; font-size:17px; }
  .work-input-row { grid-template-columns:1fr; gap:8px; }
  .browse-toolbar .browse-switch { display:none; }
  .titlebar-main .main-nav { padding-left:4px; }
}
@media(prefers-reduced-motion:reduce) {
  .today-strip-track.is-scrolling { animation:none; }
  .today-strip-track > span[aria-hidden] { display:none; }
  .today-strip-viewport { overflow-x:auto; scrollbar-width:thin; }
  .browse-switch::before { transition:none; }
}

/* Fixed island body; the lower reveal shares this single material layer. */
.island-frame { padding:4px; }
.island-frame .island-shell { position:absolute; left:4px; top:4px; width:312px; height:auto; max-height:calc(100% - 8px); padding:0; gap:0; display:flex; flex-direction:column; justify-content:flex-start; border-radius:20px; overflow:hidden; backdrop-filter:blur(12px); }
.island-frame .island-main-row { position:relative; width:310px; height:46px; min-height:46px; flex:0 0 46px; padding:5px 7px; margin:0; gap:3px; border-radius:20px; }
.island-frame .island-drag { align-self:stretch; min-width:0; height:auto; }
.island-frame .island-info { min-width:0; }
.island-frame .island-drag .work-symbol { flex:0 0 25px; width:25px; height:25px; }
.island-frame .island-time { font-size:12px; }
.island-frame button.island-action,.island-frame button.island-open { flex:0 0 22px; width:22px; height:26px; padding:3px; border-radius:8px; }
.island-frame .island-action .icon,.island-frame .island-open .icon { width:14px; height:14px; font-size:14px; }
.island-expansion { width:310px; flex:none; overflow:hidden; transition:height .2s ease,opacity .2s ease,transform .2s ease; }
.island-expansion:not(.island-reveal-enter):not(.island-reveal-appear):not(.island-reveal-leave) { overflow-y:auto; scrollbar-width:thin; }
.island-expansion-content { padding:5px 13px 14px; font-size:12px; }
.island-expansion-content h2 { margin:0 0 8px; font-size:14px; font-weight:600; }
.island-expansion-content p { margin:0 0 9px; line-height:1.65; }
.island-expansion-content button { min-height:29px; padding:6px 9px; font-size:11px; justify-content:center; }
.island-buttons { display:flex; gap:8px; }
.island-expansion .settlement-form { display:flex; flex-direction:column; gap:9px; }
.island-expansion .settlement-form .hint { font-size:10px; margin:0; }
.island-expansion .settlement-form label { font-size:11px; }
.island-expansion .settlement-form input,.island-expansion .settlement-form select,.island-expansion .settlement-form textarea { margin-top:4px; padding:5px 7px; font-size:12px; }
.island-expansion .text-button { margin-top:8px; width:100%; }
.island-discard { padding:8px; margin-bottom:10px; border:1px solid var(--line); border-radius:var(--control-radius); }
.island-discard button+button { margin-top:6px; }
@media(prefers-reduced-motion:reduce) { .island-expansion { transition:none; } }
~~~~~~

## E:\WorkMemo\src\App.tsx

~~~~~~tsx
import { useCategoryNames } from "./categoryNames";
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { DesktopWindow } from "./DesktopWindow";
import { useAppearance } from "./useAppearance";
import { themeStyle } from "./themes";
import { WorkForm } from "./WorkForm";
import { useWorkSession } from "./useWorkSession";
import { formatTime, type StartInput } from "./types";
import { workView } from "./workView";
import { formatQuantity } from "./history";
import { Icon } from "./Icon";
import { UiDialog } from "./UiDialog";
import {
  useLayout,
  usePresentation,
  useDashboard,
  layoutStyle,
  WorkBadge,
} from "./desktopPreferences";
import "./App.css";
import { type TodayWorkload as Today } from "./workload";
import { TodayWorkloadStrip } from "./TodayWorkloadStrip";
export default function App() {
  const session = useWorkSession();
  const appearance = useAppearance();
  const { name } = useCategoryNames();
  const presentation = usePresentation();
  const layout = useLayout();
  const dashboard = useDashboard();
  const [noteOpen, setNoteOpen] = useState(false);
  const [switchRequest, setSwitchRequest] = useState<{
    input: StartInput;
    id: number;
    category: string;
  } | null>(null);
  const [navigationError, setNavigationError] = useState("");
  const [migrationFound, setMigrationFound] = useState(false);
  const [today, setToday] = useState<Today[] | null>(null);
  const [todayError, setTodayError] = useState("");
  const [startupError, setStartupError] = useState("");
  const [switchingFrom, setSwitchingFrom] = useState<number | null>(null);
  const workspace = useRef<HTMLElement>(null);
  const active = session.snapshot?.active;
  const view = workView(session);
  const record = view.record;
  const monitor = session.snapshot?.monitoring;
  const candidate = monitor?.start_candidate;
  const unavailable = !view.canOperate || session.busy;
  const compact = layout.current.density === "compact";
  useEffect(() => {
    if (!session.native) return;
    let stopped = false;
    const reload = () => { void invoke<{ error: string | null }>("get_startup_status")
      .then(value => { if (!stopped) setStartupError(value.error ? `开机启动：${value.error}` : ""); })
      .catch(e => { if (!stopped) setStartupError(`无法读取开机启动状态：${String(e)}`); }); };
    reload();
    const listener = listen("workmemo:startup-changed", reload);
    return () => { stopped = true; void listener.then(fn => fn()); };
  }, [session.native]);
  function panel(section: string) {
    void invoke("open_panel", { panel: "settings", section }).catch((e) =>
      setNavigationError(String(e)),
    );
  }
  useEffect(() => {
    if (!session.native) return;
    let reading = false;
    let stopped = false;
    const load = async () => {
      if (reading) return;
      reading = true;
      try {
        const items = await invoke<Today[]>("get_today_workload");
        if (!stopped) {
          setToday(items);
          setTodayError("");
        }
      } catch (e) {
        if (!stopped) setTodayError(String(e));
      } finally {
        reading = false;
      }
    };
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 5000);
    const p = listen("workmemo:data-changed", () => {
      void load();
      void session.refresh();
    });
    return () => {
      stopped = true;
      clearInterval(timer);
      void p.then((f) => f());
    };
  }, [session.native]);
  useEffect(() => {
    if (!session.native) return;
    void invoke<boolean>("detect_preview_data")
      .then(setMigrationFound)
      .catch(() => {});
    const p = listen("workmemo:appearance-changed", () => {
      void appearance.reload();
    });
    return () => {
      void p.then((f) => f());
    };
  }, [session.native]);
  const switching = switchingFrom !== null;
  const switchValid = !!active?.is_paused && active.id === switchingFrom;
  return (
    <DesktopWindow
      density={layout.current.density}
      background={presentation.current.background}
      appearanceStyle={{
        ...themeStyle(appearance.current),
        ...layoutStyle(layout.current),
      }}
      navigation={
        <nav className="main-nav" aria-label="主导航">
          <button
            className="nav-button"
            title="设置"
            aria-label="设置"
            onClick={() => panel("monitor")}
          >
            <Icon name="settings" />
          </button>
        </nav>
      }
      categories={
        <button type="button" className="browse-toolbar" aria-label="仅浏览" aria-pressed={!!monitor?.browsing_only}
          title={monitor?.browsing_only ? monitor.browse_ready ? "退出仅浏览，开始或继续记录" : "请先返回已匹配的工作页面操作" : "仅浏览，暂停计时"}
          disabled={unavailable || (!!monitor?.browsing_only && (!monitor.browse_ready || !!active?.recovery_pending))}
          onClick={() => { void (monitor?.browsing_only ? session.confirmWork(null) : session.browse()); }}>
          <Icon name="eye" /><span>仅浏览</span><span className="browse-switch" aria-hidden="true" />
        </button>
      }
    >
      <main
        ref={workspace}
        className={`workspace ${active ? "is-active" : ""}`}
      >
        {dashboard.fallback}
        {(session.connectionError ||
          session.commandError ||
          navigationError ||
          startupError ||
          appearance.loadError ||
          presentation.error ||
          layout.error) && (
          <p className="error-banner" role="alert">
            {session.connectionError ||
              session.commandError ||
              navigationError ||
              startupError ||
              appearance.loadError ||
              presentation.error ||
              layout.error}
          </p>
        )}
        {session.snapshot?.warning && (
          <p className="notice" role="alert">
            {session.snapshot.warning}
          </p>
        )}
        {!session.native && (
          <p className="notice">浏览器预览 · 计时和保存请使用桌面应用</p>
        )}
        {active?.recovery_pending && (
          <p className="notice" role="status">
            上次未结束的任务保持暂停。请确认后继续，软件关闭期间不计时。
          </p>
        )}
        {candidate && !active && !switching && (
          <section className="start-prompt" aria-label="开工确认">
            <WorkBadge
              category={candidate.category}
              presentation={presentation.current}
            />
            <strong>准备开始工作？</strong>
            <p>确认前不计时，工作量稍后填写。</p>
            <div>
              <button
                disabled={session.busy}
                onClick={() => {
                  void session.confirmWork(candidate.id);
                }}
              >
                开始记录
              </button>

            </div>
          </section>
        )}
        {!switching && active && (
          <section
            className="timer-card"
            aria-label="当前工作"
            aria-busy={session.loading || session.busy}
          >
            <div className="task-row flex items-center justify-between gap-4">
              <div className="task-copy">
                <div className="task-eyebrow auxiliary">当前工作</div>
                <h1>
                  {record ? (
                    <WorkBadge
                      category={record.category}
                      presentation={presentation.current}
                    />
                  ) : (
                    view.label
                  )}
                </h1>
                <p className="task-summary">
                  <span className="state-label" role="status">
                    {monitor?.browsing_only ? "仅浏览 · 已停表" : view.label}
                  </span>
                  {record && (
                    <span className="task-control-mode">
                      {record.control_mode === "AUTO" ? "自动记录" : "手动计时"}
                    </span>
                  )}
                </p>
              </div>
              <output className="timer" aria-label="有效工作时长">
                {view.timer}
              </output>
            </div>
            {record && (
              <div className="actions flex items-center gap-3">
                {active && (
                  <button
                    className="round-action"
                    disabled={unavailable}
                    title={active.is_paused ? "继续工作" : "暂停"}
                    aria-label={active.is_paused ? "继续工作" : "暂停"}
                    onClick={() => {
                      void (active.is_paused
                        ? session.resume(active.id)
                        : session.pause(active.id));
                    }}
                  >
                    <Icon name={active.is_paused ? "play" : "pause"} />
                  </button>
                )}
                <button
                  className="quiet-action"
                  onClick={() => setNoteOpen(true)}
                  title="任务备注"
                >
                  <Icon name="note" />
                  <span>备注</span>
                </button>
                {active && <button className="quiet-action switch-action" disabled={unavailable || !active.is_paused || !!active.recovery_pending}
                  title={active.is_paused ? "切换任务" : "请先暂停再切换任务"} onClick={() => setSwitchingFrom(active.id)}>
                  <Icon name="swap" /><span>切换任务</span>
                </button>}
                {active && (
                  <button
                    className="quiet-action finish-action"
                    disabled={unavailable}
                    onClick={() => {
                      void session.finish(active.id);
                    }}
                    title="结束计时"
                  >
                    <Icon name="check" />
                    <span>结束</span>
                  </button>
                )}
              </div>
            )}
          </section>
        )}
        {(switching || (!active && !candidate && (session.snapshot || !session.native))) && (
          <section className="form-card new-task-page" aria-label={switching ? "切换任务" : "新建任务"}>
            {switching && !switchValid && <p className="notice" role="status">原任务状态已变化，请返回当前任务确认。填写内容仍保留。</p>}
            <WorkForm minimal={compact} switching={switching} disabled={unavailable || (switching && !switchValid)}
              starting={session.pending === "start_task"} onCancel={switching ? () => { setSwitchingFrom(null); setSwitchRequest(null); } : undefined}
              onStart={async input => {
                if (switching) {
                  if (!switchValid || !active) return false;
                  setSwitchRequest({input, id: switchingFrom, category: active.category});
                  return false;
                }
                return session.start(input);
              }} />
          </section>
        )}
        <div className="home-footer">
          <button
            className="text-button"
            onClick={() => {
              void dashboard.open("pending");
            }}
          >
            待补全 {session.snapshot?.pending_count ?? "—"}
          </button>
          <span className="monitor-caption" title={monitor?.message}>
            {monitor?.message || "正在读取状态…"}
          </span>
        </div>
        <TodayWorkloadStrip items={today} error={todayError} onOpen={() => { void dashboard.open("today"); }} />
        {monitor?.idle_warning && (
          <p className="notice" role="status">
            已连续 {monitor.idle_warning_seconds} 秒没有输入，
            {monitor.idle_end_seconds} 秒时将自动结束。恢复操作后取消提醒。
          </p>
        )}
        {migrationFound && (
          <details className="auxiliary">
            <summary>发现预览版数据</summary>
            <button className="text-button" onClick={() => panel("data")}>
              查看并迁移
            </button>
          </details>
        )}
        <UiDialog
          open={!!switchRequest}
          onClose={() => {
            if (!session.busy) setSwitchRequest(null);
          }}
          id="switch-title"
          title="确认切换工作"
        >
          {switchRequest && (
            <>
              <p>
                结束并保存当前暂停的“{name(switchRequest.category)}”，再开始“
                {name(switchRequest.input.category)}”。原记录保留在待补全列表。
              </p>
              <div className="settings-actions">
                <button
                  className="secondary"
                  disabled={session.busy}
                  onClick={() => setSwitchRequest(null)}
                >
                  取消
                </button>
                <button
                  disabled={session.busy}
                  onClick={() => {
                    void session
                      .start(switchRequest.input, switchRequest.id)
                      .then((ok) => {
                        if (ok) { setSwitchRequest(null); setSwitchingFrom(null); }
                      });
                  }}
                >
                  保存并开始
                </button>
              </div>
            </>
          )}
        </UiDialog>
        <UiDialog
          open={noteOpen && !!record}
          onClose={() => setNoteOpen(false)}
          id="note-title"
          title="任务详情与备注"
        >
          {record && (
            <>
              <p>
                {name(record.category)} · 数量 {formatQuantity(record.quantity)}
              </p>
              <p className="hint">开始 {formatTime(record.start_time)}</p>
              <p className="task-remark">
                {record.remark || "这项工作未填写备注。"}
              </p>
            </>
          )}
        </UiDialog>
      </main>
    </DesktopWindow>
  );
}
~~~~~~

## E:\WorkMemo\src\Icon.tsx

~~~~~~tsx
import type { CSSProperties } from "react";
import {
  HomeOutlined, HistoryOutlined, SkinOutlined, AppstoreOutlined,
  FileTextOutlined, CheckCircleOutlined, PauseOutlined, CaretRightFilled,
  CloseOutlined, SyncOutlined, MinusOutlined, ArrowUpOutlined,
  SettingOutlined, ClockCircleOutlined, SearchOutlined, DeleteOutlined,
  BarChartOutlined, UnorderedListOutlined, LeftOutlined, RightOutlined,
  CheckSquareOutlined, SafetyCertificateOutlined, CodeOutlined, StarOutlined,
  RocketOutlined, BulbOutlined, ToolOutlined, ReadOutlined, EyeOutlined, SwapOutlined,
} from "@ant-design/icons";

const icons = {
  home: HomeOutlined, history: HistoryOutlined, palette: SkinOutlined,
  checkSquare:CheckSquareOutlined,safety:SafetyCertificateOutlined,code:CodeOutlined,
  star:StarOutlined,rocket:RocketOutlined,bulb:BulbOutlined,tool:ToolOutlined,read:ReadOutlined,
  layout: AppstoreOutlined, note: FileTextOutlined, check: CheckCircleOutlined,
  pause: PauseOutlined, play: CaretRightFilled, close: CloseOutlined,
  refresh: SyncOutlined, minimize: MinusOutlined, open: ArrowUpOutlined,
  settings: SettingOutlined, clock: ClockCircleOutlined, search: SearchOutlined,
  delete: DeleteOutlined, chart: BarChartOutlined, list: UnorderedListOutlined,
  left: LeftOutlined, right: RightOutlined,
  eye: EyeOutlined, swap: SwapOutlined,
} as const;

export type IconName = keyof typeof icons;
export function Icon({ name, style }: { name: IconName; style?: CSSProperties }) {
  const Component = icons[name];
  return <Component className={`icon icon-${name}`} aria-hidden="true" style={style} />;
}
~~~~~~

## E:\WorkMemo\src\IslandExpansion.tsx

~~~~~~tsx
import CSSMotion from "@rc-component/motion";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function IslandExpansion({ open, children, onCollapsed, onError }: {
  open: boolean; children: ReactNode; onCollapsed: () => void; onError: (error: string) => void;
}) {
  const [maximum, setMaximum] = useState(364);
  const [reduced, setReduced] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  const container = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const openRef = useRef(open);
  openRef.current = open;
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!isTauri()) return;
    const update = () => { void invoke<number>("get_island_viewport").then(height => setMaximum(Math.max(0, height - 56))).catch(e => onError(String(e))); };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [onError]);
  useEffect(() => {
    if (isTauri() && open) void invoke("hold_island", { holding: true }).catch(e => onError(String(e)));
  }, [open, onError]);
  useEffect(() => {
    const measure = () => setContentHeight(Math.min(content.current?.scrollHeight ?? 0, maximum));
    const observer = new ResizeObserver(measure);
    if (content.current) observer.observe(content.current);
    measure();
    return () => observer.disconnect();
  }, [maximum, open]);
  useEffect(() => {
    if (!isTauri() || !container.current) return;
    let stopped = false, sending = false;
    let next: number | null = null;
    const send = async () => {
      if (sending || stopped) return;
      sending = true;
      while (next !== null && !stopped) {
        const height = next; next = null;
        try { await invoke("set_island_region", { height }); }
        catch (e) { if (!stopped) onError(String(e)); }
      }
      sending = false;
    };
    const observer = new ResizeObserver(() => {
      next = Math.min(maximum + 56, Math.max(56, (container.current?.getBoundingClientRect().height ?? 0) + 56));
      void send();
    });
    observer.observe(container.current);
    return () => { stopped = true; observer.disconnect(); };
  }, [maximum, onError]);
  const measured = (element: HTMLElement) => Math.min(element.scrollHeight, maximum);
  return <CSSMotion visible={open} motionName="island-reveal" motionAppear={!reduced} motionEnter={!reduced} motionLeave={!reduced}
    removeOnLeave={false} motionDeadline={260}
    onAppearStart={() => ({ height: 0, opacity: 0, transform: "translateY(-6px)" })}
    onEnterStart={() => ({ height: 0, opacity: 0, transform: "translateY(-6px)" })}
    onAppearActive={element => ({ height: measured(element), opacity: 1, transform: "translateY(0)" })}
    onEnterActive={element => ({ height: measured(element), opacity: 1, transform: "translateY(0)" })}
    onLeaveStart={element => ({ height: element.getBoundingClientRect().height, opacity: 1, transform: "translateY(0)" })}
    onLeaveActive={() => ({ height: 0, opacity: 0, transform: "translateY(-6px)" })}
    onVisibleChanged={visible => {
      if (!visible && !openRef.current) {
        if (isTauri()) void invoke("set_island_region", { height: 56 })
          .then(() => { if (!openRef.current) return invoke("hold_island", { holding: false }); })
          .catch(e => onError(String(e)));
        onCollapsed();
      }
    }}>
    {({ className, style }, ref) => <div ref={node => {
      container.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }}
      className={`island-expansion ${className || ""}`} style={{ height: open ? contentHeight : 0, maxHeight: maximum, ...style }} aria-hidden={!open} inert={!open}>
      <div className="island-expansion-content" ref={content}>{children}</div>
    </div>}
  </CSSMotion>;
}
~~~~~~

## E:\WorkMemo\src\NotificationApp.tsx

~~~~~~tsx
import { useCategoryNames } from "./categoryNames";
import { usePresentation, WorkBadge, useDashboard } from "./desktopPreferences";
import { Icon } from "./Icon";
import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { useAppearance } from "./useAppearance";
import { useWorkSession } from "./useWorkSession";
import { themeStyle } from "./themes";
import { formatDuration, type WorkNotice, type WorkRecord } from "./types";
import { DraftContext, type Draft } from "./Drafts";
import { SettlementForm } from "./SettlementPanel";
import { IslandExpansion } from "./IslandExpansion";
import "./App.css";

export function NotificationApp() {
  const session = useWorkSession();
  const snapshot = session.snapshot;
  const appearance = useAppearance();
  const { name } = useCategoryNames();
  const presentation = usePresentation();
  const dashboard = useDashboard();
  const [notice, setNotice] = useState<WorkNotice | null>(null);
  const [editing, setEditing] = useState<WorkRecord | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [deferring, setDeferring] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [error, setError] = useState("");
  const [readError, setReadError] = useState("");
  const draft = useRef<Draft | null>(null);
  const editingRef = useRef(editing); editingRef.current = editing;
  const revision = useRef(0);
  const seen = useRef("");
  const busy = session.busy || deferring;
  const [dirty, setDirty] = useState(false);
  const registerDraft = useCallback((_id: string, value: Draft | null) => {
    draft.current = value; setDirty(!!value?.dirty);
  }, []);
  useEffect(() => {
    void invoke("set_window_dirty", { dirty: dirty || busy }).catch(e => setError(String(e)));
  }, [dirty, busy]);
  useEffect(() => () => { void invoke("set_window_dirty", { dirty: false }).catch(() => {}); }, []);
  useEffect(() => {
    let stopped = false, reading = false;
    async function refresh() {
      if (reading) return;
      reading = true;
      const request = revision.current;
      try {
        const value = await invoke<WorkNotice | null>("get_notice");
        if (!stopped && request === revision.current) { setNotice(value); setReadError(""); }
      } catch (e) { if (!stopped) setReadError(String(e)); }
      finally { reading = false; }
    }
    void refresh();
    const timer = setInterval(() => { void refresh(); }, 1000);
    const unlisten = listen("workmemo:appearance-changed", () => { void appearance.reload(); });
    return () => { stopped = true; clearInterval(timer); void unlisten.then(fn => fn()); };
  }, [appearance.reload]);
  const key = notice ? `${notice.kind}:${notice.record.id}` : snapshot?.monitoring.start_candidate ? `candidate:${snapshot.monitoring.start_candidate.id}` : "";
  useEffect(() => {
    if (key === seen.current) return;
    seen.current = key;
    if (key && !editingRef.current) setExpanded(true);
    if (!key && !editingRef.current) setExpanded(false);
  }, [key]);
  const active = snapshot?.active;
  const monitor = snapshot?.monitoring;
  const candidate = monitor?.start_candidate;
  const state = monitor?.browsing_only
    ? monitor.browse_ready
      ? "工作页面已就绪"
      : "仅浏览 · 当前不计时"
    : candidate
      ? "准备开始工作？"
      : active?.recovery_pending
        ? "上次工作待恢复"
        : active?.pause_reason === "MANUAL"
          ? "手动暂停 · 已停表"
          : active?.pause_reason === "IDLE_PAUSE" ? "键鼠空闲暂停" : active?.pause_reason === "AWAY"
            ? "离页暂停 · 已停表"
            : active?.pause_reason === "MONITOR"
              ? "监测中断 · 已停表"
              : active?.is_paused
                ? "已暂停 · 已停表"
                : snapshot?.monitoring.idle_warning
                  ? "空闲提醒 · 暂计"
                  : snapshot?.monitoring.away_pause_remaining_seconds != null
                    ? `离页宽限 · ${formatDuration(snapshot.monitoring.away_pause_remaining_seconds)} 后暂停`
                    : active?.control_mode === "AUTO"
                      ? "自动记录中 · 暂计"
                      : "手动计时 · 暂计";

  async function later(force = false) {
    if (busy) return;
    if (draft.current?.dirty && !force) { setDiscard(true); return; }
    setDeferring(true); setError("");
    try {
      if (editing) await invoke("defer_notice", { id: editing.id, kind: "ended" });
      else if (notice) await invoke("defer_notice", { id: notice.record.id, kind: notice.kind });
      revision.current++;
      if (!editing || notice?.record.id === editing.id) setNotice(null);
      setDiscard(false); setExpanded(false);
      setDirty(false);
    } catch (e) { setError(String(e)); }
    finally { setDeferring(false); }
  }
  const latestLater = useRef(later); latestLater.current = later;
  const busyRef = useRef(busy); busyRef.current = busy;
  useEffect(() => {
    const unlisten = listen("workmemo:request-close", () => {
      if (busyRef.current) { setError("正在保存，请稍候。"); return; }
      void latestLater.current();
    });
    return () => { void unlisten.then(fn => fn()); };
  }, []);
  const combinedError = error || session.commandError || session.connectionError || readError;
  return <div className="desktop-frame island-frame" style={themeStyle(appearance.current)}>
    <div className="app-shell island-shell">
      <div className="island-main-row">
        <div className="island-drag" role="group" aria-label="拖动状态岛" onMouseDown={event => {
          if (event.button === 0) void getCurrentWindow().startDragging().then(() => invoke("fit_island_position")).catch(e => setError(String(e)));
        }}>
          {active || candidate || monitor?.browse_category ? <WorkBadge category={active?.category ?? candidate?.category ?? monitor?.browse_category ?? "开发"} presentation={presentation.current} showName={false} /> : <span className="work-symbol"><Icon name="read" /></span>}
          <span className="island-info"><strong>{active ? name(active.category) : candidate ? name(candidate.category) : notice?.kind === "ended" ? "工作已结束" : "仅浏览"}</strong>
            <small>{snapshot ? !active && notice?.kind === "ended" ? "结果已保存 · 待填写工作量" : state : "状态不可用"}</small></span>
          {active && <strong className="island-time">{formatDuration(active.duration_seconds)}</strong>}
        </div>
        {!candidate && active && !monitor?.browsing_only && <button type="button" className="island-action" aria-label={active.is_paused ? "继续记录" : "暂停记录"} disabled={busy || !!session.connectionError || active.recovery_pending} onClick={() => { void (active.is_paused ? session.resume(active.id) : session.pause(active.id)); }}><Icon name={active.is_paused ? "play" : "pause"} /></button>}
        {!candidate && monitor?.browsing_only && <button type="button" className="island-action" aria-label={active ? "继续记录" : "开始记录"} disabled={busy || !monitor.browse_ready || !!active?.recovery_pending || !!session.connectionError} onClick={() => { void session.confirmWork(null); }}><Icon name="play" /></button>}
        {(notice || candidate || editing || combinedError) && <button type="button" className="island-action island-expand" aria-label={expanded ? "收起展开区域" : "展开工作提醒"} onClick={() => {
          if (expanded && editing) { void later(); return; }
          setExpanded(value => !value);
        }}><Icon name={expanded ? "left" : "right"} /></button>}
        <button type="button" className="island-open" aria-label="打开WorkMemo" onClick={() => { void invoke("show_main", {settlement:false}).catch(e => setError(String(e))); }}><Icon name="open" /></button>
      </div>
      <IslandExpansion open={expanded} onError={setError} onCollapsed={() => { setEditing(null); setDiscard(false); setDirty(false); }}>
        {dashboard.fallback}
        {combinedError && <p className="inline-error" role="alert">{combinedError}</p>}
        {editing ? <>
          <h2>填写工作量 · {name(editing.category)}</h2>
          {discard && <div className="island-discard" role="alert"><p>放弃本次未保存的填写？原记录仍在待补全列表。</p><button type="button" disabled={busy} onClick={() => { void later(true); }}>放弃填写并收起</button><button type="button" className="secondary" onClick={() => setDiscard(false)}>继续填写</button></div>}
          <DraftContext.Provider value={registerDraft}><SettlementForm compact key={editing.id} record={editing} busy={busy}
            onSave={async input => {
              const saved = await session.settle(input);
              if (saved) {
                revision.current++;
                setNotice(current => current?.record.id === input.id ? null : current);
                setDirty(false); setExpanded(false);
              }
              return saved;
            }} /></DraftContext.Provider>
          <button className="text-button" type="button" disabled={busy} onClick={() => { void later(); }}>稍后填写</button>
          {session.commandError && <button className="text-button" type="button" onClick={() => { void dashboard.open("pending"); }}>打开待补全列表核对</button>}
        </> : notice?.kind === "ended" ? <section aria-label="工作结束提醒">
          <h2>本次工作已结束</h2><p>{name(notice.record.category)} · 有效工时 {formatDuration(notice.record.duration_seconds)}</p>
          <p>结果已保存，工作量可稍后填写。</p>
          <div className="island-buttons"><button type="button" disabled={busy || !!session.connectionError} onClick={() => { setEditing(notice.record); setExpanded(true); }}>填写工作量</button><button className="secondary" type="button" disabled={busy} onClick={() => { void later(); }}>稍后</button></div>
        </section> : notice?.kind === "idle" ? <section aria-label="空闲提醒">
          <h2>空闲提醒</h2><p>连续 {formatDuration(notice.idle_warning_seconds)} 无输入；到达 {formatDuration(notice.idle_end_seconds)} 时结束计时，最后输入后的尾段不计入工时。</p>
          <button type="button" disabled={busy} onClick={() => { void later(); }}>知道了</button>
        </section> : candidate ? <section aria-label="开工确认"><h2>准备开始工作？</h2><p>确认前不计时，工作量可稍后填写。</p><div className="island-buttons"><button disabled={busy || !!session.connectionError} onClick={() => { void session.confirmWork(candidate.id); }}>开始记录</button><button className="secondary" disabled={busy} onClick={() => { void session.browse(); }}>仅浏览</button></div></section> : null}
      </IslandExpansion>
      {combinedError && !expanded && <span className="island-error" role="alert" aria-label={combinedError} title={combinedError}>!</span>}
    </div>
  </div>;
}
~~~~~~

## E:\WorkMemo\src\SettingsExtras.tsx

~~~~~~tsx
import { CategoryNamesEditor } from "./CategoryNamesEditor";
import { StartupSetting } from "./StartupSetting";
import { useCategoryNames } from "./categoryNames";
import { useEffect, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { Surface, useDraft } from "./Drafts";
import { Icon } from "./Icon";
import { CATEGORIES } from "./types";
import {
  DEFAULT_LAYOUT,
  useLayout,
  WORK_ICONS,
  WorkBadge,
  type LayoutSettings,
  type PresentationController,
} from "./desktopPreferences";
const iconLabels: Record<string, string> = {
  checkSquare: "检查",
  safety: "盾牌",
  code: "代码",
  note: "文档",
  search: "搜索",
  chart: "图表",
  list: "清单",
  clock: "时钟",
  star: "星标",
  rocket: "火箭",
  bulb: "灵感",
  tool: "工具",
  read: "阅读",
  check: "完成",
  home: "主页",
  settings: "设置",
};
export function VisualSettings({
  presentation,
}: {
  presentation: PresentationController;
}) {
  const { name } = useCategoryNames();
  const { current, setVisual } = presentation;
  const compact = useLayout().current.density === "compact";
  useDraft(
    "category-visuals",
    presentation.dirty,
    presentation.busy,
    presentation.save,
    presentation.cancel,
  );
  return (
    <Surface
      title="工作名称、图标与颜色"
      actions={
        <>
          <button
            className="secondary"
            disabled={presentation.busy}
            onClick={presentation.cancel}
          >
            取消预览
          </button>
          <button
            disabled={presentation.busy || !presentation.loaded || !isTauri()}
            onClick={() => {
              void presentation.save();
            }}
          >
            保存工作外观
          </button>
        </>
      }
    >
      <p className="hint">
        同一类别在主页、状态岛和数据中心使用相同的图标与颜色。
      </p>
      <CategoryNamesEditor />
      {CATEGORIES.map((category) => {
        const visual = current.categories[category];
        return (
          <fieldset key={category} className="visual-category">
            <legend>
              <WorkBadge category={category} presentation={current} />
            </legend>
            <label className="color-field">
              类别颜色
              <input
                aria-label={`${name(category)}颜色`}
                type="color"
                value={visual.color}
                disabled={presentation.busy}
                onChange={(e) =>
                  setVisual(category, { ...visual, color: e.target.value })
                }
              />
              <span>{visual.color}</span>
            </label>
            <details open={!compact}>
              <summary>选择图标：{iconLabels[visual.icon]}</summary>
              <div className="icon-picker">
                {WORK_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    title={iconLabels[icon]}
                    aria-label={`${name(category)}使用${iconLabels[icon]}图标`}
                    aria-pressed={visual.icon === icon}
                    className="secondary"
                    disabled={presentation.busy}
                    onClick={() => setVisual(category, { ...visual, icon })}
                  >
                    <Icon name={icon} />
                  </button>
                ))}
              </div>
            </details>
          </fieldset>
        );
      })}
      {presentation.error && (
        <p className="error-banner" role="alert">
          {presentation.error}
        </p>
      )}
    </Surface>
  );
}
export function LayoutPanel() {
  const layout = useLayout();
  const [current, setCurrent] = useState(DEFAULT_LAYOUT);
  const [saved, setSaved] = useState(DEFAULT_LAYOUT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(current) !== JSON.stringify(saved);
  useEffect(() => {
    if (layout.loaded && !dirty && !busy) {
      setCurrent(layout.current);
      setSaved(layout.current);
    }
  }, [layout.current, layout.loaded]);
  async function save() {
    if (busy) return false;
    setBusy(true);
    setError("");
    try {
      const result = await invoke<LayoutSettings>("set_layout_options", {
        input: {
          density: current.density,
          sound_enabled: current.sound_enabled,
          sound_theme: current.sound_theme,
          font_size: current.font_size,
          font_weight: current.font_weight,
          line_spacing: current.line_spacing,
          expected_revision: saved.revision,
        },
      });
      setSaved(result);
      setCurrent(result);
      return true;
    } catch (e) {
      setError(String(e));
      return false;
    } finally {
      setBusy(false);
    }
  }
  useDraft("layout", dirty, busy, save, () => {
    setCurrent(saved);
    setError("");
  });
  function field<K extends keyof LayoutSettings>(
    name: K,
    value: LayoutSettings[K],
  ) {
    setCurrent((p) => ({ ...p, [name]: value }));
  }
  return (
    <Surface
      title="布局、字体与音效"
      actions={
        <button
          disabled={busy || !layout.loaded || !isTauri()}
          onClick={() => {
            void save();
          }}
        >
          保存布局
        </button>
      }
    >
      <div className="layout-form">
        <StartupSetting />
        <label className="monitor-toggle"><input type="checkbox" checked={current.sound_enabled} disabled={busy} onChange={e => field("sound_enabled", e.target.checked)}/>关键状态提示音</label>
        <label>提示音套装<select aria-label="提示音套装" value={current.sound_theme??"soft"} disabled={busy} onChange={event=>field("sound_theme",event.target.value as LayoutSettings["sound_theme"])}>
          <option value="soft">柔和轻提示</option><option value="crisp">清脆短提示</option>
        </select></label>
        <div className="sound-preview-buttons" aria-label="分别试听提示音">
          {([["start","开始"],["pause","暂停"],["resume","恢复"],["end","结束"],["warning","空闲提醒"]] as const).map(([cue,label])=><button key={cue} type="button" className="secondary" disabled={!isTauri()||busy} onClick={()=>{void invoke("preview_sound",{theme:current.sound_theme??"soft",cue}).catch(e=>setError(String(e)));}}>试听{label}</button>)}
        </div>
        <p className="hint">试听当前选择，保存布局后应用。试听不受提示音开关限制；日常只在状态变化时响一次。</p>
        <label>
          界面模式
          <select
            disabled={busy}
            value={current.density}
            onChange={(e) =>
              field("density", e.target.value as LayoutSettings["density"])
            }
          >
            <option value="comfortable">舒展 · 完整信息</option>
            <option value="compact">紧凑 · 极简信息</option>
          </select>
        </label>
        <p className="hint">
          紧凑模式让主窗口成为小计时器，二级页面默认折叠辅助内容；错误与恢复提醒始终可见。
        </p>
        <label>
          正文字号：{current.font_size}px
          <input
            type="range"
            min={12}
            max={18}
            step={1}
            value={current.font_size}
            disabled={busy}
            onChange={(e) => field("font_size", Number(e.target.value))}
          />
        </label>
        <label>
          文字粗细
          <select
            disabled={busy}
            value={current.font_weight}
            onChange={(e) => field("font_weight", Number(e.target.value))}
          >
            {[
              [400, "常规"],
              [500, "中等"],
              [600, "半粗"],
              [700, "加粗"],
            ].map(([v, n]) => (
              <option value={v} key={v}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          行距
          <select
            disabled={busy}
            value={current.line_spacing}
            onChange={(e) =>
              field(
                "line_spacing",
                e.target.value as LayoutSettings["line_spacing"],
              )
            }
          >
            <option value="tight">紧密</option>
            <option value="standard">标准</option>
            <option value="loose">宽松</option>
          </select>
        </label>
        <div
          className="font-preview"
          style={{
            fontSize: current.font_size,
            fontWeight: current.font_weight,
            lineHeight: { tight: 1.35, standard: 1.6, loose: 1.85 }[
              current.line_spacing
            ],
          }}
        >
          把注意力留给手上的事。
          <br />
          计时、类别和操作，清楚就好。
        </div>
        <button
          className="secondary"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void invoke("reset_window_layout")
              .then(() => invoke<LayoutSettings>("get_layout_settings"))
              .then((result) => {
                setCurrent(result);
                setSaved(result);
                void layout.reload();
              })
              .catch((e) => setError(String(e)))
              .finally(() => setBusy(false));
          }}
        >
          恢复所有窗口默认布局
        </button>
      </div>
      {(error || layout.error) && (
        <p className="error-banner" role="alert">
          {error || layout.error}
        </p>
      )}
    </Surface>
  );
}
~~~~~~

## E:\WorkMemo\src\SettlementPanel.tsx

~~~~~~tsx
import { useCategoryNames } from "./categoryNames";
import { Surface, useDraft } from "./Drafts";
import { Icon } from "./Icon";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  CATEGORIES,
  formatDuration,
  formatTime,
  type SettleInput,
  type WorkRecord,
} from "./types";
import { validateWorkInput } from "./workInput";

export function SettlementForm({
  record,
  busy,
  onSave,
  externalActions = false,
  compact = false,
}: {
  compact?: boolean;
  externalActions?: boolean;
  record: WorkRecord;
  busy: boolean;
  onSave: (input: SettleInput) => Promise<boolean>;
}) {
  const { name } = useCategoryNames();
  const [category, setCategory] = useState(record.category);
  const [quantity, setQuantity] = useState(
    record.quantity === null ? "" : String(record.quantity),
  );
  const [remark, setRemark] = useState(record.remark);
  const [error, setError] = useState("");
  async function saveDraft() {
    if (busy) return false;
    const result = validateWorkInput(category, quantity, remark, true);
    if (!result.ok) {
      setError(Object.values(result.errors).join(" "));
      return false;
    }
    if (result.input.quantity === null) return false;
    setError("");
    const saved = await onSave({
      ...result.input,
      quantity: result.input.quantity,
      id: record.id,
      expected_revision: record.revision,
    });
    if (!saved)
      setError("保存未完成，请查看上方错误信息后重试。输入内容仍保留。");
    return saved;
  }
  const dirty =
    category !== record.category ||
    quantity !== (record.quantity === null ? "" : String(record.quantity)) ||
    remark !== record.remark;
  useDraft(`settlement-${record.id}`, dirty, busy, saveDraft, () => {
    setCategory(record.category);
    setQuantity(record.quantity === null ? "" : String(record.quantity));
    setRemark(record.remark);
    setError("");
  });
  return (
    <form
      id="settlement-form"
      className="settlement-form"
      onSubmit={(event) => {
        event.preventDefault();
        void saveDraft();
      }}
      noValidate
    >
      {compact ? <p className="hint">有效工时 {formatDuration(record.duration_seconds)} · 开始 {formatTime(record.start_time)}</p> : <p className="hint">
        开始 {formatTime(record.start_time)}
        <br />
        有效结束 {record.end_time === null ? "—" : formatTime(record.end_time)}
        <br />
        系统确认{" "}
        {record.confirmed_end_time === null
          ? "—"
          : formatTime(record.confirmed_end_time)}
        <br />
        有效工时 {formatDuration(record.duration_seconds)}
      </p>}
      <div className="field-row grid grid-cols-2 gap-3">
        <label>
          工作类别
          <select
            aria-label="工作类别"
            value={category}
            disabled={busy}
            onChange={(event) => setCategory(event.target.value)}
          >
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>{name(value)}</option>
            ))}
          </select>
        </label>
        <label>
          工作量（必填）
          <input
            type="number"
            min="0"
            max="1000000000"
            step="any"
            inputMode="decimal"
            value={quantity}
            disabled={busy}
            placeholder="0 表示无产出"
            onChange={(event) => setQuantity(event.target.value)}
          />
        </label>
      </div>
      <label>
        备注（选填）
        <textarea
          rows={2}
          value={remark}
          disabled={busy}
          maxLength={4000}
          onChange={(event) => setRemark(event.target.value)}
        />
      </label>
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      {!externalActions && (
        <button type="submit" disabled={busy}>
          <span>{busy ? "正在保存…" : "填写工作量并保存"}</span>
          <Icon name="check" />
        </button>
      )}
    </form>
  );
}

export function SettlementPanel({
  open,
  onClose,
  refreshKey,
  busy,
  onSave,
  beforeChange = (action) => action(),
}: {
  open: boolean;
  onClose: () => void;
  refreshKey: string;
  busy: boolean;
  onSave: (input: SettleInput) => Promise<boolean>;
  beforeChange?: (action: () => void) => void;
}) {
  const { name } = useCategoryNames();
  const [records, setRecords] = useState<WorkRecord[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    let stale = false;
    void invoke<WorkRecord[]>("get_pending_records")
      .then((r) => {
        if (!stale) {
          setRecords(r);
          setSelected((id) =>
            r.some((x) => x.id === id) ? id : (r[0]?.id ?? null),
          );
        }
      })
      .catch((e) => {
        if (!stale) setError(String(e));
      });
    return () => {
      stale = true;
    };
  }, [open, refreshKey]);
  const record = records.find((r) => r.id === selected);
  return (
    <Surface
      title="待补全工作量"
      onClose={onClose}
      actions={
        <>
          <button type="button" className="secondary" onClick={onClose}>
            稍后填写
          </button>
          <button
            form="settlement-form"
            type="submit"
            disabled={busy || !record}
          >
            填写工作量并保存
          </button>
        </>
      }
    >
      <p className="hint">计时结果已保存，稍后填写不会丢失记录。</p>
      {error && <p className="error-banner">{error}</p>}
      {records.length > 0 ? (
        <label>
          选择记录
          <select
            value={selected ?? ""}
            disabled={busy}
            onChange={(e) => {
              const id = Number(e.target.value);
              beforeChange(() => setSelected(id));
            }}
          >
            {records.map((r) => (
              <option value={r.id} key={r.id}>
                {name(r.category)} · {formatTime(r.start_time)} ·{" "}
                {formatDuration(r.duration_seconds)}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p>没有待补全记录。</p>
      )}
      {record && (
        <SettlementForm
          key={`${record.id}:${record.revision}:${refreshKey}`}
          record={record}
          busy={busy}
          externalActions
          onSave={async (input) => {
            const ok = await onSave(input);
            if (ok) {
              setRecords((rs) => rs.filter((r) => r.id !== input.id));
              setSelected(records.find((r) => r.id !== input.id)?.id ?? null);
            }
            return ok;
          }}
        />
      )}
    </Surface>
  );
}
~~~~~~

## E:\WorkMemo\src\StartupSetting.tsx

~~~~~~tsx
import { useEffect, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";

type Status = { enabled: boolean; available: boolean; error: string | null };
export function StartupSetting() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isTauri()) return;
    let stopped = false;
    void invoke<Status>("get_startup_status").then(value => { if (!stopped) setStatus(value); })
      .catch(e => { if (!stopped) setError(String(e)); });
    return () => { stopped = true; };
  }, []);
  return <div className="startup-setting">
    <label className="monitor-toggle"><input type="checkbox" checked={status?.enabled ?? false}
      disabled={busy || !status?.available} onChange={event => {
        const enabled = event.target.checked;
        setBusy(true); setError("");
        void invoke<Status>("set_startup_enabled", { enabled }).then(setStatus)
          .catch(async e => {
            setError(String(e));
            try { setStatus(await invoke<Status>("get_startup_status")); }
            catch (readError) { setError(`${String(e)}；读取当前启动状态失败：${String(readError)}`); }
          }).finally(() => setBusy(false));
      }} />开机启动</label>
    <p className="hint">立即生效。登录 Windows 后在托盘后台运行，可从托盘打开主窗口。{status && !status.available ? "开发与预览程序不注册启动项。" : ""}</p>
    {(error || status?.error) && <p className="inline-error" role="alert">{error || status?.error}</p>}
  </div>;
}
~~~~~~

## E:\WorkMemo\src\TodayWorkloadStrip.tsx

~~~~~~tsx
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useCategoryNames } from "./categoryNames";
import { Icon } from "./Icon";
import { workloadLabel, type TodayWorkload } from "./workload";

export function TodayWorkloadStrip({ items, error, onOpen }: {
  items: TodayWorkload[] | null; error: string; onOpen: () => void;
}) {
  const { name } = useCategoryNames();
  const viewport = useRef<HTMLSpanElement>(null);
  const content = useRef<HTMLSpanElement>(null);
  const [distance, setDistance] = useState(0);
  const text = error ? "工作量暂不可用" : items === null ? "正在读取今日工作量…" : items.length ? items.map(item => {
    const label = workloadLabel(item);
    return `${name(item.category)} ${label.main}${label.pending ? `（${label.pending}）` : ""}`;
  }).join("  ·  ") : "今天还没有工作记录";
  useLayoutEffect(() => {
    const measure = () => {
      if (viewport.current && content.current) {
        setDistance(content.current.scrollWidth > viewport.current.clientWidth + 1
          ? content.current.scrollWidth + 32 : 0);
      }
    };
    const observer = new ResizeObserver(measure);
    if (viewport.current) observer.observe(viewport.current);
    if (content.current) observer.observe(content.current);
    measure();
    return () => observer.disconnect();
  }, [text]);
  return <button type="button" className="today-strip" aria-label={`打开当天工作量详情：${text}`} title={error || "点击查看当天全部工作详情"} onClick={onOpen}
    onKeyDown={event => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        viewport.current?.scrollBy({ left: event.key === "ArrowLeft" ? -100 : 100 });
      }
    }}>
    <span className="today-strip-label"><Icon name="chart" />今日工作量</span>
    <span className="today-strip-viewport" ref={viewport}>
      <span className={`today-strip-track${distance ? " is-scrolling" : ""}`} style={{ "--scroll-distance": `${distance}px`, "--scroll-duration": `${Math.max(12, distance / 28)}s` } as CSSProperties}>
        <span ref={content}>{text}</span>
        {distance > 0 && <span aria-hidden="true">{text}</span>}
      </span>
    </span>
    <Icon name="right" />
  </button>;
}
~~~~~~

## E:\WorkMemo\src\WorkForm.tsx

~~~~~~tsx
import { useCategoryNames } from "./categoryNames";
import { useId, useRef, useState, type FormEvent } from "react";
import { CATEGORIES, type StartInput } from "./types";
import { validateWorkInput, type InputErrors } from "./workInput";
import { Icon } from "./Icon";

interface Props {
  disabled: boolean;
  minimal?: boolean;
  switching?: boolean;
  starting?: boolean;
  onCancel?: () => void;
  onStart: (input: StartInput) => Promise<boolean>;
}

export function WorkForm({
  minimal: _minimal = false,
  disabled,
  switching = false,
  starting = false,
  onStart,
  onCancel,
}: Props) {
  const { name } = useCategoryNames();
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [remark, setRemark] = useState("");
  const [errors, setErrors] = useState<InputErrors>({});
  const id = useId();
  const categoryRef = useRef<HTMLSelectElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const remarkRef = useRef<HTMLTextAreaElement>(null);

  function clearError(field: keyof StartInput) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (disabled) return;
    const result = validateWorkInput(category, quantity, remark);
    if (!result.ok) {
      setErrors(result.errors);
      (result.errors.category
        ? categoryRef
        : result.errors.quantity
          ? quantityRef
          : remarkRef
      ).current?.focus();
      return;
    }
    setErrors({});
    await onStart(result.input);
  }

  return (
    <form
      className="work-form"
      aria-busy={starting}
      onSubmit={(event) => {
        void submit(event);
      }}
      noValidate
    >
      <div className="category-field">
        <span className="category-field-symbol" aria-hidden="true"><Icon name="list" /></span>
        <label>
          <span className="sr-only">工作类别</span>
          <select
            aria-label="工作类别"
            ref={categoryRef}
            value={category}
            disabled={disabled}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? `${id}-category` : undefined}
            onChange={(event) => {
              setCategory(event.target.value);
              clearError("category");
            }}
          >
            <option value="">选择工作类别</option>
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {name(value)}
              </option>
            ))}
          </select>
          {errors.category && (
            <span id={`${id}-category`} className="field-error" role="alert">
              {errors.category}
            </span>
          )}
        </label>
      </div>
      <div className="work-input-row">
        <label>
          工作量（可稍后填写）
          <input
            ref={quantityRef}
            type="number"
            inputMode="decimal"
            min="0"
            max="1000000000"
            step="any"
            placeholder="结束后填写；0 表示无产出"
            value={quantity}
            disabled={disabled}
            aria-invalid={Boolean(errors.quantity)}
            aria-describedby={errors.quantity ? `${id}-quantity` : undefined}
            onChange={(event) => {
              setQuantity(event.target.value);
              clearError("quantity");
            }}
          />
          {errors.quantity && (
            <span id={`${id}-quantity`} className="field-error" role="alert">
              {errors.quantity}
            </span>
          )}
        </label>
        <label>
          <span>备注（选填）</span>
          <textarea
            ref={remarkRef}
            rows={1}
            maxLength={4000}
            placeholder="添加备注（可选）"
            value={remark}
            disabled={disabled}
            aria-invalid={Boolean(errors.remark)}
            aria-describedby={`${id}-remark-count${errors.remark ? ` ${id}-remark` : ""}`}
            onChange={(event) => {
              setRemark(event.target.value);
              clearError("remark");
            }}
          />
          <span id={`${id}-remark-count`} className="field-count">
            {Array.from(remark.trim()).length} / 2000
          </span>
          {errors.remark && (
            <span id={`${id}-remark`} className="field-error" role="alert">
              {errors.remark}
            </span>
          )}
        </label>
      </div>
      {switching && <p className="switch-hint">开始后会保存上一项为待补全记录。</p>}
      <button type="submit" className="start-work" disabled={disabled}>
        <Icon name="play" />
        <span>{starting ? "正在开始…" : "开始工作"}</span>
      </button>
      {onCancel && <button type="button" className="cancel-switch" disabled={starting} onClick={onCancel}><Icon name="left" />取消切换</button>}
    </form>
  );
}
~~~~~~

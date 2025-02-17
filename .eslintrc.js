module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended-type-checked",
        "plugin:@typescript-eslint/stylistic",
        "plugin:react/recommended",
        "plugin:i18next/recommended",
        "prettier"
    ],
    overrides: [
        {
            "files": ["src/**/*.{js,jsx,ts,tsx}"],
            "excludedFiles": ["build/**", "node_modules/**"],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        jsx: true,
        useJSXTextNode: true,
        projectService: true,
        tsconfigRootDir: __dirname,
        project: true
    },
    plugins: [
        "react",
        "i18next",
        "i18n-validator",
        "@typescript-eslint"
    ],
    rules: {
        "indent": ["error", 4, { "SwitchCase": 1 }],
        "react/react-in-jsx-scope": "off",
        "i18n-validator/json-key-exists": [2, {
            "locales": ["en", "fr"],
            "jsonBaseURIs": [
                { "baseURI": "./src/locales/" }
            ]
        }]
    },
    settings: {
        "react": {
            "version": "detect"
        }
    },
    root: true,
}
